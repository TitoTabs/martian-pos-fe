<script setup lang="ts">
import { onMounted } from 'vue'
import { AlertTriangle, LoaderCircle, XCircle } from 'lucide-vue-next'

import PeriodFilter from '@/components/PeriodFilter.vue'
import SavingsBreakdownCard from '@/components/SavingsBreakdownCard.vue'
import StatCard from '@/components/StatCard.vue'
import { useDashboard } from '@/composables/useDashboard'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

const { period, data, loading, error, profit, fetchDashboard } = useDashboard()

onMounted(fetchDashboard)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold text-stone-900">Dashboard</h1>
      <PeriodFilter v-model="period" />
    </div>

    <div v-if="loading && !data" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading dashboard…
    </div>

    <div
      v-else-if="error"
      class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <XCircle class="h-5 w-5 shrink-0" />
      {{ error }}
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <StatCard label="POS Sales" :value="formatCurrency(data.pos_sales_total)" />
        <StatCard label="Manual Sales" :value="formatCurrency(data.manual_sales_total)" />
        <StatCard label="Total Sales" :value="formatCurrency(data.total_sales)" />
        <StatCard label="Items Sold" :value="String(data.total_items_sold)" />
        <StatCard label="Total Expenses" :value="formatCurrency(data.total_expenses)" accent="red" />
        <StatCard
          label="Net Revenue"
          :value="formatCurrency(profit)"
          :accent="profit >= 0 ? 'green' : 'red'"
        />
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-2">
          <h2 class="text-sm font-medium uppercase tracking-wide text-stone-500">
            Financial Summary
          </h2>
          <SavingsBreakdownCard
            :total-sales="data.total_sales"
            :total-expenses="data.total_expenses"
            :pos-sales="data.pos_sales_total"
            :manual-sales="data.manual_sales_total"
          />
        </div>

        <div class="space-y-2">
          <h2 class="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-stone-500">
            <AlertTriangle class="h-4 w-4 text-amber-500" />
            Low Inventory Items
          </h2>
          <div class="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            <p v-if="data.low_stock.length === 0" class="p-4 text-sm text-stone-500">
              All inventory items are above their minimum levels.
            </p>
            <div
              v-for="item in data.low_stock"
              :key="item.id"
              class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div class="min-w-0">
                <p class="truncate font-medium text-stone-900">{{ item.name }}</p>
                <p class="text-xs text-stone-500">{{ item.category }} · min {{ item.min_stock }} {{ item.unit }}</p>
              </div>
              <span class="shrink-0 font-medium text-amber-600">
                {{ item.stock }} {{ item.unit }} left
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-2">
          <h2 class="text-sm font-medium uppercase tracking-wide text-stone-500">
            Top Selling Products
          </h2>
          <div class="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            <p v-if="data.top_products.length === 0" class="p-4 text-sm text-stone-500">
              No sales in this period.
            </p>
            <div
              v-for="(product, index) in data.top_products"
              :key="product.name"
              class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mars-100 text-xs font-bold text-mars-700">
                  {{ index + 1 }}
                </span>
                <p class="truncate font-medium text-stone-900">{{ product.name }}</p>
              </div>
              <div class="shrink-0 text-right">
                <p class="font-medium text-stone-900">{{ product.quantity_sold }} sold</p>
                <p class="text-xs text-stone-500">{{ formatCurrency(product.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-sm font-medium uppercase tracking-wide text-stone-500">Recent Sales</h2>
          <div class="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            <p v-if="data.recent_sales.length === 0" class="p-4 text-sm text-stone-500">
              No sales yet.
            </p>
            <div
              v-for="sale in data.recent_sales"
              :key="sale.id"
              class="flex items-start justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div class="min-w-0">
                <p class="text-stone-900">
                  {{ sale.items.map((item) => `${item.quantity}× ${item.product_name}`).join(', ') }}
                </p>
                <p class="text-xs text-stone-500">
                  #{{ sale.id }} · <span class="capitalize">{{ sale.payment_method }}</span> ·
                  {{ formatDateTime(sale.created_at) }}
                </p>
              </div>
              <span class="shrink-0 font-medium text-stone-900">{{ formatCurrency(sale.total) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-sm font-medium uppercase tracking-wide text-stone-500">Recent Expenses</h2>
          <div class="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            <p v-if="data.recent_expenses.length === 0" class="p-4 text-sm text-stone-500">
              No expenses yet.
            </p>
            <div
              v-for="expense in data.recent_expenses"
              :key="expense.id"
              class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div class="min-w-0">
                <p class="truncate font-medium text-stone-900">{{ expense.name }}</p>
                <p class="text-xs text-stone-500">
                  ×{{ expense.quantity }} · {{ formatDate(expense.date) }}
                </p>
              </div>
              <span class="shrink-0 font-medium text-red-600">
                {{ formatCurrency(expense.total_amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
