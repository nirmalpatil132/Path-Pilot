/**
 * Normalizes a skill string: trimmed, lowercased, strips redundant punctuation.
 */
export function normalizeSkill(rawSkill: string): string {
  if (!rawSkill) return ''
  return rawSkill
    .trim()
    .toLowerCase()
    .replace(/[._/\\()\-:[\];,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Explicit canonical alias mapping dictionary.
 * Maps developer shorthands to standard canonical terminology.
 */
export const EXPLICIT_SKILL_ALIASES: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  py: 'python',
  python: 'python',
  cpp: 'c++',
  'c++': 'c++',
  dsa: 'data structures algorithms',
  oop: 'object oriented design',
  dbms: 'relational databases sql',
  sql: 'sql',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  psql: 'postgresql',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  reactjs: 'react',
  react: 'react',
  nodejs: 'node js',
  node: 'node js',
  express: 'express',
  expressjs: 'express',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  docker: 'docker containerization',
  aws: 'cloud platforms',
  gcp: 'cloud platforms',
  azure: 'cloud platforms',
  figma: 'wireframing prototyping',
  pandas: 'pandas numpy',
  numpy: 'pandas numpy',
  ml: 'machine learning fundamentals',
  a11y: 'web accessibility',
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Returns canonical key for comparison.
 */
export function getCanonicalSkill(raw: string): string {
  const normalized = normalizeSkill(raw)
  return EXPLICIT_SKILL_ALIASES[normalized] || normalized
}

/**
 * Deterministically checks if a student skill matches a target career skill.
 * Avoids uncontrolled substring matching that causes false positives.
 */
export function isSkillMatch(studentSkill: string, careerSkill: string): boolean {
  const normStudent = normalizeSkill(studentSkill)
  const normCareer = normalizeSkill(careerSkill)

  if (!normStudent || !normCareer) return false

  // Direct normalized equality
  if (normStudent === normCareer) return true

  // Canonical alias equality
  const canonStudent = getCanonicalSkill(studentSkill)
  const canonCareer = getCanonicalSkill(careerSkill)
  if (canonStudent === canonCareer) return true

  const careerWords = normCareer.split(' ')
  const studentWords = normStudent.split(' ')

  // If student skill is a single distinct significant word (e.g. "react", "docker", "python")
  if (studentWords.length === 1 && studentWords[0].length >= 2) {
    const sw = studentWords[0]
    const canonSw = EXPLICIT_SKILL_ALIASES[sw] || sw
    if (careerWords.includes(sw) || careerWords.includes(canonSw)) {
      return true
    }
  }

  // Exact phrase match with word boundaries
  const regex = new RegExp(`(^|\\s)${escapeRegex(normStudent)}(\\s|$)`, 'i')
  if (regex.test(normCareer)) {
    return true
  }

  const canonRegex = new RegExp(`(^|\\s)${escapeRegex(canonStudent)}(\\s|$)`, 'i')
  if (canonRegex.test(normCareer)) {
    return true
  }

  return false
}
