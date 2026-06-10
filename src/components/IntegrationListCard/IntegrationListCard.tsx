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
  onView?: () => void
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
  onView,
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
      {/* Top row: radio (left) + status/View (right) */}
      <div className="mb-md flex items-center justify-between">
        <SelectRadio checked={selected} />

        <div className="relative h-5">
          {/* Default: Connected / Connect — hidden on hover when onView present */}
          <div className={`flex items-center gap-xs transition-opacity ${onView ? 'group-hover:opacity-0' : ''}`}>
            {connected ? (
              <>
                <span className="size-2 shrink-0 rounded-full bg-accent-positive" />
                <span className="text-small text-text-secondary">Connected</span>
              </>
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

          {/* Hover: View link */}
          {onView && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onView() }}
              className="absolute inset-0 flex items-center justify-end text-small text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100"
            >
              View
            </button>
          )}
        </div>
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

      {/* Name */}
      <p className="mb-xs truncate text-body text-text-primary">{name}</p>

      {/* Description */}
      <p className="line-clamp-2 text-body text-text-secondary">{description}</p>
    </div>
  )
}
