import apiClient, { unwrapApiResponse } from './client'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

/**
 * GET /api/v1/inventory/{productId} (admin)
 */
export const fetchInventory = async (productId) => {
  const response = await apiClient.get(`/api/v1/inventory/${productId}`)
  return unwrap(response)
}

/**
 * POST /api/v1/inventory/adjust - Body: productId, quantity (admin)
 */
export const adjustInventory = async (payload) => {
  const response = await apiClient.post('/api/v1/inventory/adjust', payload)
  return unwrap(response)
}
