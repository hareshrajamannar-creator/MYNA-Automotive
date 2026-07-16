import { useEffect, useRef, useState } from 'react'
import aiIcon from '../../assets/ai-icon.svg'
import { Icon } from '../Icon/Icon'
import type {
  LogDetailsPanelProps,
  LogToolCall,
  LogTranscriptEntry,
} from './LogDetailsPanel.types'

const SPEEDS = [1, 1.5, 2] as const
type Speed = (typeof SPEEDS)[number]

const DEFAULT_SUMMARY =
  'The caller inquired about the cost of an oil change service. The agent provided detailed information from the service menu, outlining the various options available, and subsequently transferred the call to the sales department for further assistance.'

const WAVE_BARS = [
  18, 34, 52, 28, 44, 62, 36, 48, 22, 56, 40, 30, 58, 24, 46, 64, 38, 50, 26, 54,
  32, 48, 60, 28, 42, 56, 34, 50, 22, 46, 58, 30, 52, 40, 26, 48, 62, 36, 44, 28,
  54, 32, 48, 60, 24, 46, 38, 56, 30, 50, 42, 28, 58, 34, 48, 22, 52, 40, 60, 26,
  46, 54, 32, 48, 38, 56, 28, 44, 50, 34, 58, 24, 46, 40, 52, 30, 48, 36, 54, 28,
]

const DEFAULT_TRANSCRIPT: LogTranscriptEntry[] = [
  { id: 'sys1', role: 'system', text: 'Conversation started' },
  {
    id: 'a1',
    role: 'agent',
    text: 'Thank you for calling Rock Dental Brands — my name is Myna, your virtual assistant. How can I help you today?',
    llmResponseTime: '0.42s',
    tts: '700ms',
    procedure: 'Greeting & start conversation',
  },
  {
    id: 'c1',
    role: 'caller',
    text: 'I am having a very bad headache. I think it is migraine.',
    durationLabel: '5s',
  },
  {
    id: 'a2',
    role: 'agent',
    text: "I'm really sorry you're dealing with that — a bad headache is no fun. Just so I point you in the right direction: is the pain coming from your teeth, jaw, or gums, or is it more of a general head pain?",
    llmResponseTime: '0.51s',
    tts: '820ms',
    knowledgeBase: '2 chunks • 5s',
    toolCall: {
      id: 'tool-1',
      name: 'Patient record - Lookup',
      propertyCount: 3,
      properties: [
        { label: 'Matched patient', value: 'Dana Whitfield' },
        { label: 'Last visit', value: '12 Mar, 2024' },
        { label: 'Preferred location', value: 'North region' },
      ],
    },
  },
  {
    id: 'c2',
    role: 'caller',
    text: 'Now that you ask — it kind of started near my back tooth and spread up.',
    durationLabel: '4s',
  },
  {
    id: 'a3',
    role: 'agent',
    text: 'Thank you, that helps. Pain that radiates from a tooth can sometimes need prompt attention. Are you having any swelling in your face or jaw, fever, or trouble swallowing or breathing?',
    llmResponseTime: '0.48s',
    tts: '640ms',
  },
  {
    id: 'c3',
    role: 'caller',
    text: 'A little swelling near the tooth, no fever',
    durationLabel: '3s',
  },
]

function speedLabel(s: Speed): string {
  return s === 1 ? '1 x' : s === 1.5 ? '1.5 x' : '2 x'
}

function fmtPlayerTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}.${String(s).padStart(2, '0')}`
}

function parseDurationSecs(duration: string): number {
  const mmss = duration.match(/^(\d+):(\d+)$/)
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2])
  const verbose = duration.match(/(\d+)\s*m(?:in)?[^\d]*(\d+)?\s*s?/i)
  if (verbose) return Number(verbose[1]) * 60 + Number(verbose[2] ?? 0)
  const secsOnly = Number(duration)
  return Number.isFinite(secsOnly) ? secsOnly : 332
}

function formatDurationLabel(secs: number): string {
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins}m ${String(rem).padStart(2, '0')}s`
}

