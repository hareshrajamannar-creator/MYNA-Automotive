import { useState } from 'react'
import {
  ChartCard,
  DateRangeSelector,
  DonutChart,
  Icon,
  ReportHeader,
  StackedBarChart,
  SummaryStats,
  TopNav,
} from '../components'

const DATE_RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 12 months', 'Custom']

// ── Summary KPIs ─────────────────────────────────────────────────────────────
const SUMMARY_STATS = [
  { id: 'leads',      value: '1,347',  label: 'Leads handled by Myna',  delta: '18% vs last period', trend: 'up' as const },
  { id: 'appt-rate',  value: '28.4%',  label: 'Appointments set rate',   delta: 'Target: 25%',        trend: 'up' as const },
  { id: 'speed',      value: '3m 48s', label: 'Avg speed-to-lead',       delta: 'Target: <5 min',     trend: 'up' as const },
  { id: 'completion', value: '73.1%',  label: 'Journey completion rate', delta: 'Target: 70%',        trend: 'up' as const },
]

// ── Lead pipeline stages ─────────────────────────────────────────────────────
const PIPELINE = [
  { label: 'Internet leads received', count: 1347, pct: 100,  barColor: '#1565c0', dark: true  },
  { label: 'First contact made',      count: 1264, pct: 93.8, barColor: '#1976d2', dark: true  },
  { label: 'Lead qualified',          count: 824,  pct: 61.2, barColor: '#42a5f5', dark: true  },
  { label: 'Test drive scheduled',    count: 483,  pct: 35.9, barColor: '#90caf9', dark: false },
  { label: 'Appointment set',         count: 382,  pct: 28.4, barColor: '#bbdefb', dark: false },
]

// ── SLA compliance by source ─────────────────────────────────────────────────
type SlaStatus = 'ok' | 'warn' | 'fail'
const SLA_DATA: { source: string; pct: number; status: SlaStatus }[] = [
  { source: 'Website form', pct: 94, status: 'ok'   },
  { source: 'AutoTrader',   pct: 89, status: 'ok'   },
  { source: 'Cars.com',     pct: 86, status: 'ok'   },
  { source: 'CarGurus',     pct: 82, status: 'ok'   },
  { source: 'Phone-in',     pct: 71, status: 'warn' },
  { source: 'After-hours',  pct: 58, status: 'fail' },
]
const SLA_STYLE: Record<SlaStatus, { bar: string; icon: string; iconClass: string }> = {
  ok:   { bar: '#4cae3d', icon: 'check',        iconClass: 'text-chip-success-text' },
  warn: { bar: '#f59e0b', icon: 'priority_high', iconClass: 'text-[#c69204]'        },
  fail: { bar: '#de1b0c', icon: 'close',         iconClass: 'text-chip-danger-text' },
}

// ── Outbound journey performance ─────────────────────────────────────────────
const JOURNEY_DATA = [
  { journey: 'Internet lead',     touches: 2400, apptSet: 382 },
  { journey: 'Missed call',       touches: 870,  apptSet: 148 },
  { journey: 'Unsold showroom',   touches: 620,  apptSet: 112 },
  { journey: 'No-show re-engage', touches: 430,  apptSet: 67  },
  { journey: 'Lease maturity',    touches: 310,  apptSet: 58  },
  { journey: 'Equity mining',     touches: 180,  apptSet: 24  },
]
const JOURNEY_SERIES = [
  { key: 'touches', label: 'Touches sent', color: '#90caf9' },
  { key: 'apptSet', label: 'Appt set',     color: '#4cae3d' },
]

// ── Lead type breakdown ───────────────────────────────────────────────────────
const LEAD_TYPE_DATA = [
  { name: 'New vehicle', value: 35, color: '#5c6bc0' },
  { name: 'Used / CPO',  value: 25, color: '#42a5f5' },
  { name: 'Trade-in',    value: 15, color: '#4cae3d' },
  { name: 'Finance',     value: 15, color: '#f59e0b' },
  { name: 'Test drive',  value: 10, color: '#9e9e9e' },
]

export function SalesScreen() {
  const [dateRange, setDateRange] = useState('Last 30 days')

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">

        <ReportHeader
          title="Sales"
          rightSlot={
            <DateRangeSelector
              value={dateRange}
              options={DATE_RANGE_OPTIONS}
              onChange={setDateRange}
            />
          }
        />

        <div className="flex flex-col gap-lg px-2xl pb-2xl">

          {/* Summary KPIs */}
          <SummaryStats stats={SUMMARY_STATS} />

          {/* Mid row: pipeline + SLA */}
          <div className="grid grid-cols-2 gap-lg">

            <ChartCard title="Lead pipeline — inbound to appointment" showActions={false}>
              <p className="mb-md text-small text-text-secondary">% of total inbound leads</p>
              <div className="flex flex-col gap-sm">
                {PIPELINE.map((stage) => (
                  <div key={stage.label}>
                    <p className="mb-xs text-small text-text-secondary">
                      {stage.label} — {stage.count.toLocaleString()}
                    </p>
                    <div
                      className="flex h-9 items-center rounded-sm px-md"
                      style={{ width: `${stage.pct}%`, backgroundColor: stage.barColor }}
                    >
                      <span
                        className="text-body font-medium"
                        style={{ color: stage.dark ? '#ffffff' : '#212121' }}
                      >
                        {stage.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Speed-to-lead SLA compliance by source" showActions={false}>
              <div className="flex flex-col gap-md">
                {SLA_DATA.map((row) => {
                  const style = SLA_STYLE[row.status]
                  return (
                    <div key={row.source} className="flex items-center gap-md">
                      <span className="w-[120px] shrink-0 text-body text-text-primary">{row.source}</span>
                      <div className="relative h-[10px] flex-1 rounded-full bg-surface-selected">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ width: `${row.pct}%`, backgroundColor: style.bar }}
                        />
                      </div>
                      <span className="w-[36px] shrink-0 text-right text-body font-medium text-text-primary">
                        {row.pct}%
                      </span>
                      <Icon name={style.icon} size={18} className={`shrink-0 ${style.iconClass}`} />
                    </div>
                  )
                })}
              </div>
            </ChartCard>

          </div>

          {/* Bottom row: journey performance + lead type */}
          <div className="grid grid-cols-2 gap-lg">

            <ChartCard title="Outbound journey performance">
              <StackedBarChart
                data={JOURNEY_DATA}
                series={JOURNEY_SERIES}
                xKey="journey"
                height={320}
                grouped
                xAxisAngle={-35}
              />
            </ChartCard>

            <ChartCard title="Lead type breakdown">
              <DonutChart data={LEAD_TYPE_DATA} height={320} />
            </ChartCard>

          </div>

        </div>
      </div>
    </div>
  )
}
