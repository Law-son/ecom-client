import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { fetchInventory } from '../api/inventory'
import { createReview, fetchReviews } from '../api/reviews'
import { fetchProductById } from '../api/products'
import useCartStore from '../store/cartStore'
import useSessionStore from '../store/sessionStore'
import { formatCurrency } from '../utils/formatters'
import { getStockStatus } from '../utils/stockStatus'

const reviewSchema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(3, 'Add a short headline.'),
  comment: z.string().min(10, 'Share a few details about your experience.'),
})

function ProductDetailsPage() {
  const { id } = useParams()
  const addItem = useCartStore((state) => state.addItem)
  const { user } = useSessionStore()
  const queryClient = useQueryClient()

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    error: productErrorMessage,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  })

  const { data: reviewsData = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviews({ productId: id }),
    enabled: Boolean(id),
  })

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => fetchInventory(id),
    enabled: Boolean(id),
  })

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: user?.name || user?.username || '',
      rating: 5,
      title: '',
      comment: '',
    },
  })

  if (productLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        Loading product...
      </div>
    )
  }

  if (productError || !product) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Product not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          {productErrorMessage?.message || 'Try browsing the catalog to find something similar.'}
        </p>
        <Link
          to="/catalog"
          className="mt-4 inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Back to catalog
        </Link>
      </div>
    )
  }

  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData.items || []
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : product.rating || '0.0'
  const stockQuantity = inventoryData?.quantity ?? inventoryData?.stock
  const stockStatus = getStockStatus(stockQuantity)

  const onSubmit = (values) => {
    const userId = user?.id || user?.userId
    if (!userId) {
      return
    }
    reviewMutation.mutate({
      userId,
      productId: product.id,
      rating: values.rating,
      comment: values.comment,
      metadata: {
        title: values.title,
        reviewer: values.name,
      },
    })
    reset({ name: values.name, rating: 5, title: '', comment: '' })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img
            src={product.imageUrl || product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {product.category?.name || product.category || 'Uncategorized'}
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{product.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-slate-900">
                {formatCurrency(product.price)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {averageRating}★ · {reviews.length || product.reviewCount || 0} reviews
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  inventoryLoading ? 'bg-slate-100 text-slate-500' : stockStatus.className
                }`}
              >
                {inventoryLoading ? 'Checking stock' : stockStatus.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Add to cart
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Delivery highlights</h2>
            <ul className="mt-3 space-y-2">
              <li>Ships in 1-2 business days from our central warehouse.</li>
              <li>30-day returns with pre-paid shipping labels.</li>
              <li>Member rewards available on every purchase.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Customer reviews</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {reviewsLoading ? 'Loading...' : `${reviews.length} new`}
            </span>
          </div>
          {reviewsLoading ? (
            <p className="mt-3 text-sm text-slate-600">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No new reviews yet. Be the first to share your thoughts.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {reviews.map((review, index) => (
                <div key={`${review.reviewer}-${index}`} className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {review.metadata?.title || review.title || 'Review'}
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {review.rating}★
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    by {review.metadata?.reviewer || review.reviewer || 'Customer'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Leave a review</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Your name
              <input
                {...register('name')}
                type="text"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.name && (
                <span className="text-xs text-rose-500">{errors.name.message}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Rating
              <select
                {...register('rating')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
              {errors.rating && (
                <span className="text-xs text-rose-500">{errors.rating.message}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Title
              <input
                {...register('title')}
                type="text"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.title && (
                <span className="text-xs text-rose-500">{errors.title.message}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Review
              <textarea
                {...register('comment')}
                rows={4}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.comment && (
                <span className="text-xs text-rose-500">{errors.comment.message}</span>
              )}
            </label>
            {reviewMutation.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
                {reviewMutation.error?.message || 'Unable to submit review.'}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || reviewMutation.isPending || !(user?.id || user?.userId)}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!user?.id && !user?.userId
                ? 'Log in to review'
                : isSubmitting || reviewMutation.isPending
                  ? 'Submitting...'
                  : 'Submit review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage

