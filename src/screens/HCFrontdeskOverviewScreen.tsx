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
  { id: 'responses',  value: '7.9K', label: 'Responses',           delta: '2%',    trend: 'down' as const },
  { id: 'bookings',   value: '1.5K', label: 'Total bookings',      delta: '16.6%', trend: 'up'   as const },
  { id: 'reschedule', value: '450',  label: 'Rescheduled',         delta: '30%',   trend: 'down' as const },
  { id: 'cancelled',  value: '25',   label: 'Cancelled',           delta: '20%',   trend: 'up'   as const },
  { id: 'verified',   value: '1.5K', label: 'Insurance verified', delta: '10%',   trend: 'down' as const },
]

// Funnel: Website/Voice/Text/Email → Agent-driven/Human-driven → Confirmed/Booking/Reschedule/Cancel
// Removed No-show per design direction
const FUNNEL_NODES: SankeyNode[] = [
  { name: 'Website 38%' }, { name: 'Voice 20%' }, { name: 'Text 23%' }, { name: 'Email 19%' },
  { name: 'Agent-driven 72%' }, { name: 'Human-driven 28%' },
  { name: 'Confirmed 60%' }, { name: 'Booked 18%' }, { name: 'Rescheduled 10%' }, { name: 'Canceled 4%' },
]
const FUNNEL_LINKS: SankeyLink[] = [
  { source: 0, target: 4, value: 28 }, { source: 0, target: 5, value: 10 },
  { source: 1, target: 4, value: 20 }, { source: 1, target: 5, value: 8  },
  { source: 2, target: 4, value: 18 }, { source: 2, target: 5, value: 5  },
  { source: 3, target: 4, value: 6  }, { source: 3, target: 5, value: 5  },
  { source: 4, target: 6, value: 51 }, { source: 4, target: 7, value: 13 },
  { source: 4, target: 8, value: 7  }, { source: 4, target: 9, value: 1  },
  { source: 5, target: 6, value: 9  }, { source: 5, target: 7, value: 5  },
  { source: 5, target: 8, value: 3  }, { source: 5, target: 9, value: 4  },
]

const OVERTIME_DATA = [
  { month: 'Dec 2023', resolved: 82, unresolved: 10 },
  { month: 'Jan 2024', resolved: 93, unresolved: 5  },
  { month: 'Feb',      resolved: 60, unresolved: 5  },
  { month: 'Mar',      resolved: 60, unresolved: 5  },
  { month: 'Apr',      resolved: 63, unresolved: 5  },
  { month: 'May',      resolved: 62, unresolved: 5  },
]
const OVERTIME_SERIES = [
  { key: 'resolved',   label: 'Resolved',   color: '#4cae3d' },
  { key: 'unresolved', label: 'Unresolved', color: '#ef4444' },
]

const SOURCE_DONUT = [
  { name: 'Link', value: 41.2, color: '#9c27b0' },
  { name: 'FAQ',  value: 32.5, color: '#f59e0b' },
  { name: 'File', value: 26.3, color: '#4cae3d' },
]

const CONV_OVERTIME_DATA = [
  { month: 'Dec 2023', agentResolved: 40, humanResolved: 20, unresolved: 10 },
  { month: 'Jan 2024', agentResolved: 30, humanResolved: 20, unresolved: 10 },
  { month: 'Feb',      agentResolved: 44, humanResolved: 20, unresolved: 10 },
  { month: 'Mar',      agentResolved: 36, humanResolved: 20, unresolved: 10 },
  { month: 'Apr',      agentResolved: 40, humanResolved: 10, unresolved: 10 },
  { month: 'May',      agentResolved: 35, humanResolved: 20, unresolved: 10 },
]
const CONV_OVERTIME_SERIES = [
  { key: 'agentResolved', label: 'Resolved by agents', color: '#4cae3d' },
  { key: 'humanResolved', label: 'Resolved by humans', color: '#1976d2' },
  { key: 'unresolved',    label: 'Unresolved',         color: '#ef4444' },
]

// Added Email as 4th segment
const CHANNEL_DONUT = [
  { name: 'Website', value: 32.5, color: '#9c27b0' },
  { name: 'Voice',   value: 43.2, color: '#3f51b5' },
  { name: 'Text',    value: 14.3, color: '#f59e0b' },
  { name: 'Email',   value: 10.0, color: '#4cae3d' },
]

