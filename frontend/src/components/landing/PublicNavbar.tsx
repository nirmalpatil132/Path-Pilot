import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { NavbarShell } from '@/layouts/NavbarShell'

/**
 * Public landing-page navigation with authentication awareness.
 * Displays Sign In / Get Started when unauthenticated, and
 * Go to App / user badge when logged in.
 */
export function PublicNavbar() {
  const { user } = useAuth()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <NavbarShell
      brand={
        <Link to="/" className="text-text-primary hover:opacity-90 font-bold">
          PathPilot
        </Link>
      }
      actions={
        user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-body-sm font-medium text-text-secondary md:inline-block">
              {user.name}
            </span>
            <Link to="/app">
              <Button size="sm">Go to App</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-2 py-1 text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Sign In
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        )
      }
    >
      <a
        href={isHomePage ? '#how-it-works' : '/#how-it-works'}
        className="text-body-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        How It Works
      </a>
      <Link
        to="/careers"
        className="text-body-sm text-text-secondary transition-colors hover:text-text-primary font-medium"
      >
        Explore Careers
      </Link>
      <a
        href={isHomePage ? '#explainable-fit' : '/#explainable-fit'}
        className="text-body-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        Why PathPilot
      </a>
    </NavbarShell>
  )
}