function startTimeLabel(timestamp: string): string {
  const match = timestamp.match(/(\d{1,2}:\d{2}\s*[ap]m)/i)
  return match?.[1] ?? timestamp
}

function StaticWaveform({
  progress,
  onSeek,
}: {
  progress: number
  onSeek: (ratio: number) => void
}) {
  return (
    <div
      className="mb-md flex h-14 cursor-pointer items-end gap-[2px]"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onSeek((e.clientX - rect.left) / rect.width)
      }}
      role="slider"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Playback position"
    >
      {WAVE_BARS.map((h, i) => {
        const played = i / WAVE_BARS.length <= progress
        return (
          <div
            key={i}
            className={`min-w-[2px] flex-1 rounded-sm ${played ? 'bg-primary' : 'bg-surface-selected'}`}
            style={{ height: Math.max(4, Math.round((h / 64) * 56)) }}
          />
        )
      })}
    </div>
  )
}

function ToolCallBlock({ tool }: { tool: LogToolCall }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-xs text-left text-small text-text-secondary hover:text-text-primary"
      >
        <Icon name={open ? 'expand_more' : 'chevron_right'} size={16} className="text-text-tertiary" />
        <span>
          Tool : {tool.name}{' '}
          <span className="text-text-tertiary">{`{ ${tool.propertyCount} properties }`}</span>
        </span>
      </button>
      {open && (
        <div className="ml-lg mt-xs space-y-xs rounded-sm border border-border bg-surface-l2 px-md py-sm">
          {tool.properties.map((p) => (
            <div key={p.label} className="flex gap-sm text-small">
              <span className="shrink-0 text-text-tertiary">{p.label}</span>
              <span className="text-text-primary">{p.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 text-small text-text-tertiary">{label}</p>
      <p className="m-0 mt-xs text-body text-text-primary">{value}</p>
    </div>
  )
}

function agentMetaParts(entry: Extract<LogTranscriptEntry, { role: 'agent' }>): string[] {
  const parts: string[] = []
  if (entry.llmResponseTime) parts.push(`LLM response time : ${entry.llmResponseTime}`)
  if (entry.tts) parts.push(`TTS ${entry.tts}`)
  if (entry.procedure) parts.push(`Procedure : ${entry.procedure}`)
  if (entry.knowledgeBase) parts.push(`Knowledge base: ${entry.knowledgeBase}`)
  return parts
}

function TranscriptEntry({ entry }: { entry: LogTranscriptEntry }) {
  if (entry.role === 'system') {
    return <div className="py-sm text-center text-small text-text-tertiary">{entry.text}</div>
  }

  if (entry.role === 'caller') {
    return (
      <div className="flex flex-col items-end gap-xs">
        <p className="m-0 max-w-[90%] rounded-md rounded-br-sm bg-surface-selected px-md py-sm text-body leading-[1.6] text-text-primary">
          {entry.text}
        </p>
        {entry.durationLabel && (
          <span className="text-small text-text-tertiary">Caller • {entry.durationLabel}</span>
        )}
      </div>
    )
  }

  const meta = agentMetaParts(entry)

  return (
    <div className="flex flex-col items-start gap-xs">
      <p className="m-0 max-w-[90%] rounded-md rounded-bl-sm bg-surface-selected px-md py-sm text-body leading-[1.6] text-text-primary">
        {entry.text}
      </p>
      {meta.length > 0 && (
        <p className="m-0 text-small text-text-tertiary">{meta.join(' • ')}</p>
      )}
      {entry.toolCall && <ToolCallBlock tool={entry.toolCall} />}
    </div>
  )
}

export function LogDetailsPanel({
  row,
  callerNumber = '(032) 902 9023',
  sidNumber = 'CA45 T78 932',
  languageDetected = 'English',
  callEndReason = 'User ended the conversation',
  routedVia = 'Reminder agent',
  summary = DEFAULT_SUMMARY,
  transcript = DEFAULT_TRANSCRIPT,
  durationSecs,
  onViewConversation,
}: LogDetailsPanelProps) {
  const totalSecs = durationSecs ?? (parseDurationSecs(row.duration) || 332)
  const displayCaller =
    row.contact.startsWith('+') || row.contact.startsWith('(') ? row.contact : callerNumber

  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0.54)
  const [speed, setSpeed] = useState<Speed>(1.5)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [transcriptOpen, setTranscriptOpen] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1 * speed
        if (next >= totalSecs) {
          setPlaying(false)
          return totalSecs
        }
        return next
      })
    }, 100)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [playing, speed, totalSecs])

  const progress = totalSecs > 0 ? elapsed / totalSecs : 0

  return (
    <div className="preview-panel log-details-panel flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-xl pt-md pb-md">
        <h2 className="m-0 text-body text-text-primary">Conversation details</h2>
        {onViewConversation && (
          <button
            type="button"
            onClick={onViewConversation}
            className="flex items-center gap-xs text-body text-text-action hover:text-primary-hover"
          >
            View conversation
            <Icon name="open_in_new" size={16} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-xl pb-xl pt-md">
        {/* Meta card */}
        <div className="mb-2xl rounded-sm border border-border px-lg py-lg">
          <div className="grid grid-cols-2 gap-x-lg gap-y-lg">
            <MetaField label="Caller number" value={displayCaller} />
            <MetaField label="Language detected" value={languageDetected} />
            <MetaField label="Duration" value={formatDurationLabel(totalSecs)} />
            <MetaField label="Call SID" value={sidNumber} />
            <MetaField label="Start time" value={startTimeLabel(row.timestamp)} />
            <MetaField label="Call end reason" value={callEndReason} />
            <MetaField label="Routed via" value={routedVia} />
          </div>
        </div>

        {/* AI summary */}
        <div className="ai-summary-panel mb-2xl shrink-0">
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-xs">
              <img src={aiIcon} alt="" className="size-5 shrink-0" />
              <span className="text-body text-text-primary">AI summary</span>
            </span>
            <Icon
              name={summaryOpen ? 'expand_less' : 'expand_more'}
              size={20}
              className="text-text-secondary"
            />
          </button>
          {summaryOpen && (
            <p className="m-0 mt-sm text-body leading-[1.6] text-text-primary">{summary}</p>
          )}
        </div>

        {/* Call recording */}
        <div className="mb-2xl">
          <p className="mb-md text-body text-text-primary">Call recording</p>
          <StaticWaveform
            progress={progress}
            onSeek={(ratio) => {
              setElapsed(Math.min(totalSecs, Math.max(0, ratio * totalSecs)))
            }}
          />
          <div className="flex items-center gap-md">
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              <Icon name={playing ? 'pause' : 'play_arrow'} size={22} fill />
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = SPEEDS.indexOf(speed)
                setSpeed(SPEEDS[(idx + 1) % SPEEDS.length])
              }}
              className="h-7 shrink-0 rounded-sm border border-border bg-surface px-md text-small text-text-primary hover:bg-surface-hover"
            >
              {speedLabel(speed)}
            </button>
            <span className="flex-1" />
            <span className="whitespace-nowrap text-small text-text-secondary">
              <span className="text-primary">{fmtPlayerTime(elapsed)}</span>
              {' / '}
              {fmtPlayerTime(totalSecs)}
            </span>
          </div>
        </div>

        {/* Call transcript */}
        <div>
          <button
            type="button"
            onClick={() => setTranscriptOpen((v) => !v)}
            className="mb-md flex w-full items-center justify-between text-left"
          >
            <span className="text-body text-text-primary">Call transcript</span>
            <Icon
              name={transcriptOpen ? 'expand_less' : 'expand_more'}
              size={20}
              className="text-text-secondary"
            />
          </button>
          {transcriptOpen && (
            <div className="flex flex-col gap-md">
              {transcript.map((entry) => (
                <TranscriptEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
