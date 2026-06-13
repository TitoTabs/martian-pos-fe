<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { LoaderCircle, XCircle } from 'lucide-vue-next'

import PeriodFilter from '@/components/PeriodFilter.vue'
import SavingsBreakdownCard from '@/components/SavingsBreakdownCard.vue'
import StatCard from '@/components/StatCard.vue'
import { reportService } from '@/services/reportService'
import type { ApiError } from '@/types/api'
import type { Period, SavingsReport } from '@/types/report'
import { netRevenue } from '@/utils/calculations'
import { formatCurrency } from '@/utils/format'

const period = ref<Period>('today')
const report = ref<SavingsReport | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchReport() {
  loading.value = true
  error.value = null
  try {
    report.value = await reportService.savings(period.value)
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    loading.value = false
  }
}

const profit = computed(() =>
  report.value ? netRevenue(report.value.total_sales, report.value.total_expenses) : 0,
)

watch(period, fetchReport)
onMounted(fetchReport)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold text-stone-900">Savings</h1>
      <PeriodFilter v-model="period" />
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

    <template v-else-if="report">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="POS Sales" :value="formatCurrency(report.pos_sales_total)" />
        <StatCard label="Manual Sales" :value="formatCurrency(report.manual_sales_total)" />
        <StatCard label="Total Sales" :value="formatCurrency(report.total_sales)" />
        <StatCard label="Total Expenses" :value="formatCurrency(report.total_expenses)" accent="red" />
        <StatCard
          label="Net Revenue (Sales − Expenses)"
          :value="formatCurrency(profit)"
          :accent="profit >= 0 ? 'green' : 'red'"
        />
      </div>

      <div class="max-w-2xl space-y-2">
        <h2 class="text-sm font-medium uppercase tracking-wide text-stone-500">
          Financial Summary
        </h2>
        <SavingsBreakdownCard
          :total-sales="report.total_sales"
          :total-expenses="report.total_expenses"
          :pos-sales="report.pos_sales_total"
          :manual-sales="report.manual_sales_total"
        />
      </div>
    </template>
  </div>
</template>
