import { Chip, DataTable, MetricTiles, type ChipVariant, type Column } from '../components'
import {
  HEALTHCARE_LOGS_METRICS,
  HEALTHCARE_LOGS_ROWS,
  type HealthcareLogRow,
} from '../data/healthcareAgentLogs'

const STATUS_VARIANT: Record<string, ChipVariant> = {
  Resolved: 'success',
  Abandoned: 'danger',
  Transferred: 'warning',
}

const LOG_COLUMNS: Column<HealthcareLogRow>[] = [
  { key: 'timestamp', label: 'Timestamp', width: 220, sortable: true },
  {
    key: 'status',
    label: 'Status',
    width: 130,
    sortable: true,
    render: (v) => <Chip label={String(v)} variant={STATUS_VARIANT[String(v)] ?? 'neutral'} />,
  },
  { key: 'contact', label: 'Contact', width: 200, sortable: true },
  { key: 'channel', label: 'Channel', width: 120, sortable: true },
  { key: 'duration', label: 'Duration', width: 110, sortable: true },
  { key: 'topic', label: 'Topic', width: 220, sortable: true },
]

export function AgentLogsTab() {
  return (
    <>
      <div className="px-2xl pt-lg">
        <MetricTiles metrics={HEALTHCARE_LOGS_METRICS} />
      </div>
      <div className="px-lg py-lg">
        <DataTable
          columns={LOG_COLUMNS}
          data={HEALTHCARE_LOGS_ROWS}
          rowAction={{
            icon: 'visibility',
            label: 'View run',
            onClick: () => {},
          }}
        />
      </div>
    </>
  )
}
