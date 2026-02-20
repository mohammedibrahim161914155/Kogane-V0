export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function estimateMessageTokens(messages: Array<{ content: string | unknown }>): number {
  return messages.reduce((acc, msg) => {
    const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    return acc + estimateTokens(text) + 4
  }, 0)
}

export function fitsInBudget(text: string, budget: number): boolean {
  return estimateTokens(text) <= budget
}
