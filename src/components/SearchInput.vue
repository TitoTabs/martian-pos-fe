<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const model = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string }>()
</script>

<template>
  <div class="relative flex-1">
    <Search
      class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
    />
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder"
      class="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-3 text-base text-stone-900 transition placeholder:text-stone-400 focus:border-mars-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mars-100"
    />
  </div>
</template>
