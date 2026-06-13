<script setup lang="ts">
defineProps<{
  label: string
  value: string
  accent?: 'default' | 'green' | 'red'
}>()
</script>

<template>
  <div class="rounded-lg border border-stone-200 bg-white p-4">
    <p class="text-xs font-medium uppercase tracking-wide text-stone-500">{{ label }}</p>
    <p
      class="mt-1 text-2xl font-semibold"
      :class="{
        'text-stone-900': !accent || accent === 'default',
        'text-green-600': accent === 'green',
        'text-red-600': accent === 'red',
      }"
    >
      {{ value }}
    </p>
  </div>
</template>
