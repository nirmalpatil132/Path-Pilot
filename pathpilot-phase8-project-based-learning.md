# PathPilot — Phase 8: Project-Based Learning & Portfolio Evidence Documentation

## 1. Overview

Phase 8 introduces PathPilot's **Project-Based Learning & Portfolio Evidence System**. This module bridges career requirements, guided roadmaps, and verifiable student portfolio artifacts into a unified learning journey.

```
+--------------------------------------------------------------------------+
|                        Career Catalog & Competencies                     |
|          (Target role requirements, core competencies, toolstacks)       |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                  Explainable Skill-Gap Engine                            |
|             (CRITICAL_MISSING, RECOMMENDED_NEXT, OPTIONAL)               |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+------------------------------------+-------------------------------------+
|             Deterministic Project Recommendation Engine                  |
|    (Rule-based matching, transparent priority badges, gap coverage)      |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                 Student Project & Evidence Workspace                     |
|  (Catalog Templates, Custom Projects, Deliverables, Safe Task Linkage)   |
+--------------------------------------------------------------------------+
```

### Core Architectural Principles
- **Strictly Deterministic & Explainable**: 100% rule-based recommendation and gap-matching logic. Zero external AI/LLM calls.
- **Tri-Part Structural Connection**:
  1. **Career Requirements**: Grounded in curated career catalog skills and templates.
  2. **Learning Roadmap**: Roadmap tasks link optionally to project deliverables without rigid, lockstep coupling.
  3. **Practical Evidence**: Concrete deliverables (repositories, deployed applications, test suites, architecture notes) prove competency acquisition.
- **Realistic Verification Transparency**: PathPilot clearly designates deliverables as *student-submitted self-evidence*. The system states transparently that automated execution testing and mentor review are currently unsupported, setting honest expectations for students.
- **Safe Task Decoupling**: Marking a project as `COMPLETED` does **not** automatically mark roadmap tasks as finished. Students retain full agency over their daily learning schedule and progress tracking. Deleting a project safely unlinks roadmap tasks (`onDelete: SetNull`) without mutating or deleting the student's roadmap.
- **Strict Cross-User Data Isolation**: Projects, deliverables, and roadmap tasks enforce database-level and service-level tenant checks. A user can never read, modify, or link assets belonging to another account.
- **Defensive URL Validation**: All external URLs (GitHub repositories, live deployments, test reports) strictly require `http://` or `https://` schemas and reject dangerous protocols (`javascript:`, `data:`, `file:`, `ftp:`). PathPilot performs no server-side fetching, avoiding SSRF vulnerabilities.

---

## 2. Database Schema & Data Models

The Prisma schema (`backend/prisma/schema.prisma`) extends the core relational model with `Project` and `ProjectDeliverable` entities:

```prisma
model Project {
  id           String               @id @default(uuid())
  userId       String
  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  careerId     String?
  career       Career?              @relation(fields: [careerId], references: [id], onDelete: SetNull)
  title        String
  description  String
  status       String               @default("PLANNED") // "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED"
  skills       String               // JSON array string of skill names
  repoUrl      String?
  demoUrl      String?
  notes        String?
  deliverables ProjectDeliverable[]
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  @@index([userId])
  @@index([careerId])
  @@index([status])
}

model ProjectDeliverable {
  id            String       @id @default(uuid())
  projectId     String
  project       Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title         String
  description   String
  type          String       @default("FEATURE_MODULE") // "FEATURE_MODULE" | "CODE_REPOSITORY" | "DEPLOYED_DEMO" | "TEST_SUITE" | "DESIGN_PROTOTYPE" | "TECHNICAL_DOCS" | "IMPLEMENTATION_NOTE"
  status        String       @default("SUBMITTED") // "PLANNED" | "SUBMITTED"
  url           String?
  roadmapTaskId String?
  roadmapTask   RoadmapTask? @relation(fields: [roadmapTaskId], references: [id], onDelete: SetNull)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([projectId])
  @@index([roadmapTaskId])
}
```

