import { useState } from 'react'
import {
  Chip,
  DataTable,
  Icon,
  MetricTiles,
  Tabs,
  TopNav,
  type ChipVariant,
  type Column,
  type Metric,
  type Tab,
} from '../components'
import { BackArrowIcon } from '../assets/BackArrowIcon'
import { AgentLogsTab } from './AgentLogsTab'
import { AgentSettingsTab } from './AgentSettingsTab'
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
  remindersSent?: string
  responseRate?: string
  avgResponseTime?: string
  noshowRate?: string
  [key: string]: string | undefined
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
    { id: 'responded', value: '8,200', label: 'Conversations responded', delta: '1.3%', trend: 'up', info: true },
    { id: 'resolved', value: '7,380', label: 'Conversations resolved', delta: '2.1%', trend: 'up', info: true },
    { id: 'resolutionRate', value: '90%', label: 'Resolution rate', delta: '1.8%', trend: 'up', info: true },
    { id: 'timeSaved', value: '18h', label: 'Time saved', delta: '12%', trend: 'up', info: true },
  ],
  'Reminder agent': [
    { id: 'sent', value: '2,850', label: 'Reminders sent', delta: '1.3%', trend: 'up', info: true },
    { id: 'responseRate', value: '92%', label: 'Reminder response rate', delta: '1.3%', trend: 'up', info: true },
    { id: 'avgTime', value: '2m', label: 'Average response time', delta: '1.3%', trend: 'up', info: true },
    { id: 'noshow', value: '11%', label: 'No-show rate', delta: '1.3%', trend: 'down', positiveDown: true, info: true },
  ],
  'Outreach agent': [
    // North region: 320 + 242 + 193 + 165 = 920 leads across 358 locations
    { id: 'leads', value: '920', label: 'Leads contacted', delta: '3.7%', trend: 'up', info: true },
    { id: 'response', value: '42%', label: 'Response rate', delta: '1.9%', trend: 'up', info: true },
    { id: 'appointments', value: '268', label: 'Appointments scheduled', delta: '5.4%', trend: 'up', info: true },
    { id: 'conversion', value: '9%', label: 'Conversion rate', delta: '0.7%', trend: 'up', info: true },
  ],
  'Waitlist agent': [
    { id: 'outreach', value: '800', label: 'Outreach sent', delta: '1.3%', trend: 'up', info: true },
    { id: 'slots', value: '780', label: 'Slots filled', delta: '1.3%', trend: 'up', info: true },
    { id: 'fillRate', value: '90%', label: 'Fill rate', delta: '1.3%', trend: 'up', info: true },
    { id: 'timeSaved', value: '20m', label: 'Time saved', delta: '1.3%', trend: 'up', info: true },
  ],
}

const DEFAULT_METRICS: Metric[] = METRICS_BY_AGENT['Frontdesk agent']

const LOCATIONS_BY_AGENT: Record<string, LocationRow[]> = {
  'Frontdesk agent': [
    { location: 'Atlanta, GA',      interactions: '2,850', fcr: '2,565', aht: '90%', escalation: '6h', count: '124' },
    { location: 'Chicago, IL',      interactions: '2,140', fcr: '1,926', aht: '90%', escalation: '5h', count: '98'  },
    { location: 'Boston, MA',       interactions: '1,620', fcr: '1,458', aht: '90%', escalation: '4h', count: '76'  },
    { location: 'Philadelphia, PA', interactions: '1,590', fcr: '1,431', aht: '90%', escalation: '3h', count: '60'  },
  ],
  'Reminder agent': [
    { location: 'Atlanta, GA',      interactions: '590', fcr: '79%', aht: '1m 08s', escalation: '9%',  count: '124', remindersSent: '410', responseRate: '93%', avgResponseTime: '1 day',  noshowRate: '10%' },
    { location: 'Chicago, IL',      interactions: '440', fcr: '77%', aht: '1m 15s', escalation: '10%', count: '98',  remindersSent: '298', responseRate: '91%', avgResponseTime: '2 days', noshowRate: '11%' },
    { location: 'Boston, MA',       interactions: '360', fcr: '76%', aht: '1m 20s', escalation: '11%', count: '76',  remindersSent: '240', responseRate: '89%', avgResponseTime: '2 days', noshowRate: '12%' },
    { location: 'Philadelphia, PA', interactions: '290', fcr: '75%', aht: '1m 24s', escalation: '11%', count: '60',  remindersSent: '154', responseRate: '87%', avgResponseTime: '3 days', noshowRate: '13%' },
  ],
  'Outreach agent': [
    { location: 'Atlanta, GA',      interactions: '320', fcr: '44%', aht: '2m 40s', escalation: '8%',  count: '124' },
    { location: 'Chicago, IL',      interactions: '242', fcr: '42%', aht: '2m 48s', escalation: '9%',  count: '98'  },
    { location: 'Boston, MA',       interactions: '193', fcr: '40%', aht: '2m 55s', escalation: '10%', count: '76'  },
    { location: 'Philadelphia, PA', interactions: '165', fcr: '38%', aht: '3m 05s', escalation: '10%', count: '60'  },
  ],
  'Waitlist agent': [
    { location: 'Atlanta, GA',      interactions: '280', fcr: '91%', aht: '18m', escalation: '6%', count: '180' },
    { location: 'Chicago, IL',      interactions: '210', fcr: '90%', aht: '20m', escalation: '7%', count: '140' },
    { location: 'Boston, MA',      interactions: '160', fcr: '89%', aht: '22m', escalation: '8%', count: '110' },
    { location: 'Philadelphia, PA', interactions: '150', fcr: '88%', aht: '24m', escalation: '8%', count: '70'  },
  ],
}

