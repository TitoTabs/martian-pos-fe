import { computed, ref } from 'vue'

import { saleService } from '@/services/saleService'
import type { ApiError } from '@/types/api'
import type { Addon } from '@/types/addon'
import type { Product } from '@/types/product'
import type { OrderType, PaymentMethod, Sale } from '@/types/sale'

export interface CartLine {
  product: Product
  quantity: number
  addons: Addon[]
}

export type PosCartStore = ReturnType<typeof usePosCart>

export function usePosCart() {
  const lines = ref<CartLine[]>([])
  const paymentMethod = ref<PaymentMethod>('cash')
  const customerName = ref('')
  const orderType = ref<OrderType>('dine_in')
  const notes = ref('')
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const lastSale = ref<Sale | null>(null)

  function addProduct(product: Product) {
    const existing = lines.value.find((line) => line.product.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      lines.value.push({ product, quantity: 1, addons: [] })
    }
  }

  /** Stable signature for a line's add-on selection, order-independent. */
  function addonSignature(addons: Addon[]): string {
    return addons
      .map((addon) => addon.id)
      .sort((a, b) => a - b)
      .join(',')
  }

  /**
   * Add a product with an explicit add-on selection (from the picker).
   * Lines sharing the same product *and* identical add-ons are merged so
   * tapping the same configured drink twice bumps the quantity instead of
   * stacking duplicate rows.
   */
  function addConfigured(product: Product, addons: Addon[], quantity = 1) {
    const signature = addonSignature(addons)
    const existing = lines.value.find(
      (line) => line.product.id === product.id && addonSignature(line.addons) === signature,
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      lines.value.push({ product, quantity, addons: [...addons] })
    }
  }

  function removeLine(line: CartLine) {
    lines.value = lines.value.filter((l) => l !== line)
  }

  function setQuantity(line: CartLine, quantity: number) {
    if (quantity < 1) {
      removeLine(line)
      return
    }
    line.quantity = quantity
  }

  function toggleAddon(line: CartLine, addon: Addon) {
    const index = line.addons.findIndex((a) => a.id === addon.id)
    if (index >= 0) {
      line.addons.splice(index, 1)
    } else {
      line.addons.push(addon)
    }
  }

  function hasAddon(line: CartLine, addon: Addon): boolean {
    return line.addons.some((a) => a.id === addon.id)
  }

  /** Add-ons apply per unit: 2 lattes with extra shot = 2 extra shots. */
  function lineTotal(line: CartLine): number {
    const addonsPrice = line.addons.reduce((sum, addon) => sum + addon.price, 0)
    return (line.product.price + addonsPrice) * line.quantity
  }

  const total = computed(() => lines.value.reduce((sum, line) => sum + lineTotal(line), 0))
  const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const isEmpty = computed(() => lines.value.length === 0)

  function clear() {
    lines.value = []
    paymentMethod.value = 'cash'
    customerName.value = ''
    orderType.value = 'dine_in'
    notes.value = ''
    error.value = null
  }

  async function checkout(): Promise<Sale | null> {
    if (isEmpty.value || submitting.value) return null

    if (!customerName.value.trim()) {
      error.value = 'Customer / order name is required.'
      return null
    }

    submitting.value = true
    error.value = null
    try {
      const sale = await saleService.create({
        customer_name: customerName.value.trim(),
        order_type: orderType.value,
        notes: notes.value.trim() || undefined,
        payment_method: paymentMethod.value,
        items: lines.value.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
          addon_ids: line.addons.map((addon) => addon.id),
        })),
      })
      lastSale.value = sale
      clear()
      return sale
    } catch (e) {
      error.value = (e as ApiError).message
      return null
    } finally {
      submitting.value = false
    }
  }

  return {
    lines,
    paymentMethod,
    customerName,
    orderType,
    notes,
    submitting,
    error,
    lastSale,
    total,
    itemCount,
    isEmpty,
    addProduct,
    addConfigured,
    removeLine,
    setQuantity,
    toggleAddon,
    hasAddon,
    lineTotal,
    checkout,
    clear,
  }
}