### Relational Integrity & Cascade Rules
- `Project -> User`: Cascades on user deletion (`onDelete: Cascade`).
- `Project -> Career`: Nullified on career deprecation (`onDelete: SetNull`).
- `ProjectDeliverable -> Project`: Cascades on project deletion (`onDelete: Cascade`).
- `ProjectDeliverable -> RoadmapTask`: Nullified if a roadmap task is deleted or a roadmap is regenerated (`onDelete: SetNull`).

---

## 3. Deterministic Project Recommendation Engine

Located in `backend/src/services/project/projectRecommendationEngine.ts`, the recommendation engine evaluates curated projects from `CAREER_CATALOG_DATA` against the student's profile competencies and active target career.

### Scoring Formula & Weighting
Each candidate catalog project is evaluated deterministically:

$$\text{ProjectScore} = S_{\text{critical}} + S_{\text{recommended}} + S_{\text{optional}} + S_{\text{target}}$$

Where:
- $S_{\text{critical}} = 30 \times N_{\text{matched critical missing skills}}$
- $S_{\text{recommended}} = 15 \times N_{\text{matched recommended next skills}}$
- $S_{\text{optional}} = 5 \times N_{\text{matched optional advantage skills}}$
- $S_{\text{target}} = 40$ (if project belongs to student's chosen target career)

### Recommendation Priority Classification
1. **`CRITICAL_MISSING` (Score $\ge 50$ or covers $\ge 1$ critical skill)**: Immediate portfolio priority. Fills vital resume/competency gaps.
2. **`RECOMMENDED_NEXT` (Score $\ge 25$ or covers $\ge 1$ recommended skill)**: High-impact practical integration.
3. **`OPTIONAL_ADVANTAGE`**: Secondary specialization project.

### Deduplication & Status Awareness
- Projects already instantiated by the student (`IN_PROGRESS`, `COMPLETED`, or `PLANNED`) are flagged with `alreadyStarted: true` and excluded from top active suggestions to prevent redundant clutter.
- Transparent explanations accompany each recommendation:
  - *Identified skills addressed*
  - *Target career alignment*
  - *Recommended deliverable types*

---

## 4. Deliverables & Evidence Tracking

Deliverables represent discrete pieces of portfolio evidence attached to a project.

### Supported Deliverable Types
| Deliverable Type | Primary Purpose | Example Artifact |
| :--- | :--- | :--- |
| `CODE_REPOSITORY` | Source code link | GitHub / GitLab public repository URL |
| `DEPLOYED_DEMO` | Live running application | Vercel / Netlify / Cloud Run URL |
| `FEATURE_MODULE` | Focused milestone implementation | Core module, database schema, or auth service |
| `TEST_SUITE` | Automated test evidence | Vitest / Jest / PyTest test report or PR |
| `DESIGN_PROTOTYPE` | UI/UX specifications | Figma / Penpot design mockup |
| `TECHNICAL_DOCS` | Architecture & API documentation | Swagger / OpenAPI / Architecture Decision Record |
| `IMPLEMENTATION_NOTE`| Technical reflection & lessons learned | Markdown engineering log or challenge writeup |

### URL Validation & Security
External links must satisfy:
- Scheme whitelist: `http://` or `https://`
- Malformed inputs, control characters, and dangerous URI schemes (`javascript:`, `vbscript:`, `data:`, `file:`) are rejected with `400 Bad Request`.
- No outbound SSRF: The server never crawls or requests user URLs; it validates structure and stores clean strings.

### Transparency Disclaimer
Every deliverable entry and modal displays the standardized PathPilot evidence notice:
> **Self-Reported Evidence**: Deliverables are student-maintained portfolio links and artifacts. Automated runtime test verification and mentor evaluation are not currently supported in this version.

---

## 5. REST API Specifications

All endpoints are mounted under `/projects` and protected by `requireAuth`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/projects` | List all projects for authenticated student with optional `?status=` filter. |
| `GET` | `/projects/recommendations` | Get deterministic project recommendations based on skill gaps. |
| `GET` | `/projects/templates` | Retrieve curated catalog project templates. |
| `GET` | `/projects/metrics` | Summary counts (total, in progress, completed, deliverables count). |
| `GET` | `/projects/:id` | Get single project with deliverables and linked roadmap tasks. |
| `POST` | `/projects` | Create a new project (custom or seeded from template). |
| `PUT` | `/projects/:id` | Update project metadata, status, notes, or external links. |
| `DELETE` | `/projects/:id` | Delete project and cascade-delete deliverables. |
| `POST` | `/projects/:id/deliverables` | Add deliverable evidence to a project. |
| `PUT` | `/projects/:id/deliverables/:deliverableId` | Update deliverable title, type, status, or task linkage. |
| `DELETE` | `/projects/:id/deliverables/:deliverableId` | Remove deliverable evidence. |

---

## 6. Frontend Architecture & User Experience

Mounted under `/projects` and `/projects/:id` using React 19, TypeScript, and PathPilot Design Tokens:

### Key Components & Pages
1. **`ProjectsPage` (`/projects`)**:
   - Status navigation tabs (`All`, `In Progress`, `Planned`, `Completed`, `Archived`).
   - Summary statistics bar (Total Projects, In Progress, Completed, Total Evidence Items).
   - Recommended Projects Section with explainable skill-gap badges and one-click "Start Project".
   - Project cards displaying deliverables count, status badges, skill pills, and repo/demo links.
   - "New Project" modal supporting custom input or template pre-population.
2. **`ProjectDetailPage` (`/projects/:id`)**:
   - Status selector dropdown (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`).
   - Quick links toolbar (GitHub Repository, Deployed Demo, Add Evidence).
   - Learning reflections and technical notes block with auto-save capability.
   - Deliverables list with type icons, external link buttons, linked roadmap task badges, and delete actions.
   - Self-reported evidence policy notice.
