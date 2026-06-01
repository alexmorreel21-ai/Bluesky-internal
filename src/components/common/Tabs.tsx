import { useState } from 'react'

type TabItem = {
  key: string
  label: string
}

type TabGroup = {
  key: string
  label: string
  items: TabItem[]
}

type TabEntry = TabItem | TabGroup

interface TabsProps {
  active: string
  tabs: TabEntry[]
  onChange: (key: string) => void
  direction?: 'horizontal' | 'vertical'
}

export function Tabs({ active, tabs, onChange, direction = 'horizontal' }: TabsProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const isVertical = direction === 'vertical'

  const getRootClass = () =>
    isVertical ? 'flex flex-col gap-2' : 'mb-5 flex flex-wrap gap-2'

  const getTabClass = (selected: boolean) => {
    if (isVertical) {
      return `${
        selected
          ? 'bg-gradient-to-r from-sky-200 to-cyan-100 text-sky-900 ring-1 ring-sky-200 dark:from-sky-500/30 dark:to-sky-400/20 dark:text-sky-200 dark:ring-sky-300/40'
          : 'bg-white/80 text-slate-700 ring-1 ring-sky-100 hover:bg-sky-50 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:ring-0 dark:hover:bg-white/10 dark:hover:text-white'
      } w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition`
    }

    return `${
      selected
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
    } rounded-full px-4 py-2 text-sm font-semibold transition`
  }

  const getSubmenuClass = () => {
    if (isVertical) {
      return 'ml-2 w-[calc(100%-0.5rem)] overflow-hidden rounded-xl bg-white/80 ring-1 ring-sky-100 dark:bg-slate-950/70 dark:ring-0'
    }

    return 'absolute left-0 z-20 mt-2 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900'
  }

  const getChildClass = (selected: boolean) => {
    if (isVertical) {
      return `block w-full rounded-lg px-3 py-2 text-left text-sm ${
        selected
          ? 'bg-sky-100 text-sky-900 dark:bg-sky-500/25 dark:text-sky-100'
          : 'text-slate-600 hover:bg-sky-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
      }`
    }

    return `block w-full rounded-lg px-3 py-2 text-left text-sm ${
      selected
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
    }`
  }

  return (
    <div className={getRootClass()}>
      {tabs.map((tab) => {
        if ('items' in tab) {
          const selected = tab.items.some((item) => item.key === active)
          const isOpen = openGroup === tab.key

          return (
            <div key={tab.key} className="relative">
              <button
                onClick={() => setOpenGroup((current) => (current === tab.key ? null : tab.key))}
                className={`${getTabClass(selected)} flex items-center justify-between`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-block text-xs transition-transform duration-300 ease-out ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                className={`${getSubmenuClass()} origin-top transition-all duration-300 ease-out ${
                  isVertical
                    ? isOpen
                      ? 'mt-1 max-h-64 border border-sky-100 p-1 opacity-100 dark:border-slate-700/80'
                      : 'mt-0 max-h-0 border border-transparent p-0 opacity-0'
                    : isOpen
                      ? 'pointer-events-auto translate-y-0 scale-y-100 opacity-100'
                      : 'pointer-events-none -translate-y-1 scale-y-95 opacity-0'
                }`}
              >
                {tab.items.map((item) => {
                  const childSelected = item.key === active
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onChange(item.key)
                        setOpenGroup(null)
                      }}
                      className={`${getChildClass(childSelected)} transition-all duration-200 hover:translate-x-0.5`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }

        const selected = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={getTabClass(selected)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
