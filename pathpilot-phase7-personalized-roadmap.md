# PathPilot — Phase 7: Personalized Learning Roadmap & Progress Tracking Documentation

## 1. Overview

Phase 7 implements PathPilot's personalized, rules-based **30-Day Learning Roadmap & Progress Tracking Engine**. The engine converts student profile competencies and Phase 6 skill-gap analysis (`CRITICAL_MISSING`, `RECOMMENDED_NEXT`, `OPTIONAL_ADVANTAGE`) into a structured, realistic, and motivating 4-week execution plan tailored to a chosen career path.

### Core Guiding Principles
- **Strictly Deterministic & Explainable**: Zero non-deterministic AI/LLM calls. Tasks, sequencing, estimated minutes, completion criteria, and expected outputs are deterministically derived from career core skills, supporting skills, student profile competencies, and curated Phase 5 career catalog projects.
- **Explicit Student Choice**: Roadmaps are never silently generated or forced upon the user. The student explicitly selects or confirms their target career and weekly study commitment.
- **Realistic Time-Budget Pacing**: Adapts task durations and workload targets based on student weekly study availability (8, 12, 15, or 20 hours/week). When available hours cannot fit all identified gaps within 30 days, lower-priority skills are transparently flagged as *deferred* rather than silently dropped or crammed unrealistically.
- **Concrete 4-Week Progression**:
  - **Week 1 (Days 1–7)**: Technical Foundations
  - **Week 2 (Days 8–14)**: Practice & Integration
  - **Week 3 (Days 15–21)**: Practical Project Implementation
  - **Week 4 (Days 22–30, 9 days)**: Deployment & Portfolio Consolidation
- **Safe Versioned Regeneration**: Regenerating a roadmap archives previous roadmaps (setting `status = 'ARCHIVED'` and incrementing `version`), preserving historical records. Completed competencies can be preserved to avoid redundant work.
- **Atomic Progress & State Tracking**: Every task transition (`NOT_STARTED` ↔ `IN_PROGRESS` ↔ `COMPLETED` ↔ `BLOCKED`) recalculates task counts and overall completion percentages atomically in the database.

---

## 2. 30-Day Progression Architecture

The 30-day roadmap is partitioned into four sequential weekly phases with distinct pedagogy, milestone outcomes, and daily pacing:

| Week | Focus | Day Range | Target Milestones & Deliverables |
| :--- | :--- | :---: | :--- |
| **Week 1** | **Technical Foundations** | Days 1–7 | Setup development environment, isolate critical syntax and core APIs, and build a baseline proof-of-concept module. |
| **Week 2** | **Practice & Integration** | Days 8–14 | Connect architectural components (databases, state, external services), implement error handling, and complete integration tests. |
| **Week 3** | **Practical Project Implementation** | Days 15–21 | Synthesize skills into an end-to-end portfolio project derived from the curated Phase 5 career catalog example projects. |
| **Week 4** | **Deployment & Portfolio Consolidation** | Days 22–30 *(9 days)* | Deploy to cloud/staging environment, configure CI/CD or health monitoring, draft technical README, and consolidate portfolio artifact. |

### Task Composition & Distribution
- **Total Tasks**: Exactly 12 structured tasks (3 tasks per week).
- **Task Durations**: 90 to 180 minutes per task (paced for typical multi-day learning sessions).
- **Pacing Rhythm**:
  - Task 1 of each week: Early-week foundation/conceptualization (e.g., Days 1–2, Days 8–10, Days 15–17, Days 22–24).
  - Task 2 of each week: Mid-week hands-on implementation & deep dive (e.g., Days 3–5, Days 11–12, Days 18–19, Days 25–27).
  - Task 3 of each week: Late-week integration, review, testing, or deployment milestone (e.g., Days 6–7, Days 13–14, Days 20–21, Days 28–30).

---

## 3. Realistic Time-Budget Adaptation Engine

The roadmap generation algorithm calculates the student's study capacity and enforces realistic limits:

$$\text{Weekly Target Minutes} = \text{weeklyHours} \times 60$$
$$\text{Max Allowable Weekly Task Load} \le \text{Weekly Target Minutes} \times 0.75$$

*(The remaining 25% budget is intentionally reserved for student self-study, research, syntax review, and debugging.)*

