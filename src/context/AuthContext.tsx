/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { type User } from '../data/users'
import { KEYS, storageGet, storageRemove, storageSet } from '../lib/storage'

type SessionData = { userId: number; username: string }

type AuthContextValue = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): User | null {
  const session = storageGet<SessionData | null>(KEYS.session, null)
  if (!session || !session.userId || !session.username) return null
  return { id: session.userId, username: session.username }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)

  function login(user: User) {
    storageSet(KEYS.session, { userId: user.id, username: user.username })
    setUser(user)
  }

  function logout() {
    storageRemove(KEYS.session)
    // cart is NOT cleared on logout (spec assumption)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
