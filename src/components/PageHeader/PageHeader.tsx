import { DateChange } from '../DateChange/DateChange'
import { Icon } from '../Icon/Icon'
import { AppointmentView, PageHeaderProps } from './PageHeader.types'

function ViewToggle({
  view,
  onViewChange,
}: {
  view: AppointmentView
  onViewChange?: (view: AppointmentView) => void
}) {
  const base = 'flex size-6 items-center justify-center rounded-sm transition-colors'
  return (
    <div className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-sm">
      <button
        type="button"
        aria-label="Table view"
        onClick={() => onViewChange?.('table')}
        className={`${base} ${
          view === 'table' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'
        }`}
      >
        <Icon name="table_rows" size={18} />
      </button>
      <button
        type="button"
        aria-label="Calendar view"
        onClick={() => onViewChange?.('calendar')}
        className={`${base} ${
          view === 'calendar' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'
        }`}
      >
        <Icon name="calendar_month" size={18} />
      </button>
    </div>
  )
}

export function PageHeader({
  date,
  providerLabel: _providerLabel = 'All customer reps',
  view = 'table',
  isToday = true,
  onPrev,
  onNext,
  onToday,
  onProviderClick: _onProviderClick,
  onViewChange,
  onCustomizeColumns,
  onFilter,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-surface px-2xl py-xl">
      <DateChange date={date} isToday={isToday} onPrev={onPrev ?? (() => {})} onNext={onNext ?? (() => {})} onToday={onToday} />

      {/* Controls */}
      <div className="flex items-center gap-sm">
        {/* All customer reps dropdown — hidden, restore by uncommenting
        <button
          type="button"
          onClick={onProviderClick}
          className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface pl-md pr-sm text-body text-text-primary hover:bg-surface-l2"
        >
          {providerLabel}
          <Icon name="expand_more" size={20} className="text-text-icon" />
        </button>
        */}

        <ViewToggle view={view} onViewChange={onViewChange} />

        <button
          type="button"
          aria-label="Customize columns"
          onClick={onCustomizeColumns}
          className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
        >
          <Icon name="view_column" size={20} />
        </button>

        <button
          type="button"
          aria-label="Filters"
          onClick={onFilter}
          className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
        >
          <Icon name="filter_list" size={20} />
        </button>
      </div>
    </div>
  )
}
