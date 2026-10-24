# PathPilot --- Master Project Roadmap, Phase Tracker & Product Vision

> **Document purpose:** This is the living source of truth for
> PathPilot's product vision, phase-by-phase implementation status,
> architecture guardrails, acceptance criteria, and future roadmap.
> Upload this file into the main PathPilot/Antigravity planning chat and
> update it after every phase.
> **Current checkpoint (24 October 2026):** Phase 7 (`3db8025`) acceptance audit and full regression suite independently verified (105 backend / 53 frontend tests passing, 0 regressions). Phase 8 — Project-Based Learning & Portfolio Evidence — has been implemented end-to-end, tested (24 backend / 6 frontend tests), documented, and verified locally, ready for commit. Next recommended phase awaiting founder approval is Phase 09: Career Path Comparison & Decision Matrix.
>
> **Important:** This document records known decisions and a proposed
> roadmap. It does not claim that a feature is implemented merely
> because it appears here. Verify status against the repository, tests,
> migrations, and Git history before changing any status.

------------------------------------------------------------------------

## 1. Product summary

**PathPilot** is an agentic, personalized career-guidance platform for
students who are uncertain about which technology career path to pursue
and how to work toward it.

The platform should help each student move through a clear journey:

1.  Create an account and a private student profile.
2.  Complete a short, approachable technology-interest and preference
    assessment.
3.  Receive explainable, personalized career-path recommendations.
4.  Explore paths, compare alternatives, identify skill gaps, and change
    interests as they learn.
5.  Follow a personalized learning roadmap with measurable progress.
6.  Access relevant learning resources, courses, mentor guidance, and
    eventually premium support.
7.  Revisit and update their profile so recommendations adapt as their
    interests, skills, projects, and goals evolve.

PathPilot should feel like a modern EdTech product designed around each
learner---not a generic job board, static quiz, or chatbot that makes
unsupported career promises.

### Mission

Help students make more confident, evidence-informed technology career
decisions and turn those decisions into practical next steps.

### Product principles

-   **Student-first:** Simple language, low-friction onboarding,
    mobile-friendly design, accessible interactions.
-   **Personalized:** Recommendations use the student's interests,
    skills, experience/projects, goals, and relevant academic context.
-   **Explainable:** Show why a path is recommended, what evidence
    supports it, what gaps remain, and what the student can do next.
-   **Student agency:** Students can edit their interests, correct their
    profile, compare options, and regenerate recommendations.
-   **Evidence over hype:** Distinguish measured profile fit from
    guaranteed employability or job outcomes.
-   **Privacy and security:** Collect only necessary information,
    protect account/profile data, and give students clear control over
    their information.
-   **Incremental delivery:** Complete and verify the current phase
    before expanding scope.
-   **Extensible architecture:** New capabilities should be added
    through deliberate phases, not rushed into unrelated existing
    phases.

------------------------------------------------------------------------

## 2. Current project status and operating rules

### Current checkpoint

-   **Latest verified remote commit:** `3db80256d01c0e4b5d92de978bb03afeffbf3cb0` — `Phase 07: Personalized Learning Roadmap`, visible on GitHub as of 24 October 2026.
-   **Phase 7 status:** `COMPLETED — AUDIT VERIFIED`. Acceptance audit completed against the local checkout: 15 backend tests (`tests/roadmap.test.ts`) and 5 frontend tests (`src/tests/roadmapComponents.test.tsx`) independently verified passing. 4-week progression, deterministic 30-day roadmap pacing, atomic progress tracking, versioned regeneration, and cross-user isolation confirmed with zero regressions.
-   **Phase 8 status:** `COMPLETED — VERIFIED LOCALLY (READY TO COMMIT)`. Full end-to-end implementation delivered in working tree: database models (`Project`, `ProjectDeliverable`), deterministic recommendation engine (`projectRecommendationEngine.ts`), project workspace, evidence tracking with explicit self-reported transparency disclaimers, safe roadmap task linking (`onDelete: SetNull`), and REST APIs. Verified with 24 backend tests (`tests/project.test.ts`) and 6 frontend tests (`src/tests/projectComponents.test.tsx`). Repository regression suite: 105 backend tests and 53 frontend tests (158 total) passing 100%. Documentation delivered in `pathpilot-phase8-project-based-learning.md`.
-   **Known Phase 6 decision:** Career-fit scoring is configurable, initially weighted as skills 50%, project/experience evidence 25%, interests 15%, and academic context 10%.
-   **Known skill-gap labels:** `Critical Missing`, `Recommended Next`, and `Optional Advantage`.
-   **Next step:** Founder review and commit of Phase 8 (`git commit -m "Phase 08: Project-Based Learning"`), followed by founder approval of the next proposed phase: **Phase 09 — Career Path Comparison & Decision Matrix**.
-   **Working tree state:** Working tree is clean of build artifacts, zero diff whitespace warnings (`git diff --check` passes), with uncommitted Phase 8 implementation files ready for staging.

### Status legend

Use these status values consistently:

-   `COMPLETED` --- implementation, tests, and acceptance criteria
    verified; committed.
-   `IN PROGRESS` --- currently being implemented or validated.
-   `NEXT` --- the next planned phase after the current phase passes its
    gate.
-   `PLANNED` --- approved direction, not yet started.
-   `BLOCKED` --- cannot proceed until a named dependency is resolved.
-   `NEEDS AUDIT` --- previously reported complete but evidence has not
    yet been checked.
