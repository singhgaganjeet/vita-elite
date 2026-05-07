import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'user' | 'coach' | 'admin'

const CREDENTIALS: Record<string, { password: string; role: UserRole; name: string }> = {
  'demo@vitaelite.com':  { password: 'Demo@123',  role: 'user',  name: 'Priya Sharma' },
  'coach@vitaelite.com': { password: 'Coach@123', role: 'coach', name: 'Arjun Mehta' },
  'admin@vitaelite.com': { password: 'Admin@123', role: 'admin', name: 'Super Admin' },
}

interface AuthStore {
  isLoggedIn: boolean
  role: UserRole | null
  email: string
  name: string
  login: (email: string, password: string) => { success: boolean; role?: UserRole; error?: string }
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      role: null,
      email: '',
      name: '',

      login: (email, password) => {
        const cred = CREDENTIALS[email.trim().toLowerCase()]
        if (!cred) return { success: false, error: 'No account found with that email.' }
        if (cred.password !== password) return { success: false, error: 'Incorrect password.' }
        set({ isLoggedIn: true, role: cred.role, email: email.trim().toLowerCase(), name: cred.name })
        return { success: true, role: cred.role }
      },

      logout: () => set({ isLoggedIn: false, role: null, email: '', name: '' }),
    }),
    { name: 'vita-auth' }
  )
)
