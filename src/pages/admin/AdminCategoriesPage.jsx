import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../../api/categories'

function AdminCategoriesPage() {
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const queryClient = useQueryClient()
  const getCategoryId = (category) => category?.id ?? category?.categoryId
  const getCategoryName = (category) => category?.name ?? category?.title ?? ''
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
  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingId(null)
      setEditingName('')
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
    if (!id) return
    deleteMutation.mutate(id)
  }

  const handleEdit = (category) => {
    setEditingId(getCategoryId(category))
    setEditingName(getCategoryName(category))
  }

  const handleUpdate = (id) => {
    const value = editingName.trim()
    if (!value || !id) return
    updateMutation.mutate({ id, name: value })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingName('')
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
      {updateMutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {updateMutation.error?.message || 'Unable to update category.'}
        </div>
      )}
      {deleteMutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {deleteMutation.error?.message || 'Unable to remove category.'}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading categories...
          </div>
        ) : (
          categoriesData.map((category) => {
            const categoryId = getCategoryId(category)
            const categoryName = getCategoryName(category)
            return (
          <div
            key={categoryId}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Category
              </p>
              {editingId === categoryId ? (
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              ) : (
                <p
                  className="mt-2 max-w-[220px] truncate text-lg font-semibold text-slate-900"
                  title={categoryName}
                >
                  {categoryName || 'Untitled category'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingId === categoryId ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdate(categoryId)}
                    aria-label="Save category"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                  >
                    {updateMutation.isPending ? (
                      <span className="text-xs font-semibold uppercase tracking-wide">...</span>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.293a1 1 0 0 1 0 1.414l-7.52 7.52a1 1 0 0 1-1.414 0l-3.267-3.266a1 1 0 1 1 1.414-1.414l2.56 2.559 6.813-6.813a1 1 0 0 1 1.414 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    aria-label="Cancel edit"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    aria-label="Edit category"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M13.586 2.586a2 2 0 0 1 2.828 2.828l-8.25 8.25a1 1 0 0 1-.457.263l-3.25.813a1 1 0 0 1-1.213-1.213l.813-3.25a1 1 0 0 1 .263-.457l8.25-8.25Z" />
                      <path d="M12.75 4.25 15.75 7.25" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(categoryId)}
                    aria-label="Remove category"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                  >
                    {deleteMutation.isPending ? (
                      <span className="text-xs font-semibold uppercase tracking-wide">...</span>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path
                          fillRule="evenodd"
                          d="M8.5 2.75a1 1 0 0 0-1 1v.5H5a1 1 0 0 0 0 2h.5v9a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-9H15a1 1 0 1 0 0-2h-2.5v-.5a1 1 0 0 0-1-1h-3Zm1 3a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1Zm4 1a1 1 0 0 0-2 0v7a1 1 0 1 0 2 0v-7Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )
          })
        )}
      </div>
    </div>
  )
}

export default AdminCategoriesPage

