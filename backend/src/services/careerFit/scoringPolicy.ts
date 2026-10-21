export interface ScoringWeights {
  skills: number
  projects: number
  interests: number
  academics: number
}

export interface ScoringPolicy {
  version: string
  weights: ScoringWeights
}

export const SCORING_POLICY_VERSION = '1.0.0'

/**
 * Founder-approved default scoring weights:
 * - Skills: 50%
 * - Projects & Experience: 25%
 * - Interests: 15%
 * - Academic Context: 10%
 * Total = 100%
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skills: 0.50,
  projects: 0.25,
  interests: 0.15,
  academics: 0.10,
}

export const DEFAULT_SCORING_POLICY: ScoringPolicy = {
  version: SCORING_POLICY_VERSION,
  weights: DEFAULT_SCORING_WEIGHTS,
}

/**
 * Validates that scoring weights are non-negative and sum to exactly 1.0 (100%).
 */
export function validateScoringWeights(weights: ScoringWeights): { isValid: boolean; error?: string } {
  const values = [weights.skills, weights.projects, weights.interests, weights.academics]

  for (const v of values) {
    if (typeof v !== 'number' || isNaN(v) || v < 0) {
      return { isValid: false, error: 'All weight values must be non-negative numbers.' }
    }
  }

  const sum = values.reduce((acc, curr) => acc + curr, 0)
  // Float tolerance check for sum === 1.0
  if (Math.abs(sum - 1.0) > 0.001) {
    return {
      isValid: false,
      error: `Scoring weights must sum to exactly 1.0 (100%). Current sum: ${sum.toFixed(3)}.`,
    }
  }

  return { isValid: true }
}

export type DimensionKey = keyof ScoringWeights

export interface DimensionAvailability {
  dimension: DimensionKey
  isAvailable: boolean
  exclusionReason?: string
}

export interface EffectiveWeightsResult {
  effectiveWeights: Record<DimensionKey, number>
  availableDimensions: DimensionKey[]
  excludedDimensions: Array<{ dimension: DimensionKey; reason: string }>
}

/**
 * Normalizes remaining available weights when one or more dimensions lack evidence.
 * Prevents treating unavailable data as a penalty (negative evidence).
 */
export function calculateEffectiveWeights(
  configuredWeights: ScoringWeights,
  availabilities: DimensionAvailability[],
): EffectiveWeightsResult {
  const availableDims: DimensionKey[] = []
  const excludedDims: Array<{ dimension: DimensionKey; reason: string }> = []

  let availableSum = 0

  for (const item of availabilities) {
    if (item.isAvailable) {
      availableDims.push(item.dimension)
      availableSum += configuredWeights[item.dimension]
    } else {
      excludedDims.push({
        dimension: item.dimension,
        reason: item.exclusionReason || 'No data recorded for this dimension.',
      })
    }
  }

  const effectiveWeights: Record<DimensionKey, number> = {
    skills: 0,
    projects: 0,
    interests: 0,
    academics: 0,
  }

  if (availableSum > 0) {
    for (const dim of availableDims) {
      effectiveWeights[dim] = configuredWeights[dim] / availableSum
    }
  }

  return {
    effectiveWeights,
    availableDimensions: availableDims,
    excludedDimensions: excludedDims,
  }
}

/**
 * Minimum Evidence Policy:
 * To compute a meaningful score, a profile must provide at least:
 * 1. Skills data, OR
 * 2. At least two other dimensions with data.
 * If neither is satisfied, the profile is flagged as INSUFFICIENT_DATA.
 */
export function evaluateEvidenceSufficiency(
  availabilities: DimensionAvailability[],
): { status: 'SUFFICIENT_EVIDENCE' | 'INSUFFICIENT_DATA'; reason?: string } {
  const skillsAvailable = availabilities.find((a) => a.dimension === 'skills')?.isAvailable ?? false
  const availableCount = availabilities.filter((a) => a.isAvailable).length

  if (skillsAvailable || availableCount >= 2) {
    return { status: 'SUFFICIENT_EVIDENCE' }
  }

  return {
    status: 'INSUFFICIENT_DATA',
    reason:
      'Insufficient profile evidence to calculate an honest career fit score. Please add at least one technical skill or academic details to your profile.',
  }
}
