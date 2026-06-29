import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../prompt-chip.css';
import { serializeFrom, deserializeInto, deserializeIntoTyped, insertChipAt } from '../promptChipHelpers.js';
import { VariableIcon, BuildIcon, ExpandIcon } from '../PromptToolbarIcons.jsx';
import { CHIP_TYPES, DataTypeIcon } from '../VariableChip/VariableChip.jsx';
import FieldPickerModal from '../../../Organisms/Modals/FieldPickerModal/FieldPickerModal.jsx';
import styles from './UserPromptInput.module.css';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function UserPromptInput({ value, onChange, required, hideLabel = false, readOnly = false, autoHeight = false, minEditorHeight, placeholder = 'Enter prompt', resolveType = null, onOpenToolDrawer, onOpenTool }) {
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const lastEmittedRef = useRef(null);
  const savedRangeRef = useRef(null);
  const pickerContainerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!(value ?? '').trim());

  const syncEmpty = useCallback(() => {
    const el = editorRef.current;
    setIsEmpty(!el || !serializeFrom(el).trim());
  }, []);

  const emitChange = useCallback(() => {
    const s = serializeFrom(editorRef.current);
    lastEmittedRef.current = s;
    setIsEmpty(!s.trim());
    onChangeRef.current?.(s);
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const newVal = value ?? '';
    if (newVal === lastEmittedRef.current) return;
    lastEmittedRef.current = newVal;
    if (resolveType) {
      deserializeIntoTyped(el, newVal, emitChange, resolveType);
    } else {
      deserializeInto(el, newVal, emitChange);
    }
    syncEmpty();
  }, [value, emitChange, resolveType, syncEmpty]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerContainerRef.current && !pickerContainerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const saveRange = useCallback(() => {
    const el = editorRef.current;
    if (el) {
      const sel = window.getSelection();
      if (sel?.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  }, []);

  const handleOpenPicker = useCallback(() => {
    saveRange();
    setPickerOpen((p) => !p);
  }, [saveRange]);

  const handleOpenFieldModal = useCallback(() => {
    saveRange();
    setFieldModalOpen(true);
  }, [saveRange]);

  const handleTypeSelect = useCallback((type) => {
    setPickerOpen(false);
    insertChipAt(editorRef.current, savedRangeRef.current, emitChange, type);
    savedRangeRef.current = null;
  }, [emitChange]);

  const handleFieldSelect = useCallback((fieldValue) => {
    setFieldModalOpen(false);
    insertChipAt(editorRef.current, savedRangeRef.current, emitChange, 'variable', fieldValue);
    savedRangeRef.current = null;
  }, [emitChange]);

  // @ mention: open field picker
  const handleKeyDown = useCallback((e) => {
    if (e.key === '@') {
      saveRange();
      // Let the character type, then open the picker on next tick
      setTimeout(() => setFieldModalOpen(true), 0);
    }
  }, [saveRange]);

  return (
    <>
      <div className={styles.wrap}>
        {!hideLabel && (
          <div className={styles.labelRow}>
            <span className={styles.label}>User prompt</span>
            {required && <span className={styles.required}>*</span>}
          </div>
        )}
        <div className={`${styles.inputBox}${!readOnly && isEmpty ? ` ${styles.inputBoxWithHint}` : ''}`}>
          {!readOnly && isEmpty && (
            <div className={styles.placeholderOverlay} aria-hidden>
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            className={`${styles.editor}${autoHeight ? ` ${styles.editorAutoHeight}` : ''}`}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onInput={readOnly ? undefined : emitChange}
            onKeyDown={readOnly ? undefined : handleKeyDown}
            style={minEditorHeight ? { minHeight: minEditorHeight } : undefined}
            onClick={onOpenTool ? (e) => {
              const chip = e.target.closest('[data-chip-type="tool"], .prompt-chip--tool');
              if (chip) {
                const label = chip.querySelector('.prompt-chip-label')?.textContent?.trim();
                if (label) onOpenTool(label);
              }
            } : undefined}
          />
          {!readOnly && (
          <div className={styles.toolbar} ref={pickerContainerRef}>
            <button
              type="button"
              className={`${styles.toolbarBtn} ${fieldModalOpen ? styles.toolbarBtnActive : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleOpenFieldModal}
              title="Insert variable"
            >
              <VariableIcon />
            </button>
            <button
              type="button"
              className={styles.toolbarBtn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onOpenToolDrawer}
              title="Tools"
            >
              <BuildIcon />
            </button>
            <button
              type="button"
              className={styles.toolbarBtn}
              onMouseDown={(e) => e.preventDefault()}
              title="Expand"
            >
              <ExpandIcon />
            </button>
          </div>
          )}
        </div>
      </div>
      {fieldModalOpen && (
        <FieldPickerModal
          onClose={() => setFieldModalOpen(false)}
          onSelectField={handleFieldSelect}
        />
      )}
    </>
  );
}
