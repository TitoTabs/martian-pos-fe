<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Period, RangeQuery } from '@/types/report'

type Filter = Period | 'custom'

const emit = defineEmits<{ change: [query: RangeQuery] }>()

const options: { value: Filter; label: string }[] = [
  { value: 'today', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]

const today = new Date().toISOString().slice(0, 10)

const selected = ref<Filter>('today')
const startDate = ref(today)
const endDate = ref(today)

const customValid = computed(
  () => !!startDate.value && !!endDate.value && endDate.value >= startDate.value,
)

// Emit a resolved query whenever the selection changes (skip invalid custom ranges).
watch([selected, startDate, endDate], () => {
  if (selected.value === 'custom') {
    if (customValid.value) emit('change', { startDate: startDate.value, endDate: endDate.value })
  } else {
    emit('change', { period: selected.value })
  }
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <div
      class="scroll-touch inline-flex max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-1"
    >
      <button
        v-for="option in options"
        :key="option.value"
        class="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium"
        :class="
          selected === option.value
            ? 'bg-mars-600 text-white'
            : 'text-stone-600 hover:bg-stone-100'
        "
        @click="selected = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="selected === 'custom'" class="flex items-center gap-2">
      <input
        v-model="startDate"
        type="date"
        :max="endDate"
        class="rounded-lg border border-stone-300 px-3 py-2 text-base"
      />
      <span class="text-stone-400">–</span>
      <input
        v-model="endDate"
        type="date"
        :min="startDate"
        class="rounded-lg border border-stone-300 px-3 py-2 text-base"
      />
    </div>
  </div>
</template>
