import type { ManagedUser } from './Table'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

type UserTableProps = {
  users: ManagedUser[]
  isLoading: boolean
  invitedCount: number
  onDelete: (user: ManagedUser) => void
}

function UserTable({ users, isLoading, invitedCount, onDelete }: UserTableProps) {
  return (
    <section className="user-mgmt-list" aria-label="Managed users">
      <h2>Registered Accounts</h2>
      <p className="user-mgmt-sub">Pending invite accounts: {invitedCount}</p>
      {isLoading ? (
        <LoadingSpinner label="Loading users" hint="Fetching account records and permissions." />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Permission</th>
              <th>Status</th>
              <th>Action</th>
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
                <td>
                  <button
                    type="button"
                    className="delete-account-button"
                    onClick={() => onDelete(user)}
                    disabled={user.permission === 'Manager'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default UserTable