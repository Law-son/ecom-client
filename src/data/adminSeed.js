import { products } from './products'

export const initialCategories = [...new Set(products.map((product) => product.category))]

export const initialInventory = products.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  sku: product.id.toUpperCase(),
  stock: Math.floor(Math.random() * 80) + 20,
}))

