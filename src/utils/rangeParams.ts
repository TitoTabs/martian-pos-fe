import type { RangeQuery } from '@/types/report'

/**
 * Build the query params the API expects from a RangeQuery. A custom range is
 * sent as start_date/end_date; otherwise the preset period keyword is used.
 * The business-shift window (start_time/end_time) is included when present.
 */
export function rangeParams(query: RangeQuery): Record<string, string> {
  const params: Record<string, string> =
    query.startDate && query.endDate
      ? { start_date: query.startDate, end_date: query.endDate }
      : { period: query.period ?? 'today' }

  if (query.startTime && query.endTime) {
    params.start_time = query.startTime
    params.end_time = query.endTime
  }

  return params
}
