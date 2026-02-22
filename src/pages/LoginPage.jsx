import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { loginUser } from '../api/auth'
import useCartStore from '../store/cartStore'
import useSessionStore from '../store/sessionStore'
import { decodeJwtPayload } from '../utils/jwt'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Enter at least 6 characters.'),
})

function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useSessionStore((state) => state.login)
  const syncToServer = useCartStore((state) => state.syncToServer)
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useMutation({
    mutationFn: loginUser,
  })

  const errorParam = searchParams.get('error')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    const data = await loginMutation.mutateAsync(values)

    // data: { accessToken, refreshToken, tokenType }
    if (!data.accessToken) {
      throw new Error('Invalid response from server')
    }

    const payload = decodeJwtPayload(data.accessToken)
    if (!payload) throw new Error('Invalid token received')

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

    login(user, role, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType ?? 'Bearer',
      expiresAt: payload.exp ? payload.exp * 1000 : null,
    })

    await syncToServer()
    navigate(role === 'admin' ? '/admin' : '/catalog', { replace: true })
  }

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    window.location.href = `${apiBaseUrl}/oauth2/authorization/google`
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Welcome back
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Log in to your account
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Use the demo credentials to explore customer and admin experiences.
        </p>
      </div>

      {errorParam && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {decodeURIComponent(errorParam)}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Or</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              {...register('email')}
              type="email"
              placeholder="alex@smartshop.com"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {errors.email && (
              <span className="text-xs text-rose-500">{errors.email.message}</span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 pr-16 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-indigo-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500">{errors.password.message}</span>
            )}
          </label>

          {loginMutation.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {loginMutation.error?.message || 'Login failed. Please try again.'}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

