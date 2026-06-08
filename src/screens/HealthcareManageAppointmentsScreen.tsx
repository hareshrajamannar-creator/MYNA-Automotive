import { useMemo, useState } from 'react'
import {
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  PageHeader,
  SetupAppointmentDrawer,
  Tabs,
  TopNav,
  type AppointmentView,
  type Column,
  type ColumnOption,
  type FilterField,
} from '../components'

interface Appointment {
  patient: string
  status: string
  provider: string
  apptType: string
  insuranceStatus: string
  dateTime: string
  [key: string]: string
}

const APPOINTMENTS: Appointment[] = [
  { patient: 'John Doe',          status: 'Unconfirmed',   provider: 'Dr. Smith',    apptType: 'Procedure',        insuranceStatus: 'Verified',    dateTime: 'Nov 12, 2023 09:00 AM' },
  { patient: 'Alice Johnson',     status: 'Unconfirmed',   provider: 'Dr. Johnson',  apptType: 'New Consult',      insuranceStatus: 'In Progress', dateTime: 'Oct 29, 2023 05:30 PM' },
  { patient: 'Robert Brown',      status: 'Unconfirmed',   provider: 'Dr. Williams', apptType: 'Follow Up',        insuranceStatus: 'Denied',      dateTime: 'Dec 01, 2023 11:45 AM' },
  { patient: 'Emily Davis',       status: 'Unconfirmed',   provider: 'Dr. Brown',    apptType: 'Annual Physical',  insuranceStatus: 'Pending',     dateTime: 'Jan 15, 2024 07:15 PM' },
  { patient: 'Michael Wilson',    status: 'Unconfirmed',   provider: 'Dr. Jones',    apptType: 'Urgent Care',      insuranceStatus: 'Verified',    dateTime: 'Feb 20, 2024 02:00 PM' },
  { patient: 'Patricia Clark',    status: 'Cancellations', provider: 'Dr. Smith',    apptType: 'Follow Up',        insuranceStatus: 'Verified',    dateTime: 'Nov 14, 2023 10:00 AM' },
  { patient: 'James Thomas',      status: 'Cancellations', provider: 'Dr. Williams', apptType: 'New Consult',      insuranceStatus: 'Pending',     dateTime: 'Nov 18, 2023 02:30 PM' },
  { patient: 'Laura Jackson',     status: 'Cancellations', provider: 'Dr. Johnson',  apptType: 'Referral',         insuranceStatus: 'In Progress', dateTime: 'Dec 05, 2023 09:15 AM' },
  { patient: 'Jessica Taylor',    status: 'Cancellations', provider: 'Dr. Brown',    apptType: 'Annual Physical',  insuranceStatus: 'Verified',    dateTime: 'Dec 10, 2023 04:00 PM' },
  { patient: 'William Harris',    status: 'Cancellations', provider: 'Dr. Jones',    apptType: 'Procedure',        insuranceStatus: 'Denied',      dateTime: 'Jan 08, 2024 11:00 AM' },
  { patient: 'David Martinez',    status: 'No-shows',      provider: 'Dr. Smith',    apptType: 'Urgent Care',      insuranceStatus: 'Verified',    dateTime: 'Nov 20, 2023 08:30 AM' },
  { patient: 'Linda Thomas',      status: 'No-shows',      provider: 'Dr. Williams', apptType: 'Follow Up',        insuranceStatus: 'In Progress', dateTime: 'Dec 03, 2023 01:00 PM' },
  { patient: 'Sarah Anderson',    status: 'No-shows',      provider: 'Dr. Johnson',  apptType: 'New Consult',      insuranceStatus: 'Pending',     dateTime: 'Dec 15, 2023 03:45 PM' },
  { patient: 'Daniel White',      status: 'No-shows',      provider: 'Dr. Brown',    apptType: 'Referral',         insuranceStatus: 'Verified',    dateTime: 'Jan 22, 2024 10:30 AM' },
]

