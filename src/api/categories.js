import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const fetchCategories = async () => {
  const response = await apiClient.get('/api/categories')
  return unwrap(response)
}

export const createCategory = async (payload) => {
  const response = await apiClient.post('/api/categories', payload)
  return unwrap(response)
}

export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/api/categories/${id}`, payload)
  return unwrap(response)
}

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/api/categories/${id}`)
  return unwrap(response)
}


