import React, { useCallback, useState } from 'react';
import './EndNode.css';

export default function EndNode({
  selected = false,
  viewOnly = false,
  isDraggingFromLHS = false,
  onDropBeforeEnd,
  hideAdd = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const type = e.dataTransfer.getData('application/reactflow-type');
    const label = e.dataTransfer.getData('application/reactflow-label');
    const description = e.dataTransfer.getData('application/reactflow-description');
    if (type && onDropBeforeEnd) {
      onDropBeforeEnd(type, label, description);
    }
  }, [onDropBeforeEnd]);

  const btnClass = [
    'end-node__add',
    isDraggingFromLHS ? 'end-node__add--lhs-drag' : '',
    isDragOver ? 'end-node__add--drop-target' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="end-node-stack">
      <div className="end-node-connector-line" aria-hidden />
      <div className={`end-node-connector${hideAdd ? ' end-node-connector--compact' : ''}`}>
        {!viewOnly && !hideAdd && (
          <button
            type="button"
            className={btnClass}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>
      <div className={`end-node${selected ? ' end-node--selected' : ''}`}>End</div>
    </div>
  );
}
