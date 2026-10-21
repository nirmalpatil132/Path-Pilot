import { useState } from 'react'
import { Button, Card, CardContent, Input, Select, Textarea } from '@/components/ui'
import { DEGREES, BRANCHES, YEARS } from './constants'
import type { StudentProfile } from '@/lib/api'

interface Step2EducationProps {
  initialData: Partial<StudentProfile>
  onSaveAndContinue: (data: Partial<StudentProfile>) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function Step2Education({
  initialData,
  onSaveAndContinue,
  onBack,
  isSaving,
}: Step2EducationProps) {
  const [degree, setDegree] = useState(initialData.degree || '')
  const [branch, setBranch] = useState(initialData.branch || '')
  const [currentYear, setCurrentYear] = useState(initialData.currentYear || '')
  const [college, setCollege] = useState(initialData.college || '')
  const [university, setUniversity] = useState(initialData.university || '')
  const [cgpa, setCgpa] = useState<string>(
    initialData.cgpa !== undefined && initialData.cgpa !== null ? String(initialData.cgpa) : '',
  )
  const [academicContext, setAcademicContext] = useState(initialData.academicContext || '')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!degree.trim()) errs.degree = 'Please select or specify your degree program'
    if (!branch.trim()) errs.branch = 'Please select or specify your branch / specialization'
    if (!currentYear.trim()) errs.currentYear = 'Please select your current academic year'
    if (!college.trim() && !university.trim()) {
      errs.college = 'Please enter your college or university name'
    }

    if (cgpa.trim()) {
      const num = Number(cgpa)
      if (isNaN(num) || num < 0 || num > 10) {
        errs.cgpa = 'CGPA must be a number between 0.0 and 10.0'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const parsedCgpa = cgpa.trim() ? Number(cgpa) : null
    await onSaveAndContinue({
      degree: degree.trim(),
      branch: branch.trim(),
      currentYear: currentYear.trim(),
      college: college.trim() || null,
      university: university.trim() || null,
      cgpa: parsedCgpa,
      academicContext: academicContext.trim() || null,
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary">
          Step 2 of 8 • Education
        </span>
        <h2 className="mt-3 text-h1 text-text-primary">Academic Background</h2>
        <p className="mt-2 text-body text-text-secondary">
          Tell us about your college, major, and current semester so we can anchor your roadmap to
          your placement timeline.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Select
              id="degree"
              label="Degree / Program"
              required
              value={degree}
              onChange={(e) => {
                setDegree(e.target.value)
                if (errors.degree) setErrors((prev) => ({ ...prev, degree: '' }))
              }}
              error={errors.degree}
            >
              <option value="">Select degree...</option>
              {DEGREES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              id="branch"
              label="Branch / Specialization"
              required
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value)
                if (errors.branch) setErrors((prev) => ({ ...prev, branch: '' }))
              }}
              error={errors.branch}
            >
              <option value="">Select specialization...</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>

            <Select
              id="currentYear"
              label="Current Year / Semester"
              required
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(e.target.value)
                if (errors.currentYear) setErrors((prev) => ({ ...prev, currentYear: '' }))
              }}
              error={errors.currentYear}
            >
              <option value="">Select current year...</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>

            <Input
              id="college"
              label="College / Institute"
              required
              placeholder="e.g. Pune Institute of Computer Technology (PICT)"
              value={college}
              onChange={(e) => {
                setCollege(e.target.value)
                if (errors.college) setErrors((prev) => ({ ...prev, college: '' }))
              }}
              error={errors.college}
            />

            <Input
              id="university"
              label="University / Affiliation (Optional)"
              placeholder="e.g. Savitribai Phule Pune University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />

            <Input
              id="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              label="CGPA / Grade (Optional)"
              placeholder="e.g. 8.4"
              helperText="On a 10.0 scale. Used only to benchmark eligibility for campus placement filters."
              value={cgpa}
              onChange={(e) => {
                setCgpa(e.target.value)
                if (errors.cgpa) setErrors((prev) => ({ ...prev, cgpa: '' }))
              }}
              error={errors.cgpa}
            />
          </div>

          <Textarea
            id="academicContext"
            label="Additional Academic Context (Optional)"
            placeholder="e.g. Completed minors in Data Science, currently taking courses in Operating Systems and Distributed Systems."
            rows={3}
            value={academicContext}
            onChange={(e) => setAcademicContext(e.target.value)}
            helperText="Any coursework, minor programs, or academic focuses relevant to your career."
          />

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={onBack} disabled={isSaving}>
              ← Back
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Continue to Skills →
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
