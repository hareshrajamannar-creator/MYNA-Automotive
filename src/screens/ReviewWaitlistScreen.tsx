import { useEffect, useRef, useState } from 'react'
import { Chip, DataTable, FormDrawer, Icon, QuickSendModal, Tabs, Toast, TopNav, ViewActivityDrawer, type ChipVariant, type Column } from '../components'

type WaitlistStatus = 'Waitlisted' | 'Slot offered' | 'Slot filled'
type OutreachChannel = 'chat' | 'call' | 'text'
type Priority = 'High' | 'Medium' | 'Low' | 'low'

interface WaitlistRow {
  patient: string
  outreach: OutreachChannel
  waitingSince: string
  priority: Priority
  apptType: string
  status: WaitlistStatus
  [key: string]: string
}

const ALL_ROWS: WaitlistRow[] = [
  // Waitlisted — 13
  { patient: 'Michael Smith',      outreach: 'chat', waitingSince: '4 days',       priority: 'High',   apptType: 'Procedure',       status: 'Waitlisted'   },
  { patient: 'Jessica Williams',   outreach: 'call', waitingSince: '5 days',       priority: 'Medium', apptType: 'New consult',     status: 'Waitlisted'   },
  { patient: 'David Brown',        outreach: 'chat', waitingSince: '6 days',       priority: 'Low',    apptType: 'Follow-up',       status: 'Waitlisted'   },
  { patient: 'Emily Davis',        outreach: 'call', waitingSince: '7 days',       priority: 'High',   apptType: 'Annual physical', status: 'Waitlisted'   },
  { patient: 'Christopher Garcia', outreach: 'chat', waitingSince: '8 days',       priority: 'Medium', apptType: 'Urgent care',     status: 'Waitlisted'   },
  { patient: 'Sarah Martinez',     outreach: 'call', waitingSince: '9 days',       priority: 'Low',    apptType: 'Procedure',       status: 'Waitlisted'   },
  { patient: 'James Rodriguez',    outreach: 'call', waitingSince: '10 days',      priority: 'High',   apptType: 'New consult',     status: 'Waitlisted'   },
  { patient: 'Linda White',        outreach: 'call', waitingSince: '11 days',      priority: 'Medium', apptType: 'Follow-up',       status: 'Waitlisted'   },
  { patient: 'William Harris',     outreach: 'call', waitingSince: '12 days',      priority: 'Low',    apptType: 'Annual physical', status: 'Waitlisted'   },
  { patient: 'Patricia Clark',     outreach: 'chat', waitingSince: '13 days',      priority: 'High',   apptType: 'Urgent care',     status: 'Waitlisted'   },
  { patient: 'Daniel Lewis',       outreach: 'chat', waitingSince: '14 days ago',  priority: 'Medium', apptType: 'Procedure',       status: 'Waitlisted'   },
  { patient: 'Sophia Walker',      outreach: 'chat', waitingSince: '15 days ago',  priority: 'Low',    apptType: 'New consult',     status: 'Waitlisted'   },
  { patient: 'Marcus Reed',        outreach: 'call', waitingSince: '16 days ago',  priority: 'High',   apptType: 'Follow-up',       status: 'Waitlisted'   },
  // Slot offered — 6
  { patient: 'Ethan Hall',         outreach: 'text', waitingSince: '3 days',       priority: 'High',   apptType: 'Follow-up',       status: 'Slot offered' },
  { patient: 'Olivia Allen',       outreach: 'call', waitingSince: '5 days',       priority: 'Medium', apptType: 'Procedure',       status: 'Slot offered' },
  { patient: 'Noah Young',         outreach: 'chat', waitingSince: '7 days',       priority: 'Low',    apptType: 'Annual physical', status: 'Slot offered' },
  { patient: 'Ava King',           outreach: 'text', waitingSince: '2 days',       priority: 'High',   apptType: 'Urgent care',     status: 'Slot offered' },
  { patient: 'Liam Scott',         outreach: 'call', waitingSince: '6 days',       priority: 'Medium', apptType: 'New consult',     status: 'Slot offered' },
  { patient: 'Chloe Turner',       outreach: 'chat', waitingSince: '4 days',       priority: 'Low',    apptType: 'Procedure',       status: 'Slot offered' },
  // Slot filled — 4
  { patient: 'Emma Green',         outreach: 'chat', waitingSince: '10 days ago',  priority: 'Low',    apptType: 'Procedure',       status: 'Slot filled'  },
  { patient: 'Mason Baker',        outreach: 'text', waitingSince: '12 days ago',  priority: 'High',   apptType: 'Follow-up',       status: 'Slot filled'  },
  { patient: 'Isabella Adams',     outreach: 'chat', waitingSince: '16 days ago',  priority: 'Medium', apptType: 'Annual physical', status: 'Slot filled'  },
  { patient: 'Lucas Mitchell',     outreach: 'call', waitingSince: '18 days ago',  priority: 'Low',    apptType: 'New consult',     status: 'Slot filled'  },
]

