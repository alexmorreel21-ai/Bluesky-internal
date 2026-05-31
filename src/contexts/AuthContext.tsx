import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUserId, getUserById, getUsers, setCurrentUserId } from '../services/mockApi'
import type { User } from '../types/user.types'

interface AuthContextValue {
  currentUser: User | null
  users: User[]
  loading: boolean
  loginAs: (userId: string) => Promise<void>
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
  }, [])

  const hydrateCurrentUser = useCallback(async () => {
    const usersList = await getUsers()
    setUsers(usersList)

    const saved = getCurrentUserId() ?? usersList[0]?.id
    if (!saved) {
      setCurrentUser(null)
      return
    }

    const selected = (await getUserById(saved)) ?? usersList[0] ?? null
    if (selected) {
      setCurrentUserId(selected.id)
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

  const loginAs = useCallback(async (userId: string) => {
    const selected = await getUserById(userId)
    if (!selected) {
      throw new Error('User not found for login.')
    }

    setCurrentUserId(selected.id)
    setCurrentUser(selected)
  }, [])

  const value = useMemo(
    () => ({ currentUser, users, loading, loginAs, refreshUsers }),
    [currentUser, users, loading, loginAs, refreshUsers],
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
