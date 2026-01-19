import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const fetchProducts = async (params = {}) => {
  const response = await apiClient.get('/api/products', { params })
  return unwrap(response)
}

export const fetchProductById = async (id) => {
  const response = await apiClient.get(`/api/products/${id}`)
  return unwrap(response)
}

export const createProduct = async (payload) => {
  const response = await apiClient.post('/api/products', payload)
  return unwrap(response)
}

export const updateProduct = async (id, payload) => {
  const response = await apiClient.put(`/api/products/${id}`, payload)
  return unwrap(response)
}

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/api/products/${id}`)
  return unwrap(response)
}


