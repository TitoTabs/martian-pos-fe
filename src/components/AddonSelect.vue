<script setup lang="ts">
import { ref } from 'vue'
import { Check, Plus, X } from 'lucide-vue-next'

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
  <div>
    <button
      type="button"
      class="flex items-center gap-1 rounded-md border border-stone-200 px-2.5 py-2 text-xs font-medium text-stone-600 active:bg-stone-100 hover:bg-stone-50"
      @click="open = true"
    >
      <Plus class="h-3.5 w-3.5" />
      Add-ons
      <span v-if="selectedIds.length" class="text-mars-600">({{ selectedIds.length }})</span>
    </button>

    <!-- Picker overlay: bottom sheet on mobile, centered modal on desktop. -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
        >
          <div class="absolute inset-0 bg-black/50" @click="open = false" />

          <div
            class="scroll-touch safe-bottom relative flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-sm sm:rounded-2xl"
          >
            <div class="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h3 class="text-base font-semibold text-stone-900">Add-ons</h3>
              <button
                class="touch-target -mr-2 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100 hover:text-stone-600"
                aria-label="Close"
                @click="open = false"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-3 py-2">
              <label
                v-for="addon in addons"
                :key="addon.id"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3 active:bg-stone-50"
              >
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition"
                  :class="
                    selectedIds.includes(addon.id)
                      ? 'border-mars-600 bg-mars-600 text-white'
                      : 'border-stone-300 bg-white'
                  "
                >
                  <Check v-if="selectedIds.includes(addon.id)" class="h-4 w-4" />
                </span>
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="selectedIds.includes(addon.id)"
                  @change="$emit('toggle', addon)"
                />
                <span class="flex-1 text-base font-medium text-stone-900">{{ addon.name }}</span>
                <span class="text-sm font-semibold text-stone-500">
                  +{{ formatCurrency(addon.price) }}
                </span>
              </label>
            </div>

            <div class="border-t border-stone-100 px-5 py-3">
              <button
                class="w-full rounded-xl bg-mars-600 px-4 py-3 text-base font-bold text-white active:bg-mars-700"
                @click="open = false"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
