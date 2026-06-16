import { useState } from 'react'
import {
  Chip,
  DataTable,
  Icon,
  MetricTiles,
  Tabs,
  TestCallModal,
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
import { RecommendationsTab } from './RecommendationsTab'

interface AgentInstanceScreenProps {
  instanceName: string
  status?: string
  onBack: () => void
  onEditAgent?: (agentName: string) => void
  onOpenIntegrationSettings?: (integrationId: string) => void
  product?: string
}

interface LocationRow {
  location: string
  interactions?: string
  fcr?: string
  aht?: string
  escalation?: string
  count: string
  remindersSent?: string
  responseRate?: string
  avgResponseTime?: string
  noshowRate?: string
  patientsContacted?: string
  recallConversionRate?: string
  avgTouchesToBook?: string
  staffHoursSaved?: string
  revenueRecovered?: string
  balancesContacted?: string
  amountCollected?: string
  arDaysReduced?: string
  clickToPayRate?: string
  plansFollowedUp?: string
  acceptanceRate?: string
  revenueUnlocked?: string
  avgTouchesToAccept?: string
  [key: string]: string | undefined
}

const TABS: Tab[] = [
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'recommendation', label: 'Recommendation' },
  { id: 'logs', label: 'Logs' },
  { id: 'settings', label: 'Settings' },
]

const METRICS_BY_AGENT: Record<string, Metric[]> = {
  'Front desk agent': [
    { id: 'responded', value: '8,200', label: 'Conversations responded', delta: '1.3%', trend: 'up', info: true, tooltip: 'Total inbound conversations handled by this location in the selected period.' },
    { id: 'resolved', value: '7,380', label: 'Conversations resolved', delta: '2.1%', trend: 'up', info: true, tooltip: 'Conversations closed without requiring human escalation at this location.' },
    { id: 'resolutionRate', value: '90%', label: 'Resolution rate', delta: '1.8%', trend: 'up', info: true, tooltip: 'Percentage of conversations fully resolved by the agent. Calculated as resolved ÷ responded.' },
    { id: 'timeSaved', value: '18h', label: 'Time saved', delta: '12%', trend: 'up', info: true, tooltip: 'Estimated staff hours saved based on average handle time for equivalent human-handled conversations.' },
  ],
  'Reminder agent': [
    { id: 'sent', value: '2,850', label: 'Reminders sent', delta: '1.3%', trend: 'up', info: true, tooltip: 'Total appointment reminders sent by the agent at this location in the selected period.' },
    { id: 'responseRate', value: '92%', label: 'Reminder response rate', delta: '1.3%', trend: 'up', info: true, tooltip: 'Percentage of reminders that received a confirmed response from the customer.' },
    { id: 'avgTime', value: '2m', label: 'Average response time', delta: '1.3%', trend: 'up', info: true, tooltip: 'Average time between the reminder being sent and the customer confirming or rescheduling.' },
    { id: 'noshow', value: '11%', label: 'No-show rate', delta: '1.3%', trend: 'down', positiveDown: true, info: true, tooltip: 'Percentage of appointments where the customer did not show up. Lower is better.' },
  ],
  'Outreach agent': [
    { id: 'leads', value: '2,103', label: 'Leads contacted', delta: '3.7%', trend: 'up', info: true, tooltip: 'Total leads the agent reached out to at this location in the selected period.' },
    { id: 'response', value: '38%', label: 'Response rate', delta: '1.9%', trend: 'up', info: true, tooltip: 'Percentage of contacted leads that replied to the outreach.' },
    { id: 'appointments', value: '641', label: 'Appointments scheduled', delta: '5.4%', trend: 'up', info: true, tooltip: 'Leads that confirmed a visit or test drive after being contacted.' },
    { id: 'conversion', value: '11%', label: 'Conversion rate', delta: '0.7%', trend: 'up', info: true, tooltip: 'Percentage of contacted leads that resulted in a scheduled appointment. Calculated as appointments ÷ leads contacted.' },
  ],
  'Recall agent': [
    { id: 'patientsContacted', value: '852', label: 'Patients contacted', delta: '4.2%', trend: 'up', info: true, tooltip: 'Distinct patients who received at least one successfully delivered agent touch in the period. Base population = patients flagged recall-due (hygiene, dormant, or unscheduled treatment).' },
    { id: 'recallConversion', value: '68%', label: 'Recall conversion rate', delta: '2.1%', trend: 'up', info: true, tooltip: 'Share of contacted patients who booked a recare/recall appointment attributable to the agent within the attribution window.' },
    { id: 'staffHoursSaved', value: '94h', label: 'Staff hours saved', delta: '8.2%', trend: 'up', info: true, tooltip: 'Estimated staff hours saved by automating recall outreach — based on average time-per-manual-contact across converted patients.' },
    { id: 'revenueRecovered', value: '$31K', label: 'Revenue recovered', delta: '5.8%', trend: 'up', info: true, tooltip: 'Production value of attributed recare appointments, recognized on completion.' },
  ],
  'Revenue agent': [
    { id: 'balancesContacted', value: '455', label: 'Balances contacted', delta: '3.1%', trend: 'up', info: true, tooltip: 'Distinct A/R accounts that received ≥1 delivered agent touch about a balance. Base = balance ≥ threshold and aging ≥ threshold days, excluded (active plan / in collections / disputed).' },
    { id: 'amountCollected', value: '$35.5K', label: 'Amount collected', delta: '5.4%', trend: 'up', info: true, tooltip: 'Total payments completed that are attributable to the agent within the window (via agent-sent link or call).' },
    { id: 'arDaysReduced', value: '-28%', label: 'A/R days reduced', delta: '2.3%', trend: 'up', positiveDown: true, info: true, tooltip: 'Reduction in the balance-weighted average age of outstanding A/R versus baseline. Lower is better.' },
    { id: 'staffHoursSaved', value: '62h', label: 'Staff hours saved', delta: '6.4%', trend: 'up', info: true, tooltip: 'Staff time avoided by automating outreach touches.' },
    { id: 'clickToPayRate', value: '74%', label: 'Click-to-pay rate', delta: '1.9%', trend: 'up', info: true, tooltip: 'Share of payment links sent that resulted in a completed payment.' },
  ],
  'Treatment plan agent': [
    { id: 'plansFollowedUp', value: '535', label: 'Plans followed up', delta: '6.0%', trend: 'up', info: true, tooltip: 'Distinct treatment plans with an unscheduled case that received at least one agent touch in the period.' },
    { id: 'acceptanceRate', value: '61%', label: 'Acceptance rate', delta: '3.2%', trend: 'up', info: true, tooltip: 'Share of followed-up plans where the patient scheduled at least one procedure within the attribution window.' },
    { id: 'revenueUnlocked', value: '$223K', label: 'Revenue unlocked', delta: '7.1%', trend: 'up', info: true, tooltip: 'Production value of treatment plan procedures booked through agent follow-up, recognized on scheduling.' },
    { id: 'avgTouchesToAccept', value: '2.1', label: 'Avg touches to accept', delta: '0.2', trend: 'down', positiveDown: true, info: true, tooltip: 'Average agent touches before the patient scheduled, across accepted plans. Lower is better.' },
  ],
}

