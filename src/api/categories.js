import apiClient from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => response?.data?.data ?? response?.data

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
    return unwrap(response)
  }
}

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

export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/api/categories/${id}`, payload)
  return unwrap(response)
}

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/api/categories/${id}`)
  return unwrap(response)
}