-   `DEFERRED` --- deliberately moved out of the current delivery
    window.
-   `CUT` --- explicitly removed from scope, with a reason recorded.

Do not mark a phase complete because the UI renders or the code compiles
alone. Record the tests, acceptance criteria, migration state (if
applicable), and commit.

### Mandatory phase workflow

For every phase:

1.  Inspect the current repository, current branch, Git status, recent
    commits, project structure, and existing implementation.
2.  Read the applicable project documents and this master file before
    editing.
3.  Confirm the exact scope and dependencies of the current phase.
4.  Do not rewrite completed phases or replace working architecture
    without evidence and explicit approval.
5.  Implement only the current phase and necessary fixes to directly
    related regressions.
6.  Run relevant unit tests, integration tests, type checks, lint,
    build, and migration checks available in the repository.
7.  Manually verify important user flows and responsive states where
    possible.
8.  Review security, validation, authorization, error states, loading
    states, empty states, and data persistence.
9.  Summarize changed files, behavior, tests run and their actual
    results, known gaps, and any follow-up work.
10. Commit only after checks pass, using a clear message such as
    `Phase 07: Personalized Learning Roadmap & Progress Tracking`.
11. Update this file's status table, phase notes, decisions, and next
    action.
12. Stop and ask the founder when a product decision, destructive
    migration, major architecture change, or scope conflict requires
    approval.

**Antigravity implementation style:** One comprehensive implementation
prompt per phase whenever possible. Do not start the next phase in the
same implementation run unless the founder explicitly asks.

------------------------------------------------------------------------

## 3. Product journey --- target experience

### Stage 1 --- Discover, register, and create a profile

A student visits the public landing page, understands what PathPilot
does, and can create an account or sign in.

Expected capabilities: - Clear value proposition and calls to action. -
Secure registration, login, logout, session handling, and password
recovery where supported by the current auth stack. - Email verification
if supported and appropriate to the existing implementation. - Student
profile with editable, validated fields. - Onboarding progress
indicator. - Clear privacy explanation and consent where needed. - Safe
handling of authentication errors, duplicate accounts, and expired
sessions. - Route protection and server-side authorization, not just
hiding frontend links.

Ask only for data needed for personalization. Avoid collecting sensitive
personal information without a justified product need.

### Stage 2 --- Technology interest and preference assessment

After profile creation, guide the student through a short, friendly
questionnaire---approximately 9--10 questions, generally with 3--4
well-written options each. Questions should be easy to answer for
beginners and should not require students to already know technology job
titles.

