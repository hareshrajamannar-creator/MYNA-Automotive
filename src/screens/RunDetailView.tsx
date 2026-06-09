import { useMemo, useState } from 'react'
import { BackArrowIcon } from '../assets/BackArrowIcon'
import { Chip } from '../components'
import type { HealthcareLogRow } from '../data/healthcareAgentLogs'
import StartNode from '../workflow/Molecules/Canvas/StartNode/StartNode'
import CanvasNode from '../workflow/Molecules/Canvas/CanvasNode/CanvasNode'
import ProceduresNode from '../workflow/Molecules/Canvas/ProceduresNode/ProceduresNode'
import EndNode from '../workflow/Molecules/Canvas/EndNode/EndNode'
import GraphControls from '../workflow/Modules/FlowCanvas/GraphControls/GraphControls'
import {
  buildStaticPreviewMessages,
  PreviewLogsView,
  PreviewSidePanelHeader,
  PreviewStaticTranscript,
} from '../workflow/Molecules/PreviewPanel/PreviewPanelViews'
import {
  FLOW_CONNECTOR_GAP,
  FLOW_START_GAP,
} from '../workflow/flowLayoutConstants'
import '../workflow/FlowCanvas/FlowCanvas.css'
import '../workflow/Molecules/PreviewPanel/PreviewPanel.css'

interface RunDetailViewProps {
  row: HealthcareLogRow
  onBack: () => void
}

const PROCEDURE_CHIPS = [
  'Greet and open conversation',
  'Talk to human',
  'Handle general inquiry',
  'Handle unclear message',
  'Handle emergency or urgent concern',
]

/* ── workflow canvas connector (matches FlowCanvas edge styling) ── */
function RunFlowConnector({
  height,
  showAdd = true,
}: {
  height: number
  showAdd?: boolean
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height, width: showAdd ? 56 : 24 }}
    >
      <div
        className="pointer-events-none absolute bottom-0 top-0 left-1/2 w-px -translate-x-1/2"
        style={{ background: '#ccd5e4' }}
      />
      {showAdd && (
        <button
          type="button"
          className="flow-canvas__edge-add relative z-[1]"
          disabled
          aria-hidden
          tabIndex={-1}
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}
    </div>
  )
}

const RUN_PROCEDURE_ITEMS = PROCEDURE_CHIPS.map((name) => ({ id: name, name }))

/* ── workflow canvas ── */
function WorkflowCanvas({ instanceName }: { instanceName: string }) {
  return (
    <div className="flow-canvas flex flex-1 flex-col overflow-auto">
      <div className="flow-canvas__toolbar-anchor">
        <GraphControls
          viewOnly
          zoom={100}
          onRun={() => {}}
          onEdit={() => {}}
          onOrientationChange={() => {}}
          onZoomSelect={() => {}}
          onFitView={() => {}}
        />
      </div>

      <div className="flex flex-col items-center pb-2xl pt-[84px]">
        <StartNode title={instanceName} subtitle="All locations" />

        <RunFlowConnector height={FLOW_START_GAP} showAdd={false} />

        <div className="flow-canvas__node-center">
          <CanvasNode
            nodeType="trigger"
            label="Trigger"
            stepNumber={1}
            title="Conversation trigger"
            description="Agent triggers when a voice, chat, or text conversations starts"
            titlePlaceholder=""
            descriptionPlaceholder=""
            viewOnly
            onToggleChange={() => {}}
            onAddClick={() => {}}
            onDelete={() => {}}
          />
        </div>

        <RunFlowConnector height={FLOW_CONNECTOR_GAP} showAdd />

        <div className="flow-canvas__node-center">
          <ProceduresNode
            stepNumber={3}
            procedureItems={RUN_PROCEDURE_ITEMS as never[]}
            hasToggle
            toggleEnabled
            toggleDisabled
            viewOnly
            onToggleChange={() => {}}
            onDelete={() => {}}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            onDropProcedure={() => {}}
            onRemoveProcedure={() => {}}
            onSelectProcedure={() => {}}
          />
        </div>

        <EndNode viewOnly hideAdd onDropBeforeEnd={() => {}} />
      </div>
    </div>
  )
}

/* ── read-only logs / preview side panel (matches workflow preview panel) ── */
function RunDetailSidePanel() {
  const [panel, setPanel] = useState<'logs' | 'preview'>('logs')
  const previewMessages = useMemo(
    () => buildStaticPreviewMessages(),
    [],
  )

  return (
    <div className="preview-panel">
      <PreviewSidePanelHeader
        panel={panel}
        onToggle={() => setPanel((p) => (p === 'logs' ? 'preview' : 'logs'))}
      />
      <div className="preview-panel__body">
        {panel === 'logs' ? (
          <PreviewLogsView />
        ) : (
          <PreviewStaticTranscript messages={previewMessages} />
        )}
      </div>
    </div>
  )
}

/* ── main export ── */
export function RunDetailView({ row, onBack }: RunDetailViewProps) {
  const instanceName = 'Front desk agent north region'

  return (
    <div className="relative flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-sm border-b border-border px-2xl">
        <button
          type="button"
          aria-label="Back to logs"
          onClick={onBack}
          className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
        >
          <BackArrowIcon />
        </button>
        <span className="text-body text-text-primary">
          Run – {row.timestamp}
        </span>
        <Chip label={row.status} variant="success" />
        <span className="text-small text-text-secondary">{row.duration}s</span>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 overflow-hidden">
        <WorkflowCanvas instanceName={instanceName} />

        <div className="preview-panel-float-wrap">
          <RunDetailSidePanel />
        </div>
      </div>
    </div>
  )
}
