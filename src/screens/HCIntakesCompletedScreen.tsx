import React, { useState } from 'react'
import {
  ChartCard,
  ChartStatRow,
  DataTable,
  DateRangeSelector,
  DonutChart,
  FilterPanel,
  Icon,
  ReportHeader,
  SankeyChart,
  StackedBarChart,
  SummaryStats,
  TopNav,
  type Column,
  type FilterField,
  type SankeyLink,
  type SankeyNode,
} from '../components'

const opts = (...labels: string[]) => labels.map((l) => ({ value: l.toLowerCase().replace(/\s+/g, '-'), label: l }))

const FILTER_FIELDS: FilterField[] = [
  { id: 'location',     label: 'Location',     options: opts('North Austin', 'South Austin', 'San Francisco', 'Phoenix, AZ', 'Denver, CO', 'Seattle, WA') },
  { id: 'channel',      label: 'Channel',      options: opts('Voice', 'Website', 'SMS', 'Email') },
  { id: 'patient-type', label: 'Patient type', options: opts('New patient', 'Returning patient') },
  { id: 'outcome',      label: 'Outcome',      options: opts('Completed', 'In-progress', 'Pending') },
]

// Healthcare chart card — uses the tune icon for the left action button
function HCCard(props: React.ComponentProps<typeof ChartCard>) {
  return <ChartCard {...props} leftActionIcon="tune" />
}

function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = React.useState(false)
  const ref = React.useRef<HTMLButtonElement>(null)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)

  function show() {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.bottom + 8 })
    setVisible(true)
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="flex items-center justify-center text-text-tertiary hover:text-text-secondary"
        aria-label="More info"
      >
        <Icon name="help_outline" size={16} />
      </button>
      {visible && pos && (
        <div
          className="pointer-events-none fixed z-[120] w-[260px] rounded-md border border-border bg-surface p-[12px] shadow-dropdown"
          style={{ left: pos.x, top: pos.y, transform: 'translateX(-50%)' }}
        >
          <p className="text-small text-text-tertiary">{text}</p>
        </div>
      )}
    </>
  )
}
const DATE_RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'Last 12 months', 'Custom']

const SUMMARY_STATS = [
  { id: 'sent',        value: '1.4K',  label: 'Outreach sent',        delta: '36.6%', trend: 'up'   as const },
  { id: 'completed',   value: '750',   label: 'Intakes completed',    delta: '18%',   trend: 'up'   as const },
  { id: 'rate',        value: '52.4%', label: 'Completion rate',      delta: '4.2%',  trend: 'up'   as const },
  { id: 'avgTime',     value: '8.5 m', label: 'Avg completion time',  delta: '20%',   trend: 'down' as const },
]

// 0=Website, 1=Voice, 2=SMS, 3=Email           (channel)
// 4=New patient, 5=Returning patient           (patient type)
// 6=Completed, 7=In-progress, 8=Pending        (outcome)
const FUNNEL_NODES: SankeyNode[] = [
  { name: 'Website (28.4%)' }, { name: 'Voice (35.2%)' }, { name: 'SMS (22.1%)' }, { name: 'Email (14.3%)' },
  { name: 'New patient (57.4%)' }, { name: 'Returning patient (42.6%)' },
  { name: 'Completed (52.4%)' }, { name: 'In-progress (13.4%)' }, { name: 'Pending (34.2%)' },
]
const FUNNEL_LINKS: SankeyLink[] = [
  // channel → patient type
  { source: 0, target: 4, value: 16 }, { source: 0, target: 5, value: 12 },
  { source: 1, target: 4, value: 20 }, { source: 1, target: 5, value: 15 },
  { source: 2, target: 4, value: 13 }, { source: 2, target: 5, value: 9  },
  { source: 3, target: 4, value: 7  }, { source: 3, target: 5, value: 6  },
  // patient type → outcome
  { source: 4, target: 6, value: 30 }, { source: 4, target: 7, value: 8  }, { source: 4, target: 8, value: 18 },
  { source: 5, target: 6, value: 21 }, { source: 5, target: 7, value: 6  }, { source: 5, target: 8, value: 15 },
]
// outcome overrides only — channels and patient type inherit categorical defaults
const FUNNEL_NODE_COLORS: Record<number, string> = { 7: '#f5a623', 8: '#de1b0c' }

const INTAKE_OVERTIME_DATA = [
  { month: 'Dec 2023', completed: 280, attempted: 80, notAttempted: 74 },
  { month: 'Jan 2024', completed: 140, attempted: 50, notAttempted: 44 },
  { month: 'Feb',      completed: 290, attempted: 70, notAttempted: 52 },
  { month: 'Mar',      completed: 270, attempted: 70, notAttempted: 58 },
  { month: 'Apr',      completed: 120, attempted: 38, notAttempted: 40 },
  { month: 'May',      completed: 248, attempted: 80, notAttempted: 50 },
]
const INTAKE_OVERTIME_SERIES = [
  { key: 'completed',   label: 'Completed',   color: '#4cae3d' },
  { key: 'attempted',   label: 'In progress', color: '#f59e0b' },
  { key: 'notAttempted',label: 'Pending',     color: '#ef4444' },
]

const PATIENT_TYPE_DONUT = [
  { name: 'New patient',       value: 57, color: '#3f51b5' },
  { name: 'Returning patient', value: 43, color: '#4ccfb4' },
]

