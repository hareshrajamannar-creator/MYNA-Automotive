import { useEffect, useRef, useState } from 'react'
import { Icon, DataTable, FormDrawer, SelectMenu, TopNav, type Column } from '../components'

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
                agentMenuOpen ? 'border-primary' : 'border-border-selected'
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
const EDIT_FIELDS = [
  { key: 'name',           label: 'Name',            type: 'text'   as const },
  { key: 'phoneNumber',    label: 'Phone number',    type: 'text'   as const },
  { key: 'connection',     label: 'Connection',      type: 'select' as const, options: ['Birdeye number', 'Call forwarding', 'SIP trunk'] },
  { key: 'provider',       label: 'Provider',        type: 'select' as const, options: ['Twilio', 'Vonage', 'Bandwidth'] },
  { key: 'numberType',     label: 'Number type',     type: 'select' as const, options: ['Local', 'Toll-free', 'Mobile'] },
  { key: 'numberId',       label: 'Number ID',       type: 'text'   as const },
  { key: 'purchasedOn',    label: 'Purchased on',    type: 'text'   as const },
  { key: 'routingMode',    label: 'Routing mode',    type: 'select' as const, options: ['AI-first', 'Overflow', 'IVR'] },
  { key: 'assignedAgents', label: 'Assigned agents', type: 'select' as const, options: ['Frontdesk', 'Scheduling', 'Pre-visit', 'Scheduling & Frontdesk', 'Frontdesk & Waitlist', 'Frontdesk & Pre-vist'] },
  { key: 'locations',      label: 'Locations',       type: 'select' as const, options: ['North Austin', 'South Austin', 'San Francisco', 'All locations'] },
]
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
  connection: string
  routingMode: string
  assignedAgents: string
  locations: string
  provider: string
  status: string
  [key: string]: string
}

const DATA2: PhoneNumber2Row[] = [
  { name: 'Main reception',   phoneNumber: '(202) 555-0123', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: 'Frontdesk',              locations: 'North Austin',  provider: 'Twilio',    status: 'Active'  },
  { name: 'Schedule line',    phoneNumber: '(303) 555-0198', connection: 'Call forwarding', routingMode: 'Overflow', assignedAgents: 'Scheduling & Frontdesk', locations: 'South Austin',  provider: 'Twilio',    status: 'Active'  },
  { name: 'Outreach',         phoneNumber: '(404) 555-0167', connection: 'SIP trunk',       routingMode: 'Overflow', assignedAgents: 'Pre-visit',              locations: 'San Francisco', provider: 'Vonage',    status: 'Pending' },
  { name: 'Outreach',         phoneNumber: '(505) 555-0189', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: '-',                      locations: '-',             provider: 'Twilio',    status: 'Pending' },
  { name: 'Patient services', phoneNumber: '(606) 555-0145', connection: 'Call forwarding', routingMode: 'IVR',      assignedAgents: 'Frontdesk & Waitlist',   locations: 'South Austin',  provider: 'Bandwidth', status: 'Active'  },
  { name: 'Insurance',        phoneNumber: '(707) 555-0132', connection: 'SIP trunk',       routingMode: 'IVR',      assignedAgents: 'Frontdesk',              locations: '-',             provider: 'Bandwidth', status: 'Pending' },
  { name: 'Night coverage',   phoneNumber: '(808) 555-0156', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: '-',                      locations: 'All locations', provider: 'Twilio',    status: 'Active'  },
  { name: 'Toll-free main',   phoneNumber: '(909) 555-0173', connection: 'Call forwarding', routingMode: 'Overflow', assignedAgents: 'Frontdesk & Pre-visit',  locations: 'All locations', provider: 'Twilio',    status: 'Active'  },
]

const COLUMNS2: Column<PhoneNumber2Row>[] = [
  { key: 'name',           label: 'Name',            sortable: true },
  { key: 'phoneNumber',    label: 'Phone number',    sortable: true },
  { key: 'connection',     label: 'Connection',      sortable: true },
  { key: 'routingMode',    label: 'Routing mode',    sortable: true },
  { key: 'locations',      label: 'Locations',       sortable: true },
  { key: 'provider',       label: 'Provider',        sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (val) => (
      <span className={`flex items-center gap-xs text-body ${val === 'Active' ? 'text-success' : 'text-text-secondary'}`}>
        <span className={`size-2 rounded-full ${val === 'Active' ? 'bg-success' : 'bg-border-strong'}`} />
        {String(val)}
      </span>
    ),
  },
]

