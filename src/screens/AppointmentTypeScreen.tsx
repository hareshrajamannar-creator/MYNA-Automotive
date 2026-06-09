import { useState } from 'react'
import { DataTable, Icon, TopNav, type Column } from '../components'

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
interface ApptTypeRow {
  name: string
  description: string
  duration: string
  providers: string
  pmsMapping: string
  recognitionHints: string
  recognitionExtra?: string
  active: boolean
  dimmed?: boolean
  [key: string]: string | boolean | undefined
}

const APPT_TYPES: ApptTypeRow[] = [
  { name: 'New Patient Exam',         description: 'Comprehensive initial exam + X-rays',       duration: '60 min', providers: 'Dr. Sarah Chen, +1 more', pmsMapping: 'D0210', recognitionHints: '"new patient"', recognitionExtra: '+1 more', active: true  },
  { name: 'Routine Cleaning',         description: 'Prophylaxis + polishing',                   duration: '45 min', providers: 'All',                     pmsMapping: 'D0210', recognitionHints: '"filling"',                              active: true  },
  { name: 'Emergency Visit',          description: 'Urgent pain or dental injury',              duration: '30 min', providers: 'Dr. Marcus Rivera',       pmsMapping: 'D0210', recognitionHints: '"emergency"',    recognitionExtra: '+1 more', active: true  },
  { name: 'Invisalign Consultation',  description: 'Orthodontic assessment + treatment plan',  duration: '60 min', providers: 'Dr. Sarah Chen, +1 more', pmsMapping: 'D0210', recognitionHints: '"filling"',                              active: true  },
  { name: 'Tooth Filling',            description: 'Composite or amalgam restoration',          duration: '45 min', providers: 'Dr. Marcus Rivera',       pmsMapping: 'D0210', recognitionHints: '"filling"',                              active: true  },
  { name: 'Whitening Treatment',      description: 'In-office bleaching session',               duration: '60 min', providers: 'Dr. Sarah Chen, +1 more', pmsMapping: 'D0210', recognitionHints: '"filling"',                              active: false },
  { name: 'Invisalign Consultation',  description: 'Orthodontic assessment + treatment plan',  duration: '45 min', providers: 'All',                     pmsMapping: 'D0210', recognitionHints: '"emergency"',    recognitionExtra: '+1 more', active: true  },
  { name: 'Emergency Visit',          description: 'Urgent pain or dental injury',              duration: '60 min', providers: 'Dr. Marcus Rivera',       pmsMapping: 'D0210', recognitionHints: '"new patient"',  recognitionExtra: '+1 more', active: true  },
  { name: 'Routine Cleaning',         description: 'Prophylaxis + polishing',                   duration: '45 min', providers: 'All',                     pmsMapping: 'D0210', recognitionHints: '"filling"',                              active: true  },
  { name: 'New Patient Exam',         description: 'Comprehensive initial exam + X-rays',       duration: '60 min', providers: 'Dr. Marcus Rivera',       pmsMapping: 'D0210', recognitionHints: '"emergency"',    recognitionExtra: '+1 more', active: true  },
  { name: 'Tooth Filling',            description: 'Composite or amalgam restoration',          duration: '45 min', providers: 'All',                     pmsMapping: 'D0210', recognitionHints: '"filling"',                              active: true  },
]