const CHANNEL_DONUT = [
  { name: 'SMS',   value: 43.2, color: '#3f51b5' },
  { name: 'Email', value: 32.5, color: '#e91e63' },
  { name: 'Call',  value: 24.3, color: '#f59e0b' },
]

function deltaSpan(delta: string) {
  const isPos = delta.startsWith('+')
  return <span className={`text-xs ${isPos ? 'text-chip-success-text' : 'text-chip-danger-text'}`}>{delta}</span>
}

interface LocationRow {
  location: string
  completed: number
  attempted: number
  completionRate: string
  completionDelta: string
  avgTime: string
  [key: string]: string | number
}
const LOCATION_DATA: LocationRow[] = [
  { location: 'Atlanta, GA', completed: 100, attempted: 60, completionRate: '20%', completionDelta: '+2%', avgTime: '8.2 min' },
  { location: 'Dallas, TX',  completed: 90,  attempted: 23, completionRate: '20%', completionDelta: '+2%', avgTime: '8.2 min' },
  { location: 'Chicago, IL', completed: 80,  attempted: 18, completionRate: '20%', completionDelta: '-5%', avgTime: '8.2 min' },
  { location: 'Miami, FL',   completed: 70,  attempted: 2,  completionRate: '20%', completionDelta: '+2%', avgTime: '8.2 min' },
  { location: 'Phoenix, AZ', completed: 60,  attempted: 9,  completionRate: '20%', completionDelta: '+2%', avgTime: '8.2 min' },
  { location: 'Austin, TX',  completed: 50,  attempted: 11, completionRate: '20%', completionDelta: '-5%', avgTime: '8.2 min' },
  { location: 'Denver, CO',  completed: 40,  attempted: 13, completionRate: '20%', completionDelta: '+2%', avgTime: '8.2 min' },
  { location: 'Seattle, WA', completed: 30,  attempted: 15, completionRate: '20%', completionDelta: '+2%', avgTime: '8.2 min' },
]
const LOCATION_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',   label: 'Location',        width: 200, sortable: true },
  { key: 'completed',  label: 'Intake completed',  width: 160, sortable: true },
  { key: 'attempted',  label: 'Outreach sent',     width: 160, sortable: true },
  {
    key: 'completionRate', label: 'Completion rate', width: 200, sortable: true,
    render: (_v, row) => (
      <span>{row.completionRate} {deltaSpan(row.completionDelta as string)}</span>
    ),
  },
  { key: 'avgTime',    label: 'Avg completion time', width: 180, sortable: true },
]

export function HCIntakesCompletedScreen() {
  const [dateRange, setDateRange] = useState('Last 6 months')
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <ReportHeader
          title="Intakes completed"
          subtitle="Patient intake form completion rates and drop-off analysis driven by the pre-visit agent."
          rightSlot={
            <div className="flex items-center gap-sm">
              <DateRangeSelector
                value={dateRange}
                options={DATE_RANGE_OPTIONS}
                onChange={setDateRange}
              />
              <button
                type="button"
                aria-label="Filters"
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex size-9 items-center justify-center rounded-sm text-text-icon ${filterOpen ? 'bg-surface-selected' : 'border border-border-selected bg-surface hover:bg-surface-l2'}`}
              >
                <Icon name="filter_list" size={20} />
              </button>
            </div>
          }
        />

        <div className="flex flex-col gap-lg p-2xl">

          <SummaryStats stats={SUMMARY_STATS} />

          <HCCard title="Intake funnel">
            <SankeyChart nodes={FUNNEL_NODES} links={FUNNEL_LINKS} height={400} nodeColors={FUNNEL_NODE_COLORS} columnHeaders={['Intake reminders sent by channel', 'Patient type', 'Outcome']} />
          </HCCard>

          <HCCard title="Intake overtime" titleSuffix={<InfoTooltip text="Monthly breakdown of patient intakes by status — completed, in progress, and pending." />}>
            <StackedBarChart
              data={INTAKE_OVERTIME_DATA}
              series={INTAKE_OVERTIME_SERIES}
              xKey="month"
              height={280}
              showBarLabels
            />
          </HCCard>

          <div className="grid grid-cols-2 gap-lg">
            <HCCard title="Completion by patient type">
              <ChartStatRow stats={[
                { value: '428', label: 'New patient'       },
                { value: '326', label: 'Returning patient' },
              ]} />
              <DonutChart
                data={PATIENT_TYPE_DONUT}
                centerValue="754"
                centerLabel="Total completions"
              />
            </HCCard>

            <HCCard title="Completion by channel">
              <ChartStatRow stats={[
                { value: '4.4K', label: 'Forms sent' },
                { value: '2.4K', label: 'SMS'        },
                { value: '1.4K', label: 'Email'      },
                { value: '974',  label: 'Call'       },
              ]} />
              <DonutChart
                data={CHANNEL_DONUT}
                centerValue="6.8k"
                centerLabel="Forms sent"
              />
            </HCCard>
          </div>

          <HCCard title="Intakes by location">
            <DataTable columns={LOCATION_COLUMNS} data={LOCATION_DATA} />
          </HCCard>

        </div>
      </div>
      <FilterPanel
        open={filterOpen}
        fields={FILTER_FIELDS}
        onClose={() => setFilterOpen(false)}
        onAdvancedFilters={() => {}}
      />
      </div>
    </div>
  )
}
