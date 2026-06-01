import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../common/Badge'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { Table } from '../common/Table'
import { addUser, deleteUser, getUsers, updateUser } from '../../services/mockApi'
import type { User, UserRole } from '../../types/user.types'
import { useAuth } from '../../contexts/AuthContext'

const defaultForm = { username: '', email: '', password: '', role: 'dev' as UserRole }

export function UserManagementTab() {
  const { currentUser, refreshUsers } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const canManageUsers = currentUser?.role === 'admin'

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      setUsers(await getUsers())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  const roleBadge = useMemo(
    () => ({ admin: 'danger', manager: 'info', dev: 'default' } as const),
    [],
  )

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!canManageUsers) {
      setError('Only admin users can manage accounts.')
      return
    }

    try {
      if (editingId) {
        await updateUser(editingId, form)
      } else {
        await addUser(form)
      }
      setForm(defaultForm)
      setEditingId(null)
      setIsModalOpen(false)
      await fetchUsers()
      await refreshUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user.')
    }
  }

  const onEdit = (user: User) => {
    setEditingId(user.id)
    setForm({ username: user.username, email: user.email, password: user.password, role: user.role })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    if (!canManageUsers) {
      setError('Only admin users can manage accounts.')
      return
    }

    setEditingId(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const onConfirmDelete = async () => {
    if (!deleteId) {
      return
    }

    try {
      await deleteUser(deleteId)
      setDeleteId(null)
      await fetchUsers()
      await refreshUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.')
    }
  }

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">User Management</h2>
        {canManageUsers ? <NewActionButton onClick={openCreateModal} label="New User" /> : null}
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!canManageUsers ? <p className="text-sm text-slate-400">Sign in as the admin user to add, edit, or delete accounts.</p> : null}

      <section className="min-h-[62vh]">
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState title="No users" message="Create your first user." />
        ) : (
          <Table
            data={users}
            rowKey={(item) => item.id}
            columns={[
              { key: 'username', title: 'Username', render: (item) => item.username },
              { key: 'email', title: 'Email', render: (item) => item.email },
              { key: 'password', title: 'Password', render: (item) => item.password },
              { key: 'role', title: 'Role', render: (item) => <Badge variant={roleBadge[item.role]}>{item.role}</Badge> },
              {
                key: 'actions',
                title: 'Actions',
                render: (item) =>
                  canManageUsers ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null,
              },
            ]}
          />
        )}
      </section>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit User' : 'Add User'}
        footer={null}
      >
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Username
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Username"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              type="email"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <input
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="dev">dev</option>
            </select>
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              {editingId ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete user"
        message="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void onConfirmDelete()
        }}
      />
    </div>
  )
}
