import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  authenticateUser,
  clearCurrentUserId,
  getCurrentUserId,
  getUserById,
  getUsers,
  setCurrentUserId,
} from '../services/mockApi'
import type { User } from '../types/user.types'

interface AuthContextValue {
  currentUser: User | null
  users: User[]
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUsers: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const refreshUsers = useCallback(async () => {
    const result = await getUsers()
    setUsers(result)

    setCurrentUser((current) => {
      if (!current) {
        return null
      }

      return result.find((user) => user.id === current.id) ?? null
    })
  }, [])

  const hydrateCurrentUser = useCallback(async () => {
    const usersList = await getUsers()
    setUsers(usersList)

    const saved = getCurrentUserId()
    if (!saved) {
      setCurrentUser(null)
      return
    }

    const selected = (await getUserById(saved)) ?? null
    if (selected) {
      setCurrentUserId(selected.id)
    } else {
      clearCurrentUserId()
    }
    setCurrentUser(selected)
  }, [])

  useEffect(() => {
    hydrateCurrentUser()
      .catch(() => {
        setCurrentUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [hydrateCurrentUser])

  const login = useCallback(async (email: string, password: string) => {
    const selected = await authenticateUser(email, password)
    if (!selected) {
      throw new Error('Invalid email or password.')
    }

    setCurrentUserId(selected.id)
    setCurrentUser(selected)
  }, [])

  const logout = useCallback(() => {
    clearCurrentUserId()
    setCurrentUser(null)
  }, [])

  const value = useMemo(
    () => ({ currentUser, users, loading, login, logout, refreshUsers }),
    [currentUser, users, loading, login, logout, refreshUsers],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return ctx
}
