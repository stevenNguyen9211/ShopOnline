import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/products" className={styles.logo}>
          SimpleShop
        </Link>
        <nav className={styles.nav}>
          <span data-testid="header-user-name" className={styles.userName}>
            {user?.displayName}
          </span>
          <Link to="/cart" data-testid="header-cart-link" className={styles.cartLink}>
            Giỏ hàng
            <span data-testid="header-cart-count" className={styles.badge}>
              {count}
            </span>
          </Link>
          <button
            data-testid="header-logout"
            onClick={handleLogout}
            className={`btn btn-secondary ${styles.logoutBtn}`}
          >
            Đăng xuất
          </button>
        </nav>
      </div>
    </header>
  )
}
