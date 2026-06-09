import { useState, useRef, type MouseEvent } from 'react'
import { Icon, ProceduresPickerDrawer, RefChip, SelectMenu } from '../components'

interface AgentSettingsTabProps {
  product?: string
  agentName?: string
}

// ── Procedure book icon (shared with ProceduresScreen) ──────────
function ProcedureBookIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19.7996 6.30078H14.3996C13.9339 6.30078 13.4745 6.40922 13.058 6.6175C12.6414 6.82578 12.279 7.12819 11.9996 7.50078C11.7202 7.12819 11.3578 6.82578 10.9412 6.6175C10.5247 6.40922 10.0653 6.30078 9.59961 6.30078H4.19961C4.04048 6.30078 3.88787 6.364 3.77535 6.47652C3.66282 6.58904 3.59961 6.74165 3.59961 6.90078V17.7008C3.59961 17.8599 3.66282 18.0125 3.77535 18.125C3.88787 18.2376 4.04048 18.3008 4.19961 18.3008H9.59961C10.077 18.3008 10.5348 18.4904 10.8724 18.828C11.21 19.1656 11.3996 19.6234 11.3996 20.1008C11.3996 20.2599 11.4628 20.4125 11.5753 20.525C11.6879 20.6376 11.8405 20.7008 11.9996 20.7008C12.1587 20.7008 12.3114 20.6376 12.4239 20.525C12.5364 20.4125 12.5996 20.2599 12.5996 20.1008C12.5996 19.6234 12.7893 19.1656 13.1268 18.828C13.4644 18.4904 13.9222 18.3008 14.3996 18.3008H19.7996C19.9587 18.3008 20.1114 18.2376 20.2239 18.125C20.3364 18.0125 20.3996 17.8599 20.3996 17.7008V6.90078C20.3996 6.74165 20.3364 6.58904 20.2239 6.47652C20.1114 6.364 19.9587 6.30078 19.7996 6.30078ZM9.59961 17.1008H4.79961V7.50078H9.59961C10.077 7.50078 10.5348 7.69042 10.8724 8.02799C11.21 8.36555 11.3996 8.82339 11.3996 9.30078V17.7008C10.8808 17.3104 10.2489 17.0997 9.59961 17.1008ZM19.1996 17.1008H14.3996C13.7503 17.0997 13.1184 17.3104 12.5996 17.7008V9.30078C12.5996 8.82339 12.7893 8.36555 13.1268 8.02799C13.4644 7.69042 13.9222 7.50078 14.3996 7.50078H19.1996V17.1008Z" fill="currentColor"/>
    </svg>
  )
}

