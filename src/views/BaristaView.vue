<script setup lang="ts">
import { onMounted } from 'vue'
import {
  Check,
  CheckCircle2,
  ChefHat,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from 'lucide-vue-next'

import { useBaristaQueue } from '@/composables/useBaristaQueue'
import { formatDateTime } from '@/utils/format'

const { view, orders, loading, updatingId, error, fetchOrders, complete } = useBaristaQueue()

onMounted(fetchOrders)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="flex items-center gap-2 text-2xl font-semibold text-stone-900">
        <ChefHat class="h-6 w-6 text-mars-600" />
        Barista Queue
      </h1>
      <div class="flex items-center gap-2">
        <div class="inline-flex rounded-lg border border-stone-200 bg-white p-1">
          <button
            class="rounded-md px-3 py-1.5 text-sm"
            :class="view === 'active' ? 'bg-mars-600 font-medium text-white' : 'text-stone-600 hover:bg-stone-100'"
            @click="view = 'active'"
          >
            Active
          </button>
          <button
            class="rounded-md px-3 py-1.5 text-sm"
            :class="view === 'completed' ? 'bg-mars-600 font-medium text-white' : 'text-stone-600 hover:bg-stone-100'"
            @click="view = 'completed'"
          >
            Completed
          </button>
        </div>
        <button
          class="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-50"
          title="Refresh"
          :disabled="loading"
          @click="fetchOrders"
        >
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <p
      v-if="error"
      class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      <XCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </p>

    <div v-if="loading && orders.length === 0" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading orders…
    </div>

    <div
      v-else-if="orders.length === 0"
      class="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-500"
    >
      <CheckCircle2 class="mx-auto mb-2 h-8 w-8 text-green-500" />
      {{ view === 'active' ? 'No orders in the queue. All caught up!' : 'No completed orders yet.' }}
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="flex flex-col rounded-lg border bg-white p-3"
        :class="
          view === 'active'
            ? 'border-mars-300 shadow-sm ring-1 ring-mars-200'
            : 'border-stone-200 opacity-60'
        "
      >
        <!-- Header: name + badges -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate text-lg font-bold leading-tight text-stone-900">
              {{ order.customer_name }}
            </p>
            <p class="text-xs text-stone-500">
              #{{ order.id }} · {{ formatDateTime(order.created_at) }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="
              order.order_type === 'dine_in'
                ? 'bg-mars-100 text-mars-800'
                : 'bg-stone-800 text-white'
            "
          >
            {{ order.order_type === 'dine_in' ? 'Dine In' : 'Take Out' }}
          </span>
        </div>

        <!-- Items -->
        <div class="mt-2.5 flex-1 space-y-1.5">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="rounded-md bg-stone-50 px-2 py-1.5"
          >
            <div class="flex items-center gap-2">
              <span
                class="inline-flex h-6 min-w-6 items-center justify-center rounded bg-stone-900 px-1 text-sm font-bold text-white"
              >
                {{ item.quantity }}×
              </span>
              <span class="text-sm font-semibold text-stone-900">{{ item.product_name }}</span>
            </div>
            <div v-if="item.addons.length" class="mt-1 flex flex-wrap items-center gap-1">
              <span class="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                Add-ons:
              </span>
              <span
                v-for="addon in item.addons"
                :key="addon.id"
                class="rounded-full bg-mars-600 px-2 py-0.5 text-xs font-medium text-white"
              >
                {{ addon.addon_name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div
          v-if="order.notes"
          class="mt-2 flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5"
        >
          <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p class="text-sm font-medium text-amber-900">{{ order.notes }}</p>
        </div>

        <!-- Single action -->
        <button
          v-if="view === 'active'"
          class="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50"
          :disabled="updatingId !== null"
          @click="complete(order)"
        >
          <LoaderCircle v-if="updatingId === order.id" class="h-4 w-4 animate-spin" />
          <Check v-else class="h-4 w-4" />
          Order Complete
        </button>
      </div>
    </div>
  </div>
</template>
