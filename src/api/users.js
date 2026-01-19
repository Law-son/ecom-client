import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const createUser = async (payload) => {
  const response = await apiClient.post('/api/users', payload)
  return unwrap(response)
}

export const fetchUsers = async () => {
  const response = await apiClient.get('/api/users')
  return unwrap(response)
}