const TAB_FILTER: Record<string, WaitlistStatus | null> = {
  waitlisted:     'Waitlisted',
  'slot-offered': 'Slot offered',
  'slot-filled':  'Slot filled',
  all:            null,
}

const STATUS_VARIANT: Record<WaitlistStatus, ChipVariant> = {
  'Waitlisted':    'warning',
  'Slot offered':  'neutral',
  'Slot filled':   'success',
}

const OUTREACH_ICON: Record<OutreachChannel, string> = {
  chat: 'chat',
  call: 'phone',
  text: 'sms',
}

const STATUS_COLUMN: Column<WaitlistRow> = {
  key: 'status',
  label: 'Status',
  sortable: true,
  render: (v) => <Chip label={String(v)} variant={STATUS_VARIANT[v as WaitlistStatus] ?? 'neutral'} />,
}

const BASE_COLUMNS: Column<WaitlistRow>[] = [
  { key: 'patient',      label: 'Patient',          sortable: true },
  {
    key: 'outreach',
    label: 'Outreach channel',
    sortable: false,
    render: (v) => <Icon name={OUTREACH_ICON[v as OutreachChannel]} size={20} className="text-text-icon" />,
  },
  { key: 'waitingSince', label: 'Waiting since',    sortable: true },
  { key: 'priority',     label: 'Priority',         sortable: true },
  { key: 'apptType',     label: 'Appt type',        sortable: true },
]

