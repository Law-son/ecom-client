import apiClient from './client'

export const loginUser = async (payload) => {
  const response = await apiClient.post('/api/v1/auth/login', payload)
  const body = response?.data

  if (body?.status !== 'success' || body?.data == null) {
    const message = body?.message || 'Login failed'
    throw new Error(message)
  }

  return body.data
}

export const refreshAccessToken = async (refreshToken) => {
  const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken })
  const body = response?.data

  if (body?.status !== 'success' || body?.data == null) {
    throw new Error('Token refresh failed')
  }

  return body.data
}

export const logoutUser = async () => {
  await apiClient.post('/api/v1/auth/logout')
}
