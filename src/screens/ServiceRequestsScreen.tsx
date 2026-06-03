import { useMemo, useState } from 'react'
import {
  Chip,
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  FormDrawer,
  Icon,
  MetricTiles,
  TopNav,
  type ChipVariant,
  type Column,
  type ColumnOption,
  type FilterField,
  type FormField,
  type Metric,
} from '../components'

interface ServiceRequest {
  customer: string
  vehicle: string
  serviceType: string
  advisor: string
  status: string
  promisedBy: string
  priority: string
  phone: string
  email: string
  [key: string]: string
}

const METRICS: Metric[] = [
  { id: 'new', value: 9, label: 'New' },
  { id: 'scheduled', value: 7, label: 'Scheduled' },
  { id: 'in-service', value: 5, label: 'In service' },
  { id: 'awaiting-parts', value: 3, label: 'Awaiting parts' },
  { id: 'completed', value: 11, label: 'Completed' },
]

const STATUS_VARIANT: Record<string, ChipVariant> = {
  New: 'neutral',
  Scheduled: 'warning',
  'In service': 'success',
  'Awaiting parts': 'danger',
  Completed: 'success',
}

const REQUESTS: ServiceRequest[] = [
  { customer: 'John Carter', vehicle: 'Toyota RAV4 2021', serviceType: 'Oil change', advisor: 'Smith', status: 'Scheduled', promisedBy: 'Jun 06, 2026 09:00 AM', priority: 'Medium', phone: '(415) 555-0132', email: 'j.carter@email.com' },
  { customer: 'Maria Lopez', vehicle: 'Honda CR-V 2020', serviceType: 'Brake repair', advisor: 'Johnson', status: 'In service', promisedBy: 'Jun 04, 2026 02:00 PM', priority: 'High', phone: '(415) 555-0190', email: 'm.lopez@email.com' },
  { customer: 'David Brown', vehicle: 'Ford F-150 2019', serviceType: 'Recall service', advisor: 'Williams', status: 'Awaiting parts', promisedBy: 'Jun 09, 2026 11:30 AM', priority: 'High', phone: '(408) 555-0117', email: 'd.brown@email.com' },
  { customer: 'Emily Davis', vehicle: 'Chevrolet Equinox 2022', serviceType: 'Tire rotation', advisor: 'Brown', status: 'New', promisedBy: 'Jun 05, 2026 10:00 AM', priority: 'Low', phone: '(650) 555-0144', email: 'e.davis@email.com' },
  { customer: 'Michael Wilson', vehicle: 'Toyota Camry 2018', serviceType: 'Diagnostics', advisor: 'Jones', status: 'In service', promisedBy: 'Jun 04, 2026 04:15 PM', priority: 'Medium', phone: '(408) 555-0188', email: 'm.wilson@email.com' },
  { customer: 'Jessica Taylor', vehicle: 'Honda Civic 2021', serviceType: 'Battery replacement', advisor: 'Garcia', status: 'Completed', promisedBy: 'Jun 03, 2026 01:00 PM', priority: 'Low', phone: '(415) 555-0155', email: 'j.taylor@email.com' },
  { customer: 'James Rodriguez', vehicle: 'Ford Explorer 2020', serviceType: 'AC repair', advisor: 'Rodriguez', status: 'Scheduled', promisedBy: 'Jun 07, 2026 09:30 AM', priority: 'Medium', phone: '(669) 555-0123', email: 'j.rodriguez@email.com' },
  { customer: 'Sarah Anderson', vehicle: 'Nissan Altima 2019', serviceType: 'Transmission service', advisor: 'Miller', status: 'Awaiting parts', promisedBy: 'Jun 10, 2026 03:00 PM', priority: 'High', phone: '(650) 555-0177', email: 's.anderson@email.com' },
  { customer: 'Robert King', vehicle: 'Jeep Wrangler 2022', serviceType: 'Oil change', advisor: 'Davis', status: 'New', promisedBy: 'Jun 05, 2026 08:30 AM', priority: 'Low', phone: '(408) 555-0166', email: 'r.king@email.com' },
  { customer: 'Linda White', vehicle: 'Subaru Outback 2021', serviceType: 'Brake repair', advisor: 'Martinez', status: 'Completed', promisedBy: 'Jun 02, 2026 11:00 AM', priority: 'Medium', phone: '(415) 555-0199', email: 'l.white@email.com' },
]

interface ColumnDef extends Column<ServiceRequest> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'customer', label: 'Customer', width: 220, sortable: true, locked: true },
  {
    key: 'status',
    label: 'Status',
    width: 160,
    sortable: true,
    render: (value) => <Chip label={String(value)} variant={STATUS_VARIANT[String(value)] ?? 'neutral'} />,
  },
  { key: 'vehicle', label: 'Vehicle', width: 190, sortable: true },
  { key: 'serviceType', label: 'Service type', width: 170, sortable: true },
  { key: 'advisor', label: 'Service advisor', width: 160, sortable: true },
  { key: 'promisedBy', label: 'Promised by', width: 190, sortable: true },
  { key: 'priority', label: 'Priority', width: 130, sortable: true },
  { key: 'phone', label: 'Phone', width: 160, sortable: true },
  { key: 'email', label: 'Email', width: 210, sortable: true },
]

