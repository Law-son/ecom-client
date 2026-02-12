import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const login = useSessionStore((state) => state.login)
  const syncToServer = useCartStore((state) => state.syncToServer)
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useMutation({
    mutationFn: loginUser,
  })

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

    // data can be object { id, fullName, email, role, accessToken, tokenType, expiresAt } or raw JWT string
    if (typeof data === 'object' && data !== null && data.accessToken) {
      const rawRole = data.role || 'CUSTOMER'
      const role = rawRole.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'customer'
      const user = {
        id: data.id ?? data.userId,
        userId: data.userId ?? data.id,
        email: data.email ?? data.sub,
        fullName: data.fullName ?? null,
        lastLogin: data.lastLogin ?? null,
      }
      login(user, role, {
        accessToken: data.accessToken,
        tokenType: data.tokenType ?? 'Bearer',
        expiresAt: data.expiresAt ?? null,
      })
      await syncToServer()
      navigate(role === 'admin' ? '/admin' : '/catalog', { replace: true })
      return
    }

    const payload = decodeJwtPayload(data)
    if (!payload) throw new Error('Invalid token received')

    const rawRole = payload.role || 'CUSTOMER'
    const role = rawRole.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'customer'
    const user = {
      id: payload.userId,
      userId: payload.userId,
      email: payload.sub,
      fullName: payload.fullName ?? null,
      lastLogin: payload.lastLogin ?? null,
    }
    login(user, role, {
      accessToken: data,
      tokenType: 'Bearer',
      expiresAt: payload.exp ? payload.exp * 1000 : null,
    })
    await syncToServer()
    navigate(role === 'admin' ? '/admin' : '/catalog', { replace: true })
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5">
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
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Log in'}
          </button>
          <p className="text-sm text-slate-500">
            Use your account credentials to access customer or admin routes.
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginPage

