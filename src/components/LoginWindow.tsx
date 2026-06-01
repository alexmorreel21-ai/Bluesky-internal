import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function LoginWindow() {
  const { currentUser, login } = useAuth()
  const [email, setEmail] = useState('admin@bluesky.com')
  const [password, setPassword] = useState('1234567890')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser) {
        setErrorMessage('')
    }
  }, [currentUser])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login(email.trim(), password)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-screen">
      <div className="login-aurora login-aurora-left" aria-hidden="true" />
      <div className="login-aurora login-aurora-right" aria-hidden="true" />

      <section className="login-panel" aria-label="Login window">
        <div className="login-showcase">
          <p className="login-eyebrow">BlueSky</p>
          <h1 className="login-title">BlueSky</h1>
          <p className="login-subtitle">Bluesky is everywhere</p>
        </div>

        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-header">
              <p className="login-form-kicker">Welcome back</p>
              <p className="login-form-note">Enter the admin credentials to continue.</p>
            </div>

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

            {errorMessage ? <p className="login-feedback login-feedback-error">{errorMessage}</p> : null}

            <button className="login-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginWindow
