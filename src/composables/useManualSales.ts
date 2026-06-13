import { reactive, ref, watch } from 'vue'

import { manualSalesAdjustmentService } from '@/services/manualSalesAdjustmentService'
import type { ApiError, Paginated } from '@/types/api'
import type { ExpenseDateFilter } from '@/types/expense'
import type {
  ManualSalesAdjustment,
  ManualSalesAdjustmentPayload,
} from '@/types/manualSalesAdjustment'

export function useManualSales() {
  const adjustments = ref<ManualSalesAdjustment[]>([])
  const meta = ref<Paginated<ManualSalesAdjustment>['meta'] | null>(null)
  const totalManualSales = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const filter = reactive<ExpenseDateFilter>({ period: 'all', from: '', to: '' })

  async function fetchAdjustments(page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await manualSalesAdjustmentService.list(page, filter)
      adjustments.value = response.data
      meta.value = response.meta
      totalManualSales.value = response.total_manual_sales
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  // Refetch when the filter changes; a custom range only applies
  // once both dates are picked.
  watch(
    () => [filter.period, filter.from, filter.to],
    () => {
      if (filter.period === 'custom' && (!filter.from || !filter.to)) return
      fetchAdjustments(1)
    },
  )

  async function saveAdjustment(
    payload: ManualSalesAdjustmentPayload,
    id?: number,
  ): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      if (id) {
        await manualSalesAdjustmentService.update(id, payload)
      } else {
        await manualSalesAdjustmentService.create(payload)
      }
      await fetchAdjustments(meta.value?.current_page ?? 1)
      return true
    } catch (e) {
      error.value = (e as ApiError).message
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteAdjustment(adjustment: ManualSalesAdjustment): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      await manualSalesAdjustmentService.remove(adjustment.id)
      await fetchAdjustments(meta.value?.current_page ?? 1)
      return true
    } catch (e) {
      error.value = (e as ApiError).message
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    adjustments,
    meta,
    totalManualSales,
    filter,
    loading,
    saving,
    error,
    fetchAdjustments,
    saveAdjustment,
    deleteAdjustment,
  }
}
