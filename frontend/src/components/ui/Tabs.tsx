import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/cn'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  idBase: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`)
  return ctx
}

export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const idBase = useId()
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const activeValue = isControlled ? value : internalValue

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue, idBase }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const listRef = useRef<HTMLDivElement>(null)
  const { setValue } = useTabsContext('TabsList')

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()

    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
    )
    if (tabs.length === 0) return

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement)
    let nextIndex = currentIndex === -1 ? 0 : currentIndex

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1

    const next = tabs[nextIndex]
    next.focus()
    const nextValue = next.dataset.value
    if (nextValue) setValue(nextValue)
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-surface-muted p-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string
}

export function TabsTrigger({ value, className, children, disabled, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue, idBase } = useTabsContext('TabsTrigger')
  const selected = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${idBase}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      data-value={value}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={cn(
        'rounded-md px-3.5 py-1.5 text-body-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface-muted',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'bg-surface text-text-primary shadow-sm'
          : 'text-text-secondary hover:text-text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: activeValue, idBase } = useTabsContext('TabsContent')
  const selected = activeValue === value

  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    >
      {selected && children}
    </div>
  )
}
