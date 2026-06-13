<script setup lang="ts">
import { ref, watch } from 'vue'

import type { Period, RangeQuery } from '@/types/report'

const emit = defineEmits<{ change: [query: RangeQuery] }>()

const options: { value: Period; label: string }[] = [
  { value: 'today', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
]

const selected = ref<Period>('today')

watch(selected, () => emit('change', { period: selected.value }))
</script>

<template>
  <div
    class="scroll-touch inline-flex max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      class="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium"
      :class="
        selected === option.value ? 'bg-mars-600 text-white' : 'text-stone-600 hover:bg-stone-100'
      "
      @click="selected = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
