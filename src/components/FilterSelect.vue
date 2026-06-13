<script setup lang="ts" generic="T extends string">
import { ChevronDown } from 'lucide-vue-next'

const model = defineModel<T>({ required: true })
defineProps<{ label?: string; options: { value: T; label: string }[] }>()
</script>

<template>
  <label class="inline-flex items-center gap-2">
    <span v-if="label" class="text-xs font-semibold uppercase tracking-wide text-stone-400">
      {{ label }}
    </span>
    <div class="relative">
      <select
        v-model="model"
        class="h-10 cursor-pointer appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-9 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 focus:border-mars-400 focus:outline-none focus:ring-2 focus:ring-mars-100"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <ChevronDown
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
      />
    </div>
  </label>
</template>
