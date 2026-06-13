import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { users } from '../data/users'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleLogin(userId: string) {
    login(userId)
    navigate('/products')
  }

  return (
    <div data-testid="login-page" className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>SimpleShop</h1>
        <p className={styles.subtitle}>Chọn tài khoản để đăng nhập</p>
        <div className={styles.userList}>
          {users.map((user) => (
            <button
              key={user.id}
              data-testid={`login-user-${user.id}`}
              className={styles.userBtn}
              onClick={() => handleLogin(user.id)}
            >
              <span className={styles.avatar}>{user.displayName[0]}</span>
              <span>{user.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
