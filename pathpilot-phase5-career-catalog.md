# PathPilot — Phase 5: Career Explorer & Career Catalog Documentation

## 1. Overview

Phase 5 establishes PathPilot's initial Career Explorer experience, providing students with a structured, curated reference catalog of 10 tech career paths across engineering, data, security, infrastructure, and design.

The system helps students understand realistic job responsibilities, required core competencies, entry-level titles, benchmark portfolio projects, and related career paths without relying on unvalidated salary claims or premature AI matching.

---

## 2. Career Catalog Architecture & Data Model

The catalog is backed by Prisma with SQLite and structured into two relational models:

### Prisma Schema (`backend/prisma/schema.prisma`)

```prisma
model Career {
  id                 String        @id @default(cuid())
  slug               String        @unique
  title              String
  category           String        // Engineering | Data | Security | Infrastructure | Design
  summary            String
  description        String
  responsibilities   String        // JSON array of strings
  commonJobTitles    String        // JSON array of strings
  exampleProjects    String        // JSON array of { title, description, skills }
  prerequisites      String?       // JSON array of strings
  relatedCareerSlugs String?       // JSON array of strings (e.g. ["full-stack-developer"])
  growthPaths        String?       // JSON array of strings
  interviewAreas     String?       // JSON array of strings
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  skills             CareerSkill[]
}

model CareerSkill {
  id          String   @id @default(cuid())
  careerId    String
  career      Career   @relation(fields: [careerId], references: [id], onDelete: Cascade)
  name        String
  type        String   // "core" | "supporting"
  description String?
  createdAt   DateTime @default(now())

  @@unique([careerId, name])
}
```

### Initial Curated Career Universe (10 Careers)

1. **Software Developer** (`software-developer`, Category: *Engineering*)
2. **Frontend Developer** (`frontend-developer`, Category: *Engineering*)
3. **Backend Developer** (`backend-developer`, Category: *Engineering*)
4. **Full Stack Developer** (`full-stack-developer`, Category: *Engineering*)
5. **Data Analyst** (`data-analyst`, Category: *Data*)
6. **Data Scientist** (`data-scientist`, Category: *Data*)
7. **Machine Learning Engineer** (`machine-learning-engineer`, Category: *Data*)
8. **Cybersecurity Analyst** (`cybersecurity-analyst`, Category: *Security*)
9. **Cloud / DevOps Engineer** (`cloud-devops-engineer`, Category: *Infrastructure*)
10. **UI/UX Designer** (`ui-ux-designer`, Category: *Design*)

---

## 3. API Routes & Contracts

All career endpoints are mounted at `/careers` as public reference resources (accessible by visitors and authenticated students alike, without exposing any private user data).

### `GET /careers`
Retrieves available careers with optional search and category filters.

- **Query Parameters:**
  - `search` (optional string): Case-insensitive keyword search against title, summary, description, category, and skills.
  - `category` (optional string): Filter by category (`Engineering`, `Data`, `Security`, `Infrastructure`, `Design`).

- **Example Response:**
```json
{
  "careers": [
    {
      "id": "c1...",
      "slug": "backend-developer",
      "title": "Backend Developer",
      "category": "Engineering",
      "summary": "Architect, build, and optimize scalable server-side systems, REST APIs, and database schemas.",
      "description": "Backend Developers engineer the behind-the-scenes engine...",
      "coreSkills": ["RESTful API Design", "Relational Databases & SQL", "Node.js / Express / Python", "Authentication & Security", "Data Modeling & ORMs"],
      "supportingSkills": ["Docker & Containerization", "Caching (Redis)", "Automated Testing", "Message Queues"],
      "commonJobTitles": ["Junior Backend Developer", "Associate Backend Engineer", "Server-Side Developer"],
      "exampleProjectsCount": 2
    }
  ],
  "categories": ["Engineering", "Data", "Security", "Infrastructure", "Design"],
  "total": 10
}
```

### `GET /careers/:slug`
Retrieves full details for a single career, including resolved related career previews.

- **URL Parameter:** `slug` (e.g. `backend-developer`)
- **Status Codes:**
  - `200 OK`: Successful lookup.
  - `400 Bad Request`: Malformed slug format.
  - `404 Not Found`: Unknown slug (`{ "error": "Career not found" }`).

- **Example Response:**
```json
{
  "career": {
    "id": "c1...",
    "slug": "backend-developer",
    "title": "Backend Developer",
    "category": "Engineering",
    "summary": "Architect, build, and optimize scalable server-side systems...",
    "description": "Backend Developers engineer the behind-the-scenes engine...",
    "responsibilities": [
      "Design, build, and document secure, high-throughput REST and GraphQL APIs",
      "Create and optimize database schemas, queries, indexes, and transactional boundaries"
    ],
    "coreSkills": [
      { "name": "RESTful API Design", "description": "HTTP verbs, status codes, resource modeling" }
    ],
    "supportingSkills": [
      { "name": "Docker & Containerization", "description": "Packaging server applications" }
    ],
    "commonJobTitles": ["Junior Backend Developer", "Associate Backend Engineer"],
    "exampleProjects": [
      {
        "title": "Multi-Tenant RBAC Authentication & API Gateway",
        "description": "An Express/TypeScript service implementing session-based auth...",
        "skills": ["Node.js / Express / Python", "RESTful API Design", "Authentication & Security"]
      }
    ],
    "prerequisites": ["Comfort with server-side programming in Node.js, Python, Java, or Go"],
    "relatedCareers": [
      {
        "slug": "full-stack-developer",
        "title": "Full Stack Developer",
        "category": "Engineering",
        "summary": "Deliver complete end-to-end features spanning modern user interfaces..."
      }
    ],
    "growthPaths": ["Senior Backend Engineer", "Systems Architect", "Engineering Manager"],
    "interviewAreas": ["Relational database design", "API design principles", "Concurrency"]
  }
}
```

---

## 4. Seeding & Initialization

Database seeding is idempotent and repeatable. Running the seed command re-synchronizes all 10 careers without creating duplicates or duplicating skills:

```bash
cd backend
npm run db:seed
```

---

## 5. How to Run Locally

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

### Terminal 2: Frontend Server
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### Open in Browser
- Career Explorer: `http://localhost:5173/careers`
- Career Detail: `http://localhost:5173/careers/backend-developer`
- Authenticated App Checkpoint: `http://localhost:5173/app`
- Landing Page: `http://localhost:5173/`

---

## 6. Automated Test Results

- **Backend Tests:** 38 passed / 0 failed across 3 test suites (`auth.test.ts`, `profile.test.ts`, `career.test.ts`).
- **Frontend Tests:** 37 passed / 0 failed across 4 test suites (`auth.test.ts`, `authComponents.test.tsx`, `onboardingComponents.test.tsx`, `careerComponents.test.tsx`).
- **Total Tests:** 75 passed / 0 failed.
- **Frontend Linter (`oxlint`):** 0 warnings, 0 errors across 62 files.
- **Build Checks:** Both backend (`tsc`) and frontend (`tsc -b && vite build`) compile with zero errors.

---

## 7. Scope Boundaries & Deferred Improvements

- **No Career Fit / Scoring in Phase 5:** Fit percentages and matching algorithms are strictly deferred to Phase 6.
- **No Skill-Gap Evaluation:** Calculating missing skills between a student profile and a career will be implemented in Phase 6.
- **Design Improvements Backlog:** Visual polish, advanced animations, and interactive comparison sidebars are scheduled for a dedicated post-core design overhaul.
