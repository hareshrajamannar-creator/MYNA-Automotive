import { useState } from 'react'
import { createPortal } from 'react-dom'

import '../../workflow/Molecules/PreviewPanel/PreviewPanel.css'
import { CallRecordingPlayer } from '../CallRecordingPlayer/CallRecordingPlayer'
import { ChatBubble, ChatSystemLabel } from '../ChatBubble/ChatBubble'
import type { VoiceChatDrawerProps } from './VoiceChatDrawer.types'

export function VoiceChatDrawer({
  open,
  messages,
  summary,
  audioUrl,
  durationSecs = 0,
  mode = 'voice',
  title,
  onClose,
}: VoiceChatDrawerProps) {
  const isChat = mode === 'chat'
  const [summaryOpen, setSummaryOpen] = useState(true)
  const headerTitle = title ?? (isChat ? 'Chat with Myna' : 'Call with Myna')

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
            <span className="pp-details__title">{headerTitle}</span>
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

            {/* Transcript — same bubble template as inbox; side padding matches summary card */}
            <div className="pp-details__transcript">
              {messages.map((m) => {
                if (m.role === 'system') {
                  return <ChatSystemLabel key={m.id} text={m.text} />
                }
                if (m.role === 'agent') {
                  return (
                    <ChatBubble key={m.id} sender="business" text={m.text} />
                  )
                }
                return (
                  <ChatBubble key={m.id} sender="user" text={m.text} />
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
