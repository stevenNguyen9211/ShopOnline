/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { users, type User } from '../data/users'
import { KEYS, storageGet, storageRemove, storageSet } from '../lib/storage'

type SessionData = { userId: string }

type AuthContextValue = {
  user: User | null
  login: (userId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): User | null {
  const session = storageGet<SessionData | null>(KEYS.session, null)
  if (!session) return null
  return users.find((u) => u.id === session.userId) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)

  function login(userId: string) {
    const found = users.find((u) => u.id === userId)
    if (!found) return
    storageSet(KEYS.session, { userId })
    setUser(found)
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
