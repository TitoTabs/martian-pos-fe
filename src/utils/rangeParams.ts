import type { RangeQuery } from '@/types/report'

/**
 * Build the query params the API expects from a RangeQuery. An explicit
 * custom range wins (sent as period=custom + dates); otherwise the preset
 * period keyword is used.
 */
export function rangeParams(query: RangeQuery): Record<string, string> {
  if (query.startDate && query.endDate) {
    return { period: 'custom', start_date: query.startDate, end_date: query.endDate }
  }
  return { period: query.period ?? 'today' }
}
