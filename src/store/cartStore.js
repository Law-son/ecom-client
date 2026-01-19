import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product, quantity = 1) => {
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
  updateQuantity: (id, quantity) => {
    const safeQuantity = Math.max(1, quantity)
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: safeQuantity } : item,
      ),
    })
  },
  removeItem: (id) => {
    set({
      items: get().items.filter((item) => item.id !== id),
    })
  },
  clear: () => set({ items: [] }),
}))

export default useCartStore

