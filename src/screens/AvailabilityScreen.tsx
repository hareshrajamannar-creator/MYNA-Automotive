import { useState } from 'react'
import { Icon, TopNav } from '../components'

// ── Toggle ─────────────────────────────────────────────────────────────────────
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
  appointmentType: string
  operatory: string
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
  allProviders?: boolean
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

const APPOINTMENT_TYPES = ['New patient exam', 'Emergency visit', 'Routine cleaning', 'Invisalign consultation', 'Follow-up visit']
const OPERATORIES = ['Operatory 1', 'Operatory 2', 'Operatory 3', 'Operatory 4']
const TIME_OPTIONS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
]

const INITIAL_SCHEDULE: Record<DayKey, DaySchedule> = {
  sun: { enabled: false, windows: [] },
  mon: { enabled: false, windows: [] },
  tue: {
    enabled: true,
    windows: [
      { id: 'w1', startTime: '09:00 AM', endTime: '10:00 AM', appointmentType: 'Emergency visit', operatory: 'Operatory 1', note: '' },
      { id: 'w2', startTime: '02:00 PM', endTime: '05:00 PM', appointmentType: 'New Patient Exam', operatory: 'Operatory 2', note: '' },
    ],
  },
  wed: {
    enabled: true,
    windows: [
      { id: 'w3', startTime: '09:00 AM', endTime: '10:00 AM', appointmentType: 'Emergency visit', operatory: 'Operatory 1', note: '' },
      { id: 'w4', startTime: '02:00 PM', endTime: '05:00 PM', appointmentType: 'New Patient Exam', operatory: 'Operatory 2', note: '' },
    ],
  },
  thu: {
    enabled: true,
    windows: [
      { id: 'w5', startTime: '09:00 AM', endTime: '10:00 AM', appointmentType: 'Emergency visit', operatory: 'Operatory 1', note: '' },
      { id: 'w6', startTime: '02:00 PM', endTime: '05:00 PM', appointmentType: 'New Patient Exam', operatory: 'Operatory 2', note: '' },
    ],
  },
  fri: {
    enabled: true,
    windows: [
      { id: 'w7', startTime: '09:00 AM', endTime: '10:00 AM', appointmentType: 'Emergency visit', operatory: 'Operatory 1', note: '' },
      { id: 'w8', startTime: '02:00 PM', endTime: '05:00 PM', appointmentType: 'New Patient Exam', operatory: 'Operatory 2', note: '' },
    ],
  },
  sat: { enabled: false, windows: [] },
}

const INITIAL_TIME_OFFS: TimeOffEntry[] = [
  { id: 't1', date: 'Jun 10, 2026', label: 'Dr. Sarah Chen unavailable' },
  { id: 't2', date: 'Jun 15, 2026 – Jun 19, 2026', label: 'Dr. Sarah Chen — vacation' },
  { id: 't3', date: 'Jul 4, 2026', label: 'Independence Day — clinic closed', allProviders: true, allLocations: true },
]

