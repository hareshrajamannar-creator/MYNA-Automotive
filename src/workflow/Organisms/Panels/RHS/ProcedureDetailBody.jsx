import React, { useState, useRef, useEffect, useCallback } from 'react';
import { serializeFrom, deserializeIntoTyped } from '../../../Molecules/Inputs/promptChipHelpers.js';
import VariableChip, { CHIP_TYPES, DataTypeIcon, ProcedureBookIcon } from '../../../Molecules/Inputs/VariableChip/VariableChip';
import chipStyles from '../../../Molecules/Inputs/VariableChip/VariableChip.module.css';
import etStyles from './EntityTaskBody.module.css';
import llmStyles from './LLMTaskBody.module.css';
import styles from './ProcedureDetailBody.module.css';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ── Token → chip type resolver ── */
// Known token names → VariableChip type suffix (matches chipStyles class names).
// 'variable' = default (blue bracket DataTypeIcon, no suffix).
const KNOWN_TOKENS = {
  'agent_turn':                  'tool',
  'Escalate_to_staff':           'tool',
  'escalate_to_staff':           'tool',
  'End conversation':            'product',   // procedure
  'Close_session':               'product',   // procedure
  'close_session':               'product',
  'Talk to Human':               'product',   // procedure
  'Appointment_Management_agent':'address',   // subagent
  'appointment_management_agent':'address',
};

function resolveTokenType(label) {
  if (KNOWN_TOKENS[label]) return KNOWN_TOKENS[label];
  // Heuristic: lowercase_underscore names → tool; ends in _agent → subagent
  if (/_agent$/i.test(label)) return 'address';
  if (/^[a-z][a-z0-9_]+$/.test(label)) return 'tool';
  // Contains '=' → field/variable
  if (label.includes('=')) return 'variable';
  // Default → variable (blue bracket)
  return 'variable';
}

/* ── Inline chip renderer — uses exact VariableChip.module.css classes ── */
function InlineChip({ label }) {
  const type = resolveTokenType(label);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const chipClass = [chipStyles.chip, type !== 'variable' && chipStyles[`chip${cap(type)}`]]
    .filter(Boolean).join(' ');
  const swatchClass = [chipStyles.chipSwatch, type === 'tool' ? chipStyles.swatchTool : type !== 'variable' && chipStyles[`swatch${cap(type)}`]]
    .filter(Boolean).join(' ');

  return (
    <span className={chipClass} style={{ verticalAlign: 'middle', display: 'inline-flex', margin: '0 2px' }}>
      <span className={swatchClass}>
        {type === 'variable' && <DataTypeIcon />}
        {type === 'tool' && <span className={`material-symbols-outlined ${chipStyles.iconTool}`}>build</span>}
        {type === 'address' && <span className={`material-symbols-outlined ${chipStyles.iconAddress}`}>smart_toy</span>}
        {type === 'product' && <ProcedureBookIcon />}
        {type === 'attachment' && <span className={`material-symbols-outlined ${chipStyles.iconAttachment}`}>attach_file</span>}
        {type === 'link' && <span className={`material-symbols-outlined ${chipStyles.iconLink}`}>link</span>}
      </span>
      <span className={`${chipStyles.chipLabel} ${chipStyles.chipLabelReadOnly}`}>{label}</span>
    </span>
  );
}

/* ── Inline chip token parser (handles {{label}} in step text) ── */
function renderInlineText(text) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{\{(.+)\}\}$/);
    if (match) return <InlineChip key={i} label={match[1]} />;
    return part || null;
  });
}

/* ── Steps text → structured array ── */
function parseStepsText(text) {
  if (!text?.trim()) return [];
  const lines = text.split('\n');
  const steps = [];
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const numbered = line.match(/^(\d+)\.\s+(.+)/);
    if (numbered) {
      current = { number: parseInt(numbered[1], 10), title: numbered[2], bullets: [] };
      steps.push(current);
    } else if ((line.startsWith('•') || line.startsWith('-')) && current) {
      current.bullets.push(line.replace(/^[•\-]\s*/, ''));
    } else if (current) {
      current.bullets.push(line);
    } else {
      steps.push({ number: null, title: line, bullets: [] });
    }
  }
  return steps;
}

