import { Link } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { formatCurrency } from '../utils/formatters'

function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCartStore()
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse the catalog and add a few products to get started.
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
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Your cart</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review your items before heading to checkout.
          </p>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
          >
            <img
              src={item.imageUrl || item.image}
              alt={item.name}
              className="h-24 w-24 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {item.category}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                aria-label={`Quantity for ${item.name}`}
                className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 shadow-sm transition hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated tax</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal * 0.08)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 text-base">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(subtotal * 1.08)}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Proceed to checkout
          </Link>
          <button
            type="button"
            onClick={clear}
            className="mt-3 w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-rose-200 hover:text-rose-600"
          >
            Clear cart
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Need help?</h3>
          <p className="mt-2">
            Our support team is available 24/7 to assist with checkout and shipping questions.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default CartPage

