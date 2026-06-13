<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { LoaderCircle, Pencil, Plus, Power, Trash2, XCircle } from 'lucide-vue-next'

import BaseModal from '@/components/BaseModal.vue'
import Pagination from '@/components/Pagination.vue'
import { useCatalogFilters } from '@/composables/useCatalogFilters'
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/constants/productCategories'
import { useCrudList } from '@/composables/useCrudList'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import { addonService } from '@/services/addonService'
import { productService } from '@/services/productService'
import type { Addon } from '@/types/addon'
import type { Product, ProductPayload } from '@/types/product'
import { formatCurrency } from '@/utils/format'

const {
  items: products,
  loading,
  saving,
  error,
  fetchAll,
  save,
  removeItem,
  toggleActive,
} = useCrudList<Product, ProductPayload>({ ...productService, list: productService.listAll })

const { sort, category, categories, filtered } = useCatalogFilters(products, PRODUCT_CATEGORIES)
const paged = usePagination(filtered, 10)
const toast = useToast()

// Jump back to page 1 whenever a filter changes.
watch([sort, category], paged.reset)

const allAddons = ref<Addon[]>([])

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive<Omit<ProductPayload, 'category'> & { category: ProductCategory | '' }>({
  name: '',
  category: '',
  price: 0,
  addon_ids: [],
})

function openModal(product?: Product) {
  editingId.value = product?.id ?? null
  form.name = product?.name ?? ''
  form.category = product?.category ?? ''
  form.price = product?.price ?? 0
  form.addon_ids = product?.addons.map((addon) => addon.id) ?? []
  modalOpen.value = true
}

function toggleFormAddon(addon: Addon) {
  const index = form.addon_ids.indexOf(addon.id)
  if (index >= 0) {
    form.addon_ids.splice(index, 1)
  } else {
    form.addon_ids.push(addon.id)
  }
}

async function submit() {
  if (!form.category) return
  const isNew = editingId.value === null
  if (await save({ ...form, category: form.category }, editingId.value ?? undefined)) {
    modalOpen.value = false
    if (isNew) {
      toast.success('Product created successfully')
    }
  }
}

async function confirmDelete(product: Product) {
  if (window.confirm(`Delete "${product.name}"?`)) {
    await removeItem(product)
  }
}

onMounted(async () => {
  fetchAll()
  allAddons.value = await addonService.list()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-stone-900">Products</h1>
        <p class="text-sm text-stone-500">Sellable menu items shown in the POS</p>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg bg-mars-600 px-3 py-2 text-sm font-medium text-white hover:bg-mars-700"
        @click="openModal()"
      >
        <Plus class="h-4 w-4" />
        Add Product
      </button>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <XCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </p>

    <div v-if="loading" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading products…
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <select v-model="sort" class="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm">
          <option value="az">Name A–Z</option>
          <option value="za">Name Z–A</option>
        </select>
        <select v-model="category" class="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm">
          <option value="all">All categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Product</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Price</th>
              <th class="px-4 py-3 text-right">Add-ons</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="product in paged.paginated.value" :key="product.id" class="hover:bg-stone-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="h-9 w-9 rounded-md object-cover"
                  />
                  <p class="font-medium text-stone-900">{{ product.name }}</p>
                </div>
              </td>
              <td class="px-4 py-3 text-stone-600">{{ product.category }}</td>
              <td class="px-4 py-3 text-right text-stone-900">{{ formatCurrency(product.price) }}</td>
              <td class="px-4 py-3 text-right text-stone-600">{{ product.addons.length }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="product.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
                >
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-mars-600" title="Edit" @click="openModal(product)">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-600"
                    :title="product.is_active ? 'Deactivate' : 'Activate'"
                    :disabled="saving"
                    @click="toggleActive(product)"
                  >
                    <Power class="h-4 w-4" />
                  </button>
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600" title="Delete" @click="confirmDelete(product)">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="product in paged.paginated.value"
          :key="product.id"
          class="rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex min-w-0 items-center gap-2.5">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="h-10 w-10 shrink-0 rounded-md object-cover"
              />
              <div class="min-w-0">
                <p class="font-medium text-stone-900">{{ product.name }}</p>
                <p class="text-xs text-stone-500">{{ product.category }}</p>
              </div>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="product.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
            >
              {{ product.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span class="font-semibold text-stone-900">{{ formatCurrency(product.price) }}</span>
            <span class="text-stone-500">{{ product.addons.length }} add-ons</span>
          </div>
          <div class="mt-3 flex gap-2 border-t border-stone-100 pt-3">
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              @click="openModal(product)"
            >
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              :disabled="saving"
              @click="toggleActive(product)"
            >
              <Power class="h-4 w-4" />
              {{ product.is_active ? 'Deactivate' : 'Activate' }}
            </button>
            <button
              class="flex items-center justify-center rounded-md border border-stone-200 px-3 py-2 text-red-600"
              @click="confirmDelete(product)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-model:page="paged.page.value"
        v-model:per-page="paged.perPage.value"
        :total-pages="paged.totalPages.value"
        :total="paged.total.value"
        :from="paged.from.value"
        :to="paged.to.value"
      />
    </template>

    <!-- Product form -->
    <BaseModal :open="modalOpen" :title="editingId ? 'Edit Product' : 'Add Product'" @close="modalOpen = false">
      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Product Name</label>
          <input v-model="form.name" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Category</label>
            <select v-model="form.category" required class="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm">
              <option value="" disabled>Select category</option>
              <option v-for="cat in PRODUCT_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700">Selling Price</label>
            <input v-model.number="form.price" type="number" step="0.01" min="0" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div v-if="allAddons.length">
          <label class="mb-1 block text-sm font-medium text-stone-700">Available Add-ons</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="addon in allAddons"
              :key="addon.id"
              type="button"
              class="rounded-full border px-2.5 py-1 text-xs"
              :class="
                form.addon_ids.includes(addon.id)
                  ? 'border-mars-600 bg-mars-50 font-medium text-mars-700'
                  : 'border-stone-200 text-stone-500 hover:bg-stone-50'
              "
              @click="toggleFormAddon(addon)"
            >
              {{ addon.name }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-mars-600 px-4 py-2.5 font-medium text-white hover:bg-mars-700 disabled:opacity-50"
          :disabled="saving"
        >
          <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
          {{ editingId ? 'Save Changes' : 'Create Product' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>