/* ── Single contenteditable line with inline {{chip}} rendering ── */
function EditableLine({ text, className, onInput }) {
  const ref = useRef(null);
  const lastSynced = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (text === lastSynced.current) return;
    lastSynced.current = text;
    deserializeIntoTyped(el, text, () => {
      const s = serializeFrom(el);
      lastSynced.current = s;
      onInput(s);
    }, resolveTokenType);
  }, [text, onInput]);

  return (
    <span
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      onInput={() => {
        const s = serializeFrom(ref.current);
        lastSynced.current = s;
        onInput(s);
      }}
    />
  );
}

function serializeStepsList(rootEl) {
  if (!rootEl) return '';
  const lines = [];
  rootEl.querySelectorAll('[data-step-block]').forEach((stepEl) => {
    const num = stepEl.getAttribute('data-step-num') || '1';
    // Use data-step-title / data-step-bullet wrappers; fall back to ordered
    // contenteditable scan for resilience (title = first, bullets = rest).
    const titleWrapper = stepEl.querySelector('[data-step-title]');
    const titleEl = titleWrapper
      ? titleWrapper.querySelector('[contenteditable]:not([contenteditable="false"])')
      : Array.from(stepEl.querySelectorAll('[contenteditable]:not([contenteditable="false"])'))[0];
    if (titleEl) lines.push(`${num}. ${serializeFrom(titleEl)}`);

    const bulletWrappers = stepEl.querySelectorAll('[data-step-bullet]');
    if (bulletWrappers.length) {
      bulletWrappers.forEach((bw) => {
        const bulletEl = bw.querySelector('[contenteditable]:not([contenteditable="false"])');
        if (bulletEl) lines.push(`• ${serializeFrom(bulletEl)}`);
      });
    } else {
      // Fallback: all editables after the first are bullets
      const all = Array.from(stepEl.querySelectorAll('[contenteditable]:not([contenteditable="false"])'));
      all.slice(1).forEach((el) => lines.push(`• ${serializeFrom(el)}`));
    }
  });
  return lines.join('\n');
}

