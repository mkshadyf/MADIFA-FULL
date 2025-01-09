export type DateRange = '24h' | '7d' | '30d' | 'all'

export function getDateRange(range: DateRange): Date {
  const now = new Date()
  switch (range) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case 'all':
      return new Date(0)
  }
}

export function getRelativeDates() {
  const now = new Date()
  return {
    oneDayAgo: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    oneWeekAgo: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    oneMonthAgo: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  }
}

export function formatDate(date: Date): string {
  return date.toISOString()
}

export function getDayName(dayIndex: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  return days[dayIndex]
}

export function getHourFormatted(hour: number): string {
  return `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`
}
