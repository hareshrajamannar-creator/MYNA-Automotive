import { useMemo, useState } from 'react'
import {
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  FormDrawer,
  Icon,
  Tabs,
  TopNav,
  type Column,
  type ColumnOption,
  type FilterField,
  type FormField,
} from '../components'
import iconInbox from '../assets/icon-inbox.svg'
import iconMail from '../assets/icon-mail.svg'

interface WaitlistPatient {
  patient: string
  outreachChannel: string
  waitingSince: string
  priority: string
  apptType: string
  status: string
  [key: string]: string
}

const TABS = [
  { id: 'waitlisted',   label: 'Waitlisted',   count: 13 },
  { id: 'slot-offered', label: 'Slot offered', count: 6  },
  { id: 'slot-filled',  label: 'Slot filled',  count: 4  },
  { id: 'all',          label: 'All',          count: 32 },
]

const TAB_STATUS_MAP: Record<string, string> = {
  'waitlisted':   'Waitlisted',
  'slot-offered': 'Slot offered',
  'slot-filled':  'Slot filled',
}

const PATIENTS: WaitlistPatient[] = [
  { patient: 'Michael Smith',      outreachChannel: 'sms',   waitingSince: '4 days',      priority: 'High',   apptType: 'Procedure',       status: 'Waitlisted'   },
  { patient: 'Jessica Williams',   outreachChannel: 'phone', waitingSince: '5 days',      priority: 'Medium', apptType: 'New consult',     status: 'Waitlisted'   },
  { patient: 'David Brown',        outreachChannel: 'sms',   waitingSince: '6 days',      priority: 'Low',    apptType: 'Follow-up',       status: 'Waitlisted'   },
  { patient: 'Emily Davis',        outreachChannel: 'email', waitingSince: '7 days',      priority: 'High',   apptType: 'Annual physical', status: 'Waitlisted'   },
  { patient: 'Christopher Garcia', outreachChannel: 'sms',   waitingSince: '8 days',      priority: 'Medium', apptType: 'Urgent care',     status: 'Waitlisted'   },
  { patient: 'Sarah Martinez',     outreachChannel: 'phone', waitingSince: '9 days',      priority: 'Low',    apptType: 'Procedure',       status: 'Waitlisted'   },
  { patient: 'James Rodriguez',    outreachChannel: 'phone', waitingSince: '10 days',     priority: 'High',   apptType: 'New consult',     status: 'Waitlisted'   },
  { patient: 'Linda White',        outreachChannel: 'email', waitingSince: '11 days',     priority: 'Medium', apptType: 'Follow-up',       status: 'Waitlisted'   },
  { patient: 'William Harris',     outreachChannel: 'email', waitingSince: '12 days',     priority: 'Low',    apptType: 'Annual physical', status: 'Waitlisted'   },
  { patient: 'Patricia Clark',     outreachChannel: 'sms',   waitingSince: '13 days',     priority: 'High',   apptType: 'Urgent care',     status: 'Waitlisted'   },
  { patient: 'Daniel Lewis',       outreachChannel: 'sms',   waitingSince: '14 days ago', priority: 'Medium', apptType: 'Procedure',       status: 'Waitlisted'   },
  { patient: 'Sophia Walker',      outreachChannel: 'sms',   waitingSince: '15 days ago', priority: 'Low',    apptType: 'New consult',     status: 'Waitlisted'   },
  { patient: 'Robert Thompson',    outreachChannel: 'email', waitingSince: '16 days ago', priority: 'High',   apptType: 'Follow-up',       status: 'Waitlisted'   },
  { patient: 'Nancy Moore',        outreachChannel: 'phone', waitingSince: '3 days',      priority: 'High',   apptType: 'Urgent care',     status: 'Slot offered' },
  { patient: 'Kevin Martinez',     outreachChannel: 'sms',   waitingSince: '5 days',      priority: 'Medium', apptType: 'Annual physical', status: 'Slot offered' },
  { patient: 'Betty Garcia',       outreachChannel: 'email', waitingSince: '7 days',      priority: 'Low',    apptType: 'Procedure',       status: 'Slot offered' },
  { patient: 'Steven Clark',       outreachChannel: 'phone', waitingSince: '9 days',      priority: 'High',   apptType: 'New consult',     status: 'Slot offered' },
  { patient: 'Dorothy Lewis',      outreachChannel: 'sms',   waitingSince: '11 days',     priority: 'Medium', apptType: 'Follow-up',       status: 'Slot offered' },
  { patient: 'George Hall',        outreachChannel: 'email', waitingSince: '13 days ago', priority: 'Low',    apptType: 'Urgent care',     status: 'Slot offered' },
  { patient: 'Helen Young',        outreachChannel: 'sms',   waitingSince: '2 days',      priority: 'High',   apptType: 'Annual physical', status: 'Slot filled'  },
  { patient: 'Frank Allen',        outreachChannel: 'email', waitingSince: '4 days',      priority: 'Medium', apptType: 'Procedure',       status: 'Slot filled'  },
  { patient: 'Ruth King',          outreachChannel: 'phone', waitingSince: '6 days',      priority: 'Low',    apptType: 'New consult',     status: 'Slot filled'  },
  { patient: 'Charles Wright',     outreachChannel: 'sms',   waitingSince: '8 days',      priority: 'High',   apptType: 'Follow-up',       status: 'Slot filled'  },
]

