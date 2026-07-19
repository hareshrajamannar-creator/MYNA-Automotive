import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { EmptyHintField } from '../../../../components/EmptyHintField/EmptyHintField';
import { Icon } from '../../../../components/Icon/Icon';
import { serializeFrom, deserializeIntoTyped } from '../../../Molecules/Inputs/promptChipHelpers.js';
import '../../../Molecules/Inputs/prompt-chip.css';
import StepsEditorToolbar from '../../../Molecules/Inputs/StepsEditorToolbar/StepsEditorToolbar.jsx';
import UserPromptInput from '../../../Molecules/Inputs/UserPromptInput/UserPromptInput.jsx';
import VariableChip, { CHIP_TYPES, DataTypeIcon, ProcedureBookIcon } from '../../../Molecules/Inputs/VariableChip/VariableChip';
import chipStyles from '../../../Molecules/Inputs/VariableChip/VariableChip.module.css';
import etStyles from './EntityTaskBody.module.css';
import llmStyles from './LLMTaskBody.module.css';
import styles from './ProcedureDetailBody.module.css';

const FIELD_SHELL = 'rounded-sm border border-border-input bg-surface transition-colors hover:border-border focus-within:!border-primary';
const TITLE_SHELL = `h-10 ${FIELD_SHELL}`;
const STEPS_CREATE_PLACEHOLDER = 'Start writing steps. Type / to insert a tool, or add fields and procedures.';
const STEPS_CREATE_MIN_HEIGHT = 214;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ── Token → chip type resolver ── */
// Known token names → VariableChip type suffix (matches chipStyles class names).
// 'variable' = default (blue bracket DataTypeIcon, no suffix).
const KNOWN_TOKENS = {
  'agent_turn':                  'tool',
  'Intent identifier':           'tool',
  'Transfer_call':               'tool',
  'Initiate voice call':         'tool',
  'End_conversation':            'tool',
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

/* ── Hover tooltip for section-label info icons ── */
function SectionInfoIcon({ tooltip }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  function show() {
    if (!tooltip || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  }

  return (
    <span ref={ref} className="inline-flex items-center" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      <span className={`material-symbols-outlined ${etStyles.sectionLabelIcon}`}>info</span>
      {pos && tooltip && createPortal(
        <div
          className="pointer-events-none fixed z-[120] w-max max-w-[280px] rounded-sm bg-[#212121] px-sm py-xs text-small text-white shadow-dropdown"
          style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip}
        </div>,
        document.body,
      )}
    </span>
  );
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
    <span className={chipClass} style={{ verticalAlign: 'middle', display: 'inline-flex', margin: '2px 4px' }}>
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

    const numbered = line.match(/^(\d+)\.\s*(.+)/);
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
function EditableLine({ text, className, onInput, onFocusLine }) {
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
      onFocus={() => onFocusLine?.(ref.current)}
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
    const titleText = titleEl ? serializeFrom(titleEl).trim() : '';

    const bulletLines = [];
    const bulletWrappers = stepEl.querySelectorAll('[data-step-bullet]');
    if (bulletWrappers.length) {
      bulletWrappers.forEach((bw) => {
        const bulletEl = bw.querySelector('[contenteditable]:not([contenteditable="false"])');
        const bulletText = bulletEl ? serializeFrom(bulletEl).trim() : '';
        if (bulletText) bulletLines.push(`• ${bulletText}`);
      });
    } else {
      // Fallback: all editables after the first are bullets
      const all = Array.from(stepEl.querySelectorAll('[contenteditable]:not([contenteditable="false"])'));
      all.slice(1).forEach((el) => {
        const bulletText = serializeFrom(el).trim();
        if (bulletText) bulletLines.push(`• ${bulletText}`);
      });
    }

    // Skip fully empty steps so clearing content returns to zero-state
    if (!titleText && bulletLines.length === 0) return;
    lines.push(`${num}. ${titleText}`);
    lines.push(...bulletLines);
  });
  return lines.join('\n');
}

