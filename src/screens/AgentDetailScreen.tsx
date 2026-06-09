import { useMemo, useState } from 'react'
import {
  Chip,
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  Icon,
  InfoCard,
  InfoCardListItem,
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
  onEditAgent?: (agentName: string) => void
  product?: string
}

interface AgentInstance {
  name: string
  status: string
  interactions: string
  fcr: string
  aht: string
  escalation: string
  locations: string
  remindersSent?: string
  responseRate?: string
  avgResponseTime?: string
  noshowRate?: string
  [key: string]: string | undefined
}

const TABS: Tab[] = [
  { id: 'agents', label: 'Agents' },
  { id: 'library', label: 'Library' },
]

const STATUS_VARIANT: Record<string, ChipVariant> = {
  Running: 'success',
  Paused:  'warning',
  Draft:   'neutral',
}

interface RegionRow {
  region: string
  status: string
  interactions: string
  fcr: string
  aht: string
  escalation: string
  locations: string
}

const REGIONS_BY_AGENT: Record<string, RegionRow[]> = {
  'Frontdesk agent': [
    { region: 'North region', status: 'Running', interactions: '8,200', fcr: '90%', aht: '2m 05s', escalation: '7%',  locations: '358' },
    { region: 'East region',  status: 'Running', interactions: '5,600', fcr: '88%', aht: '2m 20s', escalation: '9%',  locations: '212' },
    { region: 'South region', status: 'Paused',  interactions: '2,900', fcr: '86%', aht: '2m 38s', escalation: '10%', locations: '180' },
    { region: 'West region',  status: 'Draft',   interactions: '1,720', fcr: '83%', aht: '3m 10s', escalation: '13%', locations: '140' },
  ],
  'Reminder agent': [
    { region: 'North region', status: 'Running', interactions: '1,680', fcr: '78%', aht: '1m 12s', escalation: '10%', locations: '358' },
    { region: 'East region',  status: 'Running', interactions: '1,120', fcr: '75%', aht: '1m 25s', escalation: '12%', locations: '212' },
    { region: 'South region', status: 'Paused',  interactions: '640',  fcr: '73%', aht: '1m 38s', escalation: '14%', locations: '180' },
    { region: 'West region',  status: 'Draft',   interactions: '407',  fcr: '68%', aht: '1m 55s', escalation: '15%', locations: '140' },
  ],
  'Outreach agent': [
    { region: 'North region', status: 'Running', interactions: '920', fcr: '42%', aht: '2m 45s', escalation: '9%',  locations: '358' },
    { region: 'East region',  status: 'Running', interactions: '610', fcr: '37%', aht: '3m 10s', escalation: '12%', locations: '212' },
    { region: 'South region', status: 'Paused',  interactions: '360', fcr: '35%', aht: '3m 30s', escalation: '14%', locations: '180' },
    { region: 'West region',  status: 'Draft',   interactions: '213', fcr: '30%', aht: '3m 55s', escalation: '17%', locations: '140' },
  ],
}

const DEFAULT_REGIONS: RegionRow[] = REGIONS_BY_AGENT['Frontdesk agent']

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

type LibraryView = 'grid' | 'list'

