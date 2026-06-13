<script setup lang="ts" generic="T extends string">
const model = defineModel<T>({ required: true })
defineProps<{ options: { value: T; label: string }[] }>()
</script>

<template>
  <div class="scroll-touch inline-flex max-w-full overflow-x-auto rounded-full border border-stone-200 bg-stone-100 p-1">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition"
      :class="
        model === option.value
          ? 'bg-white text-mars-700 shadow-sm'
          : 'text-stone-500 hover:text-stone-700'
      "
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
