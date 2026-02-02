import { useState } from 'react'
import apiClient from '../api/client'

const graphqlProductsQuery = `
  query Products($page: Int, $size: Int) {
    products(page: $page, size: $size) {
      items {
        id
        name
        stockQuantity
        inStock
        category { id name }
      }
      content {
        id
        name
        stockQuantity
        inStock
        category { id name }
      }
      totalElements
    }
  }
`

function DebugApiPage() {
  const [restResponse, setRestResponse] = useState(null)
  const [graphqlResponse, setGraphqlResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchResponses = async () => {
    setLoading(true)
    setError(null)
    setRestResponse(null)
    setGraphqlResponse(null)

    try {
      // Raw REST: full axios response body
      const restRes = await apiClient.get('/api/products', { params: { page: 0, size: 5 } })
      setRestResponse(restRes.data)

      // Raw GraphQL: full response (data + errors) from axios
      const gqlRes = await apiClient.post('/graphql', {
        query: graphqlProductsQuery,
        variables: { page: 0, size: 5 },
      })
      setGraphqlResponse(gqlRes.data)
    } catch (err) {
      const message = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">API response debug</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fetches products (REST and GraphQL) with your current session and shows the raw response.
          Check that <code className="rounded bg-slate-100 px-1">stockQuantity</code> and{' '}
          <code className="rounded bg-slate-100 px-1">inStock</code> are present and correct.
        </p>
        <button
          type="button"
          onClick={fetchResponses}
          disabled={loading}
          className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-70"
        >
          {loading ? 'Fetching…' : 'Fetch products (REST + GraphQL)'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-sm font-semibold text-rose-800">Error</h2>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-rose-700">
            {error}
          </pre>
        </div>
      )}

      {restResponse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">REST GET /api/products</h2>
          <pre className="mt-2 max-h-[400px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
            {JSON.stringify(restResponse, null, 2)}
          </pre>
        </div>
      )}

      {graphqlResponse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">GraphQL POST /graphql (products)</h2>
          <pre className="mt-2 max-h-[400px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
            {JSON.stringify(graphqlResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DebugApiPage
