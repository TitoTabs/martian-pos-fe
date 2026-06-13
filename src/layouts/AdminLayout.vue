<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Banknote,
  BarChart3,
  Boxes,
  ChefHat,
  Coffee,
  CupSoda,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  PlusCircle,
  Receipt,
  ShoppingCart,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: CupSoda },
  { to: '/admin/inventory-items', label: 'Inventory', icon: Boxes },
  { to: '/admin/add-ons', label: 'Add-ons', icon: PlusCircle },
  { to: '/admin/expenses', label: 'Expenses', icon: Receipt },
  { to: '/admin/manual-sales', label: 'Manual Sales', icon: Banknote },
  { to: '/admin/savings', label: 'Savings', icon: PiggyBank },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

const publicLinks = [
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/barista', label: 'Queue', icon: ChefHat },
]

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(() => auth.fetchUser())
</script>

<template>
  <div class="min-h-screen bg-mars-50 lg:flex">
    <!-- Desktop sidebar -->
    <aside class="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:bg-mars-950">
      <div class="flex items-center gap-2.5 px-5 py-5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-mars-600">
          <Coffee class="h-5 w-5 text-mars-50" />
        </div>
        <span class="text-lg font-bold text-mars-50">Kape Martian</span>
      </div>

      <nav class="flex-1 space-y-1 px-3">
        <RouterLink
          v-for="link in adminLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mars-100/80 hover:bg-mars-900 hover:text-mars-50"
          active-class="bg-mars-800 font-medium text-mars-50"
        >
          <component :is="link.icon" class="h-4 w-4" />
          {{ link.label }}
        </RouterLink>

        <p class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-mars-100/40">
          Registers
        </p>
        <RouterLink
          v-for="link in publicLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mars-100/80 hover:bg-mars-900 hover:text-mars-50"
        >
          <component :is="link.icon" class="h-4 w-4" />
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-mars-900 p-3">
        <p v-if="auth.user" class="truncate px-3 pb-2 text-xs text-mars-100/60">
          {{ auth.user.name }}
        </p>
        <button
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-mars-100/80 hover:bg-mars-900 hover:text-mars-50"
          @click="logout"
        >
          <LogOut class="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Mobile header -->
    <div class="flex min-h-screen flex-1 flex-col">
      <header class="safe-top sticky top-0 z-20 border-b border-mars-900 bg-mars-950 lg:hidden">
        <div class="flex h-13 items-center justify-between gap-2 px-4 py-2">
          <RouterLink to="/admin/dashboard" class="flex items-center gap-2 font-bold text-mars-50">
            <Coffee class="h-5 w-5 text-mars-400" />
            Kape Martian
          </RouterLink>
          <button class="rounded-md p-2 text-mars-100/80 hover:text-mars-50" title="Sign out" @click="logout">
            <LogOut class="h-5 w-5" />
          </button>
        </div>
        <nav class="flex items-center justify-between gap-1 px-2 pb-2 text-mars-100/80">
          <RouterLink
            v-for="link in [...adminLinks, ...publicLinks]"
            :key="link.to"
            :to="link.to"
            class="flex flex-col items-center gap-0.5 rounded-md p-1.5"
            active-class="text-mars-50 bg-mars-800"
          >
            <component :is="link.icon" class="h-5 w-5" />
            <span class="text-[10px] leading-none">{{ link.label }}</span>
          </RouterLink>
        </nav>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
