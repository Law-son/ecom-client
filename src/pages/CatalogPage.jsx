import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../api/categories'
import { fetchProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import useCartStore from '../store/cartStore'

const pageSize = 12

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
]

function CatalogPage() {
  const addItem = useCartStore((state) => state.addItem)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['products', { search, category, sort, page }],
    queryFn: () => {
      const params = {
        page: page - 1,
        size: pageSize,
        limit: pageSize,
        perPage: pageSize,
      }

      if (search.trim()) {
        params.search = search.trim()
      }
      if (category !== 'all') {
        params.categoryId = category
      }
      if (sort === 'price-asc') {
        params.sortBy = 'price'
        params.sortDir = 'asc'
      }
      if (sort === 'price-desc') {
        params.sortBy = 'price'
        params.sortDir = 'desc'
      }
      if (sort === 'rating-desc') {
        params.sortBy = 'rating'
        params.sortDir = 'desc'
      }

      return fetchProducts(params)
    },
  })

  const normalizedProducts = useMemo(() => {
    if (!productsData) return []
    if (Array.isArray(productsData)) return productsData
    return productsData.content || productsData.items || []
  }, [productsData])

  const totalProducts = useMemo(() => {
    if (!productsData || Array.isArray(productsData)) return normalizedProducts.length
    return (
      productsData.totalElements ||
      productsData.totalItems ||
      productsData.total ||
      productsData.totalCount ||
      productsData.count ||
      productsData.meta?.total ||
      productsData.pagination?.total ||
      normalizedProducts.length
    )
  }, [productsData, normalizedProducts.length])

  const categoryMap = useMemo(() => {
    const map = {}
    categoriesData.forEach((item) => {
      map[item.id] = item.name
    })
    return map
  }, [categoriesData])

  const categories = useMemo(
    () => [{ id: 'all', name: 'All Categories' }, ...categoriesData],
    [categoriesData],
  )

  const totalPages = useMemo(() => {
    if (!productsData || Array.isArray(productsData)) {
      return Math.max(1, Math.ceil(totalProducts / pageSize))
    }
    return (
      productsData.totalPages ||
      productsData.pageCount ||
      productsData.meta?.totalPages ||
      productsData.pagination?.totalPages ||
      Math.max(1, Math.ceil(totalProducts / pageSize))
    )
  }, [productsData, totalProducts])
  const pagedProducts = normalizedProducts.map((product) => ({
    ...product,
    category:
      product.category?.name ||
      categoryMap[product.categoryId] ||
      product.category ||
      'Uncategorized',
    image: product.imageUrl || product.image,
  }))

  const handleAddToCart = (product) => {
    addItem(product, 1)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Customer catalog
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Explore what is new
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Search curated collections, filter by category, and sort by the best
              experiences.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search products"
              aria-label="Search products"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setPage(1)
              }}
              aria-label="Filter by category"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort products"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Loading products...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
          {error?.message || 'Unable to load products.'}
        </div>
      ) : pagedProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No products match your search yet. Try another keyword or reset filters.
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pagedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <span>
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalProducts)} of {totalProducts}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Prev
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CatalogPage

