import apiClient from './client'
import { withIdempotency } from '../utils/idempotency'

const HIGH_PRIORITY_MUTATIONS = ['createOrder', 'addReview']

const needsIdempotency = (query) => {
  return HIGH_PRIORITY_MUTATIONS.some((mutation) => query.includes(mutation))
}

export const graphqlRequest = async (query, variables = {}, options = {}) => {
  const config = options.useIdempotency || needsIdempotency(query) 
    ? withIdempotency({}) 
    : {}
  
  const response = await apiClient.post('/graphql', { query, variables }, config)
  const payload = response?.data
  if (payload?.errors?.length) {
    const message = payload.errors[0]?.message || 'GraphQL request failed'
    throw new Error(message)
  }
  return payload?.data
}