interface ColumnDef extends Column<WaitlistPatient> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'patient', label: 'Patient', width: 220, sortable: true, locked: true },
  {
    key: 'outreachChannel',
    label: 'Outreach channel',
    width: 160,
    sortable: true,
    render: (val) => {
      if (val === 'sms')   return <img src={iconInbox} alt="SMS"   className="size-5" />
      if (val === 'email') return <img src={iconMail}  alt="Email" className="size-5" />
      return <Icon name="call" size={18} className="text-text-secondary" />
    },
  },
  { key: 'waitingSince', label: 'Waiting since', width: 160, sortable: true },
  { key: 'priority',     label: 'Priority',       width: 130, sortable: true },
  { key: 'apptType',     label: 'Appt type',      width: 180, sortable: true },
]

const DEFAULT_ORDER   = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = DEFAULT_ORDER
const DEF_BY_KEY      = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

const APPT_TYPES = ['Procedure', 'New consult', 'Follow-up', 'Annual physical', 'Urgent care']
const PROVIDERS  = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Garcia']
const DATES      = ['Today', 'Tomorrow', 'Jun 06, 2026', 'Jun 07, 2026', 'Jun 09, 2026']

const FILTER_FIELDS: FilterField[] = [
  { id: 'appt-type',        label: 'Appt type',        options: opts(...APPT_TYPES),                          multi: true },
  { id: 'priority',         label: 'Priority',         options: opts('High', 'Medium', 'Low'),                multi: true },
  { id: 'outreach-channel', label: 'Outreach channel', options: opts('SMS', 'Phone', 'Email')                              },
  { id: 'provider',         label: 'Provider',         options: opts(...PROVIDERS),                           multi: true },
]

const ADD_FIELDS: FormField[] = [
  { key: 'patient',  label: 'Patient name',     type: 'text',   placeholder: 'Enter name'  },
  { key: 'phone',    label: 'Phone number',     type: 'text',   placeholder: 'Enter phone' },
  { key: 'apptType', label: 'Appointment type', type: 'select', placeholder: 'Select', options: APPT_TYPES },
  { key: 'priority', label: 'Priority',         type: 'select', placeholder: 'Select', options: ['High', 'Medium', 'Low'] },
  { key: 'provider', label: 'Provider',         type: 'select', placeholder: 'Select', options: PROVIDERS },
  { key: 'date',     label: 'Preferred date',   type: 'select', placeholder: 'Pick a date', options: DATES },
]

export function ReviewWaitlistScreen() {
  const [activeTab, setActiveTab]         = useState('waitlisted')
  const [order, setOrder]                 = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible]             = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen]       = useState(false)
  const [addOpen, setAddOpen]             = useState(false)
  const [view, setView]                   = useState<'table' | 'grid'>('table')

  const columns = useMemo<Column<WaitlistPatient>[]>(
    () =>
      order
        .filter((k) => visible.includes(k))
        .map((k) => DEF_BY_KEY.get(k))
        .filter((c): c is ColumnDef => Boolean(c)),
    [order, visible],
  )

  const columnOptions = useMemo<ColumnOption[]>(
    () => order.map((k) => ({ key: k, label: DEF_BY_KEY.get(k)!.label, locked: DEF_BY_KEY.get(k)!.locked })),
    [order],
  )

  const filteredData = useMemo(
    () =>
      activeTab === 'all'
        ? PATIENTS
        : PATIENTS.filter((r) => r.status === TAB_STATUS_MAP[activeTab]),
    [activeTab],
  )

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Header: static title + actions */}
          <div className="flex items-center justify-between bg-surface px-2xl py-xl">
            <h2 className="text-h3 text-text-primary">Review waitlist</h2>
            <div className="flex items-center gap-sm">
              <button
                type="button"
                aria-label="Search"
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="search" size={20} />
              </button>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
              >
                Add to waitlist
              </button>
              {/* View toggle */}
              <div className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-sm">
                <button
                  type="button"
                  aria-label="Table view"
                  onClick={() => setView('table')}
                  className={`flex size-6 items-center justify-center rounded-sm ${view === 'table' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'}`}
                >
                  <Icon name="table_rows" size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setView('grid')}
                  className={`flex size-6 items-center justify-center rounded-sm ${view === 'grid' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'}`}
                >
                  <Icon name="grid_view" size={18} />
                </button>
              </div>
              <button
                type="button"
                aria-label="Customize columns"
                onClick={() => setCustomizeOpen(true)}
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="view_column" size={20} />
              </button>
              <button
                type="button"
                aria-label="Filters"
                onClick={() => setFilterOpen((o) => !o)}
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="filter_list" size={20} />
              </button>
            </div>
          </div>

          <div className="px-2xl">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="px-lg py-lg">
            <DataTable
              columns={columns}
              data={filteredData}
              rowAction={{
                icon: 'event_available',
                label: 'Offer slot',
                onClick: () => {},
              }}
              rowMenuItems={[
                { label: 'Quick view',    onClick: () => {} },
                { label: 'View activity', onClick: () => {} },
                { label: 'Offer slot',    onClick: () => {} },
              ]}
            />
          </div>
        </div>

        <FilterPanel open={filterOpen} fields={FILTER_FIELDS} onClose={() => setFilterOpen(false)} />
      </div>

      <CustomizeColumnsDrawer
        open={customizeOpen}
        options={columnOptions}
        visibleKeys={visible}
        onClose={() => setCustomizeOpen(false)}
        onSave={(orderedKeys, visibleKeys) => {
          setOrder(orderedKeys)
          setVisible(visibleKeys)
        }}
        onRestoreDefault={() => {
          setOrder(DEFAULT_ORDER)
          setVisible(DEFAULT_VISIBLE)
        }}
      />

      <FormDrawer
        open={addOpen}
        title="Add to waitlist"
        fields={ADD_FIELDS}
        submitLabel="Add"
        requiredKeys={['patient', 'phone', 'apptType']}
        onClose={() => setAddOpen(false)}
        onSubmit={() => setAddOpen(false)}
      />
    </div>
  )
}
