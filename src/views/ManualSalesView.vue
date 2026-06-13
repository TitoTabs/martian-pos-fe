<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ChevronLeft, ChevronRight, LoaderCircle, Pencil, Plus, Trash2, XCircle } from 'lucide-vue-next'

import BaseModal from '@/components/BaseModal.vue'
import { useManualSales } from '@/composables/useManualSales'
import { useToast } from '@/composables/useToast'
import type { ExpensePeriod } from '@/types/expense'
import type { ManualSalesAdjustment, ManualSalesAdjustmentPayload } from '@/types/manualSalesAdjustment'
import { formatCurrency, formatDate } from '@/utils/format'

const {
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
} = useManualSales()

const toast = useToast()

const periodOptions: { value: ExpensePeriod; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive<ManualSalesAdjustmentPayload>({
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  notes: '',
})

function openModal(adjustment?: ManualSalesAdjustment) {
  editingId.value = adjustment?.id ?? null
  form.date = adjustment?.date ?? new Date().toISOString().slice(0, 10)
  form.amount = adjustment?.amount ?? 0
  form.notes = adjustment?.notes ?? ''
  modalOpen.value = true
}

async function submit() {
  const isNew = editingId.value === null
  if (await saveAdjustment({ ...form }, editingId.value ?? undefined)) {
    modalOpen.value = false
    if (isNew) {
      toast.success('Manual sales adjustment created successfully')
    }
  }
}

async function confirmDelete(adjustment: ManualSalesAdjustment) {
  if (window.confirm(`Delete manual sales adjustment for ${formatDate(adjustment.date)}?`)) {
    await deleteAdjustment(adjustment)
  }
}

onMounted(() => fetchAdjustments())
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-stone-900">Manual Sales</h1>
        <p class="mt-1 text-sm text-stone-500">
          Financial-only sales totals for dates without itemized POS orders. These count toward
          total sales and savings, but never affect products, inventory, or the barista queue.
        </p>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg bg-mars-600 px-3 py-2 text-sm font-medium text-white hover:bg-mars-700"
        @click="openModal()"
      >
        <Plus class="h-4 w-4" />
        Add Manual Sale
      </button>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <XCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </p>

    <!-- Date filter -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="inline-flex max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-1">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          class="shrink-0 rounded-md px-3 py-1.5 text-sm"
          :class="
            filter.period === option.value
              ? 'bg-mars-600 font-medium text-white'
              : 'text-stone-600 hover:bg-stone-100'
          "
          @click="filter.period = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <template v-if="filter.period === 'custom'">
        <input v-model="filter.from" type="date" class="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm" />
        <span class="text-sm text-stone-500">to</span>
        <input v-model="filter.to" type="date" class="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm" />
      </template>
    </div>

    <div class="max-w-xs rounded-lg border border-stone-200 bg-white p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Manual Sales Total</p>
      <p class="mt-1 text-2xl font-semibold text-stone-900">{{ formatCurrency(totalManualSales) }}</p>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading manual sales…
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <p v-if="adjustments.length === 0" class="p-4 text-sm text-stone-500">
          No manual sales adjustments yet.
        </p>
        <table v-else class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3">Notes</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="adjustment in adjustments" :key="adjustment.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 font-medium text-stone-900">{{ formatDate(adjustment.date) }}</td>
              <td class="px-4 py-3 text-right font-medium text-stone-900">
                {{ formatCurrency(adjustment.amount) }}
              </td>
              <td class="px-4 py-3 text-stone-600">{{ adjustment.notes || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-mars-600" title="Edit" @click="openModal(adjustment)">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600" title="Delete" @click="confirmDelete(adjustment)">
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
        <p
          v-if="adjustments.length === 0"
          class="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500"
        >
          No manual sales adjustments yet.
        </p>
        <div
          v-for="adjustment in adjustments"
          :key="adjustment.id"
          class="rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-medium text-stone-900">{{ formatDate(adjustment.date) }}</p>
              <p v-if="adjustment.notes" class="text-xs text-stone-500">{{ adjustment.notes }}</p>
            </div>
            <span class="shrink-0 font-semibold text-stone-900">
              {{ formatCurrency(adjustment.amount) }}
            </span>
          </div>
          <div class="mt-3 flex gap-2 border-t border-stone-100 pt-3">
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              @click="openModal(adjustment)"
            >
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button
              class="flex items-center justify-center rounded-md border border-stone-200 px-3 py-2 text-red-600"
              @click="confirmDelete(adjustment)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between text-sm text-stone-600">
        <span>{{ meta.total }} adjustments</span>
        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-3 py-1.5 hover:bg-stone-50 disabled:opacity-50"
            :disabled="meta.current_page <= 1"
            @click="fetchAdjustments(meta.current_page - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
            Prev
          </button>
          <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
          <button
            class="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-3 py-1.5 hover:bg-stone-50 disabled:opacity-50"
            :disabled="meta.current_page >= meta.last_page"
            @click="fetchAdjustments(meta.current_page + 1)"
          >
            Next
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </template>

    <BaseModal :open="modalOpen" :title="editingId ? 'Edit Manual Sale' : 'Add Manual Sale'" @close="modalOpen = false">
      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Date</label>
          <input v-model="form.date" type="date" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Amount</label>
          <input v-model.number="form.amount" type="number" step="0.01" min="0" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Notes</label>
          <input v-model="form.notes" placeholder="e.g. Total sales for June 10" class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-mars-600 px-4 py-2 font-medium text-white hover:bg-mars-700 disabled:opacity-50"
          :disabled="saving"
        >
          <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
          {{ editingId ? 'Save Changes' : 'Add Manual Sale' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>
