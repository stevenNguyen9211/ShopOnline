/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { products } from '../data/products'
import { KEYS, storageGet, storageSet } from '../lib/storage'

export type CartItem = {
  productId: string
  quantity: number
}

type CartState = CartItem[]

type CartAction =
  | { type: 'ADD'; productId: string }
  | { type: 'INCREASE'; productId: string }
  | { type: 'DECREASE'; productId: string }
  | { type: 'REMOVE'; productId: string }
  | { type: 'CLEAR' }

const MAX_QUANTITY = 5

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.productId === action.productId)
      if (existing) {
        if (existing.quantity >= MAX_QUANTITY) return state
        return state.map((i) =>
          i.productId === action.productId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...state, { productId: action.productId, quantity: 1 }]
    }
    case 'INCREASE': {
      return state.map((i) =>
        i.productId === action.productId && i.quantity < MAX_QUANTITY
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    }
    case 'DECREASE': {
      return state.map((i) =>
        i.productId === action.productId && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
      )
    }
    case 'REMOVE': {
      return state.filter((i) => i.productId !== action.productId)
    }
    case 'CLEAR': {
      return []
    }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  dispatch: React.Dispatch<CartAction>
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  return storageGet<CartItem[]>(KEYS.cart, [])
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart)

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => {
    const product = products.find((p) => p.id === i.productId)
    return sum + (product ? product.price * i.quantity : 0)
  }, 0)

  useEffect(() => {
    storageSet(KEYS.cart, items)
  }, [items])

  return (
    <CartContext.Provider value={{ items, count, total, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
