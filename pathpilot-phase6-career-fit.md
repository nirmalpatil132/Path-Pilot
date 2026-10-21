# PathPilot — Phase 6: Explainable Career Fit & Skill-Gap Engine Documentation

## 1. Overview

Phase 6 implements PathPilot's deterministic, rules-based Career Fit & Skill-Gap Engine. The engine provides students with honest, explainable alignment scores and actionable skill-gap matrices comparing their authenticated profile evidence against the curated Phase 5 career catalog.

### Core Guiding Principles
- **Strictly Deterministic & Explainable**: Zero non-deterministic AI/LLM scoring or hallucinated evaluations. Every point is traceable to student profile data.
- **Configurable Centralized Policy**: All weights, multipliers, and thresholds are centralized in a versioned policy (`v1.0.0`) with validation that weights sum to exactly 100%.
- **Missing-Data Fairness**: Unrecorded dimensions are excluded rather than scored as zero penalties. Remaining weights are normalized proportionally.
- **Minimum Evidence Protection**: An empty or insufficient profile triggers an explicit `INSUFFICIENT_DATA` status with `null` display scores, preventing fabricated evaluations.
- **Constructive, 3-Tier Skill Gap Matrix**: Missing skills are grouped into `CRITICAL_MISSING`, `RECOMMENDED_NEXT`, and `OPTIONAL_ADVANTAGE` with clear educational disclaimers.

---

## 2. Scoring Policy & Architecture

### Policy Version: `1.0.0`
The scoring policy is managed in `backend/src/services/careerFit/scoringPolicy.ts`.

### Base Weights (Sum: 100%)
| Dimension | Configured Weight | Description |
| :--- | :---: | :--- |
| **Skills** | **50%** | Match between student profile skills and career core/supporting competencies. |
| **Experience & Projects** | **25%** | Tangible project artifacts, internship experience, and keyword relevance. |
| **Interests** | **15%** | Direct alignment between student career interests and the target career domain. |
| **Academic Context** | **10%** | Relevant degree/branch background; CGPA is strictly optional with 0 penalty. |

### Dimension Definitions & Formulas

#### 1. Skills Dimension (Weight: 50%, Max Raw: 100)
- **Core Skills (70% weight within dimension)**:
  - Each core career skill matched by a student profile skill contributes points weighted by self-reported proficiency:
    - `BEGINNER`: 0.6 multiplier
    - `INTERMEDIATE`: 0.85 multiplier
    - `ADVANCED`: 1.0 multiplier
- **Supporting Skills (30% weight within dimension)**:
  - Each supporting career skill matched contributes points weighted by proficiency multiplier.
- **Normalization**: Normalized against total available core/supporting skills in that career. Duplicate skills are deduplicated.

#### 2. Experience & Projects Dimension (Weight: 25%, Max Raw: 100)
- Evaluates tangible evidence rather than subjective self-ratings:
  - **Internship / Work Experience (Up to 55 points)**:
    - Base credit: 35 points for documented internship experience.
    - Role relevance bonus: Up to +20 points if role title, company, or responsibilities align with the target career domain.
  - **Project Portfolio (Up to 45 points)**:
    - Base credit: 15 points per relevant project (up to 2 projects).
    - Tech stack overlap bonus: Up to +15 points for projects whose declared tools/technologies overlap with career competencies.

#### 3. Interests Dimension (Weight: 15%, Max Raw: 100)
- **Direct Domain Match (100 points)**: Target career category or title explicitly matches student's primary/secondary career interests.
- **Cross-Domain Match (65 points)**: Student interests overlap allied tech fields (e.g., Software Engineering student exploring Cloud/DevOps).
- **General Match (25 points)**: Student specified general technology interest.

#### 4. Academic Context Dimension (Weight: 10%, Max Raw: 100)
- Non-disqualifying baseline:
  - **Direct CS / IT Degree (100 points)**: Computer Science, Information Technology, Software Engineering.
  - **Allied Engineering Degree (85 points)**: Electrical, Electronics, Mathematics, Data Science.
  - **General STEM / Other Degree (70 points)**: Mechanical, Civil, Chemical, Sciences, or other branches.
- **CGPA Handling**: Optional input. A missing CGPA receives 0 penalty. Above-average CGPA provides a modest positive bump without lowering non-reporting students.

---

## 3. Missing-Data Policy & Minimum Evidence Rule

### Missing-Data Policy
When a student profile lacks data for one or more dimensions (e.g., no projects recorded yet), the missing dimension is marked as `status: "EXCLUDED"` with `isAvailable: false`.
It is **not** assigned a score of 0. Instead, the remaining available dimensions are proportionally normalized:

