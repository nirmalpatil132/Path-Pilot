import { useState, type ReactNode } from 'react'

import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  EmptyState,
  Input,
  ProgressBar,
  ProgressRing,
  Select,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  type AlertVariant,
  type BadgeVariant,
  type ButtonVariant,
} from '@/components/ui'
import { NavbarShell } from '@/layouts/NavbarShell'
import { SidebarShell } from '@/layouts/SidebarShell'

const nav = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'forms', label: 'Forms' },
  { id: 'cards', label: 'Cards' },
  { id: 'badges', label: 'Badges' },
  { id: 'progress', label: 'Progress' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'empty-state', label: 'Empty State' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'navbar-shell', label: 'Navbar Shell' },
  { id: 'sidebar-shell', label: 'Sidebar Shell' },
]

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-h2 text-text-primary">{title}</h2>
        {description && <p className="max-w-2xl text-body text-text-secondary">{description}</p>}
      </div>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-label uppercase tracking-wide text-text-muted">{children}</p>
  )
}

function ColorSwatch({ name, token }: { name: string; token: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-md border border-border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <div>
        <p className="text-body-sm font-medium text-text-primary">{name}</p>
        <p className="text-caption text-text-muted">{token}</p>
      </div>
    </div>
  )
}

const colorGroups: { title: string; tokens: { name: string; token: string }[] }[] = [
  {
    title: 'Surfaces & borders',
    tokens: [
      { name: 'Background', token: '--color-background' },
      { name: 'Surface', token: '--color-surface' },
      { name: 'Surface Muted', token: '--color-surface-muted' },
      { name: 'Border', token: '--color-border' },
      { name: 'Border Strong', token: '--color-border-strong' },
    ],
  },
  {
    title: 'Text',
    tokens: [
      { name: 'Text Primary', token: '--color-text-primary' },
      { name: 'Text Secondary', token: '--color-text-secondary' },
      { name: 'Text Muted', token: '--color-text-muted' },
    ],
  },
  {
    title: 'Primary',
    tokens: [
      { name: 'Primary', token: '--color-primary' },
      { name: 'Primary Hover', token: '--color-primary-hover' },
      { name: 'Primary Active', token: '--color-primary-active' },
      { name: 'Primary Subtle', token: '--color-primary-subtle' },
    ],
  },
  {
    title: 'Status',
    tokens: [
      { name: 'Success', token: '--color-success' },
      { name: 'Warning', token: '--color-warning' },
      { name: 'Danger', token: '--color-danger' },
      { name: 'Focus', token: '--color-focus' },
    ],
  },
]

const typeScale: { name: string; className: string; sample: string }[] = [
  { name: 'Display', className: 'text-display', sample: 'Understand where you are.' },
  { name: 'H1', className: 'text-h1', sample: 'Explore where you can go.' },
  { name: 'H2', className: 'text-h2', sample: 'Know what to do next.' },
  { name: 'H3', className: 'text-h3', sample: 'A confident, editorial voice.' },
  { name: 'Body', className: 'text-body', sample: 'Body text used for descriptions and paragraphs across the product.' },
  { name: 'Body Small', className: 'text-body-sm', sample: 'Smaller supporting copy, helper text, and captions.' },
  { name: 'Caption', className: 'text-caption', sample: 'CAPTION AND METADATA TEXT' },
  { name: 'Label', className: 'text-label', sample: 'FORM LABEL TEXT' },
]

// Widths are written out as full, literal Tailwind class names (not built
// via template-string interpolation) because Tailwind's scanner statically
// greps source text for complete utility tokens — `w-${n}` would never match.
const spacingSteps: { px: string; className: string }[] = [
  { px: '4px', className: 'w-1' },
  { px: '8px', className: 'w-2' },
  { px: '12px', className: 'w-3' },
  { px: '16px', className: 'w-4' },
  { px: '24px', className: 'w-6' },
  { px: '32px', className: 'w-8' },
  { px: '48px', className: 'w-12' },
  { px: '64px', className: 'w-16' },
]

