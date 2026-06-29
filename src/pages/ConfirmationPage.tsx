import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/Header'
import { formatPrice } from '../lib/format'
import { type Order } from './CheckoutPage'
import styles from './ConfirmationPage.module.css'

type LocationState = { order: Order } | null

export default function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState) ?? null
  const order = state?.order ?? null

  useEffect(() => {
    if (!order) {
      navigate('/products', { replace: true })
    }
  }, [order, navigate])

  if (!order) return null

  return (
    <div data-testid="checkout-success">
      <Header />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <div className={styles.card}>
          <div className={styles.icon}>✓</div>
          <p className={styles.message}>
            Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại SimpleShop.
          </p>
          <div className={styles.detail}>
            <span>
              Mã đơn hàng:{' '}
              <span data-testid="checkout-success-order-id" className={styles.orderId}>
                {order.orderId}
              </span>
            </span>
          </div>
          <p className={styles.totalLabel}>
            Tổng tiền đã thanh toán:{' '}
            <span data-testid="checkout-success-total" className={styles.totalAmount}>
              {formatPrice(order.total)}
            </span>
          </p>
          <Link
            to="/products"
            data-testid="confirmation-back-to-products"
            className={`btn btn-primary ${styles.backBtn}`}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    </div>
  )
}
