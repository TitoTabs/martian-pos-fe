<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Coffee, LoaderCircle, XCircle } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types/api'
import type { LoginPayload } from '@/types/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive<LoginPayload>({ email: '', password: '' })
const submitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await auth.login({ ...form })
    router.push((route.query.redirect as string) ?? '/admin/dashboard')
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-mars-50 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-mars-600">
          <Coffee class="h-7 w-7 text-mars-50" />
        </div>
        <h1 class="text-2xl font-bold text-mars-950">Kape Martian</h1>
        <p class="text-sm text-stone-500">Sign in to the admin panel</p>
      </div>

      <form
        class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
        @submit.prevent="submit"
      >
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm focus:border-mars-500 focus:outline-none focus:ring-1 focus:ring-mars-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm focus:border-mars-500 focus:outline-none focus:ring-1 focus:ring-mars-500"
          />
        </div>

        <p v-if="error" class="flex items-center gap-1.5 text-sm text-red-600">
          <XCircle class="h-4 w-4 shrink-0" />
          {{ error }}
        </p>

        <button
          type="submit"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-mars-600 px-4 py-2.5 font-medium text-white hover:bg-mars-700 disabled:opacity-50"
          :disabled="submitting"
        >
          <LoaderCircle v-if="submitting" class="h-4 w-4 animate-spin" />
          Sign In
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-stone-500">
        Looking for the registers?
        <RouterLink to="/pos" class="font-medium text-mars-600 hover:text-mars-700">POS</RouterLink>
        ·
        <RouterLink to="/barista" class="font-medium text-mars-600 hover:text-mars-700">
          Barista Queue
        </RouterLink>
      </p>
    </div>
  </div>
</template>
