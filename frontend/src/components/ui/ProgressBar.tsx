import { cn } from '@/lib/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, label, showValue = false, className }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-caption text-text-secondary">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label ?? 'Progress'}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
