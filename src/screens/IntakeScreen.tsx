import { useMemo, useState } from 'react'
import {
  Chip,
  CustomizeColumnsDrawer,
  DataTable,
  FilterPanel,
  Icon,
  QuickViewDrawer,
  ViewActivityDrawer,
  Tabs,
  TopNav,
  type ChipProps,
  type Column,
  type ColumnOption,
  type FilterField,
  type PatientDetail,
} from '../components'
import iconInbox from '../assets/icon-inbox.svg'
import iconMail from '../assets/icon-mail.svg'

interface IntakePatient {
  patient: string
  appointmentDate: string
  bookedOn: string
  formType: string
  sentVia: string
  sentOn: string
  status: string
  [key: string]: string
}

const TABS = [
  { id: 'overdue',     label: 'Overdue',     count: 11 },
  { id: 'not-started', label: 'Not started', count: 13 },
  { id: 'in-progress', label: 'In progress', count: 6  },
  { id: 'completed',   label: 'Completed',   count: 4  },
  { id: 'all',         label: 'All',         count: 32 },
]

const TAB_STATUS_MAP: Record<string, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  'completed':   'Completed',
}

const TODAY_DATE = 'May 27'

const PATIENTS: IntakePatient[] = [
  { patient: 'John Smith',          appointmentDate: 'May 27', bookedOn: 'Apr 10', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Alice Johnson',       appointmentDate: 'May 27', bookedOn: 'Apr 12', formType: 'Follow-up',   sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Robert Williams',     appointmentDate: 'May 27', bookedOn: 'Apr 15', formType: 'Referral',    sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Mary Brown',          appointmentDate: 'May 27', bookedOn: 'Apr 18', formType: 'New patient', sentVia: 'email', sentOn: 'May 20', status: 'Not started' },
  { patient: 'Michael Davis',       appointmentDate: 'May 27', bookedOn: 'Apr 20', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Jennifer Wilson',     appointmentDate: 'May 27', bookedOn: 'Apr 22', formType: 'Referral',    sentVia: 'email', sentOn: 'May 20', status: 'Not started' },
  { patient: 'David Garcia',        appointmentDate: 'May 27', bookedOn: 'Apr 25', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Linda Rodriguez',     appointmentDate: 'May 27', bookedOn: 'Apr 28', formType: 'Referral',    sentVia: 'email', sentOn: 'May 20', status: 'Not started' },
  { patient: 'Christopher Martinez',appointmentDate: 'May 27', bookedOn: 'May 01', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Angela Anderson',     appointmentDate: 'May 27', bookedOn: 'May 03', formType: 'Follow-up',   sentVia: 'email', sentOn: 'May 20', status: 'Not started' },
  { patient: 'Thomas Taylor',       appointmentDate: 'May 27', bookedOn: 'May 05', formType: 'Text/Number', sentVia: 'sms',   sentOn: 'May 20', status: 'Not started' },
  { patient: 'Sarah Moore',         appointmentDate: 'May 28', bookedOn: 'Apr 14', formType: 'New patient', sentVia: 'email', sentOn: 'May 21', status: 'Not started' },
  { patient: 'Kevin Jackson',       appointmentDate: 'May 28', bookedOn: 'Apr 16', formType: 'Follow-up',   sentVia: 'sms',   sentOn: 'May 21', status: 'Not started' },
  { patient: 'Emily White',         appointmentDate: 'May 28', bookedOn: 'Apr 18', formType: 'Referral',    sentVia: 'email', sentOn: 'May 21', status: 'In progress' },
  { patient: 'James Harris',        appointmentDate: 'May 28', bookedOn: 'Apr 20', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 21', status: 'In progress' },
  { patient: 'Patricia Clark',      appointmentDate: 'May 29', bookedOn: 'Apr 22', formType: 'Follow-up',   sentVia: 'email', sentOn: 'May 22', status: 'In progress' },
  { patient: 'Daniel Lewis',        appointmentDate: 'May 29', bookedOn: 'Apr 24', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 22', status: 'In progress' },
  { patient: 'Nancy Robinson',      appointmentDate: 'May 29', bookedOn: 'Apr 26', formType: 'Text/Number', sentVia: 'email', sentOn: 'May 22', status: 'In progress' },
  { patient: 'Mark Walker',         appointmentDate: 'May 30', bookedOn: 'Apr 28', formType: 'Referral',    sentVia: 'sms',   sentOn: 'May 23', status: 'In progress' },
  { patient: 'Betty Hall',          appointmentDate: 'May 30', bookedOn: 'Apr 30', formType: 'New patient', sentVia: 'email', sentOn: 'May 23', status: 'Completed' },
  { patient: 'Steven Allen',        appointmentDate: 'May 30', bookedOn: 'May 02', formType: 'Follow-up',   sentVia: 'sms',   sentOn: 'May 23', status: 'Completed' },
  { patient: 'Sandra Young',        appointmentDate: 'May 31', bookedOn: 'May 04', formType: 'Referral',    sentVia: 'email', sentOn: 'May 24', status: 'Completed' },
  { patient: 'Joseph Hernandez',    appointmentDate: 'May 31', bookedOn: 'May 06', formType: 'New patient', sentVia: 'sms',   sentOn: 'May 24', status: 'Completed' },
]

interface ColumnDef extends Column<IntakePatient> {
  locked?: boolean
}

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'patient',         label: 'Patient',           width: 220, sortable: true,  locked: true },
  { key: 'appointmentDate', label: 'Appointment date',  width: 180, sortable: true  },
  { key: 'formType',        label: 'Form type',         width: 180, sortable: true  },
  {
    key: 'sentVia',
    label: 'Sent via',
    width: 120,
    sortable: false,
    render: (val) => (
      <img
        src={val === 'sms' ? iconInbox : iconMail}
        alt={val === 'sms' ? 'SMS' : 'Email'}
        className="size-5"
      />
    ),
  },
  { key: 'sentOn', label: 'Sent on', width: 160, sortable: true },
]

const STATUS_CHIP_VARIANT: Record<string, ChipProps['variant']> = {
  'Completed':   'success',
  'In progress': 'warning',
  'Not started': 'neutral',
}

const STATUS_COLUMN: ColumnDef = {
  key: 'status',
  label: 'Status',
  width: 160,
  sortable: true,
  render: (val) => (
    <Chip label={val as string} variant={STATUS_CHIP_VARIANT[val as string] ?? 'neutral'} />
  ),
}

const DEFAULT_ORDER   = COLUMN_DEFS.map((c) => String(c.key))
const DEFAULT_VISIBLE = ['patient', 'appointmentDate', 'formType', 'sentVia', 'sentOn']
const DEF_BY_KEY      = new Map(COLUMN_DEFS.map((c) => [String(c.key), c]))

const opts = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }))

const FILTER_FIELDS: FilterField[] = [
  { id: 'form-type', label: 'Form type', options: opts('New patient', 'Follow-up', 'Referral', 'Text/Number'), multi: true },
  { id: 'status',    label: 'Status',    options: opts('Not started', 'In progress', 'Completed'),             multi: true },
  { id: 'sent-via',  label: 'Sent via',  options: opts('SMS', 'Email') },
  { id: 'provider',  label: 'Provider',  options: opts('Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Garcia'), multi: true },
]

// Keyed by patient name — merged with row data when Quick view is opened
const PATIENT_DETAILS: Partial<Record<string, Omit<PatientDetail, 'patient' | 'status'>>> = {
  'John Smith': {
    phone: '+1 (555) 123-4567', email: 'john.smith@gmail.com', dateOfBirth: 'Mar 15, 1998',
    insuranceProvider: 'Aetna', insuranceName: 'Aetna PPO Gold',
    appointmentType: 'New consult', appointmentTime: '10:30 AM', location: 'Atlanta, GA',
    questionText: 'I have been experiencing headaches for the past week',
  },
  'Betty Hall': {
    age: '45 years', gender: 'Female', phone: '+1 (555) 234-5678', email: 'betty.hall@gmail.com',
    dateOfBirth: 'Jun 12, 1981', insuranceName: 'Aetna PPO Gold',
    appointmentType: 'Follow-up', appointmentTime: '02:00 PM', location: 'Dallas, TX',
    questionText: 'Follow-up for blood pressure management',
    emergencyContact: 'Tom Hall', emergencyRelationship: 'Husband', emergencyPhone: '+1 (555) 234-5679', emergencyEmail: 'tom.hall@gmail.com',
    insuranceProvider: 'Aetna', memberId: 'AET-9823714', groupNumber: 'GRP-00147',
    consentTreatment: 'Accepted', consentHipaa: 'Accepted', consentFinancial: 'Accepted',
    medications: [{ name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily' }, { name: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily at night' }],
    drugAllergies: [{ medicine: 'Penicillin', reaction: 'Hives' }],
    nonDrugAllergies: [{ allergen: 'Pollen', reaction: 'Sneezing, itchy eyes' }],
    preferredPharmacy: 'CVS Pharmacy – Main St',
    medicalConditions: ['Hypertension', 'High cholesterol'],
    surgicalHistory: [{ procedure: 'Appendectomy', year: '2010' }],
    familyHistory: [{ condition: 'Heart disease', relation: 'Father' }, { condition: 'Type 2 Diabetes', relation: 'Mother' }],
    hospitalizations: [{ condition: 'Pneumonia', year: '2018' }],
    tobacco: 'No', alcohol: 'Occasionally · 1–2 drinks/week', drugUsage: 'No', exercise: '3–4 times/week',
    aiSummary: ['Intake form completed on May 23, 2026.', 'All sections filled in: basic details, insurance, consent, medical history, and social history.'],
  },
  'Emily White': {
    age: '28 years', gender: 'Female', phone: '+1 (555) 876-5432', email: 'emily.white@gmail.com',
    dateOfBirth: 'Sep 22, 1997', insuranceName: 'UnitedHealth Choice Plus',
    appointmentType: 'Annual physical', appointmentTime: '09:00 AM', location: 'Chicago, IL',
    questionText: 'Annual checkup and flu shot',
    emergencyContact: 'Jake White', emergencyRelationship: 'Brother', emergencyPhone: '+1 (555) 876-5433', emergencyEmail: 'jake.white@gmail.com',
    consentTreatment: 'Accepted', consentHipaa: 'Accepted', consentFinancial: 'Accepted',
    tobacco: 'No', alcohol: 'No', drugUsage: 'No', exercise: 'Daily',
    aiSummary: ['Patient is in progress. Basic details, consent, and social history are complete.', 'Insurance and medical history sections are pending.'],
  },
  'James Harris': {
    age: '52 years', gender: 'Male', phone: '+1 (555) 345-6789', email: 'james.harris@gmail.com',
    dateOfBirth: 'Jan 08, 1974', insuranceName: 'BCBS Preferred',
    appointmentType: 'Procedure', appointmentTime: '11:00 AM', location: 'Miami, FL',
    questionText: 'Knee replacement consultation',
    insuranceProvider: 'Blue Cross Blue Shield', memberId: 'BCBS-4412839', groupNumber: 'GRP-00482',
    aiSummary: ['Patient has started the form. Insurance section is complete.', 'Basic details, consent, medical history, and social history are pending.'],
  },
}

export function IntakeScreen() {
  const [activeTab, setActiveTab] = useState('overdue')
  const [order, setOrder]         = useState<string[]>(DEFAULT_ORDER)
  const [visible, setVisible]     = useState<string[]>(DEFAULT_VISIBLE)
  const [customizeOpen, setCustomizeOpen]         = useState(false)
  const [filterOpen, setFilterOpen]               = useState(false)
  const [quickViewPatient, setQuickViewPatient]   = useState<PatientDetail | null>(null)
  const [activityPatient, setActivityPatient]     = useState<string | null>(null)

  const columns = useMemo<Column<IntakePatient>[]>(() => {
    const base = order
      .filter((k) => visible.includes(k))
      .map((k) => DEF_BY_KEY.get(k))
      .filter((c): c is ColumnDef => Boolean(c))

    if (activeTab === 'all') {
      const idx = base.findIndex((c) => c.key === 'formType')
      const insert = idx !== -1 ? idx + 1 : base.length
      return [...base.slice(0, insert), STATUS_COLUMN, ...base.slice(insert)]
    }
    return base
  }, [order, visible, activeTab])

  const columnOptions = useMemo<ColumnOption[]>(
    () => order.map((k) => ({ key: k, label: DEF_BY_KEY.get(k)!.label, locked: DEF_BY_KEY.get(k)!.locked })),
    [order],
  )

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return PATIENTS
    if (activeTab === 'overdue') return PATIENTS.filter((r) => r.appointmentDate === TODAY_DATE)
    return PATIENTS.filter((r) => r.status === TAB_STATUS_MAP[activeTab])
  }, [activeTab])

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex items-center justify-between bg-surface px-2xl py-xl">
            <div className="flex items-center gap-sm">
              <h1 className="text-lg text-text-primary">Manage intake</h1>
              <Icon name="info" size={18} className="text-text-icon" />
            </div>
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
                aria-label="Customize columns"
                onClick={() => setCustomizeOpen(true)}
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="view_column" size={20} />
              </button>
              <button
                type="button"
                aria-label="More options"
                className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
              >
                <Icon name="more_vert" size={20} />
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
                icon: 'chat',
                label: 'Message',
                onClick: () => {},
              }}
              rowMenuItems={[
                {
                  label: 'Quick view',
                  onClick: (row) => {
                    const detail = PATIENT_DETAILS[row.patient] ?? {}
                    setQuickViewPatient({ patient: row.patient, status: activeTab === 'overdue' ? 'Overdue' : row.status, appointmentDate: row.appointmentDate, bookedOn: row.bookedOn, sentOn: row.sentOn, ...detail })
                  },
                },
                { label: 'View activity',  onClick: (row) => setActivityPatient(row.patient) },
                { label: 'View form',      onClick: () => {} },
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

      <QuickViewDrawer
        open={!!quickViewPatient}
        patient={quickViewPatient}
        onClose={() => setQuickViewPatient(null)}
      />

      <ViewActivityDrawer
        open={!!activityPatient}
        patient={activityPatient ?? ''}
        onClose={() => setActivityPatient(null)}
      />
    </div>
  )
}
