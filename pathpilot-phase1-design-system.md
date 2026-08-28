# PathPilot — Block 1 / Phase 1: Design System + UI Foundation

## 1. Objective

Establish a single, reusable visual language and component library that every later PathPilot screen (landing page, auth, onboarding, dashboard, career explorer, etc.) will consume — so we stop reinventing buttons, cards, and spacing on every phase.

This phase produces **no product screens**. It produces the **building blocks** those screens will be made of.

---

## 2. What We Are Building

A component + token library covering:

- Design tokens: color, typography, spacing, radius, shadow, breakpoints
- Core primitives: Button, Input, Select, Textarea, Checkbox/Toggle
- Layout: Card, Container, Grid/Stack, Divider
- Feedback: Badge, Progress bar/ring, Toast/Alert, Skeleton loader
- Navigation: Navbar shell, Sidebar shell, Tabs
- States: Empty state, Loading state, Error state (as components, not one-offs)
- A `/style-guide` (or `/dev/style-guide`) route that renders every component + token so we can visually QA the system in isolation, before any real page uses it

---

## 3. Files / Modules Involved

Frontend only (`frontend/src/...`) — no backend work in this phase.

```
frontend/src/
├── styles/
│   ├── tokens.css          # CSS variables: color, spacing, radius, shadow, breakpoints
│   └── globals.css         # base resets, font imports, body defaults
│
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── Checkbox.tsx
│       ├── Toggle.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── ProgressBar.tsx
│       ├── ProgressRing.tsx
│       ├── Alert.tsx
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       ├── Tabs.tsx
│       └── index.ts         # barrel export
│
├── layouts/
│   ├── NavbarShell.tsx
│   └── SidebarShell.tsx
│
└── pages/ (or routes/)
    └── dev/StyleGuide.tsx   # renders the whole system for visual QA
```

