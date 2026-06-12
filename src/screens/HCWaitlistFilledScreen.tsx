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
  { id: 'outreach', value: '5.5K',  label: 'Outreach sent', delta: '40%',  trend: 'down' as const },
  { id: 'filled',   value: '7.9K',  label: 'Slots filled',  delta: '36.6%',trend: 'up'   as const },
  { id: 'fillRate', value: '23.7%', label: 'Fill rate',     delta: '20%',  trend: 'up'   as const },
  { id: 'avgTime',  value: '2.5 hrs',label: 'Average fill time', delta: '20%', trend: 'down' as const },
]

// 0=Agent communications, 1=Human-driven, 2=SMS, 3=Email, 4=Voice,
// 5=<1hr, 6=1-4hrs, 7=4-24hrs, 8=>24hrs,
// 9=Filled, 10=Pending, 11=No response, 12=Declined
const FUNNEL_NODES: SankeyNode[] = [
  {
    name: 'Agent communications',
    breakdown: [
      { label: 'Waitlist agent – North region', pct: '45%', value: 3555 },
      { label: 'Waitlist agent – South region', pct: '33%', value: 2607 },
      { label: 'Waitlist agent – West region',  pct: '22%', value: 1738 },
    ],
  },
  { name: 'Human-driven (23.5%)' },
  { name: 'Text (50.5%)' }, { name: 'Email (37.5%)' }, { name: 'Voice (12%)' },
  { name: '<1hr (41.7%)' }, { name: '1-4hrs (31.3%)' }, { name: '4-24hrs (17.2%)' }, { name: '>24hrs (9.9%)' },
  { name: 'Filled (23.7%)' }, { name: 'Pending (17.2%)' }, { name: 'No response (38.3%)' }, { name: 'Declined (20.8%)' },
]
const FUNNEL_LINKS: SankeyLink[] = [
  { source: 0, target: 2, value: 38 }, { source: 0, target: 3, value: 19 }, { source: 0, target: 4, value: 6  },
  { source: 1, target: 2, value: 12 }, { source: 1, target: 3, value: 7  }, { source: 1, target: 4, value: 2  },
  { source: 2, target: 5, value: 25 }, { source: 2, target: 6, value: 19 }, { source: 2, target: 7, value: 10 }, { source: 2, target: 8, value: 6  },
  { source: 3, target: 5, value: 17 }, { source: 3, target: 6, value: 13 }, { source: 3, target: 7, value: 7  }, { source: 3, target: 8, value: 4  },
  { source: 4, target: 5, value: 8  }, { source: 4, target: 6, value: 6  }, { source: 4, target: 7, value: 3  }, { source: 4, target: 8, value: 2  },
  { source: 5, target: 9, value: 21 }, { source: 5, target: 10, value: 9 }, { source: 5, target: 11, value: 10 }, { source: 5, target: 12, value: 10 },
  { source: 6, target: 9, value: 3  }, { source: 6, target: 10, value: 3 }, { source: 6, target: 11, value: 10 }, { source: 6, target: 12, value: 3  },
  { source: 7, target: 9, value: 1  }, { source: 7, target: 10, value: 5 }, { source: 7, target: 11, value: 10 }, { source: 7, target: 12, value: 5  },
  { source: 8, target: 9, value: 1  }, { source: 8, target: 10, value: 1 }, { source: 8, target: 11, value: 10 }, { source: 8, target: 12, value: 2  },
]
// 0=Agent comm(purple), 1=Human(gray), SMS=blue, Email=teal, Voice=light-orange
// time=greens/orange/gray, outcomes: filled=green, pending=orange, no-resp=gray, declined=red
const FUNNEL_NODE_COLORS: Record<number, string> = {
  0: '#7c4dff', 1: '#bdbdbd',
  2: '#1976d2', 3: '#00bcd4', 4: '#fbbf24',
  5: '#4cae3d', 6: '#8bc34a', 7: '#f59e0b', 8: '#bdbdbd',
  9: '#4cae3d', 10: '#f59e0b', 11: '#9e9e9e', 12: '#ef4444',
}

const FILL_TIME_DATA = [
  { bucket: '<1 hr',   slotsFilled: 494 },
  { bucket: '1-4 hrs', slotsFilled: 198 },
  { bucket: '4-24 hrs',slotsFilled: 298 },
  { bucket: '>24 hrs', slotsFilled: 298 },
]
const FILL_TIME_SERIES = [{ key: 'slotsFilled', label: 'Slots filled', color: '#1976d2' }]

const APPT_TYPE_DONUT = [
  { name: 'Cleaning',   value: 35, color: '#3f51b5' },
  { name: 'Exam',       value: 25, color: '#9c27b0' },
  { name: 'X-ray',      value: 13, color: '#4cae3d' },
  { name: 'Extraction', value: 9,  color: '#f59e0b' },
  { name: 'Others',     value: 17, color: '#e91e63' },
]

function deltaSpan(delta: string) {
  const isPos = delta.startsWith('+')
  return <span className={`text-xs ${isPos ? 'text-success' : 'text-danger'}`}>{delta}</span>
}