const DEFAULT_METRICS: Metric[] = [
  { id: 'interactions', value: '2,850', label: 'Interactions handled', delta: '1.3%', trend: 'up', info: true, tooltip: 'Total customer interactions managed by the agent at this location in the selected period.' },
  { id: 'fcr', value: '92%', label: 'First contact resolution rate', delta: '1.3%', trend: 'up', info: true, tooltip: 'Percentage of interactions resolved on the first contact without follow-up.' },
  { id: 'aht', value: '2m', label: 'Average handle time', delta: '1.3%', trend: 'up', info: true, tooltip: 'Average duration of a single interaction from start to resolution.' },
  { id: 'escalation', value: '11%', label: 'Escalation rate', delta: '1.3%', trend: 'up', info: true, tooltip: 'Percentage of interactions escalated to a human agent. Lower is generally better.' },
]

const LOCATIONS_BY_AGENT: Record<string, LocationRow[]> = {
  'Front desk agent': [
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
    { location: 'Boston, MA',       interactions: '160', fcr: '89%', aht: '22m', escalation: '8%', count: '110' },
    { location: 'Philadelphia, PA', interactions: '150', fcr: '88%', aht: '24m', escalation: '8%', count: '70'  },
  ],
  'Recall agent': [
    { location: 'Atlanta, GA',      count: '124', patientsContacted: '234', recallConversionRate: '71%', staffHoursSaved: '24h', revenueRecovered: '$8.6K' },
    { location: 'Chicago, IL',      count: '98',  patientsContacted: '198', recallConversionRate: '69%', staffHoursSaved: '20h', revenueRecovered: '$7.2K' },
    { location: 'Boston, MA',       count: '76',  patientsContacted: '232', recallConversionRate: '67%', staffHoursSaved: '28h', revenueRecovered: '$8.4K' },
    { location: 'Philadelphia, PA', count: '60',  patientsContacted: '188', recallConversionRate: '65%', staffHoursSaved: '22h', revenueRecovered: '$6.8K' },
  ],
  'Revenue agent': [
    { location: 'Atlanta, GA',      count: '124', balancesContacted: '128', amountCollected: '$10.2K', arDaysReduced: '-30%', clickToPayRate: '76%', staffHoursSaved: '18h' },
    { location: 'Chicago, IL',      count: '98',  balancesContacted: '107', amountCollected: '$8.8K',  arDaysReduced: '-27%', clickToPayRate: '74%', staffHoursSaved: '14h' },
    { location: 'Boston, MA',       count: '76',  balancesContacted: '118', amountCollected: '$9.6K',  arDaysReduced: '-29%', clickToPayRate: '73%', staffHoursSaved: '16h' },
    { location: 'Philadelphia, PA', count: '60',  balancesContacted: '102', amountCollected: '$6.9K',  arDaysReduced: '-25%', clickToPayRate: '71%', staffHoursSaved: '14h' },
  ],
  'Treatment plan agent': [
    { location: 'Atlanta, GA',      count: '124', plansFollowedUp: '148', acceptanceRate: '63%', revenueUnlocked: '$62K',  avgTouchesToAccept: '2.0' },
    { location: 'Chicago, IL',      count: '98',  plansFollowedUp: '132', acceptanceRate: '61%', revenueUnlocked: '$54K',  avgTouchesToAccept: '2.1' },
    { location: 'Boston, MA',       count: '76',  plansFollowedUp: '141', acceptanceRate: '59%', revenueUnlocked: '$58K',  avgTouchesToAccept: '2.2' },
    { location: 'Philadelphia, PA', count: '60',  plansFollowedUp: '114', acceptanceRate: '58%', revenueUnlocked: '$49K',  avgTouchesToAccept: '2.3' },
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

const RECALL_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',             label: 'Location',              width: 220, sortable: true },
  { key: 'patientsContacted',    label: 'Patients contacted',    width: 180, sortable: true },
  { key: 'recallConversionRate', label: 'Recall conversion rate',width: 200, sortable: true },
  { key: 'staffHoursSaved',      label: 'Staff hours saved',      width: 170, sortable: true },
  { key: 'revenueRecovered',     label: 'Revenue recovered',     width: 170, sortable: true },
]

const REVENUE_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',          label: 'Location',          width: 200, sortable: true },
  { key: 'balancesContacted', label: 'Balances contacted', width: 180, sortable: true },
  { key: 'amountCollected',   label: 'Amount collected',  width: 170, sortable: true },
  { key: 'arDaysReduced',     label: 'A/R days reduced',  width: 160, sortable: true },
  { key: 'clickToPayRate',    label: 'Click-to-pay rate', width: 160, sortable: true },
  { key: 'staffHoursSaved',   label: 'Staff hours saved', width: 160, sortable: true },
]