// ── Toggle ──────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[16px] w-[32px] shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-primary' : 'bg-surface-selected'
      }`}
    >
      <span
        className={`absolute top-[2px] size-3 rounded-full bg-white shadow-sm transition-[left] ${
          checked ? 'left-[18px]' : 'left-[2px]'
        }`}
      />
    </button>
  )
}

// ── Field borders (shared focus ring via primary border) ─────────
const FIELD_BORDER_CLASS =
  'rounded-sm border border-border-input transition-colors focus:border-primary focus:outline-none focus-visible:border-primary'

const INPUT_CLASS = `w-full bg-surface px-md text-body text-text-primary ${FIELD_BORDER_CLASS}`

// ── Fallback message field (textarea + variable chip + toolbar) ──
interface FallbackFieldProps {
  prefix: string
  chipLabel: string
  suffix?: string
}

function FallbackField({ prefix, chipLabel, suffix }: FallbackFieldProps) {
  const [showChip, setShowChip] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`overflow-hidden bg-surface ${FIELD_BORDER_CLASS} focus-within:border-primary`}>
      {/* Rich text body */}
      <div
        ref={bodyRef}
        tabIndex={0}
        role="textbox"
        aria-multiline="true"
        onMouseDown={() => bodyRef.current?.focus()}
        className="min-h-[80px] cursor-text px-md pt-sm pb-xs text-body text-text-primary leading-[1.7] outline-none"
      >
        <span>{prefix}</span>
        {showChip && (
          <>
            {' '}
            <RefChip kind="context" label={chipLabel} onRemove={() => setShowChip(false)} />
          </>
        )}
        {suffix && <span>{suffix}</span>}
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-[2px] bg-surface px-sm py-[6px]">
        {/* AI icon */}
        <button
          type="button"
          title="AI personalise"
          className="flex h-7 items-center gap-[3px] rounded-sm px-[6px] text-text-icon hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.25"/>
            <text x="8" y="11.5" textAnchor="middle" fontSize="7.5" fontWeight="500" fill="currentColor" fontFamily="sans-serif">Ai</text>
            <path d="M12 1.5 L13 3 L14 1.5 L13 0 Z" fill="#7C3AED" />
          </svg>
          <span className="sr-only">AI</span>
        </button>
        {/* Emoji */}
        <button
          type="button"
          title="Emoji"
          className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <Icon name="sentiment_satisfied" size={18} />
        </button>
        {/* Personalize */}
        <button
          type="button"
          className="flex items-center gap-[3px] rounded-sm px-[6px] py-[3px] text-body text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          Personalize
          <Icon name="expand_more" size={16} className="text-primary" />
        </button>
      </div>
    </div>
  )
}

// ── Title + description (tight 2px gap) ─────────────────────────
function SettingSubtext({
  children,
  tone = 'secondary',
}: {
  children: React.ReactNode
  tone?: 'secondary' | 'tertiary'
}) {
  return (
    <p
      className={`mt-[2px] text-small ${
        tone === 'tertiary' ? 'text-text-tertiary' : 'text-text-secondary'
      }`}
    >
      {children}
    </p>
  )
}

// ── Settings checkbox (matches SelectMenu / StatusFilterDropdown) ─
function SettingsCheckboxBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors ${
        checked ? 'border-primary bg-primary' : 'border-control-border bg-surface'
      }`}
    >
      {checked && (
        <Icon
          name="check"
          size={11}
          fill
          weight={600}
          className="text-white"
        />
      )}
    </span>
  )
}

const CHECKBOX_ROW_GAP = 'gap-sm'
const CHECKBOX_ROW_INDENT = (
  <span className="size-4 shrink-0" aria-hidden />
)

// ── Checkbox row (checkbox before label + optional description) ─
interface CheckboxRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

function CheckboxRow({ label, description, checked, onChange }: CheckboxRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center rounded-sm text-left ${CHECKBOX_ROW_GAP}`}
    >
      <SettingsCheckboxBox checked={checked} />
      <div className="flex-1">
        <p className="text-body text-text-primary">{label}</p>
        {description && <SettingSubtext>{description}</SettingSubtext>}
      </div>
    </button>
  )
}

// ── Checkbox label row (checkbox before a single-line label) ────
interface CheckboxLabelRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function CheckboxLabelRow({ label, checked, onChange }: CheckboxLabelRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center rounded-sm text-left ${CHECKBOX_ROW_GAP}`}
    >
      <SettingsCheckboxBox checked={checked} />
      <span className="text-small text-text-secondary">{label}</span>
    </button>
  )
}

