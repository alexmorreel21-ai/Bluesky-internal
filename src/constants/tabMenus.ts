import { APP_ROUTES } from '../routes/appRoutes'

type TabMenuItem = {
  label: string
  to: string
}

export type TabMenu = {
  id: 'dashboard' | 'user' | 'team' | 'remote'
  triggerLabel: string
  ariaLabel: string
  items: TabMenuItem[]
}

export const TAB_MENUS: TabMenu[] = [
  {
    id: 'dashboard',
    triggerLabel: 'Dashboard',
    ariaLabel: 'Dashboard options',
    items: [{ label: 'Dashboard', to: APP_ROUTES.dashboard }],
  },
  {
    id: 'user',
    triggerLabel: 'User Management',
    ariaLabel: 'User Management options',
    items: [
      { label: 'User Management', to: APP_ROUTES.userManagement },
      { label: 'Team Management', to: APP_ROUTES.teamManagement },
    ],
  },
  {
    id: 'team',
    triggerLabel: 'Team Management',
    ariaLabel: 'Team Management options',
    items: [
      { label: 'Dashboard', to: APP_ROUTES.teamDashboard },
      { label: 'Daily report', to: APP_ROUTES.teamDailyReport },
      { label: 'Work Mark', to: APP_ROUTES.teamWorkMark },
    ],
  },
  {
    id: 'remote',
    triggerLabel: 'Remote Job',
    ariaLabel: 'Remote Job options',
    items: [
      { label: 'Dashboard', to: APP_ROUTES.remoteDashboard },
      { label: 'Bid Management', to: APP_ROUTES.remoteBidManagement },
      { label: 'Call Management', to: APP_ROUTES.remoteCallManagement },
      { label: 'Profile management', to: APP_ROUTES.remoteProfileManagement },
    ],
  },
]
