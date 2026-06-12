import React, { useState } from 'react'
import {
  ChartCard,
  ChartStatRow,
  DataTable,
  DateRangeSelector,
  DonutChart,
  ReportHeader,
  SankeyChart,
  StackedBarChart,
  SummaryStats,
  TopNav,
  type Column,
  type SankeyLink,
  type SankeyNode,
} from '../components'

// Healthcare chart card — uses the tune icon for the left action button
function HCCard(props: React.ComponentProps<typeof ChartCard>) {
  return <ChartCard {...props} leftActionIcon="tune" />
}
const DATE_RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 12 months', 'Custom']

const SUMMARY_STATS = [
  { id: 'sent',        value: '1.4K',  label: 'Intake forms sent',    delta: '36.6%', trend: 'up'   as const },
  { id: 'completed',   value: '750',   label: 'Intakes completed',    delta: '18%',   trend: 'up'   as const },
  { id: 'rate',        value: '52.4%', label: 'Completion rate',      delta: '4.2%',  trend: 'up'   as const },
  { id: 'avgTime',     value: '8.5 m', label: 'Avg completion time',  delta: '20%',   trend: 'down' as const },
  { id: 'notAttempted',value: '120',   label: 'Not attempted',        delta: '20%',   trend: 'up'   as const },
]

// 0=Pre-visit agents, 1=Human-driven,
// 2=Text, 3=Email, 4=Portal, 5=In-office,
// 6=Completed, 7=Not attempted, 8=Pending
const FUNNEL_NODES: SankeyNode[] = [
  {
    name: 'Pre-visit agents (74.3%)',
    breakdown: [
      { label: 'Pre-visit agent – North region', pct: '44%', value: 2756 },
      { label: 'Pre-visit agent – South region', pct: '34%', value: 2127 },
      { label: 'Pre-visit agent – West region',  pct: '22%', value: 1375 },
    ],
  },
  { name: 'Human-driven (25.7%)' },
  { name: 'Text (42.6%)' }, { name: 'Email (33.8%)' }, { name: 'Portal (15.6%)' }, { name: 'In-office (8.1%)' },
  { name: 'Completed (52.4%)' }, { name: 'Pending (13.4%)' }, { name: 'Not attempted (34.2%)' },
]
const FUNNEL_LINKS: SankeyLink[] = [
  { source: 0, target: 2, value: 30 }, { source: 0, target: 3, value: 24 }, { source: 0, target: 4, value: 11 }, { source: 0, target: 5, value: 6 },
  { source: 1, target: 2, value: 10 }, { source: 1, target: 3, value: 8  }, { source: 1, target: 4, value: 4  }, { source: 1, target: 5, value: 2 },
  { source: 2, target: 6, value: 22 }, { source: 2, target: 7, value: 4  }, { source: 2, target: 8, value: 14 },
  { source: 3, target: 6, value: 18 }, { source: 3, target: 7, value: 2  }, { source: 3, target: 8, value: 12 },
  { source: 4, target: 6, value: 9  }, { source: 4, target: 7, value: 1  }, { source: 4, target: 8, value: 5  },
  { source: 5, target: 6, value: 4  }, { source: 5, target: 7, value: 1  }, { source: 5, target: 8, value: 3  },
]
// 0=Pre-visit agents(purple), 1=Human(gray)
// 2=Text(blue), 3=Email(teal), 4=Portal(dark-orange), 5=In-office(light-orange)
// 6=Completed(green), 7=Pending(orange), 8=Not attempted(orange-red)
const FUNNEL_NODE_COLORS: Record<number, string> = {
  0: '#7c4dff', 1: '#bdbdbd',
  2: '#1976d2', 3: '#00bcd4', 4: '#f5a623', 5: '#fbbf24',
  6: '#4cae3d', 7: '#f59e0b', 8: '#f97316',
}

const INTAKE_OVERTIME_DATA = [
  { month: 'Dec 2023', completed: 280, attempted: 80, notAttempted: 74 },
  { month: 'Jan 2024', completed: 140, attempted: 50, notAttempted: 44 },
  { month: 'Feb',      completed: 290, attempted: 70, notAttempted: 52 },
  { month: 'Mar',      completed: 270, attempted: 70, notAttempted: 58 },
  { month: 'Apr',      completed: 120, attempted: 38, notAttempted: 40 },
  { month: 'May',      completed: 248, attempted: 80, notAttempted: 50 },
]
const INTAKE_OVERTIME_SERIES = [
  { key: 'completed',   label: 'Completed',     color: '#4cae3d' },
  { key: 'attempted',   label: 'Attempted',     color: '#f59e0b' },
  { key: 'notAttempted',label: 'Not attempted', color: '#ef4444' },
]

const PATIENT_TYPE_DONUT = [
  { name: 'New patient',       value: 57, color: '#3f51b5' },
  { name: 'Returning patient', value: 43, color: '#4ccfb4' },
]

const CHANNEL_DONUT = [
  { name: 'Text',  value: 43.2, color: '#3f51b5' },
  { name: 'Email', value: 32.5, color: '#e91e63' },
  { name: 'Call',  value: 24.3, color: '#f59e0b' },
]

function deltaSpan(delta: string) {
  const isPos = delta.startsWith('+')
  return <span className={`text-xs ${isPos ? 'text-success' : 'text-danger'}`}>{delta}</span>
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
  { key: 'completed',  label: 'Completed',        width: 160, sortable: true },
  { key: 'attempted',  label: 'Attempted',        width: 160, sortable: true },
  {
    key: 'completionRate', label: 'Completion rate', width: 200, sortable: true,
    render: (_v, row) => (
      <span>{row.completionRate} {deltaSpan(row.completionDelta as string)}</span>
    ),
  },
  { key: 'avgTime',    label: 'Avg time',         width: 160, sortable: true },
]

export function HCIntakesCompletedScreen() {
  const [dateRange, setDateRange] = useState('Last 3 months')

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <ReportHeader
          title="Intakes completed"
          subtitle="Patient intake form completion rates and drop-off analysis driven by the pre-visit agent."
          rightSlot={
            <DateRangeSelector
              value={dateRange}
              options={DATE_RANGE_OPTIONS}
              onChange={setDateRange}
            />
          }
        />

        <div className="flex flex-col gap-lg p-2xl">

          <SummaryStats stats={SUMMARY_STATS} />

          <HCCard title="Intake funnel">
            <SankeyChart nodes={FUNNEL_NODES} links={FUNNEL_LINKS} height={400} nodeColors={FUNNEL_NODE_COLORS} columnHeaders={['Intake forms sent', 'Channel', 'Outcome']} />
          </HCCard>

          <HCCard title="Intake overtime">
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
                { value: '2.4K', label: 'Text'       },
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
    </div>
  )
}
