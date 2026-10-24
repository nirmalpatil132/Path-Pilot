import { useState, useEffect } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import type { CareerListItem, CreateProjectPayload, ProjectStatus } from '@/lib/api'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateProjectPayload) => Promise<void>
  careers?: CareerListItem[]
  initialTemplate?: {
    templateId: string
    title: string
    description: string
    skills: string[]
    careerSlug: string
    careerTitle: string
  } | null
}

function isValidHttpUrl(stringVal?: string | null): boolean {
  if (!stringVal || stringVal.trim() === '') return true
  try {
    const url = new URL(stringVal.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  careers = [],
  initialTemplate,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [careerSlug, setCareerSlug] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('PLANNED')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [liveDemoUrl, setLiveDemoUrl] = useState('')
  const [notes, setNotes] = useState('')

  const [repoError, setRepoError] = useState<string | null>(null)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.title)
      setDescription(initialTemplate.description)
      setCareerSlug(initialTemplate.careerSlug)
      setSkillsText(initialTemplate.skills.join(', '))
      setStatus('IN_PROGRESS')
    } else {
      setTitle('')
      setDescription('')
      setCareerSlug('')
      setSkillsText('')
      setStatus('PLANNED')
    }
    setRepositoryUrl('')
    setLiveDemoUrl('')
    setNotes('')
    setRepoError(null)
    setDemoError(null)
    setFormError(null)
  }, [initialTemplate, isOpen])

  if (!isOpen) return null

  const handleRepoChange = (val: string) => {
    setRepositoryUrl(val)
    if (val.trim() && !isValidHttpUrl(val)) {
      setRepoError('URL must start with http:// or https://')
    } else {
      setRepoError(null)
    }
  }

  const handleDemoChange = (val: string) => {
    setLiveDemoUrl(val)
    if (val.trim() && !isValidHttpUrl(val)) {
      setDemoError('URL must start with http:// or https://')
    } else {
      setDemoError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setFormError('Project title is required.')
      return
    }

    if (repositoryUrl.trim() && !isValidHttpUrl(repositoryUrl)) {
      setRepoError('Please provide a valid HTTP or HTTPS repository URL.')
      return
    }

    if (liveDemoUrl.trim() && !isValidHttpUrl(liveDemoUrl)) {
      setDemoError('Please provide a valid HTTP or HTTPS demo URL.')
      return
    }

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const selectedCareer = careers.find((c) => c.slug === careerSlug)

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        source: initialTemplate ? 'TEMPLATE' : 'CUSTOM',
        templateId: initialTemplate ? initialTemplate.templateId : null,
        careerSlug: careerSlug || null,
        careerTitle: selectedCareer?.title || initialTemplate?.careerTitle || null,
        skills,
        status,
        repositoryUrl: repositoryUrl.trim() || null,
        liveDemoUrl: liveDemoUrl.trim() || null,
        notes: notes.trim() || null,
      })
      onClose()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-surface border border-border p-6 shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h2 id="modal-title" className="text-h3 font-bold text-text-primary">
            {initialTemplate ? 'Start Project from Catalog Template' : 'Create Custom Project'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-body-sm text-danger font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Project Title <span className="text-danger">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Queue"
              required
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project do? What architectural problem does it solve?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Associated Career Path
              </label>
              <Select
                value={careerSlug}
                onChange={(e) => setCareerSlug(e.target.value)}
              >
                <option value="">None / Self-directed</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Initial Status
              </label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="PLANNED">📋 Planned</option>
                <option value="IN_PROGRESS">⏳ In Progress</option>
                <option value="COMPLETED">✓ Completed</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Key Skills & Technologies (comma-separated)
            </label>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. React, TypeScript, PostgreSQL, Docker"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Repository URL (optional)
              </label>
              <Input
                type="url"
                value={repositoryUrl}
                onChange={(e) => handleRepoChange(e.target.value)}
                placeholder="https://github.com/..."
              />
              {repoError && <p className="text-xs text-danger mt-1">{repoError}</p>}
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Live Demo URL (optional)
              </label>
              <Input
                type="url"
                value={liveDemoUrl}
                onChange={(e) => handleDemoChange(e.target.value)}
                placeholder="https://..."
              />
              {demoError && <p className="text-xs text-danger mt-1">{demoError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Learning Notes / Reflection (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial thoughts, learning objectives, or notes to self..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialTemplate ? 'Start Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
