/**
 * Derives stock status from product or explicit inStock/stockQuantity.
 * "In stock" when inStock === true or stockQuantity > 0.
 * "Stock Unavailable" only when inStock === false or stockQuantity === 0.
 * Supports camelCase and snake_case from API; coerce string/number values.
 * @param {object|number} productOrQuantity - Product { inStock, stockQuantity } or numeric quantity (legacy)
 * @param {boolean} [inStock] - Optional; use when first arg is stockQuantity
 */
export const getStockStatus = (productOrQuantity, inStock) => {
  let resolvedInStock
  let resolvedQuantity

  if (typeof productOrQuantity === 'object' && productOrQuantity !== null) {
    const p = productOrQuantity
    resolvedInStock = p.inStock ?? p.in_stock
    resolvedQuantity = p.stockQuantity ?? p.stock_quantity ?? p.stock ?? p.quantity
  } else {
    resolvedQuantity = productOrQuantity
    resolvedInStock = inStock
  }

  const inStockBool =
    resolvedInStock === true ||
    resolvedInStock === 'true' ||
    resolvedInStock === 1
  const quantityNum = resolvedQuantity != null ? Number(resolvedQuantity) : null
  const explicitlyUnavailable =
    resolvedInStock === false ||
    resolvedInStock === 'false' ||
    (quantityNum !== null && !Number.isNaN(quantityNum) && quantityNum === 0)
  const available =
    inStockBool ||
    (quantityNum !== null && !Number.isNaN(quantityNum) && quantityNum > 0)
  // When API sends no stock info, default to "In stock" so we don't show "Stock Unavailable" for every product
  const noInfo = resolvedInStock == null && (resolvedQuantity == null || Number.isNaN(quantityNum))

  if (available || noInfo) {
    return {
      label: 'In stock',
      className: 'bg-emerald-50 text-emerald-600',
    }
  }

  if (explicitlyUnavailable) {
    return {
      label: 'Stock Unavailable',
      className: 'bg-slate-100 text-slate-500',
    }
  }

  return {
    label: 'Stock Unavailable',
    className: 'bg-slate-100 text-slate-500',
  }
}
