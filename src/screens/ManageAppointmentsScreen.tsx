import { useMemo, useState } from 'react'
import {
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  // MetricTiles,
  PageHeader,
  SetupAppointmentDrawer,
  Tabs,
  TopNav,
  type AppointmentView,
  type Column,
  type ColumnOption,
  type FilterField,
  // type Metric,
} from '../components'

interface Appointment {
  patient: string
  status: string
  customerRep: string
  apptType: string
  insuranceStatus: string
  vehicle: string
  phone: string
  email: string
  location: string
  time: string
  [key: string]: string
}

const APPOINTMENTS: Appointment[] = [
  { patient: 'John Doe',        status: 'Confirmed',     customerRep: 'Smith',     apptType: 'Service',          insuranceStatus: 'Verified',    vehicle: 'Toyota RAV4',       phone: '(415) 555-0132', email: 'john.doe@email.com',   location: 'Mountain View', time: '08:00 AM' },
  { patient: 'Alice Johnson',   status: 'Confirmed',     customerRep: 'Johnson',   apptType: 'Sale - Test drive', insuranceStatus: 'NA',          vehicle: 'Ford F-Series',     phone: '(415) 555-0190', email: 'alice.j@email.com',    location: 'Palo Alto',     time: '08:30 AM' },
  { patient: 'Patricia Clark',  status: 'No-shows',      customerRep: 'Adams',     apptType: 'Service',          insuranceStatus: 'Verified',    vehicle: 'Toyota RAV4',       phone: '(415) 555-0199', email: 'p.clark@email.com',    location: 'Mountain View', time: '08:45 AM' },
  { patient: 'Robert Brown',    status: 'Confirmed',     customerRep: 'Williams',  apptType: 'Sale - Prospect',  insuranceStatus: 'NA',          vehicle: 'Honda CR-V',        phone: '(408) 555-0117', email: 'r.brown@email.com',    location: 'San Jose',      time: '09:00 AM' },
  { patient: 'James Thomas',    status: 'Cancellations', customerRep: 'Davis',     apptType: 'Sale - Parts',     insuranceStatus: 'NA',          vehicle: 'Honda CR-V',        phone: '(408) 555-0166', email: 'j.thomas@email.com',   location: 'Sunnyvale',     time: '09:15 AM' },
  { patient: 'Emily Davis',     status: 'Confirmed',     customerRep: 'Brown',     apptType: 'Service',          insuranceStatus: 'In Progress', vehicle: 'Toyota RAV4',       phone: '(650) 555-0144', email: 'emily.d@email.com',    location: 'Mountain View', time: '09:30 AM' },
  { patient: 'Michael Wilson',  status: 'Confirmed',     customerRep: 'Jones',     apptType: 'Sale - Parts',     insuranceStatus: 'NA',          vehicle: 'Chevrolet Equinox', phone: '(408) 555-0188', email: 'm.wilson@email.com',   location: 'Sunnyvale',     time: '10:00 AM' },
  { patient: 'Laura Jackson',   status: 'Cancellations', customerRep: 'Martinez',  apptType: 'Service',          insuranceStatus: 'In Progress', vehicle: 'Ford F-Series',     phone: '(415) 555-0199', email: 'l.jackson@email.com',  location: 'Palo Alto',     time: '10:15 AM' },
  { patient: 'Jessica Taylor',  status: 'Confirmed',     customerRep: 'Garcia',    apptType: 'Service',          insuranceStatus: 'Unverified',  vehicle: 'Honda CR-V',        phone: '(415) 555-0155', email: 'jess.t@email.com',     location: 'Palo Alto',     time: '10:30 AM' },
  { patient: 'William Harris',  status: 'No-shows',      customerRep: 'Baker',     apptType: 'Sale - Parts',     insuranceStatus: 'NA',          vehicle: 'Ford F-Series',     phone: '(408) 555-0166', email: 'w.harris@email.com',   location: 'San Jose',      time: '10:45 AM' },
  { patient: 'David Martinez',  status: 'Confirmed',     customerRep: 'Rodriguez', apptType: 'Sale - Test drive', insuranceStatus: 'NA',          vehicle: 'Ford F-Series',     phone: '(669) 555-0123', email: 'd.martinez@email.com', location: 'San Jose',      time: '11:00 AM' },
  { patient: 'Linda Thomas',    status: 'No-shows',      customerRep: 'Carter',    apptType: 'Sale - Prospect',  insuranceStatus: 'NA',          vehicle: 'Honda CR-V',        phone: '(650) 555-0177', email: 'l.thomas@email.com',   location: 'Mountain View', time: '11:15 AM' },
  { patient: 'Sarah Anderson',  status: 'Confirmed',     customerRep: 'Miller',    apptType: 'Service',          insuranceStatus: 'Verified',    vehicle: 'Toyota RAV4',       phone: '(650) 555-0177', email: 's.anderson@email.com', location: 'Mountain View', time: '11:30 AM' },
  { patient: 'Daniel White',    status: 'Cancellations', customerRep: 'Hernandez', apptType: 'Sale - Prospect',  insuranceStatus: 'NA',          vehicle: 'Toyota RAV4',       phone: '(669) 555-0101', email: 'd.white@email.com',    location: 'San Jose',      time: '12:00 PM' },
  { patient: 'Kevin Moore',     status: 'No-shows',      customerRep: 'Edwards',   apptType: 'Service',          insuranceStatus: 'Unverified',  vehicle: 'Chevrolet Equinox', phone: '(408) 555-0188', email: 'k.moore@email.com',    location: 'Sunnyvale',     time: '01:00 PM' },
  { patient: 'Megan Harris',    status: 'Cancellations', customerRep: 'Lopez',     apptType: 'Service',          insuranceStatus: 'Unverified',  vehicle: 'Chevrolet Equinox', phone: '(650) 555-0144', email: 'm.harris@email.com',   location: 'Mountain View', time: '01:30 PM' },
  { patient: 'Chris Evans',     status: 'Cancellations', customerRep: 'Wilson',    apptType: 'Sale - Test drive', insuranceStatus: 'NA',          vehicle: 'Honda Civic',       phone: '(415) 555-0132', email: 'c.evans@email.com',    location: 'Palo Alto',     time: '02:00 PM' },
]

