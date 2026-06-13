<script setup lang="ts">
import { ChefHat, Coffee, Download, Lock, ShoppingCart } from 'lucide-vue-next'

import { usePwaInstall } from '@/composables/usePwaInstall'

const { canInstall, promptInstall } = usePwaInstall()

const links = [
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/barista', label: 'Queue', icon: ChefHat },
]
</script>

<template>
  <div class="min-h-screen bg-mars-50">
    <header class="safe-top sticky top-0 z-20 border-b border-mars-200 bg-white">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6">
        <RouterLink to="/pos" class="flex shrink-0 items-center gap-2 font-bold text-mars-950">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-mars-600">
            <Coffee class="h-4.5 w-4.5 text-mars-50" />
          </div>
          <span class="hidden sm:inline">Kape Martian</span>
        </RouterLink>

        <nav class="flex flex-1 items-center gap-1 text-sm sm:gap-3">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-1.5 rounded-md px-3 py-2 text-stone-600 hover:text-stone-900"
            active-class="bg-mars-100 font-medium text-mars-800"
          >
            <component :is="link.icon" class="h-4 w-4" />
            {{ link.label }}
          </RouterLink>
        </nav>

        <button
          v-if="canInstall"
          class="flex shrink-0 items-center gap-1.5 rounded-md bg-mars-600 px-3 py-2 text-sm font-medium text-white hover:bg-mars-700"
          @click="promptInstall"
        >
          <Download class="h-4 w-4" />
          <span class="hidden sm:inline">Install</span>
        </button>

        <RouterLink
          to="/admin/dashboard"
          class="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm text-stone-500 hover:text-stone-900"
        >
          <Lock class="h-4 w-4" />
          <span class="hidden sm:inline">Admin</span>
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
