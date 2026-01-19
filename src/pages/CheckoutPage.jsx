import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createOrder } from '../api/orders'
import useCartStore from '../store/cartStore'
import useSessionStore from '../store/sessionStore'
import { formatCurrency } from '../utils/formatters'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  address: z.string().min(6, 'Enter your shipping address.'),
  city: z.string().min(2, 'Enter your city.'),
  region: z.string().min(2, 'Enter your state or region.'),
  postalCode: z.string().min(4, 'Enter a valid postal code.'),
})

function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clear } = useCartStore()
  const { user } = useSessionStore()
  const queryClient = useQueryClient()
  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async () => {
    const userId = user?.id || user?.userId
    if (!userId) {
      return
    }
    const payload = {
      userId,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    }
    await orderMutation.mutateAsync(payload)
    clear()
    navigate('/orders', { replace: true })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Nothing to checkout</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add items to your cart before starting checkout.
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
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
          <p className="mt-2 text-sm text-slate-600">
            Confirm your shipping details to place the order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                {...register('fullName')}
                type="text"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.fullName && (
                <span className="text-xs text-rose-500">{errors.fullName.message}</span>
              )}
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                {...register('email')}
                type="email"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.email && (
                <span className="text-xs text-rose-500">{errors.email.message}</span>
              )}
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Address
              <input
                {...register('address')}
                type="text"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.address && (
                <span className="text-xs text-rose-500">{errors.address.message}</span>
              )}
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                City
                <input
                  {...register('city')}
                  type="text"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                {errors.city && (
                  <span className="text-xs text-rose-500">{errors.city.message}</span>
                )}
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                State/Region
                <input
                  {...register('region')}
                  type="text"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                {errors.region && (
                  <span className="text-xs text-rose-500">{errors.region.message}</span>
                )}
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Postal code
                <input
                  {...register('postalCode')}
                  type="text"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                {errors.postalCode && (
                  <span className="text-xs text-rose-500">
                    {errors.postalCode.message}
                  </span>
                )}
              </label>
            </div>
          </div>

          {orderMutation.isError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {orderMutation.error?.message || 'Unable to place order.'}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting || orderMutation.isPending || !user?.id}
            className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {!user?.id
              ? 'Log in to place order'
              : isSubmitting || orderMutation.isPending
                ? 'Placing order...'
                : 'Place order'}
          </button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-3 text-base">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Secure checkout</h3>
          <p className="mt-2">
            Payment details will be handled via the API integration in the next step.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default CheckoutPage

