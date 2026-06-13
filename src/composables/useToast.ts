import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
}

// Module-level state so every view shares the same toast list.
const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
  function success(message: string, duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter((toast) => toast.id !== id)
    }, duration)
  }

  return { toasts, success }
}
