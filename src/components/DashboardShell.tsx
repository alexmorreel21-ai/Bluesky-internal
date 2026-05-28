import { Navigate, Route, Routes } from 'react-router-dom'
import { APP_ROUTES } from '../constants/routes'
import RoutePlaceholder from './RoutePlaceholder'
import TabHeader from './TabHeader'
import UserManagementPage from './UserManagementPage'

function DashboardShell() {
  return (
    <main className="dashboard-shell">
      <TabHeader />
      <section className="tab-content" aria-live="polite">
        <Routes>
          <Route path="/" element={<Navigate to={APP_ROUTES.userManagement} replace />} />

          <Route
            path={APP_ROUTES.userManagement}
            element={<UserManagementPage />}
          />
          <Route
            path={APP_ROUTES.teamManagement}
            element={<RoutePlaceholder title="Team Management" />}
          />
          <Route
            path={APP_ROUTES.teamDailyReport}
            element={<RoutePlaceholder title="Daily report" />}
          />
          <Route
            path={APP_ROUTES.teamWorkMark}
            element={<RoutePlaceholder title="Work Mark" />}
          />
          <Route
            path={APP_ROUTES.teamDashboard}
            element={<RoutePlaceholder title="Dashboard" />}
          />

          <Route
            path={APP_ROUTES.remoteBidManagement}
            element={<RoutePlaceholder title="Bid Management" />}
          />
          <Route
            path={APP_ROUTES.remoteCallManagement}
            element={<RoutePlaceholder title="Call Management" />}
          />
          <Route
            path={APP_ROUTES.remoteDashboard}
            element={<RoutePlaceholder title="Dashboard" />}
          />
          <Route
            path={APP_ROUTES.remoteProfileManagement}
            element={<RoutePlaceholder title="Profile management" />}
          />

          <Route path="*" element={<Navigate to={APP_ROUTES.userManagement} replace />} />
        </Routes>
      </section>
    </main>
  )
}

export default DashboardShell
