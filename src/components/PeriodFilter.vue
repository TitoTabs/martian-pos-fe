<script setup lang="ts">
import type { Period } from '@/types/report'

const model = defineModel<Period>({ required: true })

const options: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
]
</script>

<template>
  <div class="inline-flex max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white p-1">
    <button
      v-for="option in options"
      :key="option.value"
      class="shrink-0 rounded-md px-3 py-1.5 text-sm"
      :class="
        model === option.value
          ? 'bg-mars-600 font-medium text-white'
          : 'text-stone-600 hover:bg-stone-100'
      "
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
