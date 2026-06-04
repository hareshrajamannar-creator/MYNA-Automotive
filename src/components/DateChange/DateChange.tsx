import { Icon } from '../Icon/Icon'
import { DateChangeProps } from './DateChange.types'

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function DateChange({ date, isToday, onPrev, onNext, onToday }: DateChangeProps) {
  return (
    <div className="flex items-center gap-sm">
      <button
        type="button"
        aria-label="Previous day"
        onClick={onPrev}
        className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-selected"
      >
        <Icon name="chevron_left" size={20} />
      </button>
      <span className="text-h3 text-text-primary">{formatDate(date)}</span>
      <button
        type="button"
        aria-label="Next day"
        onClick={onNext}
        className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-selected"
      >
        <Icon name="chevron_right" size={20} />
      </button>
      {isToday && (
        <button
          type="button"
          onClick={onToday}
          className="ml-sm rounded-sm px-sm py-xs text-body font-medium text-text-action hover:bg-surface-selected"
        >
          Today
        </button>
      )}
    </div>
  )
}
