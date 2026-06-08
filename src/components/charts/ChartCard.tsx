import type { ReactNode } from 'react'
import { Icon } from '../Icon/Icon'

export interface ChartCardProps {
  title: string
  /** Renders inline immediately after the title text. */
  titleSuffix?: ReactNode
  /** Optional content shown between the title and the menu (e.g. mini KPIs). */
  toolbar?: ReactNode
  /** Show the trailing customize/menu icons (decorative on the prototype). */
  showActions?: boolean
  className?: string
  children: ReactNode
}

export function ChartCard({ title, titleSuffix, toolbar, showActions = true, className = '', children }: ChartCardProps) {
  return (
    <section className={`flex min-h-[400px] flex-col rounded-md border border-border bg-surface p-2xl ${className}`}>
      <header className="mb-2xl flex shrink-0 items-center justify-between gap-md">
        <div className="flex items-center gap-xs">
          <h3 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">{title}</h3>
          {titleSuffix}
        </div>
        <div className="flex items-center gap-sm">
          {toolbar}
          {showActions && (
            <div className="flex items-center gap-xs">
              <button
                type="button"
                aria-label="Customize chart"
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="instant_mix" size={20} />
              </button>
              <button
                type="button"
                aria-label="More"
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="more_vert" size={20} />
              </button>
            </div>
          )}
        </div>
      </header>
      {children}
    </section>
  )
}
