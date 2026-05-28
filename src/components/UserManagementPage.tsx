import { useEffect, useMemo, useState } from 'react'

type Permission = 'Manager' | 'TeamLeader' | 'TeamMember'

type ManagedUser = {
  id: string
  username: string
  email: string
  password?: string
  permission: Permission
  status: 'ACTIVE' | 'INVITED'
}

type CreateUserPayload = {
  username: string
  email: string
  password: string
  permission: Permission
}

const MANAGER_ACCOUNT: ManagedUser = {
  id: 'manager-1',
  username: 'manager',
  email: 'manager@bluesky.com',
  password: '1234567890',
  permission: 'Manager',
  status: 'ACTIVE',
}

const fallbackUsers: ManagedUser[] = [MANAGER_ACCOUNT]

function ensureManagerAccount(users: ManagedUser[]): ManagedUser[] {
  const hasManager = users.some(
    (user) => user.username === MANAGER_ACCOUNT.username && user.email === MANAGER_ACCOUNT.email,
  )

  return hasManager ? users : [MANAGER_ACCOUNT, ...users]
}

async function fetchUsers(): Promise<ManagedUser[]> {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to load users.')
  }

  return (await response.json()) as ManagedUser[]
}

async function createUser(payload: CreateUserPayload): Promise<ManagedUser> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create user credentials.')
  }

  return (await response.json()) as ManagedUser
}

function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [permission, setPermission] = useState<Permission>('TeamMember')

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      try {
        const data = await fetchUsers()

        if (isMounted) {
          setUsers(ensureManagerAccount(data))
        }
      } catch {
        if (isMounted) {
          setUsers(fallbackUsers)
          setErrorMessage('Backend unavailable. Showing local admin-only seed data.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const invitedCount = useMemo(() => users.filter((user) => user.status === 'INVITED').length, [users])

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!username.trim() || !email.trim() || password.length < 8) {
      setErrorMessage('Enter username, valid email, and password (minimum 8 characters).')
      return
    }

    const payload: CreateUserPayload = {
      username: username.trim(),
      email: email.trim(),
      password,
      permission,
    }

    try {
      const createdUser = await createUser(payload)
      setUsers((currentUsers) => [createdUser, ...currentUsers])
      setSuccessMessage('Login credentials created and ready to share with the user.')
      setUsername('')
      setEmail('')
      setPassword('')
      setPermission('TeamMember')
    } catch {
      // Keep frontend workflow testable when backend is not connected.
      const localUser: ManagedUser = {
        id: crypto.randomUUID(),
        username: payload.username,
        email: payload.email,
        permission: payload.permission,
        status: 'INVITED',
      }
      setUsers((currentUsers) => [localUser, ...currentUsers])
      setSuccessMessage('Created locally. Connect backend API to persist new credentials.')
      setUsername('')
      setEmail('')
      setPassword('')
      setPermission('TeamMember')
    }
  }

  return (
    <section className="user-mgmt" aria-label="User management">
      <header className="user-mgmt-head">
        <h1>User Management</h1>
        <p>
          Admin creates login credentials and provides them to users. Self-registration is disabled.
        </p>
        <p className="user-mgmt-note">
          Manager account is fixed to <strong>manager</strong> / <strong>manager@bluesky.com</strong>{' '}
          / <strong>1234567890</strong>.
        </p>
      </header>

      <div className="user-mgmt-grid">
        <section className="user-mgmt-register" aria-label="Admin registration table">
          <h2>Register Users</h2>
          <form onSubmit={handleRegister}>
            <table className="register-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Permission</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      aria-label="Username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="jane.doe"
                      required
                    />
                  </td>
                  <td>
                    <input
                      aria-label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="jane@company.com"
                      required
                    />
                  </td>
                  <td>
                    <input
                      aria-label="Password"
                      type="text"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Temporary password"
                      minLength={8}
                      required
                    />
                  </td>
                  <td>
                    <select
                      aria-label="Permission"
                      value={permission}
                      onChange={(event) => setPermission(event.target.value as Permission)}
                    >
                      <option value="Manager">Manager</option>
                      <option value="TeamLeader">TeamLeader</option>
                      <option value="TeamMember">TeamMember</option>
                    </select>
                  </td>
                  <td>
                    <button type="submit">Register</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          {errorMessage && <p className="form-message is-error">{errorMessage}</p>}
          {successMessage && <p className="form-message is-success">{successMessage}</p>}
        </section>

        <section className="user-mgmt-list" aria-label="Managed users">
          <h2>Registered Accounts</h2>
          <p className="user-mgmt-sub">Pending invite accounts: {invitedCount}</p>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Permission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={user.permission === 'Manager' ? 'role-badge is-admin' : 'role-badge'}>
                        {user.permission}
                      </span>
                    </td>
                    <td>{user.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </section>
  )
}

export default UserManagementPage
