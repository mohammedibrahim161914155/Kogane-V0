import { streamChat } from '@/core/ai/client'
import { loadApiKey } from '@/core/crypto/vault'
import { webSearch } from './web-search'
import { fetchUrl } from './url-fetcher'
import type { ToolDefinition } from '@/types'

interface ResearchResult {
  summary: string
  findings: string[]
  sources: string[]
}

export async function deepResearch(
  query: string,
  apiKey?: string,
  onProgress?: (step: string, pct: number) => void
): Promise<string> {
  const key = apiKey || (await loadApiKey('openrouter'))
  if (!key) {
    return 'Error: No API key configured'
  }

  onProgress?.('Decomposing query', 10)

  const decomposeMessages = [
    {
      role: 'system' as const,
      content: 'You are a research assistant. Break down the user query into 3-5 specific sub-questions that would help answer the main question. Return ONLY a JSON array of strings.',
    },
    { role: 'user' as const, content: query },
  ]

  let subQuestions: string[] = []

  await new Promise<void>((resolve) => {
    let content = ''
    streamChat(
      {
        model: 'anthropic/claude-3-5-haiku',
        messages: decomposeMessages,
        onChunk: (chunk) => {
          content += chunk
        },
        onDone: () => {
          try {
            const parsed = JSON.parse(content)
            subQuestions = Array.isArray(parsed) ? parsed : [query]
          } catch {
            subQuestions = [query]
          }
          resolve()
        },
        onError: () => {
          subQuestions = [query]
          resolve()
        },
      },
      key
    )
  })

  if (!subQuestions.length) {
    subQuestions = [query]
  }

  const findings: string[] = []
  const sources: string[] = []
  const totalSteps = subQuestions.length + 1
  const stepPercent = 70 / totalSteps

  onProgress?.('Researching sub-questions', 20)

  for (let i = 0; i < subQuestions.length; i++) {
    const subQ = subQuestions[i]
    onProgress?.(`Researching: ${subQ}`, 20 + i * stepPercent)

    try {
      const searchResults = await webSearch(subQ)
      if (searchResults.results && searchResults.results.length > 0) {
        const topUrl = searchResults.results[0].url
        sources.push(topUrl)

        const pageContent = await fetchUrl(topUrl)
        findings.push(`## ${subQ}\n\n${pageContent.slice(0, 2000)}`)
      }
    } catch (error) {
      console.error(`Error researching ${subQ}:`, error)
    }
  }

  onProgress?.('Synthesizing results', 80)

  const synthesisMessages = [
    {
      role: 'system' as const,
      content: 'You are a research analyst. Synthesize the following research findings into a well-structured markdown report with sections: Summary, Findings, Sources.',
    },
    {
      role: 'user' as const,
      content: `Main query: ${query}\n\nResearch findings:\n\n${findings.join('\n\n---\n\n')}`,
    },
  ]

  let report = ''

  await new Promise<void>((resolve) => {
    streamChat(
      {
        model: 'anthropic/claude-3-5-haiku',
        messages: synthesisMessages,
        onChunk: (chunk) => {
          report += chunk
        },
        onDone: () => {
          onProgress?.('Complete', 100)
          resolve()
        },
        onError: () => {
          report = `## Research: ${query}\n\n${findings.join('\n\n')}\n\n## Sources\n\n${sources.map(s => `- ${s}`).join('\n')}`
          onProgress?.('Complete', 100)
          resolve()
        },
      },
      key
    )
  })

  return report || `## Research: ${query}\n\nNo results found.`
}

export const deepResearchTool: ToolDefinition = {
  name: 'deep_research',
  description: 'Perform deep research on a topic by searching the web, fetching URLs, and synthesizing findings into a comprehensive report.',
  parameters: {
    query: { type: 'string', description: 'Research topic or question' },
  },
  execute: async (args) => {
    return deepResearch(args.query as string)
  },
}