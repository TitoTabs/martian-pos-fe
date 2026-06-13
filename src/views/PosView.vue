<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, ChevronUp, LoaderCircle, X, XCircle } from 'lucide-vue-next'

import PosCart from '@/components/PosCart.vue'
import { usePosCart } from '@/composables/usePosCart'
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

    <div v-if="loading" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading items…
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
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <button
              v-for="product in group.products"
              :key="product.id"
              class="flex flex-col rounded-xl border border-stone-200 bg-white p-3 text-left transition active:scale-[0.98] active:bg-mars-50 hover:border-mars-300 hover:shadow-sm sm:p-4"
              @click="cart.addProduct(product)"
            >
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="mb-2 aspect-square w-full rounded-lg object-cover sm:h-24"
              />
              <p class="font-semibold leading-snug text-stone-900">{{ product.name }}</p>
              <p class="text-xs text-stone-500 sm:text-sm">{{ product.category }}</p>
              <p class="mt-auto pt-2 text-base font-bold text-mars-600 sm:text-lg">
                {{ formatCurrency(product.price) }}
              </p>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart: desktop sidebar -->
      <div class="hidden lg:sticky lg:top-20 lg:block lg:self-start">
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
        class="flex w-full items-center justify-between gap-3 rounded-xl bg-mars-600 px-4 py-3.5 text-base font-semibold text-white active:bg-mars-700"
        @click="cartOpen = true"
      >
        <span class="flex items-center gap-2">
          <ChevronUp class="h-5 w-5" />
          {{ cart.itemCount.value }} {{ cart.itemCount.value === 1 ? 'item' : 'items' }}
        </span>
        <span>Checkout — {{ formatCurrency(cart.total.value) }}</span>
      </button>
    </div>
  </div>
</template>
