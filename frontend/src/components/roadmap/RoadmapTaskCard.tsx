import { useState } from 'react'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import type { RoadmapTask, RoadmapTaskStatus } from '@/lib/api'

interface RoadmapTaskCardProps {
  task: RoadmapTask
  onUpdateStatus: (taskId: string, status: RoadmapTaskStatus, notes?: string) => Promise<void>
}

export function RoadmapTaskCard({ task, onUpdateStatus }: RoadmapTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showNotesForm, setShowNotesForm] = useState(false)
  const [notesInput, setNotesInput] = useState(task.notes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const handleStatusChange = async (newStatus: RoadmapTaskStatus) => {
    setIsUpdating(true)
    try {
      await onUpdateStatus(task.id, newStatus, task.notes || undefined)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await onUpdateStatus(task.id, task.status, notesInput)
      setShowNotesForm(false)
    } finally {
      setIsSavingNotes(false)
    }
  }

  const getStatusBadge = (status: RoadmapTaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="success" className="font-semibold">
            ✓ Completed
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge variant="warning" className="font-semibold">
            ⏳ In Progress
          </Badge>
        )
      case 'BLOCKED':
        return (
          <Badge variant="danger" className="font-semibold">
            ⛔ Blocked
          </Badge>
        )
      case 'NOT_STARTED':
      default:
        return (
          <Badge variant="neutral">
            Not Started
          </Badge>
        )
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'CRITICAL_MISSING':
        return (
          <Badge variant="danger">
            Critical Core
          </Badge>
        )
      case 'RECOMMENDED_NEXT':
        return (
          <Badge variant="warning">
            Recommended
          </Badge>
        )
      case 'OPTIONAL_ADVANTAGE':
        return (
          <Badge variant="primary">
            Optional Edge
          </Badge>
        )
      case 'PROJECT':
        return (
          <Badge variant="primary">
            Portfolio Artifact
          </Badge>
        )
      default:
        return (
          <Badge variant="neutral">
            {category}
          </Badge>
        )
    }
  }

  const hoursEstimate = (task.estimatedMinutes / 60).toFixed(1).replace('.0', '')

  return (
    <Card
      className={`border transition-all duration-150 ${
        task.status === 'COMPLETED'
          ? 'border-emerald-500/40 bg-surface/80 opacity-95'
          : task.status === 'IN_PROGRESS'
          ? 'border-amber-500/60 bg-surface shadow-sm ring-1 ring-amber-500/20'
          : task.status === 'BLOCKED'
          ? 'border-rose-500/40 bg-surface'
          : 'border-border bg-surface hover:border-border-strong'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-caption font-bold text-primary px-2 py-0.5 rounded bg-primary-muted/20 border border-primary/20">
                {task.dayRange}
              </span>
              <span className="text-caption text-text-muted">
                ⏱ ~{hoursEstimate} hrs
              </span>
              {getCategoryBadge(task.skillCategory)}
              <span className="text-caption font-medium text-text-secondary bg-surface-muted px-2 py-0.5 rounded">
                Skill: {task.skillName}
              </span>
            </div>

            <h3
              className={`text-body-lg font-semibold tracking-tight ${
                task.status === 'COMPLETED'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary'
              }`}
            >
              {task.title}
            </h3>

            <p className="text-body-sm text-text-secondary mt-1.5 leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
            {getStatusBadge(task.status)}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-caption text-primary hover:text-primary-hover font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded"
            >
              {showDetails ? 'Hide Details' : 'View Criteria & Output'}
            </button>
          </div>
        </div>

        {/* Expandable Criteria & Output */}
        {showDetails && (
          <div className="mt-4 pt-3.5 border-t border-border/60 text-body-sm space-y-3 bg-surface-muted/30 p-3.5 rounded-lg border border-border/40">
            <div>
              <div className="text-caption uppercase font-semibold text-text-secondary tracking-wider">
                Completion Criteria
              </div>
              <p className="text-text-primary text-body-sm mt-0.5">
                {task.completionCriteria}
              </p>
            </div>

            <div>
              <div className="text-caption uppercase font-semibold text-text-secondary tracking-wider">
                Expected Output / Evidence
              </div>
              <p className="text-text-primary text-body-sm mt-0.5">
                {task.expectedOutput}
              </p>
            </div>

            {task.prerequisites && task.prerequisites.length > 0 && (
              <div>
                <div className="text-caption uppercase font-semibold text-text-secondary tracking-wider">
                  Prerequisites
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {task.prerequisites.map((prereq, i) => (
                    <Badge key={i} variant="neutral">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Notes / Evidence Input */}
        {showNotesForm ? (
          <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
            <label
              htmlFor={`notes-${task.id}`}
              className="text-caption font-semibold text-text-secondary block"
            >
              Completion Notes & Evidence (GitHub PR, deployed URL, or summary)
            </label>
            <textarea
              id={`notes-${task.id}`}
              rows={2}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Completed module and tested locally. Repository link: https://github.com/..."
              className="w-full text-body-sm p-2.5 rounded-md border border-border bg-surface text-text-primary focus:border-focus focus:ring-1 focus:ring-focus outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesForm(false)}
                disabled={isSavingNotes}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        ) : task.notes ? (
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-start justify-between text-caption bg-surface-muted/40 p-2.5 rounded border border-border/30">
            <div>
              <span className="font-semibold text-text-primary">Evidence Note: </span>
              <span className="text-text-secondary">{task.notes}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowNotesForm(true)}
              className="text-primary hover:underline ml-2 flex-shrink-0"
            >
              Edit
            </button>
          </div>
        ) : null}

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {!showNotesForm && !task.notes && (
              <button
                type="button"
                onClick={() => setShowNotesForm(true)}
                className="text-caption text-text-secondary hover:text-text-primary transition-colors py-1 px-1.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
              >
                + Add Evidence Note
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={isUpdating}
              >
                Start Task
              </Button>
            )}

            {task.status !== 'COMPLETED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                ✓ Complete
              </Button>
            )}

            {task.status === 'IN_PROGRESS' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange('BLOCKED')}
                disabled={isUpdating}
                className="text-rose-600 hover:text-rose-700"
              >
                Blocked
              </Button>
            )}

            {task.status === 'COMPLETED' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange('NOT_STARTED')}
                disabled={isUpdating}
                className="text-text-muted hover:text-text-primary"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
