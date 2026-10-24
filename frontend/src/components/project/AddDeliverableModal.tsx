import { useState, useEffect } from 'react'
import { Alert, Button, Input, Select, Textarea } from '@/components/ui'
import type {
  CreateDeliverablePayload,
  DeliverableStatus,
  DeliverableType,
  RoadmapTask,
} from '@/lib/api'

interface AddDeliverableModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateDeliverablePayload) => Promise<void>
  roadmapTasks?: RoadmapTask[]
  initialValues?: {
    id?: string
    title: string
    description: string
    type: DeliverableType
    status: DeliverableStatus
    url?: string | null
    roadmapTaskId?: string | null
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

export function AddDeliverableModal({
  isOpen,
  onClose,
  onSubmit,
  roadmapTasks = [],
  initialValues,
}: AddDeliverableModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<DeliverableType>('FEATURE_MODULE')
  const [status, setStatus] = useState<DeliverableStatus>('SUBMITTED')
  const [url, setUrl] = useState('')
  const [roadmapTaskId, setRoadmapTaskId] = useState('')

  const [urlError, setUrlError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title)
      setDescription(initialValues.description)
      setType(initialValues.type)
      setStatus(initialValues.status)
      setUrl(initialValues.url || '')
      setRoadmapTaskId(initialValues.roadmapTaskId || '')
    } else {
      setTitle('')
      setDescription('')
      setType('FEATURE_MODULE')
      setStatus('SUBMITTED')
      setUrl('')
      setRoadmapTaskId('')
    }
    setUrlError(null)
    setFormError(null)
  }, [initialValues, isOpen])

  if (!isOpen) return null

  const handleUrlChange = (val: string) => {
    setUrl(val)
    if (val.trim() && !isValidHttpUrl(val)) {
      setUrlError('URL must start with http:// or https://')
    } else {
      setUrlError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setFormError('Deliverable title is required.')
      return
    }

    if (url.trim() && !isValidHttpUrl(url)) {
      setUrlError('Please provide a valid HTTP or HTTPS URL.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        type,
        status,
        url: url.trim() || null,
        roadmapTaskId: roadmapTaskId || null,
      })
      onClose()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save deliverable')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deliverable-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface border border-border p-6 shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h2 id="deliverable-modal-title" className="text-h3 font-bold text-text-primary">
            {initialValues ? 'Edit Deliverable / Evidence' : 'Add Deliverable / Evidence'}
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

        <div className="mb-4">
          <Alert variant="info" title="Verification Policy">
            Deliverable records are self-reported student evidence. External reviewer or automated verification is not currently supported.
          </Alert>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-body-sm text-danger font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Deliverable Title <span className="text-danger">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ingestion Pipeline Pull Request #4"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Deliverable Type
              </label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as DeliverableType)}
              >
                <option value="FEATURE_MODULE">Feature Module</option>
                <option value="CODE_REPOSITORY">Code Repository</option>
                <option value="DEPLOYED_DEMO">Live Deployed Demo</option>
                <option value="TEST_SUITE">Automated Test Suite</option>
                <option value="DESIGN_PROTOTYPE">Design Prototype</option>
                <option value="TECHNICAL_DOCS">Technical Documentation</option>
                <option value="IMPLEMENTATION_NOTE">Implementation Decision Note</option>
              </Select>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Evidence Status
              </label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
              >
                <option value="SUBMITTED">✓ Student-submitted</option>
                <option value="PLANNED">📋 Planned</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Description & Evidence Context
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what this deliverable demonstrates, key decisions, or benchmarks achieved."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-text-primary mb-1">
              Evidence Link / Artifact URL (optional)
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://github.com/... or https://..."
            />
            {urlError && <p className="text-xs text-danger mt-1">{urlError}</p>}
          </div>

          {roadmapTasks.length > 0 && (
            <div>
              <label className="block text-body-sm font-semibold text-text-primary mb-1">
                Link to Learning Roadmap Task (optional)
              </label>
              <Select
                value={roadmapTaskId}
                onChange={(e) => setRoadmapTaskId(e.target.value)}
              >
                <option value="">None / Standalone Project</option>
                {roadmapTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    Week {task.weekNumber} ({task.dayRange}): {task.title}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-text-muted mt-1">
                Linking evidence attaches this deliverable to the specified task for review. It does not automatically complete the task.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialValues ? 'Save Changes' : 'Add Deliverable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
