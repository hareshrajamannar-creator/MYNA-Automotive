import React, { useState, useRef, useEffect, useCallback } from 'react';
import { insertChipAt } from '../promptChipHelpers.js';
import { VariableIcon, BuildIcon, ExpandIcon } from '../PromptToolbarIcons.jsx';
import { CHIP_TYPES, DataTypeIcon } from '../VariableChip/VariableChip.jsx';
import toolbarStyles from '../UserPromptInput/UserPromptInput.module.css';
import styles from './StepsEditorToolbar.module.css';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Bottom toolbar for procedure step editors: Fields, Tools, Rephrase.
 */
export default function StepsEditorToolbar({ getActiveEditable, onAfterInsert }) {
  const pickerRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const handleOpenPicker = useCallback(() => {
    const el = getActiveEditable?.();
    if (el) {
      const sel = window.getSelection();
      if (sel?.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
    setPickerOpen((p) => !p);
  }, [getActiveEditable]);

  const handleTypeSelect = useCallback((type) => {
    setPickerOpen(false);
    const el = getActiveEditable?.();
    if (!el) return;
    insertChipAt(el, savedRangeRef.current, () => {
      savedRangeRef.current = null;
      onAfterInsert?.();
    }, type);
  }, [getActiveEditable, onAfterInsert]);

  return (
    <div className={styles.row}>
      <div className={`${toolbarStyles.toolbar} ${styles.toolbar}`} ref={pickerRef}>
        <button
          type="button"
          className={`${toolbarStyles.toolbarBtn} ${pickerOpen ? toolbarStyles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleOpenPicker}
          title="Fields"
          aria-label="Fields"
        >
          <VariableIcon />
        </button>
        <button
          type="button"
          className={toolbarStyles.toolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          title="Tools"
          aria-label="Tools"
        >
          <BuildIcon />
        </button>
        <button
          type="button"
          className={toolbarStyles.toolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          title="Rephrase"
          aria-label="Rephrase"
        >
          <ExpandIcon />
        </button>
        {pickerOpen && (
          <div className={toolbarStyles.typePicker}>
            {CHIP_TYPES.map((ct) => (
              <button
                key={ct.type}
                className={toolbarStyles.typePickerItem}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleTypeSelect(ct.type)}
              >
                <span className={`${toolbarStyles.typePickerSwatch} ${toolbarStyles[`tpSwatch${cap(ct.type)}`] || ''}`}>
                  {ct.icon
                    ? <span className={`material-symbols-outlined ${toolbarStyles[`tpIcon${cap(ct.type)}`] || ''}`}>{ct.icon}</span>
                    : <DataTypeIcon />}
                </span>
                <span className={toolbarStyles.typePickerLabel}>{ct.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
