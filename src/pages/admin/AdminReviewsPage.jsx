import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../../api/products'
import { fetchReviews } from '../../api/reviews'

function AdminReviewsPage() {
  const { data: reviewsData, isLoading, isError, error } = useQuery({
    queryKey: ['reviews', 'admin'],
    queryFn: fetchReviews,
  })
  const { data: productsData } = useQuery({
    queryKey: ['products', 'reviews'],
    queryFn: () => fetchProducts({ page: 0, size: 100 }),
  })

  const reviews = Array.isArray(reviewsData)
    ? reviewsData
    : reviewsData?.items || reviewsData?.content || []
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
        </div>
      )}
    </div>
  )
}

export default AdminReviewsPage