interface ChannelRow {
  channel: string
  outreachSent: number
  responded: number
  responseRate: string
  responseDelta: string
  slotsFilled: number
  fillRate: string
  fillDelta: string
  [key: string]: string | number
}
const CHANNEL_DATA: ChannelRow[] = [
  { channel: 'Text',   outreachSent: 824, responded: 468, responseRate: '56.8%', responseDelta: '+2%', slotsFilled: 242, fillRate: '29.4%', fillDelta: '+2%' },
  { channel: 'Email', outreachSent: 612, responded: 188, responseRate: '30.7%', responseDelta: '+2%', slotsFilled: 98,  fillRate: '16%',   fillDelta: '+2%' },
  { channel: 'Voice', outreachSent: 196, responded: 112, responseRate: '57.1%', responseDelta: '-5%', slotsFilled: 47,  fillRate: '24%',   fillDelta: '-5%' },
]
const CHANNEL_COLUMNS: Column<ChannelRow>[] = [
  { key: 'channel',      label: 'Channel',       width: 140, sortable: true },
  { key: 'outreachSent', label: 'Outreach sent', width: 160, sortable: true },
  { key: 'responded',    label: 'Responded',     width: 140, sortable: true },
  {
    key: 'responseRate', label: 'Response rate', width: 160, sortable: true,
    render: (_v, row) => (
      <span>{row.responseRate} {deltaSpan(row.responseDelta as string)}</span>
    ),
  },
  { key: 'slotsFilled',  label: 'Slots filled',  width: 140, sortable: true },
  {
    key: 'fillRate', label: 'Fill rate', width: 140, sortable: true,
    render: (_v, row) => (
      <span>{row.fillRate} {deltaSpan(row.fillDelta as string)}</span>
    ),
  },
]

interface WaitlistLocationRow {
  location: string
  outreachSent: number
  slotsFilled: number
  fillRate: string
  fillDelta: string
  avgFillTime: string
  [key: string]: string | number
}
const WAITLIST_LOCATION_DATA: WaitlistLocationRow[] = [
  { location: 'Atlanta, GA', outreachSent: 60,  slotsFilled: 100, fillRate: '20%', fillDelta: '+2%', avgFillTime: '2.5 hrs' },
  { location: 'Dallas, TX',  outreachSent: 23,  slotsFilled: 90,  fillRate: '20%', fillDelta: '+2%', avgFillTime: '3.5 hrs' },
  { location: 'Chicago, IL', outreachSent: 18,  slotsFilled: 80,  fillRate: '20%', fillDelta: '-5%', avgFillTime: '2.5 hrs' },
  { location: 'Miami, FL',   outreachSent: 2,   slotsFilled: 70,  fillRate: '20%', fillDelta: '+2%', avgFillTime: '2.5 hrs' },
  { location: 'Phoenix, AZ', outreachSent: 9,   slotsFilled: 60,  fillRate: '20%', fillDelta: '+2%', avgFillTime: '4.5 hrs' },
  { location: 'Austin, TX',  outreachSent: 11,  slotsFilled: 50,  fillRate: '20%', fillDelta: '-5%', avgFillTime: '2.5 hrs' },
  { location: 'Denver, CO',  outreachSent: 13,  slotsFilled: 40,  fillRate: '20%', fillDelta: '+2%', avgFillTime: '5 hrs'   },
  { location: 'Seattle, WA', outreachSent: 15,  slotsFilled: 30,  fillRate: '20%', fillDelta: '+2%', avgFillTime: '2.5 hrs' },
]
const WAITLIST_LOCATION_COLUMNS: Column<WaitlistLocationRow>[] = [
  { key: 'location',    label: 'Location',     width: 200, sortable: true },
  { key: 'outreachSent',label: 'Outreach sent',width: 180, sortable: true },
  { key: 'slotsFilled', label: 'Slots filled', width: 180, sortable: true },
  {
    key: 'fillRate', label: 'Fill rate', width: 160, sortable: true,
    render: (_v, row) => (
      <span>{row.fillRate} {deltaSpan(row.fillDelta as string)}</span>
    ),
  },
  { key: 'avgFillTime', label: 'Average fill time', width: 160, sortable: true },
]

export function HCWaitlistFilledScreen() {
  const [dateRange, setDateRange] = useState('Last 3 months')

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <ReportHeader
          title="Waitlist filled"
          subtitle="Cancellation recovery and waitlist slot outcomes driven by the waitlist agent."
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

          <HCCard title="Waitlist funnel">
            <SankeyChart nodes={FUNNEL_NODES} links={FUNNEL_LINKS} height={400} nodeColors={FUNNEL_NODE_COLORS} columnHeaders={['Outreach sent', 'Channel', 'Time to fill', 'Outcome']} />
          </HCCard>

          <div className="grid grid-cols-2 gap-lg">
            <HCCard title="Time-to-fill distribution">
              <StackedBarChart
                data={FILL_TIME_DATA}
                series={FILL_TIME_SERIES}
                xKey="bucket"
                height={280}
                showBarLabels
              />
            </HCCard>

            <HCCard title="Fills by appointment type">
              <ChartStatRow stats={[
                { value: '134', label: 'Cleaning'   },
                { value: '98',  label: 'Exam'        },
                { value: '67',  label: 'X-ray'       },
                { value: '52',  label: 'Extraction'  },
                { value: '36',  label: 'Others'      },
              ]} />
              <DonutChart
                data={APPT_TYPE_DONUT}
                centerValue="387"
                centerLabel="Total fills"
              />
            </HCCard>
          </div>

          <HCCard title="Outreach channel performance">
            <DataTable columns={CHANNEL_COLUMNS} data={CHANNEL_DATA} />
          </HCCard>

          <HCCard title="Waitlist by location">
            <DataTable columns={WAITLIST_LOCATION_COLUMNS} data={WAITLIST_LOCATION_DATA} />
          </HCCard>

        </div>
      </div>
    </div>
  )
}
