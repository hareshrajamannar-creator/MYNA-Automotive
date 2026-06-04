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

interface AgentInstanceScreenProps {
  instanceName: string
  status?: string
  onBack: () => void
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

const METRICS: Metric[] = [
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

export function AgentInstanceScreen({ instanceName, status = 'Running', onBack }: AgentInstanceScreenProps) {
  const [activeTab, setActiveTab] = useState('outcomes')

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex h-16 items-center justify-between bg-surface px-2xl">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            >
              <Icon name="chevron_left" size={20} />
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
        <div className="px-2xl">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'outcomes' ? (
          <>
            <div className="px-2xl pt-lg">
              <MetricTiles metrics={METRICS} />
            </div>
            <div className="px-lg py-lg">
              <DataTable columns={COLUMNS} data={LOCATIONS} />
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-body text-text-secondary">
            No {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} data yet.
          </div>
        )}
      </div>
    </div>
  )
}
