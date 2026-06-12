import { useEffect, useRef, useState } from 'react'
import { Icon, DataTable, SelectMenu, TopNav, type Column } from '../components'

// --- Phone number 1 data & helpers (Abhishek's version — do not delete) ---
// interface PhoneNumberRow {
//   name: string
//   phoneNumber: string
//   connection: string
//   routingMode: string
//   assignedAgents: string
//   locations: string
//   provider: string
//   [key: string]: string
// }
// 
// const DATA: PhoneNumberRow[] = [
//   { name: 'Main reception',   phoneNumber: '(202) 555-0123', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: 'Frontdesk',              locations: 'North Austin',  provider: 'Twilio'    },
//   { name: 'Schedule line',    phoneNumber: '(303) 555-0198', connection: 'Call forwarding', routingMode: 'Overflow', assignedAgents: 'Scheduling & Frontdesk', locations: 'South Austin',  provider: 'Twilio'    },
//   { name: 'Outreach',         phoneNumber: '(404) 555-0167', connection: 'SIP trunk',       routingMode: 'Overflow', assignedAgents: 'Pre-visit',              locations: 'San Francisco', provider: 'Vonage'    },
//   { name: 'Outreach',         phoneNumber: '(505) 555-0189', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: '-',                      locations: '-',             provider: 'Twilio'    },
//   { name: 'Patient services', phoneNumber: '(606) 555-0145', connection: 'Call forwarding', routingMode: 'IVR',      assignedAgents: 'Frontdesk & Waitlist',   locations: 'South Austin',  provider: 'Bandwidth' },
//   { name: 'Insurance',        phoneNumber: '(707) 555-0132', connection: 'SIP trunk',       routingMode: 'IVR',      assignedAgents: 'Frontdesk',              locations: '-',             provider: 'Bandwidth' },
//   { name: 'Night coverage',   phoneNumber: '(808) 555-0156', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: '-',                      locations: 'All locations', provider: 'Twilio'    },
//   { name: 'Toll-free main',   phoneNumber: '(909) 555-0173', connection: 'Call forwarding', routingMode: 'Overflow', assignedAgents: 'Frontdesk & Pre-vist',   locations: 'All locations', provider: 'Twilio'    },
//   { name: 'Insurance verify', phoneNumber: '(212) 555-0111', connection: 'Birdeye number',  routingMode: 'IVR',      assignedAgents: 'Scheduling',             locations: 'North Austin',  provider: 'Twilio'    },
//   { name: 'Reminder line',    phoneNumber: '(415) 555-0100', connection: 'SIP trunk',       routingMode: 'AI-first', assignedAgents: '-',                      locations: '-',             provider: 'Vonage'    },
//   { name: 'Billing',          phoneNumber: '(310) 555-0192', connection: 'Call forwarding', routingMode: 'IVR',      assignedAgents: 'Frontdesk',              locations: 'San Francisco', provider: 'Twilio'    },
// ]
// 
// const COLUMNS: Column<PhoneNumberRow>[] = [
//   { key: 'name',           label: 'Name',            sortable: true },
//   { key: 'phoneNumber',    label: 'Phone number',    sortable: true },
//   { key: 'connection',     label: 'Connection',      sortable: true },
//   { key: 'routingMode',    label: 'Routing mode',    sortable: true },
//   { key: 'assignedAgents', label: 'Assigned agents', sortable: true },
//   { key: 'locations',      label: 'Locations',       sortable: true },
//   { key: 'provider',       label: 'Provider',        sortable: true },
// ]
// 
const AGENT_OPTIONS = [
  { value: 'Frontdesk', label: 'Frontdesk' },
  { value: 'Scheduling', label: 'Scheduling' },
  { value: 'Pre-visit', label: 'Pre-visit' },
  { value: 'Waitlist', label: 'Waitlist' },
  { value: 'Reminder', label: 'Reminder' },
]
// 
function TestCallModal({ open, phoneNumber, onClose }: { open: boolean; phoneNumber: string; onClose: () => void }) {
  const [agent, setAgent] = useState('')
  const [agentMenuOpen, setAgentMenuOpen] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-1/2 top-[60px] w-[590px] -translate-x-1/2 rounded-md bg-surface shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-2xl pb-lg pt-2xl">
          <span className="text-h3 text-text-primary">Test call</span>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-md px-2xl pb-lg">
          {/* Phone number */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-primary">Phone number</label>
            <div className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-md">
              <Icon name="phone" size={16} className="shrink-0 text-text-icon" />
              <span className="text-body text-text-secondary">+1</span>
              <span className="mx-xs h-4 w-px bg-border" />
              <span className="text-body text-text-tertiary">{phoneNumber}</span>
            </div>
          </div>

          {/* Agent */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-primary">Agent</label>
            <button
              type="button"
              onClick={(e) => {
                if (agentMenuOpen) { setAgentMenuOpen(false); return }
                const r = e.currentTarget.getBoundingClientRect()
                setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
                setAgentMenuOpen(true)
              }}
              className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${
                agentMenuOpen ? 'border-primary' : 'border-border-input'
              }`}
            >
              <span className={`min-w-0 flex-1 truncate text-left text-body ${agent ? 'text-text-primary' : 'text-text-tertiary'}`}>
                {agent || 'Select agent'}
              </span>
              <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-sm border-t border-border px-2xl py-lg">
          <button type="button" onClick={onClose} className="rounded-sm px-md py-xs text-body text-text-action hover:bg-surface-hover">
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
          >
            Start test call
          </button>
        </div>
      </div>

      {/* Agent dropdown */}
      {agentMenuOpen && anchor && (
        <>
          <div className="fixed inset-0 z-[125]" onClick={() => setAgentMenuOpen(false)} />
          <div className="fixed z-[130]" style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
            <SelectMenu
              options={AGENT_OPTIONS}
              value={agent ? [agent] : []}
              onChange={(val) => { setAgent(val[0] ?? ''); setAgentMenuOpen(false) }}
            />
          </div>
        </>
      )}
    </div>
  )
}
//
// function ImportNumberButton({ onSelect }: { onSelect: (source: 'twilio' | 'sip') => void }) {
//   const [open, setOpen] = useState(false)
//   const ref = useRef<HTMLDivElement>(null)
// 
//   useEffect(() => {
//     if (!open) return
//     function handler(e: MouseEvent) {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
//     }
//     document.addEventListener('mousedown', handler)
//     return () => document.removeEventListener('mousedown', handler)
//   }, [open])
// 
//   return (
//     <div className="relative" ref={ref}>
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
//       >
//         Import number
//       </button>
//       {open && (
//         <div className="absolute right-0 top-[40px] z-50 min-w-[216px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
//           <button
//             type="button"
//             onClick={() => { onSelect('twilio'); setOpen(false) }}
//             className="block w-full px-md py-md text-left text-body text-text-primary hover:bg-surface-hover"
//           >
//             From Twilio
//           </button>
//           <button
//             type="button"
//             onClick={() => { onSelect('sip'); setOpen(false) }}
//             className="block w-full px-md py-md text-left text-body text-text-primary hover:bg-surface-hover"
//           >
//             From SIP Trunk
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
// 
// const IMPORT_TWILIO_FIELDS = [
//   { key: 'name',       label: 'Name',               type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'phone',      label: 'Phone number',       type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'twilioSid',  label: 'Twilio account SID', type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'authToken',  label: 'Auth token',         type: 'text' as const, placeholder: 'Enter input' },
// ]
// 
// const IMPORT_SIP_FIELDS = [
//   { key: 'name',       label: 'Name',               type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'phone',      label: 'Phone number',       type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'sipServer',  label: 'SIP server address',  type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'sipPort',    label: 'SIP port',            type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'username',   label: 'Username',            type: 'text' as const, placeholder: 'Enter input' },
//   { key: 'password',   label: 'Password',            type: 'text' as const, placeholder: 'Enter input' },
// ]
// --- End phone number 1 data & helpers ---


// ─── Phone number 2 ──────────────────────────────────────────────────────────

interface PhoneNumber2Row {
  name: string
  phoneNumber: string
  e164Format: string
  terminationUri: string
  transport: string
  sipUsername: string
  sipPassword: string
  connection: string
  routingMode: string
  assignedAgents: string
  locations: string
  provider: string
  status: string
  [key: string]: string
}


const DEFAULT_ROWS: PhoneNumber2Row[] = [
  {
    name:           'Main reception',
    phoneNumber:    '+14155552671',
    e164Format:     '+E.164',
    terminationUri: 'sip:mainreception.pstn.twilio.com;transport=tcp',
    transport:      'TCP',
    sipUsername:    'myna_user',
    sipPassword:    'p@ssw0rd',
    connection:     'SIP trunk',
    routingMode:    '—',
    assignedAgents: '—',
    locations:      'San Francisco',
    provider:       'Twilio',
    status:         'Active',
  },
]

const COLUMNS2: Column<PhoneNumber2Row>[] = [
  { key: 'name',        label: 'Name',         sortable: true },
  { key: 'phoneNumber', label: 'Phone number', sortable: true },
  { key: 'locations',   label: 'Locations',    sortable: true },
]


const LOCATION_OPTIONS = [
  { value: 'North Austin',  label: 'North Austin'  },
  { value: 'South Austin',  label: 'South Austin'  },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'All locations', label: 'All locations' },
]


function applySipFormat(raw: string, transport: string): string {
  // Strip any existing sip:/sips: prefix and ;transport=* suffix to get the bare host
  const host = raw
    .replace(/^sips?:\/?\/?/i, '')
    .replace(/;transport=\w+$/i, '')
    .trim()
  if (!host) return ''
  if (transport === 'TLS') return `sips:${host}`
  if (transport === 'TCP') return `sip:${host};transport=tcp`
  return `sip:${host}` // UDP — no transport param needed
}

function applyPhoneFormat(raw: string, format: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11) // max 11 digits (country + 10)
  if (format === '+E.164') return digits ? `+${digits}` : ''
  if (format === 'National') {
    const d = digits.slice(0, 10) // national = 10 digits
    if (d.length === 0) return ''
    if (d.length <= 3) return `(${d}`
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  // E.164: digits only
  return digits
}

const TRANSPORT_OPTIONS = [
  { value: 'TCP', label: 'TCP' },
  { value: 'UDP', label: 'UDP' },
  { value: 'TLS', label: 'TLS' },
]

const E164_FORMAT_OPTIONS = [
  { value: 'E.164',    label: 'E.164'    },
  { value: '+E.164',   label: '+E.164'   },
  { value: 'National', label: 'National' },
]

interface ImportState {
  name: string
  phoneNumber: string
  e164Format: string
  terminationUri: string
  transport: string
  sipUsername: string
  sipPassword: string
  location: string
}

const EMPTY_IMPORT: ImportState = {
  name: '',
  phoneNumber: '', e164Format: 'E.164', terminationUri: '', transport: 'TCP', sipUsername: '', sipPassword: '',
  location: '',
}

// ── Prefix-dropdown-inside-input (e.g. format selector + phone number) ──────────
interface PrefixDropdownInputProps {
  prefixOptions: { value: string; label: string }[]
  prefixValue: string
  onPrefixChange: (v: string) => void
  inputPlaceholder?: string
  inputValue: string
  inputType?: string
  onInputChange: (v: string) => void
}
function PrefixDropdownInput({
  prefixOptions, prefixValue, onPrefixChange,
  inputPlaceholder, inputValue, inputType = 'text', onInputChange,
}: PrefixDropdownInputProps) {
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

  const displayLabel = prefixOptions.find(o => o.value === prefixValue)?.label ?? prefixValue

  return (
    <div ref={ref} className="relative">
      <div className={`flex h-9 items-center rounded-sm border transition-colors focus-within:border-primary ${open ? 'border-primary' : 'border-border'}`}>
        {/* Prefix dropdown trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex shrink-0 items-center gap-xs px-md text-body text-text-primary hover:bg-surface-hover rounded-l-sm h-full"
        >
          {displayLabel}
          <Icon name={open ? 'expand_less' : 'expand_more'} size={16} className="text-text-icon" />
        </button>
        {/* Divider */}
        <span className="h-5 w-px shrink-0 bg-border" />
        {/* Text input */}
        <input
          type={inputType}
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-full flex-1 rounded-r-sm bg-transparent px-md text-body text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
      </div>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[60] min-w-[220px]">
          <SelectMenu
            options={prefixOptions}
            value={[prefixValue]}
            onChange={(v) => { onPrefixChange(v[0] ?? prefixValue); setOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}

// ── Reusable dropdown field (mirrors ATDropdownField in AppointmentTypeScreen) ──
interface SIPDropdownFieldProps {
  label: string
  required?: boolean
  options: { value: string; label: string }[]
  value: string
  placeholder?: string
  disabled?: boolean
  upward?: boolean
  onChange: (v: string) => void
}
function SIPDropdownField({ label, required, options, value, placeholder = 'Select', disabled, upward, onChange }: SIPDropdownFieldProps) {
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

  const displayLabel = options.find(o => o.value === value)?.label ?? placeholder

  return (
    <div className="flex flex-col gap-xs">
      <label className={`text-small ${disabled ? 'text-text-tertiary' : 'text-text-secondary'}`}>
        {label}{required && <span className="text-chip-danger-text"> *</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          className={`flex h-9 w-full items-center justify-between rounded-sm border px-md text-body transition-colors ${
            disabled
              ? 'cursor-not-allowed border-border bg-surface-subtle text-text-tertiary'
              : open
              ? 'border-primary text-text-primary hover:bg-surface-hover'
              : 'border-border text-text-primary hover:bg-surface-hover'
          }`}
        >
          <span className={!value ? 'text-text-tertiary' : ''}>{displayLabel}</span>
          <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="shrink-0 text-text-icon" />
        </button>
        {open && (
          <div className={`absolute left-0 z-[60] w-full ${upward ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'}`}>
            <SelectMenu
              options={options}
              value={value ? [value] : []}
              onChange={(v) => { onChange(v[0] ?? ''); setOpen(false) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ImportDrawer({ open, initialRow, onClose, onSave }: { open: boolean; initialRow?: PhoneNumber2Row; onClose: () => void; onSave: (row: PhoneNumber2Row) => void }) {
  const isEdit = !!initialRow

  const [form, setForm] = useState<ImportState>(EMPTY_IMPORT)
  const [verified, setVerified]   = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_IMPORT)
      setVerified(false)
      setVerifying(false)
    } else if (initialRow) {
      setForm({
        name:           initialRow.name,
        phoneNumber:    initialRow.phoneNumber,
        e164Format:     initialRow.e164Format     || 'E.164',
        terminationUri: initialRow.terminationUri || '',
        transport:      initialRow.transport      || 'TCP',
        sipUsername:    initialRow.sipUsername     || '',
        sipPassword:    initialRow.sipPassword     || '',
        location:       initialRow.locations,
      })
      setVerified(true)
    }
  }, [open, initialRow])

  function handleVerify() {
    setVerifying(true)
    setTimeout(() => { setVerifying(false); setVerified(true) }, 1500)
  }

  if (!open) return null

  const canVerify = form.name.trim() !== '' && form.phoneNumber.trim() !== '' && form.terminationUri.trim() !== ''
  const canSave   = verified && form.location !== ''

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[650px] flex-col bg-surface shadow-modal">

        {/* Header */}
        <div className="flex items-center justify-between px-2xl py-lg">
          <div className="flex items-center gap-sm">
            <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="arrow_back" size={18} />
            </button>
            <span className="text-h3 text-text-primary">{isEdit ? 'Edit number' : 'Import number'}</span>
          </div>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return
              onSave({
                name:           form.name,
                phoneNumber:    form.phoneNumber,
                e164Format:     form.e164Format,
                terminationUri: form.terminationUri,
                transport:      form.transport,
                sipUsername:    form.sipUsername,
                sipPassword:    form.sipPassword,
                connection:     'SIP trunk',
                routingMode:    '—',
                assignedAgents: '—',
                locations:      form.location,
                provider:       'Twilio',
                status:         'Active',
              })
              onClose()
            }}
            className={`flex h-9 items-center rounded-sm px-lg text-body text-white transition-colors ${
              !canSave ? 'cursor-not-allowed bg-surface-selected text-text-tertiary' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            Save
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-lg overflow-auto p-2xl">

          <p className="text-body text-text-secondary">Connect to your number via SIP trunking</p>

          {/* Name */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Name <span className="text-chip-danger-text">*</span></label>
            <input
              type="text"
              placeholder="e.g. Main reception"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setVerified(false) }}
              className="h-9 rounded-sm border border-border px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Phone number with inline format selector */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Phone number <span className="text-chip-danger-text">*</span></label>
            <PrefixDropdownInput
              prefixOptions={E164_FORMAT_OPTIONS}
              prefixValue={form.e164Format}
              onPrefixChange={(v) => {
                const reformatted = applyPhoneFormat(form.phoneNumber, v)
                setForm((f) => ({ ...f, e164Format: v, phoneNumber: reformatted }))
                setVerified(false)
              }}
              inputPlaceholder={form.e164Format === 'National' ? '(415) 555-2671' : form.e164Format === '+E.164' ? '+14155552671' : '14155552671'}
              inputValue={form.phoneNumber}
              onInputChange={(v) => {
                setForm((f) => ({ ...f, phoneNumber: applyPhoneFormat(v, f.e164Format) }))
                setVerified(false)
              }}
            />
          </div>

          {/* Termination URI with inline transport selector */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Termination URI <span className="text-chip-danger-text">*</span></label>
            <PrefixDropdownInput
              prefixOptions={TRANSPORT_OPTIONS}
              prefixValue={form.transport}
              onPrefixChange={(v) => {
                const reformatted = applySipFormat(form.terminationUri, v)
                setForm((f) => ({ ...f, transport: v, terminationUri: reformatted }))
                setVerified(false)
              }}
              inputPlaceholder={
                form.transport === 'TLS' ? 'sips:example.pstn.twilio.com'
                : form.transport === 'TCP' ? 'sip:example.pstn.twilio.com;transport=tcp'
                : 'sip:example.pstn.twilio.com'
              }
              inputValue={form.terminationUri}
              onInputChange={(v) => {
                setForm((f) => ({ ...f, terminationUri: applySipFormat(v, f.transport) }))
                setVerified(false)
              }}
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Username <span className="text-text-tertiary">(Optional)</span></label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.sipUsername}
              onChange={(e) => setForm((f) => ({ ...f, sipUsername: e.target.value }))}
              className="h-9 rounded-sm border border-border px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Password <span className="text-text-tertiary">(Optional)</span></label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.sipPassword}
              onChange={(e) => setForm((f) => ({ ...f, sipPassword: e.target.value }))}
              className="h-9 rounded-sm border border-border px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Verify */}
          <div className="flex items-center gap-sm">
            <button
              type="button"
              disabled={!canVerify || verifying || verified}
              onClick={handleVerify}
              className={`flex h-9 items-center gap-sm rounded-sm border px-lg text-body transition-colors ${
                verified
                  ? 'cursor-default border-success bg-surface text-success'
                  : !canVerify || verifying
                  ? 'cursor-not-allowed border-border bg-surface text-text-tertiary'
                  : 'border-border bg-surface text-text-primary hover:bg-surface-hover'
              }`}
            >
              {verifying ? (
                <><span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" />Verifying…</>
              ) : verified ? (
                <><Icon name="check_circle" size={16} className="text-success" />Verified</>
              ) : 'Verify'}
            </button>
            {!verified && !verifying && (
              <span className={`text-small ${canVerify ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                {canVerify
                  ? 'Ready to verify your SIP connection'
                  : <><span className="text-chip-danger-text">*</span>Fill in all fields above to verify</>}
              </span>
            )}
          </div>

          {/* Location — unlocked after verify */}
          <p className={`mt-[16px] text-body ${verified ? 'text-text-secondary' : 'text-text-tertiary'}`}>
            Assign to a location to start routing calls.
          </p>
          <div className="group/tooltip relative">
            <SIPDropdownField
              label="Location"
              options={LOCATION_OPTIONS}
              value={form.location}
              placeholder="Select location"
              disabled={!verified}
              upward
              onChange={(v) => setForm((f) => ({ ...f, location: v }))}
            />
            {!verified && (
              <div className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 z-[70] whitespace-nowrap rounded-sm bg-[#1c1c1c] px-sm py-xs text-small text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100">
                Complete SIP trunking setup and verify your connection before assigning a location.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}


// ── Call Forwarding modal data ────────────────────────────────────────────────
const CF_DATA = [
  { location: 'North Austin',    business: '(512) 555-0101', receptionist: '(512) 900-0001' },
  { location: 'South Austin',    business: '(512) 555-0102', receptionist: '(512) 900-0002' },
  { location: 'San Francisco',   business: '(415) 555-0103', receptionist: '(415) 900-0003' },
  { location: 'Palo Alto',       business: '(650) 555-0104', receptionist: '(650) 900-0004' },
  { location: 'Oakland',         business: '(510) 555-0105', receptionist: '(510) 900-0005' },
]

function CallForwardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-[60px] w-[720px] -translate-x-1/2 rounded-md bg-surface shadow-modal">

        {/* Header */}
        <div className="flex items-center justify-between px-2xl pb-lg pt-2xl">
          <div className="flex items-center gap-md">
            <span className="text-h3 text-text-primary">Setup forwarding for unanswered calls</span>
            <button
              type="button"
              className="flex h-9 items-center rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
            >
              Download this list (XLS)
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Description */}
        <div className="px-2xl pb-lg">
          <p className="text-body text-text-secondary">
            For instructions on how to forward unanswered calls from your landline number to the receptionist number, consult your phone system setup or{' '}
            <a href="#" className="text-text-action hover:underline">learn more</a>
          </p>
        </div>

        {/* Table */}
        <div className="px-2xl pb-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-sm text-body text-text-secondary font-normal">
                  <div className="flex items-center gap-xs">
                    Location <Icon name="expand_more" size={18} className="text-text-icon" />
                  </div>
                </th>
                <th className="pb-sm text-body text-text-secondary font-normal">Business number</th>
                <th className="pb-sm text-body text-text-secondary font-normal">Receptionist number</th>
              </tr>
            </thead>
            <tbody>
              {CF_DATA.map((row) => (
                <tr key={row.location} className="border-b border-border last:border-0">
                  <td className="py-md text-body text-text-primary">{row.location}</td>
                  <td className="py-md text-body text-text-primary">{row.business}</td>
                  <td className="py-md text-body text-text-primary">{row.receptionist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-border px-2xl py-md">
          <div className="flex items-center gap-xs">
            <button type="button" className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="chevron_left" size={20} />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={`flex size-8 items-center justify-center rounded-sm text-body ${n === 1 ? 'border border-primary text-primary' : 'text-text-secondary hover:bg-surface-hover'}`}
              >
                {n}
              </button>
            ))}
            <span className="px-xs text-text-tertiary">···</span>
            <button type="button" className="flex size-8 items-center justify-center rounded-sm text-body text-text-secondary hover:bg-surface-hover">65</button>
            <button type="button" className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
              <Icon name="chevron_right" size={20} />
            </button>
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
          >
            Show 25 <Icon name="expand_more" size={18} className="text-text-icon" />
          </button>
        </div>

      </div>
    </div>
  )
}

export function PhoneNumber2Screen() {
  const [rows, setRows] = useState<PhoneNumber2Row[]>(DEFAULT_ROWS)
  const [importOpen, setImportOpen] = useState(false)
  const [editRow, setEditRow] = useState<PhoneNumber2Row | null>(null)
  const [testCallRow, setTestCallRow] = useState<PhoneNumber2Row | null>(null)
  const [callForwardingOpen, setCallForwardingOpen] = useState(false)


  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-2xl py-xl">
          <h1 className="text-h3 text-text-primary">Phone numbers</h1>
          <div className="flex items-center gap-sm">
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="search" size={20} />
            </button>
            <button
              type="button"
              onClick={() => setCallForwardingOpen(true)}
              className="flex h-9 items-center rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
            >
              Call forwarding
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
            >
              Import number
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="px-lg">
            <DataTable
              columns={COLUMNS2}
              data={rows}
              rowActions={[
                { icon: 'phone_in_talk', label: 'Test call', onClick: (row) => setTestCallRow(row) },
                { icon: 'edit',          label: 'Edit',      onClick: (row) => setEditRow(row) },
              ]}
            />
          </div>
        </div>

      </div>

      {/* Test call modal */}
      <TestCallModal
        open={testCallRow !== null}
        phoneNumber={testCallRow?.phoneNumber ?? ''}
        onClose={() => setTestCallRow(null)}
      />

      {/* Call forwarding modal */}
      <CallForwardingModal open={callForwardingOpen} onClose={() => setCallForwardingOpen(false)} />

      {/* Import / Edit drawer */}
      <ImportDrawer
        open={importOpen || editRow !== null}
        initialRow={editRow ?? undefined}
        onClose={() => { setImportOpen(false); setEditRow(null) }}
        onSave={(row) => {
          if (editRow) {
            setRows((prev) => prev.map((r) => r === editRow ? row : r))
          } else {
            setRows((prev) => [...prev, row])
          }
          setEditRow(null)
          setImportOpen(false)
        }}
      />
    </div>
  )
}

// =============================================================================
// PHONE NUMBER 1 — Abhishek's version (commented out, do not delete)
// Removed from the UI. PhoneNumber2Screen is now the primary entry point.
// To restore: uncomment lines below and update the route in App.tsx.
// =============================================================================
// export function PhoneNumberScreen() {
//   const [editRow, setEditRow] = useState<PhoneNumberRow | null>(null)
//   const [testCallRow, setTestCallRow] = useState<PhoneNumberRow | null>(null)
//   const [importSource, setImportSource] = useState<'twilio' | 'sip' | null>(null)
// 
//   return (
//     <div className="flex h-full flex-col">
//       <TopNav initials="S" />
// 
//       <div className="flex flex-1 flex-col overflow-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between px-2xl py-xl">
//             <h1 className="text-h3 text-text-primary">Phone number</h1>
//             <div className="flex items-center gap-sm">
//               <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
//                 <Icon name="search" size={20} />
//               </button>
//               <ImportNumberButton onSelect={setImportSource} />
//               <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
//                 <Icon name="view_column" size={20} />
//               </button>
//               <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
//                 <Icon name="filter_list" size={20} />
//               </button>
//             </div>
//           </div>
// 
//           {/* Table */}
//           <div className="px-lg py-lg">
//             <DataTable
//               columns={COLUMNS}
//               data={DATA}
//               rowActions={[
//                 { icon: 'phone_in_talk', label: 'Test call', onClick: (row) => setTestCallRow(row) },
//                 { icon: 'edit',          label: 'Edit',      onClick: (row) => setEditRow(row) },
//               ]}
//             />
//           </div>
// 
//           <TestCallModal
//             open={testCallRow !== null}
//             phoneNumber={testCallRow?.phoneNumber ?? ''}
//             onClose={() => setTestCallRow(null)}
//           />
// 
//           <FormDrawer
//             open={editRow !== null}
//             title="Edit"
//             fields={EDIT_FIELDS}
//             submitLabel="Save"
//             initialValues={editRow ? {
//               name: editRow.name,
//               phoneNumber: editRow.phoneNumber,
//               connection: editRow.connection,
//               provider: editRow.provider,
//               numberType: 'Local',
//               numberId: 'phnum_29944',
//               purchasedOn: 'Apr 07, 2026',
//               routingMode: editRow.routingMode,
//               assignedAgents: editRow.assignedAgents,
//               locations: editRow.locations,
//             } : undefined}
//             onClose={() => setEditRow(null)}
//             onSubmit={() => setEditRow(null)}
//           />
// 
//           <FormDrawer
//             open={importSource === 'twilio'}
//             title="Import from Twilio"
//             fields={IMPORT_TWILIO_FIELDS}
//             submitLabel="Import"
//             requiredKeys={['name', 'phone', 'twilioSid', 'authToken']}
//             onClose={() => setImportSource(null)}
//             onSubmit={() => setImportSource(null)}
//           />
// 
//           <FormDrawer
//             open={importSource === 'sip'}
//             title="Import from SIP trunk"
//             fields={IMPORT_SIP_FIELDS}
//             submitLabel="Import"
//             requiredKeys={['name', 'phone', 'sipServer', 'sipPort', 'username', 'password']}
//             onClose={() => setImportSource(null)}
//             onSubmit={() => setImportSource(null)}
//           />
//       </div>
//     </div>
//   )
// }
// =============================================================================

