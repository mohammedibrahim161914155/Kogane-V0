import type { ToolDefinition } from '@/types'
import { calculate } from '@/core/tools/calculator'
import { webSearch } from '@/core/tools/web-search'
import { fetchUrl } from '@/core/tools/url-fetcher'
import { weatherTool } from '@/core/tools/weather'
import { calendarTool } from '@/core/tools/calendar'
import { codeExecutorTool } from '@/core/tools/code-executor'
import { imageAnalyzerTool } from '@/core/tools/image-analyzer'
import { deepResearchTool } from '@/core/tools/deep-research'

export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  calculator: {
    name: 'calculator',
    description: 'Evaluate mathematical expressions. Returns the numeric result.',
    parameters: { expression: { type: 'string', description: 'Math expression to evaluate' } },
    execute: async (args) => calculate(args.expression as string),
  },
  web_search: {
    name: 'web_search',
    description: 'Search the web for current information.',
    parameters: { query: { type: 'string', description: 'Search query' } },
    execute: async (args) => webSearch(args.query as string),
  },
  url_fetcher: {
    name: 'url_fetcher',
    description: 'Fetch and extract text content from a URL.',
    parameters: { url: { type: 'string', description: 'URL to fetch' } },
    execute: async (args) => fetchUrl(args.url as string),
  },
  get_date_time: {
    name: 'get_date_time',
    description: 'Get the current date and time.',
    parameters: {},
    execute: async () => ({ datetime: new Date().toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  },
  weather: weatherTool,
  calendar: calendarTool,
  code_executor: codeExecutorTool,
  image_analyzer: imageAnalyzerTool,
  deep_research: deepResearchTool,
}
