import { useMemo, useState } from 'react'
import {
  Chip,
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  MetricTiles,
  PageHeader,
  SetupAppointmentDrawer,
  TopNav,
  type AppointmentView,
  type ChipVariant,
  type Column,
  type ColumnOption,
  type FilterField,
  type Metric,
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
  [key: string]: string
}

const METRICS: Metric[] = [
  { id: 'confirmed', value: 13, label: 'Confirmed' },
  { id: 'pending', value: 5, label: 'Pending' },
  { id: 'cancellations', value: 5, label: 'Cancellations' },
  { id: 'no-shows', value: 4, label: 'No-shows' },
]

const STATUS_VARIANT: Record<string, ChipVariant> = {
  Confirmed: 'success',
  Pending: 'warning',
  'No-shows': 'danger',
  Cancellations: 'danger',
  Label: 'neutral',
}

const APPOINTMENTS: Appointment[] = [
  { patient: 'John Doe', status: 'Confirmed', customerRep: 'Smith', apptType: 'Service', insuranceStatus: 'Verified', vehicle: 'Toyota RAV4', phone: '(415) 555-0132', email: 'john.doe@email.com', location: 'Mountain View' },
  { patient: 'Alice Johnson', status: 'Confirmed', customerRep: 'Johnson', apptType: 'Sale - First visit', insuranceStatus: 'In Progress', vehicle: 'Ford F-Series', phone: '(415) 555-0190', email: 'alice.j@email.com', location: 'Palo Alto' },
  { patient: 'Robert Brown', status: 'No-shows', customerRep: 'Williams', apptType: 'Service', insuranceStatus: 'Denied', vehicle: 'Ford F-Series', phone: '(408) 555-0117', email: 'r.brown@email.com', location: 'San Jose' },
  { patient: 'Emily Davis', status: 'Pending', customerRep: 'Brown', apptType: 'Sale - Test drive', insuranceStatus: 'In Progress', vehicle: 'Toyota RAV4', phone: '(650) 555-0144', email: 'emily.d@email.com', location: 'Mountain View' },
  { patient: 'Michael Wilson', status: 'Cancellations', customerRep: 'Jones', apptType: 'Service', insuranceStatus: 'Verified', vehicle: 'Honda CR-V', phone: '(408) 555-0188', email: 'm.wilson@email.com', location: 'Sunnyvale' },
  { patient: 'Jessica Taylor', status: 'Confirmed', customerRep: 'Garcia', apptType: 'Service', insuranceStatus: 'In Progress', vehicle: 'Honda CR-V', phone: '(415) 555-0155', email: 'jess.t@email.com', location: 'Palo Alto' },
  { patient: 'David Martinez', status: 'Pending', customerRep: 'Rodriguez', apptType: 'Sale - Trade-in', insuranceStatus: 'Denied', vehicle: 'Chevrolet Equinox', phone: '(669) 555-0123', email: 'd.martinez@email.com', location: 'San Jose' },
  { patient: 'Sarah Anderson', status: 'Confirmed', customerRep: 'Miller', apptType: 'Sale', insuranceStatus: 'In Progress', vehicle: 'Honda CR-V', phone: '(650) 555-0177', email: 's.anderson@email.com', location: 'Mountain View' },
  { patient: 'James Thomas', status: 'Confirmed', customerRep: 'Davis', apptType: 'Query', insuranceStatus: 'Verified', vehicle: 'Toyota RAV4', phone: '(408) 555-0166', email: 'j.thomas@email.com', location: 'Sunnyvale' },
  { patient: 'Laura Jackson', status: 'Pending', customerRep: 'Martinez', apptType: 'Query', insuranceStatus: 'In Progress', vehicle: 'Ford F-Series', phone: '(415) 555-0199', email: 'l.jackson@email.com', location: 'Palo Alto' },
  { patient: 'Daniel White', status: 'Label', customerRep: 'Dr. Hernandez', apptType: 'Procedure', insuranceStatus: 'Denied', vehicle: 'Aug 15, 2024 09:55 PM', phone: '(669) 555-0101', email: 'd.white@email.com', location: 'San Jose' },
]

interface ColumnDef extends Column<Appointment> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'patient', label: 'Patient', width: 220, sortable: true, locked: true },
  {
    key: 'status',
    label: 'Status',
    width: 160,
    sortable: true,
    render: (value) => (
      <Chip label={String(value)} variant={STATUS_VARIANT[String(value)] ?? 'neutral'} />
    ),
  },
  { key: 'vehicle', label: 'Vehicle', width: 180, sortable: true },
  { key: 'customerRep', label: 'Customer rep', width: 160, sortable: true },
  { key: 'apptType', label: 'Appt type', width: 160, sortable: true },
  { key: 'insuranceStatus', label: 'Insurance status', width: 160, sortable: true },
  { key: 'phone', label: 'Phone', width: 160, sortable: true },
  { key: 'email', label: 'Email', width: 210, sortable: true },
  { key: 'location', label: 'Location', width: 160, sortable: true },
]

const DEFAULT_ORDER = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = ['patient', 'status', 'vehicle', 'customerRep', 'apptType', 'insuranceStatus']
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

export function ManageAppointmentsScreen() {
  const [view, setView] = useState<AppointmentView>('table')
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible] = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appointmentFor, setAppointmentFor] = useState<string | null>(null)

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

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-auto">
          <PageHeader
            date="May 25, 2026"
            view={view}
            onViewChange={setView}
            onCustomizeColumns={() => setCustomizeOpen(true)}
            onFilter={() => setFilterOpen((o) => !o)}
          />

          <div className="px-2xl pt-lg">
            <MetricTiles metrics={METRICS} />
          </div>

          <div className="px-lg py-lg">
            <DataTable
              columns={columns}
              data={APPOINTMENTS}
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
