# PathPilot — Complete Product Requirements & Founder Study Document

**Project:** PathPilot  
**Working tagline:** Understand where you are. Explore where you can go. Know what to do next.  
**Project type:** Student-focused career decision and planning platform  
**Primary market:** India  
**Initial user segment:** 2nd–4th year undergraduate engineering / CS students  
**Build horizon:** 2–3 months for a serious MVP/prototype  
**Document status:** Founder/Product Study v0.1  
**Owner:** Nirmal Patil

---

## 1. Product Vision

PathPilot is a personalized career decision and planning platform that helps Indian students understand:

1. where they currently stand,
2. which career paths realistically fit their current profile,
3. what skills or experience they are missing,
4. what they should prioritize next, and
5. how their progress changes over time.

The core product question is:

> **“Given where I am today, what is the smartest career path for me—and what should I do next?”**

PathPilot is a **decision-support and action-planning product**, not a destiny predictor.

---

## 2. The Real Problem

Students do not necessarily suffer from a lack of career information. They suffer from **too much fragmented information without personalized direction**.

Information comes from:

- college curriculum,
- faculty,
- seniors,
- friends,
- YouTube,
- LinkedIn,
- Instagram,
- job descriptions,
- online courses,
- coding platforms,
- family,
- placement cells.

This can create:

```text
Information
    ↓
Too many choices
    ↓
No personalized interpretation
    ↓
Confusion
    ↓
Random learning
    ↓
Weak project / experience portfolio
    ↓
Late discovery of skill gaps
    ↓
Placement / career difficulty
```

PathPilot exists to reduce this gap.

---

## 3. Problem Statement

### Primary Problem

Indian undergraduate students, particularly students approaching internships and placements, often struggle to choose and prepare for a suitable career because career information, skill requirements, academic learning, projects, internships and job-market expectations are disconnected.

They need a system that converts their current situation into:

> **career options + explainable comparison + skill gaps + prioritized actions.**

### Product Hypothesis

If students can clearly understand:

- their current profile,
- their strongest career options,
- the gaps between their current skills and target careers,
- and the highest-priority next actions,

then they can make better career decisions and spend their limited time more effectively.

This is a hypothesis to validate, not an assumption to treat as proven.

---

# 4. Target User

## Initial Beachhead User

> **Indian 2nd–4th year undergraduate engineering / computer science students who are uncertain about career direction and want to become employable.**

Why this segment:

- career pressure is increasing,
- internships and placements are approaching,
- skills are still changing,
- students need practical action plans,
- students compare multiple technical careers,
- the founder understands this audience,
- the founder can access early users through college/student networks.

## Future Segments

Potential future expansion:

- 1st-year students,
- non-CS engineering students,
- BCA / MCA students,
- commerce students,
- science students,
- recent graduates,
- career switchers.

Do not build for all of them in V1.

---

# 5. Example User Persona

## Rahul — Third-Year Engineering Student

**Age:** 20  
**Education:** B.Tech CSE  
**Year:** 3rd year  
**CGPA:** 7.4  
**Skills:** Python, SQL, HTML, CSS, JavaScript  
**Projects:** 3  
**Internship:** 1  
**Interests:** Development + Data + AI  
**Goal:** Software job

### Thoughts

- “I know several technologies, but I don't know which career to target.”
- “Should I focus on backend or AI?”
- “Do I need DSA?”
- “What projects should I build?”
- “What skills are actually required?”
- “Am I already late?”

### Current behavior

```text
YouTube → career advice
LinkedIn → job posts
Friends → opinions
Courses → learning
GitHub → projects
College → syllabus
```

### Result

A lot of activity, but not enough coordinated progress.

---

# 6. Product Positioning

PathPilot should NOT be:

- another AI chatbot,
- another career quiz,
- another course marketplace,
- another job portal,
- another resume builder,
- another coding platform,
- another social network.

Instead:

> **PathPilot is a personalized career decision and action-planning platform for students.**

Short version:

> **Career clarity → skill gaps → next actions.**

---

# 7. Product Philosophy

## 7.1 Explain, Don't Dictate

Never say:

> “You should become a Backend Developer.”

