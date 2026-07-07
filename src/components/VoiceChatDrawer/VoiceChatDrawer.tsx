import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import WaveSurfer from 'wavesurfer.js'
import '../../workflow/Molecules/PreviewPanel/PreviewPanel.css'
import type { VoiceChatDrawerProps } from './VoiceChatDrawer.types'

const SPEEDS = [1, 1.5, 2] as const
type Speed = typeof SPEEDS[number]

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}.${String(s).padStart(2, '0')}`
}

function speedLabel(s: Speed): string {
  return s === 1 ? '1 x' : s === 1.5 ? '1.5 x' : '2 x'
}

export function VoiceChatDrawer({
  open,
  messages,
  summary,
  audioUrl,
  durationSecs = 0,
  mode = 'voice',
  onClose,
}: VoiceChatDrawerProps) {
  const isChat = mode === 'chat'
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [wsReady, setWsReady] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [speed, setSpeed] = useState<Speed>(1.5)
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!open) {
      wsRef.current?.pause()
      setPlaying(false)
      setElapsed(0)
    }
  }, [open])

  useEffect(() => {
    if (!open || !audioUrl || !containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#d8dde6',
      progressColor: '#1976d2',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 56,
      normalize: true,
      interact: true,
    })
    ws.setMuted(true)

    ws.load(audioUrl)
    ws.on('ready', () => setWsReady(true))
    ws.on('audioprocess', (t: number) => setElapsed(Math.floor(t)))
    ws.on('finish', () => { setPlaying(false); setElapsed(0) })
    ws.on('seeking', (t: number) => setElapsed(Math.floor(t)))

    wsRef.current = ws
    return () => { ws.destroy(); wsRef.current = null; setWsReady(false) }
  }, [open, audioUrl, isChat])

  // Apply playback rate whenever speed changes
  useEffect(() => {
    wsRef.current?.setPlaybackRate(speed)
  }, [speed])

  if (!open) return null

  const total = wsReady && wsRef.current ? wsRef.current.getDuration() : durationSecs

  function handlePlayPause() {
    wsRef.current?.playPause()
    setPlaying(v => !v)
  }

  function handleNextSpeed() {
    const idx = SPEEDS.indexOf(speed)
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length])
  }

  return createPortal(
    <div className="pp-details-overlay" onClick={onClose}>
      <div className="pp-details-drawer" onClick={e => e.stopPropagation()}>
        <div className="pp-details">

          {/* Header */}
          <div className="pp-details__header">
            <button className="pp-details__back-btn" type="button" onClick={onClose} aria-label="Back">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="pp-details__title">{isChat ? 'Chat with Myna' : 'Call with Myna'}</span>
          </div>

          <div className="pp-details__body">

            {/* WaveSurfer player */}
            {!isChat && (
            <div className="pp-details__player-wrap">
              <div
                ref={containerRef}
                className="cursor-pointer"
                style={{ marginBottom: 14, minHeight: 56, opacity: wsReady ? 1 : 0.3 }}
              />
              <div className="pp-player">
                <button
                  className="pp-player__play-btn"
                  type="button"
                  onClick={handlePlayPause}
                  disabled={!wsReady}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined">
                    {playing ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  className="pp-player__speed"
                  type="button"
                  onClick={handleNextSpeed}
                >
                  {speedLabel(speed)}
                </button>
                <span className="pp-player__spacer" />
                <span className="pp-player__time">
                  <span style={{ color: '#1976d2' }}>{fmtTime(elapsed)}</span>
                  {' / '}
                  {fmtTime(total)}
                </span>
              </div>
            </div>
            )}

            {/* Summary card */}
            {summary && (
              <div className="pp-summary-card">
                <button
                  className="pp-summary-card__header"
                  type="button"
                  onClick={() => setSummaryOpen(v => !v)}
                >
                  <span className="pp-summary-card__icon-wrap" aria-hidden>
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </span>
                  <span className="pp-summary-card__label">Summary</span>
                  <span className="material-symbols-outlined pp-summary-card__chevron">
                    {summaryOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {summaryOpen && (
                  <p className="pp-summary-card__body">{summary}</p>
                )}
              </div>
            )}

            {/* Transcript */}
            <div className="pp-details__transcript">
              {messages.map(m => {
                if (m.role === 'system') {
                  return <div key={m.id} className="pp-system">{m.text}</div>
                }
                if (m.role === 'agent') {
                  return (
                    <div key={m.id} className="pp-agent-row">
                      <div className="pp-agent-avatar">
                        <span className="material-symbols-outlined">auto_awesome</span>
                      </div>
                      <p className="pp-agent-text">{m.text}</p>
                    </div>
                  )
                }
                return (
                  <div key={m.id} className="pp-user-row">
                    <p className="pp-user-bubble">{m.text}</p>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
