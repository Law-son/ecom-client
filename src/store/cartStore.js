import { create } from 'zustand'
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from '../api/cart'

const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('ecom-session')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    return state?.accessToken ?? state?.user?.accessToken ?? null
  } catch (error) {
    return null
  }
}

const normalizeCartItems = (data) => {
  const items = data?.items || data?.cartItems || data?.cart?.items || []
  return items.map((item) => {
    const product = item.product || item
    return {
      id: item.productId ?? product.id ?? item.id,
      name: item.productName ?? product.name ?? item.name ?? 'Item',
      price: item.price ?? item.priceAtTime ?? product.price ?? 0,
      imageUrl: product.imageUrl ?? product.image,
      category: product.category?.name ?? product.category ?? item.category,
      quantity: item.quantity ?? 1,
    }
  })
}

const useCartStore = create((set, get) => ({
  items: [],
  loadCart: async () => {
    if (!getAccessToken()) return
    const cart = await fetchCart()
    set({ items: normalizeCartItems(cart) })
  },
  syncToServer: async () => {
    if (!getAccessToken()) return
    const items = get().items
    const cart = await fetchCart()
    if (!items.length) {
      set({ items: normalizeCartItems(cart) })
      return
    }
    const serverItems = cart?.items || cart?.cartItems || cart?.cart?.items || []
    const serverMap = serverItems.reduce((acc, item) => {
      const productId = item.productId ?? item.product?.id ?? item.id
      if (productId) {
        acc[productId] = item.quantity ?? 1
      }
      return acc
    }, {})
    await Promise.all(
      items
        .map((item) => {
          const currentQuantity = serverMap[item.id] || 0
          const localQuantity = Math.max(1, item.quantity || 1)

          // Idempotent merge: rerunning sync should not keep increasing quantity.
          const targetQuantity = Math.max(currentQuantity, localQuantity)

          if (currentQuantity > 0) {
            if (currentQuantity === targetQuantity) return null
            return updateCartItem(item.id, { quantity: targetQuantity })
          }

          return addCartItem({ productId: item.id, quantity: targetQuantity })
        })
        .filter(Boolean),
    )
    const updatedCart = await fetchCart()
    set({ items: normalizeCartItems(updatedCart) })
  },
  addItem: async (product, quantity = 1) => {
    if (getAccessToken()) {
      const cart = await addCartItem({ productId: product.id, quantity })
      set({ items: normalizeCartItems(cart) })
      return
    }
    const { items } = get()
    const existing = items.find((item) => item.id === product.id)

    if (existing) {
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      })
      return
    }

    set({
      items: [...items, { ...product, quantity }],
    })
  },
  updateQuantity: async (id, quantity) => {
    const safeQuantity = Math.max(1, quantity)
    if (getAccessToken()) {
      const cart = await updateCartItem(id, { quantity: safeQuantity })
      set({ items: normalizeCartItems(cart) })
      return
    }
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: safeQuantity } : item,
      ),
    })
  },
  removeItem: async (id) => {
    if (getAccessToken()) {
      const cart = await removeCartItem(id)
      if (cart) {
        set({ items: normalizeCartItems(cart) })
        return
      }
    }
    set({
      items: get().items.filter((item) => item.id !== id),
    })
  },
  clear: async () => {
    if (getAccessToken()) {
      await clearCart()
    }
    set({ items: [] })
  },
}))

export default useCartStore

