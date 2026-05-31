import { useMemo } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AssignmentTab } from './components/AssignmentTab/AssignmentTab'
import { DashboardTab } from './components/DashboardTab/DashboardTab'
import { ReportTab } from './components/ReportTab/ReportTab'
import { TeamManagementTab } from './components/TeamTab/TeamManagementTab'
import { Tabs } from './components/common/Tabs'
import { UserManagementTab } from './components/UserTab/UserManagementTab'
import { MainLayout } from './components/layout/MainLayout'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { APP_ROUTES } from './routes/appRoutes'

const TAB_TO_ROUTE: Record<string, string> = {
  dashboard: APP_ROUTES.dashboard,
  users: APP_ROUTES.userManagement,
  teams: APP_ROUTES.teamManagement,
  assignments: APP_ROUTES.assignment,
  reports: APP_ROUTES.report,
}

function getActiveTab(pathname: string): string {
  if (pathname === APP_ROUTES.userManagement) {
    return 'users'
  }

  if (pathname === APP_ROUTES.teamManagement || pathname.startsWith(`${APP_ROUTES.teamManagement}/`)) {
    return 'teams'
  }

  if (pathname === APP_ROUTES.assignment) {
    return 'assignments'
  }

  if (pathname === APP_ROUTES.report) {
    return 'reports'
  }

  return 'dashboard'
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = useMemo(() => getActiveTab(location.pathname), [location.pathname])

  const handleTabChange = (tab: string) => {
    const target = TAB_TO_ROUTE[tab] ?? APP_ROUTES.dashboard
    if (target !== location.pathname) {
      navigate(target)
    }
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout>
          <div className="grid gap-0 md:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="min-h-[calc(100vh-5rem)] border-r border-slate-700/70 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 py-5">
              <div className="mb-6 border-b border-slate-700/60 pb-5">
                <p
                  className="text-5xl leading-none text-sky-400"
                  style={{ fontFamily: 'Great Vibes, Brush Script MT, cursive' }}
                >
                  Bluesky
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Dashboard Suite</p>
              </div>

              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Navigation</p>
              <Tabs
                direction="vertical"
                active={activeTab}
                onChange={handleTabChange}
                tabs={[
                  { key: 'dashboard', label: 'Dashboard' },
                  {
                    key: 'user-group',
                    label: 'User',
                    items: [
                      { key: 'users', label: 'User Management' },
                      { key: 'teams', label: 'Team Management' },
                    ],
                  },
                  {
                    key: 'work-group',
                    label: 'Work',
                    items: [
                      { key: 'assignments', label: 'Assignment' },
                      { key: 'reports', label: 'Report' },
                    ],
                  },
                ]}
              />
            </aside>

            <section className="min-w-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 p-4 md:p-6">
              <Routes>
                <Route path="/" element={<Navigate to={APP_ROUTES.dashboard} replace />} />
                <Route path={APP_ROUTES.dashboard} element={<DashboardTab />} />
                <Route path={APP_ROUTES.userManagement} element={<UserManagementTab />} />
                <Route path={APP_ROUTES.teamManagement} element={<TeamManagementTab />} />
                <Route path={APP_ROUTES.assignment} element={<AssignmentTab />} />
                <Route path={APP_ROUTES.report} element={<ReportTab />} />
                <Route path="*" element={<Navigate to={APP_ROUTES.dashboard} replace />} />
              </Routes>
            </section>
          </div>
        </MainLayout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
