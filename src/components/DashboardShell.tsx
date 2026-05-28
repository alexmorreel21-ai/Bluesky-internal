import DashboardRoutes from '../routes/DashboardRoutes'
import TabHeader from './TabHeader'

function DashboardShell() {
  return (
    <main className="dashboard-shell">
      <TabHeader />
      <section className="tab-content" aria-live="polite">
        <DashboardRoutes />
      </section>
    </main>
  )
}

export default DashboardShell
