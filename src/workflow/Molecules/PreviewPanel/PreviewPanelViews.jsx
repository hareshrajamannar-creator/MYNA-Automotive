import React, { useState } from 'react';
import { ProcedureIcon, TriggerIcon } from '../Canvas/CanvasNodeIcons';
import './PreviewPanel.css';

export const PREVIEW_GREETING =
  'Thank you for calling Rock Dental Brands, my name is Myna, your virtual assistant. How can I help you today?';

export const PREVIEW_DEMO_SCRIPT = [
  { role: 'user', text: 'I am having a very bad headache. I think it is migraine.' },
  {
    role: 'agent',
    text: "I'm really sorry you're dealing with that — a bad headache is no fun. Just so I point you in the right direction: is the pain coming from your teeth, jaw, or gums, or is it more of a general head pain?",
  },
  { role: 'user', text: 'Now that you ask — it kind of started near my back tooth and spread up.' },
  {
    role: 'agent',
    text: 'Thank you, that helps. Pain that radiates from a tooth can sometimes need prompt attention. Are you having any swelling in your face or jaw, fever, or trouble swallowing or breathing?',
  },
  { role: 'user', text: 'A little swelling near the tooth, no fever' },
];

export const PREVIEW_LOG_SECTIONS = [
  {
    id: 'trigger',
    kind: 'trigger',
    stepLabel: '2. Conversation trigger',
    outputSections: [
      {
        id: 'to1',
        label: 'Trigger output',
        rows: [
          { label: 'Source', value: 'Voice call' },
          { label: 'Comments', value: 'Patient called reporting tooth pain and mild swelling scheduled appointment' },
        ],
        children: [
          {
            id: 'reviewer',
            label: 'Reviewer',
            badge: '1 property',
            rows: [{ label: 'Name', value: 'Sarah Jones' }],
          },
        ],
        extraRows: [
          { label: 'Source type', value: 'Voice call' },
          { label: 'Has comment', value: 'True' },
        ],
      },
    ],
  },
  {
    id: 'procedures',
    kind: 'procedures',
    stepLabel: '2. Follow procedures',
    outputSections: [
      {
        id: 'to2',
        label: 'Trigger output',
        rows: [
          { label: 'Source', value: 'Voice call' },
          { label: 'Procedure triggered', value: 'Emergency or urgent concern' },
          {
            label: 'Summary',
            value:
              'Patient reported tooth-origin pain with mild swelling (no fever or breathing issues). Myna screened symptoms and offered an urgent appointment, but the patient ended the call.',
          },
        ],
        children: [],
        extraRows: [],
      },
    ],
  },
];

export function buildStaticPreviewMessages({
  startedLabel = 'Conversation started',
  endedLabel = 'You ended the chat',
} = {}) {
  return [
    { id: 'start', role: 'system', text: startedLabel },
    { id: 'greeting', role: 'agent', text: PREVIEW_GREETING },
    ...PREVIEW_DEMO_SCRIPT.map((m, i) => ({ id: `turn-${i}`, role: m.role, text: m.text })),
    { id: 'end', role: 'system', text: endedLabel },
  ];
}

function LogKindIcon({ kind }) {
  return (
    <span className="preview-panel__log-kind-icon">
      {kind === 'trigger' ? <TriggerIcon /> : <ProcedureIcon />}
    </span>
  );
}