const TREATMENT_PLAN_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',          label: 'Location',           width: 220, sortable: true },
  { key: 'plansFollowedUp',   label: 'Plans followed up',  width: 180, sortable: true },
  { key: 'acceptanceRate',    label: 'Acceptance rate',    width: 170, sortable: true },
  { key: 'revenueUnlocked',   label: 'Revenue unlocked',   width: 170, sortable: true },
  { key: 'avgTouchesToAccept',label: 'Avg touches to accept',width: 190, sortable: true },
]

export function AgentInstanceScreen({
  instanceName,
  status = 'Running',
  onBack,
  onEditAgent,
  onOpenIntegrationSettings,
  product,
}: AgentInstanceScreenProps) {
  const [activeTab, setActiveTab] = useState('outcomes')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [instanceStatus, setInstanceStatus] = useState(status)
  const [testCallOpen, setTestCallOpen] = useState(false)

  // Derive agent name from instance name (e.g. "Front desk agent - North region" → "Front desk agent")
  const agentName = instanceName.replace(/ - .+$/, '')
  const metrics: Metric[] = METRICS_BY_AGENT[agentName] ?? DEFAULT_METRICS
  const COLUMNS =
    agentName === 'Reminder agent'       ? REMINDER_COLUMNS
    : agentName === 'Front desk agent'   ? FRONTDESK_COLUMNS
    : agentName === 'Recall agent'        ? RECALL_COLUMNS
    : agentName === 'Revenue agent'       ? REVENUE_COLUMNS
    : agentName === 'Treatment plan agent'? TREATMENT_PLAN_COLUMNS
    : DEFAULT_COLUMNS
  const locations = LOCATIONS_BY_AGENT[agentName] ?? LOCATIONS_BY_AGENT['Front desk agent']

  const isWorkflowTab = activeTab === 'workflow'
  const isRecommendationTab = activeTab === 'recommendation'
  const showHealthcareLogs =
    activeTab === 'logs' && product === 'healthcare' && agentName === 'Front desk agent'

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
          {activeTab === 'settings' && (
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

      <TestCallModal
        open={testCallOpen}
        agentName={agentName}
        onClose={() => setTestCallOpen(false)}
      />

      {/* Tab content — workflow and recommendation tabs fill remaining height, others scroll */}
      {isWorkflowTab ? (
        <WorkflowViewerTab
          instanceName={instanceName}
          onEdit={() => onEditAgent?.(instanceName)}
          product={product}
          onTestCall={() => setTestCallOpen(true)}
        />
      ) : isRecommendationTab ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <RecommendationsTab />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {activeTab === 'outcomes' ? (
            <>
              <div className="px-2xl pt-lg">
                <MetricTiles metrics={metrics} />
              </div>
              <div className="px-lg py-lg">
                <DataTable columns={COLUMNS} data={locations} scrollOnHover />
              </div>
            </>
          ) : showHealthcareLogs ? (
            <AgentLogsTab />
          ) : activeTab === 'settings' ? (
            <AgentSettingsTab
              product={product}
              agentName={instanceName}
              onOpenIntegrationSettings={onOpenIntegrationSettings}
            />
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
