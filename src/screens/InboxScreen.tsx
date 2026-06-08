import { useEffect, useRef, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsSankey from 'highcharts/modules/sankey'
import { ChartCard, DataTable, DonutChart, Icon, StackedBarChart, SummaryStats, TopNav, type Column, type NavSection } from '../components'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(Highcharts as any).seriesTypes?.sankey) { (HighchartsSankey as any)(Highcharts) }

interface Conversation {
  id: string
  name: string
  verified?: boolean
  message: string
  location: string
  sublocation?: string
  assignee?: string
  date: string
  unread?: boolean
  replyIcon?: boolean
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Cameron Williamson', verified: true, message: 'You can find more details here: https://birdeye.com', location: 'Austin', sublocation: 'Savannah', date: '03:25 PM', replyIcon: true },
  { id: '2', name: 'Annette Black',      verified: true, message: 'Kelsy Hiltz: yes',                                   location: 'San Francisco', assignee: 'Kelsy Hiltz', date: 'Dec 31, 2022', unread: true },
  { id: '3', name: 'Wade Warren',                        message: 'Robin: Was your question answered?',                  location: 'San Francisco', assignee: 'USA - Sales', date: 'Dec 11, 2022', unread: true },
  { id: '4', name: 'Floyd Miles',                        message: 'Robin: Was your question answered?',                  location: 'San Francisco', assignee: 'USA - Sales', date: 'Dec 11, 2022', unread: true },
  { id: '5', name: 'Brooklyn Simmons',                   message: 'Robin: Was your question answered?',                  location: 'San Francisco', assignee: 'USA - Sales', date: 'Dec 11, 2022' },
  { id: '6', name: 'Brooklyn Simmons',                   message: 'Robin: Was your question answered?',                  location: 'San Francisco', assignee: 'USA - Sales', date: 'Dec 11, 2022' },
  { id: '7', name: 'Brooklyn Simmons',                   message: 'Robin: Was your question answered?',                  location: 'San Francisco', assignee: 'USA - Sales', date: 'Dec 11, 2022' },
]

interface ChatMessage {
  id: string
  sender: 'customer' | 'agent'
  text?: string
  imageUrl?: string
  time: string
}

const CHAT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'customer', text: "I've sent you my preferred date and time through the appointment scheduling tool. Additionally, can you guide me through the payment options available?", time: '09:12 PM' },
  { id: '2', sender: 'agent',    text: 'Of course! We have a variety of fitness equipment available',                                                                                              time: '09:12 PM' },
  { id: '3', sender: 'agent',    text: 'Of course! We have a variety of fitness equipment available, including treadmills, exercise bikes, and weightlifting machines.',                            time: '09:12 PM' },
  { id: '4', sender: 'agent',    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',                                                                   time: '09:12 PM' },
]