function PreviewLogSection({ section, isLast }) {
  const [stepOpen, setStepOpen] = useState(true);
  const [outputOpen, setOutputOpen] = useState(true);
  const [childOpen, setChildOpen] = useState({ reviewer: true });
  const kindLabel = section.kind === 'trigger' ? 'Trigger' : 'Procedures';

  return (
    <div className={`preview-panel__log-section${isLast ? ' preview-panel__log-section--last' : ''}`}>
      <div className="preview-panel__log-track">
        <div className="preview-panel__log-status" aria-hidden>
          <span className="material-symbols-outlined">check</span>
        </div>
      </div>

      <div className="preview-panel__log-content">
        <div className="preview-panel__log-kind">
          <LogKindIcon kind={section.kind} />
          <span className="preview-panel__log-kind-label">{kindLabel}</span>
        </div>

        <button
          type="button"
          className="preview-panel__log-step"
          onClick={() => setStepOpen((v) => !v)}
        >
          <span className="preview-panel__log-step-label">{section.stepLabel}</span>
          <span className="material-symbols-outlined">
            {stepOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {stepOpen && section.outputSections.map((out) => (
          <div key={out.id} className="preview-panel__log-output">
            <button
              type="button"
              className="preview-panel__log-output-toggle preview-panel__log-output-toggle--primary"
              onClick={() => setOutputOpen((v) => !v)}
            >
              <span className="material-symbols-outlined">
                {outputOpen ? 'expand_more' : 'chevron_right'}
              </span>
              <span>{out.label}</span>
            </button>

            {outputOpen && (
              <div className="preview-panel__log-rows">
                {out.rows.map((r) => (
                  <div key={r.label} className="preview-panel__log-row">
                    <span className="preview-panel__log-row-label">{r.label}</span>
                    <span className="preview-panel__log-row-value">{r.value}</span>
                  </div>
                ))}

                {out.children.map((child) => (
                  <div key={child.id} className="preview-panel__log-child">
                    <button
                      type="button"
                      className="preview-panel__log-output-toggle preview-panel__log-output-toggle--child"
                      onClick={() =>
                        setChildOpen((prev) => ({ ...prev, [child.id]: !prev[child.id] }))
                      }
                    >
                      <span className="material-symbols-outlined">
                        {childOpen[child.id] ? 'expand_more' : 'chevron_right'}
                      </span>
                      <span className="preview-panel__log-child-label">
                        {child.label}
                        {child.badge && (
                          <span className="preview-panel__log-badge">{`{ ${child.badge} }`}</span>
                        )}
                      </span>
                    </button>
                    {childOpen[child.id] && (
                      <div className="preview-panel__log-child-rows">
                        {child.rows.map((r) => (
                          <div key={r.label} className="preview-panel__log-row">
                            <span className="preview-panel__log-row-label">{r.label}</span>
                            <span className="preview-panel__log-row-value">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {out.extraRows.map((r) => (
                  <div key={r.label} className="preview-panel__log-row">
                    <span className="preview-panel__log-row-label">{r.label}</span>
                    <span className="preview-panel__log-row-value">{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewLogsView({ sections = PREVIEW_LOG_SECTIONS }) {
  return (
    <div className="preview-panel__logs">
      {sections.map((section, index) => (
        <PreviewLogSection
          key={section.id}
          section={section}
          isLast={index === sections.length - 1}
        />
      ))}
    </div>
  );
}

export function PreviewStaticTranscript({ messages }) {
  return (
    <div className="preview-panel__active preview-panel__active--chat">
      <div className="preview-panel__transcript">
        {messages.map((m) => {
          if (m.role === 'system') {
            return <div key={m.id} className="pp-system">{m.text}</div>;
          }
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
        })}
      </div>
    </div>
  );
}

export function PreviewSidePanelHeader({
  panel,
  onToggle,
  showClose = false,
  onClose = () => {},
  logsLinkDisabled = false,
}) {
  const showLogs = panel === 'logs';

  return (
    <div className="preview-panel__header">
      <span className="preview-panel__title">{showLogs ? 'Logs' : 'Preview'}</span>
      <div className="preview-panel__header-actions">
        <button
          type="button"
          className={`preview-panel__logs-link${logsLinkDisabled ? ' preview-panel__logs-link--disabled' : ''}`}
          onClick={onToggle}
          disabled={logsLinkDisabled}
        >
          {showLogs ? 'View preview' : 'View logs'}
        </button>
        {showClose && (
          <button
            type="button"
            className="preview-panel__close-btn"
            onClick={onClose}
            aria-label="Close preview"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
    </div>
  );
}
