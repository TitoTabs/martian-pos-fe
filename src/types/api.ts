export interface ApiError {
  status: number
  message: string
  /** Laravel validation errors, keyed by field name. */
  errors: Record<string, string[]>
}

/** Shape of a Laravel paginated resource collection. */
export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}
