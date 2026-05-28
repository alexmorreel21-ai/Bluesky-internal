import type { ReactElement } from 'react'
import { APP_ROUTES } from './appRoutes'
import TeamManagementPage from '../User/TeamManagementPage'
import UserManagementPage from '../User/UserManagementPage'
import EcommerceDashboardPage from '../components/EcommerceDashboardPage'
import RoutePlaceholder from '../components/RoutePlaceholder'

type DashboardRouteConfig = {
  path: string
  element: ReactElement
}

export const DASHBOARD_ROUTE_CONFIG: DashboardRouteConfig[] = [
  {
    path: APP_ROUTES.dashboard,
    element: <EcommerceDashboardPage />,
  },
  {
    path: APP_ROUTES.userManagement,
    element: <UserManagementPage />,
  },
  {
    path: APP_ROUTES.teamManagement,
    element: <TeamManagementPage />,
  },
  {
    path: APP_ROUTES.teamDailyReport,
    element: <RoutePlaceholder title="Daily report" />,
  },
  {
    path: APP_ROUTES.teamWorkMark,
    element: <RoutePlaceholder title="Work Mark" />,
  },
  {
    path: APP_ROUTES.teamDashboard,
    element: <RoutePlaceholder title="Dashboard" />,
  },
  {
    path: APP_ROUTES.remoteBidManagement,
    element: <RoutePlaceholder title="Bid Management" />,
  },
  {
    path: APP_ROUTES.remoteCallManagement,
    element: <RoutePlaceholder title="Call Management" />,
  },
  {
    path: APP_ROUTES.remoteDashboard,
    element: <RoutePlaceholder title="Dashboard" />,
  },
  {
    path: APP_ROUTES.remoteProfileManagement,
    element: <RoutePlaceholder title="Profile management" />,
  },
]
