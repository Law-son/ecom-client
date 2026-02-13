import apiClient, { unwrapApiResponse } from './client'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

/**
 * GET /api/v1/cart - Returns the authenticated user's cart and totals
 */
export const fetchCart = async () => {
  const response = await apiClient.get('/api/v1/cart')
  return unwrap(response)
}

/**
 * POST /api/v1/cart/items - Body: productId, quantity
 */
export const addCartItem = async (payload) => {
  const response = await apiClient.post('/api/v1/cart/items', payload)
  return unwrap(response)
}

/**
 * PATCH /api/v1/cart/items/{productId} - Body: quantity
 */
export const updateCartItem = async (productId, payload) => {
  const response = await apiClient.patch(`/api/v1/cart/items/${productId}`, payload)
  return unwrap(response)
}

/**
 * DELETE /api/v1/cart/items/{productId}
 */
export const removeCartItem = async (productId) => {
  const response = await apiClient.delete(`/api/v1/cart/items/${productId}`)
  return unwrap(response)
}

/**
 * DELETE /api/v1/cart - Clears all items from the cart
 */
export const clearCart = async () => {
  const response = await apiClient.delete('/api/v1/cart')
  return unwrap(response)
}
