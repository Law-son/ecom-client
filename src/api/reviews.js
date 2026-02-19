import apiClient, { unwrapApiResponse } from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

const reviewFields = `
  id
  rating
  comment
  createdAt
  userId
  productId
  metadata
`

/**
 * GET /api/v1/reviews - Query: productId, userId, page, size, sortBy, sortDir
 */
export const fetchReviews = async (params = {}) => {
  const hasPaging =
    params.page !== undefined ||
    params.size !== undefined ||
    params.sortBy !== undefined ||
    params.sortDir !== undefined
  if (params.productId) {
    try {
      if (!hasPaging) {
        const data = await graphqlRequest(
          `
            query ReviewsByProduct($productId: ID!) {
              reviewsByProduct(productId: $productId) {
                ${reviewFields}
              }
            }
          `,
          { productId: params.productId },
        )
        return data?.reviewsByProduct ?? []
      }
    } catch (error) {
      const response = await apiClient.get('/api/v1/reviews', { params })
      return unwrap(response)
    }
  }
  const response = await apiClient.get('/api/v1/reviews', { params })
  return unwrap(response)
}

/**
 * POST /api/v1/reviews - Body: userId, productId, rating, comment, metadata
 */
export const createReview = async (payload) => {
  try {
    const data = await graphqlRequest(
      `
        mutation AddReview($input: ReviewCreateInput!) {
          addReview(input: $input) {
            ${reviewFields}
          }
        }
      `,
      { input: payload },
    )
    return data?.addReview
  } catch (error) {
    const response = await apiClient.post('/api/v1/reviews', payload)
    return unwrap(response)
  }
}
