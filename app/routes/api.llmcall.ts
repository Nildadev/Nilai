import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { generateText } from 'ai';
import { PROVIDER_LIST } from '~/utils/constants';
import { LLMManager } from '~/lib/modules/llm/manager';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { getApiKeysFromCookie, getProviderSettingsFromCookie } from '~/lib/api/cookies';
import { createScopedLogger } from '~/utils/logger';

export async function action(args: ActionFunctionArgs) {
  return llmCallAction(args);
}

async function getModelList(options: {
  apiKeys?: Record<string, string>;
  providerSettings?: Record<string, any>;
  serverEnv?: Record<string, string>;
}) {
  const llmManager = LLMManager.getInstance(options.serverEnv);
  return llmManager.updateModelList(options);
}

const logger = createScopedLogger('api.llmcall');

async function llmCallAction({ context, request }: ActionFunctionArgs) {
  try {
    // Dynamic imports for server-only modules
    const { streamText } = await import('~/lib/.server/llm/stream-text');
    const { MAX_TOKENS } = await import('~/lib/.server/llm/constants');

    const { system, message, model, provider, streamOutput } = await request.json<{
      system: string;
      message: string;
      model: string;
      provider: any;
      streamOutput?: boolean;
    }>();

    const { name: providerName } = provider || {};

    if (!model || typeof model !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing model' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!providerName || typeof providerName !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing provider' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const cookieHeader = request.headers.get('Cookie');
    const apiKeys = getApiKeysFromCookie(cookieHeader);
    const providerSettings = getProviderSettingsFromCookie(cookieHeader);
    const serverEnv = (context.cloudflare?.env as Record<string, string>) || import.meta.env;

    if (streamOutput) {
      try {
        const result = await streamText({
          options: { system },
          messages: [{ role: 'user', content: `${message}` }],
          env: serverEnv,
          apiKeys,
          providerSettings,
        });

        return new Response(result.textStream, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      } catch (error: any) {
        console.log('Stream Error:', error);
        if (error.message?.includes('API key')) {
          return new Response(JSON.stringify({ error: 'Invalid or missing API key' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    } else {
      try {
        console.log(`[api.llmcall] Fetching model list for provider: ${providerName}`);
        const models = await getModelList({ apiKeys, providerSettings, serverEnv });
        
        if (!models || models.length === 0) {
           console.error('[api.llmcall] No models found from getModelList');
           throw new Error('No models available');
        }

        const modelDetails = models.find((m: ModelInfo) => m.name === model);

        if (!modelDetails) {
          console.error(`[api.llmcall] Model not found: ${model}. Available models: ${models.map(m => m.name).join(', ')}`);
          throw new Error(`Model not found: ${model}`);
        }

        const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;
        const llmManager = LLMManager.getInstance(serverEnv);
        const providerInfo = llmManager.getProvider(provider.name);

        if (!providerInfo) {
          console.error(`[api.llmcall] Provider not found in LLMManager: ${provider.name}`);
          return new Response(JSON.stringify({ error: `Provider ${provider.name} not found` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Pre-validate API key
        const { apiKey, baseUrl } = providerInfo.getProviderBaseUrlAndKey({
          apiKeys,
          providerSettings: providerSettings?.[provider.name],
          serverEnv,
          defaultBaseUrlKey: (providerInfo as any).config?.baseUrlKey || '',
          defaultApiTokenKey: (providerInfo as any).config?.apiTokenKey || '',
        });

        if (!apiKey && provider.name !== 'Ollama') {
           console.error(`[api.llmcall] API key missing for ${provider.name}`);
           return new Response(JSON.stringify({ 
             error: `API key missing for ${provider.name}`,
             details: 'Please set the API key in Settings or environment variables.' 
           }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        logger.info(`Generating response Provider: ${provider.name}, Model: ${modelDetails.name}, BaseURL: ${baseUrl || 'default'}`);
        
        const modelInstance = providerInfo.getModelInstance({
          model: modelDetails.name,
          serverEnv: serverEnv as any,
          apiKeys,
          providerSettings,
        });

        if (!modelInstance) {
             console.error(`[api.llmcall] Failed to get model instance for ${modelDetails.name}`);
             throw new Error('Failed to instantiate model');
        }

        const result = await generateText({
          system,
          messages: [{ role: 'user', content: `${message}` }],
          model: modelInstance,
          maxTokens: dynamicMaxTokens,
          toolChoice: 'none',
        });

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        console.error('[api.llmcall] Generate Error Details:', error);
        if (error.message?.includes('API key')) {
          return new Response(JSON.stringify({ error: 'Invalid or missing API key' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message, stack: error.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Bad Request', details: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