// const METRICS: Metric[] = [
//   { id: 'confirmed',     value: 13, label: 'Confirmed'     },
//   { id: 'pending',       value: 5,  label: 'Pending'       },
//   { id: 'cancellations', value: 5,  label: 'Cancellations' },
//   { id: 'no-shows',      value: 4,  label: 'No-shows'      },
// ]

const TAB_STATUS_MAP: Record<string, string> = {
  confirmed: 'Confirmed',
  cancellations: 'Cancellations',
  'no-shows': 'No-shows',
}

const TABS = [
  { id: 'confirmed', label: 'Confirmed', count: 13 },
  { id: 'cancellations', label: 'Cancellations', count: 5 },
  { id: 'no-shows', label: 'No-shows', count: 1 },
]

interface ColumnDef extends Column<Appointment> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'patient',         label: 'Name',             width: 220, sortable: true, locked: true },
  { key: 'vehicle',         label: 'Vehicle',          width: 180, sortable: true },
  { key: 'customerRep',     label: 'Customer rep',     width: 160, sortable: true },
  { key: 'apptType',        label: 'Appt type',        width: 160, sortable: true },
  { key: 'insuranceStatus', label: 'Insurance status', width: 160, sortable: true },
  { key: 'time',            label: 'Time',             width: 110, sortable: true },
  { key: 'phone',           label: 'Phone',            width: 160, sortable: true },
  { key: 'email',           label: 'Email',            width: 210, sortable: true },
  { key: 'location',        label: 'Location',         width: 160, sortable: true },
]

const DEFAULT_ORDER = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = ['patient', 'vehicle', 'customerRep', 'apptType', 'insuranceStatus', 'time']
const DEF_BY_KEY = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

const FILTER_FIELDS: FilterField[] = [
  { id: 'groups', label: 'Groups', options: opts('All dealerships', 'Northeast', 'Southeast', 'Midwest', 'West') },
  { id: 'location', label: 'Location', options: opts('Mountain View', 'Palo Alto', 'San Jose', 'Sunnyvale') },
  { id: 'city', label: 'City', options: opts('Mountain View', 'Palo Alto', 'San Jose', 'Sunnyvale', 'Fremont') },
  { id: 'state', label: 'State', options: opts('California', 'Texas', 'New York', 'Florida', 'Washington') },
  { id: 'social-manager', label: 'Social manager', options: opts('Smith', 'Johnson', 'Williams', 'Brown') },
  { id: 'region-manager', label: 'Region manager', options: opts('Garcia', 'Rodriguez', 'Miller', 'Davis') },
  { id: 'content-manager', label: 'Content manager', options: opts('Martinez', 'Hernandez', 'Lopez', 'Wilson') },
  { id: 'conversation-status', label: 'Conversation status', options: opts('Open', 'In progress', 'Closed', 'Escalated') },
  { id: 'appointment-type', label: 'Appointment type', options: opts('Service', 'Sale - First visit', 'Sale - Test drive', 'Sale - Trade-in', 'Query', 'Procedure') },
  { id: 'insurance-status', label: 'Insurance status', options: opts('Verified', 'In Progress', 'Denied', 'Pending') },
  { id: 'appointment-status', label: 'Appointment status', options: opts('Confirmed', 'Pending', 'No-shows', 'Cancellations') },
]

const BASE_DATE = new Date(2026, 4, 25)

export function ManageAppointmentsScreen() {
  const [date, setDate] = useState(new Date(BASE_DATE))
  const [view, setView] = useState<AppointmentView>('table')
  const [activeTab, setActiveTab] = useState('confirmed')
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible] = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
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
    () => APPOINTMENTS.filter((a) => a.status === TAB_STATUS_MAP[activeTab]),
    [activeTab],
  )

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
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

          {/* <div className="px-2xl pt-lg">
            <MetricTiles metrics={METRICS} />
          </div> */}

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
                { label: 'Quick send', onClick: () => {} },
                { label: 'Quick view', onClick: () => {} },
                { label: 'View activity', onClick: () => {} },
                { label: 'View details', onClick: () => {} },
              ]}
            />
          </div>
        </div>

        {/* Filter panel (pushes content) */}
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
