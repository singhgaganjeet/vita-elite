import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'user' | 'coach' | 'admin'

interface AuthStore {
  isLoggedIn: boolean
  role: UserRole | null
  email: string
  name: string
  userId: string
  // Async API-backed login
  loginAsync: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  // Legacy sync login kept for demo fallback (removed credentials check)
  login: (email: string, password: string) => { success: boolean; role?: UserRole; error?: string }
  logout: () => Promise<void>
  initSession: () => Promise<void>
  _setUser: (user: { id: string; email: string; name: string; role: UserRole }) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      role: null,
      email: '',
      name: '',
      userId: '',

      _setUser: (user) => set({ isLoggedIn: true, role: user.role, email: user.email, name: user.name, userId: user.id }),

      loginAsync: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.error ?? 'Login failed.' }
          get()._setUser(data.user)
          return { success: true, role: data.user.role }
        } catch {
          return { success: false, error: 'Network error. Please try again.' }
        }
      },

      // Legacy sync fallback — just calls loginAsync internally (returns optimistic result)
      login: (email, password) => {
        // For layouts that expect sync result, we trigger async and return optimistic
        // Real auth happens via loginAsync on the login page
        return { success: false, error: 'Use loginAsync' }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch { /* ignore */ }
        set({ isLoggedIn: false, role: null, email: '', name: '', userId: '' })
      },

      initSession: async () => {
        try {
          const res = await fetch('/api/auth/session')
          const data = await res.json()
          if (data.user) {
            get()._setUser(data.user)
          } else {
            set({ isLoggedIn: false, role: null, email: '', name: '', userId: '' })
          }
        } catch { /* ignore */ }
      },
    }),
    { name: 'vita-auth' }
  )
)
