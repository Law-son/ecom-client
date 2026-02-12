import apiClient, { unwrapApiResponse } from './client'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

/**
 * GET /api/cart - Returns the authenticated user's cart and totals
 */
export const fetchCart = async () => {
  const response = await apiClient.get('/api/cart')
  return unwrap(response)
}

/**
 * POST /api/cart/items - Body: productId, quantity
 */
export const addCartItem = async (payload) => {
  const response = await apiClient.post('/api/cart/items', payload)
  return unwrap(response)
}

/**
 * PATCH /api/cart/items/{productId} - Body: quantity
 */
export const updateCartItem = async (productId, payload) => {
  const response = await apiClient.patch(`/api/cart/items/${productId}`, payload)
  return unwrap(response)
}

/**
 * DELETE /api/cart/items/{productId}
 */
export const removeCartItem = async (productId) => {
  const response = await apiClient.delete(`/api/cart/items/${productId}`)
  return unwrap(response)
}

/**
 * DELETE /api/cart - Clears all items from the cart
 */
export const clearCart = async () => {
  const response = await apiClient.delete('/api/cart')
  return unwrap(response)
}