// ── Add Window Drawer ──────────────────────────────────────────────────────────
interface AddWindowDrawerProps {
  open: boolean
  dayLabel: string
  onClose: () => void
  onSave: (win: Omit<TimeWindow, 'id'>) => void
}
function AddWindowDrawer({ open, dayLabel, onClose, onSave }: AddWindowDrawerProps) {
  const [recurrence, setRecurrence] = useState<'weekly' | 'specific'>('weekly')
  const [startTime, setStartTime] = useState('09:00 AM')
  const [endTime, setEndTime] = useState('10:00 AM')
  const [appointmentType, setAppointmentType] = useState('New patient exam')
  const [operatory, setOperatory] = useState('')
  const [note, setNote] = useState('')

  if (!open) return null

  function handleSave() {
    onSave({ startTime, endTime, appointmentType, operatory, note })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="flex w-[600px] flex-col bg-surface shadow-modal overflow-y-auto">
        {/* Header */}
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
          {/* When does this apply */}
          <div>
            <p className="mb-md text-body text-text-secondary">When does this apply?</p>
            <div className="grid grid-cols-2 gap-md">
              <button
                type="button"
                onClick={() => setRecurrence('weekly')}
                className={`flex items-start gap-sm rounded-sm border p-md text-left transition-colors ${recurrence === 'weekly' ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-hover'}`}
              >
                <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${recurrence === 'weekly' ? 'border-primary' : 'border-border-selected'}`}>
                  {recurrence === 'weekly' && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-body text-text-primary">Every week</p>
                  <p className="text-small text-text-secondary">Repeats every {dayLabel}</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRecurrence('specific')}
                className={`flex items-start gap-sm rounded-sm border p-md text-left transition-colors ${recurrence === 'specific' ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-hover'}`}
              >
                <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${recurrence === 'specific' ? 'border-primary' : 'border-border-selected'}`}>
                  {recurrence === 'specific' && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-body text-text-primary">A specific date</p>
                  <p className="text-small text-text-secondary">One-off availability</p>
                </div>
              </button>
            </div>
          </div>

          {/* Time row */}
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="text-body text-text-primary">Start time <span className="text-danger">*</span></label>
              <select value={startTime} onChange={e => setStartTime(e.target.value)} className="h-9 rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-primary focus:border-primary focus:outline-none">
                {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-sm">
              <label className="text-body text-text-primary">End time <span className="text-danger">*</span></label>
              <select value={endTime} onChange={e => setEndTime(e.target.value)} className="h-9 rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-primary focus:border-primary focus:outline-none">
                {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Appointment type */}
          <div className="flex flex-col gap-sm">
            <label className="text-body text-text-primary">Appointment type <span className="text-danger">*</span></label>
            <select value={appointmentType} onChange={e => setAppointmentType(e.target.value)} className="h-9 rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-primary focus:border-primary focus:outline-none">
              {APPOINTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Operatory */}
          <div className="flex flex-col gap-sm">
            <label className="text-body text-text-primary">Operatory</label>
            <select value={operatory} onChange={e => setOperatory(e.target.value)} className="h-9 rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-secondary focus:border-primary focus:outline-none">
              <option value="">Select</option>
              {OPERATORIES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-sm">
            <label className="text-body text-text-primary">Note</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="eg. Emergency slots only"
              className="h-9 rounded-sm border border-border bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add Time Off Drawer ────────────────────────────────────────────────────────
interface AddTimeOffDrawerProps {
  open: boolean
  onClose: () => void
  onSave: (entry: Omit<TimeOffEntry, 'id'>) => void
}
function AddTimeOffDrawer({ open, onClose, onSave }: AddTimeOffDrawerProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [label, setLabel] = useState('')
  const [allProviders, setAllProviders] = useState(false)
  const [allLocations, setAllLocations] = useState(false)

  if (!open) return null

  function handleSave() {
    const date = dateTo ? `${dateFrom} – ${dateTo}` : dateFrom
    onSave({ date, label, allProviders: allProviders || undefined, allLocations: allLocations || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="flex w-[600px] flex-col bg-surface shadow-modal overflow-y-auto">
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
          <div className="flex flex-col gap-sm">
            <label className="text-body text-text-primary">Label <span className="text-danger">*</span></label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="eg. Independence Day — clinic closed" className="h-9 rounded-sm border border-border bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none" />
          </div>
          <div className="flex flex-col gap-md">
            <label className="flex items-center gap-sm cursor-pointer">
              <input type="checkbox" checked={allProviders} onChange={e => setAllProviders(e.target.checked)} className="rounded border-border" />
              <span className="text-body text-text-primary">Apply to all providers</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer">
              <input type="checkbox" checked={allLocations} onChange={e => setAllLocations(e.target.checked)} className="rounded border-border" />
              <span className="text-body text-text-primary">Apply to all locations</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export function AvailabilityScreen() {
  const [activeTab, setActiveTab] = useState<'booking' | 'source'>('booking')
  const [provider, setProvider] = useState('Dr Sarah Chen')
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>(INITIAL_SCHEDULE)
  const [timeOffs, setTimeOffs] = useState<TimeOffEntry[]>(INITIAL_TIME_OFFS)
  const [addWindowDay, setAddWindowDay] = useState<DayKey | null>(null)
  const [showTimeOffDrawer, setShowTimeOffDrawer] = useState(false)
  const [availabilitySource, setAvailabilitySource] = useState<'birdeye' | 'pms'>('birdeye')

  function handleAddWindow(win: Omit<TimeWindow, 'id'>) {
    if (!addWindowDay) return
    const id = `w-${Date.now()}`
    setSchedule(prev => ({
      ...prev,
      [addWindowDay]: {
        ...prev[addWindowDay],
        windows: [...prev[addWindowDay].windows, { ...win, id }],
      },
    }))
  }

  function handleRemoveWindow(day: DayKey, winId: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], windows: prev[day].windows.filter(w => w.id !== winId) },
    }))
  }

  function handleToggleDay(day: DayKey, val: boolean) {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], enabled: val } }))
  }

  function handleAddTimeOff(entry: Omit<TimeOffEntry, 'id'>) {
    setTimeOffs(prev => [...prev, { ...entry, id: `t-${Date.now()}` }])
  }

  function handleRemoveTimeOff(id: string) {
    setTimeOffs(prev => prev.filter(t => t.id !== id))
  }

  const activeDayLabel = addWindowDay ? DAY_LABELS.find(d => d.key === addWindowDay)?.label ?? '' : ''

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        {/* Page header */}
        <div className="flex items-center justify-between bg-surface px-2xl py-xl">
          <div className="flex flex-col gap-xs">
            <span className="text-h2 text-text-primary">Availability</span>
            <span className="text-small text-text-secondary">Manage provider booking windows and availability rules</span>
          </div>
          <div className="flex items-center gap-sm">
            <button type="button" className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2">
              <Icon name="sync" size={18} />
              Sync from PMS
            </button>
            <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2xl">
          {([
            { id: 'booking' as const, label: 'Provider booking preferences' },
            { id: 'source' as const, label: 'Availability source' },
          ]).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-md pb-sm pt-xs text-body border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'booking' ? (
          <div className="flex flex-col gap-2xl p-2xl">
            {/* Info banner */}
            <div className="flex items-center gap-sm rounded-sm border border-border bg-surface-hover px-lg py-md">
              <Icon name="info" size={18} className="shrink-0 text-text-secondary" />
              <p className="text-body text-text-secondary">
                Define each provider's availability and appointment types. These are not actual appointments — they are the rules the booking agent uses to find and offer open slots.
              </p>
            </div>

            {/* Provider selector */}
            <div className="flex items-center gap-md">
              <label className="text-body text-text-secondary">Select provider:</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="h-9 min-w-[200px] rounded-sm border border-border bg-surface pl-md pr-xl text-body text-text-primary focus:border-primary focus:outline-none"
              >
                <option>Dr Sarah Chen</option>
                <option>Dr Marcus Rivera</option>
                <option>Amy Torres</option>
                <option>Dr James Kim</option>
              </select>
            </div>

            {/* Day rows */}
            <div className="flex flex-col divide-y divide-border rounded-sm border border-border">
              {DAY_LABELS.map(({ key, label }) => {
                const day = schedule[key]
                return (
                  <div key={key} className="flex items-start gap-lg px-lg py-md">
                    {/* Day label */}
                    <span className="w-8 shrink-0 pt-1 text-body text-text-primary">{label}</span>

                    {/* Day off label */}
                    {!day.enabled && <span className="w-14 shrink-0 pt-1 text-body text-text-tertiary">Day off</span>}
                    {day.enabled && <span className="w-14 shrink-0" />}

                    {/* Windows */}
                    <div className="flex flex-1 flex-wrap items-start gap-sm">
                      {day.windows.map(win => (
                        <div
                          key={win.id}
                          className="group relative flex min-w-[160px] flex-col gap-xs rounded-sm border-l-[3px] border-primary bg-primary/5 px-sm py-xs"
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveWindow(key, win.id)}
                            className="absolute right-1 top-1 hidden size-5 items-center justify-center rounded text-text-tertiary hover:text-danger group-hover:flex"
                          >
                            <Icon name="close" size={14} />
                          </button>
                          <span className="text-small text-primary">{win.startTime} - {win.endTime}</span>
                          <span className="text-xs text-text-secondary">{win.operatory}</span>
                          <span className="inline-flex w-fit items-center rounded-sm bg-surface px-sm py-0.5 text-xs text-text-secondary border border-border">
                            {win.appointmentType}
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

                    {/* Toggle */}
                    <div className="shrink-0 pt-1">
                      <Toggle value={day.enabled} onChange={val => handleToggleDay(key, val)} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time off & closures */}
            <div className="flex flex-col gap-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] text-text-primary">Time off & closures</h2>
                  <p className="mt-xs text-small text-text-secondary">
                    Block full days when the clinic is closed or a provider is unavailable. The agent won't offer slots on these dates, overriding the weekly booking windows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTimeOffDrawer(true)}
                  className="flex h-9 shrink-0 items-center gap-xs rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
                >
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
                      {entry.allProviders && (
                        <span className="rounded-sm bg-chip-warning-bg px-sm py-0.5 text-xs text-chip-warning-text">All providers</span>
                      )}
                      {entry.allLocations && (
                        <span className="rounded-sm bg-chip-warning-bg px-sm py-0.5 text-xs text-chip-warning-text">All locations</span>
                      )}
                      <button type="button" className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
                        <Icon name="edit" size={18} />
                      </button>
                      <button type="button" onClick={() => handleRemoveTimeOff(entry.id)} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover hover:text-danger">
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2xl">
            <div className="grid grid-cols-2 gap-lg">
              {([
                {
                  id: 'birdeye' as const,
                  title: 'Manage in Birdeye',
                  description: 'Define provider booking windows here. Best for Dentrix, Open Dental, and Eaglesoft.',
                },
                {
                  id: 'pms' as const,
                  title: 'Sync from PMS',
                  description: 'Read availability directly from your PMS in real time. Best for Denticon and Dentrix Ascend.',
                },
              ]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAvailabilitySource(opt.id)}
                  className={`flex items-start gap-sm rounded-sm border p-lg text-left transition-colors ${availabilitySource === opt.id ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-hover'}`}
                >
                  <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${availabilitySource === opt.id ? 'border-primary' : 'border-border-selected'}`}>
                    {availabilitySource === opt.id && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-body text-text-primary">{opt.title}</p>
                    <p className="mt-xs text-small text-text-secondary">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawers */}
      <AddWindowDrawer
        open={addWindowDay !== null}
        dayLabel={activeDayLabel}
        onClose={() => setAddWindowDay(null)}
        onSave={handleAddWindow}
      />
      <AddTimeOffDrawer
        open={showTimeOffDrawer}
        onClose={() => setShowTimeOffDrawer(false)}
        onSave={handleAddTimeOff}
      />
    </div>
  )
}
