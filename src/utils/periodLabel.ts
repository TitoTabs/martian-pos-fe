import type { Period } from '@/types/report'

const TZ = 'Asia/Manila'
const DEFAULT_SHIFT_START = '21:00'

/** Current date + minutes-since-midnight in Manila. */
function manilaNow(): { y: number; m: number; d: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const part = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  // hour12:false can yield "24" at midnight in some engines; normalise to 0.
  const hour = part('hour') % 24
  return { y: part('year'), m: part('month') - 1, d: part('day'), minutes: hour * 60 + part('minute') }
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
 * The current business date for a shift starting at `startTime`: today if the
 * shift has already started today, otherwise yesterday (covers the
 * post-midnight tail of the shift and daytime hours). Mirrors the backend.
 */
function businessDate(startTime: string): Date {
  const { y, m, d, minutes } = manilaNow()
  const [sh, sm] = startTime.split(':').map(Number)
  const base = new Date(Date.UTC(y, m, d))
  if (minutes < sh * 60 + sm) base.setUTCDate(base.getUTCDate() - 1)
  return base
}

/**
 * Label for the business date(s) a period resolves to (Asia/Manila), matching
 * the backend's shift logic (week starts Monday). Only the dates are shown —
 * the shift times bound each day but aren't part of the label.
 */
export function periodRangeLabel(period: Period, startTime: string = DEFAULT_SHIFT_START): string {
  const base = businessDate(startTime)
  const y = base.getUTCFullYear()
  const m = base.getUTCMonth()
  const d = base.getUTCDate()

  switch (period) {
    case 'today':
      return label(y, m, d)
    case 'week': {
      const daysSinceMonday = (base.getUTCDay() + 6) % 7
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

/** Label for an explicit custom range, e.g. "June 1, 2026 - June 14, 2026". */
export function customRangeLabel(startDate: string, endDate: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return label(y, m - 1, d)
  }
  return `${fmt(startDate)} - ${fmt(endDate)}`
}