interface ForwardingRow {
  yourNumber: string
  birdeyeReceptionist: string
  location: string
  [key: string]: string
}

const FORWARDING_DATA: ForwardingRow[] = [
  { yourNumber: '(303) 555-0198', birdeyeReceptionist: '(512) 900-0001', location: 'South Austin'  },
  { yourNumber: '(404) 555-0167', birdeyeReceptionist: '(512) 900-0002', location: 'San Francisco' },
  { yourNumber: '(606) 555-0145', birdeyeReceptionist: '(512) 900-0003', location: 'South Austin'  },
  { yourNumber: '(707) 555-0132', birdeyeReceptionist: '(512) 900-0004', location: '—'             },
  { yourNumber: '(909) 555-0173', birdeyeReceptionist: '(512) 900-0005', location: 'All locations' },
]

const FORWARDING_COLUMNS: Column<ForwardingRow>[] = [
  { key: 'yourNumber',           label: 'Your number',            sortable: true },
  {
    key: 'birdeyeReceptionist',
    label: 'Birdeye receptionist',
    render: (val) => (
      <span className="flex items-center gap-sm">
        <span className="text-body text-text-primary">{String(val)}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(String(val)) }}
          className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-selected"
          title="Copy"
        >
          <Icon name="content_copy" size={14} />
        </button>
      </span>
    ),
  },
  { key: 'location', label: 'Location', sortable: true },
]

const LOCATION_OPTIONS = [
  { value: 'North Austin',  label: 'North Austin'  },
  { value: 'South Austin',  label: 'South Austin'  },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'All locations', label: 'All locations' },
]

const ROUTING_OPTIONS = [
  { value: 'AI-first', label: 'AI-first' },
  { value: 'Overflow', label: 'Overflow' },
  { value: 'IVR',      label: 'IVR'      },
]

const AGENT2_OPTIONS = [
  { value: 'Frontdesk',               label: 'Frontdesk'               },
  { value: 'Scheduling',              label: 'Scheduling'              },
  { value: 'Pre-visit',               label: 'Pre-visit'               },
  { value: 'Scheduling & Frontdesk',  label: 'Scheduling & Frontdesk'  },
  { value: 'Frontdesk & Waitlist',    label: 'Frontdesk & Waitlist'    },
]

const TRANSPORT_OPTIONS = [
  { value: 'TCP', label: 'TCP' },
  { value: 'UDP', label: 'UDP' },
  { value: 'TLS', label: 'TLS' },
]

type ImportStep = 1 | 2 | 3
type ImportType = 'birdeye' | 'sip'

interface ImportState {
  type: ImportType
  // step 1 — sip fields
  phoneNumber: string
  terminationUri: string
  sipUsername: string
  sipPassword: string
  nickname: string
  transport: string
  // step 2 — mapping
  name: string
  existingNumber: string
  location: string
  routingMode: string
  assignedAgent: string
  // step 3
  confirmed: boolean
}

const EMPTY_IMPORT: ImportState = {
  type: 'birdeye',
  phoneNumber: '', terminationUri: '', sipUsername: '', sipPassword: '',
  nickname: '', transport: 'TCP',
  name: '', existingNumber: '',
  location: '', routingMode: '', assignedAgent: '',
  confirmed: false,
}

