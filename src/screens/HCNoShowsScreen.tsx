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
  { id: 'bookings',   value: '450',   label: 'Total bookings',               delta: '20%',   trend: 'down' as const },
  { id: 'reminders',  value: '2.4K',  label: 'Total reminders sent',         delta: '12%',   trend: 'up'   as const },
  { id: 'prevented',  value: '100',   label: 'Appointments confirmed',           delta: '36.6%', trend: 'up'   as const },
  { id: 'confirmRate',value: '23.7%', label: 'Appointment confirmation rate', delta: '20%',   trend: 'up'   as const },
]

// 0=Agent communications, 1=SMS, 2=Email, 3=Voice,
// 4=<1hr, 5=1-4hrs, 6=4-24hrs, 7=>24hrs,
// 8=Confirmed, 9=Pending, 10=No response, 11=Declined
const FUNNEL_NODES: SankeyNode[] = [
  {
    name: 'Agent communications',
    breakdown: [
      { label: 'Reminder agent – North region', pct: '42%', value: 2634 },
      { label: 'Reminder agent – South region', pct: '35%', value: 2191 },
      { label: 'Reminder agent – West region',  pct: '23%', value: 1440 },
    ],
  },
  { name: 'SMS (50.5%)' }, { name: 'Email (37.5%)' }, { name: 'Voice (12%)' },
  { name: '<1hr (41.7%)' }, { name: '1-4hrs (31.3%)' }, { name: '4-24hrs (17.2%)' }, { name: '>24hrs (9.9%)' },
  { name: 'Confirmed (23.7%)' }, { name: 'Pending (17.2%)' }, { name: 'No response (38.3%)' }, { name: 'Declined (20.8%)' },
]
const FUNNEL_LINKS: SankeyLink[] = [
  { source: 0, target: 1, value: 50 }, { source: 0, target: 2, value: 26 }, { source: 0, target: 3, value: 8  },
  { source: 1, target: 4, value: 25 }, { source: 1, target: 5, value: 19 }, { source: 1, target: 6, value: 10 }, { source: 1, target: 7, value: 6  },
  { source: 2, target: 4, value: 17 }, { source: 2, target: 5, value: 13 }, { source: 2, target: 6, value: 7  }, { source: 2, target: 7, value: 4  },
  { source: 3, target: 4, value: 8  }, { source: 3, target: 5, value: 6  }, { source: 3, target: 6, value: 3  }, { source: 3, target: 7, value: 2  },
  { source: 4, target: 8, value: 21 }, { source: 4, target: 9, value: 9  }, { source: 4, target: 10, value: 10 }, { source: 4, target: 11, value: 10 },
  { source: 5, target: 8, value: 3  }, { source: 5, target: 9, value: 3  }, { source: 5, target: 10, value: 10 }, { source: 5, target: 11, value: 3  },
  { source: 6, target: 8, value: 1  }, { source: 6, target: 9, value: 5  }, { source: 6, target: 10, value: 10 }, { source: 6, target: 11, value: 5  },
  { source: 7, target: 8, value: 1  }, { source: 7, target: 9, value: 1  }, { source: 7, target: 10, value: 10 }, { source: 7, target: 11, value: 2  },
]
// purple=agent, SMS=blue, Email=teal, Voice=light-orange, time=greens/orange/gray, outcomes
const FUNNEL_NODE_COLORS: Record<number, string> = {
  0: '#7c4dff',
  1: '#1976d2', 2: '#00bcd4', 3: '#fbbf24',
  4: '#4cae3d', 5: '#8bc34a', 6: '#f59e0b', 7: '#bdbdbd',
  8: '#4cae3d', 9: '#f59e0b', 10: '#9e9e9e', 11: '#ef4444',
}

const CHANNEL_DONUT = [
  { name: 'Voice', value: 43.2, color: '#3f51b5' },
  { name: 'Email', value: 32.5, color: '#e91e63' },
  { name: 'Text',  value: 24.3, color: '#f59e0b' },
]