// ── Indented field aligned with checkbox row label text ───────────
function CheckboxRowField({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex items-start ${CHECKBOX_ROW_GAP}`}>
      {CHECKBOX_ROW_INDENT}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

// ── Voice option type ───────────────────────────────────────────
interface VoiceOption {
  label: string
  preview: string
}

// ── VoiceSelect ─────────────────────────────────────────────────
interface VoiceSelectProps {
  value: string
  options: VoiceOption[]
  onChange: (value: string) => void
}

function VoiceSelect({ value, options, onChange }: VoiceSelectProps) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen(true)
  }

  const stopPlaying = () => {
    window.speechSynthesis.cancel()
    setPlaying(null)
  }

  const togglePreview = (opt: VoiceOption, e: MouseEvent) => {
    e.stopPropagation()
    if (playing === opt.label) {
      stopPlaying()
      return
    }
    stopPlaying()
    const utter = new SpeechSynthesisUtterance(opt.preview)
    utter.onend = () => setPlaying(null)
    utteranceRef.current = utter
    setPlaying(opt.label)
    window.speechSynthesis.speak(utter)
  }

  const select = (label: string) => {
    stopPlaying()
    onChange(label)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm transition-colors hover:bg-surface-l2 focus:border-primary focus:outline-none focus-visible:border-primary ${
          open ? 'border-primary' : 'border-border-input'
        }`}
      >
        <span className={`min-w-0 flex-1 truncate text-left text-body ${value ? 'text-text-primary' : 'text-text-tertiary'}`}>
          {value || 'Select voice'}
        </span>
        <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
      </button>
      {open && anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => { stopPlaying(); setOpen(false) }} aria-hidden />
          <div
            className="fixed z-[110] rounded-sm border border-border bg-surface py-xs shadow-dropdown"
            style={{ top: anchor.top, left: anchor.left, width: anchor.width }}
          >
            {options.map((opt) => {
              const isSelected = opt.label === value
              const isPlaying = playing === opt.label
              return (
                <div
                  key={opt.label}
                  onClick={() => select(opt.label)}
                  className={`flex cursor-pointer items-center gap-sm px-md py-sm hover:bg-surface-hover ${isSelected ? 'bg-surface-hover' : ''}`}
                >
                  <span className="min-w-0 flex-1 truncate text-body text-text-primary">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => togglePreview(opt, e)}
                    title={isPlaying ? 'Stop preview' : 'Preview voice'}
                    className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2 hover:text-primary"
                  >
                    <Icon name={isPlaying ? 'stop' : 'volume_up'} size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

// ── Web chat content ────────────────────────────────────────────
function WebChatSettings() {
  const [resolvedEnabled, setResolvedEnabled] = useState(true)
  const [resolvedName, setResolvedName] = useState('👍 That helped')
  const [escalationEnabled, setEscalationEnabled] = useState(true)
  const [escalationName, setEscalationName] = useState('Talk to human')
  const [duringEnabled, setDuringEnabled] = useState(true)
  const [afterEnabled, setAfterEnabled] = useState(true)

  return (
    <div className="flex flex-col gap-[40px]">
      {/* Resolve button */}
      <div className="flex flex-col gap-sm">
        <CheckboxRow
          label="Resolve button"
          description="A quick reply button patients can tap when their question is answered"
          checked={resolvedEnabled}
          onChange={setResolvedEnabled}
        />
        {resolvedEnabled && (
          <CheckboxRowField>
            <label className="mb-xs block text-small text-text-secondary">Button name</label>
            <input
              type="text"
              value={resolvedName}
              onChange={(e) => setResolvedName(e.target.value)}
              className={`${INPUT_CLASS} h-9`}
            />
          </CheckboxRowField>
        )}
      </div>

      {/* Escalation button */}
      <div className="flex flex-col gap-sm">
        <CheckboxRow
          label="Escalation button"
          description="A quick reply button patients can tap to reach a team member"
          checked={escalationEnabled}
          onChange={setEscalationEnabled}
        />
        {escalationEnabled && (
          <CheckboxRowField>
            <label className="mb-xs block text-small text-text-secondary">Button name</label>
            <input
              type="text"
              value={escalationName}
              onChange={(e) => setEscalationName(e.target.value)}
              className={`${INPUT_CLASS} h-9`}
            />
          </CheckboxRowField>
        )}
      </div>

      {/* Fallback message */}
      <div className="flex flex-col gap-md">
        <p className="text-body text-text-primary">Fallback message</p>

        {/* During business hours */}
        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="During business hours"
            checked={duringEnabled}
            onChange={setDuringEnabled}
          />
          {duringEnabled && (
            <CheckboxRowField>
              <FallbackField
                prefix="We're not available right now. Our team is back during business hours. You can also reach us at"
                chipLabel="business.phone"
              />
            </CheckboxRowField>
          )}
        </div>

        {/* After business hours */}
        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="After business hours"
            checked={afterEnabled}
            onChange={setAfterEnabled}
          />
          {afterEnabled && (
            <CheckboxRowField>
              <FallbackField
                prefix="Our team is offline right now. Leave a message and we'll follow up during business hours. You can also call us at"
                chipLabel="business.phone"
              />
            </CheckboxRowField>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Text settings content ────────────────────────────────────────
function TextSettings() {
  const [unsubscribeEnabled, setUnsubscribeEnabled] = useState(false)
  const [beforeEnabled, setBeforeEnabled] = useState(true)
  const [afterEnabled, setAfterEnabled] = useState(false)

  return (
    <div className="flex flex-col gap-lg">
      {/* Unsubscribe text */}
      <CheckboxRow
        label="Unsubscribe text"
        description="Enabling this will allow customers to opt out of text communications"
        checked={unsubscribeEnabled}
        onChange={setUnsubscribeEnabled}
      />

      {/* Fallback message */}
      <div className="flex flex-col gap-sm">
        <p className="text-body text-text-primary">Fallback message</p>

        {/* Before business hours */}
        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="Before business hours"
            checked={beforeEnabled}
            onChange={setBeforeEnabled}
          />
          {beforeEnabled && (
            <CheckboxRowField>
              <FallbackField
                prefix="We're not available right now. Our team is back during business hours. You can also reach us at"
                chipLabel="business.phone"
              />
            </CheckboxRowField>
          )}
        </div>

        {/* After business hours */}
        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="After business hours"
            checked={afterEnabled}
            onChange={setAfterEnabled}
          />
          {afterEnabled && (
            <CheckboxRowField>
              <FallbackField
                prefix="Our team is offline right now. Leave a message and we'll follow up during business hours."
                chipLabel="business.phone"
              />
            </CheckboxRowField>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Channel accordion ────────────────────────────────────────────
interface ChannelAccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

function ChannelAccordion({
  title,
  children,
  defaultOpen = false,
  enabled,
  onEnabledChange,
}: ChannelAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex h-14 items-center justify-between px-lg hover:bg-surface-l2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center text-left"
        >
          <span className="text-body font-medium text-text-primary">{title}</span>
        </button>
        <div className="flex items-center gap-md">
          <Toggle checked={enabled} onChange={onEnabledChange} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center text-text-icon"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <Icon
              name={open ? 'expand_less' : 'expand_more'}
              size={20}
            />
          </button>
        </div>
      </div>
      {open && (
        <div className="px-lg pb-lg pt-md">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Settings section header with add action ─────────────────────
function SettingsSectionHeader({
  title,
  addAriaLabel,
  onAdd,
  addDisabled,
}: {
  title: string
  addAriaLabel: string
  onAdd: (e: MouseEvent<HTMLButtonElement>) => void
  addDisabled?: boolean
}) {
  return (
    <div className="mb-md flex items-center justify-between gap-md">
      <h2 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">{title}</h2>
      <button
        type="button"
        onClick={onAdd}
        disabled={addDisabled}
        aria-label={addAriaLabel}
        className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon transition-colors hover:bg-surface-l2 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:text-text-tertiary"
      >
        <Icon name="edit" size={20} />
      </button>
    </div>
  )
}

// ── Add-item menu (SelectMenu picker for catalog items) ───────────
interface AddItemMenuProps {
  open: boolean
  anchor: { top: number; left: number; width: number } | null
  options: { value: string; label: string }[]
  onClose: () => void
  onSelect: (id: string) => void
}

function AddItemMenu({ open, anchor, options, onClose, onSelect }: AddItemMenuProps) {
  if (!open || !anchor) return null

  return (
    <>
      <div className="fixed inset-0 z-[105]" onClick={onClose} aria-hidden />
      <div
        className="fixed z-[110]"
        style={{ top: anchor.top, left: anchor.left, width: Math.max(anchor.width, 280) }}
      >
        <SelectMenu
          options={options}
          value={[]}
          searchable={options.length > 6}
          onChange={(selected) => {
            if (selected[0]) onSelect(selected[0])
            onClose()
          }}
        />
      </div>
    </>
  )
}

// ── Card 3-dot menu (edit / delete on hover) ────────────────────
interface CardMenuProps {
  itemLabel: string
  onEdit?: () => void
  onDelete?: () => void
}

function CardMenu({ itemLabel, onEdit, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false)

  if (!onEdit && !onDelete) return null

  return (
    <div
      className={`absolute right-md top-md z-10 transition-opacity ${
        open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
    >
      <button
        type="button"
        aria-label={`${itemLabel} actions`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
      >
        <Icon name="more_vert" size={20} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-[110] mt-xs min-w-[168px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
            {onEdit && (
              <button
                type="button"
                className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                  setOpen(false)
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="block w-full px-md py-sm text-left text-body text-chip-danger-text hover:bg-surface-hover"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                  setOpen(false)
                }}
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Procedure card (matches ProceduresScreen grid card style) ────
interface ProcedureCardProps {
  title: string
  description: string
  lastEdited: string
  onEdit?: () => void
  onRemove?: () => void
}

function ProcedureCard({ title, description, lastEdited, onEdit, onRemove }: ProcedureCardProps) {
  return (
    <div className="group relative flex min-h-[148px] flex-col rounded-sm border border-border-selected bg-surface p-xl transition-colors hover:bg-surface-selected">
      <CardMenu itemLabel={title} onEdit={onEdit} onDelete={onRemove} />
      <div className="mb-md">
        <ProcedureBookIcon size={22} className="text-text-secondary" />
      </div>
      <h3 className="mb-xs text-body text-text-primary">{title}</h3>
      <p className="line-clamp-2 text-body text-text-secondary">{description}</p>
      <div className="mt-auto flex items-center justify-end gap-xs pt-lg text-small text-text-tertiary">
        <Icon name="schedule" size={14} />
        {lastEdited}
      </div>
    </div>
  )
}

// ── Integration card (same style as procedure card) ──────────────
interface IntegrationCardProps {
  iconBg: string
  iconLabel: string
  name: string
  description: string
  connected?: boolean
  onClick?: () => void
  onEdit?: () => void
  onRemove?: () => void
}

function IntegrationCard({
  iconBg,
  iconLabel,
  name,
  description,
  connected,
  onClick,
  onEdit,
  onRemove,
}: IntegrationCardProps) {
  return (
    <div className="group relative">
      <CardMenu itemLabel={name} onEdit={onEdit} onDelete={onRemove} />
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[148px] w-full cursor-pointer flex-col rounded-sm border border-border-selected bg-surface p-xl text-left transition-colors hover:bg-surface-selected"
      >
        <div className="mb-md flex items-center justify-between gap-md">
          <div className="flex min-w-0 items-center gap-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface p-[2px]">
              <div
                className="flex size-full items-center justify-center rounded-full text-[10px] leading-none text-white"
                style={{ backgroundColor: iconBg }}
              >
                {iconLabel}
              </div>
            </div>
            <h3 className="truncate text-body text-text-primary">{name}</h3>
          </div>
          {connected !== undefined && (
            <div className="flex shrink-0 items-center gap-xs">
              <span
                className={`size-2 rounded-full ${connected ? 'bg-accent-positive' : 'bg-surface-selected'}`}
              />
              <span className="text-small text-text-secondary">
                {connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
          )}
        </div>
        <p className="line-clamp-2 text-body text-text-secondary">{description}</p>
      </button>
    </div>
  )
}

// ── Healthcare-specific data ─────────────────────────────────────
interface ProcedureCatalogItem {
  id: string
  title: string
  description: string
  lastEdited: string
}

interface IntegrationCatalogItem {
  id: string
  iconBg: string
  iconLabel: string
  name: string
  description: string
}

const PROCEDURE_CATALOG: ProcedureCatalogItem[] = [
  {
    id: 'greet',
    title: 'Greet and open conversation',
    description: 'Identifies the caller, screens for urgency, and routes them to the right procedure.',
    lastEdited: '2 days ago',
  },
  {
    id: 'general',
    title: 'Handle general inquiry',
    description: 'Answers informational questions like hours, location, insurance, and services.',
    lastEdited: '5 days ago',
  },
  {
    id: 'emergency',
    title: 'Handle emergency or urgent concern',
    description: 'Detects urgent symptoms or concerns and escalates for patient safety.',
    lastEdited: '1 week ago',
  },
  {
    id: 'unclear',
    title: 'Handle unclear message',
    description: "Clarifies vague or out-of-scope messages to recover the patient's intent.",
    lastEdited: '1 week ago',
  },
  {
    id: 'talk-human',
    title: 'Talk to human',
    description: 'Routes the patient to a live staff member when they request human help.',
    lastEdited: '3 days ago',
  },
  {
    id: 'identify-patient',
    title: 'Identify patient',
    description: 'Matches the caller to an existing patient record using name and date of birth.',
    lastEdited: '4 days ago',
  },
  {
    id: 'new-patient',
    title: 'New patient intake',
    description: 'Collects demographics and insurance for patients new to the practice.',
    lastEdited: '5 days ago',
  },
  {
    id: 'book-appointment',
    title: 'Book new appointment',
    description: 'Finds open slots and books a new appointment for the patient.',
    lastEdited: '2 days ago',
  },
]

const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    id: 'epic',
    iconBg: '#C8102E',
    iconLabel: 'Epic',
    name: 'Epic',
    description: 'Connect to Epic EHR to sync patient records and appointments.',
  },
  {
    id: 'athena',
    iconBg: '#0B7A75',
    iconLabel: 'A',
    name: 'Athenahealth',
    description: 'Sync appointments and patient demographics from Athenahealth.',
  },
  {
    id: 'salesforce',
    iconBg: '#00A1E0',
    iconLabel: 'S',
    name: 'Salesforce',
    description: 'Push leads and conversation outcomes into Salesforce CRM.',
  },
]

const DEFAULT_PROCEDURE_IDS = ['greet', 'general', 'emergency', 'unclear']
const DEFAULT_INTEGRATION_IDS = ['epic']

type RecordingMode = 'off' | 'announced'

export function AgentSettingsTab({ product }: AgentSettingsTabProps) {
  const [voice, setVoice] = useState('Andrea (warm, clear, reassuring)')
  const [greeting, setGreeting] = useState(
    'Thank you for calling Rock Dental Brands — my name is Myna, your virtual assistant. How can I help you today?'
  )
  const [recording, setRecording] = useState<RecordingMode>('announced')
  const [consent, setConsent] = useState(
    'This call may be recorded for quality and training purposes.'
  )
  const [connectedIntegrationId, setConnectedIntegrationId] = useState<string | null>('epic')
  const [voiceCallEnabled, setVoiceCallEnabled] = useState(true)
  const [webChatEnabled, setWebChatEnabled] = useState(true)
  const [textEnabled, setTextEnabled] = useState(true)
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>(DEFAULT_PROCEDURE_IDS)
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<string[]>(DEFAULT_INTEGRATION_IDS)
  const [procedureDrawerOpen, setProcedureDrawerOpen] = useState(false)
  const [integrationAddOpen, setIntegrationAddOpen] = useState(false)
  const [integrationAddAnchor, setIntegrationAddAnchor] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  const isHealthcare = product === 'healthcare'

  const selectedProcedures = PROCEDURE_CATALOG.filter((p) => selectedProcedureIds.includes(p.id))
  const selectedIntegrations = INTEGRATION_CATALOG.filter((i) => selectedIntegrationIds.includes(i.id))
  const availableIntegrations = INTEGRATION_CATALOG.filter((i) => !selectedIntegrationIds.includes(i.id))

  const openIntegrationAdd = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setIntegrationAddAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setIntegrationAddOpen(true)
  }

  const removeProcedure = (id: string) => {
    setSelectedProcedureIds((current) => current.filter((item) => item !== id))
  }

  const addIntegration = (id: string) => {
    setSelectedIntegrationIds((current) => [...current, id])
  }

  const removeIntegration = (id: string) => {
    setSelectedIntegrationIds((current) => current.filter((item) => item !== id))
    setConnectedIntegrationId((current) => (current === id ? null : current))
  }

  const handleIntegrationClick = (id: string) => {
    setConnectedIntegrationId((current) => (current === id ? null : id))
  }

  const VOICES: VoiceOption[] = [
    { label: 'Andrea (warm, clear, reassuring)',    preview: "Hi, I'm Andrea — warm, clear, and reassuring. How can I help you today?" },
    { label: 'Jordan (professional, calm)',          preview: "Hello, this is Jordan. I'm here to assist you professionally and calmly." },
    { label: 'Sam (friendly, upbeat)',               preview: "Hey there! Sam here — friendly and upbeat. What can I do for you?" },
    { label: 'Morgan (neutral, clear)',              preview: "Hi, I'm Morgan. Clear and neutral, ready to assist you." },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-2xl pt-lg pb-2xl">
        {/* constrain settings content to ~700px */}
        <div className="w-full max-w-[700px] space-y-xl">

        {/* Channel settings */}
        <section>
          <h2 className="mb-md text-[16px] leading-6 tracking-[-0.32px] text-text-primary">Channel settings</h2>
          <div className="space-y-8">

            {/* Voice call */}
            <ChannelAccordion
              title="Voice call"
              defaultOpen
              enabled={voiceCallEnabled}
              onEnabledChange={setVoiceCallEnabled}
            >
              <div className="flex flex-col gap-lg">
                <div>
                  <label className="block text-small text-text-secondary">Voice</label>
                  <VoiceSelect value={voice} options={VOICES} onChange={setVoice} />
                </div>

                <div>
                  <label className="mb-xs block text-small text-text-secondary">
                    Greeting message <span className="text-chip-danger-text">*</span>
                  </label>
                  <textarea
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    rows={4}
                    className={`${INPUT_CLASS} resize-none py-sm`}
                  />
                </div>

                <div>
                  <p className="text-small text-text-secondary">Recording</p>
                  <SettingSubtext tone="tertiary">
                    Configure consent wording in each channel settings below
                  </SettingSubtext>
                  <div className="mt-sm flex flex-col gap-sm">
                    <label className="flex cursor-pointer items-center gap-sm">
                      <input
                        type="radio"
                        name="recording"
                        value="off"
                        checked={recording === 'off'}
                        onChange={() => setRecording('off')}
                        className="accent-primary"
                      />
                      <span className="text-body text-text-primary">Off</span>
                    </label>
                    <div>
                      <label className="flex cursor-pointer items-center gap-sm">
                        <input
                          type="radio"
                          name="recording"
                          value="announced"
                          checked={recording === 'announced'}
                          onChange={() => setRecording('announced')}
                          className="accent-primary"
                        />
                        <span className="text-body text-text-primary">Record with announced consent</span>
                      </label>
                      {recording === 'announced' && (
                        <div className="mt-sm pl-2xl">
                          <label className="mb-xs block text-small text-text-secondary">
                            Consent message
                          </label>
                          <textarea
                            value={consent}
                            onChange={(e) => setConsent(e.target.value)}
                            rows={3}
                            className={`${INPUT_CLASS} resize-none py-sm`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ChannelAccordion>

            {/* Web chat */}
            <ChannelAccordion
              title="Web chat"
              enabled={webChatEnabled}
              onEnabledChange={setWebChatEnabled}
            >
              <WebChatSettings />
            </ChannelAccordion>

            {/* Text */}
            <ChannelAccordion
              title="Text"
              enabled={textEnabled}
              onEnabledChange={setTextEnabled}
            >
              <TextSettings />
            </ChannelAccordion>

          </div>
        </section>

        {/* Procedures */}
        {isHealthcare && (
          <section>
            <SettingsSectionHeader
              title="Procedures"
              addAriaLabel="Add procedure"
              onAdd={() => setProcedureDrawerOpen(true)}
            />
            {selectedProcedures.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-sm border border-border-selected bg-surface text-body text-text-tertiary">
                No procedures added. Use Add procedure to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-lg">
                {selectedProcedures.map((proc) => (
                  <ProcedureCard
                    key={proc.id}
                    title={proc.title}
                    description={proc.description}
                    lastEdited={proc.lastEdited}
                    onEdit={() => {}}
                    onRemove={() => removeProcedure(proc.id)}
                  />
                ))}
              </div>
            )}
            <ProceduresPickerDrawer
              open={procedureDrawerOpen}
              procedures={PROCEDURE_CATALOG}
              selectedIds={selectedProcedureIds}
              onClose={() => setProcedureDrawerOpen(false)}
              onSave={(ids) => {
                setSelectedProcedureIds(ids)
                setProcedureDrawerOpen(false)
              }}
            />
          </section>
        )}

        {/* Integrations */}
        <section>
          <SettingsSectionHeader
            title="Integrations"
            addAriaLabel="Add integration"
            onAdd={openIntegrationAdd}
            addDisabled={availableIntegrations.length === 0}
          />
          {selectedIntegrations.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-sm border border-border-selected bg-surface text-body text-text-tertiary">
              No integrations added. Use Add integration to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-lg">
              {selectedIntegrations.map((intg) => (
                <IntegrationCard
                  key={intg.id}
                  iconBg={intg.iconBg}
                  iconLabel={intg.iconLabel}
                  name={intg.name}
                  description={intg.description}
                  connected={connectedIntegrationId === intg.id}
                  onClick={() => handleIntegrationClick(intg.id)}
                  onEdit={() => {}}
                  onRemove={() => removeIntegration(intg.id)}
                />
              ))}
            </div>
          )}
          <AddItemMenu
            open={integrationAddOpen}
            anchor={integrationAddAnchor}
            options={availableIntegrations.map((i) => ({ value: i.id, label: i.name }))}
            onClose={() => setIntegrationAddOpen(false)}
            onSelect={addIntegration}
          />
        </section>

        </div>
      </div>
    </div>
  )
}