const TAB_STATUS_MAP: Record<string, string> = {
  unconfirmed:   'Unconfirmed',
  cancellations: 'Cancellations',
  'no-shows':    'No-shows',
}

const TABS = [
  { id: 'unconfirmed',   label: 'Unconfirmed',   count: 5  },
  { id: 'cancellations', label: 'Cancellations', count: 5  },
  { id: 'no-shows',      label: 'No-shows',      count: 4  },
  { id: 'all',           label: 'All',           count: 13 },
]

interface ColumnDef extends Column<Appointment> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'patient',         label: 'Patient',          width: 220, sortable: true, locked: true },
  { key: 'provider',        label: 'Provider',         width: 180, sortable: true },
  { key: 'apptType',        label: 'Appt type',        width: 180, sortable: true },
  { key: 'insuranceStatus', label: 'Insurance status', width: 180, sortable: true },
  { key: 'dateTime',        label: 'Date & time',      width: 220, sortable: true },
]

const DEFAULT_ORDER   = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = ['patient', 'provider', 'apptType', 'insuranceStatus', 'dateTime']
const DEF_BY_KEY      = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

const FILTER_FIELDS: FilterField[] = [
  { id: 'location',          label: 'Location',          options: opts('Main Clinic', 'North Branch', 'South Branch', 'East Campus'), multi: true },
  { id: 'provider',          label: 'Provider',          options: opts('Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones'), multi: true },
  { id: 'appointment-type',  label: 'Appointment type',  options: opts('Procedure', 'New Consult', 'Follow Up', 'Annual Physical', 'Urgent Care', 'Referral') },
  { id: 'insurance-status',  label: 'Insurance status',  options: opts('Verified', 'In Progress', 'Denied', 'Pending') },
  { id: 'appt-status',       label: 'Appointment status', options: opts('Unconfirmed', 'Cancellations', 'No-shows') },
]

const BASE_DATE = new Date(2026, 4, 25)

export function HealthcareManageAppointmentsScreen() {
  const [date, setDate]         = useState(new Date(BASE_DATE))
  const [view, setView]         = useState<AppointmentView>('table')
  const [activeTab, setActiveTab] = useState('unconfirmed')
  const [order, setOrder]       = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible]   = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen]       = useState(false)
  const [appointmentFor, setAppointmentFor] = useState<string | null>(null)

  const isToday = date.toDateString() === BASE_DATE.toDateString()
  function prevDay() { setDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n }) }
  function nextDay() { setDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n }) }
  function goToToday() { setDate(new Date(BASE_DATE)) }

  const columns = useMemo<Column<Appointment>[]>(
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
        ? APPOINTMENTS
        : APPOINTMENTS.filter((a) => a.status === TAB_STATUS_MAP[activeTab]),
    [activeTab],
  )

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          <PageHeader
            date={date}
            isToday={isToday}
            view={view}
            onPrev={prevDay}
            onNext={nextDay}
            onToday={goToToday}
            onViewChange={setView}
            onCustomizeColumns={() => setCustomizeOpen(true)}
            onFilter={() => setFilterOpen((o) => !o)}
          />

          <div className="px-2xl">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="px-lg py-lg">
            <DataTable
              columns={columns}
              data={filteredData}
              rowAction={{
                icon: 'calendar_add_on',
                label: 'Setup appointment',
                onClick: (row) => setAppointmentFor(row.patient),
              }}
              rowMenuItems={[
                { label: 'Quick send',     onClick: () => {} },
                { label: 'Quick view',     onClick: () => {} },
                { label: 'View activity',  onClick: () => {} },
                { label: 'View details',   onClick: () => {} },
              ]}
            />
          </div>
        </div>

        <FilterPanel
          open={filterOpen}
          fields={FILTER_FIELDS}
          onClose={() => setFilterOpen(false)}
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

      <SetupAppointmentDrawer
        open={appointmentFor !== null}
        subject={appointmentFor ?? undefined}
        onClose={() => setAppointmentFor(null)}
        onOfferSlot={() => setAppointmentFor(null)}
      />
    </div>
  )
}
