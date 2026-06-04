import type { ReactNode } from 'react'
import { Icon } from '../Icon/Icon'

export interface ChartCardProps {
  title: string
  /** Optional content shown between the title and the menu (e.g. mini KPIs). */
  toolbar?: ReactNode
  /** Show the trailing table/menu icons (decorative on the prototype). */
  showActions?: boolean
  className?: string
  children: ReactNode
}

export function ChartCard({ title, toolbar, showActions = true, className = '', children }: ChartCardProps) {
  return (
    <section className={`rounded-md border border-border bg-surface p-lg ${className}`}>
      <header className="mb-md flex items-center justify-between gap-md">
        <h3 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">{title}</h3>
        <div className="flex items-center gap-sm">
          {toolbar}
          {showActions && (
            <div className="flex items-center gap-xs text-text-icon">
              <button type="button" aria-label="Table view" className="flex size-7 items-center justify-center rounded-sm hover:bg-surface-hover">
                <Icon name="table_rows" size={18} />
              </button>
              <button type="button" aria-label="More" className="flex size-7 items-center justify-center rounded-sm hover:bg-surface-hover">
                <Icon name="more_vert" size={18} />
              </button>
            </div>
          )}
        </div>
      </header>
      {children}
    </section>
  )
}
