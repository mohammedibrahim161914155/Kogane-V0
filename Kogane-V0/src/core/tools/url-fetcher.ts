export async function fetchUrl(url: string): Promise<{ title: string; content: string }> {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const data = (await res.json()) as { contents: string }
    const parser = new DOMParser()
    const doc = parser.parseFromString(data.contents, 'text/html')
    const title = doc.title || url
    const scripts = doc.querySelectorAll('script, style, nav, footer, header')
    scripts.forEach((el) => el.remove())
    const content = doc.body?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    return { title, content: content.slice(0, 5000) }
  } catch (err) {
    return { title: 'Error', content: String(err) }
  }
}
