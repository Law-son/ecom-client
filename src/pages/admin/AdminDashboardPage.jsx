import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../../api/categories'
import { fetchOrders } from '../../api/orders'
import { fetchProducts } from '../../api/products'
import { fetchReviews } from '../../api/reviews'

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
  const categories = categoriesData || []
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.content || ordersData?.items || []
  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.items || []

  const stats = [
    { label: 'Products', value: productTotal },
    { label: 'Categories', value: categories.length },
    { label: 'Orders', value: orders.length },
    { label: 'New Reviews', value: reviews.length },
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
            <p className="mt-2 text-sm text-slate-500">Updated just now</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Operational checklist</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Review inventory alerts for top-selling categories.</li>
            <li>Prioritize orders awaiting fulfillment.</li>
            <li>Monitor new reviews for moderation requests.</li>
            <li>Sync catalog updates with marketing campaigns.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
          <p className="mt-3 text-sm text-slate-600">
            This dashboard will pull live metrics once the API layer is connected. For now,
            use it as a staging area for admin workflow layouts.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage

