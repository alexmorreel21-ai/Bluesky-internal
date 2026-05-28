import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signIn, isAuthenticated } from '../auth/session'
import { APP_ROUTES } from '../constants/routes'

const MANAGER_EMAIL = 'manager@bluesky.com'
const MANAGER_PASSWORD = '1234567890'

function LoginWindow() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const nextPath =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ||
    APP_ROUTES.userManagement

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(APP_ROUTES.userManagement, { replace: true })
    }
  }, [navigate])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (email.trim() === MANAGER_EMAIL && password === MANAGER_PASSWORD) {
      signIn()
      navigate(nextPath, { replace: true })
      return
    }

    setErrorMessage('Invalid credentials. Please sign in with the manager account.')
  }

  return (
    <main className="login-screen">
      <section className="login-panel" aria-label="Login window">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Use your account credentials to continue.</p>
        <p className="login-hint">
          Manager account: <strong>manager@bluesky.com</strong> / <strong>1234567890</strong>
        </p>

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

          <button className="login-button" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginWindow
