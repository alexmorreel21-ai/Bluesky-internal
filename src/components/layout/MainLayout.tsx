import { Header } from './Header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <Header />
      <main>{children}</main>
    </div>
  )
}
