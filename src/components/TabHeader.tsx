import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { APP_ROUTES } from '../constants/routes'

function TabHeader() {
  const [openMenu, setOpenMenu] = useState<'user' | 'team' | 'remote' | null>(null)
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
    <header className="tab-header" aria-label="Dashboard tabs">
      <span className="tab-brand" aria-label="Bluesky brand left">
        bluesky
      </span>

      <nav className="tab-nav" aria-label="Dashboard navigation" ref={navRef}>
        <div
          className={openMenu === 'user' ? 'tab-dropdown is-open' : 'tab-dropdown'}
        >
          <button
            className="tab tab-dropdown-trigger"
            type="button"
            aria-haspopup="menu"
            aria-expanded={openMenu === 'user'}
            onClick={() => setOpenMenu((current) => (current === 'user' ? null : 'user'))}
          >
            User Management
          </button>
          {openMenu === 'user' && (
            <ul className="tab-dropdown-menu" role="menu" aria-label="User Management options">
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.userManagement}
                  onClick={() => setOpenMenu(null)}
                >
                  User Management
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.teamManagement}
                  onClick={() => setOpenMenu(null)}
                >
                  Team Management
                </NavLink>
              </li>
            </ul>
          )}
        </div>

        <div
          className={openMenu === 'team' ? 'tab-dropdown is-open' : 'tab-dropdown'}
        >
          <button
            className="tab tab-dropdown-trigger"
            type="button"
            aria-haspopup="menu"
            aria-expanded={openMenu === 'team'}
            onClick={() => setOpenMenu((current) => (current === 'team' ? null : 'team'))}
          >
            Team Management
          </button>
          {openMenu === 'team' && (
            <ul className="tab-dropdown-menu" role="menu" aria-label="Team Management options">
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.teamDashboard}
                  onClick={() => setOpenMenu(null)}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.teamDailyReport}
                  onClick={() => setOpenMenu(null)}
                >
                  Daily report
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.teamWorkMark}
                  onClick={() => setOpenMenu(null)}
                >
                  Work Mark
                </NavLink>
              </li>
            </ul>
          )}
        </div>

        <div
          className={openMenu === 'remote' ? 'tab-dropdown is-open' : 'tab-dropdown'}
        >
          <button
            className="tab tab-dropdown-trigger"
            type="button"
            aria-haspopup="menu"
            aria-expanded={openMenu === 'remote'}
            onClick={() => setOpenMenu((current) => (current === 'remote' ? null : 'remote'))}
          >
            Remote Job
          </button>
          {openMenu === 'remote' && (
            <ul className="tab-dropdown-menu" role="menu" aria-label="Remote Job options">
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.remoteDashboard}
                  onClick={() => setOpenMenu(null)}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.remoteBidManagement}
                  onClick={() => setOpenMenu(null)}
                >
                  Bid Management
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.remoteCallManagement}
                  onClick={() => setOpenMenu(null)}
                >
                  Call Management
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="tab-dropdown-link"
                  to={APP_ROUTES.remoteProfileManagement}
                  onClick={() => setOpenMenu(null)}
                >
                  Profile management
                </NavLink>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <span className="tab-brand tab-brand-right" aria-label="Bluesky brand right">
        bluesky
      </span>
    </header>
  )
}

export default TabHeader
