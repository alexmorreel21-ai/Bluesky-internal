import { endOfWeek, format, startOfWeek } from 'date-fns'

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function weekStartKey(input: string | Date): string {
  const value = typeof input === 'string' ? new Date(input) : input
  return format(startOfWeek(value, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function weekRangeLabel(weekStart: string): string {
  const start = startOfWeek(new Date(weekStart), { weekStartsOn: 1 })
  const end = endOfWeek(new Date(weekStart), { weekStartsOn: 1 })
  return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`
}

export function isFutureDate(dateKey: string): boolean {
  return new Date(dateKey) > new Date(todayKey())
}
