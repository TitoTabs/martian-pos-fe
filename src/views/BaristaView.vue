<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Check,
  CheckCircle2,
  ChefHat,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-vue-next'

import BaseModal from '@/components/BaseModal.vue'
import { useBaristaQueue } from '@/composables/useBaristaQueue'
import { useToast } from '@/composables/useToast'
import type { Sale } from '@/types/sale'
import { formatDateTime } from '@/utils/format'

const { view, orders, loading, updatingId, error, fetchOrders, complete, cancel } =
  useBaristaQueue()
const { success: toastSuccess } = useToast()

// Two-step cancel: a small Cancel button opens a confirmation modal.
const cancelTarget = ref<Sale | null>(null)

async function confirmCancel() {
  const order = cancelTarget.value
  if (!order) return
  await cancel(order)
  cancelTarget.value = null
  if (!error.value) toastSuccess(`Order #${order.id} cancelled`)
}

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
            class="rounded-md px-4 py-2 text-sm font-medium"
            :class="view === 'active' ? 'bg-mars-600 font-semibold text-white' : 'text-stone-600 hover:bg-stone-100'"
            @click="view = 'active'"
          >
            Active
          </button>
          <button
            class="rounded-md px-4 py-2 text-sm font-medium"
            :class="view === 'completed' ? 'bg-mars-600 font-semibold text-white' : 'text-stone-600 hover:bg-stone-100'"
            @click="view = 'completed'"
          >
            Completed
          </button>
        </div>
        <button
          class="touch-target flex items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          title="Refresh"
          :disabled="loading"
          @click="fetchOrders"
        >
          <RefreshCw class="h-5 w-5" :class="{ 'animate-spin': loading }" />
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
        class="flex flex-col rounded-xl border bg-white p-4"
        :class="
          view === 'active'
            ? 'border-mars-300 shadow-sm ring-1 ring-mars-200'
            : 'border-stone-200 opacity-60'
        "
      >
        <!-- Header: name + badges -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <span class="inline-block rounded-md bg-stone-900 px-2 py-0.5 text-sm font-bold text-white">
              #{{ order.id }}
            </span>
            <p class="mt-1 truncate text-xl font-bold leading-tight text-stone-900">
              {{ order.customer_name }}
            </p>
            <p class="text-xs text-stone-500">
              {{ formatDateTime(order.created_at) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1.5">
            <span
              class="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
              :class="
                order.order_type === 'dine_in'
                  ? 'bg-mars-100 text-mars-800'
                  : 'bg-stone-800 text-white'
              "
            >
              {{ order.order_type === 'dine_in' ? 'Dine In' : 'Take Out' }}
            </span>
            <button
              v-if="view === 'active'"
              class="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 active:bg-red-100 hover:bg-red-50 disabled:opacity-50"
              :disabled="updatingId !== null"
              @click="cancelTarget = order"
            >
              <X class="h-3 w-3" />
              Cancel
            </button>
          </div>
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
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3.5 text-base font-bold text-white shadow-sm transition active:scale-[0.98] active:bg-green-800 hover:bg-green-700 disabled:opacity-50"
          :disabled="updatingId !== null"
          @click="complete(order)"
        >
          <LoaderCircle v-if="updatingId === order.id" class="h-5 w-5 animate-spin" />
          <Check v-else class="h-5 w-5" />
          Complete Order
        </button>
      </div>
    </div>

    <!-- Cancel confirmation -->
    <BaseModal :open="cancelTarget !== null" title="Cancel order?" @close="cancelTarget = null">
      <p class="text-sm text-stone-600">
        Cancel order
        <span class="font-semibold text-stone-900">#{{ cancelTarget?.id }}</span>
        for
        <span class="font-semibold text-stone-900">{{ cancelTarget?.customer_name }}</span>?
        This removes it from the queue, restores its inventory, and excludes it from sales.
      </p>
      <div class="mt-5 flex gap-2">
        <button
          class="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 active:bg-stone-100 hover:bg-stone-50"
          @click="cancelTarget = null"
        >
          Keep Order
        </button>
        <button
          class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-red-800 hover:bg-red-700 disabled:opacity-50"
          :disabled="updatingId !== null"
          @click="confirmCancel"
        >
          <LoaderCircle v-if="updatingId !== null" class="h-4 w-4 animate-spin" />
          Cancel Order
        </button>
      </div>
    </BaseModal>
  </div>
</template>
