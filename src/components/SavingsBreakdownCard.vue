<script setup lang="ts">
import { computed } from 'vue'
import { CreditCard, HandCoins, NotebookPen, PiggyBank, RotateCcw, Wallet } from 'lucide-vue-next'

import { SAVINGS_ALLOCATION, allocationBreakdown } from '@/utils/calculations'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{
  /** Eligible sales (pastries excluded) used as the allocation base. */
  eligibleSales: number
  /** Optional POS vs manual split; when provided, both rows are shown above the eligible-sales total. */
  posSales?: number
  manualSales?: number
}>()

const breakdown = computed(() => allocationBreakdown(props.eligibleSales))
const showSplit = computed(() => props.posSales !== undefined && props.manualSales !== undefined)

const pct = (fraction: number) => `${Math.round(fraction * 100)}%`
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-stone-200 bg-white">
    <table class="w-full text-left text-sm">
      <tbody class="divide-y divide-stone-100">
        <tr class="bg-stone-50">
          <td colspan="2" class="px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Eligible Sales
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
          <td class="flex items-center gap-2 px-4 py-3 font-medium text-stone-900">
            <Wallet class="h-4 w-4 text-stone-400" />
            Total Eligible Sales
          </td>
          <td class="px-4 py-3 text-right font-semibold text-stone-900">
            {{ formatCurrency(breakdown.eligibleSales) }}
          </td>
        </tr>

        <tr class="bg-stone-50">
          <td colspan="2" class="px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Allocation Breakdown (of Eligible Sales)
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