const DEFAULT_ORDER = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = ['customer', 'status', 'vehicle', 'serviceType', 'advisor', 'promisedBy']
const DEF_BY_KEY = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

const SERVICE_TYPES = ['Oil change', 'Brake repair', 'Tire rotation', 'Diagnostics', 'Recall service', 'Battery replacement', 'AC repair', 'Transmission service']
const ADVISORS = ['Auto-assign', 'Smith', 'Johnson', 'Williams', 'Brown', 'Garcia']
const DATES = ['Today', 'Tomorrow', 'Jun 06, 2026', 'Jun 07, 2026', 'Jun 09, 2026']
const TIMES = ['08:30 AM', '09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM']

// Header CTA — create a brand new request.
const CREATE_FIELDS: FormField[] = [
  { key: 'customer', label: 'Customer name', type: 'text', placeholder: 'Enter input' },
  { key: 'phone', label: 'Phone number', type: 'text', placeholder: 'Enter input' },
  { key: 'vehicle', label: 'Vehicle', type: 'text', placeholder: 'e.g. Toyota RAV4 2021' },
  { key: 'serviceType', label: 'Service type', type: 'select', placeholder: 'Select', options: SERVICE_TYPES },
  { key: 'priority', label: 'Priority', type: 'select', placeholder: 'Select', options: ['High', 'Medium', 'Low'] },
  { key: 'advisor', label: 'Service advisor', type: 'select', placeholder: 'Select', options: ADVISORS },
  { key: 'preferredDate', label: 'Preferred date', type: 'select', placeholder: 'Pick a date', options: DATES },
]

// Row CTA — schedule the service for an existing request.
const SCHEDULE_FIELDS: FormField[] = [
  { key: 'advisor', label: 'Service advisor', type: 'select', placeholder: 'Select advisor', options: ADVISORS },
  { key: 'serviceType', label: 'Service type', type: 'select', placeholder: 'Select service type', options: SERVICE_TYPES },
  { key: 'bay', label: 'Service bay', type: 'select', placeholder: 'Select bay', options: ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4'] },
  { key: 'date', label: 'Date', type: 'select', placeholder: 'Pick a date', options: DATES },
  { key: 'time', label: 'Time', type: 'select', placeholder: 'Pick a time', options: TIMES },
]

const FILTER_FIELDS: FilterField[] = [
  { id: 'groups', label: 'Groups', options: opts('All dealerships', 'Northeast', 'Southeast', 'Midwest', 'West') },
  { id: 'location', label: 'Location', options: opts('Mountain View', 'Palo Alto', 'San Jose', 'Sunnyvale') },
  { id: 'service-type', label: 'Service type', options: opts(...SERVICE_TYPES) },
  { id: 'status', label: 'Status', options: opts('New', 'Scheduled', 'In service', 'Awaiting parts', 'Completed') },
  { id: 'advisor', label: 'Service advisor', options: opts('Smith', 'Johnson', 'Williams', 'Brown', 'Garcia') },
  { id: 'priority', label: 'Priority', options: opts('High', 'Medium', 'Low') },
  { id: 'vehicle-make', label: 'Vehicle make', options: opts('Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Jeep', 'Subaru') },
]

export function ServiceRequestsScreen() {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible] = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [scheduleFor, setScheduleFor] = useState<string | null>(null)

  const columns = useMemo<Column<ServiceRequest>[]>(
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
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Header: title + actions */}
          <div className="flex h-16 items-center justify-between bg-surface px-2xl">
            <h1 className="text-h3 text-text-primary">Service requests</h1>
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
                onClick={() => setCreateOpen(true)}
                className="flex h-9 items-center rounded-sm bg-primary px-lg text-body font-medium text-white transition-colors hover:bg-primary-hover"
              >
                New request
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

          <div className="px-2xl pt-lg">
            <MetricTiles metrics={METRICS} />
          </div>

          <div className="px-lg py-lg">
            <DataTable
              columns={columns}
              data={REQUESTS}
              rowAction={{
                icon: 'build',
                label: 'Schedule service',
                onClick: (row) => setScheduleFor(row.customer),
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

      {/* Header CTA drawer */}
      <FormDrawer
        open={createOpen}
        title="Create service request"
        fields={CREATE_FIELDS}
        submitLabel="Create"
        requiredKeys={['customer', 'phone', 'serviceType']}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => setCreateOpen(false)}
      />

      {/* Row CTA drawer */}
      <FormDrawer
        open={scheduleFor !== null}
        title="Schedule service"
        fields={SCHEDULE_FIELDS}
        submitLabel="Schedule"
        requiredKeys={['serviceType', 'date', 'time']}
        initialValues={{ advisor: 'Auto-assign' }}
        onClose={() => setScheduleFor(null)}
        onSubmit={() => setScheduleFor(null)}
      />
    </div>
  )
}
