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
  { id: 'location', label: 'Location', options: opts('North Austin', 'South Austin', 'San Francisco', 'Phoenix, AZ', 'Denver, CO', 'Seattle, WA') },
  { id: 'channel',  label: 'Channel',  options: opts('Voice', 'SMS', 'Email') },
  { id: 'outcome',  label: 'Outcome',  options: opts('Confirmed', 'Declined & rescheduled', 'Pending') },
]

// Healthcare chart card — uses the tune icon for the left action button
function HCCard(props: React.ComponentProps<typeof ChartCard>) {
  return <ChartCard {...props} leftActionIcon="tune" />
}
const DATE_RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'Last 12 months', 'Custom']

const SUMMARY_STATS = [
  { id: 'bookings',   value: '450',   label: 'Total bookings',               delta: '20%',   trend: 'down' as const },
  { id: 'confirmed',  value: '100',   label: 'Appointment confirmed',        delta: '36.6%', trend: 'up'   as const },
  { id: 'confirmRate',value: '23.7%', label: 'Appointment confirmation rate', delta: '20%',  trend: 'up'   as const },
]

// 0=SMS, 1=Email, 2=Voice                           (channel)
// 3=Confirmed, 4=Declined & rescheduled, 5=Pending  (outcome)
// 6=<1hr, 7=1-4hrs, 8=4-24hrs, 9=>24hrs            (time to confirm)
const FUNNEL_NODES: SankeyNode[] = [
  { name: 'SMS (50.5%)' }, { name: 'Email (37.5%)' }, { name: 'Voice (12%)' },
  { name: 'Confirmed (52.4%)' }, { name: 'Declined & rescheduled (21.8%)' }, { name: 'Pending (25.8%)' },
  { name: '<1hr (41.7%)' }, { name: '1-4hrs (31.3%)' }, { name: '4-24hrs (17.2%)' }, { name: '>24hrs (9.9%)' },
]
const FUNNEL_LINKS: SankeyLink[] = [
  // channel → outcome
  { source: 0, target: 3, value: 27 }, { source: 0, target: 4, value: 11 }, { source: 0, target: 5, value: 12 },
  { source: 1, target: 3, value: 20 }, { source: 1, target: 4, value: 8  }, { source: 1, target: 5, value: 9  },
  { source: 2, target: 3, value: 6  }, { source: 2, target: 4, value: 3  }, { source: 2, target: 5, value: 3  },
  // outcome → time to confirm
  { source: 3, target: 6, value: 22 }, { source: 3, target: 7, value: 17 }, { source: 3, target: 8, value: 9  }, { source: 3, target: 9, value: 5  },
  { source: 4, target: 6, value: 9  }, { source: 4, target: 7, value: 7  }, { source: 4, target: 8, value: 4  }, { source: 4, target: 9, value: 2  },
  { source: 5, target: 6, value: 11 }, { source: 5, target: 7, value: 8  }, { source: 5, target: 8, value: 4  }, { source: 5, target: 9, value: 3  },
]
// same colors as previous version
const FUNNEL_NODE_COLORS: Record<number, string> = {
  0: '#1976d2', 1: '#00bcd4', 2: '#fbbf24',
  3: '#4cae3d', 4: '#de1b0c', 5: '#f59e0b',
}

const CHANNEL_DONUT = [
  { name: 'Voice', value: 43.2, color: '#3f51b5' },
  { name: 'Email', value: 32.5, color: '#e91e63' },
  { name: 'SMS',   value: 24.3, color: '#f59e0b' },
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
  { key: 'location',         label: 'Location',                     width: 180, sortable: true },
  { key: 'totalBookings',    label: 'Total bookings',               width: 160, sortable: true },
  { key: 'noshowsPrevented', label: 'Appointment confirmed',        width: 200, sortable: true },
  {
    key: 'confirmRate', label: 'Appointment confirmation rate', width: 220, sortable: true,
    render: (_v, row) => {
      const delta = row.confirmDelta as string
      const isPos = delta.startsWith('+')
      return (
        <span className="flex items-center gap-sm">
          {row.confirmRate}
          <span className={`text-xs ${isPos ? 'text-chip-success-text' : 'text-chip-danger-text'}`}>{delta}</span>
        </span>
      )
    },
  },
]

export function HCNoShowsScreen() {
  const [dateRange, setDateRange] = useState('Last 6 months')
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <ReportHeader
          title="Appointment confirmation"
          subtitle="Insights into appointment confirmations across different channels and locations."
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
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="filter_list" size={20} />
              </button>
            </div>
          }
        />

        <div className="flex flex-col gap-lg p-2xl">

          <SummaryStats stats={SUMMARY_STATS} />

          <HCCard title="Appointment confirmation funnel">
            <SankeyChart nodes={FUNNEL_NODES} links={FUNNEL_LINKS} height={400} nodeColors={FUNNEL_NODE_COLORS} columnHeaders={['Reminders sent by channel', 'Outcome', 'Time to confirm the appointment']} />
          </HCCard>

          <div className="grid grid-cols-2 gap-lg">
            <HCCard title="Appointment confirmation by channel">
              <ChartStatRow stats={[
                { value: '4.4K', label: 'Voice' },
                { value: '2.4K', label: 'Email' },
                { value: '1.4K', label: 'SMS'   },
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

          <HCCard title="Appointment confirmation by location">
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
