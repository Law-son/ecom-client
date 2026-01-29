import apiClient from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => response?.data?.data ?? response?.data

const orderFields = `
  id
  status
  orderDate
  totalAmount
  total
  items {
    productId
    productName
    name
    quantity
    priceAtTime
  }
  shipping {
    city
  }
  shippingCity
  userId
`
const ordersByUserConnectionQuery = `
  query OrdersByUser($userId: ID!, $page: Int, $size: Int) {
    ordersByUser(userId: $userId, page: $page, size: $size) {
      items { ${orderFields} }
      content { ${orderFields} }
      totalElements
      total
      count
      totalItems
      totalCount
      totalPages
      pageCount
      meta { total totalPages }
      pagination { total totalPages }
    }
  }
`
const ordersByUserListQuery = `
  query OrdersByUser($userId: ID!, $page: Int, $size: Int) {
    ordersByUser(userId: $userId, page: $page, size: $size) {
      ${orderFields}
    }
  }
`

export const createOrder = async (payload) => {
  try {
    const data = await graphqlRequest(
      `
        mutation CreateOrder($input: OrderCreateInput!) {
          createOrder(input: $input) {
            ${orderFields}
          }
        }
      `,
      { input: payload },
    )
    return data?.createOrder
  } catch (error) {
    const response = await apiClient.post('/api/orders', payload)
    return unwrap(response)
  }
}

export const fetchOrders = async (params = {}) => {
  if (params.userId) {
    const variables = {
      userId: params.userId,
      page: params.page,
      size: params.size,
    }
    try {
      const data = await graphqlRequest(ordersByUserConnectionQuery, variables)
      return data?.ordersByUser ?? []
    } catch (error) {
      try {
        const data = await graphqlRequest(ordersByUserListQuery, variables)
        return data?.ordersByUser ?? []
      } catch (innerError) {
        const response = await apiClient.get('/api/orders', { params })
        return unwrap(response)
      }
    }
  }
  const response = await apiClient.get('/api/orders', { params })
  return unwrap(response)
}

export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.patch(`/api/orders/${id}/status`, { status })
  return unwrap(response)
}

