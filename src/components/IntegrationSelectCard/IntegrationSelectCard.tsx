import { Icon } from '../Icon/Icon'
import type { IntegrationSelectCardProps } from './IntegrationSelectCard.types'

function SelectRadio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
        checked ? 'border-primary' : 'border-control-border bg-surface'
      }`}
    >
      {checked && <span className="size-2 rounded-full bg-primary" />}
    </span>
  )
}

export function IntegrationSelectCard({
  name,
  description,
  iconBg,
  iconLabel,
  selected,
  connected,
  onSelect,
  onView,
  onConnect,
}: IntegrationSelectCardProps) {
  const handleCardClick = () => {
    if (connected) onSelect()
    else onConnect?.()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick() }
      }}
      className={`group relative flex cursor-pointer flex-col rounded-md border bg-surface p-lg transition-colors hover:bg-surface-hover ${
        selected ? 'border-2 border-primary' : 'border border-border-selected'
      }`}
    >
      {/* Top row: radio (left) + Connected/Connect (right) */}
      <div className="mb-md flex items-center justify-between">
        <SelectRadio checked={selected} />
        {connected ? (
          <div className="flex items-center gap-xs">
            <span className="size-2 shrink-0 rounded-full bg-accent-positive" />
            <span className="text-small text-text-secondary">Connected</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onConnect?.() }}
            className="flex items-center gap-xs text-small text-text-action hover:underline"
          >
            Connect
            <Icon name="open_in_new" size={12} />
          </button>
        )}
      </div>

      {/* Logo */}
      <div className="mb-sm flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface p-[2px]">
        <div
          className="flex size-full items-center justify-center rounded-full text-[10px] leading-none text-white"
          style={{ backgroundColor: iconBg }}
        >
          {iconLabel}
        </div>
      </div>

      {/* Name — turns blue on hover when onView is wired */}
      <p
        onClick={onView ? (e) => { e.stopPropagation(); onView() } : undefined}
        className={`mb-xs truncate text-body transition-colors ${onView ? 'group-hover:cursor-pointer group-hover:text-primary' : 'text-text-primary'}`}
      >
        {name}
      </p>

      {/* Description */}
      <p className="line-clamp-2 text-body text-text-secondary">{description}</p>
    </div>
  )
}