### Workload Allocations by Commitment Tier
- **8 Hours / Week (Light)**: Task budgets target 90–120 minutes each (~6 hrs guided tasks + 2 hrs self-study).
- **12 Hours / Week (Standard, Recommended)**: Task budgets target 120–150 minutes each (~7.5 hrs guided tasks + 4.5 hrs self-study).
- **15 Hours / Week (Intensive)**: Task budgets target 150–180 minutes each (~9 hrs guided tasks + 6 hrs self-study).
- **20 Hours / Week (Accelerated)**: Task budgets target 180 minutes each (~9 hrs guided tasks + 11 hrs deep-dive projects).

### Skill Prioritization & Deferred Skills Handling
1. **Critical Missing Skills (`CRITICAL_MISSING`)** from Phase 6 skill gap analysis receive highest priority and are assigned to Weeks 1 and 2.
2. **Recommended Next Skills (`RECOMMENDED_NEXT`)** are woven into Week 2 and Week 3 project features.
3. **Optional Advantage Skills (`OPTIONAL_ADVANTAGE`)** are integrated into Week 4 enhancements if time permits.
4. **Deferred Skills Disclosure**: If the total skill gaps exceed what can be mastered comfortably within 4 weeks at the chosen study rate, remaining skills are recorded in `deferredSkills` and presented transparently in the UI with a constructive note:
   > *"These skills are deferred to post-30-day follow-up modules to maintain a sustainable, high-retention weekly pace."*

---

## 4. Database Schema & Models

Implemented in SQLite via Prisma (`backend/prisma/schema.prisma`):

```prisma
model Roadmap {
  id                  String        @id @default(uuid())
  userId              String
  careerId            String
  careerSlug          String
  careerTitle         String
  careerCategory      String
  careerSummary       String
  version             Int           @default(1)
  status              String        @default("ACTIVE") // ACTIVE, ARCHIVED, COMPLETED
  weeklyHoursAssumed  Int           @default(12)
  totalDays           Int           @default(30)
  totalTasks          Int           @default(12)
  completedTasks      Int           @default(0)
  inProgressTasks     Int           @default(0)
  blockedTasks        Int           @default(0)
  progressPercentage  Float         @default(0.0)
  skillGapsAddressed  String        // JSON array of string skill names
  assumptions         String        // JSON array of strings
  deferredSkills      String        // JSON array of strings
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  career              Career        @relation(fields: [careerId], references: [id], onDelete: Cascade)
  tasks               RoadmapTask[]

  @@index([userId])
  @@index([careerId])
  @@index([userId, status])
}

model RoadmapTask {
  id                  String    @id @default(uuid())
  roadmapId           String
  weekNumber          Int       // 1, 2, 3, or 4
  dayNumber           Int       // 1 to 30
  dayRange            String    // e.g. "Days 1–2", "Days 28–30"
  orderIndex          Int       // 1 to 12
  title               String
  description         String
  estimatedMinutes    Int       // 90 to 180
  skillName           String
  skillCategory       String    // CRITICAL_MISSING, RECOMMENDED_NEXT, OPTIONAL_ADVANTAGE, CAPSTONE
  prerequisites       String    // JSON array of strings
  completionCriteria  String
  expectedOutput      String
  status              String    @default("NOT_STARTED") // NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED
  notes               String?
  completedAt         DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  roadmap             Roadmap   @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@index([roadmapId])
  @@index([roadmapId, weekNumber])
}
```

---

## 5. REST API Endpoints

All endpoints are mounted under `/roadmap` and require an active session (`requireAuth`):

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/roadmap/current` | Returns active roadmap with weekly groups and computed stats. Returns `{ hasRoadmap: false, roadmap: null }` if none. | `200`, `401`, `500` |
| `GET` | `/roadmap/:id` | Returns specific roadmap by ID (verifying student ownership). | `200`, `401`, `403`, `404`, `500` |
| `POST` | `/roadmap/generate` | Generates and persists a new 30-day roadmap for a chosen career slug. | `201`, `400`, `401`, `404`, `409` |
| `POST` | `/roadmap/regenerate` | Safely archives current roadmap, increments version, optionally preserves completed skills, and returns new plan. | `201`, `400`, `401`, `404`, `500` |
| `PATCH` | `/roadmap/tasks/:taskId` | Updates task status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`) and optional notes. Recalculates progress atomically. | `200`, `400`, `401`, `403`, `404`, `500` |