3. **`CreateProjectModal` & `AddDeliverableModal`**:
   - Accessible keyboard trap, `aria-labelledby`, accessible labels.
   - Real-time client-side URL validation preventing protocol errors before API submission.
   - Optional Roadmap Task selector linking evidence to active 30-day roadmap tasks.
4. **Dashboard Integration (`/app` - `AppCheckpoint.tsx`)**:
   - Project Summary Widget rendering active projects, completed portfolio count, and quick CTA to browse recommendations.
   - Top navigation link to "Projects" workspace.

---

## 7. Verification & Test Suite

### Backend Test Coverage (`backend/tests/project.test.ts`)
- **24 tests** covering:
  - Deterministic recommendation scoring, weighting, and fallback logic.
  - CRUD operations on projects and deliverables.
  - Strict cross-user tenant isolation (Student B cannot read/edit/delete Student A's projects).
  - Cross-user task linkage validation (Student A cannot attach Student B's roadmap tasks).
  - Unsafe URL protocol rejection (`javascript:`, `ftp://`).
  - Safe task unlinking on project deletion without roadmap mutation.
- **Backend Test Suite Total**: 6 test files, **105 of 105 tests passing**.

### Frontend Test Coverage (`frontend/src/tests/projectComponents.test.tsx`)
- **6 tests** covering:
  - Rendering project workspace with recommendations and active projects.
  - Filtering projects by status tab (`In Progress`, `Completed`).
  - Rendering `ProjectCard` with status badges, skill tags, and link actions.
  - Rendering `DeliverableCard` with type badge and student-submitted indicator.
  - Creating new projects through the accessible modal.
  - Adding deliverables and rendering self-reported evidence disclaimer.
- **Frontend Test Suite Total**: 7 test files, **53 of 53 tests passing**.

### Build & Lint Verification
- Backend TypeScript compilation (`npm run build` in `backend`): **0 errors**.
- Frontend production build (`npm run build` in `frontend`): **0 errors** (CSS 56.9 kB, JS 466 kB).
- Linter (`npm run lint` in `frontend`): **0 errors**.
- Whitespace validation (`git diff --check`): **0 issues**.
