import apiClient, { unwrapApiResponse } from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

/**
 * POST /api/users - Body: fullName, email, password, role (public; role defaults to CUSTOMER for non-admins)
 */
export const createUser = async (payload) => {
  const response = await apiClient.post('/api/users', payload)
  return unwrap(response)
}

/**
 * GET /api/users (admin)
 */
export const fetchUsers = async () => {
  try {
    const data = await graphqlRequest(
      `
        query Users {
          users {
            id
            fullName
            name
            email
            role
          }
        }
      `,
    )
    return data?.users ?? []
  } catch (error) {
    const response = await apiClient.get('/api/users')
    const data = unwrap(response)
    return Array.isArray(data) ? data : data?.items ?? data?.content ?? []
  }
}

/**
 * GET /api/users/{id} (admin)
 */
export const fetchUserById = async (id) => {
  const response = await apiClient.get(`/api/users/${id}`)
  return unwrap(response)
}

/**
 * PUT /api/users/{id} - Body: any of fullName, email, password, role (admin)
 */
export const updateUser = async (id, payload) => {
  const response = await apiClient.put(`/api/users/${id}`, payload)
  return unwrap(response)
}

/**
 * DELETE /api/users/{id} (admin)
 */
export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/api/users/${id}`)
  return unwrap(response)
}
