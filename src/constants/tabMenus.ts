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
    triggerLabel: 'User',
    ariaLabel: 'User options',
    items: [{ label: 'User', to: APP_ROUTES.userManagement }],
  },
  {
    id: 'user',
    triggerLabel: 'Team',
    ariaLabel: 'Team options',
    items: [{ label: 'Team', to: APP_ROUTES.teamManagement }],
  },
  {
    id: 'team',
    triggerLabel: 'Assignment',
    ariaLabel: 'Assignment options',
    items: [{ label: 'Assignment', to: APP_ROUTES.assignment }],
  },
  {
    id: 'remote',
    triggerLabel: 'Report',
    ariaLabel: 'Report options',
    items: [{ label: 'Report', to: APP_ROUTES.report }],
  },
]
