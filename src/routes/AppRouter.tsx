import { Route, Routes } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import LoginWindow from '../components/LoginWindow'
import { APP_ROUTES } from './appRoutes'

function AppRouter() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<LoginWindow />} />
      <Route path="*" element={<DashboardShell />} />
    </Routes>
  )
}

export default AppRouter
