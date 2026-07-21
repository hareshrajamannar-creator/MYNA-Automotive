import { useState } from 'react'
import { Chip, DataTable, HeaderSearchField, Icon, type ChipVariant, type Column } from '../components'
import {
  SOURCE_LABEL,
  TARGET_TYPE_ICON,
  TARGET_TYPE_LABEL,
  type FeedbackRecord,
  type FeedbackStatus,
} from '../data/feedbackData'
import { useFeedbackStore } from '../data/FeedbackStoreContext'

const STATUS_VARIANT: Record<FeedbackStatus, ChipVariant> = {
  open: 'neutral',
  applied: 'success',
  rejected: 'danger',
}

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  open: 'Open',
  applied: 'Applied',
  rejected: 'Rejected',
}

const STATUS_FILTERS: { id: 'all' | FeedbackStatus; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'open', label: 'Open' },
  { id: 'applied', label: 'Applied' },
  { id: 'rejected', label: 'Rejected' },
]

interface FeedbackRow extends Record<string, unknown> {
  id: string
  title: string
  summary: string
  source: FeedbackRecord['source']
  status: FeedbackStatus
  changes: FeedbackRecord['changes']
  conversationCount?: number
  timeAgo: string
  record: FeedbackRecord
}

interface FeedbackTabProps {
  agentName: string
  onOpenRecord: (record: FeedbackRecord) => void
}

export function FeedbackTab({ agentName, onOpenRecord }: FeedbackTabProps) {
  const { recordsForAgent } = useFeedbackStore()
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all')
  const [statusOpen, setStatusOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const records = recordsForAgent(agentName)
  const q = searchQuery.trim().toLowerCase()
  const rows: FeedbackRow[] = records
    .filter((r) => statusFilter === 'all' || r.status === statusFilter)
    .filter((r) => !q || r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
    .map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      source: r.source,
      status: r.status,
      changes: r.changes,
      conversationCount: r.conversationCount,
      timeAgo: r.timeAgo,
      record: r,
    }))

  const columns: Column<FeedbackRow>[] = [
    {
      key: 'title',
      label: 'Feedback',
      width: 340,
      sortable: true,
      render: (_v, row) => (
        <div className="flex flex-col gap-xs py-xs">
          <span className="text-body text-text-primary">{row.title}</span>
          <span className="truncate text-small text-text-secondary">{row.summary}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      sortable: true,
      render: (_v, row) => <Chip label={STATUS_LABEL[row.status]} variant={STATUS_VARIANT[row.status]} />,
    },
    {
      key: 'source',
      label: 'Type',
      width: 170,
      sortable: true,
      render: (_v, row) => (
        <span className="flex items-center gap-xs text-body text-text-primary">
          <Icon name={row.source === 'ai' ? 'auto_awesome' : 'school'} size={16} className="text-text-icon" />
          {SOURCE_LABEL[row.source]}
        </span>
      ),
    },
    {
      key: 'changes',
      label: 'What changed',
      width: 240,
      render: (_v, row) => (
        <div className="flex flex-wrap items-center gap-xs">
          {row.changes.map((change) => (
            <span
              key={change.id}
              className="flex items-center gap-xs rounded-sm border border-border bg-surface px-sm py-xs text-small text-text-primary"
            >
              <Icon name={TARGET_TYPE_ICON[change.targetType]} size={14} className="text-text-icon" />
              {TARGET_TYPE_LABEL[change.targetType]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'conversationCount',
      label: 'Conversations',
      width: 140,
      sortable: true,
      render: (v) => <span>{v == null ? '—' : String(v)}</span>,
    },
    { key: 'timeAgo', label: 'Time', width: 110, sortable: true },
  ]

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between px-2xl py-lg">
        <p className="m-0 text-body text-text-secondary">
          AI recommendations and coaching from your team — open a record to review and refine changes.
        </p>
        <div className="flex items-center gap-sm">
          <HeaderSearchField
            open={searchOpen}
            value={searchQuery}
            onOpenChange={setSearchOpen}
            onChange={setSearchQuery}
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusOpen((v) => !v)}
              className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary hover:bg-surface-l2"
            >
              {STATUS_FILTERS.find((s) => s.id === statusFilter)?.label}
              <Icon name={statusOpen ? 'expand_less' : 'expand_more'} size={20} className="text-text-icon" />
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-[105]" onClick={() => setStatusOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full z-[110] mt-xs min-w-[168px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                      onClick={() => {
                        setStatusFilter(s.id)
                        setStatusOpen(false)
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="min-h-0 flex-1 overflow-auto px-lg pb-lg">
        <DataTable columns={columns} data={rows} onRowClick={(row) => onOpenRecord(row.record)} />
      </div>
    </div>
  )
}
