import { useState } from 'react'
import {
  Chip,
  DataTable,
  Icon,
  MetricTiles,
  Tabs,
  TopNav,
  type Column,
  type Metric,
  type Tab,
} from '../components'
import { BackArrowIcon } from '../assets/BackArrowIcon'
import { AgentLogsTab } from './AgentLogsTab'
import { WorkflowViewerTab } from './WorkflowViewerTab'

interface AgentInstanceScreenProps {
  instanceName: string
  status?: string
  onBack: () => void
  onEditAgent?: (agentName: string) => void
  product?: string
}

interface LocationRow {
  location: string
  interactions: string
  fcr: string
  aht: string
  escalation: string
  count: string
  [key: string]: string
}

const TABS: Tab[] = [
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'recommendation', label: 'Recommendation' },
  { id: 'logs', label: 'Logs' },
  { id: 'settings', label: 'Settings' },
]

const METRICS_BY_AGENT: Record<string, Metric[]> = {
  'Frontdesk agent': [
    { id: 'interactions', value: '18,420', label: 'Interactions handled', delta: '1.3%', trend: 'up', info: true },
    { id: 'fcr', value: '87%', label: 'First contact resolution', delta: '2.1%', trend: 'up', info: true },
    { id: 'aht', value: '1m 42s', label: 'Average handle time', delta: '0.8%', trend: 'down', info: true },
    { id: 'escalation', value: '8%', label: 'Escalation rate', delta: '1.1%', trend: 'down', info: true },
  ],
  'Reminder agent': [
    { id: 'confirmed', value: '3,847', label: 'Appointments confirmed', delta: '4.2%', trend: 'up', info: true },
    { id: 'reschedule', value: '12%', label: 'Reschedule rate', delta: '0.5%', trend: 'down', info: true },
    { id: 'noshow', value: '34%', label: 'No-show rate', delta: '1.3%', trend: 'down', info: true },
    { id: 'messages', value: '11,541', label: 'Messages sent', delta: '2.3%', trend: 'up', info: true },
  ],
  'Outreach agent': [
    { id: 'leads', value: '2,103', label: 'Leads contacted', delta: '3.7%', trend: 'up', info: true },
    { id: 'response', value: '38%', label: 'Response rate', delta: '1.9%', trend: 'up', info: true },
    { id: 'appointments', value: '641', label: 'Appointments scheduled', delta: '5.4%', trend: 'up', info: true },
    { id: 'conversion', value: '11%', label: 'Conversion rate', delta: '0.7%', trend: 'up', info: true },
  ],
}

const DEFAULT_METRICS: Metric[] = [
  { id: 'interactions', value: '2,850', label: 'Interactions handled', delta: '1.3%', trend: 'up', info: true },
  { id: 'fcr', value: '92%', label: 'First contact resolution rate', delta: '1.3%', trend: 'up', info: true },
  { id: 'aht', value: '2m', label: 'Average handle time', delta: '1.3%', trend: 'up', info: true },
  { id: 'escalation', value: '11%', label: 'Escalation rate', delta: '1.3%', trend: 'up', info: true },
]

const LOCATIONS: LocationRow[] = [
  { location: 'Atlanta, GA', interactions: '102', fcr: '15%', aht: '20m', escalation: '20m', count: '500' },
  { location: 'Chicago, IL', interactions: '98', fcr: '9%', aht: '5m', escalation: '5m', count: '250' },
  { location: 'Los Angeles, CA', interactions: '53', fcr: '9%', aht: '10m', escalation: '10m', count: '200' },
  { location: 'Stamford, CT', interactions: '35', fcr: '8%', aht: '2m', escalation: '2m', count: '100' },
]

const COLUMNS: Column<LocationRow>[] = [
  { key: 'location', label: 'Location', width: 240, sortable: true },
  { key: 'interactions', label: 'Interactions handled', width: 190, sortable: true },
  { key: 'fcr', label: 'First contact resolution', width: 200, sortable: true },
  { key: 'aht', label: 'Average handle time', width: 190, sortable: true },
  { key: 'escalation', label: 'Escalation rate', width: 160, sortable: true },
  {
    key: 'count',
    label: 'Locations',
    width: 150,
    sortable: true,
    render: (v) => (
      <span className="inline-flex items-center gap-xs">
        {String(v)}
        <Icon name="expand_more" size={16} className="text-text-icon" />
      </span>
    ),
  },
]

export function AgentInstanceScreen({ instanceName, status = 'Running', onBack, onEditAgent, product }: AgentInstanceScreenProps) {
  const [activeTab, setActiveTab] = useState('outcomes')

  // Derive agent name from instance name (e.g. "Frontdesk agent - North region" → "Frontdesk agent")
  const agentName = instanceName.replace(/ - .+$/, '')
  const metrics: Metric[] = METRICS_BY_AGENT[agentName] ?? DEFAULT_METRICS

  const isWorkflowTab = activeTab === 'workflow'
  const showHealthcareLogs =
    activeTab === 'logs' && product === 'healthcare' && agentName === 'Frontdesk agent'

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between bg-surface px-2xl">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <BackArrowIcon />
          </button>
          <h1 className="text-h3 text-text-primary">{instanceName}</h1>
          <Chip label={status} variant="success" />
        </div>
        <button
          type="button"
          className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary hover:bg-surface-l2"
        >
          Actions
          <Icon name="expand_more" size={20} className="text-text-icon" />
        </button>
      </div>

      {/* Tabs */}
      <div className="shrink-0 px-2xl">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content — workflow tab fills remaining height, others scroll */}
      {isWorkflowTab ? (
        <WorkflowViewerTab
          instanceName={instanceName}
          onEdit={() => onEditAgent?.(instanceName)}
          product={product}
        />
      ) : (
        <div className="flex-1 overflow-auto">
          {activeTab === 'outcomes' ? (
            <>
              <div className="px-2xl pt-lg">
                <MetricTiles metrics={metrics} />
              </div>
              <div className="px-lg py-lg">
                <DataTable columns={COLUMNS} data={LOCATIONS} />
              </div>
            </>
          ) : showHealthcareLogs ? (
            <AgentLogsTab />
          ) : (
            <div className="flex h-64 items-center justify-center text-body text-text-secondary">
              No {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} data yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
