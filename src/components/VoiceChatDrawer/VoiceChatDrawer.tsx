import { useState } from 'react'
import { createPortal } from 'react-dom'

import '../../workflow/Molecules/PreviewPanel/PreviewPanel.css'
import { CallRecordingPlayer } from '../CallRecordingPlayer/CallRecordingPlayer'
import type { VoiceChatDrawerProps } from './VoiceChatDrawer.types'

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
  const [summaryOpen, setSummaryOpen] = useState(true)

  if (!open) return null

  return createPortal(
    <div className="pp-details-overlay" onClick={onClose}>
      <div className="pp-details-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="pp-details">
          {/* Header */}
          <div className="pp-details__header">
            <button className="pp-details__back-btn" type="button" onClick={onClose} aria-label="Back">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="pp-details__title">{isChat ? 'Chat with Myna' : 'Call with Myna'}</span>
          </div>

          <div className="pp-details__body">
            {!isChat && (
              <CallRecordingPlayer
                audioUrl={audioUrl}
                durationSecs={durationSecs}
                active={open}
              />
            )}

            {/* Summary card */}
            {summary && (
              <div className="pp-summary-card">
                <button
                  className="pp-summary-card__header"
                  type="button"
                  onClick={() => setSummaryOpen((v) => !v)}
                >
                  <span className="pp-summary-card__icon-wrap" aria-hidden>
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </span>
                  <span className="pp-summary-card__label">Summary</span>
                  <span className="material-symbols-outlined pp-summary-card__chevron">
                    {summaryOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {summaryOpen && <p className="pp-summary-card__body">{summary}</p>}
              </div>
            )}

            {/* Transcript */}
            <div className="pp-details__transcript">
              {messages.map((m) => {
                if (m.role === 'system') {
                  return (
                    <div key={m.id} className="pp-system">
                      {m.text}
                    </div>
                  )
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
    document.body,
  )
}
