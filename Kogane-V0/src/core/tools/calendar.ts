import { format, addDays, addHours, addWeeks, addMonths, differenceInDays } from 'date-fns'
import type { ToolDefinition } from '@/types'

export function getCurrentDateTime() {
  const now = new Date()
  return {
    date: format(now, 'yyyy-MM-dd'),
    time: format(now, 'HH:mm:ss'),
    dayOfWeek: format(now, 'EEEE'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    iso: now.toISOString(),
  }
}

export function getDaysUntil(targetDate: string): number {
  const target = new Date(targetDate)
  const now = new Date()
  return differenceInDays(target, now)
}

export function addTime(baseDate: string, amount: number, unit: 'days' | 'hours' | 'minutes' | 'weeks'): string {
  const date = new Date(baseDate)
  let result: Date

  switch (unit) {
    case 'days':
      result = addDays(date, amount)
      break
    case 'hours':
      result = addHours(date, amount)
      break
    case 'weeks':
      result = addWeeks(date, amount)
      break
    case 'minutes':
      result = new Date(date.getTime() + amount * 60 * 1000)
      break
    default:
      result = date
  }

  return result.toISOString()
}

export function formatDateHuman(isoDate: string): string {
  return format(new Date(isoDate), 'EEEE, MMMM do, yyyy')
}

export const calendarTool: ToolDefinition = {
  name: 'calendar',
  description: 'Get current date/time, calculate days between dates, and add time periods.',
  parameters: {
    action: { type: 'string', enum: ['now', 'daysUntil', 'add', 'format'] },
    date: { type: 'string', description: 'ISO date string' },
    amount: { type: 'number', description: 'Amount to add' },
    unit: { type: 'string', enum: ['days', 'hours', 'minutes', 'weeks'] },
  },
  execute: async (args) => {
    const { action } = args

    switch (action) {
      case 'now':
        return getCurrentDateTime()
      case 'daysUntil':
        return { daysUntil: getDaysUntil(args.date as string) }
      case 'add':
        return { result: addTime(args.date as string, args.amount as number, args.unit as any) }
      case 'format':
        return { formatted: formatDateHuman(args.date as string) }
      default:
        return { error: 'Invalid action' }
    }
  },
}