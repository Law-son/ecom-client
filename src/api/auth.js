import apiClient from './client'

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Response: { status, message, data }
 * data: object { id, fullName, email, role, lastLogin, accessToken, tokenType, expiresAt } or raw JWT string
 */
export const loginUser = async (payload) => {
  const response = await apiClient.post('/api/v1/auth/login', payload)
  const body = response?.data

  if (body?.status !== 'success' || body?.data == null) {
    const message = body?.message || 'Login failed'
    throw new Error(message)
  }

  return body.data
}