Assume Tailwind (or CSS variables + plain CSS if Tailwind isn't already in the stack from Phase 0) — Antigravity should detect what Phase 0 actually installed and match it rather than introducing a second styling system.

---

## 4. Technical Decisions

- **Tokens as CSS variables**, not hard-coded hex values in components — every component reads from `tokens.css` so a future rebrand/theming pass touches one file.
- **Visual direction:** modern career-tech SaaS / premium student dashboard — not a generic "AI dashboard." Confident, clean, a little bit editorial — not another purple-gradient-and-glassmorphism template.
- **Palette** (starting point, refine visually in the style guide):

| Token | Value |
|---|---|
| Background | `#F8FAFC` |
| Surface (card) | `#FFFFFF` |
| Primary | `#4F46E5` |
| Primary Dark | `#3730A3` |
| Text | `#0F172A` |
| Secondary Text | `#64748B` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Border | `#E2E8F0` |

- **Typography:** one primary typeface (e.g. Inter or similar geometric sans already common in SaaS), a defined type scale (display / h1 / h2 / h3 / body / small / caption), consistent line-height and weight rules — not ad hoc `text-lg font-semibold` scattered per screen.
- **Spacing:** a single spacing scale (4/8px base) used everywhere — components should never use arbitrary pixel values.
- **Components must be prop-driven and stateless** where reasonable — e.g. `<Badge variant="success">`, `<Button variant="primary" size="md">` — no page should need to override component internals with custom CSS to get standard variants.
- **Responsive from the start:** every primitive should behave correctly at the breakpoints defined in tokens (mobile 375–414px, tablet 768px, desktop 1024–1440px) — this phase is where that discipline gets set, not retrofitted in Phase 15.
- **Accessibility baseline:** proper focus states, sufficient contrast per the palette above, semantic elements (real `<button>`, real `<label>` associations) — cheap to do now, expensive to bolt on later.

---

## 5. Acceptance Criteria

- [ ] `tokens.css` exists and every component consumes it — zero hard-coded colors/spacing in component files
- [ ] `/dev/style-guide` route renders and shows: full color palette, full type scale, all button variants/sizes/states (default, hover, disabled, loading), all input states (default, focus, error, disabled), all badges, both progress components, alert/toast variants, skeleton loader, empty state, and the navbar/sidebar shells
- [ ] Every component is responsive and doesn't break at 375px, 768px, or 1440px
- [ ] No product page has been touched — this phase is isolated to `components/ui`, `layouts`, `styles`, and the dev style-guide route
- [ ] Repository builds and runs with no console errors
- [ ] Components are exported from a single barrel (`components/ui/index.ts`) so future phases import cleanly: `import { Button, Card, Badge } from '@/components/ui'`

---

## 6. Exact Prompt for Antigravity

```
Context: This is the PathPilot repository. Phase 0 (project foundation/repo
structure) is already complete — inspect the existing repo structure and
stack before writing anything. Do NOT rebuild or reinitialize the project.

Task: Implement ONLY Phase 1 — Design System + UI Foundation. Do not build
the landing page, auth, onboarding, or any product screen. This phase
produces reusable building blocks only, verified through an isolated
style-guide route.

Build:
1. Design tokens as CSS variables (frontend/src/styles/tokens.css) covering
   color, typography scale, spacing scale (4/8px base), border radius,
   shadows, and responsive breakpoints (375px, 768px, 1024px, 1440px).
   Use this starting palette:
   - Background #F8FAFC, Surface #FFFFFF, Primary #4F46E5,
     Primary Dark #3730A3, Text #0F172A, Secondary Text #64748B,
     Success #10B981, Warning #F59E0B, Danger #EF4444, Border #E2E8F0
   Visual direction: modern career-tech SaaS / premium student dashboard —
   confident and clean, not a generic AI-gradient template.

2. Core UI components in frontend/src/components/ui/, each prop-driven with
   documented variants:
   - Button (variants: primary, secondary, ghost, danger; sizes: sm, md, lg;
     states: default, hover, disabled, loading)
   - Input, Select, Textarea, Checkbox, Toggle (states: default, focus,
     error, disabled)
   - Card, Badge (variants matching status colors), ProgressBar, ProgressRing
   - Alert (variants: info, success, warning, danger), Skeleton loader,
     EmptyState, Tabs

3. Layout shells: NavbarShell, SidebarShell (structure only — no real nav
   items yet, this isn't the real app shell, just the visual container).

4. A single barrel export at components/ui/index.ts.

5. A /dev/style-guide route that renders every token and every component in
   every variant/state so we can visually QA the whole system in one place
   before any real page consumes it.

Constraints:
- Every component must read colors/spacing from the token file — no
  hard-coded hex values or arbitrary pixel values in component code.
- Match whatever styling approach (Tailwind, CSS modules, etc.) Phase 0
  already set up — don't introduce a second competing system.
- Every component must be responsive and tested visually at 375px, 768px,
  and 1440px.
- Include proper focus states and semantic HTML for accessibility.
- Do not touch, create, or modify any authentication, landing page, or
  onboarding files — this phase is scoped to styles/, components/ui/,
  layouts/, and the dev style-guide route only.

Deliverable: a working /dev/style-guide page I can open in the browser that
shows the entire design system in one place.
```

---

## 7. How You Verify Antigravity's Work

1. Run the app, navigate to `/dev/style-guide`, and eyeball it against the palette/visual-direction above — does it look like a premium SaaS product or a generic template?
2. Resize the browser through 1440 → 1024 → 768 → 414 → 375px and check nothing breaks or overflows.
3. Tab through the page with keyboard only — confirm visible focus states on every interactive element.
4. Open `components/ui/` and spot-check 2–3 files for hard-coded hex/pixel values instead of token references — reject if you find them.
5. Confirm no files outside `styles/`, `components/ui/`, `layouts/`, and the dev route were touched (`git diff --stat` against the Phase 0 commit).
6. Confirm `import { Button, Card } from '@/components/ui'` works cleanly from a scratch test.

---

## 8. What We Do Next

Once the style guide passes your visual review and the acceptance criteria above are checked off, we move to **Phase 2 — Landing Page**, which will consume this component library rather than inventing its own styling.