Prefer:

> “Backend Development currently appears to be a strong match based on your profile because…”

The student remains the decision-maker.

## 7.2 No Fake Certainty

Avoid claims such as:

- “This career guarantees a job.”
- “You will earn X.”
- “AI will definitely eliminate this job.”
- “You are 92% guaranteed to succeed.”

Scores are decision-support signals, not predictions.

## 7.3 Explainability

Every recommendation should have reasons.

Example:

```text
Backend Development
Strong current fit

Why:
✓ Python
✓ SQL
✓ Existing projects

Current gaps:
○ REST APIs
○ Authentication
○ Testing
○ Deployment
```

## 7.4 Action Over Information

Bad:

> “Learn REST APIs.”

Better:

> Learn → Practice → Build → Deploy → Prove.

## 7.5 Start Narrow

One strong problem for one clear user segment first.

---

# 8. Core Product Loop

```text
STUDENT PROFILE
      ↓
ASSESS CURRENT STATE
      ↓
EXPLORE CAREER PATHS
      ↓
COMPARE OPTIONS
      ↓
IDENTIFY SKILL GAPS
      ↓
PRIORITIZE GAPS
      ↓
GENERATE ACTION PLAN
      ↓
LEARN + BUILD + PROVE
      ↓
TRACK PROGRESS
      ↓
REASSESS
      ↓
UPDATED DIRECTION
```

This is the central product experience.

---

# 9. Product Architecture Concept

PathPilot has six conceptual layers:

```text
1. Student Profile
        ↓
2. Career Knowledge
        ↓
3. Assessment Engine
        ↓
4. Skill Gap Engine
        ↓
5. Recommendation / Action Engine
        ↓
6. Progress System
```

AI is an assisting layer around these systems, not the sole source of intelligence.

---

# 10. Student Onboarding

The onboarding should collect enough information to produce useful analysis without becoming an exhausting form.

## A. Education

- degree,
- branch,
- year/semester,
- university,
- college,
- CGPA,
- optional academic context.

## B. Skills

Students can:

- select predefined skills,
- search skills,
- add skills,
- optionally rate confidence.

Example:

```text
Python       Intermediate
SQL          Intermediate
JavaScript   Beginner
Git          Intermediate
Backend      Beginner
```

## C. Experience

- internships,
- freelance work,
- projects,
- competitions,
- certifications,
- open-source contributions.

## D. Interests

Examples:

- software development,
- data,
- AI,
- cybersecurity,
- cloud,
- design,
- product,
- entrepreneurship.

## E. Goals

- job,
- internship,
- higher studies,
- startup,
- freelancing,
- government career,
- explore,
- unsure.

## F. Constraints

Potential future inputs:

- preferred location,
- remote preference,
- available weekly time,
- financial constraints,
- target timeline.

Only collect constraints that improve recommendations.

---

# 11. Student Profile Representation

```text
Student
│
├── Education
│   ├── Degree
│   ├── Branch
│   ├── Year
│   ├── University
│   └── CGPA
│
├── Skills
│   ├── Skill
│   ├── Proficiency
│   └── Evidence
│
├── Experience
│   ├── Internship
│   ├── Project
│   └── Other experience
│
├── Interests
│
├── Goals
│
└── Preferences / Constraints
```

---

# 12. Career Knowledge Model

A career should not be represented only by skills.

Each career profile should eventually contain:

```text
Career
│
├── Name
├── Description
├── Common Job Titles
├── Typical Responsibilities
├── Required Skills
├── Optional Skills
├── Entry-Level Skills
├── Advanced Skills
├── Tools / Technologies
├── Typical Projects
├── Interview Areas
├── Experience Expectations
├── Related Careers
└── Growth Paths
```

Example:

```text
Backend Developer
│
├── Core skills
│   ├── Programming
│   ├── SQL
│   ├── APIs
│   ├── Databases
│   └── Git
│
├── Supporting skills
│   ├── Authentication
│   ├── Testing
│   ├── Docker
│   └── Deployment
│
└── Advanced
    ├── System design
    ├── Caching
    ├── Message queues
    └── Observability
```

---

