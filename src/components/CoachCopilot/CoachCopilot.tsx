import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon/Icon'
import {
  TARGET_TYPE_ICON,
  TARGET_TYPE_LABEL,
  type CopilotMessage,
  type ProposedChange,
} from '../../data/feedbackData'
import type { ChangeDecision, CoachCopilotProps } from './CoachCopilot.types'

// ── Sub-blocks ────────────────────────────────────────────────────────────────

function ThoughtBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-col gap-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-xs self-start text-small text-text-secondary hover:text-text-primary"
      >
        <Icon name="bolt" size={16} className="text-text-icon" />
        Thoughts
        <Icon name={open ? 'expand_less' : 'expand_more'} size={16} className="text-text-icon" />
      </button>
      {open && <p className="m-0 text-body text-text-primary">{text}</p>}
    </div>
  )
}

function ToolStepsBlock({
  title,
  steps,
}: {
  title: string
  steps: { label: string; status: 'done' | 'running' | 'failed' }[]
}) {
  return (
    <div className="flex flex-col gap-sm rounded-md border border-border bg-surface-l1 px-md py-sm">
      <div className="flex items-center gap-xs text-small text-text-secondary">
        <Icon name="check" size={16} className="text-accent-positive" />
        {title}
      </div>
      {steps.map((step) => (
        <div key={step.label} className="flex items-center gap-xs pl-lg text-small text-text-secondary">
          {step.status === 'failed' ? (
            <Icon name="close" size={14} className="text-chip-danger-text" />
          ) : step.status === 'running' ? (
            <Icon name="progress_activity" size={14} className="animate-spin text-text-icon" />
          ) : (
            <Icon name="check" size={14} className="text-accent-positive" />
          )}
          {step.label}
        </div>
      ))}
    </div>
  )
}

// Compact card — clicking opens the change detail side pane (procedure or workflow view).
function ChangeCard({ change, onOpen }: { change: ProposedChange; onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-md rounded-md border border-border bg-surface px-md py-sm text-left hover:bg-surface-hover"
    >
      <span className="flex items-center gap-sm text-body text-text-primary">
        <Icon name={TARGET_TYPE_ICON[change.targetType]} size={18} className="text-text-icon" />
        {TARGET_TYPE_LABEL[change.targetType]} updated: {change.targetName}
      </span>
      <span className="flex shrink-0 items-center gap-sm text-small text-accent-positive">
        + {change.changeLabel}
        <Icon name="chevron_right" size={18} className="text-text-icon" />
      </span>
    </button>
  )
}

function TestRunCard({
  change,
  decision,
  onDecide,
}: {
  change: ProposedChange
  decision?: ChangeDecision
  onDecide: (decision: ChangeDecision) => void
}) {
  if (!change.testRun) return null
  return (
    <div className="flex flex-col rounded-md border border-border bg-surface">
      <div className="flex flex-col gap-md px-md py-md">
        <div className="flex flex-col gap-xs">
          <span className="flex items-center gap-xs text-small text-text-secondary">
            <Icon name="do_not_disturb_on" size={16} className="text-chip-danger-text" />
            Original message
          </span>
          <p className="m-0 rounded-lg bg-[#f0f0f0] px-md py-sm text-body text-text-primary">
            {change.testRun.before}
          </p>
        </div>
        <div className="flex flex-col gap-xs">
          <span className="flex items-center gap-xs text-small text-text-secondary">
            <Icon name="check_circle" size={16} className="text-accent-positive" />
            Revised message
          </span>
          <p className="m-0 rounded-lg bg-[#dbeafe] px-md py-sm text-body text-text-primary">
            {change.testRun.after}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-sm border-t border-border px-md py-sm">
        {decision ? (
          <span className="flex items-center gap-xs text-small text-text-secondary">
            <Icon
              name={decision === 'accepted' ? 'check_circle' : 'do_not_disturb_on'}
              size={16}
              className={decision === 'accepted' ? 'text-accent-positive' : 'text-chip-danger-text'}
            />
            {decision === 'accepted' ? 'Change accepted — training started' : 'Original kept — change rejected'}
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onDecide('rejected')}
              className="flex h-9 items-center rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
            >
              Keep original
            </button>
            <button
              type="button"
              onClick={() => onDecide('accepted')}
              className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
            >
              Accept
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CoachCopilot({
  messages,
  changes,
  changeDecisions,
  onDecideChange,
  onOpenChange,
  onSend,
  busy = false,
  composerPlaceholder = 'Follow-up with additional improvements',
}: CoachCopilotProps) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, busy])

  const changeById = (id: string) => changes.find((c) => c.id === id)

  const submit = () => {
    const text = draft.trim()
    if (!text || busy) return
    onSend(text)
    setDraft('')
  }

  const renderMessage = (msg: CopilotMessage) => {
    switch (msg.kind) {
      case 'user':
        return (
          <div className="flex justify-end">
            <p className="m-0 max-w-[70%] rounded-lg bg-[#f0f0f0] px-md py-sm text-body text-text-primary">
              {msg.text}
            </p>
          </div>
        )
      case 'assistant':
        return <p className="m-0 text-body text-text-primary">{msg.text}</p>
      case 'thought':
        return <ThoughtBlock text={msg.text} />
      case 'tool-steps':
        return <ToolStepsBlock title={msg.title} steps={msg.steps} />
      case 'change-card': {
        const change = changeById(msg.changeId)
        return change ? <ChangeCard change={change} onOpen={() => onOpenChange?.(change.id)} /> : null
      }
      case 'test-run': {
        const change = changeById(msg.changeId)
        return change ? (
          <TestRunCard
            change={change}
            decision={changeDecisions[change.id]}
            onDecide={(decision) => onDecideChange(change.id, decision)}
          />
        ) : null
      }
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto py-lg">
        {messages.map((msg) => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}
        {busy && (
          <div className="flex items-center gap-xs text-small text-text-secondary">
            <Icon name="progress_activity" size={16} className="animate-spin text-text-icon" />
            Thinking…
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 pb-lg">
        <div className="flex flex-col gap-sm rounded-md border border-border bg-surface p-md focus-within:border-primary">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={composerPlaceholder}
            className="w-full resize-none bg-transparent text-body text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              aria-label="Send"
              onClick={submit}
              disabled={!draft.trim() || busy}
              className={`flex size-9 items-center justify-center rounded-sm transition-colors ${
                draft.trim() && !busy
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'cursor-not-allowed bg-surface-selected text-text-tertiary'
              }`}
            >
              <Icon name="arrow_upward" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
