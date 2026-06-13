import { ref, watch } from 'vue'

import { orderService } from '@/services/orderService'
import type { ApiError } from '@/types/api'
import type { Sale } from '@/types/sale'

export function useBaristaQueue() {
  const view = ref<'active' | 'completed'>('active')
  const orders = ref<Sale[]>([])
  const loading = ref(false)
  const updatingId = ref<number | null>(null)
  const error = ref<string | null>(null)

  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      orders.value = await orderService.list(view.value)
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  /** Mark an order as done and drop it from the active queue. */
  async function complete(order: Sale) {
    if (updatingId.value) return

    updatingId.value = order.id
    error.value = null
    try {
      await orderService.updateStatus(order.id, 'completed')
      orders.value = orders.value.filter((o) => o.id !== order.id)
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      updatingId.value = null
    }
  }

  watch(view, fetchOrders)

  return { view, orders, loading, updatingId, error, fetchOrders, complete }
}
