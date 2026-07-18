import React, { useState, useRef, useEffect, useCallback } from 'react';
import { insertChipAt } from '../promptChipHelpers.js';
import { VariableIcon, BuildIcon, ProcedureIcon, ExpandIcon } from '../PromptToolbarIcons.jsx';
import { CHIP_TYPES, DataTypeIcon } from '../VariableChip/VariableChip.jsx';
import ToolbarButton from '../ToolbarButton.jsx';
import toolbarStyles from '../UserPromptInput/UserPromptInput.module.css';
import styles from './StepsEditorToolbar.module.css';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Bottom toolbar for procedure step editors: Fields, Tools, Procedures, Rephrase.
 */
export default function StepsEditorToolbar({ getActiveEditable, onAfterInsert, onOpenToolDrawer, hasContent = false }) {
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

  const saveActiveRange = useCallback(() => {
    const el = getActiveEditable?.();
    if (el) {
      const sel = window.getSelection();
      if (sel?.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  }, [getActiveEditable]);

  const handleOpenPicker = useCallback(() => {
    saveActiveRange();
    setPickerOpen((p) => !p);
  }, [saveActiveRange]);

  const handleTypeSelect = useCallback((type) => {
    setPickerOpen(false);
    const el = getActiveEditable?.();
    if (!el) return;
    insertChipAt(el, savedRangeRef.current, () => {
      savedRangeRef.current = null;
      onAfterInsert?.();
    }, type);
  }, [getActiveEditable, onAfterInsert]);

  const handleInsertProcedure = useCallback(() => {
    saveActiveRange();
    handleTypeSelect('product');
  }, [saveActiveRange, handleTypeSelect]);

  return (
    <div className={styles.row}>
      <div className={`${toolbarStyles.toolbar} ${styles.toolbar}`} ref={pickerRef}>
        <ToolbarButton
          icon={<VariableIcon />}
          tooltip="Fields"
          active={pickerOpen}
          onClick={handleOpenPicker}
        />
        <ToolbarButton
          icon={<BuildIcon />}
          tooltip="Tools"
          onClick={onOpenToolDrawer}
        />
        <ToolbarButton
          icon={<ProcedureIcon />}
          tooltip="Procedures"
          onClick={handleInsertProcedure}
        />
        <ToolbarButton
          icon={<ExpandIcon />}
          tooltip="Rephrase"
          disabled={!hasContent}
        />
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
