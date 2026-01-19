import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory, deleteCategory, fetchCategories } from '../../api/categories'

function AdminCategoriesPage() {
  const [newCategory, setNewCategory] = useState('')
  const queryClient = useQueryClient()
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const handleAdd = (event) => {
    event.preventDefault()
    const value = newCategory.trim()
    if (!value) {
      return
    }
    if (categoriesData.some((category) => category.name.toLowerCase() === value.toLowerCase())) {
      return
    }
    createMutation.mutate({ name: value })
    setNewCategory('')
  }

  const handleRemove = (id) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Manage categories</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create and organize category groupings for the catalog.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
      >
        <input
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          {createMutation.isPending ? 'Adding...' : 'Add category'}
        </button>
      </form>
      {createMutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {createMutation.error?.message || 'Unable to add category.'}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading categories...
          </div>
        ) : (
          categoriesData.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Category
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{category.name}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(category.id)}
              className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </button>
          </div>
        ))
        )}
      </div>
    </div>
  )
}

export default AdminCategoriesPage

