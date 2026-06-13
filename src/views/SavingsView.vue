<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CreditCard, HandCoins, LoaderCircle, PiggyBank, RotateCcw, XCircle } from 'lucide-vue-next'

import { reportService } from '@/services/reportService'
import type { ApiError } from '@/types/api'
import type { Period, SavingsReport } from '@/types/report'
import { SAVINGS_ALLOCATION, allocationBreakdown } from '@/utils/calculations'
import { formatCurrency, formatDate } from '@/utils/format'

type Filter = Period | 'custom'

const periodOptions: { value: Filter; label: string }[] = [
  { value: 'today', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]

const today = new Date().toISOString().slice(0, 10)

const selected = ref<Filter>('today')
const startDate = ref(today)
const endDate = ref(today)

const report = ref<SavingsReport | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const customValid = computed(
  () => !!startDate.value && !!endDate.value && endDate.value >= startDate.value,
)

async function fetchReport() {
  if (selected.value === 'custom' && !customValid.value) return

  loading.value = true
  error.value = null
  try {
    report.value = await reportService.savings(
      selected.value === 'custom'
        ? { startDate: startDate.value, endDate: endDate.value }
        : { period: selected.value },
    )
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    loading.value = false
  }
}

const breakdown = computed(() =>
  report.value ? allocationBreakdown(report.value.total_sales) : null,
)

const rangeLabel = computed(() => {
  switch (selected.value) {
    case 'today':
      return 'Today'
    case 'week':
      return 'This Week'
    case 'month':
      return 'This Month'
    case 'year':
      return 'This Year'
    case 'custom':
      return customValid.value
        ? `${formatDate(startDate.value)} – ${formatDate(endDate.value)}`
        : 'Custom range'
  }
  return ''
})

const pct = (fraction: number) => `${Math.round(fraction * 100)}%`

watch(selected, fetchReport)
watch([startDate, endDate], () => {
  if (selected.value === 'custom') fetchReport()
})
onMounted(fetchReport)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-stone-900">Savings</h1>
      <p class="mt-1 text-sm text-stone-500">
        Allocation of net revenue (eligible sales − expenses). Pastries are excluded.
      </p>
    </div>

    <!-- Filter: period presets + custom range -->
    <div class="flex flex-wrap items-center gap-3">
      <div
        class="scroll-touch inline-flex max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-1"
      >
        <button
          v-for="option in periodOptions"
          :key="option.value"
          class="shrink-0 rounded-md px-3 py-2 text-sm font-medium"
          :class="
            selected === option.value
              ? 'bg-mars-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          "
          @click="selected = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="selected === 'custom'" class="flex items-center gap-2">
        <input
          v-model="startDate"
          type="date"
          :max="endDate"
          class="rounded-lg border border-stone-300 px-3 py-2 text-base"
        />
        <span class="text-stone-400">–</span>
        <input
          v-model="endDate"
          type="date"
          :min="startDate"
          class="rounded-lg border border-stone-300 px-3 py-2 text-base"
        />
      </div>
    </div>

    <div v-if="loading && !report" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading savings…
    </div>

    <div
      v-else-if="error"
      class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <XCircle class="h-5 w-5" />
      {{ error }}
    </div>

    <template v-else-if="breakdown">
      <!-- Primary card: Savings -->
      <section
        class="rounded-2xl border-2 border-green-500 bg-gradient-to-br from-green-50 to-white p-6 shadow-md sm:p-8"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white">
              <PiggyBank class="h-6 w-6" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-green-900">Savings</h2>
              <p class="text-xs font-medium uppercase tracking-wide text-green-700/70">
                {{ rangeLabel }}
              </p>
            </div>
          </div>
          <span class="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white">
            {{ pct(SAVINGS_ALLOCATION.savings) }}
          </span>
        </div>
        <p class="mt-4 text-4xl font-extrabold tracking-tight text-green-700 sm:text-5xl">
          {{ formatCurrency(breakdown.savings) }}
        </p>
      </section>

      <!-- Secondary cards: Credit Card + Capital Recovery + Personal Allowance -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section class="rounded-xl border border-stone-200 bg-white p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                <CreditCard class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-semibold text-stone-900">Credit Card Payment</h3>
                <p class="text-xs font-medium uppercase tracking-wide text-stone-400">
                  {{ rangeLabel }}
                </p>
              </div>
            </div>
            <span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
              {{ pct(SAVINGS_ALLOCATION.creditCard) }}
            </span>
          </div>
          <p class="mt-3 text-2xl font-bold text-stone-900">
            {{ formatCurrency(breakdown.creditCard) }}
          </p>
        </section>

        <section class="rounded-xl border border-stone-200 bg-white p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                <RotateCcw class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-semibold text-stone-900">Capital Recovery</h3>
                <p class="text-xs font-medium uppercase tracking-wide text-stone-400">
                  {{ rangeLabel }}
                </p>
              </div>
            </div>
            <span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
              {{ pct(SAVINGS_ALLOCATION.capitalRecovery) }}
            </span>
          </div>
          <p class="mt-3 text-2xl font-bold text-stone-900">
            {{ formatCurrency(breakdown.capitalRecovery) }}
          </p>
        </section>

        <section class="rounded-xl border border-stone-200 bg-white p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                <HandCoins class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-semibold text-stone-900">Personal Allowance</h3>
                <p class="text-xs font-medium uppercase tracking-wide text-stone-400">
                  {{ rangeLabel }}
                </p>
              </div>
            </div>
            <span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
              {{ pct(SAVINGS_ALLOCATION.personalAllowance) }}
            </span>
          </div>
          <p class="mt-3 text-2xl font-bold text-stone-900">
            {{ formatCurrency(breakdown.personalAllowance) }}
          </p>
        </section>
      </div>

      <p class="text-sm text-stone-500">
        Allocated from eligible sales of
        <span class="font-semibold text-stone-700">{{ formatCurrency(breakdown.eligibleSales) }}</span>
        for {{ rangeLabel.toLowerCase() }}.
      </p>
    </template>
  </div>
</template>