// ── Drawer ────────────────────────────────────────────────────────────────────
interface DrawerProps {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
}
function ApptTypeDrawer({ open, mode, onClose }: DrawerProps) {
  const [displayName, setDisplayName] = useState(mode === 'edit' ? 'New Patient Exam' : '')
  const [description, setDescription] = useState(mode === 'edit' ? 'Comprehensive initial exam + X-rays' : '')
  const [duration, setDuration] = useState(mode === 'edit' ? '30 min' : '30 min')
  const [mappingType, setMappingType] = useState(mode === 'edit' ? 'Appointment type' : 'None')
  const [pmsExpanded, setPmsExpanded] = useState(mode === 'edit')
  const [tags, setTags] = useState<string[]>(mode === 'edit' ? ['new patient', 'first visit'] : [])
  const [tagInput, setTagInput] = useState('')

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(t => [...t, tagInput.trim()])
      setTagInput('')
    }
  }
  function removeTag(idx: number) {
    setTags(t => t.filter((_, i) => i !== idx))
  }

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
            <span className="text-h3 text-text-primary">{mode === 'create' ? 'Create new' : 'Edit'}</span>
          </div>
          <button type="button" className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover">
            Save
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-lg overflow-auto p-2xl">
          {/* Location */}
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <label className="text-small text-text-secondary">Location <span className="text-danger">*</span></label>
              <Icon name="info" size={14} className="text-text-tertiary" />
            </div>
            <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
              <option>San Francisco, CA</option>
            </select>
          </div>

          {/* Display name */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Display name <span className="text-danger">*</span></label>
            <input
              className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none"
              placeholder="Enter"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Description <span className="text-danger">*</span></label>
            <textarea
              className="min-h-[80px] rounded-sm border border-border px-md py-sm text-body text-text-primary focus:border-primary focus:outline-none"
              placeholder="Enter"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Duration</label>
            <select
              className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            >
              <option>15 min</option>
              <option>30 min</option>
              <option>45 min</option>
              <option>60 min</option>
              <option>90 min</option>
            </select>
          </div>

          {/* Eligible providers */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Eligible providers</label>
            <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
              <option value="">{mode === 'edit' ? 'Dr. Sarah Chen' : 'Select'}</option>
            </select>
          </div>

          {/* Recognition hints */}
          <div className="flex flex-col gap-xs">
            <label className="text-small text-text-secondary">Recognition hints <span className="text-danger">*</span></label>
            <div className="flex min-h-[36px] flex-wrap items-center gap-xs rounded-sm border border-border px-md py-xs focus-within:border-primary">
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-xs rounded-full bg-surface-selected px-sm py-0.5 text-small text-text-primary">
                  {tag}
                  <button type="button" onClick={() => removeTag(i)} className="text-text-tertiary hover:text-text-primary">
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
            <p className="text-xs text-text-tertiary">Phrases that assist the agent in identifying this type</p>
          </div>

          {/* PMS mapping accordion */}
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
                <div className="flex flex-col gap-xs">
                  <label className="text-small text-text-secondary">Mapping type</label>
                  <select
                    className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none"
                    value={mappingType}
                    onChange={e => setMappingType(e.target.value)}
                  >
                    <option>None</option>
                    <option>Appointment type</option>
                  </select>
                </div>
                {mappingType === 'Appointment type' && (
                  <div className="flex flex-col gap-xs">
                    <label className="text-small text-text-secondary">PMS appointment type</label>
                    <select className="h-9 rounded-sm border border-border pl-md pr-2xl text-body text-text-primary focus:border-primary focus:outline-none">
                      <option>D0210 - Comprehensive oral evaluation</option>
                    </select>
                  </div>
                )}
                <p className="text-small text-text-secondary">Links this type to a code in your PMS. The mapped code's duration sets the maximum allowed below.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── AppointmentTypeScreen ─────────────────────────────────────────────────────
export function AppointmentTypeScreen() {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [activeMap, setActiveMap] = useState<Record<number, boolean>>(
    Object.fromEntries(APPT_TYPES.map((r, i) => [i, r.active]))
  )

  const COLUMNS: Column<ApptTypeRow>[] = [
    {
      key: 'name', label: 'Name', width: 250,
      render: (_v, row) => (
        <div>
          <div className="text-body text-text-primary">{row.name as string}</div>
          <div className="text-xs text-text-tertiary">{row.description as string}</div>
        </div>
      ),
    },
    { key: 'duration',      label: 'Duration',          width: 100 },
    { key: 'providers',     label: 'Providers',         width: 180 },
    { key: 'pmsMapping',    label: 'PMS mapping',       width: 140 },
    {
      key: 'recognitionHints', label: 'Recognition hints', width: 200,
      render: (_v, row) => (
        <span>
          {row.recognitionHints as string}
          {row.recognitionExtra && (
            <span className="text-text-tertiary">, {row.recognitionExtra as string}</span>
          )}
        </span>
      ),
    },
    {
      key: 'active', label: 'Active', width: 80,
      render: (_v, row) => {
        const idx = APPT_TYPES.indexOf(row as ApptTypeRow)
        return (
          <Toggle
            value={activeMap[idx] ?? false}
            onChange={v => setActiveMap(m => ({ ...m, [idx]: v }))}
          />
        )
      },
    },
  ]

  const rowMenuItems = [
    { label: 'Edit',   onClick: () => setEditDrawerOpen(true) },
    { label: 'Delete', onClick: () => {} },
  ]

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex flex-1 flex-col overflow-auto bg-surface">
        {/* Page header */}
        <div className="flex items-center justify-between bg-surface px-2xl py-xl">
          <div className="flex flex-col gap-xs">
            <span className="text-h2 text-text-primary">9 Appointment types</span>
          </div>
          <div className="flex items-center gap-sm">
            <button type="button" className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2">
              <Icon name="search" size={20} />
            </button>
            <select className="h-9 rounded-sm border border-border-selected bg-surface pl-md pr-2xl text-body text-text-primary hover:bg-surface-l2 focus:outline-none">
              <option>All locations</option>
            </select>
            <button type="button" className="flex h-9 items-center gap-sm rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2">
              <Icon name="refresh" size={18} />
              Sync from PMS
            </button>
            <button
              type="button"
              onClick={() => setCreateDrawerOpen(true)}
              className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
            >
              Create new
            </button>
          </div>
        </div>

        <div className="px-2xl pb-2xl">
          <DataTable
            columns={COLUMNS}
            data={APPT_TYPES}
            rowMenuItems={rowMenuItems}
            rowClassName={(_row, i) => (activeMap[i] === false ? 'opacity-40' : '')}
          />
        </div>
      </div>

      <ApptTypeDrawer open={createDrawerOpen} mode="create" onClose={() => setCreateDrawerOpen(false)} />
      <ApptTypeDrawer open={editDrawerOpen}   mode="edit"   onClose={() => setEditDrawerOpen(false)}   />
    </div>
  )
}
