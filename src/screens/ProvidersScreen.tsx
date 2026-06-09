import { useState } from 'react'
import { DataTable, Icon, TopNav, type Column } from '../components'

// ── Toggle ───────────────────────────────────────────────────────────────────
interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
}
function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-primary' : 'bg-surface-selected'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-1'}`}
      />
    </button>
  )
}

// ── Provider data ─────────────────────────────────────────────────────────────
interface ProviderRow {
  initials: string
  name: string
  role: string
  operatory: string
  appointmentType: string
  location: string
  available: boolean
  dimmed?: boolean
  [key: string]: string | boolean | undefined
}

const PROVIDERS: ProviderRow[] = [
  { initials: 'SC', name: 'Dr. Sarah Chen',    role: 'General Dentist',   operatory: 'Operatory 1, +1 more', appointmentType: 'New patient exam, +2 more',       location: 'San Francisco, CA', available: true  },
  { initials: 'MR', name: 'Dr. Marcus Rivera', role: 'Orthodontist',       operatory: 'Operatory 3',          appointmentType: 'Invisalign Consultation',         location: 'San Fran...',       available: false },
  { initials: 'AT', name: 'Amy Torres',         role: 'Dental Hygienist',   operatory: 'Operatory 1, +2 more', appointmentType: 'Routine Cleaning',                location: 'San Fran...',       available: false },
  { initials: 'JK', name: 'Dr. James Kim',      role: 'Oral Surgeon',       operatory: 'Operatory 3',          appointmentType: 'New patient exam',                location: 'San Francisco, CA', available: true  },
  { initials: 'SC', name: 'Dr. Sarah Chen',    role: 'eclinicalworks.com', operatory: 'Operatory 3',          appointmentType: 'Invisalign Consultation',         location: 'San Francisco, CA', available: false },
  { initials: 'SC', name: 'Dr. Sarah Chen',    role: 'nextgen.com',        operatory: 'Operatory 3',          appointmentType: 'New patient exam, +2 more',       location: 'San Francisco, CA', available: true  },
  { initials: 'SC', name: 'Dr. Sarah Chen',    role: 'cerner.com',         operatory: 'Operatory 3',          appointmentType: 'Routine Cleaning',                location: 'San Francisco, CA', available: true  },
  { initials: 'SC', name: 'Dr. Sarah Chen',    role: 'allscripts.com',     operatory: 'Operatory 3',          appointmentType: 'New patient exam',                location: 'San Francisco, CA', available: false },
  { initials: 'SC', name: 'Dr. Sarah Chen',    role: 'meditech.com',       operatory: 'Operatory 3',          appointmentType: 'Invisalign Consultation',         location: 'San Francisco, CA', available: true  },
]

// ── Edit Drawer ───────────────────────────────────────────────────────────────
interface EditDrawerProps {
  open: boolean
  onClose: () => void
}
function EditDrawer({ open, onClose }: EditDrawerProps) {
  const [firstName, setFirstName] = useState('Sarah')
  const [secondName, setSecondName] = useState('Sarah')
  const [bookable, setBookable] = useState(true)
  const [pmsExpanded, setPmsExpanded] = useState(true)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[650px] flex-col bg-surface shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-2xl py-lg">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="arrow_back" size={18} />
            </button>
            <span className="text-h3 text-text-primary">Edit</span>
          </div>
          <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-lg overflow-auto p-2xl">
          {/* First + Second name row */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-small text-text-secondary">First name <span className="text-danger">*</span></label>
              <input
                className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-small text-text-secondary">Second name <span className="text-danger">*</span></label>
              <input
                className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none"
                value={secondName}
                onChange={e => setSecondName(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Location <span className="text-danger">*</span></label>
            <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
              <option>San Francisco, CA</option>
            </select>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Role</label>
            <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
              <option>General dentist</option>
              <option>Orthodontist</option>
              <option>Dental Hygienist</option>
              <option>Oral Surgeon</option>
            </select>
          </div>

          {/* Operatory */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Operatory</label>
            <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
              <option>2 selected</option>
            </select>
          </div>

          {/* Appointment type */}
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <label className="text-small text-text-secondary">Appointment type</label>
              <Icon name="info" size={14} className="text-text-tertiary" />
            </div>
            <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
              <option>3 selected</option>
            </select>
          </div>

          {/* Bookable */}
          <div className="flex items-center justify-between gap-md">
            <div className="flex flex-col gap-xs">
              <span className="text-body text-text-primary">Bookable by patients</span>
              <span className="text-small text-text-secondary">This provider will be visible to the booking agent and patients</span>
            </div>
            <Toggle value={bookable} onChange={setBookable} />
          </div>

          {/* PMS Mapping accordion */}
          <div className="rounded-sm border border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between px-md py-sm"
              onClick={() => setPmsExpanded(v => !v)}
            >
              <span className="text-body text-text-primary">PMS mapping</span>
              <Icon name={pmsExpanded ? 'expand_less' : 'expand_more'} size={18} className="text-text-icon" />
            </button>
            {pmsExpanded && (
              <div className="flex flex-col gap-md border-t border-border p-md">
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-small text-text-secondary">PMS system</label>
                    <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
                      <option>Dentrix</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-small text-text-secondary">Provider in Dentrix</label>
                    <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
                      <option>Dentrix</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-sm rounded-sm border border-blue-200 bg-blue-50 px-md py-sm">
                  <Icon name="info" size={16} className="text-blue-500" />
                  <span className="text-small text-blue-700">Mapped to DTX-001 – Dr. Sarah Chen (General)</span>
                </div>
                <p className="text-small text-text-secondary">Maps this provider to their record in your practice management software.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── ProvidersScreen ───────────────────────────────────────────────────────────
export function ProvidersScreen() {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [availableMap, setAvailableMap] = useState<Record<number, boolean>>(
    Object.fromEntries(PROVIDERS.map((p, i) => [i, p.available]))
  )
  const [_location] = useState('San Francisco, CA')

  const COLUMNS: Column<ProviderRow>[] = [
    {
      key: 'name', label: 'Provider', width: 220,
      render: (_v, row) => (
        <div className={`flex items-center gap-sm ${row.dimmed ? 'opacity-40' : ''}`}>
          <div className="flex size-8 items-center justify-center rounded-full bg-surface-selected text-small text-text-secondary">
            {row.initials as string}
          </div>
          <span className="text-body text-text-primary">{row.name as string}</span>
        </div>
      ),
    },
    { key: 'role', label: 'Role', width: 160 },
    {
      key: 'operatory', label: 'Operatory', width: 180,
      render: (_v, row) => {
        const parts = (row.operatory as string).split(', ')
        return (
          <span>
            {parts[0]}
            {parts[1] && <span className="text-text-tertiary">, {parts[1]}</span>}
          </span>
        )
      },
    },
    {
      key: 'appointmentType', label: 'Appointment type', width: 220,
      render: (_v, row) => {
        const parts = (row.appointmentType as string).split(', ')
        return (
          <span>
            {parts[0]}
            {parts[1] && <span className="text-text-tertiary">, {parts[1]}</span>}
          </span>
        )
      },
    },
    { key: 'location', label: 'Location', width: 180 },
    {
      key: 'available', label: 'Available', width: 100,
      render: (_v, row) => {
        const idx = PROVIDERS.indexOf(row as ProviderRow)
        return (
          <Toggle
            value={availableMap[idx] ?? false}
            onChange={v => setAvailableMap(m => ({ ...m, [idx]: v }))}
          />
        )
      },
    },
  ]

  const rowMenuItems = [
    { label: 'Edit',               onClick: () => setEditDrawerOpen(true) },
    { label: 'Setup availability', onClick: () => {}, icon: 'open_in_new' as const },
  ]

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        {/* Page header */}
        <div className="flex items-center justify-between bg-surface px-2xl py-xl">
          <div className="flex flex-col gap-xs">
            <span className="text-h2 text-text-primary">9 Providers</span>
            <span className="text-small text-text-secondary">Manage your business providers here</span>
          </div>
          <div className="flex items-center gap-sm">
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="search" size={20} />
            </button>
            <select className="h-9 rounded-sm border border-border-selected bg-surface pl-md pr-2xl text-body text-text-primary hover:bg-surface-l2 focus:outline-none">
              <option>{_location}</option>
            </select>
            <button type="button" className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2">
              <Icon name="refresh" size={18} />
              Sync from PMS
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-md px-2xl pb-2xl">
          {/* Banner */}
          {!bannerDismissed && (
            <div className="flex items-start gap-sm rounded-sm border border-primary/30 bg-primary/5 px-md py-sm">
              <Icon name="info" size={18} className="mt-0.5 shrink-0 text-primary" />
              <p className="flex-1 text-small text-text-primary">
                Update the display name, map operatories, set bookable status, and assign appointment types. To add or remove a provider, do it in your PMS and click Sync.
              </p>
              <button type="button" onClick={() => setBannerDismissed(true)} className="shrink-0 text-text-icon hover:text-text-primary">
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          <DataTable
            columns={COLUMNS}
            data={PROVIDERS}
            rowMenuItems={rowMenuItems}
            rowClassName={(_row, i) => (availableMap[i] === false ? 'opacity-40' : '')}
          />
        </div>
      </div>

      <EditDrawer open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)} />
    </div>
  )
}
