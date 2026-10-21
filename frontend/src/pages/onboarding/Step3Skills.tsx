import { useState, useMemo } from 'react'
import { Button, Card, CardContent, Input, Select } from '@/components/ui'
import { PREDEFINED_SKILLS } from './constants'
import type { ProfileSkill } from '@/lib/api'

interface Step3SkillsProps {
  initialSkills: ProfileSkill[]
  onSaveAndContinue: (skills: ProfileSkill[]) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function Step3Skills({
  initialSkills,
  onSaveAndContinue,
  onBack,
  isSaving,
}: Step3SkillsProps) {
  const [skills, setSkills] = useState<ProfileSkill[]>(initialSkills || [])
  const [searchQuery, setSearchQuery] = useState('')
  const [customSkillName, setCustomSkillName] = useState('')
  const [customSkillProficiency, setCustomSkillProficiency] = useState<
    'Beginner' | 'Intermediate' | 'Advanced'
  >('Intermediate')
  const [error, setError] = useState<string | null>(null)

  // Map of lowercase names for instant duplicate detection
  const selectedSkillsMap = useMemo(() => {
    const map = new Map<string, ProfileSkill>()
    skills.forEach((s) => map.set(s.name.toLowerCase().trim(), s))
    return map
  }, [skills])

  // Filter predefined skills by search query
  const filteredPredefined = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return PREDEFINED_SKILLS.filter((name) => {
      if (q && !name.toLowerCase().includes(q)) return false
      return true
    })
  }, [searchQuery])

  const handleTogglePredefined = (skillName: string) => {
    setError(null)
    const lower = skillName.toLowerCase().trim()
    if (selectedSkillsMap.has(lower)) {
      setSkills((prev) => prev.filter((s) => s.name.toLowerCase().trim() !== lower))
    } else {
      setSkills((prev) => [...prev, { name: skillName, proficiency: 'Intermediate' }])
    }
  }

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = customSkillName.trim()
    if (!trimmed) {
      setError('Please enter a skill name')
      return
    }

    if (selectedSkillsMap.has(trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already added to your skills list`)
      return
    }

    setSkills((prev) => [...prev, { name: trimmed, proficiency: customSkillProficiency }])
    setCustomSkillName('')
  }

  const handleRemoveSkill = (skillName: string) => {
    setSkills((prev) => prev.filter((s) => s.name.toLowerCase().trim() !== skillName.toLowerCase().trim()))
  }

  const handleChangeProficiency = (
    skillName: string,
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced',
  ) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.name.toLowerCase().trim() === skillName.toLowerCase().trim()
          ? { ...s, proficiency }
          : s,
      ),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSaveAndContinue(skills)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 3 of 8 • Technical Skills
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Skills & Proficiencies</h2>
        <p className="mt-2 text-body text-text-secondary">
          Add the programming languages, frameworks, developer tools, and computer science concepts
          you have worked with or studied.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-8 p-6">
          {/* Selected Skills Section */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-h3 font-semibold text-text-primary">
                Selected Skills ({skills.length})
              </h3>
              {skills.length > 0 && (
                <span className="text-caption text-text-secondary">
                  Click a skill level to adjust proficiency
                </span>
              )}
            </div>

            {skills.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted/30 p-6 text-center">
                <p className="text-body-sm text-text-secondary">
                  No skills selected yet. Click from the catalog below or type a custom skill.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-sm transition-all hover:border-primary/40"
                  >
                    <span className="text-body-sm font-medium text-text-primary">{skill.name}</span>
                    <select
                      value={skill.proficiency}
                      onChange={(e) =>
                        handleChangeProficiency(
                          skill.name,
                          e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                        )
                      }
                      aria-label={`Proficiency for ${skill.name}`}
                      className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-caption font-medium text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      aria-label={`Remove ${skill.name}`}
                      className="ml-1 text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Skill Form */}
          <div className="rounded-lg border border-border bg-surface-muted/30 p-4">
            <h4 className="text-body font-semibold text-text-primary">Add a Custom Skill</h4>
            <p className="text-caption text-text-secondary">
              Don’t see a library, tool, or specialization below? Add it directly.
            </p>
            <form onSubmit={handleAddCustomSkill} className="mt-3 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  id="customSkill"
                  placeholder="e.g. FastAPI, Spring Boot, PyTorch, GraphQL..."
                  value={customSkillName}
                  onChange={(e) => {
                    setCustomSkillName(e.target.value)
                    if (error) setError(null)
                  }}
                  error={error || undefined}
                />
              </div>
              <div className="w-36">
                <Select
                  id="customProficiency"
                  value={customSkillProficiency}
                  onChange={(e) =>
                    setCustomSkillProficiency(
                      e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                    )
                  }
                  aria-label="Custom skill proficiency"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </div>
              <Button type="submit" variant="secondary">
                Add Skill
              </Button>
            </form>
          </div>

          {/* Predefined Skills Search and Filter */}
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-body font-semibold text-text-primary">Common Skills Catalog</h4>
                <p className="text-caption text-text-secondary">Click to add or remove</p>
              </div>
              <div className="w-full sm:w-64">
                <Input
                  id="skillSearch"
                  type="search"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filteredPredefined.map((skillName) => {
                const isSelected = selectedSkillsMap.has(skillName.toLowerCase().trim())
                return (
                  <button
                    key={skillName}
                    type="button"
                    onClick={() => handleTogglePredefined(skillName)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm hover:bg-primary-hover'
                        : 'border border-border bg-surface text-text-secondary hover:border-primary/50 hover:text-text-primary'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{skillName}</span>
                  </button>
                )
              })}
              {filteredPredefined.length === 0 && (
                <p className="py-2 text-caption text-text-muted">
                  No predefined skill matching "{searchQuery}". You can add it as a custom skill above!
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
              ← Back
            </Button>
            <Button type="button" onClick={handleSubmit} isLoading={isSaving}>
              Continue to Experience →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
