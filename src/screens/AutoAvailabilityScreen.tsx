import { useEffect, useRef, useState } from 'react'
import { Icon, SelectMenu, Toast, TopNav } from '../components'
import type { SelectOption } from '../components'

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-primary' : 'bg-surface-selected'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface TimeWindow {
  id: string
  startTime: string
  endTime: string
  serviceType: string
  bay: string
  note: string
}

interface DaySchedule {
  enabled: boolean
  windows: TimeWindow[]
}

interface TimeOffEntry {
  id: string
  date: string
  label: string
  allAdvisors?: boolean
  allLocations?: boolean
}

type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

const DAY_LABELS: { key: DayKey; label: string }[] = [
  { key: 'sun', label: 'Sun' },
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
]

// ── Dropdown data ──────────────────────────────────────────────────────────────
const DEPARTMENT_OPTIONS: SelectOption[] = [
  { value: 'service',  label: 'Service'   },
  { value: 'sales',    label: 'Sales'     },
  { value: 'parts',    label: 'Parts'     },
  { value: 'bodyshop', label: 'Body shop' },
]

const SERVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'oil',          label: 'Oil change' },
  { value: 'tire',         label: 'Tire rotation' },
  { value: 'brake',        label: 'Brake inspection' },
  { value: 'diagnostic',   label: 'Engine diagnostic' },
  { value: 'transmission', label: 'Transmission service' },
  { value: 'inspection',   label: 'Multi-point inspection' },
]

const BAY_OPTIONS: SelectOption[] = [
  { value: 'bay1', label: 'Bay 1' },
  { value: 'bay2', label: 'Bay 2' },
  { value: 'bay3', label: 'Bay 3' },
  { value: 'bay4', label: 'Bay 4' },
  { value: 'bay5', label: 'Bay 5' },
]

const TIME_OPTIONS: SelectOption[] = [
  '07:00 AM','07:30 AM','08:00 AM','08:30 AM','09:00 AM','09:30 AM',
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM',
  '01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM',
].map(t => ({ value: t, label: t }))

const INITIAL_SCHEDULE: Record<DayKey, DaySchedule> = {
  sun: { enabled: false, windows: [] },
  mon: { enabled: false, windows: [] },
  tue: {
    enabled: true,
    windows: [
      { id: 'w1', startTime: '08:00 AM', endTime: '12:00 PM', serviceType: 'Oil change',    bay: 'Bay 1', note: '' },
      { id: 'w2', startTime: '01:00 PM', endTime: '05:00 PM', serviceType: 'Brake inspection', bay: 'Bay 2', note: '' },
    ],
  },
  wed: {
    enabled: true,
    windows: [
      { id: 'w3', startTime: '08:00 AM', endTime: '12:00 PM', serviceType: 'Oil change',    bay: 'Bay 1', note: '' },
      { id: 'w4', startTime: '01:00 PM', endTime: '05:00 PM', serviceType: 'Engine diagnostic', bay: 'Bay 3', note: '' },
    ],
  },
  thu: {
    enabled: true,
    windows: [
      { id: 'w5', startTime: '08:00 AM', endTime: '12:00 PM', serviceType: 'Tire rotation', bay: 'Bay 2', note: '' },
      { id: 'w6', startTime: '01:00 PM', endTime: '05:00 PM', serviceType: 'Oil change',    bay: 'Bay 1', note: '' },
    ],
  },
  fri: {
    enabled: true,
    windows: [
      { id: 'w7', startTime: '08:00 AM', endTime: '12:00 PM', serviceType: 'Multi-point inspection', bay: 'Bay 1', note: '' },
      { id: 'w8', startTime: '01:00 PM', endTime: '04:00 PM', serviceType: 'Engine diagnostic',      bay: 'Bay 3', note: '' },
    ],
  },
  sat: {
    enabled: true,
    windows: [
      { id: 'w9', startTime: '08:00 AM', endTime: '12:00 PM', serviceType: 'Oil change', bay: 'Bay 1', note: 'Morning drop-offs only' },
    ],
  },
}

