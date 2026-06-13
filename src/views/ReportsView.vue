<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { LoaderCircle, XCircle } from 'lucide-vue-next'

import Pagination from '@/components/Pagination.vue'
import RangeFilter from '@/components/RangeFilter.vue'
import SavingsBreakdownCard from '@/components/SavingsBreakdownCard.vue'
import StatCard from '@/components/StatCard.vue'
import { usePagination } from '@/composables/usePagination'
import { useReports, type ReportTab } from '@/composables/useReports'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

const {
  query,
  tab,
  paymentMethod,
  loading,
  error,
  salesReport,
  expensesReport,
  inventoryReport,
  savingsReport,
  fetchReport,
  setRange,
} = useReports()

const paymentOptions = [
  { value: 'all', label: 'All' },
  { value: 'cash', label: 'Cash' },
  { value: 'gcash', label: 'GCash' },
  { value: 'card', label: 'Card' },
] as const

const tabs: { value: ReportTab; label: string }[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'savings', label: 'Savings' },
]

// Client-side pagination for each report table.
const salesPaged = usePagination(computed(() => salesReport.value?.sales ?? []), 10)
const adjustmentsPaged = usePagination(
  computed(() => salesReport.value?.manual_adjustments ?? []),
  10,
)
const expensesPaged = usePagination(computed(() => expensesReport.value?.expenses ?? []), 10)
const inventoryPaged = usePagination(computed(() => inventoryReport.value?.items ?? []), 10)

// Reset every table to page 1 when the range, tab, or payment filter changes.
watch([query, tab, paymentMethod], () => {
  salesPaged.reset()
  adjustmentsPaged.reset()
  expensesPaged.reset()
  inventoryPaged.reset()
})

