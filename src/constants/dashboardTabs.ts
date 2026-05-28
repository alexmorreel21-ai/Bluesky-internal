export const DASHBOARD_TABS = ['Overview', 'Reports', 'Analytics', 'Settings'] as const

export type DashboardTab = (typeof DASHBOARD_TABS)[number]