const INBOX_NAV_SECTIONS: NavSection[] = [
  {
    id: 'human-actions',
    label: 'Human actions',
    defaultExpanded: true,
    items: [
      { id: 'view-all-interactions', label: 'View all interactions' },
      { id: 'view-by-status',        label: 'View by status' },
      { id: 'view-by-channel',       label: 'View by channel' },
      { id: 'view-by-assignee',      label: 'View by assignee' },
      { id: 'view-saved-filters',    label: 'View saved filters' },
      { id: 'chat-internal-team',    label: 'Chat with internal team' },
    ],
  },
  {
    id: 'agents',
    label: 'Agents',
    defaultExpanded: true,
    items: [
      { id: 'tagging-routing-agent', label: 'Tagging & routing agent' },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    defaultExpanded: true,
    items: [
      { id: 'responses',              label: 'Responses' },
      { id: 'conversation-managed',   label: 'Conversation managed' },
      { id: 'all-reports',            label: 'All reports', external: true },
    ],
  },
]

interface TabSet {
  visible: { id: string; label: string }[]
  more: { id: string; label: string }[]
}

const TABS_BY_NAV: Record<string, TabSet> = {
  'view-all-interactions': {
    visible: [
      { id: 'all',       label: 'All' },
      { id: 'messages',  label: 'Messages' },
      { id: 'reviews',   label: 'Reviews' },
      { id: 'surveys',   label: 'Surveys' },
    ],
    more: [
      { id: 'payments',    label: 'Payments' },
      { id: 'appointment', label: 'Appointment' },
      { id: 'spam',        label: 'Spam' },
    ],
  },
  'view-by-status': {
    visible: [
      { id: 'missed-call', label: 'Missed call' },
      { id: 'voicemails',  label: 'Voicemails' },
      { id: 'scheduling',  label: 'Scheduling' },
    ],
    more: [
      { id: 'callback-requested', label: 'Callback requested' },
      { id: 'rescheduling',       label: 'Rescheduling' },
      { id: 'cancellations',      label: 'Cancellations' },
      { id: 'intake',             label: 'Intake' },
      { id: 'reminder',           label: 'Reminder' },
      { id: 'follow-up',          label: 'Follow up' },
      { id: 'faqs',               label: 'FAQs' },
      { id: 'referrals',          label: 'Referrals' },
      { id: 'others',             label: 'Others' },
    ],
  },
  'view-by-channel': {
    visible: [
      { id: 'voice', label: 'Voice' },
      { id: 'chat',  label: 'Chat' },
      { id: 'text',  label: 'Text' },
      { id: 'email', label: 'Email' },
    ],
    more: [],
  },
  'view-by-assignee': {
    visible: [
      { id: 'assign-to-me',        label: 'Assign to me' },
      { id: 'assign-to-ai-agents', label: 'Assign to AI agents' },
      { id: 'unassigned',          label: 'Unassigned' },
    ],
    more: [],
  },
  'view-saved-filters': {
    visible: [
      { id: 'needs-attention',   label: 'Needs attention' },
      { id: 'pending-responses', label: 'Pending responses' },
    ],
    more: [
      { id: 'high-priority',      label: 'High priority conversations' },
      { id: 'resolved-closed',    label: 'Resolved & closed' },
      { id: 'open-conversations', label: 'Open conversations' },
      { id: 'awaiting-action',    label: 'Awaiting action' },
      { id: 'escalated-cases',    label: 'Escalated cases' },
      { id: 'recently-updated',   label: 'Recently updated' },
      { id: 'unassigned-threads', label: 'Unassigned threads' },
      { id: 'sla-risk',           label: 'SLA risk' },
    ],
  },
}

const DEFAULT_TAB_SET = TABS_BY_NAV['view-all-interactions']

function InboxTabs({ tabSet, activeTab, onSelect }: { tabSet: TabSet; activeTab: string; onSelect: (id: string) => void }) {
  const allTabs = [...tabSet.visible, ...tabSet.more]
  const defaultVisibleCount = tabSet.visible.length
  const [visibleIds, setVisibleIds] = useState(() => tabSet.visible.map((t) => t.id))
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleIds(tabSet.visible.map((t) => t.id))
  }, [tabSet])

  useEffect(() => {
    if (!moreOpen) return
    function handler(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpen])

  const visibleTabs = visibleIds.map((id) => allTabs.find((t) => t.id === id)!).filter(Boolean)
  const moreTabs = allTabs.filter((t) => !visibleIds.includes(t.id))

  function handleMoreSelect(id: string) {
    setVisibleIds((prev) => {
      const next = [...prev]
      next[defaultVisibleCount - 1] = id
      return next
    })
    onSelect(id)
    setMoreOpen(false)
  }

  return (
    <div className="flex items-end gap-sm pt-lg">
      {visibleTabs.map((tab) => {
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="flex shrink-0 flex-col items-stretch"
          >
            <span
              className={`flex h-9 items-center gap-xs whitespace-nowrap rounded-sm px-sm text-body transition-colors ${
                active ? 'text-text-primary' : 'text-text-secondary hover:bg-surface-selected'
              }`}
            >
              {tab.label}
            </span>
            <span className={`h-[2px] w-full ${active ? 'bg-primary' : 'bg-transparent'}`} />
          </button>
        )
      })}

      {moreTabs.length > 0 && (
        <div className="relative shrink-0" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="flex flex-col items-stretch"
          >
            <span className="flex h-9 items-center gap-xs whitespace-nowrap rounded-sm px-sm text-body text-text-secondary transition-colors hover:bg-surface-selected">
              More
              <Icon name="expand_more" size={14} />
            </span>
            <span className="h-[2px] w-full bg-transparent" />
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-full z-50 mt-xs min-w-[168px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
              {moreTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMoreSelect(item.id)}
                  className="block w-full whitespace-nowrap px-md py-md text-left text-body text-text-primary hover:bg-surface-hover"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Responses dashboard ──────────────────────────────────────────────────────

const SUMMARY_STATS = [
  { id: 'total',      value: '7.9K', label: 'Total Conversations', delta: '+36.6%', trend: 'up' as const },
  { id: 'involve',    value: '39.2%', label: 'Involvement Rate',   delta: '-40%',   trend: 'down' as const },
  { id: 'resolution', value: '61.2%', label: 'Resolution Rate',    delta: '+20%',   trend: 'up' as const },
  { id: 'unresolved', value: '9.8%',  label: 'Unresolved',         delta: '-10%',   trend: 'down' as const },
]

const HC_SANKEY_DATA: [string, string, number][] = [
  // Channel → Handler
  ['Voice', 'Agent involved',  3200],
  ['Voice', 'Human involved',  1800],
  ['Text',  'Agent involved',  2400],
  ['Text',  'Human involved',  1400],
  ['Chat',  'Agent involved',  1800],
  ['Chat',  'Human involved',  1200],
  // Handler → Status
  ['Agent involved', 'Resolved',    4200],
  ['Agent involved', 'Routed',      1800],
  ['Agent involved', 'Unresolved',  1400],
  ['Human involved', 'Resolved',    2600],
  ['Human involved', 'Routed',       900],
  ['Human involved', 'Unresolved',   900],
]

const HC_SANKEY_NODES = [
  { id: 'Voice',          color: '#CE5ECE' },
  { id: 'Text',           color: '#4A2D7A' },
  { id: 'Chat',           color: '#42A5F5' },
  { id: 'Agent involved', color: '#5C6BC0' },
  { id: 'Human involved', color: '#F5B301' },
  { id: 'Resolved',       color: '#8BC34A', column: 2 },
  { id: 'Routed',         color: '#FF7043', column: 2 },
  { id: 'Unresolved',     color: '#BDBDBD', column: 2 },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sankeyOpts: any = {
  chart: {
    type: 'sankey',
    height: 520,
    backgroundColor: 'transparent',
    style: { fontFamily: "'Roboto',sans-serif" },
    margin: [16, 20, 16, 20],
  },
  title: { text: undefined },
  series: [{
    type: 'sankey' as const,
    keys: ['from', 'to', 'weight'],
    data: HC_SANKEY_DATA,
    nodes: HC_SANKEY_NODES,
    linkOpacity: 0.25,
    dataLabels: {
      nodeFormat: '{point.name}',
      style: {
        fontSize: '12px',
        fontWeight: '400',
        color: '#212121',
        textOutline: 'none',
        fontFamily: "'Roboto',sans-serif",
      },
      align: 'left',
      nodeFormatter: undefined,
      padding: 8,
    },
    nodeWidth: 15,
  }],
  tooltip: {
    headerFormat: '',
    pointFormat: '{point.fromNode.name} → {point.toNode.name}: <b>{point.weight:,.0f}</b>',
    nodeFormat: '<b>{point.name}</b>: {point.sum:,.0f} conversations',
    style: { fontFamily: "'Roboto',sans-serif", fontSize: '12px' },
  },
  credits: { enabled: false },
}

const OVERTIME_DATA = [
  { month: 'Dec\n2023', Resolved: 180, Routed: 120, Unresolved: 134 },
  { month: 'Jan\n2024', Resolved: 100, Routed: 60,  Unresolved: 74  },
  { month: 'Feb',       Resolved: 180, Routed: 120, Unresolved: 112 },
  { month: 'Mar',       Resolved: 170, Routed: 130, Unresolved: 98  },
  { month: 'Apr',       Resolved: 80,  Routed: 50,  Unresolved: 68  },
  { month: 'May',       Resolved: 160, Routed: 100, Unresolved: 118 },
]
const OVERTIME_SERIES = [
  { key: 'Resolved',   label: 'Resolved',   color: '#4cae3d' },
  { key: 'Routed',     label: 'Routed',     color: '#f5a623' },
  { key: 'Unresolved', label: 'Unresolved', color: '#de1b0c' },
]

const DONUT_DATA = [
  { name: 'Voice', value: 43.2, color: '#1976d2' },
  { name: 'Text',  value: 32.5, color: '#4cae3d' },
  { name: 'Email', value: 24.3, color: '#f5a623' },
]

const CHANNEL_STATS = [
  { id: 'total', value: '7.9k', label: 'Total conversations', delta: '+1.3%', trend: 'up' as const },
  { id: 'voice', value: '5K',   label: 'Voice',               delta: '+1.3%', trend: 'up' as const },
  { id: 'text',  value: '1.5k', label: 'Text',                delta: '+1.3%', trend: 'up' as const },
  { id: 'email', value: '1.4k', label: 'Email' },
]

interface LocationRow {
  location: string
  totalConversation: string
  resolved: string
  routed: string
  unresolved: string
  [key: string]: string
}

const LOCATION_DATA: LocationRow[] = [
  { location: 'Atlanta, GA',  totalConversation: '643', resolved: '15', routed: '12', unresolved: '2'  },
  { location: 'Dallas, TX',   totalConversation: '324', resolved: '22', routed: '23', unresolved: '4'  },
  { location: 'Chicago, IL',  totalConversation: '85',  resolved: '4',  routed: '18', unresolved: '22' },
  { location: 'Miami, FL',    totalConversation: '523', resolved: '27', routed: '2',  unresolved: '4'  },
  { location: 'Phoenix, AZ',  totalConversation: '323', resolved: '19', routed: '9',  unresolved: '10' },
  { location: 'Austin, TX',   totalConversation: '143', resolved: '25', routed: '11', unresolved: '12' },
  { location: 'Denver, CO',   totalConversation: '256', resolved: '30', routed: '13', unresolved: '14' },
  { location: 'Seattle, WA',  totalConversation: '235', resolved: '21', routed: '15', unresolved: '16' },
]

const LOCATION_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',          label: 'Location',           sortable: true },
  { key: 'totalConversation', label: 'Total conversation', sortable: true },
  { key: 'resolved',          label: 'Resolved',           sortable: true },
  { key: 'routed',            label: 'Routed',             sortable: true },
  { key: 'unresolved',        label: 'Unresolved',         sortable: true },
]

function ResponsesPanel() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-2xl py-xl">
        <div>
          <h1 className="text-h3 text-text-primary">Responses</h1>
          <p className="mt-xs text-body text-text-secondary">Customer response handling and resolution outcomes across channels and locations</p>
        </div>
        <div className="flex items-center gap-sm">
          <button type="button" className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface pl-md pr-sm text-body text-text-primary hover:bg-surface-l2">
            <Icon name="calendar_today" size={16} className="text-text-icon" />
            Last 3 months
          </button>
          <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
            <Icon name="filter_list" size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-lg px-2xl pb-2xl">
        {/* Summary */}
        <SummaryStats title="Summary" stats={SUMMARY_STATS} />

        {/* Performance funnel — Highcharts Sankey */}
        <ChartCard
          title="Performance funnel"
          showActions={false}
          toolbar={
            <button type="button" aria-label="More" className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="more_vert" size={18} />
            </button>
          }
        >
          <div className="mb-sm flex items-center justify-between text-small text-text-secondary">
            <span>Channel</span>
            <span>Handler</span>
            <span>Status</span>
          </div>
          <div className="-mx-lg">
            <HighchartsReact highcharts={Highcharts} options={sankeyOpts} />
          </div>
        </ChartCard>

        {/* Conversations overtime — table icon + 3-dot menu */}
        <ChartCard title="Conversations overtime">
          <StackedBarChart data={OVERTIME_DATA} series={OVERTIME_SERIES} xKey="month" height={300} showBarLabels />
        </ChartCard>

        {/* Conversation by channel — filter dropdown + 3-dot menu */}
        <ChartCard
          title="Conversation by channel"
          showActions={false}
          toolbar={
            <div className="flex items-center gap-xs text-text-icon">
              <button type="button" className="flex items-center gap-xs rounded-sm px-sm py-xs hover:bg-surface-hover">
                <Icon name="tune" size={16} />
                <Icon name="expand_more" size={14} />
              </button>
              <button type="button" aria-label="More" className="flex size-7 items-center justify-center rounded-sm hover:bg-surface-hover">
                <Icon name="more_vert" size={18} />
              </button>
            </div>
          }
        >
          <div className="mb-lg flex items-center gap-2xl">
            {CHANNEL_STATS.map((s) => (
              <div key={s.id} className="flex flex-col">
                <div className="flex items-center gap-xs">
                  <span className="text-h3 text-text-primary">{s.value}</span>
                  {s.delta && (
                    <span className={`text-small ${s.trend === 'up' ? 'text-success' : 'text-chip-danger-text'}`}>{s.delta}</span>
                  )}
                </div>
                <span className="text-small text-text-secondary">{s.label}</span>
              </div>
            ))}
          </div>
          <DonutChart data={DONUT_DATA} centerValue="7.9k" centerLabel="Total conversations" height={340} />
        </ChartCard>

        {/* Conversation across locations — only 3-dot menu */}
        <ChartCard
          title="Conversation across locations"
          showActions={false}
          toolbar={
            <button type="button" aria-label="More" className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="more_vert" size={18} />
            </button>
          }
        >
          <DataTable columns={LOCATION_COLUMNS} data={LOCATION_DATA} />
        </ChartCard>
      </div>
    </div>
  )
}

function InboxSideNav({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const defaultOpen = INBOX_NAV_SECTIONS.find((s) => s.defaultExpanded)?.id ?? INBOX_NAV_SECTIONS[0]?.id ?? null
  const [expandedId, setExpandedId] = useState<string | null>(defaultOpen)

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <aside className="flex h-full w-[222px] shrink-0 flex-col border-r border-border bg-surface-l2">
      <div className="flex h-[52px] shrink-0 flex-col justify-center px-lg">
        <h1 className="text-h3 text-text-primary">Inbox</h1>
      </div>

      {/* New message row */}
      <div className="flex items-center justify-between px-2xl py-sm">
        <span className="text-body text-text-primary">New message</span>
        <button type="button" className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
          <Icon name="add" size={16} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-xs overflow-y-auto px-lg py-sm">
        {INBOX_NAV_SECTIONS.map((section) => {
          const expanded = expandedId === section.id
          return (
            <div key={section.id} className="flex flex-col gap-xs">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="flex h-7 w-full items-center justify-between gap-sm rounded-sm px-sm py-[6px] hover:bg-surface-selected"
              >
                <span className="text-body text-text-primary">{section.label}</span>
                <Icon name={expanded ? 'expand_less' : 'expand_more'} size={20} className="text-text-icon" />
              </button>
              {expanded && section.items?.map((leaf) => (
                <button
                  key={leaf.id}
                  type="button"
                  onClick={() => onSelect(leaf.id)}
                  className={`flex h-7 w-full items-center gap-sm rounded-sm px-sm py-[6px] text-left transition-colors ${
                    activeId === leaf.id ? 'bg-surface-selected' : 'hover:bg-surface-selected'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-body font-light text-text-primary">
                    {leaf.label}
                  </span>
                  {leaf.external && <Icon name="open_in_new" size={16} className="shrink-0 text-text-icon" />}
                </button>
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export function InboxScreen() {
  const [activeNav, setActiveNav] = useState('view-all-interactions')
  const [selectedConvo, setSelectedConvo] = useState(CONVERSATIONS[0])
  const [activeTab, setActiveTab] = useState('all')
  const [message, setMessage] = useState('')

  const isInternalChat = activeNav === 'chat-internal-team'
  const isOutcomesScreen = activeNav === 'responses' || activeNav === 'conversation-managed' || activeNav === 'all-reports'
  const currentTabSet = TABS_BY_NAV[activeNav] ?? DEFAULT_TAB_SET

  function handleNavSelect(id: string) {
    setActiveNav(id)
    const tabSet = TABS_BY_NAV[id] ?? DEFAULT_TAB_SET
    setActiveTab(tabSet.visible[0]?.id ?? 'all')
  }

  return (
    <div className="flex h-full">
      {/* L2 Nav — full height */}
      <InboxSideNav activeId={activeNav} onSelect={handleNavSelect} />

      {/* Right side: TopNav on top, then conversation list + chat below */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav initials="S" />

        {isOutcomesScreen ? (
          <ResponsesPanel />
        ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Middle panel — conversation list */}
          <div className="flex w-[370px] shrink-0 flex-col border-r border-border">
            {isInternalChat ? (
              <div className="flex items-center justify-end gap-sm px-lg pt-lg">
                <button type="button" className="flex size-8 items-center justify-center text-text-icon hover:text-text-primary"><Icon name="search" size={20} /></button>
                <button type="button" className="flex h-8 items-center rounded-sm bg-[#4CAE3D] px-lg text-body text-white hover:opacity-90">
                  New
                </button>
              </div>
            ) : (
              <>
                <div className="px-lg pt-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center gap-xs">
                        <span className="text-body text-text-primary">OPEN</span>
                        <Icon name="expand_more" size={16} className="text-text-icon" />
                      </div>
                      <span className="text-small text-text-secondary">192 total messages • 2 unread</span>
                    </div>
                    <div className="flex items-center gap-md">
                      <button type="button" className="text-text-icon hover:text-text-primary"><Icon name="search" size={20} /></button>
                      <button type="button" className="text-text-icon hover:text-text-primary"><Icon name="filter_list" size={20} /></button>
                      <button type="button" className="text-text-icon hover:text-text-primary"><Icon name="swap_vert" size={20} /></button>
                      <button type="button" className="text-text-icon hover:text-text-primary"><Icon name="more_vert" size={20} /></button>
                    </div>
                  </div>
                </div>

                <div className="px-lg">
                  <InboxTabs tabSet={currentTabSet} activeTab={activeTab} onSelect={setActiveTab} />
                </div>
              </>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-sm py-sm">
              {CONVERSATIONS.map((convo) => (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => setSelectedConvo(convo)}
                  className={`flex w-full flex-col gap-xs rounded-md px-md py-md text-left transition-colors ${
                    selectedConvo.id === convo.id ? 'bg-[#dbeafe]' : 'hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      {convo.unread && <span className="size-[6px] rounded-full bg-primary" />}
                      <span className="text-body text-text-primary">{convo.name}</span>
                      {convo.verified && <Icon name="verified" size={14} className="text-text-icon" />}
                      {convo.replyIcon && <Icon name="reply" size={14} className="text-text-icon" />}
                    </div>
                    <span className="text-small text-text-secondary">{convo.date}</span>
                  </div>
                  <span className="truncate text-small text-text-secondary">{convo.message}</span>
                  <div className="flex items-center gap-xs text-small text-text-tertiary">
                    <span>{convo.location}</span>
                    {convo.sublocation && (
                      <>
                        <span>•</span>
                        <span>{convo.sublocation}</span>
                      </>
                    )}
                    {convo.assignee && (
                      <>
                        <span>•</span>
                        <Icon name="group" size={12} />
                        <span>{convo.assignee}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel — chat thread */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-2xl py-md">
              <div className="flex items-center gap-sm">
                <span className="text-h3 text-text-primary">{selectedConvo.name}</span>
                {selectedConvo.verified && <Icon name="verified" size={16} className="text-text-icon" />}
              </div>
              <div className="flex items-center gap-md">
                <button type="button" className="flex items-center gap-sm">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face"
                    alt=""
                    className="size-7 rounded-full object-cover"
                  />
                  <span className="text-body text-text-primary">{selectedConvo.sublocation ?? 'Savannah'}</span>
                  <Icon name="expand_more" size={14} className="text-text-icon" />
                </button>
                <button type="button" className="flex size-7 items-center justify-center text-text-icon hover:text-text-primary">
                  <Icon name="more_vert" size={20} />
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-1 flex-col gap-md overflow-y-auto px-2xl py-lg">
              <div className="flex items-center justify-center">
                <span className="text-small text-text-secondary">Thu • Dec 17</span>
              </div>

              {CHAT_MESSAGES.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-md py-sm ${
                      msg.sender === 'agent'
                        ? 'bg-[#dbeafe] text-body text-text-primary'
                        : 'bg-[#f0f0f0] text-body text-text-primary'
                    }`}
                  >
                    {msg.text && <span>{msg.text}</span>}
                    {msg.imageUrl && (
                      <div className="relative overflow-hidden rounded-md">
                        <img src={msg.imageUrl} alt="" className="h-[180px] w-full object-cover" />
                        <div className="absolute bottom-sm left-sm flex items-center gap-xs rounded-sm bg-black/60 px-sm py-xs text-small text-white">
                          <Icon name="pause" size={14} />
                          <span>0:53 / 5:13</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="mt-xs text-small text-text-secondary">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Compose box */}
            <div className="p-2xl">
              <div className="rounded-md border border-border p-md">
                <button type="button" className="mb-sm flex items-center gap-xs text-body text-text-action">
                  Text
                  <Icon name="expand_more" size={16} />
                </button>

                <div className="mb-md min-h-[48px]">
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message or use a template"
                    className="w-full resize-none bg-transparent text-body text-text-primary outline-none placeholder:text-text-secondary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md text-text-icon">
                    <button type="button" className="flex size-5 items-center justify-center hover:text-text-primary"><Icon name="table_rows" size={20} /></button>
                    <button type="button" className="flex size-5 items-center justify-center hover:text-text-primary"><Icon name="attach_money" size={20} /></button>
                    <button type="button" className="flex size-5 items-center justify-center hover:text-text-primary"><Icon name="attach_file" size={20} /></button>
                    <button type="button" className="flex size-5 items-center justify-center hover:text-text-primary"><Icon name="sentiment_satisfied" size={20} /></button>
                    <button type="button" className="flex size-5 items-center justify-center hover:opacity-80">
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.51931 10.0887H4.57118L4.24883 11.0207H3.2187L4.97763 6.12236H6.11988L7.8788 11.0207H6.84167L6.51931 10.0887ZM6.25302 9.30384L5.54525 7.25761L4.83747 9.30384H6.25302Z" fill="#6834B7"/>
                        <path d="M9.51733 6.12937V11.0207H8.53626V6.12937H9.51733Z" fill="#6834B7"/>
                        <path d="M9.32388 3.12083H1.8628C0.834006 3.12083 0 3.95484 0 4.98364V12.4349C0 13.4637 0.834007 14.2977 1.86281 14.2977H11.1768C12.2056 14.2977 13.0396 13.4637 13.0396 12.4349V6.85539C12.8579 6.94499 12.673 6.97287 12.523 6.97287C12.3815 6.97287 12.241 6.94766 12.1082 6.89686V12.4349C12.1082 12.9493 11.6912 13.3663 11.1768 13.3663H1.86281C1.34841 13.3663 0.931402 12.9493 0.931402 12.4349V4.98364C0.931402 4.46924 1.3484 4.05224 1.8628 4.05224H9.26645C9.21567 3.91308 9.1962 3.77401 9.1962 3.64919C9.1962 3.47286 9.23581 3.28997 9.32388 3.12083Z" fill="#6834B7"/>
                        <path d="M14.3135 1.88781C14.2909 1.87008 14.2773 1.84761 14.2727 1.8204C14.2684 1.79607 14.2737 1.77277 14.2886 1.75049C14.3932 1.57115 14.4698 1.42736 14.5185 1.31913C14.5688 1.21216 14.5876 1.11705 14.5749 1.0338C14.5651 0.950203 14.5229 0.858108 14.4483 0.757518C14.3736 0.656928 14.2655 0.526047 14.1238 0.364876C14.0815 0.315913 14.0782 0.268806 14.1138 0.223556C14.1316 0.200931 14.1535 0.188046 14.1794 0.184901C14.2054 0.181756 14.2301 0.186801 14.2535 0.200035C14.4371 0.307876 14.5853 0.38785 14.6981 0.439957C14.8122 0.490449 14.911 0.510628 14.9946 0.500495C15.081 0.490012 15.1717 0.447579 15.2668 0.373195C15.363 0.297195 15.4865 0.185008 15.6371 0.0366344C15.683 -0.00839756 15.7301 -0.0119137 15.7784 0.026086C15.8267 0.0640857 15.8329 0.110843 15.797 0.166358C15.6908 0.344433 15.6125 0.486954 15.5622 0.593921C15.5136 0.702155 15.4956 0.797897 15.5083 0.881147C15.5226 0.965664 15.567 1.05822 15.6417 1.15881C15.7176 1.25778 15.8255 1.38722 15.9656 1.54712C16.0079 1.59609 16.0112 1.64319 15.9756 1.68844C15.94 1.7337 15.8902 1.739 15.8262 1.70437C15.6417 1.60102 15.4932 1.52474 15.3807 1.47552C15.2683 1.42629 15.1695 1.40611 15.0843 1.41498C15.0007 1.42511 14.9115 1.46737 14.8164 1.54175C14.723 1.6174 14.6023 1.7278 14.4542 1.87294C14.4087 1.92086 14.3617 1.92581 14.3135 1.88781Z" fill="#6834B7"/>
                        <path d="M12.5714 6.04144C12.5135 6.04144 12.4639 6.02275 12.4225 5.98537C12.3853 5.95214 12.3646 5.90854 12.3604 5.85454C12.3025 5.43922 12.2446 5.11526 12.1867 4.88268C12.1329 4.6501 12.0439 4.47566 11.9198 4.35937C11.7998 4.23892 11.6178 4.14548 11.3737 4.07902C11.1296 4.01257 10.7945 3.93989 10.3684 3.86098C10.2401 3.83606 10.176 3.76545 10.176 3.64916C10.176 3.59102 10.1946 3.54325 10.2318 3.50587C10.2691 3.4685 10.3146 3.44565 10.3684 3.43735C10.7945 3.3792 11.1296 3.32105 11.3737 3.26291C11.6178 3.20061 11.7998 3.10924 11.9198 2.98879C12.0439 2.8642 12.135 2.68353 12.1929 2.44679C12.2508 2.20591 12.3066 1.87364 12.3604 1.45001C12.377 1.32126 12.4473 1.25689 12.5714 1.25689C12.6955 1.25689 12.7638 1.32334 12.7762 1.45624C12.83 1.87157 12.8838 2.19552 12.9376 2.4281C12.9955 2.66069 13.0865 2.83512 13.2106 2.95142C13.3389 3.06771 13.525 3.15908 13.7691 3.22553C14.0132 3.28783 14.3463 3.35843 14.7683 3.43735C14.8965 3.46227 14.9607 3.53287 14.9607 3.64916C14.9607 3.76545 14.8883 3.83606 14.7434 3.86098C14.3215 3.92743 13.9905 3.99181 13.7505 4.0541C13.5106 4.1164 13.3285 4.20778 13.2044 4.32822C13.0844 4.44866 12.9955 4.62725 12.9376 4.86399C12.8838 5.10073 12.83 5.42676 12.7762 5.84208C12.7638 5.97499 12.6955 6.04144 12.5714 6.04144Z" fill="#6834B7"/>
                      </svg>
                    </button>
                  </div>
                  {isInternalChat ? (
                    <button type="button" className="flex h-9 items-center rounded-sm bg-[#4CAE3D] px-lg text-body text-white hover:opacity-90">
                      Send
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <button type="button" className="flex h-9 items-center rounded-l-sm bg-primary px-lg text-body text-white hover:bg-primary-hover">
                        Send
                      </button>
                      <button type="button" className="flex h-9 items-center justify-center rounded-r-sm border-l border-white/30 bg-primary px-sm text-white hover:bg-primary-hover">
                        <Icon name="expand_more" size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
