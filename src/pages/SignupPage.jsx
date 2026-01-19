import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createUser } from '../api/users'
import useSessionStore from '../store/sessionStore'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name.'),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm your password.'),
    role: z.enum(['customer', 'admin']),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

function SignupPage() {
  const navigate = useNavigate()
  const login = useSessionStore((state) => state.login)
  const signupMutation = useMutation({
    mutationFn: createUser,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'customer',
    },
  })

  const onSubmit = async (values) => {
    const user = await signupMutation.mutateAsync({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      role: values.role,
    })
    const rawRole = user?.role || values.role
    const normalizedRole = rawRole.toString().toLowerCase()
    const role = normalizedRole === 'admin' ? 'admin' : 'customer'
    const normalizedUser = { ...user, id: user?.id || user?.userId }
    login(normalizedUser, role)
    navigate(role === 'admin' ? '/admin' : '/catalog', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Get started
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Create your Smart E-Commerce account
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Register as a customer to shop, or explore the admin dashboard with demo access.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Full name
            <input
              {...register('fullName')}
              type="text"
              placeholder="Jordan Lee"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {errors.fullName && (
              <span className="text-xs text-rose-500">{errors.fullName.message}</span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email address
            <input
              {...register('email')}
              type="email"
              placeholder="jordan@smartshop.com"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {errors.email && (
              <span className="text-xs text-rose-500">{errors.email.message}</span>
            )}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.password && (
                <span className="text-xs text-rose-500">{errors.password.message}</span>
              )}
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Confirm password
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.confirmPassword && (
                <span className="text-xs text-rose-500">
                  {errors.confirmPassword.message}
                </span>
              )}
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Role
            <select
              {...register('role')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {signupMutation.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
              {signupMutation.error?.message || 'Signup failed. Please try again.'}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || signupMutation.isPending
              ? 'Creating account...'
              : 'Create account'}
          </button>
          <p className="text-sm text-slate-500">
            Already have an account? Head to login.
          </p>
        </div>
      </form>
    </div>
  )
}

export default SignupPage