# 13. Initial Career Set

V1 should start with approximately 8–12 career paths.

Suggested initial set:

1. Software Developer
2. Frontend Developer
3. Backend Developer
4. Full Stack Developer
5. Data Analyst
6. Data Scientist
7. Machine Learning Engineer
8. Cybersecurity Analyst
9. Cloud / DevOps Engineer
10. UI/UX Designer

This is a starting hypothesis. The final list should be validated against:

- student interest,
- job-market data,
- job descriptions,
- availability of reliable skill data,
- product usefulness.

---

# 14. Career Comparison

Students should compare multiple paths.

Example:

| Career | Current Fit | Gap | Direction |
|---|---:|---:|---|
| Backend Developer | Strong | Low | Explore |
| Full Stack Developer | Strong | Medium | Explore |
| Data Analyst | Strong | Medium | Explore |
| ML Engineer | Moderate | High | Longer transition |
| Cybersecurity | Low | High | Explore first |

The interface should explain why.

Do not present unexplained numbers.

---

# 15. Career Fit Engine

The Career Fit Engine compares:

```text
Student Profile
      +
Career Requirements
      ↓
Comparison
      ↓
Fit Analysis
```

Potential dimensions:

- skill overlap,
- skill proficiency,
- relevant experience,
- project evidence,
- interest alignment,
- goal alignment,
- academic context,
- transition difficulty.

Exact weighting must be designed and validated before implementation.

---

# 16. Scoring Philosophy

Do not invent arbitrary percentages simply to make the dashboard look impressive.

A possible early framework could consider:

```text
Skill Match
Experience / Evidence
Interest Alignment
Goal Alignment
Transition Difficulty
```

These weights are product hypotheses.

The first implementation should favor:

- transparency,
- deterministic behavior,
- understandable reasons,
- configurable weights,
- easy future experimentation.

Example result:

```json
{
  "fit_level": "strong",
  "score": 82,
  "reasons": [
    "Strong Python foundation",
    "Relevant SQL experience",
    "Existing backend project"
  ],
  "gaps": [
    "REST APIs",
    "Testing",
    "Deployment"
  ]
}
```

---

# 17. Skill Gap Engine

The Skill Gap Engine compares:

```text
Student Skills
        vs
Career Skills
```

Example:

```text
Python          ✓
SQL             ✓
Git             ✓
JavaScript      ✓
REST APIs       △
Docker          ✗
Testing         ✗
System Design   ✗
```

Classify gaps as:

### Critical
Skills that prevent entry-level task performance.

### Important
Skills that significantly improve readiness.

### Later
Advanced skills that should not distract the student yet.

The core question:

> **What should the student learn first?**

---

# 18. Skill Taxonomy

A skill should eventually contain:

```text
Skill
│
├── Name
├── Category
├── Description
├── Related Skills
├── Prerequisites
├── Career Associations
├── Beginner Level
├── Intermediate Level
├── Advanced Level
└── Evidence Types
```

Example:

```text
REST APIs
│
├── Category: Backend
├── Prerequisites: HTTP fundamentals
├── Careers:
│   ├── Backend Developer
│   ├── Full Stack Developer
│   └── Software Developer
└── Evidence:
    ├── API project
    ├── deployed endpoint
    └── documentation
```

---

# 19. Action Engine

The Action Engine converts a gap into a plan.

Example:

```text
Goal:
Become comfortable deploying backend applications

Week 1
├── Learn Docker fundamentals
├── Containerize a simple API
├── Create Dockerfile
└── Run locally

Proof
└── Publish project on GitHub
```

Core model:

```text
Skill Gap
    ↓
Learning Objective
    ↓
Practice
    ↓
Project
    ↓
Deployment
    ↓
Evidence
```

---

# 20. 30-Day Roadmap

V1 should generate a manageable 30-day plan.

Example:

```text
WEEK 1
Foundation

WEEK 2
Skill practice

WEEK 3
Project implementation

WEEK 4
Deployment + evidence
```

A roadmap should prioritize a small number of meaningful actions.

---

# 21. Progress System

Track:

```text
Skills
Projects
Experience
Tasks
Evidence
```

Example:

```text
Skills          64%
Projects        72%
Experience      41%
Readiness       58%
```

Every metric must have a clear definition.

---

# 22. Reassessment Loop

Example:

```text
Before:
REST API = Beginner

       ↓
Learning + project

After:
REST API = Intermediate
```

Then PathPilot recalculates the relevant career analysis.

This creates an ongoing product instead of a one-time quiz.

---

# 23. AI Architecture Philosophy

Core rule:

> **Deterministic Product Brain + AI Assistant**

Product logic:

- career profiles,
- skill taxonomy,
- scoring rules,
- gap calculation,
- priority rules,
- roadmap rules.

AI can assist with:

- explanations,
- conversation,
- summarization,
- free-text goal interpretation,
- project suggestions,
- natural-language personalization.

AI should not independently decide a student's career.

Architecture:

```text
                 PATHPILOT
                     │
        ┌────────────┴────────────┐
        │                         │
 PRODUCT LOGIC                    AI
        │                         │
        ├── Career profiles       ├── Explanation
        ├── Skill taxonomy        ├── Conversation
        ├── Scoring rules         ├── Summarization
        ├── Gap calculation       ├── Suggestions
        └── Priority rules        └── Natural language
        │                         │
        └────────────┬────────────┘
                     ↓
              User Experience
```

---

# 24. Data Sources

Career information should be evidence-based where possible.

Potential sources:

- public job descriptions,
- company career pages,
- government labour-market information,
- education/industry reports,
- public career frameworks,
- student feedback,
- recruiter interviews,
- employer interviews.

Distinguish between:

```text
Observed data
vs
Product assumption
vs
AI-generated suggestion
```

Do not present assumptions as facts.

---

# 25. Initial Data Strategy

V1 does not need thousands of careers.

Start with:

```text
10 careers
50–100 skills
Career-skill relationships
Skill prerequisites
Basic roadmap templates
```

Manually curate and audit the initial dataset.

Later, add data pipelines.

---

# 26. Product Screens

Suggested V1:

```text
01  Landing
02  Sign Up / Login
03  Onboarding
04  Student Profile
05  Career Explorer
06  Career Details
07  Career Comparison
08  Skill Gap Analysis
09  Personalized Roadmap
10  Progress Dashboard
11  Settings
```

Optional later:

```text
12  AI Career Assistant
13  Job Description Analyzer
14  Resume / Evidence Analyzer
15  Project Recommendations
```

---

# 27. Landing Page

Core message:

> **Understand where you are. Explore where you can go. Know what to do next.**

Supporting message:

> PathPilot helps students turn their current skills, interests and experience into clear career options, skill gaps and actionable next steps.

Primary CTA:

> **Find My Path**

Secondary CTA:

> **Explore Careers**

---

# 28. Onboarding UX

Use a guided flow:

```text
Welcome
  ↓
Education
  ↓
Skills
  ↓
Experience
  ↓
Interests
  ↓
Goals
  ↓
Constraints
  ↓
Generate Profile
```

Show progress and allow optional fields to be skipped.

---

# 29. Dashboard UX

The dashboard must answer:

### Where am I?
Current profile and readiness.

### Where can I go?
Top career options.

### What do I do next?
Top three priorities.

Example:

```text
Good morning, Rahul 👋

Your strongest current direction:
Backend Development

STRONG FIT

Your next 3 priorities:
01  Master REST APIs
02  Build a backend project
03  Deploy your API

Career options:
Backend Developer
Full Stack Developer
Data Analyst
```

---

# 30. Career Details Screen

Include:

- career overview,
- typical responsibilities,
- core skills,
- supporting skills,
- common job titles,
- current fit,
- missing skills,
- example projects,
- interview areas,
- next steps,
- related careers.

The goal is decision support, not an encyclopedia.

---

# 31. Career Comparison Screen

Compare 2–3 careers on:

- what the work involves,
- skills,
- current fit,
- gaps,
- transition difficulty,
- projects,
- next actions.

The goal:

> “What is different between these paths, and which fits me better right now?”

---

# 32. Skill Gap Screen

Example:

```text
BACKEND DEVELOPMENT

Your current position
████████░░ 72%

Strong:
✓ Python
✓ SQL
✓ Git

Needs work:
△ REST APIs
△ Authentication

Missing:
○ Testing
○ Docker
○ Deployment
```

Every gap should connect to an action.

---

# 33. Roadmap Screen

Show:

```text
30-DAY PLAN

Week 1
Foundation

Week 2
Core skill

Week 3
Build

Week 4
Deploy + prove
```

Each task may contain:

- description,
- estimated time,
- status,
- related skill,
- evidence requirement.

---

# 34. Progress Screen

Possible sections:

```text
Overall progress
Skill progress
Project progress
Task completion
Evidence
Career fit changes
```

Progress must represent meaningful progress, not vanity.

---

# 35. V1 Scope

## Must Have

- landing page,
- authentication,
- onboarding,
- student profile,
- curated career database,
- skill database,
- career exploration,
- career comparison,
- explainable fit analysis,
- skill gap analysis,
- 30-day roadmap,
- progress tracking,
- responsive UI,
- deployed application.

## Should Have

- AI explanations,
- project recommendations,
- job-description analysis,
- useful visual analytics.

## Could Have

- resume analysis,
- GitHub evidence,
- career assistant,
- notifications,
- social sharing.

## Not V1

- job marketplace,
- mentor marketplace,
- full course platform,
- mobile app,
- college SaaS,
- payment system,
- large-scale job scraping.

---

# 36. Recommended Technical Direction

A strong candidate stack based on the founder's existing skills:

## Frontend

- React
- modern CSS / Tailwind if desired
- charting library only where useful

## Backend

Candidate:

- Python
- FastAPI

Alternative:

- Node.js
- Express.js

FastAPI is a strong candidate if the product's data/scoring/AI work is primarily Python-based.

## Database

Development:

- SQLite

Production:

- PostgreSQL

## Deployment

Potential:

- Frontend → Vercel
- Backend → managed hosting
- Database → managed PostgreSQL

The final stack should be finalized during architecture planning.

---

# 37. High-Level Architecture

```text
                    USER
                     │
                     ↓
              WEB FRONTEND
                     │
                HTTPS / API
                     │
                     ↓
             BACKEND API
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Auth Layer    Product Logic   AI Layer
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Career      Skills     Roadmaps
       Engine      Engine      Engine
          │          │          │
          └──────────┼──────────┘
                     ↓
                DATABASE
```

---

# 38. Core Backend Modules

Potential modules:

```text
auth
users
profiles
skills
careers
assessments
scoring
skill-gaps
roadmaps
progress
ai
analytics
```

---

# 39. Database Entities

Initial:

```text
users
student_profiles
skills
student_skills
careers
career_skills
experiences
projects
interests
student_interests
career_interests
assessments
assessment_results
skill_gaps
roadmaps
roadmap_tasks
progress
```

Potential future:

```text
job_postings
job_skills
ai_conversations
evidence
github_profiles
organizations
subscriptions
```

Do not implement every future table in V1.

---

# 40. Entity Relationships

```text
User
 │
 └── StudentProfile
       │
       ├── StudentSkills ───── Skill
       ├── Experiences
       ├── Projects
       ├── Interests
       └── Goals

Career
 │
 └── CareerSkills ─────────── Skill

StudentProfile + Career
            ↓
       Assessment
            ↓
        SkillGaps
            ↓
         Roadmap
            ↓
        RoadmapTasks
            ↓
         Progress
```

---

# 41. API Concept

Potential endpoints:

```text
POST   /auth/register
POST   /auth/login
GET    /me

GET    /careers
GET    /careers/:id
POST   /careers/compare

GET    /skills
GET    /skills/:id

POST   /assessment
GET    /assessment/:id

GET    /profile
PUT    /profile

GET    /skill-gaps
POST   /roadmaps
GET    /roadmaps/:id
PUT    /roadmap-tasks/:id

GET    /progress
PUT    /progress/:id
```

Actual contracts should be finalized before implementation.

---

# 42. Security Requirements

Minimum expectations:

