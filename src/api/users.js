import apiClient from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => response?.data?.data ?? response?.data

export const createUser = async (payload) => {
  const response = await apiClient.post('/api/users', payload)
  return unwrap(response)
}

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
    return unwrap(response)
  }
}


