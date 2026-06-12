import { useMemo, useState } from 'react'
import {
  ALL_STATUS_IDS,
  Chip,
  CustomizeColumnsDrawer,
  DataTable,
  DateChange,
  FilterPanel,
  Icon,
  MessageDrawer,
  QuickSendModal,
  StatusFilterDropdown,
  Toast,
  ViewActivityDrawer,
  WeekCalendar,
  DayCalendar,
  Tabs,
  TopNav,
  QuickViewDrawer,
  PatientCell,
  type AppointmentTimescale,
  type AppointmentView,
  type ChipVariant,
  type Column,
  type ColumnOption,
  type FilterField,
  type QuickViewAppointment,
} from '../components'

interface Appointment {
  name: string
  location: string
  status: string
  staff: string
  apptType: string
  insuranceStatus: string
  dateTime: string
  opCode: string
  phone: string
  email: string
  [key: string]: string
}

const APPOINTMENTS: Appointment[] = [
  // Unconfirmed — 5
  { patient: 'Megan Harris',   location: 'Main Campus',   status: 'Unconfirmed', provider: 'Dr. Lopez',     apptType: 'Follow up',       insuranceStatus: 'Pending',     dateTime: 'Sep 28, 2024 03:25 AM', phone: '(650) 555-0144', email: 'm.harris@email.com'    },
  { patient: 'Chris Evans',    location: 'North Clinic',  status: 'Unconfirmed', provider: 'Dr. Wilson',    apptType: 'Procedure',       insuranceStatus: 'Denied',      dateTime: 'Oct 08, 2024 02:00 PM', phone: '(415) 555-0132', email: 'c.evans@email.com'     },
  { patient: 'Linda Thomas',   location: 'South Clinic',  status: 'Unconfirmed', provider: 'Dr. Carter',    apptType: 'New consult',     insuranceStatus: 'In progress', dateTime: 'Oct 19, 2024 11:15 AM', phone: '(650) 555-0177', email: 'l.thomas@email.com'    },
  { patient: 'Patricia Clark', location: 'East Branch',   status: 'Unconfirmed', provider: 'Dr. Adams',     apptType: 'Annual physical', insuranceStatus: 'Verified',    dateTime: 'Nov 14, 2024 08:45 AM', phone: '(415) 555-0199', email: 'p.clark@email.com'     },
  { patient: 'William Harris', location: 'Main Campus',   status: 'Unconfirmed', provider: 'Dr. Baker',     apptType: 'Urgent care',     insuranceStatus: 'Pending',     dateTime: 'Nov 15, 2024 10:45 AM', phone: '(408) 555-0166', email: 'w.harris@email.com'    },
  // Cancelled — 5
  { patient: 'Michael Wilson', location: 'North Clinic',  status: 'Cancelled',   provider: 'Dr. Jones',     apptType: 'Urgent care',     insuranceStatus: 'Verified',    dateTime: 'Feb 20, 2024 02:00 PM', phone: '(408) 555-0188', email: 'm.wilson@email.com'    },
  { patient: 'James Thomas',   location: 'South Clinic',  status: 'Cancelled',   provider: 'Dr. Davis',     apptType: 'New consult',     insuranceStatus: 'Pending',     dateTime: 'Jun 23, 2024 01:00 PM', phone: '(408) 555-0166', email: 'j.thomas@email.com'    },
  { patient: 'Laura Jackson',  location: 'East Branch',   status: 'Cancelled',   provider: 'Dr. Martinez',  apptType: 'Annual physical', insuranceStatus: 'In progress', dateTime: 'Jul 30, 2024 06:40 AM', phone: '(415) 555-0199', email: 'l.jackson@email.com'   },
  { patient: 'Daniel White',   location: 'Main Campus',   status: 'Cancelled',   provider: 'Dr. Hernandez', apptType: 'Procedure',       insuranceStatus: 'Denied',      dateTime: 'Aug 15, 2024 09:55 PM', phone: '(669) 555-0101', email: 'd.white@email.com'     },
  { patient: 'Kevin Moore',    location: 'North Clinic',  status: 'Cancelled',   provider: 'Dr. Edwards',   apptType: 'Follow up',       insuranceStatus: 'Verified',    dateTime: 'Oct 14, 2024 11:10 AM', phone: '(408) 555-0188', email: 'k.moore@email.com'     },
  // No-show — 4
  { patient: 'David Martinez', location: 'South Clinic',  status: 'Missed',     provider: 'Dr. Rodriguez', apptType: 'Follow up',       insuranceStatus: 'Denied',      dateTime: 'Apr 18, 2024 04:50 AM', phone: '(669) 555-0123', email: 'd.martinez@email.com'  },
  { patient: 'Sarah Anderson', location: 'East Branch',   status: 'Missed',     provider: 'Dr. Miller',    apptType: 'New consult',     insuranceStatus: 'Pending',     dateTime: 'May 07, 2024 10:05 PM', phone: '(650) 555-0177', email: 's.anderson@email.com'  },
  { patient: 'Jessica Taylor', location: 'Main Campus',   status: 'Missed',     provider: 'Dr. Garcia',    apptType: 'Procedure',       insuranceStatus: 'In progress', dateTime: 'Mar 11, 2024 12:30 PM', phone: '(415) 555-0155', email: 'jess.t@email.com'      },
  { patient: 'Robert Brown',   location: 'North Clinic',  status: 'Missed',     provider: 'Dr. Williams',  apptType: 'Annual physical', insuranceStatus: 'Verified',    dateTime: 'Dec 01, 2023 11:45 AM', phone: '(408) 555-0117', email: 'r.brown@email.com'     },
]

