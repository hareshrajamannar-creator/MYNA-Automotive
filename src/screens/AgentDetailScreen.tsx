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
import { NewFrontdeskAgentSetupScreen } from './NewFrontdeskAgentSetupScreen'

interface AgentDetailScreenProps {
  agentName: string
  onEditAgent?: (agentName: string) => void
  onOpenIntegrationSettings?: (integrationId: string) => void
  product?: string
}

interface AgentInstance {
  name: string
  status: string
  locations: string
  interactions?: string
  fcr?: string
  aht?: string
  escalation?: string
  remindersSent?: string
  responseRate?: string
  avgResponseTime?: string
  noshowRate?: string
  outreachSent?: string
  slotsFilled?: string
  fillRate?: string
  timeSaved?: string
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
  locations: string
  interactions?: string
  fcr?: string
  aht?: string
  escalation?: string
  remindersSent?: string
  responseRate?: string
  avgResponseTime?: string
  noshowRate?: string
  outreachSent?: string
  slotsFilled?: string
  fillRate?: string
  timeSaved?: string
}

const REGIONS_BY_AGENT: Record<string, RegionRow[]> = {
  'Front desk agent': [
    { region: 'North region', status: 'Running', interactions: '8,200', fcr: '7,380', aht: '90%', escalation: '18h', locations: '358' },
    { region: 'East region',  status: 'Running', interactions: '5,600', fcr: '4,928', aht: '88%', escalation: '12h', locations: '212' },
    { region: 'South region', status: 'Paused',  interactions: '2,900', fcr: '2,494', aht: '86%', escalation: '6h',  locations: '180' },
    { region: 'West region',  status: 'Draft',   interactions: '1,720', fcr: '1,428', aht: '83%', escalation: '4h',  locations: '140' },
  ],
  'Reminder agent': [
    { region: 'North region', status: 'Running', interactions: '1,680', fcr: '78%', aht: '1m 12s', escalation: '10%', locations: '358', remindersSent: '1,102', responseRate: '92%', avgResponseTime: '2 days', noshowRate: '11%' },
    { region: 'East region',  status: 'Running', interactions: '1,120', fcr: '75%', aht: '1m 25s', escalation: '12%', locations: '212', remindersSent: '820',  responseRate: '89%', avgResponseTime: '2 days', noshowRate: '13%' },
    { region: 'South region', status: 'Paused',  interactions: '640',  fcr: '73%', aht: '1m 38s', escalation: '14%', locations: '180', remindersSent: '530',  responseRate: '85%', avgResponseTime: '3 days', noshowRate: '14%' },
    { region: 'West region',  status: 'Draft',   interactions: '407',  fcr: '68%', aht: '1m 55s', escalation: '15%', locations: '140', remindersSent: '398',  responseRate: '82%', avgResponseTime: '3 days', noshowRate: '16%' },
  ],
  'Outreach agent': [
    { region: 'North region', status: 'Running', interactions: '920', fcr: '42%', aht: '2m 45s', escalation: '9%',  locations: '358' },
    { region: 'East region',  status: 'Running', interactions: '610', fcr: '37%', aht: '3m 10s', escalation: '12%', locations: '212' },
    { region: 'South region', status: 'Paused',  interactions: '360', fcr: '35%', aht: '3m 30s', escalation: '14%', locations: '180' },
    { region: 'West region',  status: 'Draft',   interactions: '213', fcr: '30%', aht: '3m 55s', escalation: '17%', locations: '140' },
  ],
  'Waitlist agent': [
    // Total: 2,850 outreach | 2,760 slots filled | 92% fill rate | 37m time saved
    { region: 'North region', status: 'Running', outreachSent: '800',  slotsFilled: '780',  fillRate: '90%', timeSaved: '20m', locations: '500' },
    { region: 'East Region',  status: 'Running', outreachSent: '500',  slotsFilled: '400',  fillRate: '85%', timeSaved: '5m',  locations: '250' },
    { region: 'South Region', status: 'Paused',  outreachSent: '500',  slotsFilled: '490',  fillRate: '75%', timeSaved: '10m', locations: '200' },
    { region: 'West Region',  status: 'Draft',   outreachSent: '1050', slotsFilled: '1000', fillRate: '95%', timeSaved: '2m',  locations: '100' },
  ],
}