const INITIAL_TIME_OFFS: TimeOffEntry[] = [
  { id: 't1', date: 'Jun 10, 2026',                  label: 'Mike Johnson — training day' },
  { id: 't2', date: 'Jun 20, 2026 – Jun 22, 2026',  label: 'Mike Johnson — vacation' },
  { id: 't3', date: 'Jul 4, 2026',                   label: 'Independence Day — dealership closed', allAdvisors: true, allLocations: true },
]

// ── DropdownField ─────────────────────────────────────────────────────────────
interface DropdownFieldProps {
  label: string
  required?: boolean
  options: SelectOption[]
  value: string[]
  multi?: boolean
  searchable?: boolean
  placeholder?: string
  onChange: (v: string[]) => void
}
function DropdownField({ label, required, options, value, multi, searchable, placeholder, onChange }: DropdownFieldProps) {
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

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label ?? v)
  const triggerLabel = value.length === 0
    ? (placeholder ?? 'Select')
    : value.length > 1
    ? `${selectedLabels[0]}, +${value.length - 1} more`
    : selectedLabels[0]

  return (
    <div className="relative flex flex-col gap-sm" ref={ref}>
      {label && (
        <label className="text-small text-text-secondary">
          {label}{required && <span className="ml-xs text-danger">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex h-9 w-full items-center justify-between rounded-sm border border-border bg-surface pl-md pr-sm text-body text-text-primary hover:bg-surface-hover focus:outline-none"
      >
        <span className={value.length === 0 ? 'text-text-tertiary' : ''}>{triggerLabel}</span>
        <Icon name="expand_more" size={18} className="shrink-0 text-text-icon" />
      </button>
      {open && (
        <div className="absolute top-full z-[60] mt-xs w-full">
          <SelectMenu
            options={options}
            value={value}
            multi={multi}
            searchable={searchable}
            onChange={v => { onChange(v); if (!multi) setOpen(false) }}
            onApply={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Availability source dropdown ──────────────────────────────────────────────
const SOURCE_OPTIONS = [
  {
    id: 'birdeye' as const,
    title: 'Manage in Birdeye',
    description: 'Define department booking windows here. Best for CDK Drive, Reynolds & Reynolds, and DealerTrack',
  },
  {
    id: 'dms' as const,
    title: 'Sync from DMS',
    description: 'Read availability directly from your DMS in real time. Best for Tekion (cloud DMS with real-time API)',
  },
]

function SourceDropdown({ value, onChange }: { value: 'birdeye' | 'dms'; onChange: (v: 'birdeye' | 'dms') => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = SOURCE_OPTIONS.find(o => o.id === value)!

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
      <button type="button" onClick={() => setOpen(v => !v)} className="flex h-9 w-full items-center justify-between rounded-sm border border-border bg-surface pl-md pr-sm text-body text-text-primary hover:bg-surface-hover focus:outline-none">
        <span>{selected.title}</span>
        <Icon name="expand_more" size={18} className="shrink-0 text-text-icon" />
      </button>
      {open && (
        <div className="absolute top-full z-[60] mt-xs w-full min-w-[400px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
          {SOURCE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className={`flex w-full items-start justify-between px-md py-sm text-left hover:bg-surface-hover ${opt.id === value ? 'bg-surface-hover' : ''}`}
            >
              <div className="flex flex-col gap-xs">
                <span className="text-body text-text-primary">{opt.title}</span>
                <span className="text-small text-text-secondary">{opt.description}</span>
              </div>
              {opt.id === value && <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/20" onClick={onCancel} />
      <div className="fixed left-1/2 top-[72px] z-[201] w-[520px] -translate-x-1/2 rounded-sm border border-border bg-surface shadow-modal">
        <div className="flex items-center justify-between px-2xl pt-xl pb-md">
          <span className="text-body text-text-primary">{title}</span>
          <button type="button" onClick={onCancel} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
            <Icon name="close" size={18} />
          </button>
        </div>
        <p className="px-2xl pb-xl text-body text-text-secondary">{message}</p>
        <div className="flex justify-end gap-sm px-2xl pb-xl">
          <button type="button" onClick={onCancel} className="rounded-sm px-md py-xs text-body text-text-action hover:bg-surface-hover">No, keep it</button>
          <button type="button" onClick={onConfirm} className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">Yes, delete</button>
        </div>
      </div>
    </>
  )
}

// ── Add Window Drawer ─────────────────────────────────────────────────────────
function AddWindowDrawer({ open, dayLabel, onClose, onSave }: { open: boolean; dayLabel: string; onClose: () => void; onSave: (win: Omit<TimeWindow, 'id'>) => void }) {
  const [recurrence,   setRecurrence]   = useState<'weekly' | 'specific'>('weekly')
  const [startTime,    setStartTime]    = useState(['08:00 AM'])
  const [endTime,      setEndTime]      = useState(['12:00 PM'])
  const [serviceType,  setServiceType]  = useState<string[]>([])
  const [bay,          setBay]          = useState<string[]>([])
  const [note,         setNote]         = useState('')

  if (!open) return null

  function handleSave() {
    const svcLabel = SERVICE_TYPE_OPTIONS.find(o => o.value === serviceType[0])?.label ?? serviceType[0] ?? ''
    const bayLabel = BAY_OPTIONS.find(o => o.value === bay[0])?.label ?? bay[0] ?? ''
    onSave({ startTime: startTime[0], endTime: endTime[0], serviceType: svcLabel, bay: bayLabel, note })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="flex w-[600px] flex-col overflow-y-auto bg-surface shadow-modal">
        <div className="flex items-center justify-between px-2xl py-xl">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="arrow_back" size={20} />
            </button>
            <h2 className="text-[16px] text-text-primary">Add window</h2>
          </div>
          <button type="button" onClick={handleSave} className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>

        <div className="flex flex-col gap-2xl p-2xl">
          <div>
            <p className="mb-md text-body text-text-secondary">When does this apply?</p>
            <div className="grid grid-cols-2 gap-md">
              {([
                { id: 'weekly' as const,   title: 'Every week',      sub: `Repeats every ${dayLabel}` },
                { id: 'specific' as const, title: 'A specific date', sub: 'One-off availability' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRecurrence(opt.id)}
                  className={`flex items-start gap-sm rounded-sm border p-md text-left transition-colors ${recurrence === opt.id ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-hover'}`}
                >
                  <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${recurrence === opt.id ? 'border-primary' : 'border-border-selected'}`}>
                    {recurrence === opt.id && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-body text-text-primary">{opt.title}</p>
                    <p className="text-small text-text-secondary">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-lg">
            <DropdownField label="Start time" required options={TIME_OPTIONS} value={startTime} onChange={setStartTime} />
            <DropdownField label="End time"   required options={TIME_OPTIONS} value={endTime}   onChange={setEndTime}   />
          </div>

          <DropdownField label="Service type" required options={SERVICE_TYPE_OPTIONS} value={serviceType} multi searchable placeholder="Select service types" onChange={setServiceType} />
          <DropdownField label="Service bay"  options={BAY_OPTIONS} value={bay} placeholder="Select bay" onChange={setBay} />

          <div className="flex flex-col gap-sm">
            <label className="text-body text-text-primary">Note</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="eg. Express lane only" className="h-9 rounded-sm border border-border bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add Time Off Drawer ───────────────────────────────────────────────────────
function AddTimeOffDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (entry: Omit<TimeOffEntry, 'id'>) => void }) {
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [label,        setLabel]        = useState('')
  const [staffDept,    setStaffDept]    = useState<string[]>([])
  const [allAdvisors,  setAllAdvisors]  = useState(false)
  const [allLocations, setAllLocations] = useState(false)

  if (!open) return null

  function handleSave() {
    const date = dateTo ? `${dateFrom} – ${dateTo}` : dateFrom
    onSave({ date, label, allAdvisors: allAdvisors || undefined, allLocations: allLocations || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="flex w-[600px] flex-col overflow-y-auto bg-surface shadow-modal">
        <div className="flex items-center justify-between px-2xl py-xl">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="arrow_back" size={20} />
            </button>
            <h2 className="text-[16px] text-text-primary">Add time off</h2>
          </div>
          <button type="button" onClick={handleSave} className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>

        <div className="flex flex-col gap-2xl p-2xl">
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="text-body text-text-primary">From <span className="text-danger">*</span></label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="flex flex-col gap-sm">
              <label className="text-body text-text-primary">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>

          <DropdownField label="Department" options={DEPARTMENT_OPTIONS} value={staffDept} multi placeholder="All departments" onChange={setStaffDept} />

          <div className="flex flex-col gap-sm">
            <label className="text-body text-text-primary">Label <span className="text-danger">*</span></label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="eg. Independence Day — dealership closed" className="h-9 rounded-sm border border-border bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
          </div>

          <div className="flex flex-col gap-md">
            <label className="flex cursor-pointer items-center gap-sm">
              <input type="checkbox" checked={allAdvisors} onChange={e => setAllAdvisors(e.target.checked)} className="rounded border-border" />
              <span className="text-body text-text-primary">Apply to all advisors</span>
            </label>
            <label className="flex cursor-pointer items-center gap-sm">
              <input type="checkbox" checked={allLocations} onChange={e => setAllLocations(e.target.checked)} className="rounded border-border" />
              <span className="text-body text-text-primary">Apply to all locations</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Booking constraints ───────────────────────────────────────────────────────
const BOOKING_DEFAULTS: Record<string, { leadTime: string; horizon: string; bufferBefore: string; bufferAfter: string; slotHold: string; walkInReserve: string }> = {
  service:  { leadTime: '2',  horizon: '90', bufferBefore: '0', bufferAfter: '15', slotHold: '10', walkInReserve: '20' },
  sales:    { leadTime: '0',  horizon: '30', bufferBefore: '0', bufferAfter: '0',  slotHold: '10', walkInReserve: '0'  },
  parts:    { leadTime: '0',  horizon: '14', bufferBefore: '0', bufferAfter: '0',  slotHold: '5',  walkInReserve: '30' },
  bodyshop: { leadTime: '24', horizon: '60', bufferBefore: '0', bufferAfter: '30', slotHold: '15', walkInReserve: '0'  },
}

function BookingConstraints({ department }: { department: string }) {
  const defaults = BOOKING_DEFAULTS[department] ?? BOOKING_DEFAULTS.service
  const [leadTime,      setLeadTime]      = useState(defaults.leadTime)
  const [horizon,       setHorizon]       = useState(defaults.horizon)
  const [bufferBefore,  setBufferBefore]  = useState(defaults.bufferBefore)
  const [bufferAfter,   setBufferAfter]   = useState(defaults.bufferAfter)
  const [slotHold,      setSlotHold]      = useState(defaults.slotHold)
  const [walkInReserve, setWalkInReserve] = useState(defaults.walkInReserve)

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h2 className="text-[16px] text-text-primary">Booking constraints</h2>
        <p className="mt-xs text-small text-text-secondary">
          Rules that govern when and how far in advance customers can book. Applied per department.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-lg rounded-sm border border-border p-lg">
        {[
          { label: 'Min lead time',    unit: 'hours', value: leadTime,      setValue: setLeadTime,      info: 'How far ahead a booking must be made' },
          { label: 'Booking horizon',  unit: 'days',  value: horizon,       setValue: setHorizon,       info: 'How far in advance customers can book' },
          { label: 'Buffer before',    unit: 'min',   value: bufferBefore,  setValue: setBufferBefore,  info: 'Prep time blocked before each appointment' },
          { label: 'Buffer after',     unit: 'min',   value: bufferAfter,   setValue: setBufferAfter,   info: 'Clean-up time blocked after each appointment' },
          { label: 'Slot hold',        unit: 'min',   value: slotHold,      setValue: setSlotHold,      info: 'How long an unconfirmed booking holds a slot' },
          { label: 'Walk-in reserve',  unit: '%',     value: walkInReserve, setValue: setWalkInReserve, info: 'Capacity held open for walk-in customers' },
        ].map(({ label, unit, value, setValue, info }) => (
          <div key={label} className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <label className="text-small text-text-secondary">{label}</label>
              <span title={info}><Icon name="info" size={13} className="cursor-help text-text-tertiary" /></span>
            </div>
            <div className="flex h-9 items-center overflow-hidden rounded-sm border border-border focus-within:border-primary">
              <input
                type="number"
                min="0"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="h-full flex-1 px-md text-body text-text-primary outline-none"
              />
              <span className="flex h-full items-center border-l border-border bg-surface-subtle px-sm text-small text-text-secondary">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AutoAvailabilityScreen ────────────────────────────────────────────────────
export function AutoAvailabilityScreen() {
  const [department,          setDepartment]          = useState(['service'])
  const [schedule,            setSchedule]            = useState<Record<DayKey, DaySchedule>>(INITIAL_SCHEDULE)
  const [timeOffs,            setTimeOffs]            = useState<TimeOffEntry[]>(INITIAL_TIME_OFFS)
  const [addWindowDay,        setAddWindowDay]        = useState<DayKey | null>(null)
  const [showTimeOffDrawer,   setShowTimeOffDrawer]   = useState(false)
  const [availabilitySource,  setAvailabilitySource]  = useState<'birdeye' | 'dms'>('birdeye')
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'window'; day: DayKey; winId: string } | { type: 'timeoff'; id: string } | null>(null)
  const [toastMessage,  setToastMessage]  = useState('')
  const [toastVisible,  setToastVisible]  = useState(false)

  function showToast(msg: string) { setToastMessage(msg); setToastVisible(true) }

  function handleSourceChange(val: 'birdeye' | 'dms') {
    setAvailabilitySource(val)
    if (val === 'dms') showToast('Fetching data from the DMS. This may take some time.')
  }

  function handleAddWindow(win: Omit<TimeWindow, 'id'>) {
    if (!addWindowDay) return
    const id = `w-${Date.now()}`
    setSchedule(prev => ({ ...prev, [addWindowDay]: { ...prev[addWindowDay], windows: [...prev[addWindowDay].windows, { ...win, id }] } }))
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return
    if (confirmDelete.type === 'window') {
      const { day, winId } = confirmDelete
      setSchedule(prev => ({ ...prev, [day]: { ...prev[day], windows: prev[day].windows.filter(w => w.id !== winId) } }))
      showToast('Your window has been deleted.')
    } else {
      setTimeOffs(prev => prev.filter(t => t.id !== confirmDelete.id))
      showToast('Your time off entry has been deleted.')
    }
    setConfirmDelete(null)
  }

  const activeDayLabel = addWindowDay ? DAY_LABELS.find(d => d.key === addWindowDay)?.label ?? '' : ''

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />
      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface px-2xl py-lg">
          <span className="text-h3 text-text-primary">Availability</span>
          <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>

        <div className="flex flex-col gap-lg p-2xl">
          {/* Availability source */}
          <div className="grid grid-cols-2 gap-lg rounded-sm border border-border p-lg">
            <div className="flex flex-col gap-xs">
              <label className="text-small text-text-secondary">Availability source <span className="text-danger">*</span></label>
              <SourceDropdown value={availabilitySource} onChange={handleSourceChange} />
            </div>
            {availabilitySource === 'birdeye' && (
              <div className="flex flex-col gap-xs">
                <label className="text-small text-text-secondary">Select department <span className="text-danger">*</span></label>
                <DropdownField label="" options={DEPARTMENT_OPTIONS} value={department} onChange={setDepartment} />
              </div>
            )}
          </div>

          {availabilitySource === 'dms' ? (
            <div className="flex items-center gap-sm rounded-sm border border-blue-200 bg-blue-50 px-lg py-md">
              <Icon name="info" size={18} className="shrink-0 text-blue-500" />
              <p className="text-body text-blue-700">Fetching data from the DMS. This may take some time.</p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-[16px] text-text-primary">Manage availability</h2>
                <p className="mt-xs text-small text-text-secondary">
                  Define department-level booking windows and service types. These are not actual appointments — they are the rules the booking agent uses to find and offer open slots.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-border rounded-sm border border-border">
                {DAY_LABELS.map(({ key, label }) => {
                  const day = schedule[key]
                  return (
                    <div key={key} className="flex items-center gap-lg px-lg py-md">
                      <span className="w-8 shrink-0 text-body text-text-primary">{label}</span>
                      {!day.enabled && <span className="w-14 shrink-0 text-body text-text-tertiary">Day off</span>}
                      {day.enabled  && <span className="w-14 shrink-0" />}

                      <div className="flex flex-1 flex-wrap items-start gap-sm">
                        {day.windows.map(win => (
                          <div key={win.id} className="group relative flex min-w-[160px] flex-col gap-xs rounded-sm border-l-[3px] border-primary bg-primary/5 px-sm py-xs">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete({ type: 'window', day: key, winId: win.id })}
                              className="absolute right-1 top-1 hidden size-5 items-center justify-center rounded text-text-tertiary hover:text-danger group-hover:flex"
                            >
                              <Icon name="close" size={14} />
                            </button>
                            <span className="text-small text-primary">{win.startTime} - {win.endTime}</span>
                            <span className="text-xs text-text-secondary">{win.bay}</span>
                            <span className="inline-flex w-fit items-center rounded-sm border border-border bg-surface px-sm py-0.5 text-xs text-text-secondary">
                              {win.serviceType}
                            </span>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAddWindowDay(key)}
                          className="flex h-8 items-center gap-xs rounded-sm border border-dashed border-border px-sm text-body text-text-secondary hover:border-primary hover:text-primary"
                        >
                          <Icon name="add" size={16} />
                          Add window
                        </button>
                      </div>

                      <div className="shrink-0">
                        <Toggle value={day.enabled} onChange={val => setSchedule(prev => ({ ...prev, [key]: { ...prev[key], enabled: val } }))} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Booking constraints */}
              <BookingConstraints department={department[0] ?? 'service'} />

              {/* Time off & closures */}
              <div className="flex flex-col gap-lg">
                <div className="flex items-start justify-between gap-lg">
                  <div>
                    <h2 className="text-[16px] text-text-primary">Time off & closures</h2>
                    <p className="mt-xs text-small text-text-secondary">
                      Block full days when the dealership is closed or an advisor is unavailable. The agent won't offer slots on these dates, overriding the weekly booking windows.
                    </p>
                  </div>
                  <button type="button" onClick={() => setShowTimeOffDrawer(true)} className="flex h-9 shrink-0 items-center gap-xs rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2">
                    <Icon name="add" size={16} />
                    Add time off
                  </button>
                </div>

                <div className="flex flex-col divide-y divide-border rounded-sm border border-border">
                  {timeOffs.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between px-lg py-md">
                      <div className="flex flex-col gap-xs">
                        <span className="text-body text-text-primary">{entry.date}</span>
                        <span className="text-small text-text-secondary">{entry.label}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        {entry.allAdvisors  && <span className="rounded-sm bg-chip-warning-bg px-sm py-0.5 text-xs text-chip-warning-text">All advisors</span>}
                        {entry.allLocations && <span className="rounded-sm bg-chip-warning-bg px-sm py-0.5 text-xs text-chip-warning-text">All locations</span>}
                        <button type="button" className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
                          <Icon name="edit" size={18} />
                        </button>
                        <button type="button" onClick={() => setConfirmDelete({ type: 'timeoff', id: entry.id })} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover hover:text-danger">
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AddWindowDrawer open={addWindowDay !== null} dayLabel={activeDayLabel} onClose={() => setAddWindowDay(null)} onSave={handleAddWindow} />
      <AddTimeOffDrawer open={showTimeOffDrawer} onClose={() => setShowTimeOffDrawer(false)} onSave={entry => setTimeOffs(prev => [...prev, { ...entry, id: `t-${Date.now()}` }])} />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete this item?"
        message="This action cannot be undone. The window or time-off entry will be permanently removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
