export function calculate(expression: string): number | string {
  const sanitized = expression.replace(/[^0-9+\-*/().% ]/g, '')
  try {
    const result = Function('"use strict"; return (' + sanitized + ')')() as number
    if (!isFinite(result)) return 'Error: result is not finite'
    return Math.round(result * 1e10) / 1e10
  } catch {
    return 'Error: invalid expression'
  }
}