const FRONTDESK_COLUMNS: Column<LocationRow>[] = [
  { key: 'location', label: 'Location', width: 240, sortable: true },
  { key: 'interactions', label: 'Conversations responded', width: 200, sortable: true },
  { key: 'fcr', label: 'Conversations resolved', width: 200, sortable: true },
  { key: 'aht', label: 'Resolution rate', width: 150, sortable: true },
  { key: 'escalation', label: 'Time saved', width: 130, sortable: true },
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

const DEFAULT_COLUMNS: Column<LocationRow>[] = [
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

const STATUS_VARIANT: Record<string, ChipVariant> = {
  Running: 'success',
  Paused: 'warning',
  Draft: 'neutral',
}

const REMINDER_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',         label: 'Locations',              width: 240, sortable: true },
  { key: 'remindersSent',    label: 'Reminders sent',         width: 170, sortable: true },
  { key: 'responseRate',     label: 'Reminder response rate', width: 210, sortable: true },
  { key: 'avgResponseTime',  label: 'Average response time',  width: 200, sortable: true },
  { key: 'noshowRate',       label: 'No-show rate',           width: 160, sortable: true },
]

export function AgentInstanceScreen({ instanceName, status = 'Running', onBack, onEditAgent, product }: AgentInstanceScreenProps) {
  const [activeTab, setActiveTab] = useState('outcomes')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [instanceStatus, setInstanceStatus] = useState(status)

  // Derive agent name from instance name (e.g. "Frontdesk agent - North region" → "Frontdesk agent")
  const agentName = instanceName.replace(/ - .+$/, '')
  const metrics: Metric[] = METRICS_BY_AGENT[agentName] ?? DEFAULT_METRICS
  const COLUMNS =
    agentName === 'Reminder agent' ? REMINDER_COLUMNS
    : agentName === 'Frontdesk agent' ? FRONTDESK_COLUMNS
    : DEFAULT_COLUMNS
  const locations = LOCATIONS_BY_AGENT[agentName] ?? LOCATIONS_BY_AGENT['Frontdesk agent']

  const isWorkflowTab = activeTab === 'workflow'
  const isSettingsTab = activeTab === 'settings'
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
          <Chip label={instanceStatus} variant={STATUS_VARIANT[instanceStatus] ?? 'neutral'} />
        </div>
        <div className="flex items-center gap-sm">
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionsOpen((open) => !open)}
              className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary hover:bg-surface-l2"
            >
              Actions
              <Icon
                name={actionsOpen ? 'expand_less' : 'expand_more'}
                size={20}
                className="text-text-icon"
              />
            </button>
            {actionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-[105]"
                  onClick={() => setActionsOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full z-[110] mt-xs min-w-[168px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                  <button
                    type="button"
                    className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                    onClick={() => {
                      setInstanceStatus('Paused')
                      setActionsOpen(false)
                    }}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                    onClick={() => setActionsOpen(false)}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="block w-full px-md py-sm text-left text-body text-chip-danger-text hover:bg-surface-hover"
                    onClick={() => {
                      setActionsOpen(false)
                      onBack()
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
          {isSettingsTab && (
            <button
              type="button"
              className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
            >
              Save
            </button>
          )}
        </div>
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
      ) : isSettingsTab ? (
        <AgentSettingsTab product={product} agentName={agentName} />
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
