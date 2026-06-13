<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { LoaderCircle, Pencil, Plus, Power, Trash2, TriangleAlert, XCircle } from 'lucide-vue-next'

import BaseModal from '@/components/BaseModal.vue'
import FilterSelect from '@/components/FilterSelect.vue'
import SearchInput from '@/components/SearchInput.vue'
import type { SortOrder } from '@/composables/useCatalogFilters'
import { useCrudList } from '@/composables/useCrudList'
import { useInventoryItemFilters, type StockStatus } from '@/composables/useInventoryItemFilters'
import { useToast } from '@/composables/useToast'
import { inventoryItemService } from '@/services/inventoryItemService'
import {
  INVENTORY_UNITS,
  type InventoryItem,
  type InventoryItemPayload,
} from '@/types/inventoryItem'
import { formatCurrency } from '@/utils/format'

const {
  items,
  loading,
  saving,
  error,
  fetchAll,
  save,
  removeItem,
  toggleActive,
} = useCrudList<InventoryItem, InventoryItemPayload>(inventoryItemService)

const { sort, category, search, categories, stockStatus, filtered } = useInventoryItemFilters(items)
const toast = useToast()

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
]
const categoryOptions = computed(() => [
  { value: 'all', label: 'All' },
  ...categories.value.map((cat) => ({ value: cat, label: cat })),
])
const stockOptions: { value: StockStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive<InventoryItemPayload>({
  name: '',
  category: '',
  unit: 'pcs',
  stock: 0,
  min_stock: 0,
  cost_per_unit: 0,
  is_active: true,
})

function isLow(item: InventoryItem): boolean {
  return item.stock <= item.min_stock
}

function openModal(item?: InventoryItem) {
  editingId.value = item?.id ?? null
  form.name = item?.name ?? ''
  form.category = item?.category ?? ''
  form.unit = item?.unit ?? 'pcs'
  form.stock = item?.stock ?? 0
  form.min_stock = item?.min_stock ?? 0
  form.cost_per_unit = item?.cost_per_unit ?? 0
  form.is_active = item?.is_active ?? true
  modalOpen.value = true
}

async function submit() {
  const isNew = editingId.value === null
  if (await save({ ...form }, editingId.value ?? undefined)) {
    modalOpen.value = false
    if (isNew) {
      toast.success('Inventory item created successfully')
    }
  }
}

async function confirmDelete(item: InventoryItem) {
  if (window.confirm(`Delete "${item.name}"? Recipes using it will lose this ingredient.`)) {
    await removeItem(item)
  }
}

onMounted(fetchAll)
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold text-stone-900">Inventory Items</h1>
      <p class="text-sm text-stone-500">Raw materials and supplies — not sold directly in the POS</p>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <XCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </p>

    <div v-if="loading" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading inventory items…
    </div>

    <template v-else>
      <!-- Filter toolbar -->
      <div class="space-y-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
        <div class="flex items-center gap-2">
          <SearchInput v-model="search" placeholder="Search inventory…" />
          <button
            class="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-mars-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-mars-700"
            @click="openModal()"
          >
            <Plus class="h-4 w-4" />
            <span class="hidden sm:inline">Add Item</span>
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-3">
          <FilterSelect v-model="sort" label="Sort" :options="sortOptions" />
          <FilterSelect v-model="category" label="Category" :options="categoryOptions" />
          <FilterSelect v-model="stockStatus" label="Stock" :options="stockOptions" />
        </div>
      </div>

      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Item</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Stock</th>
              <th class="px-4 py-3 text-right">Cost / Unit</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="item in filtered" :key="item.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 font-medium text-stone-900">
                <span class="flex items-center gap-1.5">
                  <TriangleAlert v-if="isLow(item)" class="h-4 w-4 text-amber-500" />
                  {{ item.name }}
                </span>
              </td>
              <td class="px-4 py-3 text-stone-600">{{ item.category }}</td>
              <td class="px-4 py-3 text-right" :class="isLow(item) ? 'font-semibold text-amber-600' : 'text-stone-900'">
                {{ item.stock }} {{ item.unit }}
              </td>
              <td class="px-4 py-3 text-right text-stone-600">{{ formatCurrency(item.cost_per_unit) }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-mars-600" title="Edit" @click="openModal(item)">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-600"
                    :title="item.is_active ? 'Deactivate' : 'Activate'"
                    :disabled="saving"
                    @click="toggleActive(item)"
                  >
                    <Power class="h-4 w-4" />
                  </button>
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600" title="Delete" @click="confirmDelete(item)">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="item in filtered"
          :key="item.id"
          class="rounded-lg border bg-white p-4"
          :class="isLow(item) ? 'border-amber-300' : 'border-stone-200'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="flex items-center gap-1.5 font-medium text-stone-900">
                <TriangleAlert v-if="isLow(item)" class="h-4 w-4 shrink-0 text-amber-500" />
                {{ item.name }}
              </p>
              <p class="text-xs text-stone-500">{{ item.category }} · {{ formatCurrency(item.cost_per_unit) }}/{{ item.unit }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="mt-2 text-sm">
            <span :class="isLow(item) ? 'font-semibold text-amber-600' : 'text-stone-900'">
              {{ item.stock }} {{ item.unit }} in stock
            </span>
          </div>
          <div class="mt-3 flex gap-2 border-t border-stone-100 pt-3">
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              @click="openModal(item)"
            >
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              :disabled="saving"
              @click="toggleActive(item)"
            >
              <Power class="h-4 w-4" />
              {{ item.is_active ? 'Deactivate' : 'Activate' }}
            </button>
            <button
              class="flex items-center justify-center rounded-md border border-stone-200 px-3 py-2 text-red-600"
              @click="confirmDelete(item)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Form -->
    <BaseModal :open="modalOpen" :title="editingId ? 'Edit Inventory Item' : 'Add Inventory Item'" @close="modalOpen = false">
      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Item Name</label>
          <input v-model="form.name" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Category</label>
            <input v-model="form.category" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Unit Type</label>
            <select v-model="form.unit" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm">
              <option v-for="unit in INVENTORY_UNITS" :key="unit" :value="unit">{{ unit }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Stock</label>
            <input v-model.number="form.stock" type="number" step="0.01" min="0" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Min. Level</label>
            <input v-model.number="form.min_stock" type="number" step="0.01" min="0" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Cost / Unit</label>
            <input v-model.number="form.cost_per_unit" type="number" step="0.01" min="0" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm text-stone-700">
          <input v-model="form.is_active" type="checkbox" class="rounded" />
          Active
        </label>
        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-mars-600 px-4 py-2.5 font-medium text-white hover:bg-mars-700 disabled:opacity-50"
          :disabled="saving"
        >
          <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
          {{ editingId ? 'Save Changes' : 'Create Item' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>
