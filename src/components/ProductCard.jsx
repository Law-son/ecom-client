import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchInventory } from '../api/inventory'
import { formatCurrency } from '../utils/formatters'
import { getStockStatus } from '../utils/stockStatus'

function ProductCard({ product, onAddToCart }) {
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory', product.id],
    queryFn: () => fetchInventory(product.id),
    enabled: Boolean(product.id),
  })
  const stockQuantity = inventoryData?.quantity ?? inventoryData?.stock
  const stockStatus = getStockStatus(stockQuantity)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden">
        <img
          src={product.imageUrl || product.image}
          alt={product.name}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {product.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-slate-500">
              {product.rating ? `${product.rating}★ · ` : ''}
              {product.reviewCount ?? 0} reviews
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                inventoryLoading ? 'bg-slate-100 text-slate-500' : stockStatus.className
              }`}
            >
              {inventoryLoading ? 'Checking stock' : stockStatus.label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

