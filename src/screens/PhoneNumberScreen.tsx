import { useEffect, useRef, useState } from 'react'
import { Icon, DataTable, FormDrawer, SelectMenu, TopNav, type Column } from '../components'

interface PhoneNumberRow {
  name: string
  phoneNumber: string
  connection: string
  routingMode: string
  assignedAgents: string
  locations: string
  provider: string
  [key: string]: string
}

const DATA: PhoneNumberRow[] = [
  { name: 'Main reception',   phoneNumber: '(202) 555-0123', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: 'Frontdesk',              locations: 'North Austin',  provider: 'Twilio'    },
  { name: 'Schedule line',    phoneNumber: '(303) 555-0198', connection: 'Call forwarding', routingMode: 'Overflow', assignedAgents: 'Scheduling & Frontdesk', locations: 'South Austin',  provider: 'Twilio'    },
  { name: 'Outreach',         phoneNumber: '(404) 555-0167', connection: 'SIP trunk',       routingMode: 'Overflow', assignedAgents: 'Pre-visit',              locations: 'San Francisco', provider: 'Vonage'    },
  { name: 'Outreach',         phoneNumber: '(505) 555-0189', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: '-',                      locations: '-',             provider: 'Twilio'    },
  { name: 'Patient services', phoneNumber: '(606) 555-0145', connection: 'Call forwarding', routingMode: 'IVR',      assignedAgents: 'Frontdesk & Waitlist',   locations: 'South Austin',  provider: 'Bandwidth' },
  { name: 'Insurance',        phoneNumber: '(707) 555-0132', connection: 'SIP trunk',       routingMode: 'IVR',      assignedAgents: 'Frontdesk',              locations: '-',             provider: 'Bandwidth' },
  { name: 'Night coverage',   phoneNumber: '(808) 555-0156', connection: 'Birdeye number',  routingMode: 'AI-first', assignedAgents: '-',                      locations: 'All locations', provider: 'Twilio'    },
  { name: 'Toll-free main',   phoneNumber: '(909) 555-0173', connection: 'Call forwarding', routingMode: 'Overflow', assignedAgents: 'Frontdesk & Pre-vist',   locations: 'All locations', provider: 'Twilio'    },
  { name: 'Insurance verify', phoneNumber: '(212) 555-0111', connection: 'Birdeye number',  routingMode: 'IVR',      assignedAgents: 'Scheduling',             locations: 'North Austin',  provider: 'Twilio'    },
  { name: 'Reminder line',    phoneNumber: '(415) 555-0100', connection: 'SIP trunk',       routingMode: 'AI-first', assignedAgents: '-',                      locations: '-',             provider: 'Vonage'    },
  { name: 'Billing',          phoneNumber: '(310) 555-0192', connection: 'Call forwarding', routingMode: 'IVR',      assignedAgents: 'Frontdesk',              locations: 'San Francisco', provider: 'Twilio'    },
]

const COLUMNS: Column<PhoneNumberRow>[] = [
  { key: 'name',           label: 'Name',            sortable: true },
  { key: 'phoneNumber',    label: 'Phone number',    sortable: true },
  { key: 'connection',     label: 'Connection',      sortable: true },
  { key: 'routingMode',    label: 'Routing mode',    sortable: true },
  { key: 'assignedAgents', label: 'Assigned agents', sortable: true },
  { key: 'locations',      label: 'Locations',       sortable: true },
  { key: 'provider',       label: 'Provider',        sortable: true },
]

const AGENT_OPTIONS = [
  { value: 'Frontdesk', label: 'Frontdesk' },
  { value: 'Scheduling', label: 'Scheduling' },
  { value: 'Pre-visit', label: 'Pre-visit' },
  { value: 'Waitlist', label: 'Waitlist' },
  { value: 'Reminder', label: 'Reminder' },
]

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

function ImportNumberButton({ onSelect }: { onSelect: (source: 'twilio' | 'sip') => void }) {
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
      >
        Import number
      </button>
      {open && (
        <div className="absolute right-0 top-[40px] z-50 min-w-[216px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
          <button
            type="button"
            onClick={() => { onSelect('twilio'); setOpen(false) }}
            className="block w-full px-md py-md text-left text-body text-text-primary hover:bg-surface-hover"
          >
            From Twilio
          </button>
          <button
            type="button"
            onClick={() => { onSelect('sip'); setOpen(false) }}
            className="block w-full px-md py-md text-left text-body text-text-primary hover:bg-surface-hover"
          >
            From SIP Trunk
          </button>
        </div>
      )}
    </div>
  )
}

const IMPORT_TWILIO_FIELDS = [
  { key: 'name',       label: 'Name',               type: 'text' as const, placeholder: 'Enter input' },
  { key: 'phone',      label: 'Phone number',       type: 'text' as const, placeholder: 'Enter input' },
  { key: 'twilioSid',  label: 'Twilio account SID', type: 'text' as const, placeholder: 'Enter input' },
  { key: 'authToken',  label: 'Auth token',         type: 'text' as const, placeholder: 'Enter input' },
]

const IMPORT_SIP_FIELDS = [
  { key: 'name',       label: 'Name',               type: 'text' as const, placeholder: 'Enter input' },
  { key: 'phone',      label: 'Phone number',       type: 'text' as const, placeholder: 'Enter input' },
  { key: 'sipServer',  label: 'SIP server address',  type: 'text' as const, placeholder: 'Enter input' },
  { key: 'sipPort',    label: 'SIP port',            type: 'text' as const, placeholder: 'Enter input' },
  { key: 'username',   label: 'Username',            type: 'text' as const, placeholder: 'Enter input' },
  { key: 'password',   label: 'Password',            type: 'text' as const, placeholder: 'Enter input' },
]

export function PhoneNumberScreen() {
  const [editRow, setEditRow] = useState<PhoneNumberRow | null>(null)
  const [testCallRow, setTestCallRow] = useState<PhoneNumberRow | null>(null)
  const [importSource, setImportSource] = useState<'twilio' | 'sip' | null>(null)

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
            <ImportNumberButton onSelect={setImportSource} />
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="view_column" size={20} />
            </button>
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="filter_list" size={20} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-lg py-lg">
          <DataTable
            columns={COLUMNS}
            data={DATA}
            rowActions={[
              { icon: 'phone_in_talk', label: 'Test call', onClick: (row) => setTestCallRow(row) },
              { icon: 'edit',          label: 'Edit',      onClick: (row) => setEditRow(row) },
            ]}
          />
        </div>
      </div>

      <TestCallModal
        open={testCallRow !== null}
        phoneNumber={testCallRow?.phoneNumber ?? ''}
        onClose={() => setTestCallRow(null)}
      />

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

      <FormDrawer
        open={importSource === 'twilio'}
        title="Import from Twilio"
        fields={IMPORT_TWILIO_FIELDS}
        submitLabel="Import"
        requiredKeys={['name', 'phone', 'twilioSid', 'authToken']}
        onClose={() => setImportSource(null)}
        onSubmit={() => setImportSource(null)}
      />

      <FormDrawer
        open={importSource === 'sip'}
        title="Import from SIP trunk"
        fields={IMPORT_SIP_FIELDS}
        submitLabel="Import"
        requiredKeys={['name', 'phone', 'sipServer', 'sipPort', 'username', 'password']}
        onClose={() => setImportSource(null)}
        onSubmit={() => setImportSource(null)}
      />
    </div>
  )
}
