import apiClient, { unwrapApiResponse } from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

/**
 * GET /api/categories
 */
export const fetchCategories = async () => {
  try {
    const data = await graphqlRequest(
      `
        query Categories {
          categories {
            id
            name
          }
        }
      `,
    )
    return data?.categories ?? []
  } catch (error) {
    const response = await apiClient.get('/api/categories')
    const data = unwrap(response)
    return Array.isArray(data) ? data : data?.items ?? data?.content ?? []
  }
}

/**
 * GET /api/categories/{id}
 */
export const fetchCategoryById = async (id) => {
  const response = await apiClient.get(`/api/categories/${id}`)
  return unwrap(response)
}

/**
 * POST /api/categories - Body: { name } (admin)
 */
export const createCategory = async (payload) => {
  try {
    const data = await graphqlRequest(
      `
        mutation CreateCategory($input: CategoryInput!) {
          createCategory(input: $input) {
            id
            name
          }
        }
      `,
      { input: payload },
    )
    return data?.createCategory
  } catch (error) {
    const response = await apiClient.post('/api/categories', payload)
    return unwrap(response)
  }
}

/**
 * PUT /api/categories/{id} - Body: { name } (admin)
 */
export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/api/categories/${id}`, payload)
  return unwrap(response)
}

/**
 * DELETE /api/categories/{id} (admin)
 */
export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/api/categories/${id}`)
  return unwrap(response)
}
