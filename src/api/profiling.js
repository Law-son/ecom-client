import apiClient, { unwrapApiResponse } from './client'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

export const getProfilingStatus = async () => {
  const response = await apiClient.get('/api/v1/profiling/jfr/status')
  return unwrap(response)
}

export const startProfiling = async (params = {}) => {
  const response = await apiClient.post('/api/v1/profiling/jfr/start', null, { params })
  return unwrap(response)
}

export const stopProfiling = async (params = {}) => {
  const response = await apiClient.post('/api/v1/profiling/jfr/stop', null, { params })
  return unwrap(response)
}
