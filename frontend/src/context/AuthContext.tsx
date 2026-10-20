import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, type User } from '@/lib/api'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const data = await api.getMe()
      setUser(data.user)
      setError(null)
      return data.user
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    api
      .getMe()
      .then((data) => {
        if (isMounted) {
          setUser(data.user)
          setError(null)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    setError(null)
    const data = await api.login(credentials)
    setUser(data.user)
    return data.user
  }

  const register = async (credentials: { name: string; email: string; password: string }) => {
    setError(null)
    const data = await api.register(credentials)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
