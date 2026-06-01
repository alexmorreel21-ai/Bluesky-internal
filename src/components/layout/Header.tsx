import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { currentUser, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/88 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/95">
      <div className="flex items-center justify-end px-6 py-3">
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
              {currentUser.username} ({currentUser.role})
            </div>
          ) : null}

          {currentUser ? (
            <button
              onClick={logout}
              className="rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              title="Sign out"
            >
              Sign out
            </button>
          ) : null}

          <button
            onClick={toggleTheme}
            className="rounded-lg border border-sky-100 bg-white p-2 text-slate-700 hover:bg-sky-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
