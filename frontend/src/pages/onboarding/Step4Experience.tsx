import { useState } from 'react'
import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui'
import type { ExperienceType, ProfileExperience } from '@/lib/api'

interface Step4ExperienceProps {
  initialExperiences: ProfileExperience[]
  onSaveAndContinue: (experiences: ProfileExperience[]) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function Step4Experience({
  initialExperiences,
  onSaveAndContinue,
  onBack,
  isSaving,
}: Step4ExperienceProps) {
  const [experiences, setExperiences] = useState<ProfileExperience[]>(initialExperiences || [])
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Form states for adding/editing single entry
  const [type, setType] = useState<ExperienceType>('project')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setType('project')
    setTitle('')
    setOrganization('')
    setStartDate('')
    setEndDate('')
    setLink('')
    setDescription('')
    setFormError(null)
    setIsAdding(false)
    setEditingIndex(null)
  }

  const handleStartEdit = (index: number) => {
    const exp = experiences[index]
    setType(exp.type)
    setTitle(exp.title)
    setOrganization(exp.organization || '')
    setStartDate(exp.startDate || '')
    setEndDate(exp.endDate || '')
    setLink(exp.link || '')
    setDescription(exp.description || '')
    setFormError(null)
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Title is required')
      return
    }

    const newEntry: ProfileExperience = {
      type,
      title: title.trim(),
      organization: organization.trim() || null,
      startDate: startDate.trim() || null,
      endDate: endDate.trim() || null,
      link: link.trim() || null,
      description: description.trim() || null,
    }

    if (editingIndex !== null) {
      setExperiences((prev) => prev.map((item, idx) => (idx === editingIndex ? newEntry : item)))
    } else {
      setExperiences((prev) => [...prev, newEntry])
    }

    resetForm()
  }

  const handleDelete = (index: number) => {
    setExperiences((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleContinue = async () => {
    await onSaveAndContinue(experiences)
  }

  const getTypeLabel = (t: ExperienceType) => {
    switch (t) {
      case 'internship':
        return 'Internship'
      case 'project':
        return 'Project'
      case 'freelance':
        return 'Freelance'
      case 'competition':
        return 'Competition / Hackathon'
      case 'certification':
        return 'Certification'
      case 'open_source':
        return 'Open Source'
      default:
        return 'Experience'
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 4 of 8 • Experience (Optional)
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Projects & Practical Experience</h2>
        <p className="mt-2 text-body text-text-secondary">
          Add any academic or side projects, internships, hackathons, open-source work, or
          certifications you have completed. You can also skip this step.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          {/* List of existing experiences */}
          {experiences.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-h3 font-semibold text-text-primary">
                Added Entries ({experiences.length})
              </h3>
              <div className="grid gap-3">
                {experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-caption font-semibold text-primary uppercase">
                          {getTypeLabel(exp.type)}
                        </span>
                        <h4 className="text-body font-semibold text-text-primary">{exp.title}</h4>
                      </div>
                      {exp.organization && (
                        <p className="mt-1 text-caption text-text-secondary">
                          Organization: {exp.organization}
                        </p>
                      )}
                      {(exp.startDate || exp.endDate) && (
                        <p className="text-caption text-text-muted">
                          {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ''}
                        </p>
                      )}
                      {exp.description && (
                        <p className="mt-1 text-body-sm text-text-secondary line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStartEdit(idx)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => handleDelete(idx)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Add / Edit Form */}
          {isAdding ? (
            <form
              onSubmit={handleSaveEntry}
              className="rounded-lg border border-primary/30 bg-surface-muted/30 p-5"
            >
              <h4 className="text-body font-semibold text-text-primary">
                {editingIndex !== null ? 'Edit Entry' : 'Add New Project / Experience'}
              </h4>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select
                  id="expType"
                  label="Category"
                  value={type}
                  onChange={(e) => setType(e.target.value as ExperienceType)}
                >
                  <option value="project">Project (Academic or Personal)</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance Work</option>
                  <option value="competition">Competition / Hackathon</option>
                  <option value="certification">Certification</option>
                  <option value="open_source">Open Source Contribution</option>
                  <option value="other">Other</option>
                </Select>

                <Input
                  id="expTitle"
                  label="Title / Project Name"
                  required
                  placeholder="e.g. Distributed Task Queue or Fullstack Developer Intern"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  error={formError || undefined}
                />

                <Input
                  id="expOrg"
                  label="Organization / Company / Platform (Optional)"
                  placeholder="e.g. Startup, College, SIH, Coursera..."
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />

                <Input
                  id="expLink"
                  label="Link / GitHub URL (Optional)"
                  placeholder="e.g. https://github.com/username/project"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />

                <Input
                  id="expStart"
                  label="Start Date / Duration (Optional)"
                  placeholder="e.g. Aug 2025 or 2 months"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <Input
                  id="expEnd"
                  label="End Date (Optional)"
                  placeholder="e.g. Present or Nov 2025"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <Textarea
                  id="expDesc"
                  label="Description / Key Technologies (Optional)"
                  rows={2}
                  placeholder="e.g. Built using React, Node.js, and Redis. Handled concurrent worker processing."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingIndex !== null ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-body-sm text-text-secondary">
                {experiences.length === 0
                  ? 'No experience added yet. Internships and projects are completely optional.'
                  : 'Have another internship, project, or certification to showcase?'}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setIsAdding(true)}
              >
                + Add Experience or Project
              </Button>
            </div>
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
              ← Back
            </Button>
            <div className="flex items-center gap-3">
              {experiences.length === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleContinue}
                  disabled={isSaving}
                >
                  Skip this step
                </Button>
              )}
              <Button type="button" onClick={handleContinue} isLoading={isSaving}>
                Continue to Interests →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