/* ── Create-mode steps: freeform paragraph field (matches ProcedureDetailScreen) ── */
function CreateStepsField({ text, onChange, onOpenToolDrawer }) {
  const [isFocused, setIsFocused] = useState(false);
  const shellRef = useRef(null);

  return (
    <div
      ref={shellRef}
      className={`${styles.stepsEditorShell} ${styles.stepsEditorShellCreate} ${isFocused ? styles.stepsEditorShellFocused : ''}`}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => {
        requestAnimationFrame(() => {
          if (!shellRef.current?.contains(document.activeElement)) setIsFocused(false);
        });
      }}
    >
      <div className={`${styles.stepsEditorBody} ${styles.stepsEditorBodyCreate} ${styles.stepsCreatePrompt}`}>
        <UserPromptInput
          hideLabel
          autoHeight
          value={text}
          onChange={onChange}
          resolveType={resolveTokenType}
          minEditorHeight={STEPS_CREATE_MIN_HEIGHT}
          placeholder={STEPS_CREATE_PLACEHOLDER}
          onOpenToolDrawer={onOpenToolDrawer}
          showProcedureButton
        />
      </div>
    </div>
  );
}

/* ── Editable steps — identical layout to StepsRenderer ── */
function EditableStepsRenderer({ text, onChange, onOpenToolDrawer }) {
  const rootRef = useRef(null);
  const shellRef = useRef(null);
  const activeEditableRef = useRef(null);
  const lastEmitted = useRef(text);
  const [isFocused, setIsFocused] = useState(false);
  const steps = parseStepsText(text);

  useEffect(() => {
    lastEmitted.current = text;
  }, [text]);

  const getActiveEditable = useCallback(() => {
    const active = document.activeElement;
    if (
      active
      && rootRef.current?.contains(active)
      && active.getAttribute('contenteditable') === 'true'
    ) {
      return active;
    }
    return activeEditableRef.current;
  }, []);

  const emitChange = useCallback(() => {
    let next = text;
    if (rootRef.current?.querySelector('[data-step-block]')) {
      next = serializeStepsList(rootRef.current);
    } else {
      const active = getActiveEditable();
      if (active) next = serializeFrom(active);
    }
    if (next !== lastEmitted.current) {
      lastEmitted.current = next;
      onChange(next);
    }
  }, [onChange, text, getActiveEditable]);

  const handleFocusLine = useCallback((el) => {
    if (el) activeEditableRef.current = el;
    setIsFocused(true);
  }, []);

  const handleShellFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleShellBlur = useCallback(() => {
    requestAnimationFrame(() => {
      if (!shellRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
      }
    });
  }, []);

  const handleShellMouseDown = useCallback((e) => {
    const shell = shellRef.current;
    const root = rootRef.current;
    if (!shell || !root) return;
    if (e.target === shell || e.target === root || root.contains(e.target) && e.target.getAttribute?.('aria-hidden') === 'true') {
      const active = document.activeElement;
      if (root.contains(active) && active?.getAttribute?.('contenteditable') === 'true') return;
      const el = root.querySelector('[contenteditable="true"]');
      if (el) {
        e.preventDefault();
        el.focus();
      }
    }
  }, []);

  const nestedListClass = [
    styles.stepsList,
    styles.stepsListNested,
    !steps.length && styles.stepsListNestedEmpty,
    !steps.length && styles.stepsListWithHint,
  ].filter(Boolean).join(' ');

  const stepsInner = !steps.length ? (
    <div className={nestedListClass}>
      {!text.trim() && (
        <div className={styles.stepsEmptyHint} aria-hidden>
          {STEPS_CREATE_PLACEHOLDER}
        </div>
      )}
      <EditableLine
        text={text}
        className={styles.stepsEmptyEditable}
        onFocusLine={handleFocusLine}
        onInput={(lineText) => {
          lastEmitted.current = lineText;
          onChange(lineText);
        }}
      />
    </div>
  ) : (
    <div className={nestedListClass}>
      {steps.map((step, i) => (
        <div
          key={i}
          className={styles.step}
          data-step-block
          data-step-num={step.number ?? i + 1}
        >
          <div className={styles.stepTitleRow} data-step-title>
            {step.number !== null && (
              <span className={styles.stepNumberPrefix}>{step.number}.</span>
            )}
            <EditableLine
              text={step.title}
              className={styles.stepTitleText}
              onFocusLine={handleFocusLine}
              onInput={emitChange}
            />
          </div>
          {step.bullets.length > 0 && (
            <ul className={styles.stepBullets}>
              {step.bullets.map((b, j) => (
                <li key={j} className={styles.stepBulletRow} data-step-bullet>
                  <EditableLine
                    text={b}
                    className={styles.stepBulletText}
                    onFocusLine={handleFocusLine}
                    onInput={emitChange}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={shellRef}
      className={`${styles.stepsEditorShell} ${isFocused ? styles.stepsEditorShellFocused : ''}`}
      onFocusCapture={handleShellFocus}
      onBlurCapture={handleShellBlur}
      onMouseDown={handleShellMouseDown}
    >
      <div
        className={styles.stepsEditorBody}
        ref={rootRef}
      >
        {stepsInner}
      </div>
      <StepsEditorToolbar
        getActiveEditable={getActiveEditable}
        onAfterInsert={emitChange}
        onOpenToolDrawer={onOpenToolDrawer}
        hasContent={Boolean(text?.trim())}
      />
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
              <span className={styles.stepNumberPrefix}>{step.number}.</span>
            )}
            <span className={styles.stepTitleText}>{renderInlineText(step.title)}</span>
          </div>
          {step.bullets.length > 0 && (
            <ul className={styles.stepBullets}>
              {step.bullets.map((b, j) => (
                <li key={j} className={styles.stepBulletRow}>
                  <span className={styles.stepBulletText}>{renderInlineText(b)}</span>
                </li>
              ))}
            </ul>
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

function ChipContainer({
  chips,
  onChipChange,
  onChipDelete,
  addingNew,
  onCancelAdd,
  onCommitAdd,
  onChangeChipType,
  pendingAddType = 'variable',
  viewOnly,
  moreCount = 0,
  chipsReadOnly = false,
  showContainerAdd = false,
  libraryContextStyle = false,
  addPickerOpen = false,
  onToggleAddPicker,
  onSelectAddType,
  addPickerRef,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const openForChip = (i) => { setPickerFor(i); setPickerOpen(true); };
  const selectType = (type) => {
    setPickerOpen(false);
    if (typeof pickerFor === 'number') { onChangeChipType(pickerFor, type); }
    setPickerFor(null);
  };

  const hasChips = chips.length > 0 || addingNew;
  const containerClass = libraryContextStyle
    ? `${styles.libraryContextBox}${viewOnly ? ` ${styles.libraryContextBoxReadOnly}` : ''}`
    : llmStyles.chipContainer;
  const chipWrapClass = libraryContextStyle ? styles.libraryContextChips : llmStyles.chipWrap;

  return (
    <div className={containerClass}>
      {hasChips && (
        <div className={chipWrapClass}>
          {chips.map((chip, i) => (
            <VariableChip
              key={i}
              value={chip.value}
              type={chip.type}
              readOnly={chipsReadOnly}
              onChange={chipsReadOnly || viewOnly ? undefined : (v) => onChipChange(i, v)}
              onDelete={viewOnly || chipsReadOnly ? undefined : () => onChipDelete(i)}
              onSwatchClick={chipsReadOnly || viewOnly ? undefined : () => openForChip(i)}
            />
          ))}
          {addingNew && (
            <VariableChip
              value=""
              type={pendingAddType}
              autoFocus
              onChange={(v) => onCommitAdd(v, pendingAddType)}
              onDelete={onCancelAdd}
            />
          )}
        </div>
      )}
      {moreCount > 0 && (
        <span className={styles.moreContext}>+ {moreCount} more</span>
      )}
      {showContainerAdd && (
        <div
          className={libraryContextStyle ? styles.libraryContextFooter : styles.contextAddRowInContainer}
          ref={addPickerRef}
        >
          <button
            className={libraryContextStyle ? styles.libraryContextAddBtn : styles.contextAddBtn}
            type="button"
            onClick={onToggleAddPicker}
          >
            {libraryContextStyle && <Icon name="add_circle" size={16} />}
            Add
          </button>
          {addPickerOpen && (
            <div className={llmStyles.typePicker}>
              {CHIP_TYPES.map((ct) => (
                <button
                  key={ct.type}
                  className={llmStyles.typePickerItem}
                  type="button"
                  onClick={() => onSelectAddType(ct.type)}
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
      {!viewOnly && !chipsReadOnly && (
        <div className={styles.chipTypePickerAnchor} ref={pickerRef}>
          {pickerOpen && typeof pickerFor === 'number' && (
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

export function ChipSection({
  label,
  chips,
  onChange,
  defaultType = 'variable',
  viewOnly,
  moreCount = 0,
  chipsReadOnly = false,
  showContextAdd = false,
  libraryContextStyle = false,
  tooltip,
  onAddContext,
}) {
  const [adding, setAdding] = useState(false);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [pendingAddType, setPendingAddType] = useState(defaultType);
  const addPickerRef = useRef(null);

  useEffect(() => {
    if (!addPickerOpen) return;
    const handler = (e) => {
      if (addPickerRef.current && !addPickerRef.current.contains(e.target)) setAddPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addPickerOpen]);

  const commitAdd = (v, type) => { onChange([...chips, { value: v, type }]); setAdding(false); };
  const changeChip = (i, v) => { const n = [...chips]; n[i] = { ...n[i], value: v }; onChange(n); };
  const deleteChip = (i) => onChange(chips.filter((_, idx) => idx !== i));
  const changeType = (i, type) => { const n = [...chips]; n[i] = { ...n[i], type }; onChange(n); };

  const selectAddType = (type) => {
    setPendingAddType(type);
    setAddPickerOpen(false);
    setAdding(true);
  };

  const handleAddClick = () => {
    if (onAddContext) {
      onAddContext();
      return;
    }
    setAddPickerOpen((open) => !open);
  };

  const showAdd = !viewOnly && (
    Boolean(onAddContext) || (!chipsReadOnly && (libraryContextStyle || !showContextAdd))
  );

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabelRow}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>{label}</span>
          <SectionInfoIcon tooltip={tooltip} />
        </div>
        {!viewOnly && showContextAdd && (
          <div className={styles.contextAddRow} ref={addPickerRef}>
            <button
              className={styles.contextAddBtn}
              type="button"
              onClick={handleAddClick}
            >
              + Add
            </button>
            {addPickerOpen && !onAddContext && (
              <div className={llmStyles.typePicker}>
                {CHIP_TYPES.map((ct) => (
                  <button
                    key={ct.type}
                    className={llmStyles.typePickerItem}
                    type="button"
                    onClick={() => selectAddType(ct.type)}
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
      <ChipContainer
        chips={chips}
        onChipChange={changeChip}
        onChipDelete={deleteChip}
        addingNew={adding && !onAddContext}
        onCancelAdd={() => setAdding(false)}
        onCommitAdd={commitAdd}
        onChangeChipType={changeType}
        pendingAddType={pendingAddType}
        viewOnly={viewOnly}
        moreCount={moreCount}
        chipsReadOnly={chipsReadOnly && !onAddContext}
        showContainerAdd={showAdd && !showContextAdd}
        libraryContextStyle={libraryContextStyle}
        addPickerOpen={addPickerOpen && !onAddContext}
        onToggleAddPicker={handleAddClick}
        onSelectAddType={selectAddType}
        addPickerRef={addPickerRef}
      />
    </div>
  );
}

const TITLE_PLACEHOLDER = 'e.g. "Appointment rescheduling"';
const WHEN_CREATE_PLACEHOLDER = 'Describe the trigger that should activate this procedure, e.g. "Customer wants to reschedule an appointment."';
const WHEN_EDIT_PLACEHOLDER = 'Describe when this procedure should be triggered...';
const EXIT_CREATE_PLACEHOLDER = 'Describe when this procedure is complete. e.g. when customer ends the conversation.';
const EXIT_EDIT_PLACEHOLDER = 'Describe when this procedure is complete. e.g. when customer ends the conversation.';

export default function ProcedureDetailBody({
  initialValues = {},
  onFieldChange,
  viewOnly = false,
  showTitle = false,
  showLibraryCheckbox = false,
  contextEditable = false,
  contextLibraryStyle = false,
  showTypeField = false,
  whenToUseLabel = 'When should this procedure be used?',
  onOpenToolDrawer = undefined,
  onAddContext,
  hideContext = false,
}) {
  const [title, setTitle] = useState(initialValues.name ?? '');
  const [whenToUse, setWhenToUse] = useState(initialValues.whenToUse ?? '');
  const [whenToExit, setWhenToExit] = useState(initialValues.whenToExit ?? '');
  const [contextChips, setContextChips] = useState(normalizeChips(initialValues.contextChips ?? []));
  const [stepsText, setStepsText] = useState(initialValues.stepsText ?? '');
  const [addToLibrary, setAddToLibrary] = useState(initialValues.addToLibrary ?? false);
  const procedureType = initialValues.procedureType ?? 'Inbound';
  const moreContextCount = initialValues.moreContextCount ?? 0;
  const whenToUseRef = useRef(null);
  const whenToExitRef = useRef(null);

  useEffect(() => {
    setTitle(initialValues.name ?? '');
    setWhenToUse(initialValues.whenToUse ?? '');
    setWhenToExit(initialValues.whenToExit ?? '');
    setContextChips(normalizeChips(initialValues.contextChips ?? []));
    setStepsText(initialValues.stepsText ?? '');
    setAddToLibrary(initialValues.addToLibrary ?? false);
  }, [initialValues.name, initialValues.whenToUse, initialValues.whenToExit, initialValues.contextChips, initialValues.stepsText, initialValues.addToLibrary, initialValues.id]);

  useEffect(() => {
    const el = whenToUseRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [whenToUse]);

  useEffect(() => {
    const el = whenToExitRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [whenToExit]);

  return (
    <div
      className={styles.body}
      style={viewOnly ? { pointerEvents: 'auto' } : undefined}
    >
      {showTitle && (
        <div className={styles.section}>
          <div className={etStyles.sectionLabelWrapper}>
            <span className={etStyles.sectionLabelText}>
              Procedure title<span className={styles.required}> *</span>
            </span>
          </div>
          {viewOnly ? (
            <input
              type="text"
              className={styles.readOnlyField}
              value={title}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
            />
          ) : (
            <EmptyHintField
              hint={TITLE_PLACEHOLDER}
              isEmpty={!title.trim()}
              className={TITLE_SHELL}
              hintClassName="flex items-center px-md"
            >
              <input
                type="text"
                className="h-10 w-full bg-transparent px-md text-body text-text-primary outline-none"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  onFieldChange?.('name', val);
                }}
              />
            </EmptyHintField>
          )}
        </div>
      )}

      <div className={styles.section}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>
            {whenToUseLabel}<span className={styles.required}> *</span>
          </span>
        </div>
        {viewOnly ? (
          showTitle ? (
            <textarea
              className={`${styles.readOnlyField} ${styles.readOnlyTextarea}`}
              value={whenToUse}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              rows={5}
            />
          ) : (
            <input
              type="text"
              className={styles.readOnlyField}
              value={whenToUse}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
            />
          )
        ) : showTitle ? (
          <EmptyHintField
            hint={WHEN_CREATE_PLACEHOLDER}
            isEmpty={!whenToUse.trim()}
            className={FIELD_SHELL}
            hintClassName="p-md"
          >
            <textarea
              ref={whenToUseRef}
              className="min-h-[80px] w-full resize-none overflow-hidden bg-transparent p-md text-body leading-relaxed text-text-primary outline-none"
              value={whenToUse}
              rows={1}
              onChange={(e) => {
                const val = e.target.value;
                setWhenToUse(val);
                onFieldChange?.('whenToUse', val);
              }}
            />
          </EmptyHintField>
        ) : (
          <EmptyHintField
            hint={WHEN_EDIT_PLACEHOLDER}
            isEmpty={!whenToUse.trim()}
            className={TITLE_SHELL}
            hintClassName="flex items-center px-md"
          >
            <input
              type="text"
              className="h-10 w-full bg-transparent px-md text-body text-text-primary outline-none"
              value={whenToUse}
              onChange={(e) => {
                const val = e.target.value;
                setWhenToUse(val);
                onFieldChange?.('whenToUse', val);
              }}
            />
          </EmptyHintField>
        )}
      </div>

      {!hideContext && (
        <ChipSection
          label="Context"
          chips={contextChips}
          onChange={(next) => { setContextChips(next); onFieldChange?.('contextChips', next); }}
          defaultType="variable"
          viewOnly={viewOnly}
          moreCount={moreContextCount}
          chipsReadOnly={viewOnly || (!contextEditable && !onAddContext)}
          showContextAdd={false}
          libraryContextStyle={
            viewOnly || contextLibraryStyle || contextEditable || Boolean(onAddContext)
          }
          tooltip="Uses your brand voice, industry knowledge, to generate accurate responses"
          onAddContext={viewOnly ? undefined : onAddContext}
        />
      )}

      {showTypeField && (
        <div className={styles.section}>
          <div className={etStyles.sectionLabelWrapper}>
            <span className={etStyles.sectionLabelText}>Type</span>
          </div>
          <div
            className={`flex h-9 w-full cursor-default items-center gap-sm rounded-sm border border-border-input bg-surface-l2 px-md text-body text-text-primary ${
              viewOnly ? 'pointer-events-none' : ''
            }`}
            aria-disabled={viewOnly || undefined}
          >
            <span className="min-w-0 flex-1 truncate">{procedureType}</span>
            {!viewOnly && (
              <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>
            Steps<span className={styles.required}> *</span>
          </span>
          <SectionInfoIcon tooltip="Information your agent can refer to during a conversation, like your location details, knowledge base, and connected files" />
        </div>
        {viewOnly ? (
          <div className={`${styles.readOnlyField} ${styles.readOnlySteps}`}>
            <StepsRenderer text={stepsText} />
          </div>
        ) : showTitle ? (
          <CreateStepsField
            text={stepsText}
            onOpenToolDrawer={onOpenToolDrawer}
            onChange={(val) => { setStepsText(val); onFieldChange?.('stepsText', val); }}
          />
        ) : (
          <EditableStepsRenderer
            text={stepsText}
            onOpenToolDrawer={onOpenToolDrawer}
            onChange={(val) => { setStepsText(val); onFieldChange?.('stepsText', val); }}
          />
        )}
      </div>

      <div className={styles.section}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>When to exit this procedure?</span>
        </div>
        {viewOnly ? (
          showTitle ? (
            <textarea
              className={`${styles.readOnlyField} ${styles.readOnlyTextarea}`}
              value={whenToExit}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
              rows={5}
            />
          ) : (
            <input
              type="text"
              className={styles.readOnlyField}
              value={whenToExit}
              readOnly
              tabIndex={-1}
              aria-readonly="true"
            />
          )
        ) : showTitle ? (
          <EmptyHintField
            hint={EXIT_CREATE_PLACEHOLDER}
            isEmpty={!whenToExit.trim()}
            className={FIELD_SHELL}
            hintClassName="p-md"
          >
            <textarea
              ref={whenToExitRef}
              className="min-h-[80px] w-full resize-none overflow-hidden bg-transparent p-md text-body leading-relaxed text-text-primary outline-none"
              value={whenToExit}
              rows={1}
              onChange={(e) => {
                const val = e.target.value;
                setWhenToExit(val);
                onFieldChange?.('whenToExit', val);
              }}
            />
          </EmptyHintField>
        ) : (
          <EmptyHintField
            hint={EXIT_EDIT_PLACEHOLDER}
            isEmpty={!whenToExit.trim()}
            className={TITLE_SHELL}
            hintClassName="flex items-center px-md"
          >
            <input
              type="text"
              className="h-10 w-full bg-transparent px-md text-body text-text-primary outline-none"
              value={whenToExit}
              onChange={(e) => {
                const val = e.target.value;
                setWhenToExit(val);
                onFieldChange?.('whenToExit', val);
              }}
            />
          </EmptyHintField>
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
