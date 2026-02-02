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

// API: PATCH or PUT /api/orders/{id}/status, body: { status } (PENDING, RECEIVED, SHIPPED, DELIVERED, CANCELLED)
export const updateOrderStatus = async (id, status) => {
  const value =
    typeof status === 'string' ? status.toUpperCase() : status
  const url = `/api/orders/${id}/status`
  const body = { status: value }

  const attempt = async (method) => {
    const response = await apiClient.request({
      method,
      url,
      data: body,
    })
    const data = unwrap(response)
    // Some APIs return 200 with an error payload
    if (data && (data.message === 'Forbidden' || data.status === 'error' || data.error)) {
      const msg = data.message || data.error || 'Forbidden'
      const err = new Error(msg)
      err.response = response
      throw err
    }
    return data
  }

  try {
    return await attempt('patch')
  } catch (patchErr) {
    try {
      return await attempt('put')
    } catch (putErr) {
      const statusCode = patchErr?.response?.status ?? putErr?.response?.status
      if (statusCode === 403) {
        throw new Error(
          'Forbidden (403). Allow the order owner to update status: PATCH /api/orders/:id/status with body { status: "RECEIVED" } must be permitted for the customer who owns the order.',
        )
      }
      throw patchErr
    }
  }
}

