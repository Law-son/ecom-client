import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import CartPage from './pages/CartPage'
import CatalogPage from './pages/CatalogPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import SignupPage from './pages/SignupPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/catalog" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/products" element={<AdminProductsPage />} />
          <Route path="admin/categories" element={<AdminCategoriesPage />} />
          <Route path="admin/orders" element={<AdminOrdersPage />} />
          <Route path="admin/inventory" element={<AdminInventoryPage />} />
          <Route path="admin/reviews" element={<AdminReviewsPage />} />
        </Route>
        <Route path="*" element={<PlaceholderPage title="Page Not Found" description="We could not find the page you requested." />} />
      </Route>
    </Routes>
  )
}

export default App
