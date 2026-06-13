<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Period, RangeQuery } from '@/types/report'

const props = withDefaults(defineProps<{ allowCustom?: boolean }>(), { allowCustom: false })

const emit = defineEmits<{ change: [query: RangeQuery] }>()

type Filter = Period | 'custom'

const options = computed<{ value: Filter; label: string }[]>(() => [
  { value: 'today', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
  ...(props.allowCustom ? [{ value: 'custom' as const, label: 'Custom' }] : []),
])

const manilaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())

const selected = ref<Filter>('today')
const startDate = ref(manilaToday)
const endDate = ref(manilaToday)

// Business shift window (default 9:00 PM → 3:00 AM next day).
const startTime = ref('21:00')
const endTime = ref('03:00')

const customValid = computed(
  () => !!startDate.value && !!endDate.value && endDate.value >= startDate.value,
)

// Emit the resolved range whenever any control changes (skip invalid custom).
watch([selected, startDate, endDate, startTime, endTime], () => {
  const shift = { startTime: startTime.value, endTime: endTime.value }
  if (selected.value === 'custom') {
    if (customValid.value) {
      emit('change', { startDate: startDate.value, endDate: endDate.value, ...shift })
    }
  } else {
    emit('change', { period: selected.value, ...shift })
  }
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
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

    <div v-if="allowCustom && selected === 'custom'" class="flex items-center gap-2">
      <input
        v-model="startDate"
        type="date"
        :max="endDate"
        class="rounded-lg border border-stone-300 px-3 py-1.5 text-base"
      />
      <span class="text-stone-400">–</span>
      <input
        v-model="endDate"
        type="date"
        :min="startDate"
        class="rounded-lg border border-stone-300 px-3 py-1.5 text-base"
      />
    </div>

    <!-- Business shift window (crosses midnight when end ≤ start). -->
    <label class="flex items-center gap-1.5 text-xs text-stone-500">
      <span class="hidden sm:inline">Shift</span>
      <input
        v-model="startTime"
        type="time"
        class="rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
      />
      <span class="text-stone-400">–</span>
      <input
        v-model="endTime"
        type="time"
        class="rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
      />
    </label>
  </div>
</template>