const TAB_STATUS_MAP: Record<string, string> = {
  unconfirmed:   'Unconfirmed',
  cancellations: 'Cancelled',
  'no-shows':    'Missed',
}

const STATUS_CHIP: Record<string, ChipVariant> = {
  'Unconfirmed': 'warning',
  'Cancelled':   'danger',
  'Missed':      'danger',
  'Confirmed':   'success',
  'Rescheduled': 'neutral',
}

const STATUS_COLUMN: Column<Appointment> = {
  key: 'status',
  label: 'Appointment status',
  sortable: true,
  render: (val) => (
    <Chip label={String(val)} variant={STATUS_CHIP[String(val)] ?? 'neutral'} />
  ),
}

const TABS = [
  { id: 'unconfirmed',   label: 'Unconfirmed',   count: 5  },
  { id: 'cancellations', label: 'Cancellations', count: 5  },
  { id: 'no-shows',      label: 'Missed',        count: 4  },
  { id: 'all',           label: 'All',           count: 14 },
]

interface ColumnDef extends Column<Appointment> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'patient', label: 'Patient', sortable: true, locked: true, render: (_val, row) => <PatientCell name={row.patient as string} location={row.location as string} /> },
  { key: 'provider',        label: 'Provider',         sortable: true },
  { key: 'apptType',        label: 'Appointment type', sortable: true },
  { key: 'insuranceStatus', label: 'Insurance status', sortable: true },
  { key: 'dateTime',        label: 'Appointment time', sortable: true },
  { key: 'phone',           label: 'Phone',            sortable: true },
  { key: 'email',           label: 'Email',            sortable: true },
]
const DEFAULT_ORDER = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = ['patient', 'provider', 'apptType', 'insuranceStatus', 'dateTime']
const DEF_BY_KEY = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

const FILTER_FIELDS: FilterField[] = [
  { id: 'groups',               label: 'Groups',               options: opts('Group A', 'Group B', 'Group C') },
  { id: 'location',             label: 'Location',             options: opts('Main Campus', 'North Clinic', 'South Clinic', 'East Branch') },
  { id: 'city',                 label: 'City',                 options: opts('Austin', 'Dallas', 'Houston', 'San Antonio') },
  { id: 'state',                label: 'State',                options: opts('Texas', 'California', 'Florida', 'New York') },
  { id: 'social-manager',       label: 'Social manager',       options: opts('Alice', 'Bob', 'Carol', 'David') },
  { id: 'region-manager',       label: 'Region manager',       options: opts('Region 1', 'Region 2', 'Region 3') },
  { id: 'content-manager',      label: 'Content manager',      options: opts('Manager A', 'Manager B', 'Manager C') },
  { id: 'conversation-status',  label: 'Conversation status',  options: opts('Open', 'Closed', 'Pending', 'Resolved') },
  { id: 'provider',             label: 'Provider',             options: opts('Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones') },
  { id: 'appointment-type',     label: 'Appointment type',     options: opts('Procedure', 'New consult', 'Follow up', 'Annual physical', 'Urgent care') },
  { id: 'insurance-status',     label: 'Insurance status',     options: opts('Verified', 'In progress', 'Denied', 'Pending') },
  { id: 'appointment-status',   label: 'Appointment status',   options: opts('Unconfirmed', 'Cancellations', 'Missed') },
]

