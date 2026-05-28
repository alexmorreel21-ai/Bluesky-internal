import { useEffect, useMemo, useState } from 'react'
import { createUser, deleteUser, fetchUsers } from '../../api/users'
import FeedbackMessages from '../../components/FeedbackMessages'
import UserAddModal from '../../modal/UserAddModal'
import type { CreateUserPayload, ManagedUser, Permission } from './Table'
import UserTable from './UserTable'

function isValidTeamLeaderEmail(email: string): boolean {
  return /^[a-z0-9._%+-]+@[a-z0-9-]+\.com$/i.test(email)
}

function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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
          setUsers(data)
        }
      } catch {
        if (isMounted) {
          setUsers([])
          setErrorMessage('Failed to load users from the backend API.')
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

  useEffect(() => {
    if (!isAddModalOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAddModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isAddModalOpen])

  const invitedCount = useMemo(() => users.filter((user) => user.status === 'INVITED').length, [users])

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!username.trim() || !email.trim() || password.length < 8) {
      setErrorMessage('Enter username, valid email, and password (minimum 8 characters).')
      return
    }

    if (permission === 'TeamLeader' && !isValidTeamLeaderEmail(email.trim())) {
      setErrorMessage('For TeamLeader, use email format: leadername@teamname.com')
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
      setIsAddModalOpen(false)
    } catch {
      setErrorMessage('Failed to create user credentials via API.')
    }
  }

  async function handleDelete(user: ManagedUser) {
    setErrorMessage('')
    setSuccessMessage('')

    if (user.permission === 'Manager') {
      setErrorMessage('Manager accounts cannot be deleted.')
      return
    }

    try {
      await deleteUser(user.id)
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id))
      setSuccessMessage('Account deleted successfully.')
    } catch {
      setErrorMessage('Failed to delete account via API.')
    }
  }

  return (
    <section className="user-mgmt" aria-label="User management">
      <header className="user-mgmt-head">
        <div>
          <h1>User Management</h1>
          <p className="user-mgmt-note">
            Create accounts, assign permissions, and manage access from the connected backend.
          </p>
        </div>

        <div className="user-mgmt-head-actions">
          <button className="user-mgmt-add-button" type="button" onClick={() => setIsAddModalOpen(true)}>
            Add User
          </button>
        </div>
      </header>

      <FeedbackMessages
        className="user-mgmt-feedback"
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      <UserTable users={users} isLoading={isLoading} invitedCount={invitedCount} onDelete={handleDelete} />

      <UserAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleRegister}
        username={username}
        onUsernameChange={setUsername}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        permission={permission}
        onPermissionChange={setPermission}
      />
    </section>
  )
}

export default UserManagementPage
