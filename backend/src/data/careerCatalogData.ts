export interface CareerSeedItem {
  slug: string
  title: string
  category: 'Engineering' | 'Data' | 'Security' | 'Infrastructure' | 'Design'
  summary: string
  description: string
  responsibilities: string[]
  coreSkills: Array<{ name: string; description?: string }>
  supportingSkills: Array<{ name: string; description?: string }>
  commonJobTitles: string[]
  exampleProjects: Array<{ title: string; description: string; skills?: string[] }>
  prerequisites: string[]
  relatedCareerSlugs: string[]
  growthPaths: string[]
  interviewAreas: string[]
}

export const CAREER_CATALOG_DATA: CareerSeedItem[] = [
  {
    slug: 'software-developer',
    title: 'Software Developer',
    category: 'Engineering',
    summary: 'Design, write, test, and maintain computer software across diverse platforms and system layers.',
    description:
      'Software Developers solve real-world problems by turning requirements into robust, high-quality code. They write automated tests, participate in code reviews, debug complex issues, and collaborate closely with product managers, QA engineers, and fellow developers to deliver dependable digital products.',
    responsibilities: [
      'Write clean, maintainable, and well-documented code using modern programming languages',
      'Design modular components and algorithms that scale efficiently under load',
      'Create and execute comprehensive unit and integration tests to ensure software reliability',
      'Diagnose runtime bugs and performance bottlenecks across applications',
      'Participate in peer code reviews to maintain code quality standards and architectural consistency',
      'Collaborate with cross-functional teams to translate user needs into technical specifications',
    ],
    coreSkills: [
      { name: 'Data Structures & Algorithms', description: 'Core problem-solving, algorithmic efficiency, and memory management' },
      { name: 'Object-Oriented Design', description: 'Design patterns, modularity, and SOLID design principles' },
      { name: 'Git & Version Control', description: 'Branching strategies, pull requests, merge conflict resolution' },
      { name: 'Java / C++ / Python', description: 'Proficiency in at least one industry-standard general-purpose language' },
      { name: 'Software Debugging', description: 'Root cause analysis using debuggers, profilers, and log analyzers' },
    ],
    supportingSkills: [
      { name: 'Unit Testing', description: 'Writing automated test suites using frameworks like JUnit, pytest, or Jest' },
      { name: 'SQL & Relational Databases', description: 'Querying data and designing straightforward relational schemas' },
      { name: 'CI/CD Pipelines', description: 'Basic automated build and deployment workflows' },
      { name: 'Agile & Scrum', description: 'Sprint planning, backlog grooming, and daily standups' },
    ],
    commonJobTitles: [
      'Junior Software Engineer',
      'Associate Software Developer',
      'Software Development Engineer (SDE I)',
      'Graduate Trainee Engineer',
    ],
    exampleProjects: [
      {
        title: 'Desktop File Deduplication & Indexing Utility',
        description: 'A multi-threaded local application that computes cryptographic hashes to find duplicate files, featuring a clean GUI and automated test coverage.',
        skills: ['Java', 'Object-Oriented Design', 'Unit Testing', 'File I/O'],
      },
      {
        title: 'Algorithmic Pathfinding Visualizer',
        description: 'An interactive desktop or web application demonstrating Dijkstra, A*, and BFS algorithms on a dynamic grid with obstacle generation.',
        skills: ['Data Structures & Algorithms', 'Python', 'Algorithms'],
      },
    ],
    prerequisites: [
      'Foundational programming knowledge in Python, C++, or Java',
      'Basic understanding of time and space complexity (Big-O notation)',
      'Familiarity with standard computer architecture and operating system basics',
    ],
    relatedCareerSlugs: ['full-stack-developer', 'backend-developer', 'frontend-developer'],
    growthPaths: [
      'Senior Software Engineer (Deep technical expertise in architecture and systems)',
      'Engineering Manager (People leadership, delivery management, team mentorship)',
      'Software Architect (High-level system design and technical strategy across teams)',
    ],
    interviewAreas: [
      'Data structures and algorithmic problem solving (Arrays, Trees, Graphs, Dynamic Programming)',
      'Object-oriented design principles and real-world system modeling',
      'Debugging, testing methodology, and code refactoring scenarios',
    ],
  },
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Engineering',
    summary: 'Transform design mockups into fast, accessible, and delightful web and mobile user interfaces.',
    description:
      'Frontend Developers focus on everything the user touches, sees, and experiences in a web application. They translate UX/UI design wireframes into semantic HTML, accessible CSS, and modular JavaScript or TypeScript components. They optimize client-side rendering speed, state management, and ensure a seamless experience across desktop and mobile devices.',
    responsibilities: [
      'Build modular, reusable component libraries using React, Vue, or modern browser standards',
      'Ensure web accessibility compliance (WCAG 2.1 AA) including screen-reader navigation and keyboard focus',
      'Integrate backend REST and GraphQL APIs and handle async states (loading, errors, empty results)',
      'Optimize web performance, Core Web Vitals (LCP, INP, CLS), and assets loading',
      'Maintain cross-browser compatibility and fluid responsive layouts across all device sizes',
      'Partner with UI/UX designers to refine interaction details, animations, and micro-interactions',
    ],
    coreSkills: [
      { name: 'HTML5 & Semantic Markup', description: 'Proper semantic tags, document hierarchy, and accessible structure' },
      { name: 'Modern CSS & Responsive Design', description: 'Flexbox, Grid, container queries, CSS variables, and utility styling' },
      { name: 'JavaScript (ES6+)', description: 'Asynchronous programming, closures, DOM manipulation, and promises' },
      { name: 'React', description: 'Hooks, functional components, component lifecycle, and state architecture' },
      { name: 'TypeScript', description: 'Type safety, interfaces, generics, and strict client-side validation' },
    ],
    supportingSkills: [
      { name: 'Web Accessibility (a11y)', description: 'ARIA attributes, focus management, color contrast, and keyboard support' },
      { name: 'Web Performance & Core Web Vitals', description: 'Code splitting, lazy loading, image optimization, and bundle minimization' },
      { name: 'State Management', description: 'Managing global client state via Zustand, Redux Toolkit, or Context' },
      { name: 'Frontend Testing', description: 'Component and unit tests with Vitest, Jest, and React Testing Library' },
    ],
    commonJobTitles: [
      'Junior Frontend Developer',
      'Associate UI Engineer',
      'Web Application Developer',
      'Frontend Engineer I',
    ],
    exampleProjects: [
      {
        title: 'Accessible E-Commerce Product Catalog',
        description: 'A responsive storefront with instant faceted filtering, debounced search, accessible modal dialogs, and persistent shopping cart using TypeScript and React.',
        skills: ['React', 'TypeScript', 'CSS Grid', 'Web Accessibility (a11y)'],
      },
      {
        title: 'Kanban Task Board with Drag-and-Drop',
        description: 'A productivity application with dynamic columns, local storage synchronization, keyboard shortcuts, and optimistic UI updates.',
        skills: ['React', 'JavaScript (ES6+)', 'State Management', 'HTML5 & Semantic Markup'],
      },
    ],
    prerequisites: [
      'Solid command of basic HTML, CSS, and vanilla JavaScript',
      'Understanding of browser networking (HTTP requests, CORS, JSON formatting)',
      'Basic familiarity with developer tools (Chrome DevTools Elements and Network tabs)',
    ],
    relatedCareerSlugs: ['full-stack-developer', 'ui-ux-designer', 'software-developer'],
    growthPaths: [
      'Senior Frontend Engineer (Complex state architectures, micro-frontends, design systems)',
      'Design Technologist / UI Architect (Bridging design tokens, UX engineering, and front-end infrastructure)',
      'Full Stack Developer (Expanding depth into server-side APIs, caching, and database design)',
    ],
    interviewAreas: [
      'JavaScript fundamentals (event loop, closures, scope, prototypes, async/await)',
      'DOM manipulation, rendering pipeline, and browser repaint/reflow optimization',
      'React architecture, custom hooks, component composition, and state patterns',
    ],
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering',
    summary: 'Architect, build, and optimize scalable server-side systems, REST APIs, and database schemas.',
    description:
      'Backend Developers engineer the behind-the-scenes engine of modern applications. They design REST and RPC APIs, structure database models, implement secure authentication, orchestrate background workers, and manage server performance. They ensure data integrity, system security, and scalability under heavy user traffic.',
    responsibilities: [
      'Design, build, and document secure, high-throughput REST and GraphQL APIs',
      'Create and optimize database schemas, queries, indexes, and transactional boundaries',
      'Implement robust authentication, authorization, session management, and password hashing',
      'Set up background processing, queue workers, and asynchronous job pipelines',
      'Write comprehensive unit and integration tests for API endpoints and business logic',
      'Monitor server health, diagnose bottlenecks, and configure application error logging',
    ],
    coreSkills: [
      { name: 'RESTful API Design', description: 'HTTP verbs, status codes, resource modeling, and error contract conventions' },
      { name: 'Relational Databases & SQL', description: 'Schema design, migrations, relational queries, indexes, and ACID transactions' },
      { name: 'Node.js / Express / Python', description: 'Server-side runtime environments and web framework proficiency' },
      { name: 'Authentication & Security', description: 'Session cookies, JWTs, role-based access control, and OWASP backend defenses' },
      { name: 'Data Modeling & ORMs', description: 'Prisma, TypeORM, SQLAlchemy, or raw SQL migrations' },
    ],
    supportingSkills: [
      { name: 'Docker & Containerization', description: 'Packaging server applications into repeatable development and production containers' },
      { name: 'Caching (Redis)', description: 'In-memory caching strategies, TTL management, and session stores' },
      { name: 'Automated Testing', description: 'Supertest, Vitest, Jest for API route integration verification' },
      { name: 'Message Queues', description: 'Asynchronous event streaming and message brokers (RabbitMQ, BullMQ, Kafka)' },
    ],
    commonJobTitles: [
      'Junior Backend Developer',
      'Associate Backend Engineer',
      'Server-Side Developer',
      'Software Engineer - Platform / API',
    ],
    exampleProjects: [
      {
        title: 'Multi-Tenant RBAC Authentication & API Gateway',
        description: 'An Express/TypeScript service implementing session-based auth, role permissions, rate-limiting middleware, and comprehensive automated API tests.',
        skills: ['Node.js / Express / Python', 'RESTful API Design', 'Authentication & Security', 'Automated Testing'],
      },
      {
        title: 'Inventory & Order Processing Engine with Relational Transactions',
        description: 'A transactional backend system that manages concurrent stock reservations, checkout workflows, and idempotent payment webhook handling.',
        skills: ['Relational Databases & SQL', 'Data Modeling & ORMs', 'Caching (Redis)'],
      },
    ],
    prerequisites: [
      'Comfort with server-side programming in Node.js, Python, Java, or Go',
      'Understanding of relational databases, foreign keys, and basic SQL syntax',
      'Working knowledge of HTTP protocol, client-server models, and status codes',
    ],
    relatedCareerSlugs: ['full-stack-developer', 'cloud-devops-engineer', 'software-developer'],
    growthPaths: [
      'Senior Backend Engineer (High-throughput architectures, distributed systems, partitioning)',
      'Systems Architect (Enterprise-scale integration, reliability engineering, data fabric design)',
      'Engineering Manager (Leading platform teams, technical delivery, and engineer mentoring)',
    ],
    interviewAreas: [
      'Relational database design, indexing strategies, normalization vs denormalization',
      'API design principles, idempotent methods, rate limiting, and caching',
      'Concurrency, transactions, connection pooling, and error handling',
    ],
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Engineering',
    summary: 'Deliver complete end-to-end features spanning modern user interfaces, server logic, and databases.',
    description:
      'Full Stack Developers have the versatility to build an entire product feature from scratch. They understand how client components connect to backend services, write the API contracts and business logic, model the database schema, and deploy the application. Their holistic view makes them key contributors in startups and agile product squads.',
    responsibilities: [
      'Build end-to-end features across the entire web application architecture',
      'Develop interactive client-side user interfaces with React, Vue, or Next.js',
      'Create robust server-side APIs, validation rules, and background tasks',
      'Model relational database tables, migrations, and transactional queries',
      'Manage authentication, user state synchronization, and secure cookie/token handling',
      'Deploy applications to staging and cloud production environments with CI/CD',
    ],
    coreSkills: [
      { name: 'Frontend Frameworks (React/Vue)', description: 'Modern declarative component architecture and reactive UI patterns' },
      { name: 'Backend Frameworks (Node/Express)', description: 'Server routing, middleware chains, business logic, and API endpoints' },
      { name: 'Relational Databases & SQL', description: 'Designing tables, foreign keys, and performant relational queries' },
      { name: 'RESTful API Design', description: 'Structured JSON data contracts between frontend and backend' },
      { name: 'Git & Version Control', description: 'Multi-branch feature workflows, code reviews, and releases' },
    ],
    supportingSkills: [
      { name: 'TypeScript', description: 'End-to-end type safety shared across frontend and backend boundaries' },
      { name: 'Docker & Deployment', description: 'Containerizing full-stack apps and hosting on cloud platforms' },
      { name: 'State Management', description: 'Coordinating client caches and server synchronization' },
      { name: 'Automated Testing', description: 'Writing both component tests and API integration tests' },
    ],
    commonJobTitles: [
      'Junior Full Stack Developer',
      'Associate Web Developer',
      'Full Stack Software Engineer',
      'Application Developer',
    ],
    exampleProjects: [
      {
        title: 'Collaborative Project Management Suite',
        description: 'A full-stack application featuring workspace isolation, real-time board updates, relational database modeling, and session-based authentication.',
        skills: ['React', 'TypeScript', 'Node.js / Express', 'Relational Databases & SQL'],
      },
      {
        title: 'Markdown Knowledgebase with Full-Text Search',
        description: 'A documentation platform with article version history, tag taxonomy, dynamic search, and responsive mobile-first reader interface.',
        skills: ['React', 'RESTful API Design', 'Docker & Deployment'],
      },
    ],
    prerequisites: [
      'Familiarity with both browser basics (HTML/CSS/JS) and server-side code execution',
      'Understanding of client-server request-response cycles and JSON payload structures',
      'Basic database querying and schema understanding',
    ],
    relatedCareerSlugs: ['backend-developer', 'frontend-developer', 'software-developer'],
    growthPaths: [
      'Lead Full Stack Engineer (Driving core product feature architecture across platforms)',
      'Technical Founder / Startup CTO (Leading rapid end-to-end prototype to product scaling)',
      'Solution Architect (Designing holistic enterprise platforms and integration layers)',
    ],
    interviewAreas: [
      'End-to-end feature architecture from database schema to UI rendering',
      'Data flow, state management, and API error state propagation',
      'Trade-offs between server-side rendering, client-side rendering, and caching',
    ],
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data',
    summary: 'Turn raw datasets into actionable commercial insights, business intelligence reports, and dashboards.',
    description:
      'Data Analysts empower organizations to make evidence-based decisions. They extract, clean, and validate data from transactional databases, analyze trends, compute key performance indicators (KPIs), and present findings through clear visualizations and executive dashboards that stakeholders can immediately understand.',
    responsibilities: [
      'Write complex SQL queries, window functions, and aggregations to extract business data',
      'Clean, validate, and transform messy raw data into structured analysis tables',
      'Build and maintain interactive dashboards using Tableau, Power BI, or Looker',
      'Identify trends, anomalies, and seasonal patterns in revenue, usage, or operations',
      'Translate business questions from non-technical stakeholders into quantitative metrics',
      'Present reports and data stories highlighting concrete recommendations',
    ],
    coreSkills: [
      { name: 'Advanced SQL', description: 'Window functions, CTEs, subqueries, complex multi-table joins, and aggregations' },
      { name: 'Data Visualization', description: 'Building clear, informative charts and dashboards (Tableau, Power BI, Metabase)' },
      { name: 'Exploratory Data Analysis', description: 'Spotting trends, outliers, data quality issues, and distributions' },
      { name: 'Spreadsheets (Excel / Sheets)', description: 'Pivot tables, VLOOKUP/XLOOKUP, formulas, and financial modeling' },
      { name: 'Business Acumen & Storytelling', description: 'Framing quantitative insights around organizational objectives and decisions' },
    ],
    supportingSkills: [
      { name: 'Python for Data Analysis (Pandas)', description: 'Using Pandas and NumPy for automated data wrangling and batch processing' },
      { name: 'Statistical Foundations', description: 'Hypothesis testing, distributions, standard deviation, and correlation analysis' },
      { name: 'Data Warehousing Concepts', description: 'Star schemas, dimensions, facts, and dimensional data modeling' },
      { name: 'Git & Reproducible Reporting', description: 'Version control for analytics scripts and documented SQL models' },
    ],
    commonJobTitles: [
      'Junior Data Analyst',
      'Business Intelligence Analyst',
      'Product Data Analyst',
      'Operations Analyst',
    ],
    exampleProjects: [
      {
        title: 'Customer Retention & Churn Cohort Dashboard',
        description: 'An interactive SQL and BI dashboard analyzing monthly customer retention cohorts, calculating lifetime value (LTV), and identifying key drop-off triggers.',
        skills: ['Advanced SQL', 'Data Visualization', 'Exploratory Data Analysis'],
      },
      {
        title: 'E-Commerce Marketing Attribution Report',
        description: 'A comprehensive exploratory analysis evaluating marketing campaign ROI, channel conversion rates, and basket size correlations using Python and Excel.',
        skills: ['Spreadsheets (Excel / Sheets)', 'Python for Data Analysis (Pandas)', 'Business Acumen & Storytelling'],
      },
    ],
    prerequisites: [
      'Basic spreadsheet proficiency (formulas, sorting, charting)',
      'Fundamental math and statistics (mean, median, standard deviation, percentages)',
      'Curiosity for uncovering patterns and answering business questions with data',
    ],
    relatedCareerSlugs: ['data-scientist', 'machine-learning-engineer'],
    growthPaths: [
      'Senior Data Analyst (Ownership of company-wide metric definitions and strategic BI)',
      'Analytics Engineer (Bridging data engineering pipelines and analytics modeling in dbt)',
      'Data Scientist (Expanding into predictive modeling and statistical inference)',
    ],
    interviewAreas: [
      'SQL query challenges (aggregations, joins, ranking with window functions)',
      'Metric definitions, KPI formulation, and ambiguous business problem diagnosis',
      'Dashboard design critique, chart selection principles, and executive storytelling',
    ],
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data',
    summary: 'Apply statistical methods, predictive modeling, and machine learning to extract actionable intelligence.',
    description:
      'Data Scientists bridge the gap between advanced statistics, computer science, and domain expertise. They formulate scientific hypotheses, clean and engineer features from complex datasets, train supervised and unsupervised machine learning models, and validate that algorithms perform reliably in production contexts.',
    responsibilities: [
      'Formulate analytical hypotheses to answer exploratory and predictive business questions',
      'Extract, preprocess, and engineer informative features from diverse data sources',
      'Train, tune, and evaluate machine learning algorithms (regression, classification, clustering)',
      'Design and interpret rigorous A/B experiments and hypothesis tests',
      'Document model assumptions, feature importance, and performance evaluation metrics',
      'Collaborate with software and ML engineers to hand off production-ready models',
    ],
    coreSkills: [
      { name: 'Python for Data Science', description: 'Pandas, NumPy, SciPy for data manipulation and vectorization' },
      { name: 'Applied Statistics & Probability', description: 'Hypothesis testing, confidence intervals, regression analysis, distributions' },
      { name: 'Machine Learning Algorithms', description: 'Decision trees, random forests, gradient boosting, clustering, linear models' },
      { name: 'Scikit-Learn', description: 'Model training pipelines, cross-validation, hyperparameter tuning' },
      { name: 'SQL for Data Extraction', description: 'Querying relational databases and cloud data warehouses' },
    ],
    supportingSkills: [
      { name: 'Data Visualization (Seaborn/Plotly)', description: 'Communicating complex statistical relationships through clear visuals' },
      { name: 'A/B Testing & Experimentation', description: 'Sample size calculations, p-values, variance reduction, and test design' },
      { name: 'Feature Engineering', description: 'Imputation, encoding, scaling, and domain-specific feature creation' },
      { name: 'Git & Reproducible Research', description: 'Jupyter notebooks, virtual environments, and reproducible analysis pipelines' },
    ],
    commonJobTitles: [
      'Junior Data Scientist',
      'Associate Data Scientist',
      'Decision Scientist',
      'Quantitative Analyst Trainee',
    ],
    exampleProjects: [
      {
        title: 'Customer Churn Predictive Modeling Pipeline',
        description: 'An end-to-end machine learning project with feature engineering, cross-validated XGBoost model, SHAP value interpretability, and business impact estimates.',
        skills: ['Python for Data Science', 'Machine Learning Algorithms', 'Scikit-Learn', 'Applied Statistics & Probability'],
      },
      {
        title: 'Real Estate Price Valuation Model',
        description: 'A multivariate regression model trained on housing transaction data, incorporating spatial features, residual diagnostics, and interactive dashboard exploration.',
        skills: ['Python for Data Science', 'SQL for Data Extraction', 'Feature Engineering'],
      },
    ],
    prerequisites: [
      'Strong mathematical background in linear algebra, multivariable calculus, and probability',
      'Proficiency in core Python programming (data structures, loops, functions)',
      'Understanding of relational database queries and tabular data structures',
    ],
    relatedCareerSlugs: ['machine-learning-engineer', 'data-analyst'],
    growthPaths: [
      'Senior Data Scientist (Leading complex modeling projects, research initiatives)',
      'Lead Research Scientist (Publishing algorithms, driving proprietary algorithmic IP)',
      'Machine Learning Engineer (Deepening software engineering and production MLOps skills)',
    ],
    interviewAreas: [
      'Statistical theory (bias-variance tradeoff, p-values, regularization, overfitting)',
      'Machine learning model selection, loss functions, and evaluation metrics (ROC-AUC, F1)',
      'Hands-on live coding with Pandas, NumPy, and Scikit-Learn pipelines',
    ],
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data',
    summary: 'Build, deploy, scale, and monitor machine learning models in robust production systems.',
    description:
      'Machine Learning Engineers take algorithmic prototypes and turn them into scalable, production-grade software services. They design automated training pipelines, build low-latency inference APIs, containerize applications, and monitor models for data drift. They unite data science with high-performance software engineering.',
    responsibilities: [
      'Implement production-grade ML pipelines for data preprocessing, training, and evaluation',
      'Deploy models as high-throughput, low-latency REST and gRPC inference microservices',
      'Containerize ML workloads using Docker and deploy on scalable cloud infrastructure',
      'Implement automated model monitoring for prediction latency, throughput, and feature drift',
      'Optimize model size and inference speeds using quantization, batching, and caching',
      'Collaborate with data scientists to transition experimental models into resilient production code',
    ],
    coreSkills: [
      { name: 'Machine Learning Fundamentals', description: 'Deep understanding of supervised, unsupervised, and deep learning architectures' },
      { name: 'Python & Deep Learning Frameworks', description: 'PyTorch, TensorFlow, Keras for training and inference' },
      { name: 'Model Deployment & REST APIs', description: 'FastAPI, Flask, Triton Inference Server, and async request handling' },
      { name: 'Software Engineering & OOP', description: 'Clean code architecture, modular design, design patterns, and unit tests' },
      { name: 'Docker & Containerization', description: 'Building reproducible, production-ready container images for ML workloads' },
    ],
    supportingSkills: [
      { name: 'MLOps & Pipelines', description: 'Tools like MLflow, Kubeflow, Airflow, and model artifact registries' },
      { name: 'Cloud ML Infrastructure', description: 'AWS SageMaker, Google Vertex AI, or Azure ML basics' },
      { name: 'Data Pipeline Engineering', description: 'Efficient batch and streaming feature extraction' },
      { name: 'Linux & Shell Scripting', description: 'Command-line debugging, GPU driver management, and automation' },
    ],
    commonJobTitles: [
      'Junior Machine Learning Engineer',
      'Associate ML Engineer',
      'AI Software Engineer',
      'Applied Machine Learning Engineer',
    ],
    exampleProjects: [
      {
        title: 'Containerized Image Classification Inference Service',
        description: 'A FastAPI service hosting a fine-tuned PyTorch vision model with Docker containerization, request validation, batch inference, and automated endpoint tests.',
        skills: ['Python & Deep Learning Frameworks', 'Model Deployment & REST APIs', 'Docker & Containerization'],
      },
      {
        title: 'Real-Time News Topic Classifier & Drift Monitor',
        description: 'An NLP pipeline featuring TF-IDF / transformer embeddings, model registry logging via MLflow, and automated data drift alert triggers.',
        skills: ['Machine Learning Fundamentals', 'MLOps & Pipelines', 'Software Engineering & OOP'],
      },
    ],
    prerequisites: [
      'Solid foundations in data structures, algorithms, and object-oriented programming',
      'Mathematical maturity in linear algebra, vector calculus, and probability',
      'Familiarity with basic machine learning models and training loops in Python',
    ],
    relatedCareerSlugs: ['data-scientist', 'cloud-devops-engineer', 'backend-developer'],
    growthPaths: [
      'Senior ML Engineer (Large-scale distributed training, high-frequency inference systems)',
      'AI Platform Architect (Designing company-wide MLOps infrastructure and feature stores)',
      'Staff AI Engineer (Guiding foundational model integration and enterprise AI strategy)',
    ],
    interviewAreas: [
      'Software engineering coding challenges (algorithms and data structures)',
      'ML system design (designing a recommendation engine, search ranking, or classification pipeline)',
      'Model deployment strategies, inference latency optimization, and MLOps lifecycle',
    ],
  },
  {
    slug: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Security',
    summary: 'Protect networks, cloud environments, and digital assets by monitoring, assessing, and mitigating threats.',
    description:
      'Cybersecurity Analysts defend organizations against digital attacks, data breaches, and malicious actors. They monitor security information and event management (SIEM) systems, assess infrastructure for vulnerabilities, conduct triage on suspicious activities, enforce compliance, and help formulate rapid incident response plans.',
    responsibilities: [
      'Monitor networks and systems for unauthorized access, suspicious behavior, and anomalous events',
      'Analyze security logs from firewalls, servers, cloud workloads, and intrusion detection systems',
      'Conduct vulnerability scans, risk assessments, and assist in remediation planning',
      'Triage and investigate Tier 1 security alerts and document incident reports',
      'Help enforce security policies, access controls, and industry compliance frameworks',
      'Promote security awareness best practices across the organization',
    ],
    coreSkills: [
      { name: 'Network Protocols & Security', description: 'TCP/IP, DNS, DHCP, SSL/TLS, firewalls, routers, and network packet analysis (Wireshark)' },
      { name: 'Security Fundamentals & CIA Triad', description: 'Confidentiality, Integrity, Availability, authentication, authorization, and cryptographic basics' },
      { name: 'Linux Operating Systems', description: 'Command-line administration, user permissions, process auditing, and system logs' },
      { name: 'Threat Detection & SIEM', description: 'Analyzing security event telemetry in Splunk, Elastic, or Microsoft Sentinel' },
      { name: 'Vulnerability Assessment', description: 'Scanning and interpreting vulnerability reports using Nessus, OpenVAS, or Nmap' },
    ],
    supportingSkills: [
      { name: 'Security Scripting (Python/Bash)', description: 'Automating log parsing, indicator of compromise (IOC) checks, and repetitive audits' },
      { name: 'Incident Response Basics', description: 'Preparation, identification, containment, eradication, and post-incident lessons' },
      { name: 'Web Application Security', description: 'Understanding OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, auth bypasses)' },
      { name: 'Compliance & Frameworks', description: 'Familiarity with NIST Cybersecurity Framework, ISO 27001, and CIS Controls' },
    ],
    commonJobTitles: [
      'Junior Cybersecurity Analyst',
      'SOC Analyst (Tier 1)',
      'Information Security Specialist',
      'Junior Security Engineer',
    ],
    exampleProjects: [
      {
        title: 'Virtual Security Operations Center (SOC) Homelab',
        description: 'A lab environment configured with an intrusion detection system (Suricata/Snort), Elastic SIEM log collection, and simulated brute-force attack triage.',
        skills: ['Threat Detection & SIEM', 'Network Protocols & Security', 'Linux Operating Systems'],
      },
      {
        title: 'Automated Port Scanner & Vulnerability Audit Script',
        description: 'A modular Python tool that uses Nmap libraries to scan network subnets, identify open services, and flag out-of-date service versions.',
        skills: ['Security Scripting (Python/Bash)', 'Vulnerability Assessment', 'Security Fundamentals & CIA Triad'],
      },
    ],
    prerequisites: [
      'Understanding of basic computer networking (IP addressing, subnets, ports, OSI model)',
      'Comfort using the command line in Windows and Linux environments',
      'Foundational grasp of operating systems and file system permissions',
    ],
    relatedCareerSlugs: ['cloud-devops-engineer', 'software-developer'],
    growthPaths: [
      'Senior SOC Analyst / Incident Responder (Leading containment and forensic investigations)',
      'Penetration Tester / Ethical Hacker (Offensive security assessments and red teaming)',
      'Security Architect (Designing zero-trust enterprise security postures)',
    ],
    interviewAreas: [
      'Networking fundamentals, packet inspection, and common protocols (DNS, ARP, HTTPS)',
      'Scenario-based threat triage (e.g. how would you investigate an alert showing unusual outbound traffic?)',
      'OWASP Top 10 vulnerabilities, authentication attacks, and basic cryptographic concepts',
    ],
  },
  {
    slug: 'cloud-devops-engineer',
    title: 'Cloud / DevOps Engineer',
    category: 'Infrastructure',
    summary: 'Automate deployment pipelines and manage scalable, secure, and reliable cloud infrastructure.',
    description:
      'Cloud & DevOps Engineers unite software development and system operations. They automate the entire software delivery lifecycle using continuous integration and continuous delivery (CI/CD) pipelines, configure cloud resources as code (IaC), ensure high availability, and build monitoring dashboards to detect downtime before users notice.',
    responsibilities: [
      'Design, build, and maintain automated CI/CD pipelines for testing and deployment',
      'Provision and manage cloud infrastructure using Infrastructure as Code (Terraform, CloudFormation)',
      'Containerize applications using Docker and manage container clusters with Kubernetes',
      'Implement central logging, metrics collection, and alerting using Prometheus and Grafana',
      'Maintain system reliability, uptime, backup strategies, and disaster recovery procedures',
      'Collaborate with developers to improve build speeds, container efficiency, and release cadences',
    ],
    coreSkills: [
      { name: 'Cloud Platforms (AWS/GCP/Azure)', description: 'Core compute, storage, networking, IAM policies, and cloud architectures' },
      { name: 'Linux System Administration', description: 'Shell scripting, process management, file permissions, and system diagnostics' },
      { name: 'Docker & Containerization', description: 'Creating optimized multi-stage Dockerfiles and container networking' },
      { name: 'CI/CD Pipelines', description: 'GitHub Actions, GitLab CI, or Jenkins for automated testing and releases' },
      { name: 'Infrastructure as Code (IaC)', description: 'Terraform fundamentals, declarative cloud provisioning, and state management' },
    ],
    supportingSkills: [
      { name: 'Kubernetes & Orchestration', description: 'Pods, deployments, services, ingress, and namespace configuration' },
      { name: 'Monitoring & Observability', description: 'Metrics, alerts, dashboards using Prometheus, Grafana, and cloud monitors' },
      { name: 'Networking & DNS', description: 'VPCs, subnets, load balancers, SSL certificates, and routing policies' },
      { name: 'Shell Scripting (Bash)', description: 'Automating system maintenance, environment setup, and batch tasks' },
    ],
    commonJobTitles: [
      'Junior DevOps Engineer',
      'Associate Cloud Engineer',
      'Site Reliability Engineering (SRE) Trainee',
      'Build and Release Engineer',
    ],
    exampleProjects: [
      {
        title: 'Zero-Downtime Multi-Stage CI/CD Deployment Pipeline',
        description: 'A complete GitHub Actions pipeline running linting, automated unit tests, building an optimized Docker image, and deploying to cloud with health check verification.',
        skills: ['CI/CD Pipelines', 'Docker & Containerization', 'Cloud Platforms (AWS/GCP/Azure)'],
      },
      {
        title: 'Infrastructure as Code (IaC) Modular Cloud Environment',
        description: 'A Terraform repository provisioning a secure cloud VPC, public/private subnets, managed database, and auto-scaling compute cluster with remote state locking.',
        skills: ['Infrastructure as Code (IaC)', 'Networking & DNS', 'Linux System Administration'],
      },
    ],
    prerequisites: [
      'Comfort with basic command-line navigation and shell scripting',
      'Basic understanding of networking concepts (IPs, DNS, ports, load balancing)',
      'Familiarity with version control (Git) and the software release lifecycle',
    ],
    relatedCareerSlugs: ['backend-developer', 'cybersecurity-analyst', 'software-developer'],
    growthPaths: [
      'Senior DevOps / SRE (Leading large-scale distributed reliability and incident management)',
      'Cloud Architect (Designing resilient multi-cloud and hybrid infrastructure strategies)',
      'Platform Engineering Lead (Building internal developer platforms to accelerate team velocity)',
    ],
    interviewAreas: [
      'Linux troubleshooting, system calls, resource bottlenecks (CPU, memory, disk I/O)',
      'CI/CD pipeline design, secret management, and deployment strategies (blue-green, canary)',
      'Cloud architecture, VPC isolation, and Infrastructure as Code state management',
    ],
  },
  {
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Design',
    summary: 'Conduct user research, design wireframes and interactive prototypes, and shape intuitive digital products.',
    description:
      'UI/UX Designers ensure that digital applications are easy, intuitive, and enjoyable to use. They conduct user research and interviews, organize information architecture, build low-fidelity wireframes, and craft high-fidelity interactive design systems in Figma. They work directly with frontend developers to ensure design integrity in production.',
    responsibilities: [
      'Conduct user research, interviews, and synthesize findings into actionable personas and journeys',
      'Create wireframes, user flow diagrams, and information architectures for new features',
      'Build interactive, high-fidelity prototypes in Figma demonstrating states and animations',
      'Establish and maintain cohesive design systems with reusable components and tokens',
      'Conduct usability tests, observe user obstacles, and iterate rapidly based on feedback',
      'Collaborate with frontend engineers to provide clear design specifications and redlines',
    ],
    coreSkills: [
      { name: 'Wireframing & Prototyping', description: 'Translating concepts into clickable prototypes in Figma or Sketch' },
      { name: 'User Research & Testing', description: 'Planning interviews, usability tests, heuristic evaluations, and feedback synthesis' },
      { name: 'Design Systems & Component Design', description: 'Typography scales, color tokens, autolayout, component variants, and states' },
      { name: 'Information Architecture', description: 'Navigation structures, card sorting, user flows, and site mapping' },
      { name: 'Visual Hierarchy & Typography', description: 'Contrast, readability, balance, layout rhythm, and spatial grids' },
    ],
    supportingSkills: [
      { name: 'Accessibility (WCAG)', description: 'Accessible color contrast ratios, focus states, and inclusive design principles' },
      { name: 'Basic HTML/CSS Knowledge', description: 'Understanding developer constraints, Flexbox behavior, and responsive rules' },
      { name: 'Interaction Design & Micro-animations', description: 'Designing meaningful transitions, feedback states, and hover effects' },
      { name: 'Design Handoff & Documentation', description: 'Annotating specs, tokens, and asset exports for engineering handoff' },
    ],
    commonJobTitles: [
      'Junior UI/UX Designer',
      'Associate Product Designer',
      'Interaction Designer',
      'User Experience Researcher Trainee',
    ],
    exampleProjects: [
      {
        title: 'End-to-End Mobile Banking Experience Redesign',
        description: 'A comprehensive Figma project featuring competitor analysis, user journey maps, wireframes, an accessible component library, and a clickable mobile prototype tested with users.',
        skills: ['Wireframing & Prototyping', 'Design Systems & Component Design', 'User Research & Testing'],
      },
      {
        title: 'Design System & Component Kit for SaaS Dashboard',
        description: 'A responsive Figma design system with light/dark tokens, comprehensive button states, navigation patterns, and developer handoff documentation.',
        skills: ['Design Systems & Component Design', 'Visual Hierarchy & Typography', 'Accessibility (WCAG)'],
      },
    ],
    prerequisites: [
      'Keen eye for visual clarity, alignment, and digital layout aesthetics',
      'Empathy for user frustrations and curiosity about how people interact with software',
      'Familiarity with basic vector design tools (Figma or equivalent)',
    ],
    relatedCareerSlugs: ['frontend-developer', 'software-developer'],
    growthPaths: [
      'Senior Product Designer (Owning strategic feature design and multi-platform consistency)',
      'Design Systems Lead (Crafting enterprise design tokens, component architecture, and guidelines)',
      'Head of Design / UX Director (Shaping brand experience, design vision, and design team leadership)',
    ],
    interviewAreas: [
      'Portfolio walkthrough: explaining the problem statement, user research, and iterations',
      'Design critique: analyzing an existing mobile or web app and proposing UX improvements',
      'Live whiteboarding challenge: designing a solution for a user workflow with clear trade-offs',
    ],
  },
]
