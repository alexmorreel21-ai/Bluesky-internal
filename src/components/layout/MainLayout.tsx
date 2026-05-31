import { Header } from './Header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <main>{children}</main>
    </div>
  )
}
