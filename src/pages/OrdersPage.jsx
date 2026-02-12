import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchOrders, updateOrderStatus } from '../api/orders'
import { fetchProducts } from '../api/products'
import useSessionStore from '../store/sessionStore'
import { formatCurrency } from '../utils/formatters'

function OrdersPage() {
  const { user } = useSessionStore()
  const userId = user?.id || user?.userId
  const queryClient = useQueryClient()
  const { data: ordersData, isLoading, isError, error } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchOrders({ userId }),
    enabled: Boolean(userId),
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', userId] })
    },
  })

  const { data: productsData } = useQuery({
    queryKey: ['products', 'lookup'],
    queryFn: () => fetchProducts({ page: 0, size: 100 }),
  })

  const orders = Array.isArray(ordersData)
    ? ordersData
    : ordersData?.content || ordersData?.items || []
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.content || productsData?.items || []
  const productMap = products.reduce((acc, product) => {
    acc[product.id] = product
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading orders...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 shadow-sm">
        {error?.message || 'Unable to load orders.'}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">No orders yet</h1>
        <p className="mt-2 text-sm text-slate-600">
          Complete a checkout to see your order history here.
        </p>
        <Link
          to="/catalog"
          className="mt-5 inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Browse catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Order history</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review your past purchases, totals, and statuses.
        </p>
      </div>

      {statusMutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {statusMutation.error?.message ?? 'Failed to update order status.'}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const status = order.status || 'Pending'
          const normalizedStatus = status.toString().toLowerCase()
          const canMarkReceived = normalizedStatus === 'delivered'
          return (
          <div
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : 'Recent'}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Order {order.id}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                  {status}
                </span>
                {canMarkReceived && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !window.confirm(
                          'Mark this order as received? This action cannot be undone.',
                        )
                      ) {
                        return
                      }
                      statusMutation.mutate({
                        id: order.id,
                        status: 'RECEIVED',
                      })
                    }}
                    disabled={statusMutation.isPending}
                    className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {statusMutation.isPending ? 'Updating…' : 'Mark received'}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {order.items.map((item) => {
                const product = productMap[item.productId] || {}
                const name =
                  item.productName || product.name || item.name || 'Item'
                const price =
                  item.priceAtTime ?? product.price ?? item.price ?? 0
                return (
                  <div key={item.productId} className="flex items-center justify-between">
                    <span>
                      {name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(price * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="text-slate-500">
                Shipping to {order.shipping?.city || order.shippingCity || 'N/A'}
              </span>
              <span className="text-base font-semibold text-slate-900">
                {formatCurrency(order.totalAmount ?? order.total ?? 0)}
              </span>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

export default OrdersPage