const REMINDERS_DATA = [
  { month: 'Dec 2025', sent: 494, confirmed: 434 },
  { month: 'Jan 2026', sent: 494, confirmed: 434 },
  { month: 'Feb',      sent: 494, confirmed: 434 },
  { month: 'Mar',      sent: 494, confirmed: 434 },
  { month: 'Apr',      sent: 494, confirmed: 434 },
  { month: 'May',      sent: 494, confirmed: 434 },
]
const REMINDERS_SERIES = [
  { key: 'sent',      label: 'Sent',      color: '#1976d2' },
  { key: 'confirmed', label: 'Confirmed', color: '#4cae3d' },
]

function deltaSpan(delta: string) {
  const isPos = delta.startsWith('+')
  return <span className={`text-xs ml-1 ${isPos ? 'text-success' : 'text-danger'}`}>{delta}</span>
}

interface LocationRow {
  location: string
  totalBookings: number
  noshowsPrevented: number
  cancelled: number
  confirmRate: string
  confirmDelta: string
  [key: string]: string | number
}
const LOCATION_DATA: LocationRow[] = [
  { location: 'Atlanta, GA', totalBookings: 100, noshowsPrevented: 60, cancelled: 40, confirmRate: '23.7%', confirmDelta: '+2%'  },
  { location: 'Dallas, TX',  totalBookings: 90,  noshowsPrevented: 23, cancelled: 4,  confirmRate: '23.7%', confirmDelta: '+2%'  },
  { location: 'Chicago, IL', totalBookings: 80,  noshowsPrevented: 18, cancelled: 22, confirmRate: '23.7%', confirmDelta: '-5%'  },
  { location: 'Miami, FL',   totalBookings: 70,  noshowsPrevented: 2,  cancelled: 4,  confirmRate: '23.7%', confirmDelta: '+2%'  },
  { location: 'Phoenix, AZ', totalBookings: 60,  noshowsPrevented: 9,  cancelled: 10, confirmRate: '23.7%', confirmDelta: '+2%'  },
  { location: 'Austin, TX',  totalBookings: 50,  noshowsPrevented: 11, cancelled: 12, confirmRate: '23.7%', confirmDelta: '-5%'  },
  { location: 'Denver, CO',  totalBookings: 40,  noshowsPrevented: 13, cancelled: 14, confirmRate: '23.7%', confirmDelta: '+2%'  },
  { location: 'Seattle, WA', totalBookings: 30,  noshowsPrevented: 15, cancelled: 16, confirmRate: '23.7%', confirmDelta: '+2%'  },
]
const LOCATION_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',         label: 'Location',             width: 180, sortable: true },
  { key: 'totalBookings',    label: 'Total bookings',       width: 160, sortable: true },
  { key: 'noshowsPrevented', label: 'Appointments confirmed',  width: 200, sortable: true },
  { key: 'cancelled',        label: 'Cancelled',            width: 140, sortable: true },
  {
    key: 'confirmRate', label: 'Confirmation rate', width: 180, sortable: true,
    render: (_v, row) => <span>{row.confirmRate}{deltaSpan(row.confirmDelta as string)}</span>,
  },
]

export function HCNoShowsScreen() {
  const [dateRange, setDateRange] = useState('Last 3 months')

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <ReportHeader
          title="Appointments confirmed"
          subtitle="Insights into appointment confirmations across all channels and locations."
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

          <HCCard title="Appointments confirmed">
            <SankeyChart nodes={FUNNEL_NODES} links={FUNNEL_LINKS} height={400} nodeColors={FUNNEL_NODE_COLORS} columnHeaders={['Total reminders sent', 'Channel', 'Time to confirm', 'Outcome']} />
          </HCCard>

          <div className="grid grid-cols-2 gap-lg">
            <HCCard title="Appointments confirmed by channel">
              <ChartStatRow stats={[
                { value: '4.4K', label: 'Voice' },
                { value: '2.4K', label: 'Email' },
                { value: '1.4K', label: 'Text'  },
              ]} />
              <DonutChart
                data={CHANNEL_DONUT}
                centerValue="6.8k"
                centerLabel="Total responses"
              />
            </HCCard>

            <HCCard title="Reminders sent vs confirmed">
              <StackedBarChart
                data={REMINDERS_DATA}
                series={REMINDERS_SERIES}
                xKey="month"
                height={320}
                showBarLabels
              />
            </HCCard>
          </div>

          <HCCard title="Appointments confirmed by location">
            <DataTable columns={LOCATION_COLUMNS} data={LOCATION_DATA} />
          </HCCard>

        </div>
      </div>
    </div>
  )
}
