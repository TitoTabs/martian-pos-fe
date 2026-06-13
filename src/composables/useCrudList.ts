import { ref, shallowRef } from 'vue'

import type { ApiError } from '@/types/api'

interface CrudService<T, P> {
  list: () => Promise<T[]>
  create: (payload: P) => Promise<T>
  update: (id: number, payload: Partial<P>) => Promise<T>
  remove: (id: number) => Promise<void>
}

/**
 * Shared list + CRUD state for the admin modules
 * (products, inventory items, add-ons).
 */
export function useCrudList<T extends { id: number; is_active: boolean }, P>(
  service: CrudService<T, P>,
) {
  const items = shallowRef<T[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await service.list()
    } catch (e) {
      error.value = (e as ApiError).message
    } finally {
      loading.value = false
    }
  }

  async function save(payload: P, id?: number): Promise<boolean> {
    return run(async () => {
      if (id) {
        const updated = await service.update(id, payload)
        items.value = items.value.map((item) => (item.id === id ? updated : item))
      } else {
        items.value = [...items.value, await service.create(payload)]
      }
    })
  }

  async function removeItem(item: T): Promise<boolean> {
    return run(async () => {
      await service.remove(item.id)
      items.value = items.value.filter((i) => i.id !== item.id)
    })
  }

  async function toggleActive(item: T): Promise<boolean> {
    return run(async () => {
      const updated = await service.update(item.id, {
        is_active: !item.is_active,
      } as unknown as Partial<P>)
      items.value = items.value.map((i) => (i.id === item.id ? updated : i))
    })
  }

  async function run(action: () => Promise<void>): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      await action()
      return true
    } catch (e) {
      error.value = (e as ApiError).message
      return false
    } finally {
      saving.value = false
    }
  }

  return { items, loading, saving, error, fetchAll, save, removeItem, toggleActive }
}
