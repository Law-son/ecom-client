import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useSessionStore from '../store/sessionStore'
import { decodeJwtPayload } from '../utils/jwt'
import { setAccessToken, setRefreshToken } from '../utils/tokenStorage'

function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useSessionStore((state) => state.login)
  const syncToServer = useCartStore((state) => state.syncToServer)

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=' + encodeURIComponent(error), { replace: true })
      return
    }

    if (!accessToken) {
      navigate('/login', { replace: true })
      return
    }

    const payload = decodeJwtPayload(accessToken)
    if (!payload) {
      navigate('/login?error=Invalid token', { replace: true })
      return
    }

    const rawRole = payload.role || 'CUSTOMER'
    const normalizedRole = rawRole.toString().toUpperCase()
    const role = normalizedRole === 'ADMIN' || normalizedRole === 'STAFF' ? 'admin' : 'customer'

    const user = {
      id: payload.userId,
      userId: payload.userId,
      email: payload.sub,
      fullName: payload.fullName ?? null,
      lastLogin: payload.lastLogin ?? null,
    }

    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    login(user, role, {
      accessToken,
      tokenType: 'Bearer',
      expiresAt: payload.exp ? payload.exp * 1000 : null,
    })

    syncToServer().catch(() => {})

    navigate(role === 'admin' ? '/admin' : '/catalog', { replace: true })
  }, [searchParams, navigate, login, syncToServer])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p className="mt-4 text-sm text-slate-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default OAuth2RedirectPage
