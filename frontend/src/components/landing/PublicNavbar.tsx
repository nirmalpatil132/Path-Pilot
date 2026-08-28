import { Button } from '@/components/ui'
import { NavbarShell } from '@/layouts/NavbarShell'
import { scrollToId } from '@/lib/scrollToId'

const navLinks = [
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'careers', label: 'Explore Careers' },
  { id: 'explainable-fit', label: 'Why PathPilot' },
]

/**
 * Public, unauthenticated landing-page navigation — built on the Phase 1
 * NavbarShell. No dashboard/settings/profile items; those belong to a
 * later, authenticated phase.
 */
export function PublicNavbar() {
  return (
    <NavbarShell
      brand={<span>PathPilot</span>}
      actions={
        <Button size="sm" onClick={() => scrollToId('how-it-works')}>
          Find My Path
        </Button>
      }
    >
      {navLinks.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="text-body-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          {link.label}
        </a>
      ))}
    </NavbarShell>
  )
}
