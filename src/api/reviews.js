import apiClient from './client'

const unwrap = (response) => response?.data?.data ?? response?.data

export const fetchReviews = async (params = {}) => {
  const response = await apiClient.get('/api/reviews', { params })
  return unwrap(response)
}

export const createReview = async (payload) => {
  const response = await apiClient.post('/api/reviews', payload)
  return unwrap(response)
}