$$\text{effectiveWeight}_d = \frac{\text{configuredWeight}_d}{\sum_{a \in \text{Available}} \text{configuredWeight}_a}$$

$$\text{overallScore} = \text{round}\left( \sum_{a \in \text{Available}} \text{rawScore}_a \times \text{effectiveWeight}_a \right)$$

### Minimum Evidence Rule
To prevent misleading scores from unpopulated accounts:
- A profile **must** have:
  - **Skills data recorded** (at least 1 skill), **OR**
  - **At least 2 other dimensions available** (e.g., Academic Context + Interests).
- If this threshold is not met:
  - `status: "INSUFFICIENT_DATA"`
  - `overallScore: null`
  - `fitLevel: "INSUFFICIENT_DATA"`
  - An actionable notice guides the student to complete onboarding or add skills.

---

## 4. Skill Normalization & Canonical Aliasing

Skill matching is case-insensitive, punctuation-stripped, and whitespace-normalized using `backend/src/services/careerFit/skillNormalizer.ts`.

### Canonical Alias Dictionary
Common industry abbreviations and alternative namings are mapped to canonical identifiers:
- `js` $\to$ `javascript`
- `ts` $\to$ `typescript`
- `py` $\to$ `python`
- `react.js` / `reactjs` $\to$ `react`
- `node` / `nodejs` $\to$ `node.js`
- `postgres` / `postgresql` $\to$ `postgresql`
- `k8s` $\to$ `kubernetes`
- `ml` $\to$ `machine learning`
- `dl` $\to$ `deep learning`
- `dsa` $\to$ `data structures & algorithms`
- `oop` $\to$ `object-oriented programming`
- `dbms` $\to$ `database management systems`
- `a11y` $\to$ `accessibility`
- `css3` $\to$ `css`
- `html5` $\to$ `html`

Multi-word career skills (e.g., `Node.js / Express / Python`) are decomposed into atomic sub-tokens, allowing students who have `Python` to receive proportional credit.

---

## 5. 3-Tier Skill-Gap Matrix

Skill gaps are categorized into three structured tiers in `backend/src/services/careerFit/skillGapService.ts`:

1. **`CRITICAL_MISSING`**:
   - High-priority core competencies mandatory for entry-level hiring in the career.
   - Example: Missing `RESTful API Design` or `Relational Databases & SQL` for Backend Developer.
2. **`RECOMMENDED_NEXT`**:
   - Secondary core skills or primary supporting skills that provide high leverage for job readiness.
   - Example: Missing `Docker & Containerization` or `Automated Testing`.
3. **`OPTIONAL_ADVANTAGE`**:
   - Advanced tools, elective methodologies, or specialized frameworks that differentiate candidates.
   - Example: Missing `Message Queues` or `Caching (Redis)`.

### Deterministic Sorting
Gaps within each tier are deterministically sorted:
1. Catalog core status (`isCore: true` before `false`).
2. Alphabetical by canonical skill name.

### Educational Disclaimer
The matrix prominently states:
> *"Unrecorded skills may simply be skills you have not yet added to your profile. Review this list as a learning checklist rather than a disqualifier."*

---

## 6. Authenticated API Endpoints

All career fit endpoints are mounted under `/careers` and protected by `requireAuth` session cookie middleware.

### 1. `GET /careers/fit`
Calculates explainable career fit across the entire career catalog for the authenticated student.

- **Security**: Requires active HttpOnly session cookie.
- **Query Parameters**:
  - `limit` (optional integer, default: 10)
  - `category` (optional string filter)
