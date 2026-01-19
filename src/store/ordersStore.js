import { create } from 'zustand'

const useOrdersStore = create((set, get) => ({
  orders: [],
  placeOrder: ({ items, shipping }) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const order = {
      id: `ORD-${Date.now()}`,
      items,
      shipping,
      total,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    }
    set({ orders: [order, ...get().orders] })
    return order
  },
}))

export default useOrdersStore

