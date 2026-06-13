<script setup lang="ts">
import { computed } from 'vue'
import {
  CreditCard,
  HandCoins,
  NotebookPen,
  PiggyBank,
  Receipt,
  RotateCcw,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'

import { SAVINGS_ALLOCATION, allocationBreakdown, netRevenue } from '@/utils/calculations'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{
  totalSales: number
  totalExpenses: number
  /** Optional POS vs manual split; when provided, both rows are shown above the total. */
  posSales?: number
  manualSales?: number
}>()

const revenue = computed(() => netRevenue(props.totalSales, props.totalExpenses))
const breakdown = computed(() => allocationBreakdown(revenue.value))
const showSplit = computed(() => props.posSales !== undefined && props.manualSales !== undefined)

const pct = (fraction: number) => `${Math.round(fraction * 100)}%`
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-stone-200 bg-white">
    <table class="w-full text-left text-sm">
      <tbody class="divide-y divide-stone-100">
        <tr class="bg-stone-50">
          <td colspan="2" class="px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Revenue
          </td>
        </tr>
        <template v-if="showSplit">
          <tr>
            <td class="flex items-center gap-2 px-4 py-3 text-stone-600">
              <Wallet class="h-4 w-4 text-stone-400" />
              POS Sales
            </td>
            <td class="px-4 py-3 text-right text-stone-900">
              {{ formatCurrency(posSales ?? 0) }}
            </td>
          </tr>
          <tr>
            <td class="flex items-center gap-2 px-4 py-3 text-stone-600">
              <NotebookPen class="h-4 w-4 text-stone-400" />
              Manual Sales Adjustments
            </td>
            <td class="px-4 py-3 text-right text-stone-900">
              {{ formatCurrency(manualSales ?? 0) }}
            </td>
          </tr>
        </template>
        <tr>
          <td class="flex items-center gap-2 px-4 py-3 text-stone-600" :class="{ 'font-medium text-stone-900': showSplit }">
            <Wallet class="h-4 w-4 text-stone-400" />
            Total Sales
          </td>
          <td class="px-4 py-3 text-right text-stone-900" :class="{ 'font-medium': showSplit }">
            {{ formatCurrency(totalSales) }}
          </td>
        </tr>
        <tr>
          <td class="flex items-center gap-2 px-4 py-3 text-stone-600">
            <Receipt class="h-4 w-4 text-stone-400" />
            Total Expenses
          </td>
          <td class="px-4 py-3 text-right text-red-600">−{{ formatCurrency(totalExpenses) }}</td>
        </tr>
        <tr>
          <td class="flex items-center gap-2 px-4 py-3 font-medium text-stone-900">
            <TrendingUp class="h-4 w-4 text-stone-400" />
            Net Revenue
          </td>
          <td
            class="px-4 py-3 text-right font-semibold"
            :class="revenue >= 0 ? 'text-stone-900' : 'text-red-600'"
          >
            {{ formatCurrency(revenue) }}
          </td>
        </tr>

        <tr class="bg-stone-50">
          <td colspan="2" class="px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Allocation Breakdown (of Net Revenue)
          </td>
        </tr>
        <tr>
          <td class="flex items-center gap-2 px-4 py-3 text-stone-600">
            <CreditCard class="h-4 w-4 text-stone-400" />
            Credit Card Payment ({{ pct(SAVINGS_ALLOCATION.creditCard) }})
          </td>
          <td class="px-4 py-3 text-right text-stone-900">
            {{ formatCurrency(breakdown.creditCard) }}
          </td>
        </tr>
        <tr>
          <td class="flex items-center gap-2 px-4 py-3 text-stone-600">
            <RotateCcw class="h-4 w-4 text-stone-400" />
            Capital Recovery ({{ pct(SAVINGS_ALLOCATION.capitalRecovery) }})
          </td>
          <td class="px-4 py-3 text-right text-stone-900">
            {{ formatCurrency(breakdown.capitalRecovery) }}
          </td>
        </tr>
        <tr>
          <td class="flex items-center gap-2 px-4 py-3 text-stone-600">
            <HandCoins class="h-4 w-4 text-stone-400" />
            Personal Allowance ({{ pct(SAVINGS_ALLOCATION.personalAllowance) }})
          </td>
          <td class="px-4 py-3 text-right text-stone-900">
            {{ formatCurrency(breakdown.personalAllowance) }}
          </td>
        </tr>
        <tr class="bg-green-50">
          <td class="flex items-center gap-2 px-4 py-3 font-medium text-green-700">
            <PiggyBank class="h-4 w-4" />
            Savings ({{ pct(SAVINGS_ALLOCATION.savings) }})
          </td>
          <td class="px-4 py-3 text-right font-semibold text-green-700">
            {{ formatCurrency(breakdown.savings) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
