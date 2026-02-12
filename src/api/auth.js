import apiClient from './client'

/**
 * ApiResponse envelope: { status, message, data }.
 * On success, data is the raw JWT string.
 */
export const loginUser = async (payload) => {
  const response = await apiClient.post('/api/auth/login', payload)
  const body = response?.data

  if (body?.status !== 'success' || body?.data == null) {
    const message = body?.message || 'Login failed'
    throw new Error(message)
  }

  return body.data
}
