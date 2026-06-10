import { Icon } from '../Icon/Icon'

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

export interface IntegrationListCardProps {
  name: string
  description: string
  iconBg: string
  iconLabel: string
  selected?: boolean
  connected?: boolean
  onSelect?: () => void
  onConnect?: () => void
  onOpenSettings?: () => void
}

export function IntegrationListCard({
  name,
  description,
  iconBg,
  iconLabel,
  selected = false,
  connected = false,
  onSelect,
  onConnect,
  onOpenSettings,
}: IntegrationListCardProps) {
  const handleCardClick = () => {
    if (connected) onSelect?.()
    else (onOpenSettings ?? onConnect)?.()
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
      {/* Top row: radio (left) + Connected/Connect CTA (right) */}
      <div className="mb-md flex items-center justify-between">
        <SelectRadio checked={selected} />
        {connected ? (
          <div className="flex items-center gap-xs">
            <span className="size-2 shrink-0 rounded-full bg-accent-positive" />
            <span className="text-small text-text-secondary">
              {selected ? 'Selected' : 'Connected'}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); (onOpenSettings ?? onConnect)?.() }}
            className="flex items-center gap-xs text-small text-text-action hover:underline"
          >
            Connect
            <Icon name="open_in_new" size={12} />
          </button>
        )}
      </div>

      {/* Logo + name row */}
      <div className="mb-sm flex items-center gap-md">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface p-[2px]">
          <div
            className="flex size-full items-center justify-center rounded-full text-[10px] leading-none text-white"
            style={{ backgroundColor: iconBg }}
          >
            {iconLabel}
          </div>
        </div>
        <p className="truncate text-body text-text-primary">{name}</p>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-body text-text-secondary">{description}</p>
    </div>
  )
}
