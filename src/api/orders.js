import apiClient, { unwrapApiResponse } from './client'
import { graphqlRequest } from './graphql'
import { withIdempotency } from '../utils/idempotency'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

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

/**
 * POST /api/v1/orders - Body: userId, items: [{ productId, quantity }]
 */
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
      { useIdempotency: true },
    )
    return data?.createOrder
  } catch (error) {
    const response = await apiClient.post('/api/v1/orders', payload, withIdempotency({}))
    return unwrap(response)
  }
}

/**
 * GET /api/v1/orders - Query: userId, page, size, sortBy, sortDir
 */
export const fetchOrders = async (params = {}) => {
  const restParams = {
    userId: params.userId,
    page: params.page,
    size: params.size,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  }
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
        const response = await apiClient.get('/api/v1/orders', { params: restParams })
        return unwrap(response)
      }
    }
  }
  const response = await apiClient.get('/api/v1/orders', { params: restParams })
  return unwrap(response)
}

/**
 * GET /api/v1/orders/{id}
 */
export const fetchOrderById = async (id) => {
  const response = await apiClient.get(`/api/v1/orders/${id}`)
  return unwrap(response)
}

/**
 * PATCH or PUT /api/v1/orders/{id}/status - Body: { status } (PENDING, RECEIVED, SHIPPED, DELIVERED, CANCELLED)
 */
export const updateOrderStatus = async (id, status) => {
  const value =
    typeof status === 'string' ? status.toUpperCase() : status
  const url = `/api/v1/orders/${id}/status`
  const body = { status: value }

  const attempt = async (method) => {
    const response = await apiClient.request({
      method,
      url,
      data: body,
    })
    const data = unwrap(response)
    if (data && (data.message === 'Forbidden' || data.status === 'error' || data.error)) {
      const msg = data.message || data.error || 'Forbidden'
      const err = new Error(msg)
      err.response = response
      throw err
    }
    return data
  }

  const throwIfTerminalError = (err) => {
    const statusCode = err?.response?.status
    const message = err?.response?.data?.message || err?.message
    if (statusCode === 400 && message) {
      throw new Error(message)
    }
    if (statusCode === 403) {
      throw new Error(
        'Forbidden (403). Allow the order owner to update status: PATCH /api/v1/orders/:id/status with body { status: "RECEIVED" } must be permitted for the customer who owns the order.',
      )
    }
  }

  try {
    return await attempt('patch')
  } catch (patchErr) {
    throwIfTerminalError(patchErr)
    try {
      return await attempt('put')
    } catch (putErr) {
      throwIfTerminalError(putErr)
      throw patchErr
    }
  }
}
