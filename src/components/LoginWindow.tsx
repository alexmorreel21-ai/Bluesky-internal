import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchCurrentSession, signInRequest } from '../api/auth'
import { ApiError } from '../api/http'
import { APP_ROUTES } from '../routes/appRoutes'

function LoginWindow() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const nextPath =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ||
    APP_ROUTES.dashboard

  useEffect(() => {
    let isMounted = true

    async function hydrateSession() {
      try {
        await fetchCurrentSession()
        if (isMounted) {
          navigate(APP_ROUTES.dashboard, { replace: true })
        }
      } catch {
        if (!isMounted) {
          return
        }

        setErrorMessage('')
      }
    }

    void hydrateSession()

    return () => {
      isMounted = false
    }
  }, [navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInRequest({
        email: email.trim(),
        password,
      })
      navigate(nextPath, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage('Invalid credentials. Please try again.')
      } else {
        setErrorMessage('Unable to sign in through the backend API.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel" aria-label="Login window">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Use your account credentials to continue.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="login-input"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="login-input"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {errorMessage && <p className="form-message is-error">{errorMessage}</p>}

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginWindow
