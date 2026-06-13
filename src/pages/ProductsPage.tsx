import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import styles from './ProductsPage.module.css'

export default function ProductsPage() {
  return (
    <div data-testid="products-page">
      <Header />
      <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <h1 className={styles.heading}>Sản phẩm</h1>
        <div data-testid="products-grid" className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  )
}
