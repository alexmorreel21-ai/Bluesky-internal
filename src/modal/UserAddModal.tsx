import type { FormEventHandler } from 'react'
import type { Permission } from '../Page/User/Table'

type UserAddModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  username: string
  onUsernameChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  permission: Permission
  onPermissionChange: (value: Permission) => void
}

function UserAddModal({
  isOpen,
  onClose,
  onSubmit,
  username,
  onUsernameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  permission,
  onPermissionChange,
}: UserAddModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="user-mgmt-modal-backdrop" role="presentation">
      <section
        className="user-mgmt-modal"
        aria-label="Add user"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="user-mgmt-modal-head">
          <h2>Add User</h2>
          <button type="button" className="user-mgmt-modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="user-mgmt-modal-form" onSubmit={onSubmit}>
          <label htmlFor="registerUsername">Username</label>
          <input
            id="registerUsername"
            aria-label="Username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="jane.doe"
            autoFocus
            required
          />

          <label htmlFor="registerEmail">Email</label>
          <input
            id="registerEmail"
            aria-label="Email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder={permission === 'TeamLeader' ? 'leadername@teamname.com' : 'jane@company.com'}
            required
          />

          <label htmlFor="registerPassword">Password</label>
          <input
            id="registerPassword"
            aria-label="Password"
            type="text"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Temporary password"
            minLength={8}
            required
          />

          <label htmlFor="registerPermission">Permission</label>
          <select
            id="registerPermission"
            aria-label="Permission"
            value={permission}
            onChange={(event) => onPermissionChange(event.target.value as Permission)}
          >
            <option value="Manager">Manager</option>
            <option value="TeamLeader">TeamLeader</option>
            <option value="TeamMember">TeamMember</option>
          </select>

          <div className="user-mgmt-modal-actions">
            <button type="button" className="user-mgmt-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Register</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default UserAddModal
