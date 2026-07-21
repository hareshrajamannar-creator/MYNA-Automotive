import { createPortal } from 'react-dom'
import { Icon } from '../Icon/Icon'
import { RefChip } from '../RefChip/RefChip'
import {
  TARGET_TYPE_ICON,
  TARGET_TYPE_LABEL,
  type DiffLine,
  type ProcedureView,
  type WorkflowNodeView,
} from '../../data/feedbackData'
import type { ChangeDetailDrawerProps } from './ChangeDetailDrawer.types'

function DiffBlock({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="flex flex-col gap-md">
      {lines.map((line, i) => (
        <div key={i} className="flex flex-col gap-xs">
          {line.location && <span className="text-small text-text-secondary">{line.location}</span>}
          {line.before && (
            <p className="m-0 rounded-sm bg-chip-danger-bg px-sm py-xs text-body text-text-primary line-through">
              {line.before}
            </p>
          )}
          <p className="m-0 rounded-sm bg-chip-success-bg px-sm py-xs text-body text-text-primary">{line.after}</p>
        </div>
      ))}
    </div>
  )
}

// Simplified read-only view of the workflow with the edited step highlighted.
function WorkflowChangeView({ nodes, fields }: { nodes: WorkflowNodeView[]; fields: DiffLine[] }) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <span className="text-small text-text-secondary">Where this sits in the workflow</span>
        <div className="flex flex-col">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex flex-col">
              {i > 0 && <div className="ml-[27px] h-md w-px bg-border-strong" />}
              {node.branch && (
                <span className="mb-xs ml-[44px] self-start rounded-full bg-surface-l2 px-sm text-small text-text-secondary">
                  {node.branch}
                </span>
              )}
              <div
                className={`flex items-center gap-sm rounded-md border px-md py-sm ${
                  node.edited ? 'border-primary bg-surface-selected' : 'border-border bg-surface'
                }`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-surface-l2">
                  <Icon name={node.icon} size={18} className="text-text-icon" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-body text-text-primary">{node.title}</span>
                  {node.description && (
                    <span className="truncate text-small text-text-secondary">{node.description}</span>
                  )}
                </div>
                {node.edited && (
                  <span className="ml-auto shrink-0 rounded-full bg-chip-success-bg px-sm text-small text-text-primary">
                    Edited
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-xs">
        <span className="text-small text-text-secondary">What changed in this step</span>
        <DiffBlock lines={fields} />
      </div>
    </div>
  )
}

// Read-only procedure view matching the procedure library's structure
// (when to use → numbered steps with bullets → tools), with changed bullets highlighted.
function ProcedureChangeView({ view }: { view: ProcedureView }) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <span className="text-small text-text-secondary">When to use</span>
        <p className="m-0 text-body text-text-primary">{view.whenToUse}</p>
      </div>
      <div className="flex flex-col gap-md">
        <span className="text-small text-text-secondary">Steps</span>
        {view.steps.map((step, i) => (
          <div key={i} className="flex flex-col gap-xs">
            <span className="text-body text-text-primary">
              {i + 1}. {step.title}
            </span>
            <ul className="m-0 flex list-none flex-col gap-xs p-0">
              {step.bullets.map((bullet, j) => (
                <li
                  key={j}
                  className={`ml-lg text-body ${
                    bullet.state === 'added'
                      ? 'rounded-sm bg-chip-success-bg px-sm py-xs text-text-primary'
                      : bullet.state === 'removed'
                        ? 'rounded-sm bg-chip-danger-bg px-sm py-xs text-text-primary line-through'
                        : 'list-disc text-text-primary'
                  }`}
                >
                  {bullet.state ? bullet.text : `• ${bullet.text}`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {view.tools.length > 0 && (
        <div className="flex flex-col gap-xs">
          <span className="text-small text-text-secondary">Tools</span>
          <div className="flex flex-wrap gap-xs">
            {view.tools.map((tool) => (
              <RefChip key={tool} kind="tool" label={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ChangeDetailDrawer({ open, change, onClose }: ChangeDetailDrawerProps) {
  if (!open || !change) return null

  return createPortal(
    <div className="fixed inset-0 z-[1200]">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 flex h-full w-[650px] flex-col bg-surface shadow-modal">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-lg py-md">
          <div className="flex items-center gap-sm">
            <Icon name={TARGET_TYPE_ICON[change.targetType]} size={20} className="text-text-icon" />
            <span className="text-h3 text-text-primary">
              {TARGET_TYPE_LABEL[change.targetType]} — {change.targetName}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto px-lg py-lg">
          <div className="flex flex-col gap-xs rounded-md bg-ai-summary px-md py-sm">
            <span className="text-small text-text-secondary">Why this fixes it</span>
            <p className="m-0 text-body text-text-primary">{change.rationale}</p>
          </div>

          {change.workflowView ? (
            <WorkflowChangeView nodes={change.workflowView.nodes} fields={change.workflowView.fields} />
          ) : change.procedureView ? (
            <ProcedureChangeView view={change.procedureView} />
          ) : (
            <div className="flex flex-col gap-xs">
              <span className="text-small text-text-secondary">What changed</span>
              <DiffBlock lines={change.diff} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
