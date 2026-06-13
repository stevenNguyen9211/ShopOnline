import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function RedirectIfLoggedIn({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <Navigate to="/products" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/products"
          element={
            <RequireAuth>
              <ProductsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/confirmation"
          element={
            <RequireAuth>
              <ConfirmationPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