### Key API Guarantees
- **Conflict Guard**: `POST /roadmap/generate` returns HTTP `409 Conflict` if the student already has an active roadmap, guiding them to use `POST /roadmap/regenerate` instead of accidentally overwriting an active journey.
- **Strict User Isolation**: Tasks and roadmaps verify `roadmap.userId === req.user.id`. Any attempt to access or modify another student's task returns HTTP `403 Forbidden`.
- **Atomic Progress Updates**: Updating a single task atomically updates `completedTasks`, `inProgressTasks`, `blockedTasks`, `progressPercentage`, and `completedAt`.

---

## 6. Frontend Experience & UI Architecture

### Dedicated Roadmap Page (`/roadmap`)
- **Active State**:
  - **RoadmapHeader**: Target career badge, version tag, overall progress bar with percentage, completed/in-progress/blocked task counters, collapsible assumptions & deferred skills accordion, and a "Regenerate Roadmap" action button.
  - **RoadmapWeekSection**: Four weekly accordions displaying week title, day range, primary objective, and concrete milestone outcome callout.
  - **RoadmapTaskCard**: Distinct task cards featuring status badges, day badge, skill tag, time estimate, completion criteria, expected output, and interactive status buttons (`Start`, `Complete`, `Mark Blocked`, `Reset`). Allows writing evidence and reflection notes.
- **Empty State**:
  - Interactive onboarding view allowing students to select a target career path and study budget (8, 12, 15, or 20 hrs/week) before clicking **Generate 30-Day Roadmap**.
- **RegenerateRoadmapModal**:
  - Explains the archiving policy (previous progress is safely preserved in history).
  - Allows switching career paths or adjusting weekly hours.
  - Includes a checkbox for *"Preserve completed skills from current roadmap"*.

### Cross-Phase Navigation & Touchpoints
- **Student Dashboard (`/app`)**:
  - Active 30-Day Roadmap widget displaying target career, current week, progress bar, completed task count, and a direct link to `/roadmap`.
  - Empty state prompting roadmap generation if no active plan exists.
- **Career Detail (`/careers/:slug`)**:
  - Banner CTA: *"Ready to bridge your skill gaps for [Career Title]? Generate a deterministic 30-day learning roadmap tailored to your profile."*
  - Links to `/roadmap?career=[slug]`, preselecting the career.

---

## 7. Verification & Test Suite Summary

### Backend Test Suite (`backend/tests/roadmap.test.ts`)
- **15 Tests passing (100%)**:
  1. Empty roadmap state returns `hasRoadmap: false`.
  2. Generates, persists, and retrieves 30-day roadmap with 4 weeks and 12 tasks.
  3. Rejects unknown career slug with `404 Not Found`.
  4. Returns `409 Conflict` when trying to generate over an existing active plan.
  5. Updates task status and recalculates progress metrics atomically.
  6. Rejects invalid task status transitions with `400 Bad Request`.
  7. Enforces cross-user ownership isolation for roadmaps and tasks (`403 Forbidden`).
  8. Regenerates roadmap safely, archiving previous plan and incrementing version.
  9. Deterministic generation logic creates valid 4-week structure across varying hours.
  10. Adapts task durations realistically according to weekly hour commitments.
  11. Correctly identifies and documents deferred skills.
  12. Preserves completed skills during regeneration when requested.
  13. Distributes tasks across all 30 days realistically.
  14. Validates presence of clear completion criteria and expected outputs.
  15. Integrates Phase 5 career project definitions into Week 3 tasks.
- **Overall Backend**: 5 test files, 81 of 81 tests passing.
- **Backend Build**: `tsc` passed with 0 errors.

### Frontend Test Suite (`frontend/src/tests/roadmapComponents.test.tsx`)
- **5 Tests passing (100%)**:
  1. Renders empty roadmap state with career selector and hours dropdown.
  2. Renders active roadmap with header metrics, week sections, and task cards.
  3. Interactive task status updates and progress recalculation.
  4. Dashboard widget integration in `/app`.
  5. Career detail CTA banner and deep linking in `/careers/:slug`.
- **Overall Frontend**: 6 test files, 47 of 47 tests passing.
- **Frontend Build**: `tsc -b && vite build` passed with 0 errors.
- **Frontend Lint**: `oxlint` passed with 0 errors.