export function AgentDetailScreen({ agentName, onEditAgent, product }: AgentDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('agents')
  const [libraryView, setLibraryView] = useState<LibraryView>('grid')
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)

  const METRICS_BY_AGENT: Record<string, Metric[]> = {
    'Frontdesk agent': [
      // Aggregate of 4 regions: 8,200 + 5,600 + 2,900 + 1,720 = 18,420
      { id: 'interactions', value: '18,420', label: 'Interactions handled', info: true },
      { id: 'fcr', value: '88%', label: 'First contact resolution', info: true },
      { id: 'aht', value: '2m 21s', label: 'Average handle time', info: true },
      { id: 'escalation', value: '9%', label: 'Escalation rate', info: true },
    ],
    'Reminder agent': [
      { id: 'sent', value: '2,850', label: 'Reminders sent', delta: '1.3%', trend: 'up', info: true },
      { id: 'responseRate', value: '92%', label: 'Reminder response rate', delta: '1.3%', trend: 'up', info: true },
      { id: 'avgTime', value: '2 days', label: 'Average response time', delta: '1.3%', trend: 'up', info: true },
      { id: 'noshow', value: '11%', label: 'No-show rate', delta: '1.3%', trend: 'down', positiveDown: true, info: true },
    ],
    'Outreach agent': [
      // Aggregate: 920 + 610 + 360 + 213 = 2,103 leads
      { id: 'leads', value: '2,103', label: 'Leads contacted' },
      { id: 'response', value: '38%', label: 'Response rate' },
      { id: 'appointments', value: '641', label: 'Appointments scheduled' },
      { id: 'conversion', value: '11%', label: 'Conversion rate' },
    ],
  }

  const DEFAULT_METRICS: Metric[] = METRICS_BY_AGENT['Frontdesk agent']

  const metrics: Metric[] = METRICS_BY_AGENT[agentName] ?? DEFAULT_METRICS

  const regions = REGIONS_BY_AGENT[agentName] ?? DEFAULT_REGIONS
  const data: AgentInstance[] = regions.map((r) => ({
    name: `${agentName} - ${r.region}`,
    status: r.status,
    interactions: r.interactions,
    fcr: r.fcr,
    aht: r.aht,
    escalation: r.escalation,
    locations: r.locations,
  }))

  const isReminder = agentName === 'Reminder agent'
  const COLUMN_DEFS: Array<Column<AgentInstance> & { locked?: boolean }> = [
    { key: 'name', label: 'Agent name', width: 280, sortable: true, locked: true },
    {
      key: 'status',
      label: 'Status',
      width: 140,
      sortable: true,
      render: (v) => <Chip label={String(v)} variant={STATUS_VARIANT[String(v)] ?? 'neutral'} />,
    },
    ...(isReminder ? [
      { key: 'remindersSent' as keyof AgentInstance, label: 'Reminders sent', width: 160, sortable: true },
      { key: 'responseRate' as keyof AgentInstance, label: 'Reminder response rate', width: 200, sortable: true },
      { key: 'avgResponseTime' as keyof AgentInstance, label: 'Average response time', width: 190, sortable: true },
      { key: 'noshowRate' as keyof AgentInstance, label: 'No-show rate', width: 150, sortable: true },
    ] : [
      { key: 'interactions' as keyof AgentInstance, label: 'Interactions handled', width: 180, sortable: true },
      { key: 'fcr' as keyof AgentInstance, label: 'First contact resolution', width: 200, sortable: true },
      { key: 'aht' as keyof AgentInstance, label: 'Average handle time', width: 180, sortable: true },
      { key: 'escalation' as keyof AgentInstance, label: 'Escalation rate', width: 150, sortable: true },
    ]),
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
    { id: 'status', label: 'Status', options: opts('Running', 'Paused', 'Draft') },
    { id: 'region', label: 'Region', options: opts('North region', 'East region', 'South region', 'West region') },
    { id: 'location', label: 'Location', options: opts('Mountain View', 'Palo Alto', 'San Jose', 'Sunnyvale') },
  ]

  const libraryCards = [
    {
      title: 'Routing and Triage',
      description:
        'Handles inbound calls, texts, and web chats to identify patient needs, answer questions from the knowledge base, manage appointments & verify insurance',
    },
  ]

  if (selectedInstance) {
    return (
      <AgentInstanceScreen
        instanceName={selectedInstance}
        onBack={() => setSelectedInstance(null)}
        onEditAgent={onEditAgent}
        product={product}
      />
    )
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
              {activeTab === 'agents' ? (
                <>
                  <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
                    Create agent
                  </button>
                  <button type="button" aria-label="Customize columns" onClick={() => setCustomizeOpen(true)} className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
                    <Icon name="view_column" size={20} />
                  </button>
                  <button type="button" aria-label="Filters" onClick={() => setFilterOpen((o) => !o)} className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
                    <Icon name="filter_list" size={20} />
                  </button>
                </>
              ) : (
                <div className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-sm">
                  <button
                    type="button"
                    aria-label="Grid view"
                    onClick={() => setLibraryView('grid')}
                    className={`flex size-6 items-center justify-center rounded-sm transition-colors ${
                      libraryView === 'grid' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'
                    }`}
                  >
                    <Icon name="grid_view" size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="List view"
                    onClick={() => setLibraryView('list')}
                    className={`flex size-6 items-center justify-center rounded-sm transition-colors ${
                      libraryView === 'list' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'
                    }`}
                  >
                    <Icon name="table_rows" size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-2xl">
            <Tabs
              tabs={TABS}
              activeTab={activeTab}
              onChange={(tabId) => {
                setActiveTab(tabId)
                if (tabId === 'library') setLibraryView('grid')
              }}
            />
          </div>

          {activeTab === 'agents' ? (
            <>
              <div className="px-2xl pt-lg">
                <MetricTiles metrics={metrics} />
              </div>
              <div className="px-lg py-lg">
                <DataTable
                  columns={columns}
                  data={data}
                  onRowClick={(row) => setSelectedInstance(row.name)}
                  rowMenuItems={[
                    { label: 'Edit', onClick: (row) => onEditAgent?.(row.name) },
                    {
                      label: 'Pause',
                      onClick: () => {},
                      visible: (row) => row.status === 'Running',
                    },
                    { label: 'Duplicate', onClick: () => {} },
                    { label: 'View details', onClick: (row) => setSelectedInstance(row.name) },
                    { label: 'Reports', onClick: () => {} },
                    { label: 'Delete', onClick: () => {}, variant: 'danger' },
                  ]}
                />
              </div>
            </>
          ) : libraryView === 'grid' ? (
            <div className="grid grid-cols-1 gap-lg px-2xl py-lg md:grid-cols-2 xl:grid-cols-3">
              {libraryCards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
          ) : (
            <div className="px-2xl py-lg">
              {libraryCards.map((card, i) => (
                <InfoCardListItem key={card.title} first={i === 0} {...card} />
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
