import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { findByCredentials } from '../data/users'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    const user = findByCredentials(username, password)
    if (!user) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng')
      return
    }
    login(user.id)
    navigate('/products')
  }

  return (
    <div data-testid="login-page" className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>SimpleShop</h1>
        <p className={styles.subtitle}>Đăng nhập để tiếp tục</p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="login-username" className={styles.label}>
              Tên đăng nhập
            </label>
            <input
              id="login-username"
              data-testid="login-username"
              type="text"
              className={`${styles.input}${error ? ` ${styles.inputError}` : ''}`}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null) }}
              autoComplete="username"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="login-password" className={styles.label}>
              Mật khẩu
            </label>
            <input
              id="login-password"
              data-testid="login-password"
              type="password"
              className={`${styles.input}${error ? ` ${styles.inputError}` : ''}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p data-testid="login-error" className={styles.errorMsg}>
              {error}
            </p>
          )}
          <button data-testid="login-submit" type="submit" className={styles.submitBtn}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}