const DEFAULT_REGIONS: RegionRow[] = REGIONS_BY_AGENT['Front desk agent']

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

type LibraryView = 'grid' | 'list'

// ── Library template cards for the create-agent empty state ───────────────
const LIBRARY_TEMPLATES = [
  {
    id: 'routing',
    title: 'Routing and triage',
    description: 'Handles inbound calls, identifies intent, routes urgent symptoms, and transfers to the right team with context',
  },
  {
    id: 'new-patient',
    title: 'New patient intake',
    description: 'Guides new patients through intake, verifies their insurance, and books the right appointment',
  },
  {
    id: 'established',
    title: 'Established patient scheduling',
    description: 'Validates existing records, checks coverage, and books or reschedules follow-up visits with preferred providers',
  },
  {
    id: 'urgent',
    title: 'Urgent escalations',
    description: 'Detects high-risk symptoms, follows escalation policy, and hands off immediately to clinical staff or emergency guidance',
  },
]

// ── Illustration for the create-agent empty state ──────────────────────────
function CreateAgentEmptyState({
  onCreateFromScratch,
  onSelectFromLibrary,
}: {
  onCreateFromScratch: () => void
  onSelectFromLibrary: (templateId: string) => void
}) {
  return (
    <div className="flex w-full max-w-[980px] flex-col items-center gap-[24px] py-lg">
      {/* Mini workflow illustration */}
      <div className="relative shrink-0">
        <div
          style={{
            width: 168,
            background: '#fff',
            borderRadius: 6,
            padding: '20px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 12px rgba(33,33,33,0.08)',
          }}
        >
          <div style={{ background: '#ebeff6', borderRadius: 4, height: 23, width: 76, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <div style={{ background: '#afbcdf', height: 4, borderRadius: 100, width: 51 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 36, height: 31, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="36" height="31" viewBox="0 0 36 31" fill="none" style={{ position: 'absolute' }}>
                  <path d="M18 0 L18 12 M18 12 L6 24 M18 12 L30 24" stroke="#afbcdf" strokeWidth="1" fill="none" />
                </svg>
                <div style={{ background: '#f4f6f7', borderRadius: 40, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#555', lineHeight: 1 }}>add</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 1, width: '100%' }}>
            <div style={{ background: '#ebeff6', border: '1px dashed #2b3650', borderRadius: 4, height: 23, width: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#555', lineHeight: 1 }}>add</span>
            </div>
            <div style={{ background: '#ebeff6', borderRadius: 4, height: 23, flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              <div style={{ background: '#afbcdf', height: 4, borderRadius: 100, width: '80%' }} />
            </div>
          </div>
        </div>
        {/* AI overlay chip */}
        <div style={{ position: 'absolute', top: -23, right: -62, background: '#ecf5fd', border: '1px solid #6834b7', borderRadius: 4, padding: '11px 7px', display: 'flex', alignItems: 'flex-end', gap: 5, width: 116 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6834b7', lineHeight: 1 }}>auto_awesome</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ background: '#3790e7', height: 4, borderRadius: 100, width: '100%' }} />
            <div style={{ background: '#9aceff', height: 4, borderRadius: 100, width: '60%' }} />
          </div>
        </div>
      </div>

      {/* Copy + CTAs */}
      <div className="flex flex-col items-center gap-sm text-center">
        <p style={{ fontSize: 14, lineHeight: '20px', letterSpacing: '-0.28px', color: '#212121', margin: 0 }}>
          Build your agent.{' '}
          <button
            type="button"
            onClick={onCreateFromScratch}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#1976d2', fontSize: 14, fontFamily: 'inherit', letterSpacing: '-0.28px', lineHeight: '20px' }}
          >
            Set up a new agent
          </button>
        </p>
        <p style={{ fontSize: 14, color: '#212121', margin: 0, letterSpacing: '-0.28px', lineHeight: '20px' }}>or</p>
        <p style={{ fontSize: 14, color: '#212121', margin: 0, letterSpacing: '-0.28px', lineHeight: '20px' }}>
          Select from <span style={{ color: '#1976d2' }}>library</span>
        </p>
      </div>

      {/* Library template cards — same InfoCard component as the Library tab */}
      <div className="grid w-full grid-cols-4 gap-md">
        {LIBRARY_TEMPLATES.map((tpl) => (
          <InfoCard
            key={tpl.id}
            title={tpl.title}
            description={tpl.description}
            actionLabel="Use agent"
            onAction={() => onSelectFromLibrary(tpl.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function AgentDetailScreen({ agentName, onEditAgent, onOpenIntegrationSettings, product }: AgentDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('agents')
  const [libraryView, setLibraryView] = useState<LibraryView>('grid')
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [showSetupPage, setShowSetupPage] = useState(false)

  const METRICS_BY_AGENT: Record<string, Metric[]> = {
    'Front desk agent': [
      { id: 'responded', value: '18,420', label: 'Conversations responded', delta: '1.3%', trend: 'up', info: true },
      { id: 'resolved', value: '16,230', label: 'Conversations resolved', delta: '2.1%', trend: 'up', info: true },
      { id: 'resolutionRate', value: '88%', label: 'Resolution rate', delta: '1.8%', trend: 'up', info: true },
      { id: 'timeSaved', value: '40h', label: 'Time saved', delta: '12%', trend: 'up', info: true },
    ],
    'Reminder agent': [
      { id: 'sent', value: '2,850', label: 'Reminders sent', delta: '1.3%', trend: 'up', info: true },
      { id: 'responseRate', value: '92%', label: 'Reminder response rate', delta: '1.3%', trend: 'up', info: true },
      { id: 'avgTime', value: '2 days', label: 'Average response time', delta: '1.3%', trend: 'up', info: true },
      { id: 'noshow', value: '11%', label: 'No-show rate', delta: '1.3%', trend: 'down', positiveDown: true, info: true },
    ],
    'Outreach agent': [
      { id: 'leads', value: '2,103', label: 'Leads contacted' },
      { id: 'response', value: '38%', label: 'Response rate' },
      { id: 'appointments', value: '641', label: 'Appointments scheduled' },
      { id: 'conversion', value: '11%', label: 'Conversion rate' },
    ],
  }

  const DEFAULT_METRICS: Metric[] = [
    { id: 'interactions', value: '2,850', label: 'Interactions handled', info: true },
    { id: 'fcr', value: '92%', label: 'First contact resolution rate', info: true },
    { id: 'aht', value: '2m 34s', label: 'Average handle time', info: true },
    { id: 'escalation', value: '11%', label: 'Escalation rate', info: true },
  ]

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
    remindersSent: r.remindersSent,
    responseRate: r.responseRate,
    avgResponseTime: r.avgResponseTime,
    noshowRate: r.noshowRate,
    outreachSent: r.outreachSent,
    slotsFilled: r.slotsFilled,
    fillRate: r.fillRate,
    timeSaved: r.timeSaved,
  }))

  const isReminder = agentName === 'Reminder agent'
  const isFrontdesk = agentName === 'Front desk agent'
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
    ] : isFrontdesk ? [
      { key: 'interactions' as keyof AgentInstance, label: 'Conversations responded', width: 200, sortable: true },
      { key: 'fcr' as keyof AgentInstance, label: 'Conversations resolved', width: 200, sortable: true },
      { key: 'aht' as keyof AgentInstance, label: 'Resolution rate', width: 150, sortable: true },
      { key: 'escalation' as keyof AgentInstance, label: 'Time saved', width: 130, sortable: true },
    ] : [
      { key: 'interactions' as keyof AgentInstance, label: 'Interactions handled', width: 200, sortable: true },
      { key: 'fcr' as keyof AgentInstance, label: 'First contact resolution rate', width: 220, sortable: true },
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

  const libraryCards = LIBRARY_TEMPLATES.map((tpl) => ({
    title: tpl.title,
    description: tpl.description,
  }))

  if (showSetupWizard && isFrontdesk) {
    return (
      <NewFrontdeskAgentSetupScreen
        onBack={() => setShowSetupWizard(false)}
        onCancel={() => {
          setShowSetupWizard(false)
          setShowCreateFlow(false)
        }}
        onComplete={(name) => {
          setShowSetupWizard(false)
          setShowCreateFlow(false)
          onEditAgent?.(name)
        }}
      />
    )
  }

  if (showSetupPage && isFrontdesk) {
    return (
      <div className="flex h-full flex-col">
        <TopNav initials="S" />
        <div className="flex h-16 shrink-0 items-center gap-sm bg-surface px-2xl">
          <button
            type="button"
            onClick={() => setShowSetupPage(false)}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            aria-label="Back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <h1 className="text-h3 text-text-primary">New front desk agent</h1>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-lg overflow-auto px-2xl py-3xl">
          {/* Empty canvas hint */}
          <div className="flex size-16 items-center justify-center rounded-full bg-surface-subtle">
            <Icon name="smart_toy" size={32} className="text-text-tertiary" />
          </div>

          <div className="flex max-w-[440px] flex-col items-center gap-sm text-center">
            <p className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">
              Your agent canvas is empty
            </p>
            <p className="text-body text-text-secondary">
              Start by adding a trigger to define when your agent should activate — for example, when an inbound call or web chat comes in.
            </p>
          </div>

          <div className="flex flex-col items-center gap-xs">
            <button
              type="button"
              onClick={() => {
                setShowSetupPage(false)
                setShowCreateFlow(false)
                onEditAgent?.('')
              }}
              className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
            >
              Start building
            </button>
            <p className="text-small text-text-tertiary">
              You can also add steps from the workflow editor
            </p>
          </div>

          {/* Help tiles */}
          <div className="mt-md grid w-full max-w-[640px] grid-cols-3 gap-md">
            {[
              { icon: 'bolt', title: 'Add a trigger', body: 'Choose what starts the agent — an inbound call, a scheduled time, or a CRM event.' },
              { icon: 'list_alt', title: 'Define tasks', body: 'Add the steps your agent will follow: gather info, check records, route the caller.' },
              { icon: 'call_split', title: 'Set up branches', body: 'Handle different outcomes by branching the flow based on conditions or responses.' },
            ].map((tile) => (
              <div key={tile.title} className="flex flex-col gap-sm rounded-md border border-border bg-surface p-lg">
                <div className="flex size-8 items-center justify-center rounded-sm bg-surface-subtle">
                  <Icon name={tile.icon} size={18} className="text-text-secondary" />
                </div>
                <p className="text-body text-text-primary">{tile.title}</p>
                <p className="text-small leading-[18px] text-text-secondary">{tile.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showCreateFlow && isFrontdesk) {
    return (
      <div className="flex h-full flex-col">
        <TopNav initials="S" />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex h-16 items-center justify-between bg-surface px-2xl">
            <div className="flex items-center gap-sm">
              <button
                type="button"
                onClick={() => setShowCreateFlow(false)}
                className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
                aria-label="Back"
              >
                <Icon name="arrow_back" size={20} />
              </button>
              <h1 className="text-h3 text-text-primary">New front desk agent</h1>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto p-lg">
            <CreateAgentEmptyState
              onCreateFromScratch={() => setShowSetupPage(true)}
              onSelectFromLibrary={(_templateId) => { setShowCreateFlow(false); onEditAgent?.('') }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (selectedInstance) {
    return (
      <AgentInstanceScreen
        instanceName={selectedInstance}
        onBack={() => setSelectedInstance(null)}
        onEditAgent={onEditAgent}
        onOpenIntegrationSettings={onOpenIntegrationSettings}
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
                  <button
                    type="button"
                    onClick={() => isFrontdesk ? setShowCreateFlow(true) : onEditAgent?.('')}
                    className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
                  >
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
            <div className="grid grid-cols-1 gap-lg px-2xl py-lg md:grid-cols-2 xl:grid-cols-4">
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
