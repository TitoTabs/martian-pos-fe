import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

/**
 * The `beforeinstallprompt` event isn't in the standard DOM lib types yet.
 * It exposes `prompt()` and a `userChoice` promise we use to drive the
 * in-app "Install" button on Android/desktop Chromium browsers.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Captures the install prompt so staff can install the register as a
 * standalone app from inside the UI. iOS Safari doesn't fire this event
 * (install is manual via Share → Add to Home Screen), so `canInstall`
 * simply stays false there.
 */
export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const canInstall = ref(false)
  const installed = ref(false)

  function onBeforeInstallPrompt(event: Event) {
    // Stop Chrome's default mini-infobar; we surface our own button instead.
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
    canInstall.value = true
  }

  function onAppInstalled() {
    installed.value = true
    canInstall.value = false
    deferredPrompt.value = null
  }

  async function promptInstall() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice
    if (choice.outcome === 'accepted') {
      installed.value = true
    }
    // A prompt can only be used once.
    canInstall.value = false
    deferredPrompt.value = null
  }

  onMounted(() => {
    // Already running as an installed PWA — nothing to offer.
    if (window.matchMedia('(display-mode: standalone)').matches) {
      installed.value = true
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return {
    canInstall: readonly(canInstall),
    installed: readonly(installed),
    promptInstall,
  }
}
