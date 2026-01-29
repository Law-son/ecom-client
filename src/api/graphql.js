import apiClient from './client'

export const graphqlRequest = async (query, variables = {}) => {
  const response = await apiClient.post('/graphql', { query, variables })
  const payload = response?.data
  if (payload?.errors?.length) {
    const message = payload.errors[0]?.message || 'GraphQL request failed'
    throw new Error(message)
  }
  return payload?.data
}

