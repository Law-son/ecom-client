import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logoutUser } from '../api/auth'
import useCartStore from '../store/cartStore'
import useSessionStore from '../store/sessionStore'
import { clearAllTokens } from '../utils/tokenStorage'

const primaryLinks = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Orders' },
]

const adminLinks = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/reviews', label: 'Reviews' },
]

const baseLink =
  'rounded-full px-3 py-1.5 text-sm font-medium transition hover:text-indigo-600'

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, role, logout } = useSessionStore()
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  )
  const normalizedRole = role ? role.toString().toLowerCase() : null
  const showCustomerLinks = !normalizedRole || normalizedRole === 'customer'
  const showAdminLinks = normalizedRole === 'admin' || normalizedRole === 'staff'

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAllTokens()
      logout()
      navigate('/login', { replace: true })
    }
  }

  const navClass = ({ isActive }) =>
    `${baseLink} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white">
              SE
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Smart E-Commerce
              </p>
              <p className="text-lg font-semibold text-slate-900">Client Hub</p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
            {showCustomerLinks &&
              primaryLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.to === '/cart' && cartCount > 0 && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              ))}
            {showCustomerLinks && showAdminLinks && <span className="mx-2 h-6 w-px bg-slate-200" />}
            {showAdminLinks &&
              adminLinks.slice(0, 3).map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:inline-flex">
              {normalizedRole ? `${normalizedRole} mode` : 'Guest'}
            </span>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-600 sm:inline-flex"
              >
                Log out
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 sm:inline-flex"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:inline-flex"
                >
                  Sign up
                </NavLink>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label="Toggle navigation menu"
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 bg-slate-50 px-4 py-4 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {showCustomerLinks &&
                primaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={navClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {link.to === '/cart' && cartCount > 0 && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {cartCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                ))}
              {showAdminLinks && (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Admin
                  </p>
                  {adminLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={navClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout()
                      setMenuOpen(false)
                    }}
                    className="flex-1 rounded-full border border-rose-200 px-4 py-2 text-center text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50"
                  >
                    Log out
                  </button>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      Log in
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign up
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 lg:px-8">
        <aside className="sticky top-8 hidden h-fit w-60 flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:block">
          {showCustomerLinks && (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Customer
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {primaryLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={navClass}>
                    <span className="flex items-center gap-2">
                      {link.label}
                      {link.to === '/cart' && cartCount > 0 && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {cartCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
          {showAdminLinks && (
            <div className={showCustomerLinks ? 'mt-6' : ''}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {adminLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={navClass}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="flex-1">
          <Outlet />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row lg:px-8">
          <p>© 2026 Smart E-Commerce. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              API: http://localhost:8080
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              Light Theme
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

