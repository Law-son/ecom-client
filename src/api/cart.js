import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const fetchCart = async () => {
  const response = await apiClient.get('/api/cart')
  return unwrap(response)
}

export const addCartItem = async (payload) => {
  const response = await apiClient.post('/api/cart/items', payload)
  return unwrap(response)
}

export const updateCartItem = async (productId, payload) => {
  const response = await apiClient.patch(`/api/cart/items/${productId}`, payload)
  return unwrap(response)
}

export const removeCartItem = async (productId) => {
  const response = await apiClient.delete(`/api/cart/items/${productId}`)
  return unwrap(response)
}

export const clearCart = async () => {
  const response = await apiClient.delete('/api/cart')
  return unwrap(response)
}

