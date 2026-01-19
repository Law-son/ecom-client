import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories } from '../../api/categories'
import { adjustInventory, fetchInventory } from '../../api/inventory'
import { fetchProducts } from '../../api/products'

function AdminInventoryPage() {
  const [inventory, setInventory] = useState([])
  const queryClient = useQueryClient()
  const { data: productsData } = useQuery({
    queryKey: ['products', 'inventory'],
    queryFn: () => fetchProducts({ page: 0, size: 100 }),
  })
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.content || productsData?.items || []
  const categoryMap = categoriesData.reduce((acc, category) => {
    acc[category.id] = category.name
    return acc
  }, {})
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', products.length],
    queryFn: async () => {
      const results = await Promise.all(
        products.map(async (product) => {
          const data = await fetchInventory(product.id)
          return {
            id: product.id,
            name: product.name,
            category:
              product.category?.name ||
              categoryMap[product.categoryId] ||
              product.category ||
              'Uncategorized',
            sku: product.sku || product.id,
            stock: data?.quantity ?? data?.stock ?? 0,
          }
        }),
      )
      return results
    },
    enabled: products.length > 0,
  })
  const adjustMutation = useMutation({
    mutationFn: adjustInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  useEffect(() => {
    if (inventoryData) {
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
    } else {
      setInventory([])
    }
  }, [inventoryData])

  const updateStock = (id, value) => {
    const quantity = Number(value)
    if (Number.isNaN(quantity)) return
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: Math.max(0, quantity) } : item)),
    )
  }

  const saveStock = (id, stock) => {
    adjustMutation.mutate({ productId: id, quantity: stock })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
        <p className="mt-2 text-sm text-slate-600">
          Adjust stock levels and monitor SKU availability.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Stock</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-4 text-slate-600" colSpan={4}>
                  Loading inventory...
                </td>
              </tr>
            ) : Array.isArray(inventory) && inventory.length > 0 ? (
              inventory.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-6 py-4 text-slate-600">{item.sku}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                <td className="px-6 py-4 text-slate-600">{item.category}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(event) => updateStock(item.id, event.target.value)}
                    onBlur={() => saveStock(item.id, item.stock)}
                    aria-label={`Stock level for ${item.name}`}
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-slate-600" colSpan={4}>
                  No inventory records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {adjustMutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {adjustMutation.error?.message || 'Unable to update inventory.'}
        </div>
      )}
    </div>
  )
}

export default AdminInventoryPage

