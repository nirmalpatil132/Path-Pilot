export interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 72,
  strokeWidth = 7,
  label,
  showValue = true,
  className,
}: ProgressRingProps) {
  const safeMax = max > 0 ? max : 100
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label ?? 'Progress'}
      className={className}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
        />
      </svg>
      {showValue && (
        <div
          aria-hidden="true"
          className="relative flex items-center justify-center text-body-sm font-semibold text-text-primary"
          style={{ marginTop: -size, height: size }}
        >
          {Math.round(pct)}%
        </div>
      )}
    </div>
  )
}