/* ── Editable steps — identical layout to StepsRenderer ── */
function EditableStepsRenderer({ text, onChange }) {
  const rootRef = useRef(null);
  const lastEmitted = useRef(text);
  const steps = parseStepsText(text);

  useEffect(() => {
    lastEmitted.current = text;
  }, [text]);

  const emitChange = useCallback(() => {
    const next = rootRef.current ? serializeStepsList(rootRef.current) : text;
    if (next !== lastEmitted.current) {
      lastEmitted.current = next;
      onChange(next);
    }
  }, [onChange, text]);

  const STEPS_EMPTY_HINT = 'Start writing instructions…\nType "/" to insert a tool, field, or procedure.';

  if (!steps.length) {
    return (
      <div className={`${styles.stepsList} ${styles.stepsListWithHint}`} ref={rootRef}>
        {!text.trim() && (
          <div className={styles.stepsEmptyHint} aria-hidden>
            {STEPS_EMPTY_HINT}
          </div>
        )}
        <EditableLine
          text={text}
          className={styles.stepsEmptyEditable}
          onInput={(lineText) => {
            lastEmitted.current = lineText;
            onChange(lineText);
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.stepsList} ref={rootRef}>
      {steps.map((step, i) => (
        <div
          key={i}
          className={styles.step}
          data-step-block
          data-step-num={step.number ?? i + 1}
        >
          <div className={styles.stepTitleRow} data-step-title>
            {step.number !== null && (
              <span className={styles.stepBadge}>{step.number}</span>
            )}
            <EditableLine
              text={step.title}
              className={styles.stepTitleText}
              onInput={emitChange}
            />
          </div>
          {step.bullets.length > 0 && (
            <div className={styles.stepBullets}>
              {step.bullets.map((b, j) => (
                <div key={j} className={styles.stepBulletRow} data-step-bullet>
                  <span className={styles.stepBulletDot}>•</span>
                  <EditableLine
                    text={b}
                    className={styles.stepBulletText}
                    onInput={emitChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Formatted read-only steps display ── */
function StepsRenderer({ text }) {
  const steps = parseStepsText(text);
  if (!steps.length) {
    return <p className={styles.stepsEmpty}>No steps defined.</p>;
  }
  return (
    <div className={styles.stepsList}>
      {steps.map((step, i) => (
        <div key={i} className={styles.step}>
          <div className={styles.stepTitleRow}>
            {step.number !== null && (
              <span className={styles.stepBadge}>{step.number}</span>
            )}
            <span className={styles.stepTitleText}>{renderInlineText(step.title)}</span>
          </div>
          {step.bullets.length > 0 && (
            <div className={styles.stepBullets}>
              {step.bullets.map((b, j) => (
                <div key={j} className={styles.stepBulletRow}>
                  <span className={styles.stepBulletDot}>•</span>
                  <span>{renderInlineText(b)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const normalizeChips = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) =>
    typeof item === 'string' ? { value: item, type: 'variable' } : item
  );
};

function ChipContainer({ chips, onChipChange, onChipDelete, addingNew, onStartAdd, onCancelAdd, onCommitAdd, onChangeChipType, defaultType = 'variable', viewOnly, moreCount = 0, matchViewLayout = false, chipsReadOnly = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const [pendingType, setPendingType] = useState(defaultType);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const openForAdd = () => { setPickerFor('add'); setPickerOpen(true); };
  const openForChip = (i) => { setPickerFor(i); setPickerOpen(true); };
  const selectType = (type) => {
    setPickerOpen(false);
    if (pickerFor === 'add') { setPendingType(type); onStartAdd(); }
    else if (typeof pickerFor === 'number') { onChangeChipType(pickerFor, type); }
    setPickerFor(null);
  };

  const hasChips = chips.length > 0 || addingNew;

  return (
    <div className={llmStyles.chipContainer}>
      {hasChips && (
        <div className={llmStyles.chipWrap}>
          {chips.map((chip, i) => (
            <VariableChip
              key={i}
              value={chip.value}
              type={chip.type}
              readOnly={chipsReadOnly}
              onChange={chipsReadOnly || viewOnly ? undefined : (v) => onChipChange(i, v)}
              onDelete={viewOnly ? undefined : () => onChipDelete(i)}
              onSwatchClick={chipsReadOnly || viewOnly ? undefined : () => openForChip(i)}
            />
          ))}
          {addingNew && (
            <VariableChip
              value=""
              type={pendingType}
              autoFocus
              onChange={(v) => onCommitAdd(v, pendingType)}
              onDelete={onCancelAdd}
            />
          )}
        </div>
      )}
      {moreCount > 0 && (
        <span className={styles.moreContext}>+ {moreCount} more</span>
      )}
      {!viewOnly && !matchViewLayout && (
        <div className={llmStyles.addRow} ref={pickerRef}>
          <button className={llmStyles.addBtn} type="button" onClick={openForAdd}>
            <span className="material-symbols-outlined">add_circle</span>
            <span className={llmStyles.addBtnLabel}>Add</span>
          </button>
          {pickerOpen && (
            <div className={llmStyles.typePicker}>
              {CHIP_TYPES.map((ct) => (
                <button
                  key={ct.type}
                  className={llmStyles.typePickerItem}
                  type="button"
                  onClick={() => selectType(ct.type)}
                >
                  <span className={`${llmStyles.typePickerSwatch} ${llmStyles[`tpSwatch${cap(ct.type)}`] || ''}`}>
                    {ct.icon
                      ? <span className={`material-symbols-outlined ${llmStyles[`tpIcon${cap(ct.type)}`] || ''}`}>{ct.icon}</span>
                      : <DataTypeIcon />}
                  </span>
                  <span className={llmStyles.typePickerLabel}>{ct.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChipSection({ label, chips, onChange, defaultType = 'variable', viewOnly, moreCount = 0, matchViewLayout = false, chipsReadOnly = false }) {
  const [adding, setAdding] = useState(false);

  const commitAdd = (v, type) => { onChange([...chips, { value: v, type }]); setAdding(false); };
  const changeChip = (i, v) => { const n = [...chips]; n[i] = { ...n[i], value: v }; onChange(n); };
  const deleteChip = (i) => onChange(chips.filter((_, idx) => idx !== i));
  const changeType = (i, type) => { const n = [...chips]; n[i] = { ...n[i], type }; onChange(n); };

  return (
    <div className={styles.section}>
      <div className={etStyles.sectionLabelWrapper}>
        <span className={etStyles.sectionLabelText}>{label}</span>
        <span className={`material-symbols-outlined ${etStyles.sectionLabelIcon}`}>info</span>
      </div>
      <ChipContainer
        chips={chips}
        onChipChange={changeChip}
        onChipDelete={deleteChip}
        addingNew={adding}
        onStartAdd={() => setAdding(true)}
        onCancelAdd={() => setAdding(false)}
        onCommitAdd={commitAdd}
        onChangeChipType={changeType}
        defaultType={defaultType}
        viewOnly={viewOnly}
        moreCount={moreCount}
        matchViewLayout={matchViewLayout}
        chipsReadOnly={chipsReadOnly}
      />
    </div>
  );
}

const TITLE_PLACEHOLDER = 'Enter';
const WHEN_CREATE_PLACEHOLDER = `Describe the trigger that should activate this procedure.

Examples:
• Customer wants to reschedule an appointment
• User reports a payment issue
• Patient asks about medication instructions`;

export default function ProcedureDetailBody({
  initialValues = {},
  onFieldChange,
  viewOnly = false,
  showTitle = false,
  showLibraryCheckbox = false,
  contextEditable = false,
}) {
  const [title, setTitle] = useState(initialValues.name ?? '');
  const [whenToUse, setWhenToUse] = useState(initialValues.whenToUse ?? '');
  const [contextChips, setContextChips] = useState(normalizeChips(initialValues.contextChips ?? []));
  const [stepsText, setStepsText] = useState(initialValues.stepsText ?? '');
  const [addToLibrary, setAddToLibrary] = useState(initialValues.addToLibrary ?? false);
  const moreContextCount = initialValues.moreContextCount ?? 0;

  useEffect(() => {
    setTitle(initialValues.name ?? '');
    setWhenToUse(initialValues.whenToUse ?? '');
    setContextChips(normalizeChips(initialValues.contextChips ?? []));
    setStepsText(initialValues.stepsText ?? '');
    setAddToLibrary(initialValues.addToLibrary ?? false);
  }, [initialValues.name, initialValues.whenToUse, initialValues.contextChips, initialValues.stepsText, initialValues.addToLibrary, initialValues.id]);

  return (
    <div
      className={styles.body}
      style={viewOnly ? { pointerEvents: 'auto' } : undefined}
    >
      {showTitle && (
        <div className={styles.section}>
          <div className={etStyles.sectionLabelWrapper}>
            <span className={etStyles.sectionLabelText}>Procedure title</span>
          </div>
          <div className={styles.fieldWithHint}>
            {!viewOnly && !title.trim() && (
              <div className={styles.fieldHint} aria-hidden>
                {TITLE_PLACEHOLDER}
              </div>
            )}
            <input
              type="text"
              className={styles.whenToUseInput}
              value={title}
              readOnly={viewOnly}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                onFieldChange?.('name', val);
              }}
            />
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>
            When to use this procedure?<span className={styles.required}> *</span>
          </span>
        </div>
        <div className={styles.fieldWithHint}>
          {!viewOnly && !whenToUse.trim() && (
            <div className={`${styles.fieldHint} ${showTitle ? styles.fieldHintMultiline : ''}`} aria-hidden>
              {showTitle ? WHEN_CREATE_PLACEHOLDER : 'Describe when this procedure should be triggered...'}
            </div>
          )}
          {showTitle ? (
            <textarea
              className={`${styles.whenToUseInput} ${styles.whenToUseTextarea}`}
              value={whenToUse}
              readOnly={viewOnly}
              rows={5}
              onChange={(e) => {
                const val = e.target.value;
                setWhenToUse(val);
                onFieldChange?.('whenToUse', val);
              }}
            />
          ) : (
            <input
              type="text"
              className={styles.whenToUseInput}
              value={whenToUse}
              readOnly={viewOnly}
              onChange={(e) => {
                const val = e.target.value;
                setWhenToUse(val);
                onFieldChange?.('whenToUse', val);
              }}
            />
          )}
        </div>
      </div>

      <ChipSection
        label="Context"
        chips={contextChips}
        onChange={(next) => { setContextChips(next); onFieldChange?.('contextChips', next); }}
        defaultType="variable"
        viewOnly={viewOnly}
        moreCount={moreContextCount}
        matchViewLayout={contextEditable || !viewOnly}
        chipsReadOnly={!contextEditable}
      />

      <div className={styles.section}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>Steps</span>
          <span className={`material-symbols-outlined ${etStyles.sectionLabelIcon}`}>info</span>
        </div>
        {viewOnly ? (
          <StepsRenderer text={stepsText} />
        ) : (
          <EditableStepsRenderer
            text={stepsText}
            onChange={(val) => { setStepsText(val); onFieldChange?.('stepsText', val); }}
          />
        )}
      </div>

      {showLibraryCheckbox && !viewOnly && (
        <label className={styles.libraryCheckbox}>
          <input
            type="checkbox"
            checked={addToLibrary}
            onChange={(e) => {
              setAddToLibrary(e.target.checked);
              onFieldChange?.('addToLibrary', e.target.checked);
            }}
          />
          <span>Add this procedure to the library</span>
        </label>
      )}
    </div>
  );
}
