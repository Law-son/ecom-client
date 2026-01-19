import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const createOrder = async (payload) => {
  const response = await apiClient.post('/api/orders', payload)
  return unwrap(response)
}

export const fetchOrders = async (params = {}) => {
  const response = await apiClient.get('/api/orders', { params })
  return unwrap(response)
}

export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.patch(`/api/orders/${id}/status`, { status })
  return unwrap(response)
}

