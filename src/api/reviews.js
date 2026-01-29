import apiClient from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => response?.data?.data ?? response?.data
const reviewFields = `
  id
  rating
  comment
  createdAt
  userId
  productId
  metadata
`

export const fetchReviews = async (params = {}) => {
  if (params.productId) {
    try {
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
    } catch (error) {
      const response = await apiClient.get('/api/reviews', { params })
      return unwrap(response)
    }
  }
  const response = await apiClient.get('/api/reviews', { params })
  return unwrap(response)
}

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
    const response = await apiClient.post('/api/reviews', payload)
    return unwrap(response)
  }
}


