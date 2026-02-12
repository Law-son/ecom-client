import apiClient, { unwrapApiResponse } from './client'
import { graphqlRequest } from './graphql'

const unwrap = (response) => unwrapApiResponse(response) ?? response?.data

const productFields = `
  id
  name
  description
  price
  imageUrl
  categoryId
  rating
  reviewCount
  stockQuantity
  inStock
  category {
    id
    name
  }
`
const productsConnectionQuery = `
  query Products($categoryId: ID, $search: String, $page: Int, $size: Int, $sortBy: String, $sortDir: String) {
    products(categoryId: $categoryId, search: $search, page: $page, size: $size, sortBy: $sortBy, sortDir: $sortDir) {
      items { ${productFields} }
      content { ${productFields} }
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
const productsListQuery = `
  query Products($categoryId: ID, $search: String, $page: Int, $size: Int, $sortBy: String, $sortDir: String) {
    products(categoryId: $categoryId, search: $search, page: $page, size: $size, sortBy: $sortBy, sortDir: $sortDir) {
      ${productFields}
    }
  }
`

/**
 * GET /api/products - Query: categoryId, search, page, size, sortBy, sortDir
 */
export const fetchProducts = async (params = {}) => {
  const variables = {
    categoryId: params.categoryId,
    search: params.search,
    page: params.page,
    size: params.size,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  }
  try {
    const data = await graphqlRequest(productsConnectionQuery, variables)
    return data?.products ?? []
  } catch (error) {
    try {
      const data = await graphqlRequest(productsListQuery, variables)
      return data?.products ?? []
    } catch (innerError) {
      const response = await apiClient.get('/api/products', { params })
      return unwrap(response)
    }
  }
}

/**
 * GET /api/products/all - Returns all products without pagination
 */
export const fetchAllProducts = async () => {
  const response = await apiClient.get('/api/products/all')
  const data = unwrap(response)
  return Array.isArray(data) ? data : data?.items ?? data?.content ?? []
}

/**
 * GET /api/products/{id}
 */
export const fetchProductById = async (id) => {
  try {
    const data = await graphqlRequest(
      `
        query ProductById($id: ID!) {
          productById(id: $id) {
            ${productFields}
          }
        }
      `,
      { id },
    )
    return data?.productById
  } catch (error) {
    const response = await apiClient.get(`/api/products/${id}`)
    return unwrap(response)
  }
}

/**
 * POST /api/products - Body: categoryId, name, description, price, imageUrl (admin)
 */
export const createProduct = async (payload) => {
  try {
    const data = await graphqlRequest(
      `
        mutation CreateProduct($input: ProductInput!) {
          createProduct(input: $input) {
            ${productFields}
          }
        }
      `,
      { input: payload },
    )
    return data?.createProduct
  } catch (error) {
    const response = await apiClient.post('/api/products', payload)
    return unwrap(response)
  }
}

/**
 * PUT /api/products/{id} - Body: categoryId, name, description, price, imageUrl (admin)
 */
export const updateProduct = async (id, payload) => {
  const response = await apiClient.put(`/api/products/${id}`, payload)
  return unwrap(response)
}

/**
 * DELETE /api/products/{id} (admin)
 */
export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/api/products/${id}`)
  return unwrap(response)
}