- **Response Shape**:
```json
{
  "policyVersion": "1.0.0",
  "calculatedAt": "2026-10-21T10:00:00.000Z",
  "hasSufficientEvidence": true,
  "results": [
    {
      "careerId": "c1...",
      "careerSlug": "backend-developer",
      "careerTitle": "Backend Developer",
      "careerCategory": "Engineering",
      "careerSummary": "Architect, build, and optimize scalable server-side systems...",
      "status": "COMPLETED",
      "overallScore": 84,
      "fitLevel": "STRONG_MATCH",
      "summaryExplanation": "Strong alignment in skills (5/5 core competencies) and tangible project experience.",
      "dimensionScores": {
        "skills": {
          "rawScore": 88,
          "configuredWeight": 0.50,
          "effectiveWeight": 0.50,
          "weightedScore": 44,
          "status": "CALCULATED",
          "isAvailable": true,
          "evidence": ["Node.js", "PostgreSQL", "REST APIs", "Git", "Docker"]
        },
        "experience": {
          "rawScore": 80,
          "configuredWeight": 0.25,
          "effectiveWeight": 0.25,
          "weightedScore": 20,
          "status": "CALCULATED",
          "isAvailable": true,
          "evidence": ["Backend Intern at Acme", "E-Commerce REST API Project"]
        },
        "interests": {
          "rawScore": 100,
          "configuredWeight": 0.15,
          "effectiveWeight": 0.15,
          "weightedScore": 15,
          "status": "CALCULATED",
          "isAvailable": true,
          "evidence": ["Direct interest match: Backend Development"]
        },
        "academics": {
          "rawScore": 85,
          "configuredWeight": 0.10,
          "effectiveWeight": 0.10,
          "weightedScore": 8.5,
          "status": "CALCULATED",
          "isAvailable": true,
          "evidence": ["Degree: B.Tech in Computer Science"]
        }
      },
      "skillGapSummary": {
        "totalGaps": 2,
        "criticalMissingCount": 0,
        "recommendedNextCount": 1,
        "optionalAdvantageCount": 1,
        "coreSkillsCoverage": 100
      }
    }
  ]
}
```

### 2. `GET /careers/:slug/fit`
Calculates deep-dive fit and full 3-tier skill-gap analysis for a single career.

- **Security**: Requires active HttpOnly session cookie.
- **Response Shape**: Includes `career`, `fitResult`, and full `skillGapAnalysis` with `gaps` grouped by tier.

---

## 7. Frontend Integration

### Student Dashboard (`/app` in `frontend/src/pages/app/AppCheckpoint.tsx`)
- Displays an **Explainable Career Fit Analysis** section with:
  - Ranked career fit cards showing overall score, fit level badge, and 4-dimension mini breakdown.
  - Refresh action button to re-evaluate on demand.
  - Transparent notification banner when profile data is incomplete.
  - Links to `/careers/:slug` for deep-dive analysis.
  - Preserved Phase 4 onboarding completion snapshot for backward compatibility.

### Career Detail Page (`/careers/:slug` in `frontend/src/pages/careers/CareerDetail.tsx`)
- Contextual authentication banner:
  - Unauthenticated visitors see a CTA to sign in and view personalized fit.
  - Authenticated students with incomplete profiles see a link to complete onboarding.
  - Authenticated students with evidence see:
    - Overall Fit Score Card with labeled progress bar (accessible for colorblindness).
    - Detailed 4-Dimension Breakdown with raw scores, effective weights, and evidence items.
    - Full 3-Tier Skill Gap Matrix with learning notice and core coverage indicator.

---

## 8. Verification Results

### Backend Automated Tests
- Test command: `cd backend && npm test`
- Total suites: 4 passed
- Total tests: 66 passed (0 failures)
  - `backend/tests/careerFit.test.ts`: 28 unit and integration tests passing.
  - `backend/tests/career.test.ts`: 8 tests passing.
  - `backend/tests/profile.test.ts`: 15 tests passing.
  - `backend/tests/auth.test.ts`: 15 tests passing.
- Backend TypeScript compilation (`npm run build`): Exited with code 0.
- Prisma schema validation (`npx prisma validate`): Database schema valid.

### Frontend Automated Tests
- Test command: `cd frontend && npm test`
- Total suites: 5 passed
- Total tests: 42 passed (0 failures)
  - `frontend/src/tests/careerFitComponents.test.tsx`: 5 tests passing.
  - `frontend/src/tests/careerComponents.test.tsx`: 10 tests passing.
  - `frontend/src/tests/onboardingComponents.test.tsx`: 11 tests passing.
  - `frontend/src/tests/authComponents.test.tsx`: 9 tests passing.
  - `frontend/src/tests/auth.test.ts`: 7 tests passing.
- Frontend production build (`npm run build`): Vite build passed with code 0.
- Frontend lint (`npm run lint`): `oxlint` passed with 0 errors.

---

## 9. Explicit Exclusions (Deferred to Later Phases)

The following capabilities were intentionally excluded from Phase 6 per product specifications:
1. **AI/LLM-Driven Scoring**: Scoring is purely deterministic and rules-based.
2. **Personalized Roadmaps**: Deferred to Phase 7.
3. **Course / Resource Recommendations**: Deferred to Phase 7.
4. **Live Job Market Scraping & Salary Prediction**: Explicitly out of scope for MVP.
5. **Full Visual Redesign**: Deferred to a dedicated design overhaul phase.
