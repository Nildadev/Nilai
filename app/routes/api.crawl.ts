import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  const { url } = await request.json<{ url: string }>();

  if (!url) {
    return json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // We use Jina Reader API which is excellent for converting web pages to markdown
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'text/event-stream', // Some sites might need specific headers
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    const content = await response.text();

    return json({
      content,
      name: new URL(url).hostname,
    });
  } catch (error: any) {
    console.error('Crawl error:', error);
    return json({ error: error.message || 'Failed to crawl URL' }, { status: 500 });
  }
}
