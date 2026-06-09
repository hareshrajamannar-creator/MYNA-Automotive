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

/* Instance-level metrics = North region numbers (the first/largest instance per agent).
   These must match the corresponding row in AgentDetailScreen's REGIONS_BY_AGENT.
   North region totals also equal the sum of the LOCATIONS_BY_AGENT rows below. */
const METRICS_BY_AGENT: Record<string, Metric[]> = {
  'Frontdesk agent': [
    // North region: 2,850 + 2,140 + 1,620 + 1,590 = 8,200 interactions across 358 locations
    { id: 'interactions', value: '8,200', label: 'Interactions handled', delta: '1.3%', trend: 'up', info: true },
    { id: 'fcr', value: '90%', label: 'First contact resolution', delta: '2.1%', trend: 'up', info: true },
    { id: 'aht', value: '2m 05s', label: 'Average handle time', delta: '0.8%', trend: 'down', info: true },
    { id: 'escalation', value: '7%', label: 'Escalation rate', delta: '1.1%', trend: 'down', info: true },
  ],
  'Reminder agent': [
    // North region: 590 + 440 + 360 + 290 = 1,680 confirmations across 358 locations
    { id: 'confirmed', value: '1,680', label: 'Appointments confirmed', delta: '4.2%', trend: 'up', info: true },
    { id: 'reschedule', value: '10%', label: 'Reschedule rate', delta: '0.5%', trend: 'down', info: true },
    { id: 'noshow', value: '37%', label: 'No-show reduction', delta: '6.1%', trend: 'up', info: true },
    { id: 'messages', value: '4,920', label: 'Messages sent', delta: '2.3%', trend: 'up', info: true },
  ],
  'Outreach agent': [
    // North region: 320 + 242 + 193 + 165 = 920 leads across 358 locations
    { id: 'leads', value: '920', label: 'Leads contacted', delta: '3.7%', trend: 'up', info: true },
    { id: 'response', value: '42%', label: 'Response rate', delta: '1.9%', trend: 'up', info: true },
    { id: 'appointments', value: '268', label: 'Appointments scheduled', delta: '5.4%', trend: 'up', info: true },
    { id: 'conversion', value: '9%', label: 'Conversion rate', delta: '0.7%', trend: 'up', info: true },
  ],
}

const DEFAULT_METRICS: Metric[] = METRICS_BY_AGENT['Frontdesk agent']

/* Per-agent location breakdown for the North region instance.
   Interactions sum = instance tile | location counts sum = 358. */
const LOCATIONS_BY_AGENT: Record<string, LocationRow[]> = {
  'Frontdesk agent': [
    { location: 'Atlanta, GA',      interactions: '2,850', fcr: '91%', aht: '2m 00s', escalation: '6%', count: '124' },
    { location: 'Chicago, IL',      interactions: '2,140', fcr: '90%', aht: '2m 05s', escalation: '7%', count: '98'  },
    { location: 'Boston, MA',       interactions: '1,620', fcr: '89%', aht: '2m 10s', escalation: '8%', count: '76'  },
    { location: 'Philadelphia, PA', interactions: '1,590', fcr: '88%', aht: '2m 15s', escalation: '8%', count: '60'  },
  ],
  'Reminder agent': [
    { location: 'Atlanta, GA',      interactions: '590', fcr: '79%', aht: '1m 08s', escalation: '9%',  count: '124' },
    { location: 'Chicago, IL',      interactions: '440', fcr: '77%', aht: '1m 15s', escalation: '10%', count: '98'  },
    { location: 'Boston, MA',       interactions: '360', fcr: '76%', aht: '1m 20s', escalation: '11%', count: '76'  },
    { location: 'Philadelphia, PA', interactions: '290', fcr: '75%', aht: '1m 24s', escalation: '11%', count: '60'  },
  ],
  'Outreach agent': [
    { location: 'Atlanta, GA',      interactions: '320', fcr: '44%', aht: '2m 40s', escalation: '8%',  count: '124' },
    { location: 'Chicago, IL',      interactions: '242', fcr: '42%', aht: '2m 48s', escalation: '9%',  count: '98'  },
    { location: 'Boston, MA',       interactions: '193', fcr: '40%', aht: '2m 55s', escalation: '10%', count: '76'  },
    { location: 'Philadelphia, PA', interactions: '165', fcr: '38%', aht: '3m 05s', escalation: '10%', count: '60'  },
  ],
}

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
  const locations = LOCATIONS_BY_AGENT[agentName] ?? LOCATIONS_BY_AGENT['Frontdesk agent']

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
                <DataTable columns={COLUMNS} data={locations} />
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
