import type { RangeQuery } from '@/types/report'

/** Build the query params the API expects from a RangeQuery. */
export function rangeParams(query: RangeQuery): Record<string, string> {
  return { period: query.period ?? 'today' }
}