const BASE_DATE = new Date(2026, 4, 25)

export function ManageAppointmentsScreen({ product = 'healthcare' }: { product?: string }) {
  const [date, setDate] = useState(new Date(BASE_DATE))
  const [view, setView] = useState<AppointmentView>('table')
  const [timescale, setTimescale] = useState<AppointmentTimescale>('day')
  const [activeTab, setActiveTab] = useState('unconfirmed')
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible] = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [statusAnchor, setStatusAnchor] = useState<{ top: number; left: number } | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(ALL_STATUS_IDS)
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>(ALL_STATUS_IDS)
  const [messagingRow, setMessagingRow] = useState<Appointment | null>(null)
  const [quickSendRow, setQuickSendRow] = useState<Appointment | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [activityRow, setActivityRow] = useState<Appointment | null>(null)
  const [quickViewRow, setQuickViewRow] = useState<QuickViewAppointment | null>(null)


  const isToday = date.toDateString() === BASE_DATE.toDateString()
  const step = timescale === 'week' ? 7 : 1
  function prevStep() { setDate(d => { const n = new Date(d); n.setDate(n.getDate() - step); return n }) }
  function nextStep() { setDate(d => { const n = new Date(d); n.setDate(n.getDate() + step); return n }) }
  function goToToday() { setDate(new Date(BASE_DATE)) }

  const columns = useMemo<Column<Appointment>[]>(() => {
    const base = order
      .filter((k) => visible.includes(k))
      .map((k) => DEF_BY_KEY.get(k))
      .filter((c): c is ColumnDef => Boolean(c))
    if (activeTab === 'all') {
      return [...base, STATUS_COLUMN]
    }
    return base
  }, [order, visible, activeTab])

  const columnOptions = useMemo<ColumnOption[]>(
    () => order.map((k) => ({ key: k, label: DEF_BY_KEY.get(k)!.label, locked: DEF_BY_KEY.get(k)!.locked })),
    [order],
  )

  const filteredData = useMemo(
    () =>
      activeTab === 'all'
        ? APPOINTMENTS
        : APPOINTMENTS.filter((a) => a.status === TAB_STATUS_MAP[activeTab]),
    [activeTab],
  )

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Header — changes based on table vs calendar view */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-surface px-2xl py-xl">
            {/* Left side */}
            {view === 'calendar' ? (
              <DateChange date={date} isToday={isToday} timescale={timescale} onPrev={prevStep} onNext={nextStep} onToday={goToToday} />
            ) : (
              <h1 className="text-h3 text-text-primary">Appointments</h1>
            )}

            {/* Right side controls */}
            <div className="flex items-center gap-sm">
              {view === 'calendar' && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      if (statusDropdownOpen) {
                        setStatusDropdownOpen(false)
                        setStatusAnchor(null)
                        return
                      }
                      const r = e.currentTarget.getBoundingClientRect()
                      setStatusAnchor({ top: r.bottom + 4, left: r.left })
                      setSelectedStatuses(appliedStatuses)
                      setStatusDropdownOpen(true)
                    }}
                    className={`flex h-9 items-center gap-sm rounded-sm border bg-surface pl-md pr-sm text-body text-text-primary hover:bg-surface-l2 ${
                      statusDropdownOpen ? 'border-primary' : 'border-border-selected'
                    }`}
                  >
                    Status
                    <Icon name="expand_more" size={20} className="text-text-icon" />
                  </button>

                  <div className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-xs">
                    <button
                      type="button"
                      onClick={() => setTimescale('day')}
                      className={`rounded-sm px-sm py-xs text-body transition-colors ${timescale === 'day' ? 'bg-surface-selected text-text-primary' : 'text-text-icon hover:bg-surface-hover'}`}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimescale('week')}
                      className={`rounded-sm px-sm py-xs text-body transition-colors ${timescale === 'week' ? 'bg-surface-selected text-text-primary' : 'text-text-icon hover:bg-surface-hover'}`}
                    >
                      Week
                    </button>
                  </div>
                </>
              )}

              {/* Table / Calendar toggle */}
              <div className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-sm">
                <button
                  type="button"
                  aria-label="Table view"
                  onClick={() => setView('table')}
                  className={`flex size-6 items-center justify-center rounded-sm transition-colors ${view === 'table' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'}`}
                >
                  <Icon name="table_rows" size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Calendar view"
                  onClick={() => setView('calendar')}
                  className={`flex size-6 items-center justify-center rounded-sm transition-colors ${view === 'calendar' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'}`}
                >
                  <Icon name="calendar_month" size={18} />
                </button>
              </div>

              <button
                type="button"
                className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
              >
                Book appointment
              </button>

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

          {view === 'calendar' ? (
            <div className="flex flex-1 overflow-hidden px-2xl py-lg">
              <div className="flex flex-1 flex-col overflow-hidden rounded-sm border border-border">
                {timescale === 'day' ? (
                  <DayCalendar day={date} />
                ) : (
                  <WeekCalendar weekStart={date} />
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="px-2xl">
                <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
              </div>

              <div className="px-lg py-lg">
                <DataTable
                  rowHeight={56}
                  columns={columns}
                  data={filteredData}
                  rowAction={{
                    icon: 'chat',
                    label: (row) => `Message ${row.name}`,
                    onClick: (row) => setMessagingRow(row),
                  }}
                  rowMenuItems={[
                    { label: 'Quick send',    onClick: (row) => setQuickSendRow(row) },
                    { label: 'Quick view',    onClick: (row) => setQuickViewRow({ patient: row.patient, provider: row.provider, apptType: row.apptType, dateTime: row.dateTime, status: row.status }) },
                    { label: 'View activity', onClick: (row) => setActivityRow(row) },
                    { label: 'View details',  onClick: () => {}, icon: 'open_in_new' },
                  ]}
                />
              </div>
            </>
          )}
        </div>

        <FilterPanel
          open={filterOpen}
          fields={FILTER_FIELDS}
          onClose={() => setFilterOpen(false)}
          onAdvancedFilters={() => {}}
        />
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

      <MessageDrawer
        open={messagingRow !== null}
        patient={messagingRow?.name ?? ''}
        status={messagingRow?.status}
        onClose={() => setMessagingRow(null)}
      />

      <QuickSendModal
        open={quickSendRow !== null}
        patient={quickSendRow?.name ?? ''}
        email={quickSendRow?.email}
        onClose={() => setQuickSendRow(null)}
        onSend={() => setToastVisible(true)}
      />

      <ViewActivityDrawer
        open={activityRow !== null}
        patient={activityRow?.name ?? ''}
        onClose={() => setActivityRow(null)}
      />

      <QuickViewDrawer
        open={quickViewRow !== null}
        appointment={quickViewRow}
        onClose={() => setQuickViewRow(null)}
      />

      <Toast
        message="Review request sent"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {statusDropdownOpen && statusAnchor && (
        <>
          <div
            className="fixed inset-0 z-[105]"
            onClick={() => {
              setStatusDropdownOpen(false)
              setStatusAnchor(null)
            }}
          />
          <div
            className="fixed z-[110]"
            style={{ top: statusAnchor.top, left: statusAnchor.left }}
          >
            <StatusFilterDropdown
              value={selectedStatuses}
              onChange={setSelectedStatuses}
              onApply={() => {
                setAppliedStatuses(selectedStatuses)
                setStatusDropdownOpen(false)
                setStatusAnchor(null)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