function AddToWaitlistButton({ onSelect }: { onSelect: (mode: 'existing' | 'new') => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
      >
        Add to waitlist
      </button>
      {open && (
        <div className="absolute right-0 top-[40px] z-50 min-w-[216px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
          {(['existing', 'new'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { onSelect(mode); setOpen(false) }}
              className="block w-full px-md py-md text-left text-body text-text-primary hover:bg-surface-hover"
            >
              {mode === 'existing' ? 'Add existing patient' : 'Add a new patient'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const OFFER_SLOT_FIELDS = [
  { key: 'provider',  label: 'Provider',         type: 'select' as const, options: ['Dr. Smith', 'Dr. Patel', 'Dr. Lee', 'Dr. Nguyen'] },
  { key: 'apptType', label: 'Appointment type',  type: 'select' as const, options: ['Procedure', 'New consult', 'Follow-up', 'Annual physical', 'Urgent care'], placeholder: 'Select appointment type' },
  { key: 'date',     label: 'Date',              type: 'select' as const, options: ['Today', 'Tomorrow', 'This week', 'Next week'], placeholder: 'Pick a date' },
  { key: 'time',     label: 'Time',              type: 'select' as const, options: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'], placeholder: 'Pick a time' },
]

const ADD_EXISTING_FIELDS = [
  { key: 'patient',  label: 'Patient',          type: 'select' as const, options: ['Michael Smith', 'Jessica Williams', 'David Brown', 'Emily Davis'], placeholder: 'Select' },
  { key: 'apptType', label: 'Appointment type', type: 'select' as const, options: ['Procedure', 'New consult', 'Follow-up', 'Annual physical', 'Urgent care'], placeholder: 'Select' },
  { key: 'provider', label: 'Provider',         type: 'select' as const, options: ['Dr. Smith', 'Dr. Patel', 'Dr. Lee', 'Dr. Nguyen'], placeholder: 'Select' },
  { key: 'slotPref', label: 'Slot preference',  type: 'select' as const, options: ['Morning', 'Afternoon', 'Evening', 'Any'], placeholder: 'Select' },
  { key: 'priority', label: 'Priority',         type: 'select' as const, options: ['High', 'Medium', 'Low'], placeholder: 'Select' },
]

const ADD_NEW_FIELDS = [
  { key: 'name',     label: 'Patient name',     type: 'text'   as const, placeholder: 'Enter name' },
  { key: 'phone',    label: 'Phone number',     type: 'text'   as const, placeholder: 'Enter phone' },
  { key: 'dob',      label: 'Date of birth',    type: 'text'   as const, placeholder: 'MM/DD/YYYY' },
  { key: 'apptType', label: 'Appointment type', type: 'select' as const, options: ['Procedure', 'New consult', 'Follow-up', 'Annual physical', 'Urgent care'], placeholder: 'Select' },
  { key: 'provider', label: 'Provider',         type: 'select' as const, options: ['Dr. Smith', 'Dr. Patel', 'Dr. Lee', 'Dr. Nguyen'], placeholder: 'Select' },
  { key: 'location', label: 'Location',         type: 'select' as const, options: ['Main clinic', 'North branch', 'South branch'], placeholder: 'Select' },
  { key: 'slotPref', label: 'Slot preference',  type: 'select' as const, options: ['Morning', 'Afternoon', 'Evening', 'Any'], placeholder: 'Select' },
  { key: 'priority', label: 'Priority',         type: 'select' as const, options: ['High', 'Medium', 'Low'], placeholder: 'Select' },
]

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
const parseDays = (s: string) => parseInt(s) || 0

export function ReviewWaitlistScreen() {
  const [rows, setRows] = useState<WaitlistRow[]>(ALL_ROWS)
  const [activeTab, setActiveTab] = useState('waitlisted')
  const [offerSlotFor, setOfferSlotFor] = useState<WaitlistRow | null>(null)
  const [addMode, setAddMode] = useState<'existing' | 'new' | null>(null)
  const [quickSendRow, setQuickSendRow] = useState<WaitlistRow | null>(null)
  const [activityRow, setActivityRow] = useState<WaitlistRow | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const counts = {
    waitlisted:     rows.filter((r) => r.status === 'Waitlisted').length,
    'slot-offered': rows.filter((r) => r.status === 'Slot offered').length,
    'slot-filled':  rows.filter((r) => r.status === 'Slot filled').length,
    all:            rows.length,
  }

  const tabs = [
    { id: 'waitlisted',   label: 'Waitlisted',  count: counts.waitlisted          },
    { id: 'slot-offered', label: 'Slot offered', count: counts['slot-offered']     },
    { id: 'slot-filled',  label: 'Slot filled',  count: counts['slot-filled']      },
    { id: 'all',          label: 'All',          count: counts.all                 },
  ]

  const columns: Column<WaitlistRow>[] =
    activeTab === 'all' ? [...BASE_COLUMNS, STATUS_COLUMN] : BASE_COLUMNS

  const tableData = (() => {
    const filtered = activeTab === 'all'
      ? [...rows]
      : rows.filter((r) => r.status === TAB_FILTER[activeTab])

    if (activeTab === 'waitlisted') {
      filtered.sort((a, b) => {
        const pDiff = (PRIORITY_ORDER[a.priority.toLowerCase()] ?? 9) - (PRIORITY_ORDER[b.priority.toLowerCase()] ?? 9)
        return pDiff !== 0 ? pDiff : parseDays(b.waitingSince) - parseDays(a.waitingSince)
      })
    } else if (activeTab === 'slot-offered') {
      filtered.sort((a, b) => parseDays(b.waitingSince) - parseDays(a.waitingSince))
    } else if (activeTab === 'slot-filled') {
      filtered.sort((a, b) => parseDays(a.waitingSince) - parseDays(b.waitingSince))
    }

    return filtered
  })()

  function handleOfferSlot() {
    if (!offerSlotFor) return
    setRows((prev) =>
      prev.map((r) => r.patient === offerSlotFor.patient ? { ...r, status: 'Slot offered' } : r)
    )
    setOfferSlotFor(null)
  }

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto">
        {/* Page header */}
        <div className="flex items-center justify-between px-2xl py-xl">
          <h1 className="text-h3 text-text-primary">Review waitlist</h1>
          <div className="flex items-center gap-sm">
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="search" size={20} />
            </button>
            <AddToWaitlistButton onSelect={setAddMode} />
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="view_column" size={20} />
            </button>
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="filter_list" size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-2xl">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Table */}
        <div className="px-lg py-lg">
          <DataTable
            columns={columns}
            data={tableData}
            rowAction={{
              icon: 'calendar_add_on',
              label: 'Offer slot',
              onClick: (row) => setOfferSlotFor(row),
              visible: (row) => row.status === 'Waitlisted',
            }}
            rowMenuItems={[
              { label: 'Quick send',    onClick: (row) => setQuickSendRow(row) },
              { label: 'Quick view',    onClick: () => {} },
              { label: 'View activity', onClick: (row) => setActivityRow(row) },
              { label: 'View details',  onClick: () => {} },
            ]}
          />
        </div>
      </div>

      <FormDrawer
        open={offerSlotFor !== null}
        title={offerSlotFor ? `Offer slot for ${offerSlotFor.patient}` : 'Offer slot'}
        fields={OFFER_SLOT_FIELDS}
        submitLabel="Save"
        requiredKeys={['apptType', 'date', 'time']}
        initialValues={{ provider: 'Dr. Smith' }}
        onClose={() => setOfferSlotFor(null)}
        onSubmit={handleOfferSlot}
      />

      <FormDrawer
        open={addMode === 'existing'}
        title="Add patient to waitlist"
        fields={ADD_EXISTING_FIELDS}
        submitLabel="Add"
        requiredKeys={['patient', 'apptType', 'provider', 'priority']}
        onClose={() => setAddMode(null)}
        onSubmit={() => setAddMode(null)}
      />

      <FormDrawer
        open={addMode === 'new'}
        title="Add patient to waitlist"
        fields={ADD_NEW_FIELDS}
        submitLabel="Add"
        requiredKeys={['name', 'phone', 'apptType', 'provider', 'priority']}
        onClose={() => setAddMode(null)}
        onSubmit={() => setAddMode(null)}
      />

      <QuickSendModal
        open={quickSendRow !== null}
        patient={quickSendRow?.patient ?? ''}
        onClose={() => setQuickSendRow(null)}
        onSend={() => setToastVisible(true)}
      />

      <ViewActivityDrawer
        open={activityRow !== null}
        patient={activityRow?.patient ?? ''}
        onClose={() => setActivityRow(null)}
      />

      <Toast
        message="Review request sent"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  )
}