- never store passwords in plain text,
- securely handle sessions/tokens,
- never commit secrets,
- protect database access,
- isolate user data,
- validate API input,
- consider rate limiting,
- avoid sensitive information in logs.

Collect only useful student data.

---

# 43. Privacy Principles

Clearly communicate:

- what is collected,
- why it is collected,
- how it is used,
- whether AI processes it,
- whether it is shared,
- how users can delete data.

Recommendations must not be presented as guaranteed outcomes.

---

# 44. Accessibility

Consider:

- readable contrast,
- keyboard navigation,
- semantic HTML,
- form labels,
- clear errors,
- responsive layouts,
- accessible charts,
- not relying only on color.

---

# 45. Mobile Experience

The product should be mobile-first because students may primarily use phones.

Requirements:

- touch-friendly controls,
- responsive cards,
- concise content,
- responsive charts,
- minimal long forms,
- usable navigation.

Desktop must also be polished.

---

# 46. Product Metrics

Important metrics:

## Activation
Percentage completing onboarding.

## Career Exploration
Careers explored per active user.

## Recommendation Engagement
Users opening recommended paths.

## Action Conversion
Users starting a recommended action.

## Roadmap Completion
Meaningful roadmap milestone completion.

## Retention
7-day / 30-day return rate.

## User Value
Percentage reporting improved career clarity.

Define exact metric formulas before implementation.

---

# 47. Validation Strategy

Before serious coding:

### Step 1 — Interview students

Target roughly 20–30 students initially.

Ask:

- How did you choose your career?
- What are you currently confused about?
- What have you tried?
- Which tools/websites do you use?
- What information do you trust?
- What makes decisions difficult?
- Have you changed direction?
- What do you wish someone had told you earlier?

Avoid pitching PathPilot too early.

---

# 48. Manual Validation Experiment

Build a manual version before automating.

```text
Google Form
     ↓
Student profile
     ↓
Founder manually analyses
     ↓
Career comparison
     ↓
Skill gap
     ↓
30-day roadmap
     ↓
Student feedback
```

If students find the output useful, automate the workflow.

> **Validate the value before automating the workflow.**

---

# 49. Competition Analysis

Study categories such as:

- career quizzes,
- career counselling,
- job portals,
- learning platforms,
- AI career assistants,
- skill assessment platforms,
- student communities.

The important question is:

> **What exact user job remains poorly solved?**

Possible differentiation:

```text
Generic advice
      ↓
Personal profile
      ↓
Career comparison
      ↓
Skill gap
      ↓
Action
      ↓
Evidence
      ↓
Reassessment
```

---

# 50. Business Model

Do not optimize monetization before validating value.

Potential future models:

## Freemium B2C

Free:

- profile,
- career exploration,
- basic fit analysis.

Paid:

- deep assessment,
- detailed roadmap,
- advanced comparisons,
- AI assistant,
- analytics.

## B2B

PathPilot Campus:

- student readiness,
- aggregated skill gaps,
- placement preparation,
- institutional dashboard.

## Hiring / Talent

Future:

- verified student profiles,
- employer discovery,
- skill-based candidate search.

---

# 51. Future Expansion

Potential modules:

```text
PathPilot
│
├── Career Explorer
├── Skill Gap Engine
├── Roadmap Engine
├── Project Builder
├── Job Description Analyzer
├── Resume Evidence
├── GitHub Evidence
├── Internship Intelligence
├── AI Career Assistant
├── Mentor Network
└── Hiring Marketplace
```

Do not build these prematurely.

---

# 52. Long-Term Vision

> **PathPilot becomes a career operating system for students.**

Potential ecosystem:

```text
Career
   ↓
Skills
   ↓
Learning
   ↓
Projects
   ↓
Evidence
   ↓
Internships
   ↓
Jobs
```

The platform eventually supports the whole journey.

---

# 53. Potential Product Moat

Long-term advantages could come from:

### Student outcome data
What students learned and what happened afterward.

### Career-skill graph
Relationships between careers, skills, projects and experiences.

### Personalized history
How individual profiles evolve.

### Student network
Aggregated patterns.

### Institutional data
If colleges eventually adopt PathPilot.

