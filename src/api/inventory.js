import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const fetchInventory = async (productId) => {
  const response = await apiClient.get(`/api/inventory/${productId}`)
  return unwrap(response)
}

export const adjustInventory = async (payload) => {
  const response = await apiClient.post('/api/inventory/adjust', payload)
  return unwrap(response)
}


