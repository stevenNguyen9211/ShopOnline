import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import { formatPrice } from '../lib/format'
import { calculateShipping, generateOrderId } from '../lib/order'
import styles from './CheckoutPage.module.css'

export type Order = {
  orderId: string
  fullName: string
  email: string
  streetAddress: string
  ward: string
  district: string
  city: string
  phone: string
  postalCode: string
  subtotal: number
  shippingFee: number
  total: number
}

const AVATAR_COLORS: Record<string, string> = {
  'ban-phim-co': '#3B82F6',
  'chuot-khong-day': '#22C55E',
  'tai-nghe-bluetooth': '#A855F7',
  'balo-laptop': '#F97316',
  'binh-giu-nhiet': '#EF4444',
  'den-ban-led': '#EAB308',
}

export default function CheckoutPage() {
  const { total: cartTotal, items, dispatch } = useCart()
  const navigate = useNavigate()

  const subtotal = cartTotal
  const shippingFee = calculateShipping(subtotal)
  const orderTotal = subtotal + shippingFee

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [ward, setWard] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [fullNameError, setFullNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [streetAddressError, setStreetAddressError] = useState('')
  const [wardError, setWardError] = useState('')
  const [districtError, setDistrictError] = useState('')
  const [cityError, setCityError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [postalCodeError, setPostalCodeError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const combinedAddress = [streetAddress, ward, district, city].filter(Boolean).join(', ')

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate('/cart', { replace: true })
    }
  }, [items.length, isSubmitting, navigate])

  if (items.length === 0) return null

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  function validate(): boolean {
    let valid = true

    if (fullName.trim() === '') {
      setFullNameError('Vui lòng nhập họ tên.')
      valid = false
    } else {
      setFullNameError('')
    }

    const emailTrimmed = email.trim()
    if (emailTrimmed === '') {
      setEmailError('Vui lòng nhập email.')
      valid = false
    } else if (!emailTrimmed.includes('@') || emailTrimmed.split('@')[1]?.length === 0) {
      setEmailError('Email không hợp lệ.')
      valid = false
    } else {
      setEmailError('')
    }

    if (streetAddress.trim() === '') {
      setStreetAddressError('Vui lòng nhập số nhà và đường.')
      valid = false
    } else {
      setStreetAddressError('')
    }

    if (ward.trim() === '') {
      setWardError('Vui lòng nhập phường/xã.')
      valid = false
    } else {
      setWardError('')
    }

    if (district.trim() === '') {
      setDistrictError('Vui lòng nhập quận/huyện.')
      valid = false
    } else {
      setDistrictError('')
    }

    if (city.trim() === '') {
      setCityError('Vui lòng nhập tỉnh/thành phố.')
      valid = false
    } else {
      setCityError('')
    }

    const phoneTrimmed = phone.trim()
    if (phoneTrimmed === '') {
      setPhoneError('Vui lòng nhập số điện thoại.')
      valid = false
    } else if (!/^\d+$/.test(phoneTrimmed)) {
      setPhoneError('Số điện thoại chỉ được chứa chữ số.')
      valid = false
    } else {
      setPhoneError('')
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

    setIsSubmitting(true)
    const order: Order = {
      orderId: generateOrderId(),
      fullName: fullName.trim(),
      email: email.trim(),
      streetAddress: streetAddress.trim(),
      ward: ward.trim(),
      district: district.trim(),
      city: city.trim(),
      phone: phone.trim(),
      postalCode: postalCode.trim(),
      subtotal,
      shippingFee,
      total: orderTotal,
    }
    dispatch({ type: 'CLEAR' })
    navigate('/confirmation', { state: { order } })
  }

  return (
    <div data-testid="checkout-page">
      <Header />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <h1 className={styles.heading}>Thông tin đặt hàng</h1>
        <p className={styles.subtitle}>
          Kiểm tra lại đơn hàng và điền thông tin nhận hàng của bạn.
        </p>

        <div className={styles.layout}>
          {/* LEFT: Order Summary + Submit */}
          <section data-testid="checkout-order-summary" className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryHeading}>Đơn hàng của bạn</h2>
              <span className={styles.productBadge}>{totalQuantity} sản phẩm</span>
            </div>

            <ul className={styles.productList}>
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId)
                if (!product) return null
                const letter = product.name.charAt(0).toUpperCase()
                const avatarBg = AVATAR_COLORS[item.productId] ?? '#6B7280'
                return (
                  <li key={item.productId} className={styles.productRow}>
                    <div className={styles.productAvatar} style={{ backgroundColor: avatarBg }}>
                      {letter}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productQty}>Số lượng: {item.quantity}</span>
                    </div>
                    <span className={styles.productPrice}>
                      {formatPrice(product.price * item.quantity)}
                    </span>
                  </li>
                )
              })}
            </ul>

            {combinedAddress && (
              <div className={styles.deliveryAddress}>
                <span className={styles.deliveryAddressLabel}>Địa chỉ giao hàng</span>
                <span className={styles.deliveryAddressText}>{combinedAddress}</span>
              </div>
            )}

            <hr className={styles.divider} />

            <div className={styles.feeRow}>
              <span>Tạm tính</span>
              <span data-testid="checkout-subtotal">{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.feeRow}>
              <span>Phí vận chuyển</span>
              <span
                data-testid="checkout-shipping-fee"
                className={shippingFee === 0 ? styles.freeShipping : undefined}
              >
                {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
              </span>
            </div>

            <div className={styles.totalRow}>
              <span>Tổng tiền</span>
              <span data-testid="checkout-total" className={styles.totalAmount}>
                {formatPrice(orderTotal)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              data-testid="checkout-submit"
              disabled={isSubmitting}
              className={`btn btn-primary ${styles.submitBtn}`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
            <p className={styles.disclaimer}>
              Bằng việc đặt hàng, bạn đồng ý với điều khoản &amp; chính sách của chúng tôi.
            </p>
          </section>

          {/* RIGHT: Delivery Form */}
          <form id="checkout-form" onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formHeader}>
              <span className={styles.formBadge}>1</span>
              <h2 className={styles.formHeading}>Thông tin nhận hàng</h2>
            </div>

            <div className={styles.field}>
              <label htmlFor="checkout-full-name-input" className={styles.label}>
                Họ tên
              </label>
              <input
                id="checkout-full-name-input"
                data-testid="checkout-full-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setFullNameError('')
                }}
                className={styles.input}
                autoComplete="name"
                placeholder="Nguyễn Văn A"
              />
              {fullNameError && (
                <p data-testid="checkout-full-name-error" className={styles.error} role="alert">
                  {fullNameError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="checkout-email-input" className={styles.label}>
                Email
              </label>
              <input
                id="checkout-email-input"
                data-testid="checkout-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                className={styles.input}
                autoComplete="email"
                placeholder="ban@email.com"
              />
              {emailError && (
                <p data-testid="checkout-email-error" className={styles.error} role="alert">
                  {emailError}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="checkout-street-address-input" className={styles.label}>
                Số nhà và đường
              </label>
              <input
                id="checkout-street-address-input"
                data-testid="checkout-street-address"
                type="text"
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value)
                  setStreetAddressError('')
                }}
                className={styles.input}
                autoComplete="address-line1"
                placeholder="123 Đường Láng"
              />
              {streetAddressError && (
                <p
                  data-testid="checkout-street-address-error"
                  className={styles.error}
                  role="alert"
                >
                  {streetAddressError}
                </p>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="checkout-ward-input" className={styles.label}>
                  Phường/Xã
                </label>
                <input
                  id="checkout-ward-input"
                  data-testid="checkout-ward"
                  type="text"
                  value={ward}
                  onChange={(e) => {
                    setWard(e.target.value)
                    setWardError('')
                  }}
                  className={styles.input}
                  placeholder="Láng Thượng"
                />
                {wardError && (
                  <p data-testid="checkout-ward-error" className={styles.error} role="alert">
                    {wardError}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="checkout-district-input" className={styles.label}>
                  Quận/Huyện
                </label>
                <input
                  id="checkout-district-input"
                  data-testid="checkout-district"
                  type="text"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value)
                    setDistrictError('')
                  }}
                  className={styles.input}
                  placeholder="Đống Đa"
                />
                {districtError && (
                  <p data-testid="checkout-district-error" className={styles.error} role="alert">
                    {districtError}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="checkout-city-input" className={styles.label}>
                Tỉnh/Thành phố
              </label>
              <input
                id="checkout-city-input"
                data-testid="checkout-city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setCityError('')
                }}
                className={styles.input}
                autoComplete="address-level1"
                placeholder="Hà Nội"
              />
              {cityError && (
                <p data-testid="checkout-city-error" className={styles.error} role="alert">
                  {cityError}
                </p>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="checkout-phone-input" className={styles.label}>
                  Số điện thoại
                </label>
                <input
                  id="checkout-phone-input"
                  data-testid="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setPhoneError('')
                  }}
                  className={styles.input}
                  autoComplete="tel"
                  placeholder="09xx xxx xxx"
                />
                {phoneError && (
                  <p data-testid="checkout-phone-error" className={styles.error} role="alert">
                    {phoneError}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="checkout-postal-code-input" className={styles.label}>
                  Mã bưu chính
                </label>
                <input
                  id="checkout-postal-code-input"
                  data-testid="checkout-postal-code"
                  type="text"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value)
                    setPostalCodeError('')
                  }}
                  className={styles.input}
                  autoComplete="postal-code"
                  placeholder="700000"
                />
                {postalCodeError && (
                  <p data-testid="checkout-postal-code-error" className={styles.error} role="alert">
                    {postalCodeError}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
