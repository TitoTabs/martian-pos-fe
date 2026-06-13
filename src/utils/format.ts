/** The shop operates in the Philippines; always present times in Manila. */
const SHOP_TIME_ZONE = 'Asia/Manila'

export function formatCurrency(value: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(value)
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-PH', {
    timeZone: SHOP_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-PH', {
    timeZone: SHOP_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
