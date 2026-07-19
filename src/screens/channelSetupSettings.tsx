import { useRef, useState, type ReactNode } from 'react'
import { RefChip } from '../components'
import { Check, ChevronDown, Smile } from 'lucide-react'
import type { TextChannelSettings, WebChatChannelSettings } from './channelSetupSettings.types'

const FIELD_BORDER_CLASS =
  'rounded-sm border border-border-input transition-colors focus:border-primary focus:outline-none focus-visible:border-primary'

const INPUT_CLASS = `w-full bg-surface px-md text-body text-text-primary ${FIELD_BORDER_CLASS}`

const CHECKBOX_ROW_GAP = 'gap-sm'
const CHECKBOX_ROW_INDENT = <span className="size-4 shrink-0" aria-hidden />

function SettingsCheckboxBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors ${
        checked ? 'border-primary bg-primary' : 'border-control-border bg-surface'
      }`}
    >
      {checked && <Check className="size-4 text-white" strokeWidth={1.6} absoluteStrokeWidth />}
    </span>
  )
}

function SettingSubtext({ children }: { children: ReactNode }) {
  return <p className="mt-[2px] text-small text-text-secondary">{children}</p>
}

function CheckboxRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start rounded-sm text-left ${CHECKBOX_ROW_GAP}`}
    >
      <span className="mt-[2px] shrink-0">
        <SettingsCheckboxBox checked={checked} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body text-text-primary">{label}</p>
        {description && <SettingSubtext>{description}</SettingSubtext>}
      </div>
    </button>
  )
}

function CheckboxLabelRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start rounded-sm text-left ${CHECKBOX_ROW_GAP}`}
    >
      <span className="mt-[1px] shrink-0">
        <SettingsCheckboxBox checked={checked} />
      </span>
      <span className="text-small text-text-secondary">{label}</span>
    </button>
  )
}

function CheckboxRowField({ children }: { children: ReactNode }) {
  return (
    <div className={`flex items-start ${CHECKBOX_ROW_GAP}`}>
      {CHECKBOX_ROW_INDENT}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function FallbackField({
  prefix,
  chipLabel,
  suffix,
}: {
  prefix: string
  chipLabel: string
  suffix?: string
}) {
  const [showChip, setShowChip] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`overflow-hidden bg-surface ${FIELD_BORDER_CLASS} focus-within:border-primary`}>
      <div
        ref={bodyRef}
        tabIndex={0}
        role="textbox"
        aria-multiline="true"
        onMouseDown={() => bodyRef.current?.focus()}
        className="min-h-[80px] cursor-text px-md pt-sm pb-xs text-body leading-[1.7] text-text-primary outline-none"
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
      <div className="flex items-center gap-[2px] bg-surface px-sm py-[6px]">
        <button
          type="button"
          title="AI personalize"
          className="flex h-7 items-center gap-[3px] rounded-sm px-[6px] text-text-icon hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
            <text x="8" y="11.5" textAnchor="middle" fontSize="7.5" fill="currentColor" fontFamily="sans-serif">
              Ai
            </text>
            <path d="M12 1.5 L13 3 L14 1.5 L13 0 Z" fill="#7C3AED" />
          </svg>
          <span className="sr-only">AI</span>
        </button>
        <button
          type="button"
          title="Emoji"
          className="flex size-8 items-center justify-center rounded-md text-text-icon hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <Smile className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button
          type="button"
          className="flex items-center gap-[3px] rounded-sm px-[6px] py-[3px] text-body text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          Personalize
          <ChevronDown className="size-4 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>
    </div>
  )
}

/** Static channel card — matches Agent settings tab body, without accordion toggle or chevron. */
export function ChannelSettingsPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex h-14 items-center px-lg">
        <span className="text-body font-medium text-text-primary">{title}</span>
      </div>
      <div className="px-lg pb-lg pt-md">{children}</div>
    </div>
  )
}

export function WebChatSetupSettings({
  settings,
  onSettingsChange,
  chatAgentNameError = false,
}: {
  settings: WebChatChannelSettings
  onSettingsChange: (patch: Partial<WebChatChannelSettings>) => void
  chatAgentNameError?: boolean
}) {
  const {
    aiAgentName,
    resolvedEnabled,
    resolvedName,
    escalationEnabled,
    escalationName,
    duringEnabled,
    afterEnabled,
  } = settings

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-sm">
        <div>
          <label className="text-body text-text-primary">Chat agent name</label>
          <p className="mt-[2px] text-small text-text-secondary">
            Name shown to patients in the chat
          </p>
        </div>
        <input
          type="text"
          value={aiAgentName}
          onChange={(e) => onSettingsChange({ aiAgentName: e.target.value })}
          placeholder="e.g. Robin"
          className={`${INPUT_CLASS} h-9 placeholder:text-text-tertiary ${
            chatAgentNameError ? 'border-chip-danger-text focus:border-chip-danger-text focus-visible:border-chip-danger-text' : ''
          }`}
        />
        {chatAgentNameError && (
          <p className="text-small text-chip-danger-text">Enter a chat agent name</p>
        )}
      </div>

      <div className="flex flex-col gap-sm">
        <CheckboxRow
          label="Resolve button"
          description="A quick reply button patients can tap when their question is answered"
          checked={resolvedEnabled}
          onChange={(v) => onSettingsChange({ resolvedEnabled: v })}
        />
        {resolvedEnabled && (
          <CheckboxRowField>
            <label className="mb-xs block text-small text-text-secondary">Button name</label>
            <input
              type="text"
              value={resolvedName}
              onChange={(e) => onSettingsChange({ resolvedName: e.target.value })}
              className={`${INPUT_CLASS} h-9`}
            />
          </CheckboxRowField>
        )}
      </div>

      <div className="flex flex-col gap-sm">
        <CheckboxRow
          label="Escalation button"
          description="A quick reply button patients can tap to reach a team member"
          checked={escalationEnabled}
          onChange={(v) => onSettingsChange({ escalationEnabled: v })}
        />
        {escalationEnabled && (
          <CheckboxRowField>
            <label className="mb-xs block text-small text-text-secondary">Button name</label>
            <input
              type="text"
              value={escalationName}
              onChange={(e) => onSettingsChange({ escalationName: e.target.value })}
              className={`${INPUT_CLASS} h-9`}
            />
          </CheckboxRowField>
        )}
      </div>

      <div className="flex flex-col gap-md">
        <p className="text-body text-text-primary">Fallback message</p>

        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="During business hours"
            checked={duringEnabled}
            onChange={(v) => onSettingsChange({ duringEnabled: v })}
          />
          {duringEnabled && (
            <CheckboxRowField>
              <FallbackField
                prefix="We're not available right now. Our team will follow up during business hours. You can also reach us at"
                chipLabel="business.phone"
              />
            </CheckboxRowField>
          )}
        </div>

        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="After business hours"
            checked={afterEnabled}
            onChange={(v) => onSettingsChange({ afterEnabled: v })}
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

export function TextSetupSettings({
  settings,
  onSettingsChange,
}: {
  settings: TextChannelSettings
  onSettingsChange: (patch: Partial<TextChannelSettings>) => void
}) {
  const { unsubscribeEnabled, beforeEnabled, afterEnabled } = settings

  return (
    <div className="flex flex-col gap-lg">
      <CheckboxRow
        label="Unsubscribe text"
        description="Enabling this will allow customers to opt out of text communications"
        checked={unsubscribeEnabled}
        onChange={(v) => onSettingsChange({ unsubscribeEnabled: v })}
      />

      <div className="flex flex-col gap-sm">
        <p className="text-body text-text-primary">Fallback message</p>

        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="Before business hours"
            checked={beforeEnabled}
            onChange={(v) => onSettingsChange({ beforeEnabled: v })}
          />
          {beforeEnabled && (
            <CheckboxRowField>
              <FallbackField
                prefix="We're not available right now. Our team will follow up during business hours. You can also reach us at"
                chipLabel="business.phone"
              />
            </CheckboxRowField>
          )}
        </div>

        <div className="flex flex-col gap-sm">
          <CheckboxLabelRow
            label="After business hours"
            checked={afterEnabled}
            onChange={(v) => onSettingsChange({ afterEnabled: v })}
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
