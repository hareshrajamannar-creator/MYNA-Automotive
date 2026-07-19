import type { ReactNode } from 'react'

export interface EmptyHintFieldProps {
  /** Help text shown while the field has no user content */
  hint: string
  isEmpty: boolean
  children: ReactNode
  className?: string
  /** Padding/inset classes for the hint overlay (match the input padding) */
  hintClassName?: string
}

/**
 * Persistent empty-state hint — stays visible when the field is empty,
 * including while focused. Native placeholders hide on focus; use this instead.
 */
export function EmptyHintField({
  hint,
  isEmpty,
  children,
  className = '',
  hintClassName = 'px-md py-0',
}: EmptyHintFieldProps) {
  return (
    <div className={`relative ${className}`.trim()}>
      {isEmpty && (
        <div
          className={`pointer-events-none absolute inset-0 z-0 whitespace-pre-wrap text-body leading-relaxed text-text-tertiary ${hintClassName}`}
          aria-hidden
        >
          {hint}
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
