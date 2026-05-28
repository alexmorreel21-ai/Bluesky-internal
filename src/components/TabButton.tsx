import type { DashboardTab } from '../constants/dashboardTabs'

type TabButtonProps = {
  tab: DashboardTab
  isActive: boolean
  onSelect: (tab: DashboardTab) => void
}

function TabButton({ tab, isActive, onSelect }: TabButtonProps) {
  return (
    <button
      type="button"
      className={isActive ? 'tab is-active' : 'tab'}
      onClick={() => onSelect(tab)}
    >
      {tab}
    </button>
  )
}

export default TabButton
