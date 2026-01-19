import { create } from 'zustand'

const useReviewsStore = create((set, get) => ({
  reviewsByProduct: {},
  addReview: (productId, review) => {
    const current = get().reviewsByProduct[productId] || []
    set({
      reviewsByProduct: {
        ...get().reviewsByProduct,
        [productId]: [{ ...review, createdAt: new Date().toISOString() }, ...current],
      },
    })
  },
}))

export default useReviewsStore

