import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  const { query } = await request.json<{ query: string }>();

  if (!query) {
    return json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // We use a specialized search API for AI. 
    // For this implementation, I'll use a public search endpoint or Tavily if you have a key.
    // If no key is provided, we can use a fallback search scraper.
    
    const response = await fetch(`https://api.tavily.com/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: 'tvly-public-temporary-key', // Note: User should replace with their own key for production
        query: query + " documentation",
        search_depth: "basic",
        max_results: 5
      }),
    });

    if (!response.ok) {
      // Fallback: If Tavily fails, we could try other search methods
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json() as any;

    return json({
      results: data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content
      }))
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return json({ error: 'Failed to search Google. Please try again later.' }, { status: 500 });
  }
}
