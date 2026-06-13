import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import styles from './CheckoutPage.module.css'

export type Order = {
  fullName: string
  postalCode: string
  total: number
}

export default function CheckoutPage() {
  const { total, items, dispatch } = useCart()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [postalCodeError, setPostalCodeError] = useState('')

  // Redirect to cart if empty
  if (items.length === 0) {
    navigate('/cart', { replace: true })
    return null
  }

  function validate(): boolean {
    let valid = true
    if (fullName.trim() === '') {
      setFullNameError('Vui lòng nhập họ tên.')
      valid = false
    } else {
      setFullNameError('')
    }
    if (postalCode.trim() === '') {
      setPostalCodeError('Vui lòng nhập mã bưu chính.')
      valid = false
    } else {
      setPostalCodeError('')
    }
    return valid
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const order: Order = { fullName: fullName.trim(), postalCode: postalCode.trim(), total }
    dispatch({ type: 'CLEAR' })
    navigate('/confirmation', { state: { order } })
  }

  return (
    <div data-testid="checkout-page">
      <Header />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <h1 className={styles.heading}>Thông tin đặt hàng</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="checkout-fullname-input" className={styles.label}>
              Họ tên
            </label>
            <input
              id="checkout-fullname-input"
              data-testid="checkout-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              autoComplete="name"
            />
            {fullNameError && (
              <p data-testid="checkout-fullname-error" className={styles.error} role="alert">
                {fullNameError}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="checkout-postalcode-input" className={styles.label}>
              Mã bưu chính
            </label>
            <input
              id="checkout-postalcode-input"
              data-testid="checkout-postalcode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className={styles.input}
              autoComplete="postal-code"
            />
            {postalCodeError && (
              <p data-testid="checkout-postalcode-error" className={styles.error} role="alert">
                {postalCodeError}
              </p>
            )}
          </div>

          <div className={styles.totalRow}>
            <span>Tổng tiền:</span>
            <span data-testid="checkout-total" className={styles.totalAmount}>
              {formatPrice(total)}
            </span>
          </div>

          <button
            type="submit"
            data-testid="checkout-submit"
            className={`btn btn-primary ${styles.submitBtn}`}
          >
            Đặt hàng
          </button>
        </form>
      </main>
    </div>
  )
}
