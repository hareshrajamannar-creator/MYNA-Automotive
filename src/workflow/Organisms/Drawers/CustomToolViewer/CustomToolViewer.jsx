import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FormInput, TextArea, Toggle } from '../../../elemental-stubs';
function NativeDrawer({ isOpen, onClose, children, width = 960 }) {
  React.useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{ position: 'relative', width, maxWidth: '95vw', height: '100%', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
const CommonSideDrawer = ({ isOpen, onClose, children }) => <NativeDrawer isOpen={isOpen} onClose={onClose} width={650}>{children}</NativeDrawer>;
/* Select/SelectItem stubs */
function Select({ value, onChange, children }) {
  return <select value={value} onChange={(e) => onChange?.(e.target.value)} style={{ height: 36, padding: '0 12px', border: '1px solid #c5cad3', borderRadius: 4, fontSize: 14, width: '100%', fontFamily: '"Roboto", sans-serif' }}>{children}</select>;
}
function SelectItem({ value, children }) { return <option value={value}>{children}</option>; }
import VariableChip from '../../../Molecules/Inputs/VariableChip/VariableChip';
import styles from './CustomToolViewer.module.css';

// ─── Interactive field ────────────────────────────────────────────────────────

function buildInitialSnapshot(fields = []) {
  const snap = {};
  fields.forEach((f) => {
    if (f.type === 'checkbox' && Array.isArray(f.defaultValue)) {
      snap[f.id] = [...f.defaultValue];
    } else if (f.type === 'radio' && f.defaultValue) {
      snap[f.id] = f.defaultValue;
    }
  });
  return snap;
}

function isFieldVisible(field, snapshot) {
  if (!field.showWhen) return true;
  const { fieldId, includes, equals } = field.showWhen;
  const val = snapshot[fieldId];
  if (includes !== undefined) {
    return Array.isArray(val) && val.includes(includes);
  }
  if (equals !== undefined) {
    return val === equals;
  }
  return true;
}

function FieldLabel({ label, required, showInfoIcon }) {
  return (
    <span className={styles.fieldLabelRow}>
      <span className={styles.fieldLabel}>
        {label}{required && <span className={styles.required}> *</span>}
      </span>
      {showInfoIcon && (
        <span className={`material-symbols-outlined ${styles.fieldInfoIcon}`} title="Select the outbound caller ID for this call">
          info
        </span>
      )}
    </span>
  );
}

function FieldHeader({ label, required, helpText, showInfoIcon }) {
  return (
    <>
      <FieldLabel label={label} required={required} showInfoIcon={showInfoIcon} />
      {helpText && <span className={styles.fieldHelp}>{helpText}</span>}
    </>
  );
}

function InteractiveField({ field, onValueChange }) {
  const [textValue, setTextValue] = useState('');
  const [radioValue, setRadioValue] = useState('');
  const [checkValues, setCheckValues] = useState([]);
  const [selectValue, setSelectValue] = useState('');
  const [selectValueB, setSelectValueB] = useState('');
  const [toggled, setToggled] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (['text', 'number', 'date', 'textarea', 'variable'].includes(field.type)) {
      setTextValue(typeof field.defaultValue === 'string' ? field.defaultValue : '');
    }
    if (field.type === 'radio') {
      setRadioValue(field.defaultValue || field.options?.[0] || '');
    }
    if (field.type === 'checkbox') {
      setCheckValues(Array.isArray(field.defaultValue) ? [...field.defaultValue] : []);
    }
    if (field.type === 'select' || field.type === 'dropdown') {
      setSelectValue(field.defaultValue || '');
    }
    if (field.type === 'selectRow') {
      setSelectValue(field.selects?.[0]?.defaultValue || '');
      setSelectValueB(field.selects?.[1]?.defaultValue || '');
    }
    if (field.type === 'toggle') {
      setToggled(Boolean(field.defaultValue));
    }
  }, [field.id, field.defaultValue, field.type, field.options]);

  useEffect(() => {
    if (field.type === 'checkbox') {
      onValueChange?.(field.id, checkValues);
    }
  }, [checkValues, field.id, field.type, onValueChange]);

  const label = field.label || 'Untitled field';
  const required = field.required;

  switch (field.type) {
    case 'text':
    case 'number':
    case 'date':
      if (field.suffix || field.width === 'half') {
        return (
          <div className={styles.fieldWrap}>
            <span className={styles.fieldLabel}>
              {label}{required && <span className={styles.required}> *</span>}
            </span>
            <div className={styles.inputSuffixRow}>
              <input
                name={`view_${field.id}`}
                type={field.type}
                className={`${styles.suffixInput}${field.width === 'half' ? ` ${styles.suffixInputHalf}` : ''}`}
                placeholder={field.placeholder || ''}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
              {field.suffix && (
                <span className={styles.fieldSuffix}>{field.suffix}</span>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className={styles.fieldWrap}>
          <FormInput
            name={`view_${field.id}`}
            type={field.type}
            label={label}
            placeholder={field.placeholder || ''}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            required={required}
          />
        </div>
      );

    case 'textarea':
      if (field.showVariableToolbar) {
        return (
          <div className={styles.fieldWrap}>
            <span className={styles.fieldLabel}>
              {label}{required && <span className={styles.required}> *</span>}
            </span>
            <div className={styles.promptBox}>
              <textarea
                name={`view_${field.id}`}
                className={styles.promptTextarea}
                placeholder={field.placeholder || ''}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                rows={field.rows || 5}
              />
              <div className={styles.promptToolbar}>
                <button type="button" className={styles.variableBtn} title="Insert variable">
                  <span className={styles.variableBtnBrace}>{'{'}</span>
                  <span className={styles.variableBtnX}>x</span>
                  <span className={styles.variableBtnBrace}>{'}'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className={styles.fieldWrap}>
          <TextArea
            name={`view_${field.id}`}
            label={label}
            placeholder={field.placeholder || ''}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            noFloatingLabel
            required={required}
            rows={field.rows}
          />
        </div>
      );

    case 'select':
      return (
        <div className={styles.fieldWrap}>
          <FieldLabel label={label} required={required} showInfoIcon={field.showInfoIcon} />
          <div className={styles.selectWrap}>
            <select
              className={styles.selectInput}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            >
              <option value="">{field.placeholder || 'Select'}</option>
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
          </div>
        </div>
      );

    case 'selectRow':
      return (
        <div className={styles.fieldWrap}>
          <FieldLabel label={label} required={required} />
          <div className={styles.conditionalFieldsRow}>
            <div className={styles.selectWrap}>
              <select
                className={styles.selectInput}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                {(field.selects?.[0]?.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
            </div>
            <div className={styles.selectWrap}>
              <select
                className={styles.selectInput}
                value={selectValueB}
                onChange={(e) => setSelectValueB(e.target.value)}
              >
                {(field.selects?.[1]?.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
            </div>
          </div>
        </div>
      );

    case 'dropdown':
      return (
        <div className={styles.fieldWrap}>
          <span className={styles.fieldLabel}>
            {label}{required && <span className={styles.required}> *</span>}
          </span>
          <Select
            value={selectValue}
            onChange={(e, v) => setSelectValue(v)}
            placeHolder="Select..."
          >
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </Select>
        </div>
      );

    case 'radio':
      return (
        <div className={styles.fieldWrap}>
          <span className={styles.fieldLabel}>
            {label}{required && <span className={styles.required}> *</span>}
          </span>
          <div className={styles.optionGroup}>
            {field.options.map((opt) => (
              <label key={opt} className={styles.optionLabel}>
                <input
                  type="radio"
                  name={`view_radio_${field.id}`}
                  value={opt}
                  checked={radioValue === opt}
                  onChange={() => setRadioValue(opt)}
                  className={styles.optionInput}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {field.conditionalFields && radioValue === field.showWhenValue && (
            <div
              className={
                field.conditionalLayout === 'row'
                  ? styles.conditionalFieldsRow
                  : styles.conditionalFields
              }
            >
              {field.conditionalFields.map((sub) => (
                <InteractiveField key={sub.id} field={sub} />
              ))}
            </div>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className={styles.fieldWrap}>
          {!field.hideLabel && (
            <FieldHeader label={label} required={required} helpText={field.helpText} />
          )}
          <div className={field.layout === 'row' ? styles.checkboxRow : styles.optionGroup}>
            {field.options.map((opt) => (
              <label key={opt} className={field.layout === 'row' ? styles.checkboxLabel : styles.optionLabel}>
                <input
                  type="checkbox"
                  value={opt}
                  checked={checkValues.includes(opt)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...checkValues, opt]
                      : checkValues.filter((o) => o !== opt);
                    setCheckValues(next);
                    onValueChange?.(field.id, next);
                  }}
                  className={styles.optionInput}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {field.conditionalFields?.map((sub) => {
            if (sub.showWhenIncludes && !checkValues.includes(sub.showWhenIncludes)) return null;
            return (
              <div key={sub.id} className={styles.conditionalFieldsBelow}>
                <InteractiveField field={sub} onValueChange={onValueChange} />
              </div>
            );
          })}
        </div>
      );

    case 'toggle':
      return (
        <div className={styles.toggleRow}>
          <span className={styles.fieldLabel}>{label}</span>
          <Toggle
            name={`view_toggle_${field.id}`}
            checked={toggled}
            onChange={(instance, e) => setToggled(e.target.checked)}
          />
        </div>
      );

    case 'variable':
      return (
        <div className={styles.fieldWrap}>
          <span className={styles.fieldLabel}>
            {label}{required && <span className={styles.required}> *</span>}
          </span>
          <div className={styles.tagsInput}>
            {textValue ? (
              <VariableChip
                value={textValue}
                type="variable"
                onChange={setTextValue}
                onDelete={() => setTextValue('')}
              />
            ) : (
              <span className={styles.variableEmptyHint}>
                {field.placeholder || 'Map a workflow variable'}
              </span>
            )}
          </div>
        </div>
      );

    case 'tags':
      return (
        <div className={styles.fieldWrap}>
          <span className={styles.fieldLabel}>
            {label}{required && <span className={styles.required}> *</span>}
          </span>
          <div className={styles.tagsInput}>
            {tags.map((tag, i) => (
              <span key={i} className={styles.tagChip}>
                {tag}
                <button
                  type="button"
                  className={styles.tagChipRemove}
                  onClick={() => setTags((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </span>
            ))}
            <input
              className={styles.tagInputInner}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  setTags((prev) => [...prev, tagInput.trim()]);
                  setTagInput('');
                }
              }}
              placeholder={tags.length === 0 ? (field.placeholder || 'Type and press Enter...') : ''}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CustomToolViewer({ isOpen, tool, onClose, onEditTool }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fieldSnapshot, setFieldSnapshot] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen && tool?.fields) {
      setFieldSnapshot(buildInitialSnapshot(tool.fields));
    }
  }, [isOpen, tool?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const effectiveSnapshot = useMemo(() => {
    if (Object.keys(fieldSnapshot).length > 0) return fieldSnapshot;
    return buildInitialSnapshot(tool?.fields);
  }, [fieldSnapshot, tool?.fields]);

  if (!tool) return null;

  const handleEdit = () => {
    setMenuOpen(false);
    onEditTool?.(tool);
  };

  return (
    <CommonSideDrawer
      isOpen={isOpen}
      title=""
      onClose={onClose}
      width="650px"
      shouldScroll={false}
      buttonPosition="right"
      headerRightContent={<span className={styles.drawerSuppress} />}
    >
      <div className={styles.outer}>
        {/* ─── Custom header ─── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} type="button" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5.98854 10.6267L8.73215 13.3703C8.85608 13.4943 8.91724 13.6393 8.91565 13.8054C8.91403 13.9715 8.85287 14.1192 8.73215 14.2485C8.60288 14.3778 8.45438 14.4446 8.28665 14.4488C8.11892 14.4531 7.97042 14.3906 7.84115 14.2613L4.10877 10.529C3.95813 10.3783 3.88281 10.2026 3.88281 10.0017C3.88281 9.80088 3.95813 9.62514 4.10877 9.4745L7.84115 5.74212C7.96508 5.61819 8.11224 5.55703 8.28265 5.55862C8.45305 5.56024 8.60288 5.62567 8.73215 5.75494C8.85287 5.88421 8.91537 6.03058 8.91965 6.19404C8.92392 6.3575 8.86142 6.50386 8.73215 6.63312L5.98854 9.37675H15.7931C15.9704 9.37675 16.1189 9.43658 16.2386 9.55623C16.3582 9.67588 16.418 9.82438 16.418 10.0017C16.418 10.1791 16.3582 10.3276 16.2386 10.4472C16.1189 10.5669 15.9704 10.6267 15.7931 10.6267H5.98854Z" fill="currentColor"/>
              </svg>
            </button>
            <span className={styles.headerTitle}>{tool.name}</span>
          </div>
          {/* Save CTA — replaces three-dots menu */}
          <button
            type="button"
            onClick={onClose}
            className={styles.saveBtn}
          >
            Save
          </button>
        </div>

        {/* ─── Interactive fields ─── */}
        <div className={styles.body}>
          {tool.fields
            ?.filter((f) => isFieldVisible(f, effectiveSnapshot))
            .map((f) => (
              <InteractiveField
                key={f.id}
                field={f}
                onValueChange={(id, val) => {
                  setFieldSnapshot((prev) => ({ ...prev, [id]: val }));
                }}
              />
            ))}
        </div>
      </div>
    </CommonSideDrawer>
  );
}
