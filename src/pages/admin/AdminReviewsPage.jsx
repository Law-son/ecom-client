import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { fetchProducts } from '../../api/products'
import { fetchReviews } from '../../api/reviews'

function AdminReviewsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 8
  const { data: reviewsData, isLoading, isError, error } = useQuery({
    queryKey: ['reviews', 'admin', page],
    queryFn: () =>
      fetchReviews({
        page: page - 1,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
      }),
  })
  const { data: productsData } = useQuery({
    queryKey: ['products', 'reviews'],
    queryFn: () => fetchProducts({ page: 0, size: 100 }),
  })

  const reviews = useMemo(() => {
    if (!reviewsData) return []
    if (Array.isArray(reviewsData)) return reviewsData
    return reviewsData.items || reviewsData.content || []
  }, [reviewsData])
  const totalReviews = useMemo(() => {
    if (!reviewsData || Array.isArray(reviewsData)) return reviews.length
    return reviewsData.totalElements ?? reviewsData.total ?? reviews.length
  }, [reviewsData, reviews.length])
  const totalPages = useMemo(() => {
    if (!reviewsData || Array.isArray(reviewsData)) {
      return Math.max(1, Math.ceil(totalReviews / pageSize))
    }
    return reviewsData.totalPages ?? Math.max(1, Math.ceil(totalReviews / pageSize))
  }, [reviewsData, totalReviews])
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.items || productsData?.content || []
  const productLookup = products.reduce((acc, product) => {
    acc[product.id] = product
    return acc
  }, {})

  const displayReviews = reviews.map((review) => ({
    ...review,
    productName: productLookup[review.productId]?.name || 'Unknown product',
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Review moderation</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor newly submitted reviews across the catalog.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading reviews...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
          {error?.message || 'Unable to load reviews.'}
        </div>
      ) : displayReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No new reviews have been submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {displayReviews.map((review, index) => (
            <div
              key={`${review.productId}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {review.productName}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {review.metadata?.title || review.title || 'Review'}
                  </h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  {review.rating}★
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
              <p className="mt-3 text-xs text-slate-400">
                Submitted by {review.metadata?.reviewer || review.reviewer || 'Customer'}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <span>
              Showing {totalReviews === 0 ? 0 : (page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalReviews)} of {totalReviews}
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
        </div>
      )}
    </div>
  )
}

export default AdminReviewsPage

