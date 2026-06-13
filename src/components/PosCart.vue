<script setup lang="ts">
import { LoaderCircle, Minus, Plus, ShoppingCart, Trash2, X, XCircle } from 'lucide-vue-next'

import AddonSelect from '@/components/AddonSelect.vue'
import type { CartLine, PosCartStore } from '@/composables/usePosCart'
import type { Addon } from '@/types/addon'
import type { OrderType, PaymentMethod } from '@/types/sale'
import { formatCurrency } from '@/utils/format'

defineProps<{
  cart: PosCartStore
}>()

defineEmits<{ checkout: [] }>()

/** Add-ons offered for a cart line: the product's own active add-ons. */
function availableAddons(line: CartLine): Addon[] {
  return line.product.addons.filter((addon) => addon.is_active)
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'gcash', label: 'GCash' },
  { value: 'card', label: 'Card' },
]

const orderTypes: { value: OrderType; label: string }[] = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'take_out', label: 'Take Out' },
]
</script>

<template>
  <div class="rounded-lg border border-stone-200 bg-white p-4">
    <h2 class="mb-3 flex items-center gap-2 font-semibold text-stone-900">
      <ShoppingCart class="h-5 w-5" />
      Order ({{ cart.itemCount.value }} items)
    </h2>

    <p v-if="cart.isEmpty.value" class="py-6 text-center text-sm text-stone-500">
      Tap an item to add it to the order.
    </p>

    <div v-else class="space-y-4">
      <div
        v-for="line in cart.lines.value"
        :key="line.product.id"
        class="border-b border-stone-100 pb-3 last:border-0"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="font-medium text-stone-900">{{ line.product.name }}</p>
          <span class="text-sm font-semibold text-stone-900">
            {{ formatCurrency(cart.lineTotal(line)) }}
          </span>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1">
            <button
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 active:bg-stone-100 hover:bg-stone-50"
              aria-label="Decrease quantity"
              @click="cart.setQuantity(line, line.quantity - 1)"
            >
              <Minus class="h-4 w-4" />
            </button>
            <span class="w-9 text-center text-base font-semibold tabular-nums">{{ line.quantity }}</span>
            <button
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 active:bg-stone-100 hover:bg-stone-50"
              aria-label="Increase quantity"
              @click="cart.setQuantity(line, line.quantity + 1)"
            >
              <Plus class="h-4 w-4" />
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <AddonSelect
              v-if="availableAddons(line).length"
              :addons="availableAddons(line)"
              :selected-ids="line.addons.map((addon) => addon.id)"
              @toggle="cart.toggleAddon(line, $event)"
            />
            <button
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-400 active:bg-stone-100 hover:bg-stone-50 hover:text-red-600"
              aria-label="Remove item"
              @click="cart.removeLine(line)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div v-if="line.addons.length" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="addon in line.addons"
            :key="addon.id"
            class="inline-flex items-center gap-1 rounded-full bg-mars-50 px-2 py-0.5 text-xs text-mars-700"
          >
            {{ addon.name }}
            <button class="hover:text-mars-900" @click="cart.toggleAddon(line, addon)">
              <X class="h-3 w-3" />
            </button>
          </span>
        </div>
      </div>

      <div class="flex justify-between border-t border-stone-100 pt-3 text-base font-semibold text-stone-900">
        <span>Total</span>
        <span>{{ formatCurrency(cart.total.value) }}</span>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          Customer / Order Name
        </label>
        <input
          v-model="cart.customerName.value"
          type="text"
          placeholder="e.g. Jefferson"
          class="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-base"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          Order Type
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="type in orderTypes"
            :key="type.value"
            class="rounded-lg border px-2 py-3 text-sm font-medium"
            :class="
              cart.orderType.value === type.value
                ? 'border-mars-600 bg-mars-50 font-semibold text-mars-700'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            "
            @click="cart.orderType.value = type.value"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          Notes <span class="font-normal normal-case text-stone-400">(optional)</span>
        </label>
        <textarea
          v-model="cart.notes.value"
          rows="2"
          placeholder="e.g. Less ice, extra hot…"
          class="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-base"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          Payment Method
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="method in paymentMethods"
            :key="method.value"
            class="rounded-lg border px-2 py-3 text-sm font-medium"
            :class="
              cart.paymentMethod.value === method.value
                ? 'border-mars-600 bg-mars-50 font-semibold text-mars-700'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            "
            @click="cart.paymentMethod.value = method.value"
          >
            {{ method.label }}
          </button>
        </div>
      </div>

      <p v-if="cart.error.value" class="flex items-center gap-1.5 text-sm text-red-600">
        <XCircle class="h-4 w-4 shrink-0" />
        {{ cart.error.value }}
      </p>

      <button
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-mars-600 px-4 py-3 font-medium text-white hover:bg-mars-700 disabled:opacity-50"
        :disabled="cart.submitting.value"
        @click="$emit('checkout')"
      >
        <LoaderCircle v-if="cart.submitting.value" class="h-4 w-4 animate-spin" />
        Complete Sale — {{ formatCurrency(cart.total.value) }}
      </button>
    </div>
  </div>
</template>
