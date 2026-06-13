import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import { formatPrice } from '../lib/format'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, total, dispatch } = useCart()
  const navigate = useNavigate()
  const isEmpty = items.length === 0

  function handleCheckout() {
    navigate('/checkout')
  }

  return (
    <div data-testid="cart-page">
      <Header />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <h1 className={styles.heading}>Giỏ hàng</h1>

        {isEmpty ? (
          <p data-testid="cart-empty-message" className={styles.empty}>
            Giỏ hàng của bạn đang trống.
          </p>
        ) : (
          <div className={styles.itemList}>
            {items.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null
              const subtotal = product.price * item.quantity
              return (
                <div
                  key={item.productId}
                  data-testid={`cart-item-${item.productId}`}
                  className={styles.item}
                >
                  <img src={product.image} alt={product.name} className={styles.itemImage} />
                  <div className={styles.itemInfo}>
                    <p data-testid="cart-item-name" className={styles.itemName}>
                      {product.name}
                    </p>
                    <p data-testid="cart-item-unit-price" className={styles.itemPrice}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className={styles.itemControls}>
                    <button
                      data-testid="cart-item-decrease"
                      onClick={() => dispatch({ type: 'DECREASE', productId: item.productId })}
                      disabled={item.quantity <= 1}
                      className={`btn btn-secondary ${styles.qtyBtn}`}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span data-testid="cart-item-quantity" className={styles.qty}>
                      {item.quantity}
                    </span>
                    <button
                      data-testid="cart-item-increase"
                      onClick={() => dispatch({ type: 'INCREASE', productId: item.productId })}
                      disabled={item.quantity >= 5}
                      className={`btn btn-secondary ${styles.qtyBtn}`}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <p data-testid="cart-item-subtotal" className={styles.itemSubtotal}>
                    {formatPrice(subtotal)}
                  </p>
                  <button
                    data-testid="cart-item-remove"
                    onClick={() => dispatch({ type: 'REMOVE', productId: item.productId })}
                    className={`btn btn-danger ${styles.removeBtn}`}
                  >
                    Xóa
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.footer}>
          <p className={styles.total}>
            Tổng cộng:{' '}
            <span data-testid="cart-total" className={styles.totalAmount}>
              {formatPrice(total)}
            </span>
          </p>
          <button
            data-testid="cart-checkout"
            onClick={handleCheckout}
            disabled={isEmpty}
            className={`btn btn-primary ${styles.checkoutBtn}`}
          >
            Thanh toán
          </button>
        </div>
      </main>
    </div>
  )
}
