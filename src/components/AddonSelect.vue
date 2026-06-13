<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'

import type { Addon } from '@/types/addon'
import { formatCurrency } from '@/utils/format'

defineProps<{
  addons: Addon[]
  selectedIds: number[]
}>()

defineEmits<{ toggle: [addon: Addon] }>()

const open = ref(false)
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-1 rounded-md border border-stone-200 px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-50"
      @click="open = !open"
    >
      <Plus class="h-3.5 w-3.5" />
      Add-ons
      <span v-if="selectedIds.length" class="font-medium text-mars-600">
        ({{ selectedIds.length }})
      </span>
      <ChevronDown class="h-3.5 w-3.5" :class="{ 'rotate-180': open }" />
    </button>

    <template v-if="open">
      <div class="fixed inset-0 z-20" @click="open = false" />
      <div
        class="absolute left-0 z-30 mt-1 w-56 overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg"
      >
        <label
          v-for="addon in addons"
          :key="addon.id"
          class="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm hover:bg-stone-50"
        >
          <input
            type="checkbox"
            class="rounded"
            :checked="selectedIds.includes(addon.id)"
            @change="$emit('toggle', addon)"
          />
          <span class="text-stone-900">{{ addon.name }}</span>
          <span class="ml-auto text-xs text-stone-500">+{{ formatCurrency(addon.price) }}</span>
        </label>
      </div>
    </template>
  </div>
</template>
