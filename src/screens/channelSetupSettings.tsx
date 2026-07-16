import { useRef, type ReactNode } from 'react'
import { Icon } from '../components'
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
      {checked && <Icon name="check" size={11} fill weight={600} className="text-white" />}
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

function formatFallbackChipLabel(label: string): string {
  return label
    .split(/[._\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
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
        <span>{prefix}</span>{' '}
        <span className="mx-[2px] inline-flex h-7 items-center rounded-sm bg-chip-neutral-bg px-sm align-middle text-small text-chip-neutral-text">
          {formatFallbackChipLabel(chipLabel)}
        </span>
        {suffix && <span>{suffix}</span>}
      </div>
      <div className="flex items-center gap-[2px] bg-surface px-sm py-[6px]">
        <button
          type="button"
          title="Emoji"
          className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <Icon name="sentiment_satisfied" size={18} />
        </button>
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
    escalationEnabled,
    escalationName,
    duringEnabled,
    afterEnabled,
  } = settings

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-sm">
        <div>
          <label className="text-body text-text-primary">AI agent name</label>
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
          <p className="text-small text-chip-danger-text">Enter an AI agent name</p>
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
