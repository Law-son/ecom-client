import apiClient, { unwrapApiResponse } from './client'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

/**
 * GET /api/inventory/{productId} (admin)
 */
export const fetchInventory = async (productId) => {
  const response = await apiClient.get(`/api/inventory/${productId}`)
  return unwrap(response)
}

/**
 * POST /api/inventory/adjust - Body: productId, quantity (admin)
 */
export const adjustInventory = async (payload) => {
  const response = await apiClient.post('/api/inventory/adjust', payload)
  return unwrap(response)
}
