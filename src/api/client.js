import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

const getAuthHeader = () => {
  try {
    const raw = localStorage.getItem('ecom-session')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    const accessToken = state?.accessToken ?? state?.user?.accessToken
    if (!accessToken) return null
    const tokenType = state?.tokenType ?? state?.user?.tokenType ?? 'Bearer'
    return `${tokenType} ${accessToken}`
  } catch (error) {
    return null
  }
}

apiClient.interceptors.request.use((config) => {
  const authHeader = getAuthHeader()
  if (authHeader && !config.headers?.Authorization) {
    config.headers = config.headers || {}
    config.headers.Authorization = authHeader
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Request failed'
    const err = new Error(message)
    err.response = error.response
    return Promise.reject(err)
  },
)

/**
 * Unwrap ApiResponse envelope: { status, message, data }.
 * On success returns data; otherwise returns full body for backward compatibility.
 */
export const unwrapApiResponse = (response) => {
  const body = response?.data
  if (body && body.status === 'success' && 'data' in body) return body.data
  return body ?? response?.data
}

export default apiClient