The moat should be useful data + workflow + trust, not merely access to an AI API.

---

# 54. Founder vs AI/Codex Responsibilities

## Founder decides

- problem,
- target user,
- positioning,
- V1 scope,
- career categories,
- skill taxonomy,
- scoring philosophy,
- recommendation rules,
- architecture,
- AI role,
- business model.

## Codex assists with

- project setup,
- boilerplate,
- components,
- API implementation,
- migrations,
- tests,
- debugging,
- refactoring,
- documentation.

AI should not silently invent product decisions.

---

# 55. Development Workflow

```text
Founder Decision
      ↓
Technical Plan
      ↓
Codex Implementation
      ↓
Run Locally
      ↓
Test
      ↓
Review
      ↓
Fix
      ↓
Commit
```

For each major feature:

1. define the problem,
2. define expected behavior,
3. define acceptance criteria,
4. implement,
5. test,
6. inspect UI,
7. review architecture,
8. document.

---

# 56. Development Phases

## Phase 0 — Discovery
- student interviews,
- competitor research,
- problem validation.

## Phase 1 — Product Definition
- personas,
- journeys,
- V1 scope,
- requirements.

## Phase 2 — Data & Intelligence
- careers,
- skills,
- relationships,
- scoring,
- roadmap rules.

## Phase 3 — UX Design
- wireframes,
- visual system,
- onboarding,
- dashboard,
- explorer,
- gap analysis,
- roadmap.

## Phase 4 — Architecture
- repository,
- frontend,
- backend,
- database,
- API contracts,
- authentication.

## Phase 5 — MVP Build
- onboarding,
- profile,
- career engine,
- skill gap,
- roadmap,
- progress.

## Phase 6 — AI Layer
Only after deterministic logic works.

## Phase 7 — Testing
- unit,
- API,
- UI,
- responsive,
- security.

## Phase 8 — Deployment
- production environment,
- database,
- domain,
- monitoring.

## Phase 9 — Real User Validation
Give it to real students.

## Phase 10 — Iteration
Use evidence to decide V1.1/V2.

---

# 57. Suggested 2–3 Month Timeline

| Period | Focus |
|---|---|
| Weeks 1–2 | Problem discovery + validation |
| Weeks 3–4 | Product definition + data model + UX |
| Weeks 5–7 | Core MVP engineering |
| Weeks 8–9 | Scoring, roadmap + progress |
| Weeks 10–11 | AI enhancement + polish |
| Week 12 | Testing, deployment + initial users |

This is a target, not a rigid deadline.

---

# 58. MVP Success Definition

PathPilot MVP is successful if:

> **A real student can complete the assessment, understand at least 2–3 plausible career options, understand why they fit, identify major gaps, and leave with a practical next-30-day plan that they consider useful.**

It is NOT successful merely because it:

- runs,
- looks good,
- has AI,
- has many pages.

---

# 59. Technical Success Definition

The MVP should:

- run reliably,
- have clean architecture,
- separate frontend/backend concerns,
- use a real database,
- have validated APIs,
- handle errors,
- protect user data,
- work on mobile and desktop,
- be deployable,
- have tests around core logic.

---

# 60. Portfolio Success Definition

The finished project should demonstrate:

```text
✓ Real-world problem
✓ User research
✓ Product thinking
✓ UX design
✓ Full-stack engineering
✓ Database design
✓ Backend APIs
✓ Explainable scoring logic
✓ AI integration where justified
✓ Testing
✓ Deployment
✓ User feedback
✓ Iteration
```

This is much stronger than simply listing technologies.

---

# 61. GitHub Showcase

Suggested repository:

```text
README.md

docs/
  product-requirements.md
  architecture.md
  scoring-model.md
  database.md
  user-research.md

frontend/
backend/
tests/
```

README sections:

- problem,
- target users,
- solution,
- screenshots,
- architecture,
- intelligence engine,
- tech stack,
- setup,
- live demo,
- testing,
- lessons learned.

---

# 62. LinkedIn Story

A stronger story than “I built another AI app” is:

> “I noticed that many students don't lack career information—they lack personalized direction. I researched the problem, designed PathPilot, built a full-stack MVP, tested it with students, and iterated based on feedback.”