const radiusSteps: { name: string; className: string }[] = [
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'xl', className: 'rounded-xl' },
  { name: 'full', className: 'rounded-full' },
]

const shadowSteps: { name: string; className: string }[] = [
  { name: 'none', className: 'shadow-none' },
  { name: 'sm', className: 'shadow-sm' },
  { name: 'md', className: 'shadow-md' },
  { name: 'lg', className: 'shadow-lg' },
]

const breakpoints = [
  { name: 'xs', value: '375px' },
  { name: 'sm', value: '414px' },
  { name: 'md', value: '768px' },
  { name: 'lg', value: '1024px' },
  { name: 'xl', value: '1440px' },
]

const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']
const badgeVariants: BadgeVariant[] = ['default', 'primary', 'success', 'warning', 'danger', 'neutral']
const alertVariants: AlertVariant[] = ['info', 'success', 'warning', 'danger']

export default function StyleGuide() {
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [dismissibleVisible, setDismissibleVisible] = useState(true)

  return (
    <div className="min-h-screen bg-background pb-24">
      <a
        href="#tokens"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:text-text-inverse"
      >
        Skip to content
      </a>

      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <p className="text-label uppercase tracking-wide text-primary">Phase 1 · Internal only</p>
          <h1 className="mt-2 text-display text-text-primary">PathPilot Design System</h1>
          <p className="mt-3 max-w-2xl text-body text-text-secondary">
            The reusable tokens, primitives, and layout shells every future PathPilot screen will
            consume. This page is a visual QA environment, not a product page.
          </p>
        </div>
        <nav
          aria-label="Style guide sections"
          className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-4 md:px-8"
        >
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-body-sm text-text-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-14 md:px-8">
        {/* ---------------------------------------------------------- */}
        <Section
          id="tokens"
          title="Design tokens"
          description="Every component below consumes these tokens — colors, type scale, spacing, radius, shadow and breakpoints — instead of hard-coded values."
        >
          <div className="flex flex-col gap-6">
            <SubLabel>Colors</SubLabel>
            {colorGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <p className="text-body-sm font-medium text-text-primary">{group.title}</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {group.tokens.map((t) => (
                    <ColorSwatch key={t.token} name={t.name} token={t.token} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <SubLabel>Typography scale</SubLabel>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
              {typeScale.map((t) => (
                <div key={t.name} className="flex flex-col gap-1 px-5 py-4 md:flex-row md:items-baseline md:gap-6">
                  <span className="w-24 shrink-0 text-caption font-medium text-text-muted">{t.name}</span>
                  <p className={`${t.className} text-text-primary`}>{t.sample}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <SubLabel>Spacing scale (4px base)</SubLabel>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5">
              {spacingSteps.map((s) => (
                <div key={s.className} className="flex items-center gap-4">
                  <span className="w-16 shrink-0 text-caption text-text-muted">{s.px}</span>
                  <div className={`h-3 rounded bg-primary ${s.className}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <SubLabel>Radius</SubLabel>
              <div className="flex flex-wrap items-end gap-4">
                {radiusSteps.map((r) => (
                  <div key={r.name} className="flex flex-col items-center gap-2">
                    <div className={`h-14 w-14 border border-border bg-primary-subtle ${r.className}`} />
                    <span className="text-caption text-text-muted">{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <SubLabel>Shadow</SubLabel>
              <div className="flex flex-wrap items-end gap-4">
                {shadowSteps.map((s) => (
                  <div key={s.name} className="flex flex-col items-center gap-2">
                    <div className={`h-14 w-14 rounded-md border border-border bg-surface ${s.className}`} />
                    <span className="text-caption text-text-muted">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <SubLabel>Breakpoints</SubLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {breakpoints.map((b) => (
                <div key={b.name} className="rounded-md border border-border bg-surface px-4 py-3 text-center">
                  <p className="text-body-sm font-semibold text-text-primary">{b.name}</p>
                  <p className="text-caption text-text-muted">{b.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section
          id="buttons"
          title="Buttons"
          description="Tab through these to check focus rings; hover to check hover states."
        >
          <div className="flex flex-col gap-6">
            {buttonVariants.map((variant) => (
              <div key={variant} className="flex flex-col gap-2">
                <SubLabel>{variant}</SubLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant={variant} size="sm">
                    Small
                  </Button>
                  <Button variant={variant} size="md">
                    Medium
                  </Button>
                  <Button variant={variant} size="lg">
                    Large
                  </Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <SubLabel>Loading (no layout jump)</SubLabel>
            <p className="text-body-sm text-text-secondary">
              The button's label stays the same element — only <code>isLoading</code> toggles —
              so its width never changes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button isLoading={loadingDemo}>Continue</Button>
              <Toggle
                label="Toggle loading"
                checked={loadingDemo}
                onChange={(e) => setLoadingDemo(e.target.checked)}
              />
              <Button variant="secondary" isLoading>
                Always loading
              </Button>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section
          id="forms"
          title="Form components"
          description="Input, Select, Textarea, Checkbox and Toggle — each shown in default, error and disabled states."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Input label="Full name" placeholder="Rahul Sharma" helperText="As it appears on your ID" />
            <Input label="Email" placeholder="you@college.edu" error="Enter a valid email address" defaultValue="not-an-email" />
            <Input label="College" placeholder="Disabled field" disabled />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Select label="Branch" defaultValue="">
              <option value="" disabled>
                Select a branch
              </option>
              <option value="cse">Computer Science</option>
              <option value="ece">Electronics</option>
              <option value="mech">Mechanical</option>
            </Select>
            <Select label="Year" error="Select your current year" defaultValue="">
              <option value="" disabled>
                Select a year
              </option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
            </Select>
            <Select label="University" disabled defaultValue="">
              <option value="">Disabled field</option>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Textarea label="Notes" placeholder="Optional context…" helperText="Up to 500 characters" />
            <Textarea label="Bio" error="This field can't be empty" />
            <Textarea label="Disabled" disabled placeholder="Disabled field" />
          </div>

          <div className="flex flex-wrap gap-10">
            <div className="flex flex-col gap-3">
              <SubLabel>Checkbox</SubLabel>
              <Checkbox label="Unchecked" />
              <Checkbox label="Checked" defaultChecked />
              <Checkbox label="Error" error />
              <Checkbox label="Disabled" disabled />
            </div>
            <div className="flex flex-col gap-3">
              <SubLabel>Toggle</SubLabel>
              <Toggle label="Off" />
              <Toggle label="On" defaultChecked />
              <Toggle label="Disabled" disabled />
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="cards" title="Cards" description="A reusable Card composition: Card, CardHeader, CardContent, CardFooter.">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="text-h3 text-text-primary">Card heading</h3>
                <p className="text-body-sm text-text-secondary">Optional supporting subtext</p>
              </CardHeader>
              <CardContent>
                Supporting description text for this card component, demonstrating body copy at
                comfortable line length and color contrast.
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Confirm</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 text-text-primary">With a badge</h3>
                  <Badge variant="success">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p>Cards compose freely with other primitives like Badge and ProgressBar.</p>
                <ProgressBar value={68} showValue label="Progress" />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="badges" title="Badges" description="Status/context variants.">
          <div className="flex flex-wrap gap-3">
            {badgeVariants.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="progress" title="Progress" description="ProgressBar and ProgressRing at multiple values.">
          <div className="flex flex-col gap-4">
            <SubLabel>Progress bar</SubLabel>
            <div className="flex max-w-md flex-col gap-4">
              <ProgressBar value={0} showValue label="Not started" />
              <ProgressBar value={42} showValue label="In progress" />
              <ProgressBar value={72} showValue label="Almost there" />
              <ProgressBar value={100} showValue label="Complete" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <SubLabel>Progress ring</SubLabel>
            <div className="flex flex-wrap items-center gap-8">
              <ProgressRing value={0} />
              <ProgressRing value={42} />
              <ProgressRing value={72} />
              <ProgressRing value={100} />
              <ProgressRing value={58} size={96} strokeWidth={9} />
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="alerts" title="Alerts" description="info, success, warning, danger.">
          <div className="flex flex-col gap-4">
            {alertVariants.map((variant) => (
              <Alert key={variant} variant={variant} title={`${variant[0].toUpperCase()}${variant.slice(1)} alert`}>
                A short, explainable message describing why this alert appeared.
              </Alert>
            ))}
            {dismissibleVisible && (
              <Alert
                variant="info"
                title="Dismissible alert"
                dismissible
                onDismiss={() => setDismissibleVisible(false)}
              >
                Click the close button to dismiss this alert.
              </Alert>
            )}
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="skeleton" title="Skeleton" description="Loading placeholders — respects prefers-reduced-motion.">
          <div className="flex max-w-md items-center gap-4 rounded-lg border border-border bg-surface p-5">
            <Skeleton variant="circle" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="90%" />
            </div>
          </div>
          <Skeleton variant="rect" className="max-w-md" />
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="empty-state" title="Empty State" description="For future screens with no data yet.">
          <EmptyState
            icon={
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M4 7h16M4 12h16M4 17h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="Nothing here yet"
            description="When items are added, they'll show up in this space."
            action={<Button size="sm">Add item</Button>}
          />
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="tabs" title="Tabs" description="Arrow keys move focus between tabs; Home/End jump to the ends.">
          <Tabs defaultValue="one" className="max-w-xl">
            <TabsList aria-label="Example tabs">
              <TabsTrigger value="one">Overview</TabsTrigger>
              <TabsTrigger value="two">Details</TabsTrigger>
              <TabsTrigger value="three">Disabled</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <p className="text-body text-text-secondary">Content for the first tab panel.</p>
            </TabsContent>
            <TabsContent value="two">
              <p className="text-body text-text-secondary">Content for the second tab panel.</p>
            </TabsContent>
            <TabsContent value="three">
              <p className="text-body text-text-secondary">Content for the third tab panel.</p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="navbar-shell" title="Navbar Shell" description="Structural shell only — brand, nav-links and actions slots.">
          <div className="overflow-hidden rounded-lg border border-border">
            <NavbarShell
              brand={<span>PathPilot</span>}
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                  <Button size="sm">Get started</Button>
                </>
              }
            >
              <a href="#" className="text-body-sm text-text-secondary hover:text-text-primary">
                Overview
              </a>
              <a href="#" className="text-body-sm text-text-secondary hover:text-text-primary">
                Components
              </a>
              <a href="#" className="text-body-sm text-text-secondary hover:text-text-primary">
                Guidelines
              </a>
            </NavbarShell>
            <div className="flex h-32 items-center justify-center bg-background text-body-sm text-text-muted">
              Page content placeholder
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------- */}
        <Section id="sidebar-shell" title="Sidebar Shell" description="Structural shell only — sidebar and content-area slots, collapses to a drawer on mobile.">
          <div className="h-[560px] overflow-hidden rounded-lg border border-border">
            <SidebarShell
              sidebar={
                <nav className="flex flex-col gap-1">
                  <span className="mb-2 px-2 text-label uppercase tracking-wide text-text-muted">
                    Menu
                  </span>
                  {['Overview', 'Section A', 'Section B', 'Section C'].map((label, i) => (
                    <a
                      key={label}
                      href="#"
                      className={`rounded-md px-2.5 py-2 text-body-sm ${
                        i === 0
                          ? 'bg-primary-subtle text-primary-active'
                          : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                      }`}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              }
            >
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-body-sm text-text-muted">
                Page content placeholder
              </div>
            </SidebarShell>
          </div>
        </Section>
      </main>
    </div>
  )
}
