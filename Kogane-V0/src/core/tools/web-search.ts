export interface SearchResult {
  title: string
  url: string
  snippet: string
}

export async function webSearch(query: string, apiKey?: string): Promise<SearchResult[]> {
  if (!apiKey) {
    return [{ title: 'Web Search Unavailable', url: '', snippet: 'No search API key configured. Add a Brave or Serper API key in Settings > API Keys.' }]
  }

  try {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': apiKey },
    })
    if (!res.ok) throw new Error(`Search failed: ${res.status}`)
    const data = (await res.json()) as { web?: { results?: Array<{ title: string; url: string; description: string }> } }
    return (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    }))
  } catch (err) {
    return [{ title: 'Search Error', url: '', snippet: String(err) }]
  }
}
