<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { CheckCircle2, ChevronUp, X, XCircle } from 'lucide-vue-next'

import PosCart from '@/components/PosCart.vue'
import { usePosCart } from '@/composables/usePosCart'
import { useToast } from '@/composables/useToast'
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/constants/productCategories'
import { productService } from '@/services/productService'
import type { ApiError } from '@/types/api'
import type { Product } from '@/types/product'
import { formatCurrency } from '@/utils/format'

const products = ref<Product[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const categoryFilter = ref<ProductCategory | 'all'>('all')
const cartOpen = ref(false)

const cart = usePosCart()
const { success: toastSuccess } = useToast()

// Tactile feedback state.
const justAddedId = ref<number | null>(null) // card flashing its "added" state
const cartPulse = ref(false) // brief highlight on the cart panel/bar
const badgeBounce = ref(false) // cart-count badge bounce

const groupedProducts = computed(() =>
  PRODUCT_CATEGORIES.map((category) => ({
    category,
    products: products.value.filter((p) => p.category === category),
  })).filter(
    (group) =>
      group.products.length > 0 &&
      (categoryFilter.value === 'all' || group.category === categoryFilter.value),
  ),
)

/** Fire the visual "added" feedback: card flash, toast, cart highlight. */
function flashAdded(productId: number, label: string) {
  justAddedId.value = productId
  setTimeout(() => {
    if (justAddedId.value === productId) justAddedId.value = null
  }, 900)

  cartPulse.value = true
  setTimeout(() => (cartPulse.value = false), 600)

  toastSuccess(`Added to Cart — ${label}`)
}

/** Tapping a product adds it straight to the cart; add-ons are chosen there. */
function onProductTap(product: Product) {
  cart.addProduct(product)
  flashAdded(product.id, product.name)
}

// Bounce the cart count badge whenever the number of items changes.
watch(
  () => cart.itemCount.value,
  (next, prev) => {
    if (next > (prev ?? 0)) {
      badgeBounce.value = false
      nextTick(() => (badgeBounce.value = true))
      setTimeout(() => (badgeBounce.value = false), 500)
    }
  },
)

async function fetchCatalog() {
  loading.value = true
  loadError.value = null
  try {
    products.value = await productService.listActive()
  } catch (e) {
    loadError.value = (e as ApiError).message
  } finally {
    loading.value = false
  }
}

async function completeSale() {
  const sale = await cart.checkout()
  if (sale) {
    cartOpen.value = false
    successMessage.value = `Order #${sale.id} for ${sale.customer_name} sent to the barista queue — ${formatCurrency(sale.total)}`
    setTimeout(() => (successMessage.value = null), 4000)
  }
}

onMounted(fetchCatalog)
</script>

<template>
  <div class="space-y-4 pb-20 lg:pb-0">
    <h1 class="text-2xl font-semibold text-stone-900">Point of Sale</h1>

    <div
      v-if="successMessage"
      class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
    >
      <CheckCircle2 class="h-5 w-5 shrink-0" />
      {{ successMessage }}
    </div>

    <!-- Loading skeleton grid -->
    <div v-if="loading" class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-3 lg:col-span-2">
        <div class="flex gap-2">
          <div v-for="n in 4" :key="n" class="h-9 w-20 shrink-0 animate-pulse rounded-full bg-stone-200" />
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <div
            v-for="n in 8"
            :key="n"
            class="animate-pulse rounded-xl border border-stone-200 bg-white p-3 sm:p-4"
          >
            <div class="mb-2 h-32 w-full rounded-lg bg-stone-200 sm:h-24" />
            <div class="h-4 w-3/4 rounded bg-stone-200" />
            <div class="mt-2 h-3 w-1/2 rounded bg-stone-100" />
            <div class="mt-3 h-4 w-1/3 rounded bg-stone-200" />
          </div>
        </div>
      </div>
      <div class="hidden h-72 animate-pulse rounded-lg bg-white lg:block" />
    </div>

    <div
      v-else-if="loadError"
      class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <XCircle class="h-5 w-5 shrink-0" />
      {{ loadError }}
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <!-- Item grid -->
      <div class="space-y-4 lg:col-span-2">
        <div class="scroll-touch -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <button
            class="flex shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-medium"
            :class="categoryFilter === 'all' ? 'bg-mars-600 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'"
            @click="categoryFilter = 'all'"
          >
            All
          </button>
          <button
            v-for="category in PRODUCT_CATEGORIES"
            :key="category"
            class="flex shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-medium"
            :class="categoryFilter === category ? 'bg-mars-600 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'"
            @click="categoryFilter = category"
          >
            {{ category }}
          </button>
        </div>

        <div v-for="group in groupedProducts" :key="group.category" class="space-y-2">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {{ group.category }}
          </h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <button
              v-for="product in group.products"
              :key="product.id"
              class="relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white p-3 text-left transition duration-150 active:scale-[0.97] active:bg-mars-50 hover:shadow-sm sm:p-4"
              :class="
                justAddedId === product.id
                  ? 'border-green-400 ring-2 ring-green-300 shadow-md'
                  : 'border-stone-200 hover:border-mars-300'
              "
              @click="onProductTap(product)"
            >
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="mb-2 h-32 w-full rounded-lg object-cover sm:h-24"
              />
              <p class="break-words font-semibold leading-snug text-stone-900">{{ product.name }}</p>
              <p class="text-xs text-stone-500 sm:text-sm">{{ product.category }}</p>
              <p class="mt-auto pt-2 text-base font-bold text-mars-600 sm:text-lg">
                {{ formatCurrency(product.price) }}
              </p>

              <!-- "Added" confirmation overlay -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-90"
                leave-active-class="transition duration-200 ease-in"
                leave-to-class="opacity-0"
              >
                <div
                  v-if="justAddedId === product.id"
                  class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-green-600/95 text-white"
                >
                  <CheckCircle2 class="h-8 w-8" />
                  <span class="text-sm font-bold">Added to Cart</span>
                </div>
              </Transition>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart: desktop sidebar -->
      <div
        class="hidden rounded-lg transition lg:sticky lg:top-20 lg:block lg:self-start"
        :class="cartPulse ? 'ring-2 ring-mars-400 ring-offset-2' : ''"
      >
        <PosCart :cart="cart" @checkout="completeSale" />
      </div>
    </div>

    <!-- Cart: mobile bottom sheet -->
    <template v-if="cartOpen">
      <div class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="cartOpen = false" />
      <div class="scroll-touch safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto overscroll-contain rounded-t-2xl bg-white shadow-xl lg:hidden">
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3">
          <span class="font-semibold text-stone-900">Order</span>
          <button
            class="touch-target flex items-center justify-center rounded-full bg-stone-100 text-stone-500 active:bg-stone-200"
            @click="cartOpen = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="px-2 pb-4">
          <PosCart :cart="cart" @checkout="completeSale" />
        </div>
      </div>
    </template>

    <!-- Mobile sticky checkout summary -->
    <div
      v-if="!cart.isEmpty.value && !cartOpen"
      class="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white px-4 pt-3 lg:hidden"
    >
      <button
        class="flex w-full items-center justify-between gap-3 rounded-xl bg-mars-600 px-4 py-3.5 text-base font-semibold text-white transition active:bg-mars-700"
        :class="cartPulse ? 'ring-2 ring-mars-300 ring-offset-2' : ''"
        @click="cartOpen = true"
      >
        <span class="flex items-center gap-2">
          <ChevronUp class="h-5 w-5" />
          <span
            class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-sm font-bold text-mars-700"
            :class="{ 'animate-badge-pop': badgeBounce }"
          >
            {{ cart.itemCount.value }}
          </span>
          {{ cart.itemCount.value === 1 ? 'item' : 'items' }}
        </span>
        <span>Checkout — {{ formatCurrency(cart.total.value) }}</span>
      </button>
    </div>
  </div>
</template>
