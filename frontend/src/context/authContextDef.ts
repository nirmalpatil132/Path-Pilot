import { createContext } from 'react'
import type { User } from '@/lib/api'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (data: { email: string; password: string }) => Promise<User>
  register: (data: { name: string; email: string; password: string }) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

export const AuthContext = createContext<AuthContextType | null>(null)