Use assessment patterns as inspiration, not as a literal copy of another
platform's wording or proprietary design. Freelance marketplaces
commonly ask users to clarify their goals, needs, skills, and
preferences to personalize their experience; PathPilot should adapt that
general onboarding principle to student career discovery. Reference:
[Fiverr client-profile
setup](https://help.fiverr.com/hc/en-us/articles/41011232916625-Setting-up-your-client-profile)
and [Fiverr freelancer profile
guidance](https://help.fiverr.com/hc/en-us/articles/360010558598-Creating-editing-your-freelancer-profile).

#### Proposed questionnaire design

This is a product proposal to refine and implement in the appropriate
phase---not a claim that the questionnaire already exists.

  -------------------------------------------------------------------------------
  \#                Topic             Example question  Example response design
  ----------------- ----------------- ----------------- -------------------------
  1                 Interest area     Which technology  Building websites/apps;
                                      activities sound  data and insights; AI and
                                      most interesting  intelligent systems;
                                      to you?           security/networks

  2                 Preferred work    What kind of work Designing experiences;
                                      would you enjoy   solving logic problems;
                                      doing most?       experimenting with
                                                        data/models; managing
                                                        systems and reliability

  3                 Current           How much have you Just starting;
                    experience        explored          tutorials/coursework;
                                      technology so     small projects;
                                      far?              substantial
                                                        projects/internship

  4                 Preferred tools   Which activities  Coding; visual/product
                                      would you like to design; data analysis;
                                      try?              infrastructure/security

  5                 Problem style     Which problem     Create a user-facing
                                      sounds most       product; find patterns in
                                      satisfying?       data; automate a task;
                                                        protect or improve a
                                                        system

  6                 Learning          How do you prefer Guided lessons; hands-on
                    preference        to learn?         projects;
                                                        reading/documentation;
                                                        mentorship and feedback

  7                 Career priorities What matters most Creativity; analytical
                                      in a future role? problem-solving;
                                                        impact/research;
                                                        stability and systems
                                                        ownership

  8                 Current skills    Which areas have  Multi-select skill list
                                      you tried?        plus "none yet" and
                                                        "other"

  9                 Time and          How much time can Under 3 hours; 3--5;
                    commitment        you realistically 6--10; 10+
                                      spend learning
                                      each week?

  10                Goal and          What would you    Choose a direction; build
                    uncertainty       most like         skills/projects; prepare
                                      PathPilot to help for internships/jobs;
                                      you do?           compare a few career
                                                        options
  -------------------------------------------------------------------------------

Question design rules: - Support keyboard navigation, mobile layouts,
visible selection states, and accessible labels. - Include a progress
indicator, Back/Next, and save/resume where feasible. - Allow "not sure
yet" or "I haven't tried this" where appropriate. - Use multi-select
only where multiple interests genuinely make sense. - Do not treat a
student's current lack of experience as lack of potential. - Make
question definitions and scoring mappings configurable where
practical. - Version the questionnaire so changes can be interpreted
against prior responses. - Store the latest answers and timestamps
safely; preserve history only when needed and justified. - Explain that
results are guidance, not a fixed label or guaranteed outcome. - Permit
students to edit their answers later and regenerate recommendations.

### Stage 3 --- Career recommendations and exploration

Use the student's profile and questionnaire answers to produce a ranked
set of relevant career paths.

Each recommendation should ideally include: - Career title and concise
explanation. - A transparent fit score or fit band, with an explanation
of what the score means. - Why it matches the student's interests and
demonstrated skills. - Supporting evidence from skills,
projects/experience, and stated preferences. - Skill gaps and
prerequisite concepts. - Suggested first steps and example beginner
projects. - Related/alternative career paths. - Confidence/coverage
caveats when profile information is incomplete.

Students must be able to: - Open a detailed career profile. - Compare
career options. - Save/favorite paths. - Mark a path as exploring,
selected, or no longer interested (if supported by the product model). -
Update interests and skills and request a refreshed result. - See what
changed and why when recommendations change.

Do not present a score as a scientific or hiring probability unless a
validated methodology supports that interpretation.

### Stage 4 --- Personalized learning roadmap and mentor support

The platform should convert recommendations and skill gaps into
actionable learning steps. The current Phase 7 is focused on a
deterministic personalized learning roadmap and progress tracking.

Target roadmap capabilities: - A clear 30-day plan arranged across four
weeks. - Practical tasks connected to career goals and skill gaps. -
Effort estimates, completion criteria, and a clear definition of done. -
Suggested resources or courses, with source/availability details where
possible. - Project-based learning and milestones. - Persistent progress
states, such as not started, in progress, completed, and blocked. -
Ability to revisit the roadmap as skills, time availability, or career
goals change. - Progress summaries that are honest and useful---not
vanity metrics. - Future mentor support connected to the student's
current goals and progress.

Mentorship should be phased realistically. Start with a mentor
directory, matching criteria, availability, and a clear request/booking
workflow only when real mentors and scheduling operations exist. Do not
imply 24/7 human availability unless staffing and service-level
commitments support it.

------------------------------------------------------------------------

## 4. Career-fit scoring and skill-gap decisions already agreed

### Initial configurable weights

The initial weights for the career-fit engine are:

  Signal                          Initial weight
  ----------------------------- ----------------
  Skills match                               50%
  Project/experience evidence                25%
  Interests                                  15%
  Academic context                           10%
  **Total**                             **100%**

These are initial configurable weights, not immutable constants. Keep
them in configuration or an appropriate persisted configuration model
rather than scattering hard-coded values throughout the codebase.

Scoring safeguards: - Validate that active weights are non-negative and
sum to 100% (or normalize through an explicitly documented rule). -
Handle missing profile data without silently treating missing data as a
negative score. - Keep scoring deterministic and explainable for the
same input and configuration. - Provide reasons/evidence for the result
and identify missing inputs that limit confidence. - Add unit tests for
edge cases, boundaries, empty profiles, and weight changes. - Avoid
letting academic context unfairly dominate the recommendation; its
initial weight is 10%. - Do not make claims about guaranteed jobs,
salaries, or employability from the fit score.

### Skill-gap categories

Use these exact labels consistently: 1. `Critical Missing` 2.
`Recommended Next` 3. `Optional Advantage`

The category should reflect the relationship between a skill and the
chosen career path, prerequisites, and current student evidence. Provide
a reason for the classification and a practical next action. Do not
label a skill "critical" merely because it is popular.

------------------------------------------------------------------------

## 5. Phase-by-phase roadmap and status tracker

### Reconciliation note — 24 October 2026

The repository history and local checkout confirm that Phases 1 through 7 are committed, and Phase 8 is implemented, tested, and verified locally:
1. **Phase 05** (`5ceaec2`): `Career Explorer & Catalog` delivered career browsing, category filters, search, and career detail pages.
2. **Phase 06** (`a85eb4e`): `Career Fit and Skill-Gap Engine` delivered configurable weighted fit scoring (50/25/15/10), explainable rationale, and strict skill-gap categorization (`Critical Missing`, `Recommended Next`, `Optional Advantage`).
3. **Phase 07** (`3db8025`): `Personalized Learning Roadmap` delivered deterministic 30-day/4-week plans, time-budget pacing (8/12/15/20 hrs), atomic progress tracking, and safe versioned regeneration. Independently audited in the local repository with 15 backend and 5 frontend tests passing.
4. **Phase 08** (Working Tree — Ready to Commit): `Project-Based Learning & Portfolio Evidence` delivered project templates and custom projects, deterministic gap-matching recommendations, 7 deliverable evidence types, explicit self-reported transparency disclosures, safe task linking (`onDelete: SetNull`), and 24 backend + 6 frontend tests.

#### Scope Overlap Reconciliation
- **Former Proposed Phase 8 ("Career Discovery / Explorer Experience")**: Redundant with Phase 05; permanently replaced by `Phase 08: Project-Based Learning & Portfolio Evidence`.
- **Former Proposed Phase 10 ("Skill-Gap Recommendations")**: Redundant; delivered in Phase 06 (`Skill-Gap Engine`) and prioritized across Phase 07 (`Roadmaps`) and Phase 08 (`Project Recommendations`).
- **Former Proposed Phase 12 ("Progress, Milestones & Evidence")**: Redundant; delivered across Phase 07 (Milestones/Roadmap tasks) and Phase 08 (Deliverables, Evidence links, Repos, Demos, Task linking).
- **Forward Reconciled Sequence**: Establishes **Phase 09: Career Path Comparison & Decision Matrix** as the immediate next phase (fulfilling the V1 "Must Have" requirement), followed by **Phase 10: Unified Student Dashboard**, **Phase 11: Technology Interest Assessment & Recommendation Refresh**, and **Phase 12: Curated Learning Resources**. Startup add-ons (mentors, subscriptions) remain deferred to later phases.

### Status snapshot

The status below reflects the independently verified repository and working tree state as of 24 October 2026.

  -----------------------------------------------------------------------------------------------------------------------------------
  Phase             Name                                   Current status                           Scope / exit gate
  ----------------- -------------------------------------- ---------------------------------------- ---------------------------------
  1                 Architecture & Foundation              `COMPLETED — VERIFIED`                   Design tokens, layout shells, UI baseline (React 19, Vite, Tailwind v4).

  2                 Landing Page & Public Experience       `COMPLETED — VERIFIED`                   Landing page, value propositions, navigation shells.

  3                 Authentication & Sessions              `COMPLETED — VERIFIED` (`3fb1241`)       Registration, login, HttpOnly cookies, password hashing, session isolation.

  4                 Student Onboarding & Profile           `COMPLETED — VERIFIED` (`d26ca17`)       6-step onboarding wizard, education/skills/experience profile, input validation.

  5                 Career Explorer & Catalog              `COMPLETED — VERIFIED` (`5ceaec2`)       12 curated tech careers, search, filtering, detailed role descriptions.

  6                 Career-Fit & Skill-Gap Engine          `COMPLETED — VERIFIED` (`a85eb4e`)       50/25/15/10 scoring engine, `Critical Missing`/`Recommended Next`/`Optional Advantage`.

  7                 Personalized Learning Roadmap          `COMPLETED — AUDIT VERIFIED` (`3db8025`) 30-day / 4-week roadmap, time-budget pacing, atomic progress tracking.

  8                 Project-Based Learning & Evidence      `COMPLETED — VERIFIED (READY TO COMMIT)` Project templates, custom projects, deterministic recommendations, deliverables.

  9                 Career Path Comparison & Decision      `NEXT — RECOMMENDED FOR APPROVAL`        Side-by-side 2–3 career comparison, skill overlap/gap delta, decision matrix (V1 Must Have).

  10                Unified Student Dashboard              `PLANNED`                                Cohesive home hub replacing AppCheckpoint, active career status, next learning actions.

  11                Interest Assessment & Re-Scoring       `PLANNED`                                9–10 question structured assessment, versioned responses, dynamic fit refresh.

  12                Curated Learning Resources & Courses   `PLANNED`                                Free/open tutorials, documentation, and videos mapped to roadmap tasks and gaps.

  13                Bounded AI Guidance Layer              `PLANNED`                                Grounded explanations, comparison summaries, zero hallucination of authoritative scores.

  14                Mentor Directory & Matching            `PLANNED — OPERATIONS CONTINGENT`        Mentor profiles, scheduling workflow, only when operationally staffed.

  15                Subscription & Entitlements            `PLANNED — LATER`                        Hypothesis validation (₹99/3-mo Pro), entitlement gates, checkout flow.

  16                UI/UX Polish & Accessibility           `PLANNED — CROSS-CUTTING`                WCAG 2.1 AA audit, mobile responsive polish, comprehensive loading/empty/error states.

  17                QA, Security & Production Deployment   `PLANNED — CROSS-CUTTING`                End-to-end integration tests, security audit, CI/CD pipeline, production container/hosting.

  18                Launch Readiness & Analytics           `PLANNED`                                Privacy-conscious telemetry, funnel metrics, feedback collection, launch checklist.
  -----------------------------------------------------------------------------------------------------------------------------------

**Roadmap reconciliation rule:** The original repository or previously
approved master plan may have a different phase naming/order. Before
implementation, compare this proposed tracker with the actual project
roadmap and commit history. Preserve existing phase numbers and names
when they are already established. If changes are needed, add a dated
decision explaining the mapping; do not silently renumber completed
phases.

### Phase 7 --- detailed scope and acceptance criteria

**Goal:** Turn the current student's selected/recommended career and
skill-gap data into a useful, persistent, personalized learning plan and
track progress.

#### Expected behavior

-   Generate a deterministic 30-day roadmap organized into four weeks.
-   Use available career-fit and skill-gap outputs to prioritize
    relevant tasks.
-   Each task should have a title, description, linked skill or goal,
    effort estimate, ordering, completion criteria, and progress state.
-   Where evidence is required, define what evidence means (for example,
    a project link, submitted artifact, or self-confirmation) and avoid
    collecting unnecessary personal data.
-   Include weekly milestones or checkpoints.
-   Persist roadmaps and progress using the project's existing
    backend/database architecture.
-   Enforce server-side ownership checks so students can only access or
    update their own roadmap data unless an explicit mentor/admin
    permission model is implemented.
-   Support valid progress transitions and prevent malformed or
    unauthorized updates.
-   Display roadmap generation errors and empty states clearly.
-   Re-generation must have a deliberate behavior: do not silently erase
    progress. Preserve prior progress or ask/offer a clear reset/replace
    action according to the existing product design.
-   Ensure mobile and desktop usability.

#### Tests and exit gate

-   Roadmap generation produces a valid four-week / 30-day structure for
    valid input.
-   Tasks map to the student's selected career path and identified gaps
    where relevant.
-   Missing profile/career data produces a useful guided empty state or
    validation message.
-   Progress changes persist after reload.
-   Unauthorized users cannot read or mutate another student's roadmap.
-   Invalid status transitions or task identifiers are rejected safely.
-   Re-generation behavior does not unexpectedly destroy user progress.
-   Loading, error, empty, and success states are present.
-   Existing Phase 1--6 tests continue to pass.
-   Type checks, lint, build, and relevant automated tests pass.
-   The phase summary lists actual test commands and results, changed
    files, migrations, and commit hash.

------------------------------------------------------------------------

## 6. Startup and business direction

PathPilot may become a startup, but product quality, student trust, and
proof of usefulness come before adding a payment wall.

### Proposed early-stage model

-   Start with a useful free experience so students can understand the
    value before paying.
-   Consider a **Pro subscription at ₹99 for 3 months** as a hypothesis
    to test---not a final commercial commitment.
-   Potential Pro benefits may include deeper career reports, more
    personalization, curated courses/resources, expanded mentor access,
    structured support, and additional roadmap features.
-   The exact free-vs-Pro boundary must be decided after validating
    student needs, service costs, mentor availability, course licensing,
    and willingness to pay.
-   Do not charge students through a payment gateway in the initial
    development stage unless the founder explicitly approves the payment
    phase.
-   Do not build fake subscription status or grant premium access based
    only on a frontend flag. Entitlements must be enforced by the
    backend.
-   Do not advertise "24/7 support" or guaranteed mentor availability
    until the operating model can deliver it.
-   Show the total price, subscription duration, renewal behavior,
    cancellation terms, and refund/support policy clearly before
    payment.
-   Payment provider, tax/legal requirements, data retention, and
    consumer-facing terms must be reviewed before launch.

### Startup validation questions to answer before monetization

-   Which student segment is the first target: early-year students,
    final-year students, career switchers, or another group?
-   What is the smallest useful outcome PathPilot can reliably deliver?
-   Which features are free and which truly justify Pro?
-   Can the team provide actual mentor capacity at the proposed price?
-   Which course/resource integrations are legally and operationally
    available?
-   What will indicate that students trust the recommendations and make
    progress?
-   What support and privacy expectations can the team realistically
    meet?

------------------------------------------------------------------------

## 7. UI/UX direction

The product should look and behave like a polished, modern EdTech
application personalized for each student.

### Experience principles

-   A clear landing page that explains the benefit and sets realistic
    expectations.
-   A short guided onboarding flow with visible progress and a
    save/resume strategy where practical.
-   Dashboard-first experience after onboarding, with one clear
    recommended next action.
-   Career cards and detail pages that emphasize fit reasons, skills,
    gaps, and next steps.
-   A readable roadmap with weekly sections, task completion,
    milestones, and progress summaries.
-   Clear visual hierarchy, consistent spacing, typography, components,
    and interaction states.
-   Responsive behavior for mobile, tablet, and desktop.
-   Accessible color contrast, focus indicators, keyboard support,
    labels, and meaningful error messages.
-   Avoid excessive charts, noisy gradients, decorative animation, or
    large blocks of text that hide the next action.
-   Provide skeleton/loading states, empty states, retry actions, and
    helpful validation feedback.
-   Avoid using fabricated testimonials, fake mentor profiles, fake
    course availability, or misleading outcome statistics.

### UI/UX audit checklist

-   Can a first-time student explain what PathPilot does within a few
    seconds?
-   Can a student complete registration and assessment without
    confusion?
-   Is the progress through onboarding clear?
-   Are the recommendations understandable without expert knowledge?
-   Can a student edit interests and understand how recommendations
    change?
-   Is the next step obvious on the dashboard and roadmap?
-   Does the UI work at narrow mobile widths?
-   Are form errors attached to the relevant field and understandable?
-   Are destructive actions, resets, and regeneration clearly explained?
-   Are accessibility and loading/empty/error states tested?

------------------------------------------------------------------------

## 8. Security, privacy, and responsible guidance

Security and privacy are cross-cutting requirements, not a
final-phase-only task.

-   Never commit secrets, API keys, database URLs, access tokens, or
    real student records.
-   Use environment variables and safe configuration patterns already
    established by the repository.
-   Validate input on the server; do not trust frontend validation
    alone.
-   Enforce authentication and authorization on protected API routes.
-   Ensure student records and roadmaps are scoped to the authenticated
    user.
-   Use safe password/session/token handling according to the current
    auth architecture.
-   Avoid exposing internal errors, stack traces, database details, or
    secrets to end users.
-   Apply rate limits and abuse protections where appropriate,
    especially for authentication and AI endpoints.
-   Minimize collected personal data and document why each field is
    needed.
-   Use appropriate consent, retention, deletion, and privacy
    disclosures before public launch.
-   Be cautious with minors: do not assume every student is an adult;
    design age-appropriate data and consent handling and obtain
    qualified review where required.
-   Treat AI-generated guidance as assistance, not an authoritative
    decision about a student's future.
-   Do not rank students by personal worth or use protected/sensitive
    traits to make career recommendations.
-   Keep explanations grounded in profile data and configured scoring
    logic.
-   Provide ways to correct profile data and challenge or change a
    recommendation.

------------------------------------------------------------------------

## 9. Agentic platform direction

"Agentic" should mean the platform can coordinate useful, bounded steps
toward a student's goal---not that every feature must be powered by a
free-form LLM.

### Recommended division of responsibility

**Deterministic services** - Profile and assessment validation. -
Career-fit scoring and score explanation. - Skill-gap classification. -
Roadmap generation and progress state transitions. - Entitlement checks
and authorization. - Audit-critical actions and data persistence.

**AI-assisted capabilities (introduced deliberately)** - Explain a
recommendation in student-friendly language using grounded evidence. -
Help the student compare two paths. - Suggest project ideas that map to
a known skill gap. - Help break a learning goal into manageable tasks. -
Answer questions using approved career/resource data. - Summarize
progress and suggest the next action based on actual roadmap state.

### Agent safeguards

-   Ground responses in the student's authorized data and trusted
    platform sources.
-   Never allow the model to bypass authorization or directly invent
    persisted facts.
-   Validate structured outputs before saving or using them.
-   Keep deterministic career scores separate from generated
    explanations.
-   Make consequential actions---such as resetting a roadmap, booking a
    mentor, or making a payment---explicit and user-confirmed.
-   Add evaluation examples for correctness, usefulness, fairness,
    prompt injection, and unsupported claims before expanding AI access.
-   Provide graceful fallback when the AI service is unavailable.
-   Monitor cost, latency, failure rate, and quality before promising
    unlimited usage.

------------------------------------------------------------------------

## 10. Suggested delivery plan for the one-month target

The founder's target is to create a substantial first version in
approximately one month. Treat this as a delivery constraint, not a
reason to skip testing, privacy, or security.

### Suggested order of work

1.  **Finish current phase:** Verify Phase 7, fix defects, test, commit,
    and update this file.
2.  **Complete core student journey:** Ensure authentication/profile,
    assessment, explainable recommendations, career details, skill gaps,
    and roadmap work together end to end.
3.  **Close usability gaps:** Responsive UI, empty/loading/error states,
    accessible forms, clear navigation.
4.  **Add progress and personalization:** Save progress, allow
    assessment edits, and refresh recommendations safely.
5.  **Add bounded AI assistance:** Only after deterministic data flows
    are reliable; use grounded explanations and safe fallbacks.
6.  **Prepare resource and mentor foundation:** Start with real curated
    resource metadata and a feasible mentor workflow; avoid claiming
    unavailable services.
7.  **Validate subscription concept:** Design entitlement boundaries and
    checkout only after free journey and pricing assumptions are
    reviewed.
8.  **Run launch readiness checks:** End-to-end testing, authorization
    checks, deployment verification, privacy copy, feedback collection,
    and known-limitations list.

### Scope rule for a one-month MVP

Prioritize a coherent, reliable core journey over a large number of
unfinished features. A smaller platform that lets a student register,
complete an assessment, understand a recommendation, and follow a
working roadmap is more valuable than a broad UI with nonfunctional
mentor, payment, or AI features.

At the end of each week, review: - Working end-to-end user journeys. -
Defects and security gaps. - Remaining must-have scope. - External
dependencies (AI, email, course data, payment, mentors). - What can be
safely deferred.

------------------------------------------------------------------------

## 11. Data and analytics to consider

Do not add analytics that are not needed. Once the core journey works,
consider privacy-conscious product signals such as: - Registration
completion rate. - Assessment start/completion rate. - Recommendation
view and save rate. - Career comparison usage. - Roadmap task starts and
completions. - Assessment edits and recommendation refreshes. - Student
feedback on recommendation relevance. - Time to first useful action. -
Error rates and slow endpoints. - Pro interest/checkout conversion only
after a real pricing test.

Do not collect sensitive details simply because they might be
analytically interesting. Document the purpose and retention period for
any event data.

------------------------------------------------------------------------

## 12. Decisions log

Record dated decisions here so future chats and coding agents do not
silently change the project direction.

  -----------------------------------------------------------------------
  Date                    Decision                State / notes
  ----------------------- ----------------------- -----------------------
  2026-08 (exact day to   PathPilot to be         Established project
  verify)                 developed               working rule
                          phase-by-phase using
                          Antigravity; founder
                          owns product decisions
                          and implementation
                          agent follows scoped
                          prompts

  2026-10-21              Phases 1--6 reported    Verify against Git
                          complete/committed;     history
                          Phase 7 is personalized
                          learning roadmap and
                          progress tracking

  2026-10-21              Initial career-fit      Configurable initial
                          weights: skills 50%,    weights
                          project/experience 25%,
                          interests 15%, academic
                          context 10%

  2026-10-21              Skill-gap categories    Preserve exact labels
                          fixed as
                          `Critical Missing`,
                          `Recommended Next`,
                          `Optional Advantage`

  2026-10-24              Startup direction:      Product direction;
                          student profile,        pricing and operations
                          9--10-question interest not validated
                          assessment,
                          personalized career
                          recommendations,
                          mentor/resource
                          support, possible
                          ₹99/3-month Pro offer

  2026-10-24              One-month target for a  Prioritize end-to-end
                          usable first version    MVP and safety over
                                                  feature count

  2026-10-24              Phase 7 Acceptance      15 backend & 5 frontend
                          Audit Verified          tests passed (commit
                                                  3db8025); zero
                                                  regressions

  2026-10-24              Phase 8 Implemented     Added Project & Deliverable
                          and Verified Locally    models; deterministic gap
                                                  matching (+30/+15/+5/+40);
                                                  self-evidence disclaimer;
                                                  safe task unlinking; 24
                                                  backend & 6 frontend tests

  2026-10-24              Roadmap Reconciliation  Consolidated redundant
                          & Phase 9 Sequence      phases (former 8, 10, 12);
                                                  established Phase 09 as
                                                  Career Path Comparison
                                                  (V1 Must Have)
  -----------------------------------------------------------------------

Add a row for every meaningful change to architecture, scoring, data
model, phase sequence, pricing, or product scope. Include a reason and
migration/compatibility impact where relevant.

------------------------------------------------------------------------

## 13. Phase completion report template

Copy and fill this after each phase:

``` markdown
## Phase NN — [Phase Name]

- Status: COMPLETED / BLOCKED / NEEDS AUDIT
- Date:
- Branch:
- Commit:
- Scope completed:
- Files/modules changed:
- Database migrations or data changes:
- API/UI behavior added or changed:
- Tests run:
  - Unit:
  - Integration:
  - Type check:
  - Lint:
  - Build:
  - Manual end-to-end:
- Actual results:
- Acceptance criteria passed:
- Known issues / deferred items:
- Security and authorization checks:
- UI/responsive/accessibility checks:
- Founder decisions needed:
- Master tracker updated: Yes/No
- Next phase and reason:
```

Never claim a test passed unless it was actually run and its result was
observed. If a check could not be run, record why.

### Verified Phase Completion Reports

#### Phase 07 — Personalized Learning Roadmap & Progress Tracking

- **Status:** COMPLETED — AUDIT VERIFIED
- **Date:** 2026-10-24
- **Branch:** main
- **Commit:** `3db80256d01c0e4b5d92de978bb03afeffbf3cb0`
- **Scope completed:**
  - Deterministic 30-day / 4-week structured roadmap engine.
  - Realistic time-budget pacing (8, 12, 15, 20 hrs/week) with deferred skill transparency.
  - Atomic progress tracking (`NOT_STARTED` ↔ `IN_PROGRESS` ↔ `COMPLETED` ↔ `BLOCKED`).
  - Safe versioned regeneration archiving prior roadmaps and incrementing version.
  - Cross-user tenant isolation and ownership validation.
- **Files/modules changed:**
  - `backend/prisma/schema.prisma` (`Roadmap`, `RoadmapTask`)
  - `backend/src/services/roadmapService.ts`, `backend/src/services/roadmap/roadmapGenerator.ts`
  - `backend/src/controllers/roadmapController.ts`, `backend/src/routes/roadmapRoutes.ts`
  - `backend/tests/roadmap.test.ts`
  - `frontend/src/pages/roadmap/RoadmapPage.tsx`
  - `frontend/src/components/roadmap/RoadmapTaskCard.tsx`, `RoadmapMilestoneBanner.tsx`, `RoadmapProgressOverview.tsx`, `GenerateRoadmapModal.tsx`
  - `frontend/src/tests/roadmapComponents.test.tsx`
- **Database migrations or data changes:** Added `Roadmap` and `RoadmapTask` models with indexes and foreign keys.
- **Tests run & observed results:**
  - Unit & Integration: 15 of 15 backend tests passed in `tests/roadmap.test.ts`.
  - Frontend Components: 5 of 5 tests passed in `src/tests/roadmapComponents.test.tsx`.
  - Full Regression Suite: 105 backend / 53 frontend tests (158 total) passed with zero regressions.
- **Acceptance criteria passed:** 100% of Phase 07 acceptance criteria verified.
- **Master tracker updated:** Yes.
- **Next phase and reason:** Phase 08 — Project-Based Learning & Portfolio Evidence (connects roadmap tasks with concrete proof of competence).

---

#### Phase 08 — Project-Based Learning & Portfolio Evidence

- **Status:** COMPLETED — VERIFIED LOCALLY (READY TO COMMIT)
- **Date:** 2026-10-24
- **Branch:** main
- **Commit:** Pending founder commit command: `git commit -m "Phase 08: Project-Based Learning"`
- **Scope completed:**
  - Curated catalog project templates and custom student projects.
  - Deterministic project recommendation engine based on skill-gap severity (`CRITICAL_MISSING`, `RECOMMENDED_NEXT`, `OPTIONAL_ADVANTAGE`) and target career matching (+30/+15/+5/+40 weights; zero LLM).
  - Project workspace with lifecycle status transitions (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`).
  - Deliverable and evidence tracking across 7 types (`FEATURE_MODULE`, `CODE_REPOSITORY`, `DEPLOYED_DEMO`, `TEST_SUITE`, `DESIGN_PROTOTYPE`, `TECHNICAL_DOCS`, `IMPLEMENTATION_NOTE`).
  - Explicit self-reported evidence transparency disclosure (automated testing and mentor review clearly noted as unsupported).
  - Decoupled roadmap task linking (project completion does not automatically complete roadmap tasks; project deletion safely nullifies roadmap task links with `onDelete: SetNull`).
  - Strict URL validation (HTTP/HTTPS only; blocks dangerous schemes, no server-side fetching).
  - Multi-tenant cross-user ownership isolation.
  - Summary metrics widget in Student Dashboard checkpoint (`/app`).
- **Files/modules changed:**
  - `backend/prisma/schema.prisma` (`Project`, `ProjectDeliverable`)
  - `backend/src/validators/projectValidators.ts`
  - `backend/src/services/project/projectRecommendationEngine.ts`
  - `backend/src/services/projectService.ts`
  - `backend/src/controllers/projectController.ts`
  - `backend/src/routes/projectRoutes.ts`
  - `backend/tests/project.test.ts`
  - `frontend/src/lib/api.ts`
  - `frontend/src/components/project/ProjectCard.tsx`, `ProjectRecommendationCard.tsx`, `DeliverableCard.tsx`, `CreateProjectModal.tsx`, `AddDeliverableModal.tsx`
  - `frontend/src/pages/projects/ProjectsPage.tsx` (`/projects`)
  - `frontend/src/pages/projects/ProjectDetailPage.tsx` (`/projects/:id`)
  - `frontend/src/pages/app/AppCheckpoint.tsx`, `frontend/src/pages/roadmap/RoadmapPage.tsx`, `frontend/src/App.tsx`
  - `frontend/src/tests/projectComponents.test.tsx`
  - `pathpilot-phase8-project-based-learning.md`
- **Database migrations or data changes:** Added `Project` and `ProjectDeliverable` models safely pushed via `npx prisma db push` without data loss.
- **Tests run & observed results:**
  - Unit & Integration: 24 of 24 backend tests passed in `tests/project.test.ts`.
  - Frontend Components: 6 of 6 tests passed in `src/tests/projectComponents.test.tsx`.
  - Full Regression Suite: 105 backend / 53 frontend tests (158 total) passed with zero regressions.
  - Type Check & Build: `tsc` in backend passed (code 0); `tsc -b && vite build` in frontend passed (code 0).
  - Linter & Style: `oxlint` 0 errors; `git diff --check` 0 warnings.
- **Acceptance criteria passed:** 100% of Phase 08 acceptance criteria verified.
- **Master tracker updated:** Yes.
- **Next phase and reason:** Phase 09 — Career Path Comparison & Decision Matrix (V1 Must Have requirement; directly addresses student career uncertainty by comparing 2–3 paths side-by-side on fit score, skill gap delta, salary, and transition effort).

------------------------------------------------------------------------

## 14. Instructions for the separate PathPilot planning chat

Use the following operating instructions when this file is uploaded:

1.  Read this document fully and reconcile it with the current
    repository, the existing master roadmap, phase-specific notes, and
    Git history.
2.  Preserve the current architecture and completed work unless an
    evidence-backed issue requires a proposed change and the founder
    approves it.
3.  Confirm the current phase. The current checkpoint in this file is
    Phase 7, but repository evidence takes precedence if the phase has
    since changed.
4.  Ask for or inspect the latest Antigravity output/test report if
    needed; do not guess what was implemented.
5.  First help the founder verify and finish the current phase. Do not
    jump to the startup add-ons before the existing roadmap is
    reconciled and the core phases are completed.
6.  Produce one comprehensive Antigravity prompt for the next approved
    phase. Include repository inspection, scope boundaries,
    implementation requirements, tests, acceptance criteria, security
    checks, and required documentation updates.
7.  Keep product decisions with the founder. Clearly flag decisions that
    affect pricing, data collection, architecture, scoring, or
    destructive changes.
8.  After each phase, provide a concise review of actual changes, test
    results, remaining gaps, and the exact next step.
9.  Update the phase tracker and decisions log as the project evolves.
    Maintain the existing phase numbers when possible; explain any
    approved changes.
10. Treat the startup features in this file as a target direction, not
    permission to implement everything at once.

### First action after uploading this file

**Audit Phase 7 against the repository and the criteria in Section 5, without disturbing Phase 8 work already in progress.** Inspect the local Git status first, record the existing Phase 8 changes, run the available Phase 7 and full regression tests, list gaps by severity, fix only confirmed Phase 7 defects, and update this tracker with actual results. Do not reset, clean, overwrite, or stage Phase 8 work. After the audit, continue the already-started Phase 8 only with the founder's direction.

------------------------------------------------------------------------

## 15. Reference links

-   Fiverr client-profile setup:
    https://help.fiverr.com/hc/en-us/articles/41011232916625-Setting-up-your-client-profile
-   Fiverr freelancer-profile guidance:
    https://help.fiverr.com/hc/en-us/articles/360010558598-Creating-editing-your-freelancer-profile
-   Fiverr onboarding questionnaire PDF:
    https://fiverr-res.cloudinary.com/image/upload/f_pdf%2Cq_auto/v1/attachments/generic_asset/asset/79f65e22274081923988b57c90db6170-1624372551437/Onboarding%20Questionnaire%20-%20Fiverr.pdf

These references are inspiration for onboarding and understanding user
goals. They are not proof that those platforms use the same student
career-assessment questions described in this document. PathPilot should
create its own original questions and scoring mappings.

------------------------------------------------------------------------

## 16. Living document maintenance

Whenever a phase changes: - Update the phase status table. - Update the
current checkpoint at the top. - Add a dated decision if scope or
assumptions change. - Record commit hash and actual tests in the phase
report. - Mark deferred items explicitly so they are not mistaken for
completed work. - Keep future plans separate from implemented
features. - Keep this file aligned with the actual repository and the
founder-approved roadmap.

**North star:** PathPilot should help a student go from "I don't know
which technology career suits me" to "I understand my options, why one
may fit me, what skills I need, and what practical step I can take
next"---with transparency, agency, and a realistic path to support.
