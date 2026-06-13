import { type Product } from '../data/products'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import styles from './ProductCard.module.css'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const { items, dispatch } = useCart()
  const cartItem = items.find((i) => i.productId === product.id)
  const isMaxed = cartItem !== undefined && cartItem.quantity >= 5

  function handleAdd() {
    dispatch({ type: 'ADD', productId: product.id })
  }

  return (
    <article data-testid={`product-card-${product.id}`} className={styles.card}>
      <img
        data-testid="product-image"
        src={product.image}
        alt={product.name}
        className={styles.image}
      />
      <div className={styles.body}>
        <p data-testid="product-name" className={styles.name}>
          {product.name}
        </p>
        <p data-testid="product-price" className={styles.price}>
          {formatPrice(product.price)}
        </p>
        <button
          data-testid="add-to-cart"
          onClick={handleAdd}
          disabled={isMaxed}
          className={`btn btn-primary ${styles.addBtn}`}
        >
          Thêm vào giỏ
        </button>
      </div>
    </article>
  )
}
