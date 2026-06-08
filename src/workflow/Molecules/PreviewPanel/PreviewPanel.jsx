import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  PREVIEW_DEMO_SCRIPT as DEMO_SCRIPT,
  PREVIEW_GREETING as GREETING,
  PreviewLogsView,
  PreviewSidePanelHeader,
} from './PreviewPanelViews';
import './PreviewPanel.css';

/* ── Web Speech helpers ─────────────────────────────────────── */
function speakText(text, onEnd, speakerOff) {
  if (speakerOff || !window.speechSynthesis) { setTimeout(onEnd, 200); return; }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate  = 1.25;  // confident, brisk
  utter.pitch = 0.97;  // slightly lower = authoritative, not squeaky
  const voices = window.speechSynthesis.getVoices();
  // Priority: stylish accents first (Irish/Scottish/Australian/British), then US natural female, then any female
  const pick =
    voices.find(v => /moira/i.test(v.name)) ||           // Irish — warm & confident
    voices.find(v => /fiona/i.test(v.name)) ||           // Scottish — distinctive
    voices.find(v => /karen/i.test(v.name)) ||           // Australian — crisp
    voices.find(v => /serena|martha|emily/i.test(v.name)) || // British English
    voices.find(v => /en[-_]GB/i.test(v.lang) && /natural|enhanced|premium/i.test(v.name)) ||
    voices.find(v => /en[-_]AU/i.test(v.lang) && /natural|enhanced|premium/i.test(v.name)) ||
    voices.find(v => /samantha|ava|allison|susan|zoe|victoria/i.test(v.name)) || // US female
    voices.find(v => /en/i.test(v.lang) && !/daniel|david|mark|fred|alex|tom|george|arthur|oliver/i.test(v.name)) ||
    voices.find(v => /en/i.test(v.lang));
  if (pick) utter.voice = pick;
  utter.onend  = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

/* ── Deterministic waveform bar heights ────────────────────── */
const WAVE_BARS = [
  14,22,36,28,44,18,32,24,48,30,16,40,26,44,20,34,12,38,28,46,
  22,36,16,42,30,24,40,18,44,28,36,20,46,14,32,26,42,18,36,28,
  20,44,32,16,40,24,36,28,44,20,32,48,24,36,16,40,28,20,44,32,
  24,36,16,28,40,24,32,14,36,28,44,16,32,24,20,
];
const CALL_DURATION = 332; // seconds (5m 32s)

function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}.${String(s).padStart(2, '0')}`;
}

/* ── Call / chat details view ───────────────────────────────── */
function CallDetailsView({ messages, onBack, mode = 'voice' }) {
  const isChat = mode === 'chat';
  const [playing, setPlaying]       = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [speed, setSpeed]           = useState(1.5);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const timerRef = useRef(null);

  // Simulate playback progress
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + speed;
          if (next >= CALL_DURATION) { setPlaying(false); return CALL_DURATION; }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed]);

  const progress = elapsed / CALL_DURATION;
  const SPEEDS = [1, 1.5, 2];
  const nextSpeed = () => setSpeed(s => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]);
  const speedLabel = speed === 1 ? '1x' : speed === 1.5 ? '1.5x' : '2x';

  const callStartTime = (() => {
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    return `${h}.${m} ${ampm}`;
  })();

  return (
    <div className="pp-details">
      {/* Header */}
      <div className="pp-details__header">
        <button className="pp-details__back-btn" type="button" onClick={onBack} aria-label="Back">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="pp-details__title">{isChat ? 'Chat with Myna' : 'Call with Myna'}</span>
      </div>

      <div className="pp-details__body">
        {!isChat && (
        <div className="pp-details__player-wrap">
          {/* Waveform */}
          <div
            className="pp-waveform"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setElapsed(ratio * CALL_DURATION);
            }}
          >
            {WAVE_BARS.map((h, i) => {
              const barPos = i / WAVE_BARS.length;
              const played = barPos <= progress;
              return (
                <span
                  key={i}
                  className="pp-waveform__bar"
                  style={{ height: h, background: played ? '#1976d2' : '#d8dde6' }}
                />
              );
            })}
          </div>

          {/* Controls row */}
          <div className="pp-player">
            <button
              className="pp-player__play-btn"
              type="button"
              onClick={() => setPlaying(v => !v)}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              <span className="material-symbols-outlined">
                {playing ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button className="pp-player__speed" type="button" onClick={nextSpeed}>
              {speedLabel}
            </button>
            <span className="pp-player__spacer" />
            <span className="pp-player__time">
              {fmtTime(elapsed)} / {fmtTime(CALL_DURATION)}
            </span>
          </div>
        </div>
        )}

        {/* AI Summary card */}
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
            <p className="pp-summary-card__body">
              Patient reported tooth-origin pain with mild swelling (no fever or breathing issues).
              Myna screened symptoms and offered an urgent appointment, but the patient ended the call.
            </p>
          )}
        </div>

        {/* Transcript */}
        <div className="pp-details__transcript">
          <div className="pp-system">
            {isChat ? 'Conversation started' : `Call started • ${callStartTime}`}
          </div>
          {messages
            .filter(m => m.role !== 'system')
            .map(m => {
              if (m.role === 'system') return null;
              if (m.role === 'agent') {
                return (
                  <div key={m.id} className="pp-agent-row">
                    <div className="pp-agent-avatar">
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <p className="pp-agent-text">{m.text}</p>
                  </div>
                );
              }
              return (
                <div key={m.id} className="pp-user-row">
                  <p className="pp-user-bubble">{m.text}</p>
                </div>
              );
            })
          }
          <div className="pp-system">{isChat ? 'You ended the chat' : 'You ended the call'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Sound-wave bars (5 bars) ───────────────────────────────── */
function SoundWave({ active }) {
  return (
    <div className={`pp-wave${active ? ' pp-wave--active' : ''}`} aria-hidden>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`pp-wave__bar pp-wave__bar--${i}`} />
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
let _id = 0;
const uid = () => { _id += 1; return _id; };

function TranscriptMessages({ messages, interim }) {
  return (
    <>
      {messages.map(m => {
        if (m.role === 'system') {
          return <div key={m.id} className="pp-system">{m.text}</div>;
        }
        if (m.role === 'agent') {
          return (
            <div key={m.id} className="pp-agent-row">
              <div className="pp-agent-avatar">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <p className="pp-agent-text">{m.text || <span className="pp-cursor" />}</p>
            </div>
          );
        }
        return (
          <div key={m.id} className="pp-user-row">
            <p className="pp-user-bubble">{m.text}</p>
          </div>
        );
      })}
      {interim && (
        <div className="pp-user-row">
          <p className="pp-user-bubble pp-user-bubble--interim">{interim}</p>
        </div>
      )}
    </>
  );
}

export default function PreviewPanel({ onClose, onPreviewActiveChange }) {
  const [panelView, setPanelView]   = useState('preview'); // preview | logs | details
  const [phase, setPhase]         = useState('idle');   // idle | dialing | active | ended
  const [mode, setMode]           = useState('none');   // none | voice | chat
  const [dialStatus, setDialStatus] = useState('');
  const [messages, setMessages]   = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [interim, setInterim]     = useState('');
  const [muted, setMuted]         = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [agentTalking, setAgentTalking] = useState(false);

  const recognizerRef = useRef(null);
  const streamRef     = useRef(null);
  const speakerRef    = useRef(speakerOff);
  const modeRef       = useRef(mode);
  const bottomRef     = useRef(null);

  useEffect(() => { speakerRef.current = speakerOff; }, [speakerOff]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Auto-scroll transcript
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interim]);

  // Cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    recognizerRef.current?.abort();
    clearInterval(streamRef.current);
    onPreviewActiveChange?.(false);
  }, [onPreviewActiveChange]);

  // Notify canvas when preview run is active (session in progress or logs visible)
  useEffect(() => {
    const active = phase === 'dialing' || phase === 'active' || panelView === 'logs';
    onPreviewActiveChange?.(active);
  }, [phase, panelView, onPreviewActiveChange]);

  const shouldSpeak = useCallback(() => modeRef.current === 'voice', []);

  /* Stream agent words into transcript; TTS only for voice */
  const agentSay = useCallback((text, onDone) => {
    const speak = shouldSpeak();
    setAgentTalking(true);
    const id = uid();
    setMessages(prev => [...prev, { id, role: 'agent', text: '' }]);

    const words = text.split(' ');
    let i = 0;
    clearInterval(streamRef.current);

    if (speak) {
      speakText(text, () => {
        setAgentTalking(false);
        onDone?.();
      }, speakerRef.current);
    }

    streamRef.current = setInterval(() => {
      i++;
      const partial = words.slice(0, i).join(' ');
      setMessages(prev => prev.map(m => m.id === id ? { ...m, text: partial } : m));
      if (i >= words.length) {
        clearInterval(streamRef.current);
        if (!speak) {
          setAgentTalking(false);
          setTimeout(onDone, 300);
        } else if (speakerRef.current) {
          setAgentTalking(false);
          setTimeout(onDone, 300);
        }
      }
    }, speak ? 72 : 42);
  }, [shouldSpeak]);

  /* Play the demo script turn by turn after greeting */
  const demoScriptRef = useRef(false);

  const playDemoScript = useCallback((turns) => {
    demoScriptRef.current = true;
    let i = 0;

    function next() {
      if (!demoScriptRef.current || i >= turns.length) return;
      const turn = turns[i++];

      if (turn.role === 'user') {
        // Show user bubble after a realistic pause
        setTimeout(() => {
          setMessages(prev => [...prev, { id: uid(), role: 'user', text: turn.text }]);
          // Short pause before agent responds
          setTimeout(next, 600);
        }, 900);
      } else {
        // Agent streams + speaks, then advance
        setTimeout(() => {
          agentSay(turn.text, () => {
            setTimeout(next, 700);
          });
        }, 400);
      }
    }

    next();
  }, [agentSay]);

  /* Dial → ring → connect */
  const handleStartCall = useCallback(() => {
    demoScriptRef.current = false;
    setMode('voice');
    modeRef.current = 'voice';
    setChatInput('');
    setPhase('dialing');
    setDialStatus('Connecting...');
    setMessages([]);

    setTimeout(() => setDialStatus('Ringing...'), 1200);
    setTimeout(() => {
      setPhase('active');
      setDialStatus('');
      setMessages([{ id: uid(), role: 'system', text: 'Call started' }]);
      agentSay(GREETING, () => playDemoScript(DEMO_SCRIPT));
    }, 2800);
  }, [agentSay, playDemoScript]);

  /* Start web chat from first sent message */
  const handleSendMessage = useCallback(() => {
    const text = chatInput.trim();
    if (!text || agentTalking) return;

    if (phase === 'idle') {
      demoScriptRef.current = false;
      setMode('chat');
      modeRef.current = 'chat';
      setPhase('active');
      setMessages([
        { id: uid(), role: 'system', text: 'Conversation started' },
        { id: uid(), role: 'user', text },
      ]);
      setChatInput('');
      agentSay(GREETING, () => playDemoScript(DEMO_SCRIPT));
      return;
    }

    if (phase === 'active' && mode === 'chat') {
      setMessages(prev => [...prev, { id: uid(), role: 'user', text }]);
      setChatInput('');
    }
  }, [chatInput, agentTalking, phase, mode, agentSay, playDemoScript]);

  const stopSession = useCallback((endedLabel) => {
    demoScriptRef.current = false;
    window.speechSynthesis?.cancel();
    recognizerRef.current?.abort();
    clearInterval(streamRef.current);
    setInterim('');
    setAgentTalking(false);
    setDialStatus('');
    setChatInput('');
    setPhase('ended');
    setMessages(prev => [...prev, { id: uid(), role: 'system', text: endedLabel }]);
  }, []);

  /* Hang up voice call */
  const handleEndCall = useCallback(() => {
    stopSession('You ended the call');
  }, [stopSession]);

  /* Stop web chat */
  const handleStopChat = useCallback(() => {
    stopSession('You ended the chat');
  }, [stopSession]);

  /* Reset fully to idle */
  const handleReset = useCallback(() => {
    demoScriptRef.current = false;
    window.speechSynthesis?.cancel();
    clearInterval(streamRef.current);
    setPhase('idle');
    setMode('none');
    modeRef.current = 'none';
    setMessages([]);
    setChatInput('');
    setInterim('');
    setAgentTalking(false);
    setDialStatus('');
  }, []);

  const showLogs = panelView === 'logs';
  const logsLinkDisabled = !showLogs && phase === 'idle';

  const handleToggleView = useCallback(() => {
    if (logsLinkDisabled) return;
    if (showLogs) {
      handleReset();
      setPanelView('preview');
    } else {
      setPanelView('logs');
    }
  }, [showLogs, logsLinkDisabled, handleReset]);

  const handleClose = useCallback(() => {
    handleReset();
    setPanelView('preview');
    onClose?.();
  }, [handleReset, onClose]);

  const showChatFooter = !showLogs && (phase === 'idle' || mode === 'chat');
  const chatInputActive = phase === 'active' && mode === 'chat';
  const chatInputDisabled = phase === 'ended' || agentTalking;

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <>
      {/* Details overlay drawer — portal to body so it covers the full viewport */}
      {panelView === 'details' && createPortal(
        <div className="pp-details-overlay" onClick={() => setPanelView('preview')}>
          <div
            className="pp-details-drawer"
            onClick={e => e.stopPropagation()}
          >
            <CallDetailsView
              messages={messages}
              mode={mode}
              onBack={() => setPanelView('preview')}
            />
          </div>
        </div>,
        document.body
      )}

    <div className="preview-panel">

      <PreviewSidePanelHeader
        panel={showLogs ? 'logs' : 'preview'}
        onToggle={handleToggleView}
        showClose
        onClose={handleClose}
        logsLinkDisabled={logsLinkDisabled}
      />

      {/* Body */}
      <div className="preview-panel__body">

        {showLogs ? (
          <PreviewLogsView />
        ) : phase === 'idle' && (
          <div className="preview-panel__idle">
            <div className="preview-panel__gradient-bg" />
            <button className="preview-panel__call-btn" type="button" onClick={handleStartCall} aria-label="Start a call">
              <span className="material-symbols-outlined">call</span>
            </button>
            <span className="preview-panel__call-label">Start a call</span>
          </div>
        )}

        {/* ── DIALING ── */}
        {!showLogs && phase === 'dialing' && (
          <div className="preview-panel__dialing">
            <div className="preview-panel__gradient-bg" />
            <p className="preview-panel__dial-status">{dialStatus}</p>
            <SoundWave active={false} />
            <div className="preview-panel__call-controls">
              <button className="preview-panel__ctrl-btn" type="button" disabled aria-label="Mute">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button className="preview-panel__end-call-btn" type="button" onClick={handleEndCall} aria-label="End call">
                <span className="material-symbols-outlined">call_end</span>
              </button>
              <button className="preview-panel__ctrl-btn" type="button" disabled aria-label="Speaker">
                <span className="material-symbols-outlined">volume_up</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVE CHAT ── */}
        {!showLogs && phase === 'active' && mode === 'chat' && (
          <div className="preview-panel__active preview-panel__active--chat">
            <div className="preview-panel__transcript">
              <TranscriptMessages messages={messages} interim={interim} />
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {/* ── ACTIVE CALL ── */}
        {!showLogs && phase === 'active' && mode === 'voice' && (
          <div className="preview-panel__active">

            {/* Transcript */}
            <div className="preview-panel__transcript">
              <TranscriptMessages messages={messages} interim={interim} />
              <div ref={bottomRef} />
            </div>

            {/* Controls */}
            <div className="preview-panel__call-controls">
              <button
                className={`preview-panel__ctrl-btn${muted ? ' preview-panel__ctrl-btn--on' : ''}`}
                type="button"
                onClick={() => setMuted(v => !v)}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                <span className="material-symbols-outlined">{muted ? 'mic_off' : 'mic'}</span>
              </button>

              <button className="preview-panel__end-call-btn" type="button" onClick={handleEndCall} aria-label="End call">
                <span className="material-symbols-outlined">call_end</span>
              </button>

              <button
                className={`preview-panel__ctrl-btn${speakerOff ? ' preview-panel__ctrl-btn--on' : ''}`}
                type="button"
                onClick={() => {
                  setSpeakerOff(v => !v);
                  if (!speakerOff) window.speechSynthesis?.cancel();
                }}
                aria-label="Speaker"
              >
                <span className="material-symbols-outlined">{speakerOff ? 'volume_off' : 'volume_up'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── ENDED ── */}
        {!showLogs && phase === 'ended' && (
          <div className="preview-panel__active preview-panel__active--chat">
            <div className="preview-panel__transcript">
              <TranscriptMessages messages={messages} interim={interim} />
              <div ref={bottomRef} />
            </div>

            <div className="preview-panel__ended-actions">
              <button
                className="preview-panel__restart-btn"
                type="button"
                onClick={mode === 'chat' ? handleReset : handleStartCall}
              >
                {mode === 'chat' ? 'Start a chat' : 'Start a call'}
              </button>
              <button className="preview-panel__details-btn" type="button" onClick={() => setPanelView('details')}>
                View details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer — web chat input */}
      {showChatFooter && (
        <div className="preview-panel__footer">
          <div className={`preview-panel__input-wrap${chatInputActive ? ' preview-panel__input-wrap--active' : ''}`}>
            <textarea
              className="preview-panel__input"
              placeholder={phase === 'idle' ? 'Send a message to start a chat' : 'Enter'}
              rows={3}
              value={chatInput}
              disabled={chatInputDisabled}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="preview-panel__input-actions">
              {chatInputActive && (
                <button
                  className="preview-panel__stop-btn"
                  type="button"
                  onClick={handleStopChat}
                  aria-label="Stop chat"
                >
                  <span className="material-symbols-outlined">stop_circle</span>
                </button>
              )}
              <button
                className={`preview-panel__send-btn${chatInput.trim() && !chatInputDisabled ? ' preview-panel__send-btn--active' : ''}`}
                type="button"
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || chatInputDisabled}
                aria-label="Send"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
