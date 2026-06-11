import { useEffect, useRef, useState } from 'react'
import { DataTable, Icon, SelectMenu, Toast, TopNav, type Column, type SelectOption } from '../components'

// ── Toggle ────────────────────────────────────────────────────────────────────
interface ToggleProps { value: boolean; onChange: (v: boolean) => void }
function Toggle({ value, onChange }: ToggleProps) {
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

// ── Data ──────────────────────────────────────────────────────────────────────
interface ServiceTypeRow {
  name: string
  description: string
  duration: string
  advisors: string
  dmsMapping: string
  recognitionHints: string
  recognitionExtra?: string
  active: boolean
  [key: string]: string | boolean | undefined
}

const SERVICE_TYPES: ServiceTypeRow[] = [
  { name: 'Oil change',               description: 'Full-synthetic or conventional oil + filter',      duration: '45 min',  advisors: 'All',                        dmsMapping: 'LOFS',  recognitionHints: '"oil change"',       recognitionExtra: '+1 more', active: true  },
  { name: 'Tire rotation',            description: 'Rotate all four tires to even out wear',           duration: '30 min',  advisors: 'David Lee, +1 more',         dmsMapping: 'TIROT', recognitionHints: '"tire rotation"',                             active: true  },
  { name: 'Brake inspection',         description: 'Inspect pads, rotors, and brake fluid',            duration: '45 min',  advisors: 'Alex Kim',                   dmsMapping: 'BRKSP', recognitionHints: '"brakes"',           recognitionExtra: '+1 more', active: true  },
  { name: 'Engine diagnostic',        description: 'Full OBD-II scan and fault code analysis',         duration: '60 min',  advisors: 'David Lee, +1 more',         dmsMapping: 'DIAG',  recognitionHints: '"check engine"',     recognitionExtra: '+1 more', active: true  },
  { name: 'Transmission service',     description: 'Fluid flush and filter replacement',               duration: '90 min',  advisors: 'Brian Torres',               dmsMapping: 'TRANS', recognitionHints: '"transmission"',                              active: true  },
  { name: 'Multi-point inspection',   description: '30-point vehicle health check',                    duration: '60 min',  advisors: 'All',                        dmsMapping: 'MPI',   recognitionHints: '"inspection"',                                active: true  },
  { name: 'AC recharge',              description: 'Refrigerant recharge and leak check',              duration: '45 min',  advisors: 'Carlos Reyes',               dmsMapping: 'ACSVC', recognitionHints: '"AC"',               recognitionExtra: '+1 more', active: false },
  { name: 'Collision estimate',       description: 'Damage assessment and repair cost estimate',       duration: '60 min',  advisors: 'Jessica Park',               dmsMapping: 'EST',   recognitionHints: '"estimate"',         recognitionExtra: '+1 more', active: true  },
  { name: 'Recall service',           description: 'Manufacturer-issued recall repair',                duration: '120 min', advisors: 'David Lee, +2 more',         dmsMapping: 'RCALL', recognitionHints: '"recall"',                                    active: true  },
  { name: 'Battery replacement',      description: 'Battery test and replacement if needed',           duration: '30 min',  advisors: 'Alex Kim',                   dmsMapping: 'BATT',  recognitionHints: '"battery"',          recognitionExtra: '+1 more', active: true  },
  { name: 'Wheel alignment',          description: 'Two- or four-wheel alignment to spec',             duration: '60 min',  advisors: 'All',                        dmsMapping: 'ALIGN', recognitionHints: '"alignment"',                                 active: true  },
]

// ── Dropdown data ─────────────────────────────────────────────────────────────
const ST_LOCATION_OPTIONS: SelectOption[] = [
  { value: 'sf',   label: 'San Francisco, CA' },
  { value: 'sj',   label: 'San Jose, CA' },
  { value: 'oak',  label: 'Oakland, CA' },
  { value: 'pa',   label: 'Palo Alto, CA' },
  { value: 'berk', label: 'Berkeley, CA' },
]

const ST_DURATION_OPTIONS: SelectOption[] = [
  { value: '15',  label: '15 min' },
  { value: '30',  label: '30 min' },
  { value: '45',  label: '45 min' },
  { value: '60',  label: '60 min' },
  { value: '90',  label: '90 min' },
  { value: '120', label: '2 hr' },
]

const ST_ADVISOR_OPTIONS: SelectOption[] = [
  { value: 'all',    label: 'All advisors' },
  { value: 'mike',   label: 'Mike Johnson' },
  { value: 'sarah',  label: 'Sarah Rodriguez' },
  { value: 'david',  label: 'David Lee' },
  { value: 'alex',   label: 'Alex Kim' },
  { value: 'tom',    label: 'Tom Wilson' },
]

const ST_MAPPING_TYPE_OPTIONS: SelectOption[] = [
  { value: 'none',     label: 'None' },
  { value: 'op-code',  label: 'Op code' },
  { value: 'labor',    label: 'Labor code' },
]

const ST_DMS_OPCODE_OPTIONS: SelectOption[] = [
  { value: 'lofs',   label: 'LOFS – Lube, oil & filter service' },
  { value: 'tirot',  label: 'TIROT – Tire rotation' },
  { value: 'brksp',  label: 'BRKSP – Brake inspection' },
  { value: 'diag',   label: 'DIAG – Vehicle diagnostic' },
  { value: 'trans',  label: 'TRANS – Transmission service' },
  { value: 'mpi',    label: 'MPI – Multi-point inspection' },
  { value: 'acsvc',  label: 'ACSVC – AC service' },
  { value: 'est',    label: 'EST – Estimate' },
  { value: 'align',  label: 'ALIGN – Wheel alignment' },
  { value: 'batt',   label: 'BATT – Battery service' },
]

// ── DropdownField ─────────────────────────────────────────────────────────────
interface STDropdownFieldProps {
  label: string
  required?: boolean
  infoIcon?: boolean
  options: SelectOption[]
  value: string[]
  multi?: boolean
  searchable?: boolean
  placeholder?: string
  onChange: (v: string[]) => void
}
function STDropdownField({ label, required, infoIcon, options, value, multi = false, searchable, placeholder = 'Select', onChange }: STDropdownFieldProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const displayLabel = value.length === 0
    ? placeholder
    : value.length === 1
      ? (options.find(o => o.value === value[0])?.label ?? placeholder)
      : `${value.length} selected`

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center gap-xs">
        <label className="text-small text-text-secondary">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
        {infoIcon && <Icon name="info" size={14} className="text-text-tertiary" />}
      </div>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`flex h-9 w-full items-center justify-between rounded-sm border px-md text-body text-text-primary transition-colors hover:bg-surface-hover ${open ? 'border-primary' : 'border-border'}`}
        >
          <span className={value.length === 0 ? 'text-text-tertiary' : ''}>{displayLabel}</span>
          <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="shrink-0 text-text-icon" />
        </button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-[60] w-full">
            <SelectMenu
              options={options}
              value={value}
              multi={multi}
              searchable={searchable}
              onChange={(v) => { onChange(v); if (!multi) setOpen(false) }}
              onApply={() => setOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function ServiceTypeDrawer({ open, mode, onClose }: { open: boolean; mode: 'create' | 'edit'; onClose: () => void }) {
  const isEdit = mode === 'edit'

  const [displayName,  setDisplayName]  = useState(isEdit ? 'Oil change' : '')
  const [description,  setDescription]  = useState(isEdit ? 'Full-synthetic or conventional oil + filter' : '')
  const [pmsExpanded,  setPmsExpanded]  = useState(isEdit)
  const [tags,         setTags]         = useState<string[]>(isEdit ? ['oil change', 'lube service'] : [])
  const [tagInput,     setTagInput]     = useState('')

  const [location,     setLocation]     = useState<string[]>(isEdit ? ['sf']       : [])
  const [duration,     setDuration]     = useState<string[]>(isEdit ? ['45']       : [])
  const [advisors,     setAdvisors]     = useState<string[]>(isEdit ? ['all']      : [])
  const [mappingType,  setMappingType]  = useState<string[]>(isEdit ? ['op-code']  : ['none'])
  const [dmsOpCode,    setDmsOpCode]    = useState<string[]>(isEdit ? ['lofs']     : [])

  function handleMappingTypeChange(v: string[]) {
    setMappingType(v)
    if (v[0] !== 'op-code') setDmsOpCode([])
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(t => [...t, tagInput.trim()])
      setTagInput('')
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[650px] flex-col bg-surface shadow-modal">
        <div className="flex items-center justify-between px-2xl py-lg">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="arrow_back" size={18} />
            </button>
            <span className="text-h3 text-text-primary">{isEdit ? 'Edit' : 'Create new'}</span>
          </div>
          <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-lg overflow-auto p-2xl">
          <STDropdownField label="Location" required infoIcon options={ST_LOCATION_OPTIONS} value={location} onChange={setLocation} />

          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Display name <span className="text-danger">*</span></label>
            <input className="h-9 rounded-sm border border-border px-md text-body text-text-primary focus:border-primary focus:outline-none" placeholder="Enter" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Description <span className="text-danger">*</span></label>
            <textarea className="min-h-[80px] rounded-sm border border-border px-md py-sm text-body text-text-primary focus:border-primary focus:outline-none" placeholder="Enter" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <STDropdownField label="Duration" options={ST_DURATION_OPTIONS} value={duration} onChange={setDuration} placeholder="Select duration" />
          <STDropdownField label="Eligible advisors" options={ST_ADVISOR_OPTIONS} value={advisors} multi onChange={setAdvisors} placeholder="Select advisors" />

          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Recognition hints <span className="text-danger">*</span></label>
            <div className="flex min-h-[36px] flex-wrap items-center gap-xs rounded-sm border border-border px-md py-xs focus-within:border-primary">
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-xs rounded-full bg-surface-selected px-sm py-0.5 text-small text-text-primary">
                  {tag}
                  <button type="button" onClick={() => setTags(t => t.filter((_, j) => j !== i))} className="text-text-tertiary hover:text-text-primary">
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
              <input
                className="min-w-[120px] flex-1 text-body text-text-primary outline-none"
                placeholder={tags.length === 0 ? 'Type a phrase and press enter' : ''}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
            <p className="text-xs text-text-tertiary">Phrases that assist the agent in identifying this service type</p>
          </div>

          <div className="rounded-sm border border-border">
            <button type="button" className="flex w-full items-center justify-between px-md py-sm" onClick={() => setPmsExpanded(v => !v)}>
              <span className="text-body text-text-primary">DMS mapping</span>
              <Icon name={pmsExpanded ? 'expand_less' : 'expand_more'} size={18} className="text-text-icon" />
            </button>
            {pmsExpanded && (
              <div className="flex flex-col gap-md border-t border-border p-md">
                <STDropdownField label="Mapping type" options={ST_MAPPING_TYPE_OPTIONS} value={mappingType} onChange={handleMappingTypeChange} />
                {mappingType[0] === 'op-code' && (
                  <STDropdownField label="DMS op code" options={ST_DMS_OPCODE_OPTIONS} value={dmsOpCode} onChange={setDmsOpCode} placeholder="Select op code" searchable />
                )}
                <p className="text-small text-text-secondary">Links this service type to an op code in your DMS. The mapped code's labor time sets the maximum duration.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── AutoAppointmentTypeScreen ─────────────────────────────────────────────────
export function AutoAppointmentTypeScreen() {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [editDrawerOpen,   setEditDrawerOpen]   = useState(false)
  const [toastVisible,     setToastVisible]     = useState(false)
  const [locationFilter,   setLocationFilter]   = useState<string[]>([])
  const [locationOpen,     setLocationOpen]     = useState(false)
  const [activeMap, setActiveMap] = useState<Record<number, boolean>>(
    Object.fromEntries(SERVICE_TYPES.map((r, i) => [i, r.active]))
  )

  const COLUMNS: Column<ServiceTypeRow>[] = [
    {
      key: 'name', label: 'Name', width: 240, sortable: true,
      render: (_v, row) => (
        <div>
          <div className="text-body text-text-primary">{row.name as string}</div>
          <div className="text-xs text-text-tertiary">{row.description as string}</div>
        </div>
      ),
    },
    { key: 'duration',  label: 'Duration',    width: 100, sortable: true },
    { key: 'advisors',  label: 'Advisors',    width: 180, sortable: true },
    { key: 'dmsMapping',label: 'DMS mapping', width: 140, sortable: true },
    {
      key: 'recognitionHints', label: 'Recognition hints', width: 200, sortable: true,
      render: (_v, row) => (
        <span>
          {row.recognitionHints as string}
          {row.recognitionExtra && <span className="text-text-tertiary">, {row.recognitionExtra as string}</span>}
        </span>
      ),
    },
    {
      key: 'active', label: 'Active', width: 80, sortable: true,
      render: (_v, row) => {
        const idx = SERVICE_TYPES.indexOf(row as ServiceTypeRow)
        return <Toggle value={activeMap[idx] ?? false} onChange={v => setActiveMap(m => ({ ...m, [idx]: v }))} />
      },
    },
  ]

  const rowMenuItems = [
    { label: 'Edit',   onClick: () => setEditDrawerOpen(true) },
    { label: 'Delete', onClick: () => {} },
  ]

  return (
    <div className="flex h-full flex-col">
      <Toast message="Syncing from DMS — your data will be updated in a few minutes." visible={toastVisible} onClose={() => setToastVisible(false)} />
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        <div className="flex items-center justify-between bg-surface px-2xl py-xl">
          <div className="flex flex-col gap-xs">
            <span className="text-h2 text-text-primary">{SERVICE_TYPES.length} Appointment types</span>
          </div>
          <div className="flex items-center gap-sm">
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="search" size={20} />
            </button>
            <div className="relative w-[200px]">
              <button
                type="button"
                onClick={() => setLocationOpen(o => !o)}
                className="flex h-9 w-full items-center justify-between rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary hover:bg-surface-l2"
              >
                <span className={locationFilter.length === 0 ? 'text-text-tertiary' : ''}>
                  {locationFilter.length === 0 ? 'All locations' : (ST_LOCATION_OPTIONS.find(o => o.value === locationFilter[0])?.label ?? 'All locations')}
                </span>
                <Icon name="expand_more" size={18} className="shrink-0 text-text-icon" />
              </button>
              {locationOpen && (
                <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setLocationOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+4px)] z-[60] w-full">
                    <SelectMenu options={ST_LOCATION_OPTIONS} value={locationFilter} onChange={v => { setLocationFilter(v); setLocationOpen(false) }} />
                  </div>
                </>
              )}
            </div>
            <button type="button" onClick={() => setToastVisible(true)} className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2">
              <Icon name="refresh" size={18} />
              Sync from DMS
            </button>
            <button type="button" onClick={() => setCreateDrawerOpen(true)} className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
              Create new
            </button>
          </div>
        </div>

        <div className="px-2xl pb-2xl">
          <DataTable columns={COLUMNS} data={SERVICE_TYPES} rowMenuItems={rowMenuItems} rowClassName={() => ''} />
        </div>
      </div>

      <ServiceTypeDrawer open={createDrawerOpen} mode="create" onClose={() => setCreateDrawerOpen(false)} />
      <ServiceTypeDrawer open={editDrawerOpen}   mode="edit"   onClose={() => setEditDrawerOpen(false)}   />
    </div>
  )
}
