import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../../api/categories'
import { fetchOrders } from '../../api/orders'
import { fetchProducts } from '../../api/products'
import { fetchReviews } from '../../api/reviews'
import { formatCurrency } from '../../utils/formatters'

function AdminDashboardPage() {
  const { data: productsData } = useQuery({
    queryKey: ['products', 'admin-dashboard'],
    queryFn: () => fetchProducts({ page: 0, size: 100 }),
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  const { data: ordersData } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => fetchOrders({ page: 0, size: 50 }),
  })
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'admin'],
    queryFn: fetchReviews,
  })

  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.content || productsData?.items || []
  const productTotal = Array.isArray(productsData)
    ? productsData.length
    : productsData?.totalElements ||
      productsData?.total ||
      productsData?.count ||
      products.length
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.content || categoriesData?.items || []
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.content || ordersData?.items || []
  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.items || []

  const categoryLookup = categories.reduce((acc, category) => {
    const key = category?.id ?? category?.categoryId
    if (key) acc[key] = category.name
    return acc
  }, {})

  const categoryCounts = products.reduce((acc, product) => {
    const label =
      product.category?.name ||
      categoryLookup[product.categoryId] ||
      product.category ||
      'Uncategorized'
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  const topCategoryLabel = topCategoryEntry
    ? `${topCategoryEntry[0]} (${topCategoryEntry[1]})`
    : 'No data yet'

  const getOrderTotal = (order) => {
    const value =
      order?.total ??
      order?.totalAmount ??
      order?.amount ??
      order?.orderTotal ??
      order?.totalPrice ??
      order?.grandTotal ??
      0
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : 0
  }

  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0)
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0

  const fulfilledStatuses = new Set(['fulfilled', 'completed', 'delivered', 'shipped'])
  const blockedStatuses = new Set(['cancelled', 'canceled', 'refunded', 'failed'])
  const fulfilledCount = orders.filter((order) =>
    fulfilledStatuses.has(order?.status?.toString().toLowerCase()),
  ).length
  const pendingCount = orders.filter((order) => {
    const status = order?.status?.toString().toLowerCase()
    if (!status) return true
    return !fulfilledStatuses.has(status) && !blockedStatuses.has(status)
  }).length
  const fulfillmentRate = orders.length ? Math.round((fulfilledCount / orders.length) * 100) : 0

  const reviewAverage = reviews.length
    ? reviews.reduce((sum, review) => {
        const value = review?.rating ?? review?.score ?? review?.stars ?? 0
        const numeric = Number(value)
        return sum + (Number.isFinite(numeric) ? numeric : 0)
      }, 0) / reviews.length
    : 0

  const stats = [
    { label: 'Products', value: productTotal, detail: `Top category: ${topCategoryLabel}` },
    { label: 'Categories', value: categories.length, detail: `${products.length} listings total` },
    { label: 'Orders', value: orders.length, detail: `${fulfilledCount} fulfilled` },
    {
      label: 'Reviews',
      value: reviews.length,
      detail: `Avg rating ${reviewAverage ? reviewAverage.toFixed(1) : '0.0'}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Snapshot of store activity and operational highlights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Revenue snapshot</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Total revenue</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average order value</span>
              <span className="font-semibold text-slate-900">{formatCurrency(avgOrderValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending orders</span>
              <span className="font-semibold text-slate-900">{pendingCount}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Store health</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Fulfillment rate</span>
              <span className="font-semibold text-slate-900">{fulfillmentRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Top category</span>
              <span className="font-semibold text-slate-900">{topCategoryLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average rating</span>
              <span className="font-semibold text-slate-900">
                {reviewAverage ? reviewAverage.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage

