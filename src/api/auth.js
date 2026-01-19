import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const loginUser = async (payload) => {
  const response = await apiClient.post('/api/auth/login', payload)
  return unwrap(response)
}


