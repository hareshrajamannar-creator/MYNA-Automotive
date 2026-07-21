import { useEffect, useRef, useState } from 'react'
import { ChangeDetailDrawer, Chip, CoachCopilot, Toast, type ChangeDecision, type ChipVariant } from '../components'
import { BackArrowIcon } from '../assets/BackArrowIcon'
import {
  buildFollowUpMessages,
  SOURCE_LABEL,
  type CopilotMessage,
  type FeedbackRecord,
} from '../data/feedbackData'
import { useFeedbackStore } from '../data/FeedbackStoreContext'

const STATUS_VARIANT: Record<string, ChipVariant> = {
  open: 'neutral',
  applied: 'success',
  rejected: 'danger',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  applied: 'Applied',
  rejected: 'Rejected',
}

interface CoachCopilotScreenProps {
  record: FeedbackRecord
  onBack: () => void
  // When true (new coaching session), the copilot transcript plays back with
  // staged delays so the session feels live.
  playOnMount?: boolean
}

export function CoachCopilotScreen({ record, onBack, playOnMount = false }: CoachCopilotScreenProps) {
  const { records, updateStatus } = useFeedbackStore()
  const liveRecord = records.find((r) => r.id === record.id) ?? record

  const [messages, setMessages] = useState<CopilotMessage[]>(() =>
    playOnMount ? record.chat.slice(0, 1) : record.chat,
  )
  const [busy, setBusy] = useState(playOnMount)
  const [changeDecisions, setChangeDecisions] = useState<Record<string, ChangeDecision>>(() =>
    record.status === 'applied'
      ? Object.fromEntries(record.changes.map((c) => [c.id, 'accepted' as ChangeDecision]))
      : record.status === 'rejected'
        ? Object.fromEntries(record.changes.map((c) => [c.id, 'rejected' as ChangeDecision]))
        : {},
  )
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [openChangeId, setOpenChangeId] = useState<string | null>(null)
  const timersRef = useRef<number[]>([])

  // Staged playback of the remaining scripted messages.
  const playMessages = (queue: CopilotMessage[]) => {
    setBusy(true)
    let delay = 0
    queue.forEach((msg, i) => {
      delay += msg.kind === 'tool-steps' ? 1400 : 900
      timersRef.current.push(
        window.setTimeout(() => {
          setMessages((prev) => [...prev, msg])
          if (i === queue.length - 1) setBusy(false)
        }, delay),
      )
    })
    if (queue.length === 0) setBusy(false)
  }

  useEffect(() => {
    if (playOnMount) playMessages(record.chat.slice(1))
    return () => timersRef.current.forEach(clearTimeout)
    // Play the scripted session exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = (message: string) => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleDecideChange = (changeId: string, decision: ChangeDecision) => {
    const next = { ...changeDecisions, [changeId]: decision }
    setChangeDecisions(next)
    const allDecided = liveRecord.changes.every((c) => next[c.id])
    if (allDecided) {
      const anyAccepted = liveRecord.changes.some((c) => next[c.id] === 'accepted')
      updateStatus(liveRecord.id, anyAccepted ? 'applied' : 'rejected')
    }
    showToast(
      decision === 'accepted'
        ? 'Change accepted — the agent is training on it now.'
        : 'Original kept — the change was rejected.',
    )
  }

  const handleSend = (text: string) => {
    playMessages(buildFollowUpMessages(liveRecord.id, text))
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-2xl">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <BackArrowIcon />
          </button>
          <h1 className="text-h3 text-text-primary">{liveRecord.title}</h1>
          <Chip label={SOURCE_LABEL[liveRecord.source]} variant={liveRecord.source === 'ai' ? 'neutral' : 'warning'} />
          <Chip label={STATUS_LABEL[liveRecord.status]} variant={STATUS_VARIANT[liveRecord.status] ?? 'neutral'} />
        </div>
      </div>

      {/* Body — centered copilot column; change details open in a side pane */}
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-2xl">
        <div className="flex h-full w-full max-w-[800px] flex-col">
          <CoachCopilot
            messages={messages}
            changes={liveRecord.changes}
            changeDecisions={changeDecisions}
            onDecideChange={handleDecideChange}
            onOpenChange={setOpenChangeId}
            onSend={handleSend}
            busy={busy}
          />
        </div>
      </div>

      <ChangeDetailDrawer
        open={openChangeId !== null}
        change={liveRecord.changes.find((c) => c.id === openChangeId) ?? null}
        onClose={() => setOpenChangeId(null)}
      />
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  )
}
