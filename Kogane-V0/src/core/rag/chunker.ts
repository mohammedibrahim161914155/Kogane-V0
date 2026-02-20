import { estimateTokens } from '@/lib/tokens'

export function chunkText(text: string, chunkSize = 256, overlap = 64): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let start = 0

  while (start < words.length) {
    let end = start
    let tokens = 0

    while (end < words.length && tokens < chunkSize) {
      tokens += estimateTokens(words[end]! + ' ')
      end++
    }

    if (end > start) {
      chunks.push(words.slice(start, end).join(' '))
    }

    const overlapWords = Math.floor(overlap / 4)
    start = end - overlapWords
    if (start <= 0 || start >= end) start = end
  }

  return chunks.filter((c) => c.trim().length > 20)
}
