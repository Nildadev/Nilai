import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { createDataStream, generateId } from 'ai';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS, type FileMap } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/common/prompts/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';
import type { IProviderSetting } from '~/types/model';
import { createScopedLogger } from '~/utils/logger';
import { getFilePaths, selectContext } from '~/lib/.server/llm/select-context';
import type { ContextAnnotation, ProgressAnnotation } from '~/types/context';
import { WORK_DIR } from '~/utils/constants';
import { createSummary } from '~/lib/.server/llm/create-summary';
import { extractPropertiesFromMessage } from '~/lib/.server/llm/utils';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

const logger = createScopedLogger('api.chat');

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  const items = cookieHeader.split(';').map((cookie) => cookie.trim());
  items.forEach((item) => {
    const [name, ...rest] = item.split('=');
    if (name && rest) {
      cookies[decodeURIComponent(name.trim())] = decodeURIComponent(rest.join('=').trim());
    }
  });
  return cookies;
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  const { messages, files, promptId, contextOptimization, supabase, webSearch, multiAgent } = await request.json<{
    messages: Messages;
    files: any;
    promptId?: string;
    contextOptimization: boolean;
    webSearch?: boolean;
    multiAgent?: boolean;
    supabase?: any;
  }>();

  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = JSON.parse(parseCookies(cookieHeader || '').apiKeys || '{}');
  const providerSettings: Record<string, IProviderSetting> = JSON.parse(
    parseCookies(cookieHeader || '').providers || '{}',
  );

  const stream = new SwitchableStream();
  const cumulativeUsage = { completionTokens: 0, promptTokens: 0, totalTokens: 0 };
  const encoder = new TextEncoder();
  let progressCounter = 1;
  let lastChunk: string | undefined = undefined;

  try {
    const dataStream = createDataStream({
      async execute(dataStream) {
        // 1. Handle Automatic Web Search
        let searchContext = "";
        if (webSearch) {
          dataStream.writeData({
            type: 'progress', label: 'web-search', status: 'in-progress', order: progressCounter++, message: 'Searching the web...',
          } satisfies ProgressAnnotation);

          const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
          if (lastUserMessage) {
            try {
              const query = typeof lastUserMessage.content === 'string' ? lastUserMessage.content : "";
              const searchResponse = await fetch(`${new URL(request.url).origin}/api/search`, {
                method: 'POST',
                body: JSON.stringify({ query }),
              });
              const searchData = await searchResponse.json() as any;
              if (searchData.results && searchData.results.length > 0) {
                searchContext = "\n\n[SYSTEM NOTE: The following are REAL-TIME search results. Use them for accuracy.]\n" + 
                  searchData.results.map((r: any) => `Title: ${r.title}\nSource: ${r.url}\nContent: ${r.snippet}`).join('\n\n');
                dataStream.writeData({
                  type: 'progress', label: 'web-search', status: 'complete', order: progressCounter++, message: `Found ${searchData.results.length} relevant sources`,
                } satisfies ProgressAnnotation);
              }
            } catch (e) {
              console.error("Auto-search failed:", e);
            }
          }
        }

        if (searchContext) {
          const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
          if (lastUserMessage) {
            const originalContent = typeof lastUserMessage.content === 'string' ? lastUserMessage.content : "";
            lastUserMessage.content = `${searchContext}\n\n---\n\n[USER QUESTION]\n${originalContent}`;
          }
        }

        // 2. Optimization & Context Selection
        const filePaths = getFilePaths(files || {});
        let filteredFiles: FileMap | undefined = undefined;
        let summary: string | undefined = undefined;
        let messageSliceId = messages.length > 3 ? messages.length - 3 : 0;

        if (filePaths.length > 0 && contextOptimization) {
          summary = await createSummary({
            messages, env: context.cloudflare?.env, apiKeys, providerSettings, promptId, contextOptimization,
            onFinish(resp) {
              if (resp.usage) {
                cumulativeUsage.completionTokens += resp.usage.completionTokens || 0;
                cumulativeUsage.promptTokens += resp.usage.promptTokens || 0;
                cumulativeUsage.totalTokens += resp.usage.totalTokens || 0;
              }
            }
          });
          filteredFiles = await selectContext({
            messages, env: context.cloudflare?.env, apiKeys, files, providerSettings, promptId, contextOptimization, summary,
            onFinish(resp) {
              if (resp.usage) {
                cumulativeUsage.completionTokens += resp.usage.completionTokens || 0;
                cumulativeUsage.promptTokens += resp.usage.promptTokens || 0;
                cumulativeUsage.totalTokens += resp.usage.totalTokens || 0;
              }
            }
          });
        }

        // 3. Streaming Response
        const options: StreamingOptions = {
          supabaseConnection: supabase,
          toolChoice: 'none',
          onFinish: async ({ text: content, finishReason, usage }) => {
            if (usage) {
              cumulativeUsage.completionTokens += usage.completionTokens || 0;
              cumulativeUsage.promptTokens += usage.promptTokens || 0;
              cumulativeUsage.totalTokens += usage.totalTokens || 0;
            }

            // 4. Handle Multi-Agent Review
            if (multiAgent && finishReason === 'stop') {
              dataStream.writeData({
                type: 'progress', label: 'review', status: 'in-progress', order: progressCounter++, message: 'AI Reviewer is analyzing...',
              } satisfies ProgressAnnotation);

              try {
                const { streamText: internalStreamText } = await import('~/lib/.server/llm/stream-text');
                const reviewMessages = [
                  ...messages,
                  { role: 'assistant', content },
                  { role: 'user', content: "As a Senior Code Reviewer, evaluate the code/answer above for Bugs, Security, and Performance. Provide a very concise summary. If perfect, say 'Code looks solid!'" }
                ];
                const reviewResult = await internalStreamText({
                  messages: reviewMessages as any, env: context.cloudflare?.env, apiKeys, files, providerSettings, promptId, contextOptimization: false,
                });

                dataStream.writeChunk(`\n\n<div class="__boltThought__">AI Review:\n`);
                for await (const textPart of reviewResult.textStream) {
                  dataStream.writeChunk(textPart);
                }
                dataStream.writeChunk(`</div>\n`);

                dataStream.writeData({
                  type: 'progress', label: 'review', status: 'complete', order: progressCounter++, message: 'Review completed',
                } satisfies ProgressAnnotation);
              } catch (e) {
                console.error("Review failed:", e);
              }
            }

            if (finishReason !== 'length') {
              dataStream.writeMessageAnnotation({
                type: 'usage',
                value: cumulativeUsage,
              });
              dataStream.writeData({
                type: 'progress', label: 'response', status: 'complete', order: progressCounter++, message: 'Response Generated',
              } satisfies ProgressAnnotation);
              return;
            }
          },
        };

        const result = await streamText({
          messages, env: context.cloudflare?.env, options, apiKeys, files, providerSettings, promptId, contextOptimization, contextFiles: filteredFiles, summary, messageSliceId,
        });

        result.mergeIntoDataStream(dataStream);
      },
      onError: (error: any) => `Custom error: ${error.message}`,
    }).pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          if (!lastChunk) lastChunk = ' ';
          if (typeof chunk === 'string') {
            if (chunk.startsWith('g') && !lastChunk.startsWith('g')) controller.enqueue(encoder.encode(`0: "<div class=\\"__boltThought__\\">"\n`));
            if (lastChunk.startsWith('g') && !chunk.startsWith('g')) controller.enqueue(encoder.encode(`0: "</div>\\n"\n`));
          }
          lastChunk = chunk;
          let transformedChunk = chunk;
          if (typeof chunk === 'string' && chunk.startsWith('g')) {
            let content = chunk.split(':').slice(1).join(':');
            if (content.endsWith('\n')) content = content.slice(0, content.length - 1);
            transformedChunk = `0:${content}\n`;
          }
          const str = typeof transformedChunk === 'string' ? transformedChunk : JSON.stringify(transformedChunk);
          controller.enqueue(encoder.encode(str));
        },
      }),
    );

    return new Response(dataStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    logger.error(error);
    return new Response(null, { status: 500 });
  }
}
