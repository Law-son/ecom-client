import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories } from '../../api/categories'
import { createProduct, deleteProduct, fetchProducts } from '../../api/products'
import { formatCurrency } from '../../utils/formatters'

function AdminProductsPage() {
  const [formState, setFormState] = useState({
    name: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    price: '',
  })
  const queryClient = useQueryClient()
  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => fetchProducts({ page: 0, size: 100 }),
  })
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'admin'] })
      queryClient.refetchQueries({ queryKey: ['products', 'admin'] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.content || productsData?.items || []

  const handleChange = (event) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formState.name || !formState.categoryId || !formState.price) {
      return
    }

    createMutation.mutate({
      name: formState.name,
      categoryId: formState.categoryId,
      description: formState.description || 'New product pending description.',
      price: Number(formState.price),
      imageUrl:
        formState.imageUrl ||
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    })
    setFormState({ name: '', categoryId: '', description: '', imageUrl: '', price: '' })
  }

  const handleDelete = (id) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Manage products</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add new product listings and keep pricing information up to date.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[2fr_2fr_1fr_2fr_auto]"
      >
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Product name"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <select
          name="categoryId"
          value={formState.categoryId}
          onChange={handleChange}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Select category</option>
          {categoriesData.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          name="price"
          value={formState.price}
          onChange={handleChange}
          placeholder="Price"
          type="number"
          min="0"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <input
          name="description"
          value={formState.description}
          onChange={handleChange}
          placeholder="Short description"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 md:col-span-2"
        />
        <input
          name="imageUrl"
          value={formState.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 md:col-span-2"
        />
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          {createMutation.isPending ? 'Adding...' : 'Add product'}
        </button>
      </form>
      {createMutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {createMutation.error?.message || 'Unable to create product.'}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-4 text-slate-600" colSpan={4}>
                  Loading products...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-6 py-4 text-rose-600" colSpan={4}>
                  {error?.message || 'Unable to load products.'}
                </td>
              </tr>
            ) : (
              products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4 text-slate-600">
                  {product.category?.name ||
                    categoriesData.find((category) => category.id === product.categoryId)?.name ||
                    'Uncategorized'}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
                  >
                    {deleteMutation.isPending ? 'Removing...' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminProductsPage

