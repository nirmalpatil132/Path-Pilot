const productLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Explore Careers', href: '#careers' },
]

// No implemented destination yet — rendered as plain text rather than a
// link, so nothing 404s and nothing implies a page that doesn't exist.
const placeholderGroups: { title: string; items: string[] }[] = [
  { title: 'Company', items: ['About', 'Contact'] },
  { title: 'Legal', items: ['Privacy', 'Terms'] },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-2">
            <p className="text-h3 text-text-primary">PathPilot</p>
            <p className="max-w-xs text-body-sm text-text-secondary">
              A personalized career decision and action-planning platform for engineering and CS
              students.
            </p>
          </div>

          <nav aria-label="Product">
            <p className="text-label uppercase tracking-wide text-text-muted">Product</p>
            <ul className="mt-3 flex flex-col gap-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-body-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {placeholderGroups.map((group) => (
            <div key={group.title}>
              <p className="text-label uppercase tracking-wide text-text-muted">{group.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item} className="text-body-sm text-text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-caption text-text-muted">© {year} PathPilot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
