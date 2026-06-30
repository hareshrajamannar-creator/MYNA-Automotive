import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EmptyHintField } from '../../../../components/EmptyHintField/EmptyHintField';
import { Icon } from '../../../../components/Icon/Icon';
import { serializeFrom, deserializeIntoTyped } from '../../../Molecules/Inputs/promptChipHelpers.js';
import '../../../Molecules/Inputs/prompt-chip.css';
import StepsEditorToolbar from '../../../Molecules/Inputs/StepsEditorToolbar/StepsEditorToolbar.jsx';
import VariableChip, { CHIP_TYPES, DataTypeIcon, ProcedureBookIcon } from '../../../Molecules/Inputs/VariableChip/VariableChip';
import chipStyles from '../../../Molecules/Inputs/VariableChip/VariableChip.module.css';
import etStyles from './EntityTaskBody.module.css';
import llmStyles from './LLMTaskBody.module.css';
import styles from './ProcedureDetailBody.module.css';

const FIELD_SHELL = 'rounded-sm border border-border-input bg-surface transition-colors hover:border-border focus-within:border-primary';
const TITLE_SHELL = `h-10 ${FIELD_SHELL}`;

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
    if (titleEl) lines.push(`${num}.${serializeFrom(titleEl)}`);

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
function EditableStepsRenderer({ text, onChange, createMode = false, onOpenToolDrawer }) {
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

  const handleShellBlur = useCallback((e) => {
    if (!shellRef.current?.contains(e.relatedTarget)) {
      setIsFocused(false);
    }
  }, []);

  const STEPS_EMPTY_HINT = 'Start writing instructions…\nType "/" to insert a tool, field, or procedure.';

  const nestedListClass = [
    styles.stepsList,
    styles.stepsListNested,
    createMode && styles.stepsListNestedCreate,
    !steps.length && styles.stepsListNestedEmpty,
    !steps.length && styles.stepsListWithHint,
  ].filter(Boolean).join(' ');

  const stepsInner = !steps.length ? (
    <div className={nestedListClass}>
      {!text.trim() && (
        <div className={styles.stepsEmptyHint} aria-hidden>
          {STEPS_EMPTY_HINT}
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
      className={`${styles.stepsEditorShell} ${createMode ? styles.stepsEditorShellCreate : ''} ${isFocused ? styles.stepsEditorShellFocused : ''}`}
      onBlurCapture={handleShellBlur}
    >
      <div
        className={`${styles.stepsEditorBody} ${createMode ? styles.stepsEditorBodyCreate : ''}`}
        ref={rootRef}
      >
        {stepsInner}
      </div>
      <StepsEditorToolbar
        getActiveEditable={getActiveEditable}
        onAfterInsert={emitChange}
        onOpenToolDrawer={onOpenToolDrawer}
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
  const containerClass = libraryContextStyle ? styles.libraryContextBox : llmStyles.chipContainer;
  const chipWrapClass = libraryContextStyle ? styles.libraryContextChips : llmStyles.chipWrap;

  return (
    <div className={containerClass}>
      {libraryContextStyle && !hasChips && (
        <p className={styles.libraryContextEmpty}>No context added</p>
      )}
      {hasChips && (
        <div className={chipWrapClass}>
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

function ChipSection({
  label,
  chips,
  onChange,
  defaultType = 'variable',
  viewOnly,
  moreCount = 0,
  chipsReadOnly = false,
  showContextAdd = false,
  libraryContextStyle = false,
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

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabelRow}>
        <div className={etStyles.sectionLabelWrapper}>
          <span className={etStyles.sectionLabelText}>{label}</span>
          <span className={`material-symbols-outlined ${etStyles.sectionLabelIcon}`}>info</span>
        </div>
        {!viewOnly && showContextAdd && (
          <div className={styles.contextAddRow} ref={addPickerRef}>
            <button
              className={styles.contextAddBtn}
              type="button"
              onClick={() => setAddPickerOpen((open) => !open)}
            >
              + Add
            </button>
            {addPickerOpen && (
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
        addingNew={adding}
        onCancelAdd={() => setAdding(false)}
        onCommitAdd={commitAdd}
        onChangeChipType={changeType}
        pendingAddType={pendingAddType}
        viewOnly={viewOnly}
        moreCount={moreCount}
        chipsReadOnly={chipsReadOnly}
        showContainerAdd={!viewOnly && (libraryContextStyle || !showContextAdd)}
        libraryContextStyle={libraryContextStyle}
        addPickerOpen={addPickerOpen}
        onToggleAddPicker={() => setAddPickerOpen((open) => !open)}
        onSelectAddType={selectAddType}
        addPickerRef={addPickerRef}
      />
    </div>
  );
}

const TITLE_PLACEHOLDER = 'Enter procedure title';
const WHEN_CREATE_PLACEHOLDER = `Describe the trigger that should activate this procedure.

Examples:
• Customer wants to reschedule an appointment
• User reports a payment issue`;
const WHEN_EDIT_PLACEHOLDER = 'Describe when this procedure should be triggered...';

export default function ProcedureDetailBody({
  initialValues = {},
  onFieldChange,
  viewOnly = false,
  showTitle = false,
  showLibraryCheckbox = false,
  contextEditable = false,
  onOpenToolDrawer = undefined,
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
          {viewOnly ? (
            <input
              type="text"
              className={styles.readOnlyField}
              value={title}
              readOnly
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
            When should this procedure be used?<span className={styles.required}> *</span>
          </span>
        </div>
        {viewOnly ? (
          showTitle ? (
            <textarea
              className={`${styles.readOnlyField} ${styles.readOnlyTextarea}`}
              value={whenToUse}
              readOnly
              rows={5}
            />
          ) : (
            <input
              type="text"
              className={styles.readOnlyField}
              value={whenToUse}
              readOnly
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
              className="w-full resize-y bg-transparent p-md text-body leading-relaxed text-text-primary outline-none"
              value={whenToUse}
              rows={5}
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

      <ChipSection
        label="Context"
        chips={contextChips}
        onChange={(next) => { setContextChips(next); onFieldChange?.('contextChips', next); }}
        defaultType="variable"
        viewOnly={viewOnly}
        moreCount={moreContextCount}
        chipsReadOnly={!contextEditable}
        showContextAdd={false}
        libraryContextStyle={contextEditable}
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
            createMode={showTitle}
            onOpenToolDrawer={onOpenToolDrawer}
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
