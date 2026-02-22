import axios from 'axios'
import { refreshAccessToken } from './auth'

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

const getRefreshToken = () => {
  try {
    const raw = localStorage.getItem('ecom-session')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    return state?.refreshToken ?? null
  } catch (error) {
    return null
  }
}

const updateStoredTokens = (accessToken, refreshToken, expiresAt) => {
  try {
    const raw = localStorage.getItem('ecom-session')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    if (state) {
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.expiresAt = expiresAt
      if (parsed.state) {
        parsed.state = state
      }
      localStorage.setItem('ecom-session', JSON.stringify(parsed.state ? parsed : { state }))
    }
  } catch (error) {
    console.error('Failed to update tokens in storage:', error)
  }
}

let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
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
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error?.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken()

      // No refresh token, redirect to login
      if (!refreshToken) {
        localStorage.removeItem('ecom-session')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Try to refresh token
      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true

        try {
          const data = await refreshAccessToken(refreshToken)
          const newAccessToken = data.accessToken
          const newRefreshToken = data.refreshToken
          const expiresAt = Date.now() + 60 * 60 * 1000 // 60 minutes

          updateStoredTokens(newAccessToken, newRefreshToken, expiresAt)
          isRefreshing = false
          onRefreshed(newAccessToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          isRefreshing = false
          localStorage.removeItem('ecom-session')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      }

      // Queue requests while refreshing
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

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

