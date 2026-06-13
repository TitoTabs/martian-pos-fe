import type { Period } from '@/types/report'

const TZ = 'Asia/Manila'

/** Today's calendar date in Manila, as integers (month is 0-based). */
function manilaToday(): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  return { y: part('year'), m: part('month') - 1, d: part('day') }
}

/** Format a calendar date as e.g. "June 14, 2026" (no timezone drift). */
function label(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toLocaleDateString('en-PH', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Human label for the date range a period resolves to, in Asia/Manila —
 * matching the backend's range() (week starts Monday, ends Sunday).
 */
export function periodRangeLabel(period: Period): string {
  const { y, m, d } = manilaToday()

  switch (period) {
    case 'today':
      return label(y, m, d)
    case 'week': {
      const base = new Date(Date.UTC(y, m, d))
      const daysSinceMonday = (base.getUTCDay() + 6) % 7 // Sun=0 -> 6, Mon=1 -> 0
      const start = new Date(base)
      start.setUTCDate(base.getUTCDate() - daysSinceMonday)
      const end = new Date(start)
      end.setUTCDate(start.getUTCDate() + 6)
      return `${label(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())} - ${label(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())}`
    }
    case 'month': {
      const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
      return `${label(y, m, 1)} - ${label(y, m, lastDay)}`
    }
    case 'year':
      return `${label(y, 0, 1)} - ${label(y, 11, 31)}`
  }

  return ''
}
