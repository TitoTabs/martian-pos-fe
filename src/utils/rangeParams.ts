import type { RangeQuery } from '@/types/report'

/**
 * Build the query params the API expects from a RangeQuery. A custom range
 * is sent as just start_date/end_date — the backend resolves a custom range
 * from the presence of both dates, so we don't send period=custom (which
 * also keeps it compatible with backends that only know the preset periods).
 * Otherwise the preset period keyword is used.
 */
export function rangeParams(query: RangeQuery): Record<string, string> {
  if (query.startDate && query.endDate) {
    return { start_date: query.startDate, end_date: query.endDate }
  }
  return { period: query.period ?? 'today' }
}
