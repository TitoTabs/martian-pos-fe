<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Minus, Plus, ShoppingCart, X } from 'lucide-vue-next'

import type { Addon } from '@/types/addon'
import type { Product } from '@/types/product'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{
  /** The product being configured, or null when the picker is closed. */
  product: Product | null
}>()

const emit = defineEmits<{
  confirm: [payload: { addons: Addon[]; quantity: number }]
  close: []
}>()

const selectedIds = ref<Set<number>>(new Set())
const quantity = ref(1)

const availableAddons = computed<Addon[]>(
  () => props.product?.addons.filter((addon) => addon.is_active) ?? [],
)

const selectedAddons = computed<Addon[]>(() =>
  availableAddons.value.filter((addon) => selectedIds.value.has(addon.id)),
)

const unitPrice = computed(() => {
  const base = props.product?.price ?? 0
  const addons = selectedAddons.value.reduce((sum, addon) => sum + addon.price, 0)
  return base + addons
})

const total = computed(() => unitPrice.value * quantity.value)

// Reset selection each time a new product opens the picker.
watch(
  () => props.product,
  (product) => {
    if (product) {
      selectedIds.value = new Set()
      quantity.value = 1
    }
  },
)

function toggle(addon: Addon) {
  const next = new Set(selectedIds.value)
  if (next.has(addon.id)) {
    next.delete(addon.id)
  } else {
    next.add(addon.id)
  }
  selectedIds.value = next
}

function confirm() {
  if (!props.product) return
  emit('confirm', { addons: selectedAddons.value, quantity: quantity.value })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="product" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div class="absolute inset-0 bg-black/50" @click="emit('close')" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
        >
          <div
            v-if="product"
            class="scroll-touch safe-bottom relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
              <div class="min-w-0">
                <h3 class="truncate text-lg font-bold text-stone-900">{{ product.name }}</h3>
                <p class="text-sm text-stone-500">
                  Base {{ formatCurrency(product.price) }} · choose add-ons
                </p>
              </div>
              <button
                class="touch-target -mr-2 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100 hover:text-stone-600"
                aria-label="Close"
                @click="emit('close')"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <!-- Add-on list (multi-select) -->
            <div class="flex-1 overflow-y-auto px-3 py-2">
              <label
                v-for="addon in availableAddons"
                :key="addon.id"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3 active:bg-stone-50"
              >
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition"
                  :class="
                    selectedIds.has(addon.id)
                      ? 'border-mars-600 bg-mars-600 text-white'
                      : 'border-stone-300 bg-white'
                  "
                >
                  <Check v-if="selectedIds.has(addon.id)" class="h-4 w-4" />
                </span>
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="selectedIds.has(addon.id)"
                  @change="toggle(addon)"
                />
                <span class="flex-1 text-base font-medium text-stone-900">{{ addon.name }}</span>
                <span class="text-sm font-semibold text-stone-500">
                  +{{ formatCurrency(addon.price) }}
                </span>
              </label>
            </div>

            <!-- Quantity + confirm -->
            <div class="border-t border-stone-100 px-5 py-4">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-medium text-stone-600">Quantity</span>
                <div class="flex items-center gap-1">
                  <button
                    class="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 active:bg-stone-100"
                    aria-label="Decrease quantity"
                    @click="quantity = Math.max(1, quantity - 1)"
                  >
                    <Minus class="h-5 w-5" />
                  </button>
                  <span class="w-10 text-center text-lg font-bold tabular-nums">{{ quantity }}</span>
                  <button
                    class="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 active:bg-stone-100"
                    aria-label="Increase quantity"
                    @click="quantity++"
                  >
                    <Plus class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <button
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-mars-600 px-4 py-3.5 text-base font-bold text-white shadow-sm transition active:scale-[0.98] active:bg-mars-700"
                @click="confirm"
              >
                <ShoppingCart class="h-5 w-5" />
                Add to Cart — {{ formatCurrency(total) }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
