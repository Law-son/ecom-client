export const getStockStatus = (quantity) => {
  if (quantity === null || quantity === undefined) {
    return {
      label: 'Stock unavailable',
      className: 'bg-slate-100 text-slate-500',
    }
  }

  if (quantity <= 0) {
    return {
      label: 'Out of stock',
      className: 'bg-rose-50 text-rose-600',
    }
  }

  if (quantity >= 10) {
    return {
      label: 'In stock',
      className: 'bg-emerald-50 text-emerald-600',
    }
  }

  if (quantity <= 5) {
    return {
      label: `${quantity} units left`,
      className: 'bg-amber-50 text-amber-600',
    }
  }

  return {
    label: 'Limited stock',
    className: 'bg-amber-50 text-amber-600',
  }
}

