<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    totalPages: number
    total: number
    from: number
    to: number
    perPageOptions?: number[]
  }>(),
  { perPageOptions: () => [10, 25, 50] },
)

const page = defineModel<number>('page', { required: true })
const perPage = defineModel<number>('perPage', { required: true })

/** Page numbers to render, collapsing long ranges with ellipses. */
const pages = computed<(number | '…')[]>(() => {
  const last = props.totalPages
  const current = page.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const out: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < last - 1) out.push('…')
  out.push(last)
  return out
})

function go(target: number) {
  if (target < 1 || target > props.totalPages) return
  page.value = target
}
</script>

<template>
  <div
    v-if="total > 0"
    class="flex flex-col gap-3 border-t border-stone-200 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <!-- Range + rows-per-page -->
    <div class="flex items-center gap-3 text-stone-500">
      <span>{{ from }}–{{ to }} of {{ total }}</span>
      <label class="flex items-center gap-1.5">
        <span class="hidden sm:inline">Rows</span>
        <select
          v-model.number="perPage"
          class="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm"
        >
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
    </div>

    <!-- Navigation -->
    <div v-if="totalPages > 1" class="flex items-center gap-1">
      <button
        class="flex h-9 items-center gap-1 rounded-md border border-stone-200 px-2.5 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
        :disabled="page <= 1"
        @click="go(page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
        <span class="hidden sm:inline">Prev</span>
      </button>

      <!-- Page numbers (sm+) -->
      <div class="hidden items-center gap-1 sm:flex">
        <template v-for="(p, i) in pages" :key="i">
          <span v-if="p === '…'" class="px-1.5 text-stone-400">…</span>
          <button
            v-else
            class="h-9 min-w-9 rounded-md border px-2 text-sm font-medium"
            :class="
              p === page
                ? 'border-mars-600 bg-mars-600 text-white'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            "
            @click="go(p)"
          >
            {{ p }}
          </button>
        </template>
      </div>

      <!-- Compact indicator (mobile) -->
      <span class="px-2 text-stone-500 sm:hidden">Page {{ page }} / {{ totalPages }}</span>

      <button
        class="flex h-9 items-center gap-1 rounded-md border border-stone-200 px-2.5 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
        :disabled="page >= totalPages"
        @click="go(page + 1)"
      >
        <span class="hidden sm:inline">Next</span>
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
