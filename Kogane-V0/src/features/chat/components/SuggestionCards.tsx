import * as React from 'react'
import { Code2, BarChart2, Search, PenTool } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Suggestion {
  icon: typeof Code2
  title: string
  prompt: string
}

const suggestions: Suggestion[] = [
  { icon: Code2, title: 'Write Code', prompt: 'Write a React hook that manages local storage state with TypeScript' },
  { icon: BarChart2, title: 'Analyze Data', prompt: 'Analyze this CSV data and create a summary of key insights' },
  { icon: Search, title: 'Research', prompt: 'Research the latest developments in artificial intelligence and machine learning' },
  { icon: PenTool, title: 'Creative Writing', prompt: 'Write a short story about a time traveler who accidentally changes the past' },
]

interface SuggestionCardsProps {
  onSelectPrompt: (prompt: string) => void
}

export function SuggestionCards({ onSelectPrompt }: SuggestionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon
        return (
          <Card
            key={suggestion.title}
            className={cn(
              'p-4 cursor-pointer transition-all hover:bg-accent hover:border-primary/50 group'
            )}
            onClick={() => onSelectPrompt(suggestion.prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {suggestion.prompt}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}