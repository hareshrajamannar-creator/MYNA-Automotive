import { useMemo, useState } from 'react'
import {
  Chip,
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  Icon,
  InfoCard,
  MetricTiles,
  Tabs,
  TopNav,
  type ChipVariant,
  type Column,
  type ColumnOption,
  type FilterField,
  type Metric,
  type Tab,
} from '../components'
import { AgentInstanceScreen } from './AgentInstanceScreen'

interface AgentDetailScreenProps {
  agentName: string
}

interface AgentInstance {
  name: string
  status: string
  interactions: string
  fcr: string
  aht: string
  escalation: string
  locations: string
  [key: string]: string
}

const TABS: Tab[] = [
  { id: 'agents', label: 'Agents' },
  { id: 'library', label: 'Library' },
]

const STATUS_VARIANT: Record<string, ChipVariant> = {
  Active: 'success',
  Training: 'warning',
  Paused: 'neutral',
  Inactive: 'danger',
}

const REGIONS = [
  { region: 'North region', status: 'Active', interactions: '162', fcr: '93%', aht: '2m 18s', escalation: '8%', locations: '358' },
  { region: 'East region', status: 'Training', interactions: '98', fcr: '89%', aht: '3m 05s', escalation: '12%', locations: '212' },
  { region: 'South region', status: 'Paused', interactions: '33', fcr: '90%', aht: '2m 41s', escalation: '10%', locations: '180' },
  { region: 'West region', status: 'Inactive', interactions: '13', fcr: '83%', aht: '4m 02s', escalation: '14%', locations: '140' },
]

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

export function AgentDetailScreen({ agentName }: AgentDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('agents')
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)

  const metrics: Metric[] = [
    { id: 'interactions', value: '2,850', label: 'Interactions handled' },
    { id: 'fcr', value: '92%', label: 'First contact resolution rate' },
    { id: 'aht', value: '2m 34s', label: 'Average handle time' },
    { id: 'escalation', value: '11%', label: 'Escalation rate' },
  ]

  const data: AgentInstance[] = REGIONS.map((r) => ({
    name: `${agentName} - ${r.region}`,
    status: r.status,
    interactions: r.interactions,
    fcr: r.fcr,
    aht: r.aht,
    escalation: r.escalation,
    locations: r.locations,
  }))

  const COLUMN_DEFS: Array<Column<AgentInstance> & { locked?: boolean }> = [
    { key: 'name', label: 'Agent name', width: 280, sortable: true, locked: true },
    {
      key: 'status',
      label: 'Status',
      width: 140,
      sortable: true,
      render: (v) => <Chip label={String(v)} variant={STATUS_VARIANT[String(v)] ?? 'neutral'} />,
    },
    { key: 'interactions', label: 'Interactions handled', width: 180, sortable: true },
    { key: 'fcr', label: 'First contact resolution', width: 200, sortable: true },
    { key: 'aht', label: 'Average handle time', width: 180, sortable: true },
    { key: 'escalation', label: 'Escalation rate', width: 150, sortable: true },
    { key: 'locations', label: 'Locations', width: 130, sortable: true },
  ]

  const DEF_BY_KEY = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))
  const DEFAULT_ORDER = COLUMN_DEFS.map((c) => String(c.key))
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible] = useState<string[]>(DEFAULT_ORDER)

  const columns = useMemo<Column<AgentInstance>[]>(
    () => order.filter((k) => visible.includes(k)).map((k) => DEF_BY_KEY.get(k)!).filter(Boolean),
    [order, visible],
  )
  const columnOptions = useMemo<ColumnOption[]>(
    () => order.map((k) => ({ key: k, label: DEF_BY_KEY.get(k)!.label, locked: DEF_BY_KEY.get(k)!.locked })),
    [order],
  )

  const FILTER_FIELDS: FilterField[] = [
    { id: 'status', label: 'Status', options: opts('Active', 'Training', 'Paused', 'Inactive') },
    { id: 'region', label: 'Region', options: opts('North region', 'East region', 'South region', 'West region') },
    { id: 'location', label: 'Location', options: opts('Mountain View', 'Palo Alto', 'San Jose', 'Sunnyvale') },
  ]

  const libraryCards = [
    {
      title: `${agentName} routing and triage`,
      description:
        'Handles inbound calls, identifies intent, routes hot leads, and transfers to the right team with full context.',
    },
    {
      title: `${agentName} for new lead intake`,
      description:
        'Captures contact details, qualifies budget and timeline, and guides shoppers to the right vehicle and appointment.',
    },
    {
      title: `${agentName} for test-drive scheduling`,
      description: 'Confirms vehicle availability, books a test-drive slot, and sends reminders with directions.',
    },
    {
      title: `${agentName} for trade-in inquiries`,
      description: 'Collects vehicle details, shares an instant estimate range, and books an appraisal appointment.',
    },
  ]

  if (selectedInstance) {
    return <AgentInstanceScreen instanceName={selectedInstance} onBack={() => setSelectedInstance(null)} />
  }

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Header */}
          <div className="flex h-16 items-center justify-between bg-surface px-2xl">
            <h1 className="text-h3 text-text-primary">{agentName}</h1>
            <div className="flex items-center gap-sm">
              <button type="button" aria-label="Search" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
                <Icon name="search" size={20} />
              </button>
              <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body font-medium text-white transition-colors hover:bg-primary-hover">
                Create agent
              </button>
              {activeTab === 'agents' && (
                <>
                  <button type="button" aria-label="Customize columns" onClick={() => setCustomizeOpen(true)} className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
                    <Icon name="view_column" size={20} />
                  </button>
                  <button type="button" aria-label="Filters" onClick={() => setFilterOpen((o) => !o)} className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
                    <Icon name="filter_list" size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-2xl">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === 'agents' ? (
            <>
              <div className="px-2xl pt-lg">
                <MetricTiles metrics={metrics} />
              </div>
              <div className="px-lg py-lg">
                <DataTable columns={columns} data={data} onRowClick={(row) => setSelectedInstance(row.name)} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-lg px-2xl py-lg md:grid-cols-2 xl:grid-cols-3">
              {libraryCards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
          )}
        </div>

        <FilterPanel open={filterOpen} fields={FILTER_FIELDS} onClose={() => setFilterOpen(false)} />
      </div>

      <CustomizeColumnsDrawer
        open={customizeOpen}
        options={columnOptions}
        visibleKeys={visible}
        onClose={() => setCustomizeOpen(false)}
        onSave={(orderedKeys, visibleKeys) => {
          setOrder(orderedKeys)
          setVisible(visibleKeys)
        }}
        onRestoreDefault={() => {
          setOrder(DEFAULT_ORDER)
          setVisible(DEFAULT_ORDER)
        }}
      />
    </div>
  )
}
