import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { TAB_MENUS } from '../constants/tabMenus'

function TabHeader() {
  const [openMenu, setOpenMenu] = useState<(typeof TAB_MENUS)[number]['id'] | null>(null)
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!navRef.current) {
        return
      }

      if (!navRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <aside className="tab-header" aria-label="Dashboard tabs">
      <span className="tab-brand" aria-label="Bluesky brand left">
        bluesky
      </span>

      <nav className="tab-nav" aria-label="Dashboard navigation" ref={navRef}>
        {TAB_MENUS.map((menu) => {
          const firstItem = menu.items[0]

          return menu.items.length === 1 && firstItem ? (
            <NavLink
              key={menu.id}
              className={({ isActive }) => (isActive ? 'tab is-active' : 'tab')}
              to={firstItem.to}
            >
              {menu.triggerLabel}
            </NavLink>
          ) : (
            <div className={openMenu === menu.id ? 'tab-dropdown is-open' : 'tab-dropdown'} key={menu.id}>
              <button
                className="tab tab-dropdown-trigger"
                type="button"
                aria-haspopup="menu"
                aria-expanded={openMenu === menu.id}
                onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              >
                {menu.triggerLabel}
              </button>
              {openMenu === menu.id && (
                <ul className="tab-dropdown-menu" role="menu" aria-label={menu.ariaLabel}>
                  {menu.items.map((item) => (
                    <li key={item.to}>
                      <NavLink className="tab-dropdown-link" to={item.to} onClick={() => setOpenMenu(null)}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default TabHeader
