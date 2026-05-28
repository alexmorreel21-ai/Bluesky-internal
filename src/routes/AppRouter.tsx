import { Route, Routes } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import LoginWindow from '../components/LoginWindow'
import RequireAuth from '../components/RequireAuth'
import { APP_ROUTES } from './appRoutes'

function AppRouter() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<LoginWindow />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <DashboardShell />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default AppRouter