const INSURANCE_DATA = [
  { month: 'Dec', verified: 464 },
  { month: 'Jan', verified: 194 },
  { month: 'Feb', verified: 288 },
  { month: 'Mar', verified: 178 },
  { month: 'Apr', verified: 461 },
  { month: 'May', verified: 297 },
]
const INSURANCE_SERIES = [{ key: 'verified', label: 'Verified', color: '#1976d2' }]

interface LocationRow {
  location: string
  totalBookings: number
  rescheduled: number
  cancelled: number
  insurancesVerified: number
  [key: string]: string | number
}
const LOCATION_DATA: LocationRow[] = [
  { location: 'Atlanta, GA',  totalBookings: 100, rescheduled: 60, cancelled: 40, insurancesVerified: 40 },
  { location: 'Dallas, TX',   totalBookings: 90,  rescheduled: 23, cancelled: 4,  insurancesVerified: 4  },
  { location: 'Chicago, IL',  totalBookings: 80,  rescheduled: 18, cancelled: 22, insurancesVerified: 22 },
  { location: 'Miami, FL',    totalBookings: 70,  rescheduled: 2,  cancelled: 4,  insurancesVerified: 4  },
  { location: 'Phoenix, AZ',  totalBookings: 60,  rescheduled: 9,  cancelled: 10, insurancesVerified: 10 },
  { location: 'Austin, TX',   totalBookings: 50,  rescheduled: 11, cancelled: 12, insurancesVerified: 12 },
  { location: 'Denver, CO',   totalBookings: 40,  rescheduled: 13, cancelled: 14, insurancesVerified: 14 },
  { location: 'Seattle, WA',  totalBookings: 30,  rescheduled: 15, cancelled: 16, insurancesVerified: 16 },
]
const LOCATION_COLUMNS: Column<LocationRow>[] = [
  { key: 'location',           label: 'Location',            width: 200, sortable: true },
  { key: 'totalBookings',      label: 'Total bookings',      width: 160, sortable: true },
  { key: 'rescheduled',        label: 'Rescheduled',         width: 160, sortable: true },
  { key: 'cancelled',          label: 'Cancelled',           width: 140, sortable: true },
  { key: 'insurancesVerified', label: 'Insurance verified', width: 180, sortable: true },
]

export function HCFrontdeskOverviewScreen() {
  const [dateRange, setDateRange] = useState('Last 3 months')

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <ReportHeader
          title="Front desk overview"
          subtitle="All human and agent-driven appointment outcomes across all channels and locations."
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

          <HCCard title="Appointments funnel">
            <SankeyChart
              nodes={FUNNEL_NODES}
              links={FUNNEL_LINKS}
              height={360}
              columnHeaders={['Total inquiries', 'Handler', 'Outcome']}
            />
          </HCCard>

          <HCCard title="Response rate over time">
            <StackedBarChart
              data={OVERTIME_DATA}
              series={OVERTIME_SERIES}
              xKey="month"
              height={280}
              showBarLabels
            />
          </HCCard>

          <div className="grid grid-cols-2 gap-lg">
            <HCCard title="Response from source">
              <ChartStatRow stats={[
                { value: '4.4K', label: 'Link' },
                { value: '2.4K', label: 'FAQ'  },
                { value: '1.6K', label: 'File' },
              ]} />
              <DonutChart data={SOURCE_DONUT} centerValue="6.8k" centerLabel="Total responses" />
            </HCCard>

            <HCCard title="Conversations over time">
              <StackedBarChart
                data={CONV_OVERTIME_DATA}
                series={CONV_OVERTIME_SERIES}
                xKey="month"
                height={280}
                showBarLabels
              />
            </HCCard>
          </div>

          <div className="grid grid-cols-2 gap-lg">
            <HCCard title="Conversations by channel">
              <ChartStatRow stats={[
                { value: '4.4K', label: 'Website' },
                { value: '2.4K', label: 'Voice'   },
                { value: '1.4K', label: 'Text'    },
                { value: '974',  label: 'Email'   },
              ]} />
              <DonutChart data={CHANNEL_DONUT} centerValue="6.8k" centerLabel="Total responses" />
            </HCCard>

            <HCCard title="Insurance verified">
              <ChartStatRow stats={[
                { value: '1.2K',  label: 'Total verified'    },
                { value: '94.2%', label: 'Verification rate' },
              ]} />
              <StackedBarChart
                data={INSURANCE_DATA}
                series={INSURANCE_SERIES}
                xKey="month"
                height={220}
                showBarLabels
                hideLegend
              />
            </HCCard>
          </div>

          <HCCard title="Appointments by location">
            <DataTable columns={LOCATION_COLUMNS} data={LOCATION_DATA} />
          </HCCard>

        </div>
      </div>
    </div>
  )
}
