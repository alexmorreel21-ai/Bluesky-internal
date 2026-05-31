import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchCurrentSession } from '../api/auth'
import { ApiError } from '../api/http'
import { APP_ROUTES } from '../routes/appRoutes'
import { LoadingSpinner } from './common/LoadingSpinner'

type RequireAuthProps = {
  children: ReactElement
}

function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      try {
        await fetchCurrentSession()
        if (isMounted) {
          setStatus('authenticated')
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          setStatus('unauthenticated')
          return
        }

        // Keep routes viewable during local frontend development when backend auth is not ready.
        if (import.meta.env.DEV) {
          setStatus('authenticated')
          return
        }

        setStatus('unauthenticated')
      }
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [])

  if (status === 'loading') {
    return <LoadingSpinner fullscreen label="Checking session" hint="Connecting to the authentication service." />
  }

  if (status === 'unauthenticated') {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location }} />
  }

  return children
}

export default RequireAuth