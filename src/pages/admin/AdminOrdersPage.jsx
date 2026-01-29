import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchOrders, updateOrderStatus } from '../../api/orders'
import { fetchUsers } from '../../api/users'
import { formatCurrency } from '../../utils/formatters'

const STATUS_OPTIONS = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const { data: ordersData, isLoading, isError, error } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => fetchOrders({ page: 0, size: 100 }),
  })
  const { data: usersData } = useQuery({
    queryKey: ['users', 'admin-orders'],
    queryFn: fetchUsers,
  })
  const orders = Array.isArray(ordersData)
    ? ordersData
    : ordersData?.content || ordersData?.items || []
  const users = Array.isArray(usersData) ? usersData : usersData?.items || usersData?.content || []
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {})
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] })
    },
  })

  const formatDate = (value) => {
    if (!value) return 'Unknown'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown'
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track all customer orders and fulfillment status.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading orders...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
          {error?.message || 'Unable to load orders.'}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No orders yet. Place a test order to populate the list.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const rawStatus = order.status?.toString().toUpperCase()
                const normalizedStatus = rawStatus === 'PROCESSING' ? 'PENDING' : rawStatus || 'PENDING'
                return (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {userMap[order.userId]?.fullName ||
                      userMap[order.userId]?.name ||
                      order.userId ||
                      'Customer'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {(order.items || [])
                      .map((item) => {
                        const name =
                          item.productName ||
                          item.product?.name ||
                          item.name ||
                          item.productTitle ||
                          'Item'
                        const quantity = item.quantity || 0
                        const price = item.priceAtTime ?? 0
                        return `${name} × ${quantity} @ ${formatCurrency(price)}`
                      })
                      .join(', ')}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatCurrency(order.totalAmount || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={normalizedStatus}
                      onChange={(event) =>
                        statusMutation.mutate({
                          id: order.id,
                          status: event.target.value,
                        })
                      }
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage

