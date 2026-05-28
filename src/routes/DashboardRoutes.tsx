import { Navigate, Route, Routes } from 'react-router-dom'
import { APP_ROUTES } from './appRoutes'
import { DASHBOARD_ROUTE_CONFIG } from './dashboardRouteConfig'

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={APP_ROUTES.dashboard} replace />} />

      {DASHBOARD_ROUTE_CONFIG.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route path="*" element={<Navigate to={APP_ROUTES.dashboard} replace />} />
    </Routes>
  )
}

export default DashboardRoutes