onMounted(fetchReport)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold text-stone-900">Reports</h1>
      <RangeFilter @change="setRange" />
    </div>

    <div class="inline-flex max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-1">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="shrink-0 rounded-md px-4 py-1.5 text-sm"
        :class="tab === t.value ? 'bg-mars-600 font-medium text-white' : 'text-stone-600 hover:bg-stone-100'"
        @click="tab = t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading report…
    </div>

    <div
      v-else-if="error"
      class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <XCircle class="h-5 w-5" />
      {{ error }}
    </div>

    <!-- Sales report -->
    <template v-else-if="tab === 'sales' && salesReport">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="POS Sales" :value="formatCurrency(salesReport.pos_sales_total)" />
        <StatCard label="Manual Sales" :value="formatCurrency(salesReport.manual_sales_total)" />
        <StatCard label="Total Sales" :value="formatCurrency(salesReport.total_sales)" />
        <StatCard label="Orders" :value="String(salesReport.total_orders)" />
        <StatCard label="Items Sold" :value="String(salesReport.total_items_sold)" />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-2">
        <h2 class="text-sm font-medium uppercase tracking-wide text-stone-500">POS Sales</h2>
        <label class="flex items-center gap-1.5 text-sm text-stone-500">
          Payment
          <select
            v-model="paymentMethod"
            class="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-700"
          >
            <option v-for="opt in paymentOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </label>
      </div>
      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <p v-if="salesReport.sales.length === 0" class="p-4 text-sm text-stone-500">
          No sales in this period.
        </p>
        <table v-else class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Sale</th>
              <th class="px-4 py-3">Items</th>
              <th class="px-4 py-3">Payment</th>
              <th class="px-4 py-3 text-right">Total</th>
              <th class="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="sale in salesPaged.paginated.value" :key="sale.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 text-stone-500">#{{ sale.id }}</td>
              <td class="px-4 py-3 text-stone-900">
                <div v-for="item in sale.items" :key="item.id">
                  {{ item.quantity }}× {{ item.product_name }}
                  <span v-if="item.addons.length" class="text-xs text-stone-500">
                    ({{ item.addons.map((addon) => addon.addon_name).join(', ') }})
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 capitalize text-stone-600">{{ sale.payment_method }}</td>
              <td class="px-4 py-3 text-right font-medium text-stone-900">
                {{ formatCurrency(sale.total) }}
              </td>
              <td class="px-4 py-3 text-right text-stone-500">{{ formatDateTime(sale.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <p
          v-if="salesReport.sales.length === 0"
          class="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500"
        >
          No sales in this period.
        </p>
        <div
          v-for="sale in salesPaged.paginated.value"
          :key="sale.id"
          class="rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-stone-500">
              #{{ sale.id }} · <span class="capitalize">{{ sale.payment_method }}</span> ·
              {{ formatDateTime(sale.created_at) }}
            </p>
            <span class="shrink-0 font-semibold text-stone-900">{{ formatCurrency(sale.total) }}</span>
          </div>
          <div class="mt-2 space-y-0.5 text-sm text-stone-900">
            <div v-for="item in sale.items" :key="item.id">
              {{ item.quantity }}× {{ item.product_name }}
              <span v-if="item.addons.length" class="text-xs text-stone-500">
                ({{ item.addons.map((addon) => addon.addon_name).join(', ') }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <Pagination
        v-model:page="salesPaged.page.value"
        v-model:per-page="salesPaged.perPage.value"
        :total-pages="salesPaged.totalPages.value"
        :total="salesPaged.total.value"
        :from="salesPaged.from.value"
        :to="salesPaged.to.value"
      />

      <h2 class="pt-2 text-sm font-medium uppercase tracking-wide text-stone-500">
        Manual Sales Adjustments
      </h2>
      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <p v-if="salesReport.manual_adjustments.length === 0" class="p-4 text-sm text-stone-500">
          No manual sales adjustments in this period.
        </p>
        <table v-else class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr
              v-for="adjustment in adjustmentsPaged.paginated.value"
              :key="adjustment.id"
              class="hover:bg-stone-50"
            >
              <td class="px-4 py-3 font-medium text-stone-900">{{ formatDate(adjustment.date) }}</td>
              <td class="px-4 py-3 text-right font-medium text-stone-900">
                {{ formatCurrency(adjustment.amount) }}
              </td>
              <td class="px-4 py-3 text-stone-600">{{ adjustment.notes || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <p
          v-if="salesReport.manual_adjustments.length === 0"
          class="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500"
        >
          No manual sales adjustments in this period.
        </p>
        <div
          v-for="adjustment in adjustmentsPaged.paginated.value"
          :key="adjustment.id"
          class="flex items-start justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="min-w-0">
            <p class="font-medium text-stone-900">{{ formatDate(adjustment.date) }}</p>
            <p v-if="adjustment.notes" class="text-xs text-stone-500">{{ adjustment.notes }}</p>
          </div>
          <span class="shrink-0 font-semibold text-stone-900">
            {{ formatCurrency(adjustment.amount) }}
          </span>
        </div>
      </div>

      <Pagination
        v-model:page="adjustmentsPaged.page.value"
        v-model:per-page="adjustmentsPaged.perPage.value"
        :total-pages="adjustmentsPaged.totalPages.value"
        :total="adjustmentsPaged.total.value"
        :from="adjustmentsPaged.from.value"
        :to="adjustmentsPaged.to.value"
      />
    </template>

    <!-- Expenses report -->
    <template v-else-if="tab === 'expenses' && expensesReport">
      <div class="max-w-xs">
        <StatCard label="Total Expenses" :value="formatCurrency(expensesReport.total_expenses)" accent="red" />
      </div>
      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <p v-if="expensesReport.expenses.length === 0" class="p-4 text-sm text-stone-500">
          No expenses in this period.
        </p>
        <table v-else class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Expense</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3 text-right">Qty</th>
              <th class="px-4 py-3 text-right">Total</th>
              <th class="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="expense in expensesPaged.paginated.value" :key="expense.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 font-medium text-stone-900">{{ expense.name }}</td>
              <td class="px-4 py-3 text-right text-stone-600">{{ formatCurrency(expense.amount) }}</td>
              <td class="px-4 py-3 text-right text-stone-600">{{ expense.quantity }}</td>
              <td class="px-4 py-3 text-right font-medium text-red-600">
                {{ formatCurrency(expense.total_amount) }}
              </td>
              <td class="px-4 py-3 text-right text-stone-500">{{ formatDate(expense.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <p
          v-if="expensesReport.expenses.length === 0"
          class="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500"
        >
          No expenses in this period.
        </p>
        <div
          v-for="expense in expensesPaged.paginated.value"
          :key="expense.id"
          class="flex items-start justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="min-w-0">
            <p class="font-medium text-stone-900">{{ expense.name }}</p>
            <p class="text-xs text-stone-500">
              {{ formatCurrency(expense.amount) }} × {{ expense.quantity }} ·
              {{ formatDate(expense.date) }}
            </p>
          </div>
          <span class="shrink-0 font-semibold text-red-600">
            {{ formatCurrency(expense.total_amount) }}
          </span>
        </div>
      </div>

      <Pagination
        v-model:page="expensesPaged.page.value"
        v-model:per-page="expensesPaged.perPage.value"
        :total-pages="expensesPaged.totalPages.value"
        :total="expensesPaged.total.value"
        :from="expensesPaged.from.value"
        :to="expensesPaged.to.value"
      />
    </template>

    <!-- Inventory items report -->
    <template v-else-if="tab === 'inventory' && inventoryReport">
      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Inventory Item</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Stock</th>
              <th class="px-4 py-3 text-right">Min. Level</th>
              <th class="px-4 py-3 text-right">Used (period)</th>
              <th class="px-4 py-3 text-right">Cost / Unit</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="item in inventoryPaged.paginated.value" :key="item.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 font-medium text-stone-900">{{ item.name }}</td>
              <td class="px-4 py-3 text-stone-600">{{ item.category }}</td>
              <td
                class="px-4 py-3 text-right"
                :class="item.stock <= item.min_stock ? 'font-semibold text-amber-600' : 'text-stone-900'"
              >
                {{ item.stock }} {{ item.unit }}
              </td>
              <td class="px-4 py-3 text-right text-stone-600">{{ item.min_stock }} {{ item.unit }}</td>
              <td class="px-4 py-3 text-right text-stone-600">{{ item.used }} {{ item.unit }}</td>
              <td class="px-4 py-3 text-right text-stone-600">{{ formatCurrency(item.cost_per_unit) }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="item in inventoryPaged.paginated.value"
          :key="item.id"
          class="rounded-lg border bg-white p-4"
          :class="item.stock <= item.min_stock ? 'border-amber-300' : 'border-stone-200'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-medium text-stone-900">{{ item.name }}</p>
              <p class="text-xs text-stone-500">
                {{ item.category }} · {{ formatCurrency(item.cost_per_unit) }}/{{ item.unit }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span :class="item.stock <= item.min_stock ? 'font-semibold text-amber-600' : 'text-stone-900'">
              {{ item.stock }} {{ item.unit }} in stock
            </span>
            <span class="text-stone-500">used {{ item.used }} {{ item.unit }}</span>
          </div>
        </div>
      </div>

      <Pagination
        v-model:page="inventoryPaged.page.value"
        v-model:per-page="inventoryPaged.perPage.value"
        :total-pages="inventoryPaged.totalPages.value"
        :total="inventoryPaged.total.value"
        :from="inventoryPaged.from.value"
        :to="inventoryPaged.to.value"
      />
    </template>

    <!-- Savings report -->
    <template v-else-if="tab === 'savings' && savingsReport">
      <div class="max-w-2xl space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="POS Sales" :value="formatCurrency(savingsReport.pos_sales_total)" />
          <StatCard label="Manual Sales" :value="formatCurrency(savingsReport.manual_sales_total)" />
          <StatCard label="Total Sales" :value="formatCurrency(savingsReport.total_sales)" />
          <StatCard label="Total Expenses" :value="formatCurrency(savingsReport.total_expenses)" accent="red" />
        </div>
        <SavingsBreakdownCard
          :total-sales="savingsReport.total_sales"
          :total-expenses="savingsReport.total_expenses"
          :pos-sales="savingsReport.pos_sales_total"
          :manual-sales="savingsReport.manual_sales_total"
        />
      </div>
    </template>
  </div>
</template>