function StepDots({ step }: { step: ImportStep }) {
  const labels = ['Connect', 'Map', 'Verify']
  return (
    <div className="flex items-center gap-0 px-2xl py-lg">
      {labels.map((label, i) => {
        const n = (i + 1) as ImportStep
        const done = step > n
        const active = step === n
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-xs">
              <div className={`flex size-6 items-center justify-center rounded-full border-2 text-small ${
                done || active ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-secondary'
              }`}>
                {done ? <Icon name="check" size={12} /> : n}
              </div>
              <span className={`whitespace-nowrap text-small ${active ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</span>
            </div>
            {i < 2 && (
              <div className={`mb-4 h-px w-16 ${step > n ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ImportDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (row: PhoneNumber2Row) => void }) {
  const [step, setStep] = useState<ImportStep>(1)
  const [form, setForm] = useState<ImportState>(EMPTY_IMPORT)
  const [transportOpen, setTransportOpen] = useState(false)
  const [locationOpen, setLocationOpen]   = useState(false)
  const [routingOpen,  setRoutingOpen]    = useState(false)
  const [agentOpen,    setAgentOpen]      = useState(false)
  const [locationAnchor, setLocationAnchor] = useState<{ top: number; left: number; width: number } | null>(null)
  const [routingAnchor,  setRoutingAnchor]  = useState<{ top: number; left: number; width: number } | null>(null)
  const [agentAnchor,    setAgentAnchor]    = useState<{ top: number; left: number; width: number } | null>(null)
  const transportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) { setStep(1); setForm(EMPTY_IMPORT) }
  }, [open])

  useEffect(() => {
    if (!transportOpen) return
    function h(e: MouseEvent) { if (transportRef.current && !transportRef.current.contains(e.target as Node)) setTransportOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [transportOpen])

  function openDropdown(
    e: React.MouseEvent<HTMLButtonElement>,
    setter: (a: { top: number; left: number; width: number }) => void,
    openSetter: (v: boolean) => void,
    isOpen: boolean,
  ) {
    if (isOpen) { openSetter(false); return }
    const r = e.currentTarget.getBoundingClientRect()
    setter({ top: r.bottom + 4, left: r.left, width: r.width })
    openSetter(true)
  }

  if (!open) return null

  const step1Valid = form.type === 'birdeye' || (form.phoneNumber.trim() !== '' && form.terminationUri.trim() !== '')
  const step2Valid = form.name.trim() !== '' && form.location !== '' && form.routingMode !== '' && form.assignedAgent !== '' && (form.type === 'sip' || form.existingNumber.trim() !== '')

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 flex h-full w-[650px] flex-col bg-surface shadow-modal">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-2xl py-lg">
          <span className="text-h3 text-text-primary">Import number</span>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Step dots */}
        <StepDots step={step} />

        <div className="h-px bg-border" />

        {/* Body */}
        <div className="flex flex-1 flex-col gap-md overflow-y-auto px-2xl py-lg">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              {/* Connection type — two side-by-side cards */}
              <div className="flex flex-col gap-xs">
                <span className="text-small text-text-primary">Connection type</span>
                <div className="flex gap-md">
                  {(['birdeye', 'sip'] as ImportType[]).map((t) => (
                    <label
                      key={t}
                      className={`flex flex-1 cursor-pointer items-start gap-sm rounded-sm border p-md transition-colors ${
                        form.type === t ? 'border-primary bg-surface' : 'border-border bg-surface hover:bg-surface-l2'
                      }`}
                    >
                      <input
                        type="radio"
                        name="connType"
                        checked={form.type === t}
                        onChange={() => setForm((f) => ({ ...f, type: t }))}
                        className="mt-[3px] shrink-0 accent-primary"
                      />
                      <div className="flex flex-col gap-xs">
                        <span className="text-body text-text-primary">
                          {t === 'birdeye' ? 'Import Twilio number' : 'SIP trunk'}
                        </span>
                        <p className="text-small text-text-secondary">
                          {t === 'birdeye' ? 'Buy a new Twilio-powered number' : 'Bring your existing line'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>


              {form.type === 'birdeye' && (
                <div className="flex items-start gap-md rounded-sm bg-surface-selected p-md">
                  <Icon name="info" size={18} className="mt-[2px] shrink-0 text-primary" />
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-primary">Your Twilio receptionist number</span>
                    <div className="flex items-center gap-sm">
                      <span className="text-body text-text-primary">(512) 900-0002</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('(512) 900-0002')}
                        className="flex items-center gap-xs rounded-sm border border-border-selected bg-surface px-sm py-xs text-small text-text-action hover:bg-surface-l2"
                      >
                        <Icon name="content_copy" size={12} /> Copy
                      </button>
                    </div>
                    <span className="text-small text-text-secondary">This number will be assigned to your line. You can map it to a location in the next step.</span>
                  </div>
                </div>
              )}

              {form.type === 'sip' && (
                <>
                  {/* Phone number + E.164 */}
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-small text-text-primary">Phone number</span>
                      <button type="button" className="flex items-center gap-xs text-small text-text-action hover:underline">
                        Format to E.164 <Icon name="expand_more" size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={form.phoneNumber}
                      onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                      className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Termination URI */}
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-primary">Termination URI</span>
                    <input
                      type="text"
                      placeholder="Enter termination URI (NOT Retell SIP server uri)"
                      value={form.terminationUri}
                      onChange={(e) => setForm((f) => ({ ...f, terminationUri: e.target.value }))}
                      className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* SIP username */}
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-primary">SIP trunk user name <span className="text-text-tertiary">(Optional)</span></span>
                    <input
                      type="text"
                      placeholder="Enter SIP trunk user name"
                      value={form.sipUsername}
                      onChange={(e) => setForm((f) => ({ ...f, sipUsername: e.target.value }))}
                      className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* SIP password */}
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-primary">SIP trunk password <span className="text-text-tertiary">(Optional)</span></span>
                    <input
                      type="password"
                      placeholder="Enter SIP trunk password"
                      value={form.sipPassword}
                      onChange={(e) => setForm((f) => ({ ...f, sipPassword: e.target.value }))}
                      className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Nickname */}
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-primary">Nickname <span className="text-text-tertiary">(Optional)</span></span>
                    <input
                      type="text"
                      placeholder="Enter nickname"
                      value={form.nickname}
                      onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                      className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              {/* Name */}
              <div className="flex flex-col gap-xs">
                <span className="text-small text-text-primary">Name</span>
                <input
                  type="text"
                  placeholder="e.g. Main reception"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>

              {/* Existing number (Birdeye path only) */}
              {form.type === 'birdeye' && (
                <div className="flex flex-col gap-xs">
                  <span className="text-small text-text-primary">Your existing phone number</span>
                  <input
                    type="text"
                    placeholder="e.g. (404) 555-0167"
                    value={form.existingNumber}
                    onChange={(e) => setForm((f) => ({ ...f, existingNumber: e.target.value }))}
                    className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                  />
                  <span className="text-small text-text-secondary">The number your patients currently dial</span>
                </div>
              )}

              {/* Location */}
              <div className="flex flex-col gap-xs">
                <span className="text-small text-text-primary">Location</span>
                <button
                  type="button"
                  onClick={(e) => openDropdown(e, setLocationAnchor, setLocationOpen, locationOpen)}
                  className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${locationOpen ? 'border-primary' : 'border-border-selected'}`}
                >
                  <span className={`flex-1 truncate text-left text-body ${form.location ? 'text-text-primary' : 'text-text-tertiary'}`}>
                    {form.location || 'Select location'}
                  </span>
                  <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
                </button>
              </div>

              {/* Routing mode */}
              <div className="flex flex-col gap-xs">
                <span className="text-small text-text-primary">Routing mode</span>
                <button
                  type="button"
                  onClick={(e) => openDropdown(e, setRoutingAnchor, setRoutingOpen, routingOpen)}
                  className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${routingOpen ? 'border-primary' : 'border-border-selected'}`}
                >
                  <span className={`flex-1 truncate text-left text-body ${form.routingMode ? 'text-text-primary' : 'text-text-tertiary'}`}>
                    {form.routingMode || 'Select routing mode'}
                  </span>
                  <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
                </button>
              </div>

              {/* Assigned agent */}
              <div className="flex flex-col gap-xs">
                <span className="text-small text-text-primary">Assigned agents</span>
                <button
                  type="button"
                  onClick={(e) => openDropdown(e, setAgentAnchor, setAgentOpen, agentOpen)}
                  className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${agentOpen ? 'border-primary' : 'border-border-selected'}`}
                >
                  <span className={`flex-1 truncate text-left text-body ${form.assignedAgent ? 'text-text-primary' : 'text-text-tertiary'}`}>
                    {form.assignedAgent || 'Select agent'}
                  </span>
                  <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
                </button>
              </div>

            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              {/* Routing summary */}
              <div className="flex flex-col gap-sm rounded-sm border border-border bg-surface-selected p-md">
                <div className="flex items-center gap-sm">
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-secondary">Your existing number</span>
                    <span className="text-body text-text-primary">{form.existingNumber || form.phoneNumber || '(404) 555-0167'}</span>
                  </div>
                  <Icon name="arrow_forward" size={18} className="mx-sm shrink-0 text-text-icon" />
                  <div className="flex flex-col gap-xs">
                    <span className="text-small text-text-secondary">Birdeye proxy number</span>
                    <span className="text-body text-text-primary">(512) 900-0002</span>
                  </div>
                </div>
              </div>

              {/* Instruction */}
              <div className="rounded-sm border border-border p-md">
                <p className="text-small text-text-secondary">
                  Contact your provider (Verizon, Comcast, AT&T, Frontier, etc.) and ask them to forward your number to the Birdeye proxy number above.
                </p>
              </div>

              {/* Test call inline */}
              <div className="flex flex-col gap-md rounded-sm border border-border p-md">
                <span className="text-small text-text-primary">Test your setup</span>

                <div className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-md">
                  <Icon name="phone" size={16} className="shrink-0 text-text-icon" />
                  <span className="text-body text-text-secondary">+1</span>
                  <span className="mx-xs h-4 w-px bg-border" />
                  <span className="text-body text-text-tertiary">{form.existingNumber || form.phoneNumber || '(404) 555-0167'}</span>
                </div>

                <button
                  type="button"
                  className="flex h-9 items-center justify-center gap-sm rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
                >
                  <Icon name="phone_in_talk" size={16} className="text-text-icon" />
                  Start test call
                </button>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex cursor-pointer items-start gap-sm">
                <input
                  type="checkbox"
                  checked={form.confirmed}
                  onChange={(e) => setForm((f) => ({ ...f, confirmed: e.target.checked }))}
                  className="mt-[3px] accent-primary"
                />
                <span className="text-body text-text-primary">
                  I have set up call forwarding with my phone service provider and tested it
                </span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-2xl py-lg">
          {/* Outbound transport (step 1 SIP only) */}
          {step === 1 && form.type === 'sip' ? (
            <div className="relative" ref={transportRef}>
              <button
                type="button"
                onClick={() => setTransportOpen((o) => !o)}
                className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary hover:bg-surface-l2"
              >
                Outbound transport: {form.transport}
                <Icon name="expand_more" size={16} className="text-text-icon" />
              </button>
              {transportOpen && (
                <div className="absolute bottom-[44px] left-0 z-50 min-w-[180px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                  {TRANSPORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, transport: o.value })); setTransportOpen(false) }}
                      className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : <div />}

          <div className="flex items-center gap-sm">
            {step > 1 && (
              <button type="button" onClick={() => setStep((s) => (s - 1) as ImportStep)} className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary hover:bg-surface-l2">
                <Icon name="arrow_back" size={16} /> Back
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-sm px-md py-xs text-body text-text-action hover:bg-surface-hover">
              Cancel
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as ImportStep)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className={`flex h-9 items-center gap-xs rounded-sm px-lg text-body text-white transition-colors ${
                  (step === 1 ? !step1Valid : !step2Valid)
                    ? 'cursor-not-allowed bg-surface-selected text-text-tertiary'
                    : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                Next <Icon name="arrow_forward" size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!form.confirmed) return
                  onSave({
                    name:           form.name,
                    phoneNumber:    form.type === 'birdeye' ? form.existingNumber : form.phoneNumber,
                    connection:     form.type === 'birdeye' ? 'Call forwarding' : 'SIP trunk',
                    routingMode:    form.routingMode,
                    assignedAgents: form.assignedAgent,
                    locations:      form.location,
                    provider:       'Twilio',
                    status:         'Active',
                  })
                  onClose()
                }}
                disabled={!form.confirmed}
                className={`flex h-9 items-center rounded-sm px-lg text-body text-white transition-colors ${
                  !form.confirmed
                    ? 'cursor-not-allowed bg-surface-selected text-text-tertiary'
                    : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating dropdowns */}
      {locationOpen && locationAnchor && (
        <>
          <div className="fixed inset-0 z-[125]" onClick={() => setLocationOpen(false)} />
          <div className="fixed z-[130]" style={{ top: locationAnchor.top, left: locationAnchor.left, width: locationAnchor.width }}>
            <SelectMenu options={LOCATION_OPTIONS} value={form.location ? [form.location] : []} onChange={(v) => { setForm((f) => ({ ...f, location: v[0] ?? '' })); setLocationOpen(false) }} />
          </div>
        </>
      )}
      {routingOpen && routingAnchor && (
        <>
          <div className="fixed inset-0 z-[125]" onClick={() => setRoutingOpen(false)} />
          <div className="fixed z-[130]" style={{ top: routingAnchor.top, left: routingAnchor.left, width: routingAnchor.width }}>
            <SelectMenu options={ROUTING_OPTIONS} value={form.routingMode ? [form.routingMode] : []} onChange={(v) => { setForm((f) => ({ ...f, routingMode: v[0] ?? '' })); setRoutingOpen(false) }} />
          </div>
        </>
      )}
      {agentOpen && agentAnchor && (
        <>
          <div className="fixed inset-0 z-[125]" onClick={() => setAgentOpen(false)} />
          <div className="fixed z-[130]" style={{ top: agentAnchor.top, left: agentAnchor.left, width: agentAnchor.width }}>
            <SelectMenu options={AGENT2_OPTIONS} value={form.assignedAgent ? [form.assignedAgent] : []} onChange={(v) => { setForm((f) => ({ ...f, assignedAgent: v[0] ?? '' })); setAgentOpen(false) }} />
          </div>
        </>
      )}
    </div>
  )
}


export function PhoneNumber2Screen() {
  const [rows, setRows] = useState<PhoneNumber2Row[]>(DATA2)
  const [importOpen, setImportOpen] = useState(false)
  const [editRow, setEditRow] = useState<PhoneNumber2Row | null>(null)
  const [testCallRow, setTestCallRow] = useState<PhoneNumber2Row | null>(null)
  const [forwardingOpen, setForwardingOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-2xl py-xl">
        <h1 className="text-h3 text-text-primary">Phone number</h1>
        <div className="flex items-center gap-sm">
          <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
            <Icon name="search" size={20} />
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
          >
            Import number
          </button>
          <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
            <Icon name="view_column" size={20} />
          </button>
          <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
            <Icon name="filter_list" size={20} />
          </button>
        </div>
      </div>

      {/* Main table */}
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

      {/* Forwarding reference */}
      <div className="px-lg py-lg">
        <div className="rounded-md border border-border bg-surface p-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">Call forwarding reference</h3>
            <button
              type="button"
              onClick={() => setForwardingOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
            >
              <Icon name={forwardingOpen ? 'expand_less' : 'expand_more'} size={20} />
            </button>
          </div>
          {forwardingOpen && (
            <div className="mt-2xl">
              <p className="mb-md text-small text-text-secondary">Share Birdeye receptionist numbers with your telephony provider</p>
              <DataTable columns={FORWARDING_COLUMNS} data={FORWARDING_DATA} />
            </div>
          )}
        </div>
      </div>

      </div>

      {/* Edit drawer */}
      <FormDrawer
        open={editRow !== null}
        title="Edit"
        fields={EDIT_FIELDS}
        submitLabel="Save"
        initialValues={editRow ? {
          name: editRow.name,
          phoneNumber: editRow.phoneNumber,
          connection: editRow.connection,
          provider: editRow.provider,
          numberType: 'Local',
          numberId: 'phnum_29944',
          purchasedOn: 'Apr 07, 2026',
          routingMode: editRow.routingMode,
          assignedAgents: editRow.assignedAgents,
          locations: editRow.locations,
        } : undefined}
        onClose={() => setEditRow(null)}
        onSubmit={() => setEditRow(null)}
      />

      {/* Test call modal */}
      <TestCallModal
        open={testCallRow !== null}
        phoneNumber={testCallRow?.phoneNumber ?? ''}
        onClose={() => setTestCallRow(null)}
      />

      {/* 3-step import drawer */}
      <ImportDrawer
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSave={(row) => setRows((prev) => [...prev, row])}
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

