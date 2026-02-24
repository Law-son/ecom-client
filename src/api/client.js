import axios from 'axios'
import { refreshAccessToken } from './auth'
import { clearAllTokens, getAccessToken, setAccessToken } from '../utils/tokenStorage'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

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
  const accessToken = getAccessToken()
  if (accessToken && !config.headers?.Authorization) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true

        try {
          const data = await refreshAccessToken()
          setAccessToken(data.accessToken)
          isRefreshing = false
          onRefreshed(data.accessToken)

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          isRefreshing = false
          clearAllTokens()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      }

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

export const unwrapApiResponse = (response) => {
  const body = response?.data
  if (body && body.status === 'success' && 'data' in body) return body.data
  return body ?? response?.data
}

export default apiClient

