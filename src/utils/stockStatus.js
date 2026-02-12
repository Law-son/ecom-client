/**
 * Derives stock status for display, preferring API-provided fields.
 *
 * The API now returns on products:
 * - stockQuantity: number | null
 * - inStock: boolean (true when stockQuantity > 0)
 * - stockStatus: display string for UI, one of:
 *   "Out of stock", "1 unit in stock", "N units in stock",
 *   "Few units in stock", "In stock"
 *
 * This helper:
 * - Uses product.stockStatus as the primary label when present
 * - Falls back to simple labels based on inStock / stockQuantity when needed
 * - Chooses a badge color based on availability (green when in stock, grey/red when not)
 *
 * @param {object|number} productOrQuantity - Product or numeric quantity (legacy)
 * @param {boolean} [inStock] - Optional; when first arg is stockQuantity
 */
export const getStockStatus = (productOrQuantity, inStock) => {
  let resolvedInStock
  let resolvedQuantity
  let apiLabel

  if (typeof productOrQuantity === 'object' && productOrQuantity !== null) {
    const p = productOrQuantity
    resolvedInStock = p.inStock ?? p.in_stock
    resolvedQuantity = p.stockQuantity ?? p.stock_quantity ?? p.stock ?? p.quantity
    apiLabel = p.stockStatus ?? p.stock_status
  } else {
    resolvedQuantity = productOrQuantity
    resolvedInStock = inStock
  }

  const inStockBool =
    resolvedInStock === true ||
    resolvedInStock === 'true' ||
    resolvedInStock === 1
  const quantityNum = resolvedQuantity != null ? Number(resolvedQuantity) : null

  const available =
    inStockBool ||
    (quantityNum !== null && !Number.isNaN(quantityNum) && quantityNum > 0)

  const explicitlyOut =
    resolvedInStock === false ||
    resolvedInStock === 'false' ||
    (quantityNum !== null && !Number.isNaN(quantityNum) && quantityNum === 0)

  const noInfo =
    resolvedInStock == null &&
    (resolvedQuantity == null || Number.isNaN(quantityNum))

  // Prefer the server-provided display string when available
  const label =
    apiLabel ||
    (explicitlyOut
      ? 'Out of stock'
      : available || noInfo
        ? 'In stock'
        : 'Out of stock')

  const className = available || noInfo
    ? 'bg-emerald-50 text-emerald-600'
    : 'bg-rose-50 text-rose-600'

  return { label, className }
}