This communicates:

- observation,
- initiative,
- product thinking,
- engineering,
- validation.

---

# 63. Resume Positioning

Potential future bullet:

> **Built PathPilot, a full-stack career decision platform for students that analyzes user profiles against curated career-skill models, identifies skill gaps and generates prioritized action roadmaps.**

After real validation:

> **Built and validated PathPilot with X students, using an explainable career-fit and skill-gap engine to generate personalized 30-day career roadmaps.**

Only use real numbers.

---

# 64. Key Risks

## Risk 1 — Becoming another career quiz
**Mitigation:** focus on action and progress.

## Risk 2 — Bad career data
**Mitigation:** curated and traceable sources.

## Risk 3 — Arbitrary scoring
**Mitigation:** explainable and configurable scoring.

## Risk 4 — AI hallucination
**Mitigation:** ground AI responses in structured product data.

## Risk 5 — Feature creep
**Mitigation:** strict V1 scope.

## Risk 6 — Low retention
**Mitigation:** ongoing progress loop.

## Risk 7 — Low trust
**Mitigation:** show reasoning and evidence.

## Risk 8 — Useful but not monetizable
**Mitigation:** validate willingness to pay separately.

---

# 65. Open Founder Decisions

These must be decided before the final Codex implementation prompt.

### Problem
- Is career confusion the primary pain?
- Or is skill-to-job mismatch deeper?
- Which one will V1 explicitly solve?

### User
- 2nd year?
- 3rd year?
- 4th year?
- CSE only?
- All engineering?

### Careers
- Which 8–12?
- How will they be maintained?

### Skills
- How many?
- How are proficiency levels defined?
- What evidence qualifies?

### Scoring
- What makes a strong fit?
- What factors matter?
- How are weights selected?

### Data
- What sources?
- How frequently updated?

### AI
- Which features need AI?
- Which remain deterministic?

### Business
- Who pays?
- Student?
- College?
- Employer?

These questions are intentionally unresolved.

---

# 66. Founder Research Checklist

Before final coding:

- [ ] Interview at least 20 students.
- [ ] Identify repeated pain patterns.
- [ ] Interview students actively choosing between careers.
- [ ] Review competing products.
- [ ] Identify current solution failures.
- [ ] Define the exact first user.
- [ ] Freeze the V1 problem statement.
- [ ] Freeze the initial career list.
- [ ] Define the initial skill taxonomy.
- [ ] Define the scoring philosophy.
- [ ] Define roadmap rules.
- [ ] Design the primary user journey.
- [ ] Create wireframes.
- [ ] Finalize architecture.
- [ ] Only then generate the Codex implementation prompt.

---

# 67. Core Product Principle

Everything should come back to:

```text
WHERE AM I?
     ↓
WHERE CAN I GO?
     ↓
WHAT AM I MISSING?
     ↓
WHAT SHOULD I DO NEXT?
     ↓
DID I IMPROVE?
     ↓
WHAT SHOULD I DO NEXT NOW?
```

If PathPilot can answer those questions clearly and honestly, the product has a meaningful reason to exist.

---

# 68. Current Project Status

**Status:** Product study / discovery

**Not yet ready for full implementation.**

Next founder-led work:

1. Ground-level problem validation
2. User interviews
3. Competitor analysis
4. Exact user persona
5. V1 problem statement
6. Product requirements refinement
7. Career taxonomy
8. Skill taxonomy
9. Scoring model
10. User journey
11. Wireframes
12. Technical architecture
13. Codex implementation brief

---

# 69. Final Founder Rule

> **Do not let the speed of AI replace the thinking that makes the product yours.**

Use AI to build faster.

Use your own judgment to decide **what deserves to be built**.

PathPilot should be a product you can explain from first principles:

- Why the problem exists.
- Why students struggle.
- Why current solutions are insufficient.
- Why PathPilot is different.
- How its recommendation engine works.
- Why its scoring is explainable.
- How the roadmap is generated.
- What AI does and does not do.
- How you validated the product.
- What you changed after real users used it.

That is what turns PathPilot from a generated project into **your startup product**.
