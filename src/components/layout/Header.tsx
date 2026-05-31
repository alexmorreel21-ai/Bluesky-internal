import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { currentUser, users, loginAs } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur">
      <div className="flex items-center justify-end px-6 py-3">
        <div className="flex items-center gap-3">
          <select
            value={currentUser?.id ?? ''}
            onChange={(event) => {
              void loginAs(event.target.value)
            }}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-600 bg-slate-800 p-2 text-slate-100 hover:bg-slate-700"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
