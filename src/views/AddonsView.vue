<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Link2, LoaderCircle, Pencil, Plus, Power, Trash2, XCircle } from 'lucide-vue-next'

import BaseModal from '@/components/BaseModal.vue'
import { useCrudList } from '@/composables/useCrudList'
import { useToast } from '@/composables/useToast'
import { addonService } from '@/services/addonService'
import { inventoryItemService } from '@/services/inventoryItemService'
import type { Addon, AddonPayload } from '@/types/addon'
import type { InventoryItem } from '@/types/inventoryItem'
import { formatCurrency } from '@/utils/format'

const {
  items: addons,
  loading,
  saving,
  error,
  fetchAll,
  save,
  removeItem,
  toggleActive,
} = useCrudList<Addon, AddonPayload>({ ...addonService, list: () => addonService.list() })

const inventoryItems = ref<InventoryItem[]>([])
const toast = useToast()

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive<AddonPayload>({
  name: '',
  price: 0,
  inventory_item_id: null,
  quantity_used: null,
  is_active: true,
})

function openModal(addon?: Addon) {
  editingId.value = addon?.id ?? null
  form.name = addon?.name ?? ''
  form.price = addon?.price ?? 0
  form.inventory_item_id = addon?.inventory_item_id ?? null
  form.quantity_used = addon?.quantity_used ?? null
  form.is_active = addon?.is_active ?? true
  modalOpen.value = true
}

function unitFor(inventoryItemId: number | null): string {
  return inventoryItems.value.find((item) => item.id === inventoryItemId)?.unit ?? ''
}

async function submit() {
  const isNew = editingId.value === null
  const payload: AddonPayload = {
    ...form,
    quantity_used: form.inventory_item_id ? form.quantity_used : null,
  }
  if (await save(payload, editingId.value ?? undefined)) {
    modalOpen.value = false
    if (isNew) {
      toast.success('Add-on created successfully')
    }
  }
}

async function confirmDelete(addon: Addon) {
  if (window.confirm(`Delete "${addon.name}"?`)) {
    await removeItem(addon)
  }
}

onMounted(async () => {
  fetchAll()
  inventoryItems.value = await inventoryItemService.list()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-stone-900">Add-ons</h1>
        <p class="text-sm text-stone-500">Sellable extras, optionally deducting a linked inventory item</p>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg bg-mars-600 px-3 py-2 text-sm font-medium text-white hover:bg-mars-700"
        @click="openModal()"
      >
        <Plus class="h-4 w-4" />
        Add Add-on
      </button>
    </div>

    <p v-if="error" class="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <XCircle class="h-4 w-4 shrink-0" />
      {{ error }}
    </p>

    <div v-if="loading" class="flex items-center gap-2 text-stone-600">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      Loading add-ons…
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-lg border border-stone-200 bg-white md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3 text-right">Price</th>
              <th class="px-4 py-3">Linked Inventory Item</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="addon in addons" :key="addon.id" class="hover:bg-stone-50">
              <td class="px-4 py-3 font-medium text-stone-900">{{ addon.name }}</td>
              <td class="px-4 py-3 text-right text-stone-900">{{ formatCurrency(addon.price) }}</td>
              <td class="px-4 py-3 text-stone-600">
                <span v-if="addon.inventory_item_id" class="flex items-center gap-1.5">
                  <Link2 class="h-3.5 w-3.5 text-stone-400" />
                  {{ addon.inventory_item_name }} — {{ addon.quantity_used }} {{ addon.inventory_item_unit }}
                </span>
                <span v-else class="text-stone-400">None</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="addon.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
                >
                  {{ addon.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-mars-600" title="Edit" @click="openModal(addon)">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-600"
                    :title="addon.is_active ? 'Deactivate' : 'Activate'"
                    :disabled="saving"
                    @click="toggleActive(addon)"
                  >
                    <Power class="h-4 w-4" />
                  </button>
                  <button class="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600" title="Delete" @click="confirmDelete(addon)">
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
          v-for="addon in addons"
          :key="addon.id"
          class="rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-medium text-stone-900">{{ addon.name }}</p>
              <p class="text-sm font-semibold text-stone-900">{{ formatCurrency(addon.price) }}</p>
              <p v-if="addon.inventory_item_id" class="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                <Link2 class="h-3 w-3" />
                {{ addon.inventory_item_name }} — {{ addon.quantity_used }} {{ addon.inventory_item_unit }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="addon.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'"
            >
              {{ addon.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="mt-3 flex gap-2 border-t border-stone-100 pt-3">
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              @click="openModal(addon)"
            >
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm text-stone-600"
              :disabled="saving"
              @click="toggleActive(addon)"
            >
              <Power class="h-4 w-4" />
              {{ addon.is_active ? 'Deactivate' : 'Activate' }}
            </button>
            <button
              class="flex items-center justify-center rounded-md border border-stone-200 px-3 py-2 text-red-600"
              @click="confirmDelete(addon)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Form -->
    <BaseModal :open="modalOpen" :title="editingId ? 'Edit Add-on' : 'Add Add-on'" @close="modalOpen = false">
      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Name</label>
          <input v-model="form.name" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Selling Price</label>
          <input v-model.number="form.price" type="number" step="0.01" min="0" required class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">
            Linked Inventory Item <span class="font-normal text-stone-400">(optional)</span>
          </label>
          <select v-model="form.inventory_item_id" class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm">
            <option :value="null">None — no stock deduction</option>
            <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
              {{ item.name }} ({{ item.unit }})
            </option>
          </select>
        </div>
        <div v-if="form.inventory_item_id">
          <label class="mb-1 block text-sm font-medium text-stone-700">
            Quantity Used per Add-on
            <span class="font-normal text-stone-400">({{ unitFor(form.inventory_item_id) }})</span>
          </label>
          <input
            v-model.number="form.quantity_used as number"
            type="number"
            step="0.01"
            min="0.01"
            required
            class="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <label class="flex items-center gap-2 text-sm text-stone-700">
          <input v-model="form.is_active" type="checkbox" class="rounded" />
          Active
        </label>
        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-mars-600 px-4 py-2.5 font-medium text-white hover:bg-mars-700 disabled:opacity-50"
          :disabled="saving"
        >
          <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
          {{ editingId ? 'Save Changes' : 'Create Add-on' }}
        </button>
      </form>
    </BaseModal>
  </div>
</template>
