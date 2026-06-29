import { useState, useRef, useEffect } from 'react'
import { TopNav, Icon } from '../components'

// Uploaded procedure.svg icon
function ProcedureBookIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19.7996 6.30078H14.3996C13.9339 6.30078 13.4745 6.40922 13.058 6.6175C12.6414 6.82578 12.279 7.12819 11.9996 7.50078C11.7202 7.12819 11.3578 6.82578 10.9412 6.6175C10.5247 6.40922 10.0653 6.30078 9.59961 6.30078H4.19961C4.04048 6.30078 3.88787 6.364 3.77535 6.47652C3.66282 6.58904 3.59961 6.74165 3.59961 6.90078V17.7008C3.59961 17.8599 3.66282 18.0125 3.77535 18.125C3.88787 18.2376 4.04048 18.3008 4.19961 18.3008H9.59961C10.077 18.3008 10.5348 18.4904 10.8724 18.828C11.21 19.1656 11.3996 19.6234 11.3996 20.1008C11.3996 20.2599 11.4628 20.4125 11.5753 20.525C11.6879 20.6376 11.8405 20.7008 11.9996 20.7008C12.1587 20.7008 12.3114 20.6376 12.4239 20.525C12.5364 20.4125 12.5996 20.2599 12.5996 20.1008C12.5996 19.6234 12.7893 19.1656 13.1268 18.828C13.4644 18.4904 13.9222 18.3008 14.3996 18.3008H19.7996C19.9587 18.3008 20.1114 18.2376 20.2239 18.125C20.3364 18.0125 20.3996 17.8599 20.3996 17.7008V6.90078C20.3996 6.74165 20.3364 6.58904 20.2239 6.47652C20.1114 6.364 19.9587 6.30078 19.7996 6.30078ZM9.59961 17.1008H4.79961V7.50078H9.59961C10.077 7.50078 10.5348 7.69042 10.8724 8.02799C11.21 8.36555 11.3996 8.82339 11.3996 9.30078V17.7008C10.8808 17.3104 10.2489 17.0997 9.59961 17.1008ZM19.1996 17.1008H14.3996C13.7503 17.0997 13.1184 17.3104 12.5996 17.7008V9.30078C12.5996 8.82339 12.7893 8.36555 13.1268 8.02799C13.4644 7.69042 13.9222 7.50078 14.3996 7.50078H19.1996V17.1008Z" fill="currentColor"/>
    </svg>
  )
}
function ThreeDotMenu({ onEdit, onDuplicate, onDelete }: { onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-6 items-center justify-center rounded-sm text-text-icon transition-colors hover:bg-surface-selected"
      >
        <Icon name="more_vert" size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-xs min-w-[140px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
          <button type="button" className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover" onClick={() => { setOpen(false); onEdit() }}>Edit</button>
          <button type="button" className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover" onClick={() => { setOpen(false); onDuplicate() }}>Duplicate</button>
          <button type="button" className="block w-full px-md py-sm text-left text-body text-chip-danger-text hover:bg-surface-hover" onClick={() => { setOpen(false); onDelete() }}>Delete</button>
        </div>
      )}
    </div>
  )
}

import { useProcedureStore } from '../data/ProcedureStoreContext'
import { type Procedure } from '../data/procedureData'
import { ProcedureDetailScreen } from './ProcedureDetailScreen'

type ViewMode = 'grid' | 'list'

const HC_PROCEDURE_IDS = new Set([
  'hc-fd-02', 'hc-fd-05', 'hc-fd-06', 'hc-fd-11', 'hc-fd-12', 'hc-wl-01', 'hc-pv-01',
])

export function ProceduresScreen({ product = 'automotive' }: { product?: string }) {
  const { procedures, addProcedure, deleteProcedure } = useProcedureStore()
  const allProcedures = procedures.filter((p) => {
    if (product === 'dental') return HC_PROCEDURE_IDS.has(p.id) || p.category === 'Dental'
    if (product === 'healthcare') return HC_PROCEDURE_IDS.has(p.id)
    return !p.category.startsWith('Healthcare') && p.category !== 'Dental'
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  // null = list view; a Procedure = editing existing; 'new' = create flow.
  const [editing, setEditing] = useState<Procedure | 'new' | null>(null)

  if (editing) {
    return (
      <ProcedureDetailScreen
        procedure={editing === 'new' ? null : editing}
        onBack={() => setEditing(null)}
        product={product}
      />
    )
  }

  const q = searchQuery.trim().toLowerCase()
  const visibleProcedures = (!q
    ? allProcedures
    : allProcedures.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
  ).slice().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex-1 overflow-auto bg-surface">
        {/* Header — matches the Human actions header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface px-2xl py-xl">
          <h1 className="text-h3 text-text-primary">Procedures</h1>

          <div className="flex items-center gap-sm">
            {searchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Search procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-56 rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
            )}
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearchOpen((o) => !o)
                if (searchOpen) setSearchQuery('')
              }}
              className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon hover:bg-surface-l2"
            >
              <Icon name="search" size={20} />
            </button>

            {/* View toggle — same chrome as PageHeader's ViewToggle */}
            <div className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-sm">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView('grid')}
                className={`flex size-6 items-center justify-center rounded-sm transition-colors ${
                  view === 'grid' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'
                }`}
              >
                <Icon name="grid_view" size={18} />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView('list')}
                className={`flex size-6 items-center justify-center rounded-sm transition-colors ${
                  view === 'list' ? 'bg-surface-selected text-text-primary' : 'text-text-icon'
                }`}
              >
                <Icon name="table_rows" size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditing('new')}
              className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
            >
              Create new
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-2xl pb-2xl">
          {visibleProcedures.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-body text-text-tertiary">
              No procedures match your search.
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 gap-lg">
              {visibleProcedures.map((p) => (
                <ProcedureCard
                  key={p.id}
                  procedure={p}
                  onOpen={() => setEditing(p)}
                  onDuplicate={() => addProcedure({ ...p, id: `${p.id}-copy-${Date.now()}`, name: `${p.name} (copy)` })}
                  onDelete={() => deleteProcedure(p.id)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              {visibleProcedures.map((p, i) => (
                <ProcedureRow
                  key={p.id}
                  procedure={p}
                  first={i === 0}
                  onOpen={() => setEditing(p)}
                  onDuplicate={() => addProcedure({ ...p, id: `${p.id}-copy-${Date.now()}`, name: `${p.name} (copy)` })}
                  onDelete={() => deleteProcedure(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Grid card ───────────────────────────────────────────────────
interface CardProps {
  procedure: Procedure
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function ProcedureCard({ procedure, onOpen, onDuplicate, onDelete }: CardProps) {
  return (
    <div
      onClick={onOpen}
      className="group relative flex min-h-[160px] cursor-pointer flex-col rounded-md border border-border-selected bg-surface p-xl transition-colors hover:bg-surface-selected"
    >
      {/* Three-dot menu — top right */}
      <div className="absolute right-sm top-sm">
        <ThreeDotMenu onEdit={onOpen} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>

      <div className="mb-md">
        <ProcedureBookIcon size={22} className="text-text-secondary" />
      </div>

      <h3 className="mb-xs text-body text-text-primary">{procedure.name}</h3>
      <p className="line-clamp-2 text-body text-text-secondary">{procedure.description}</p>

      <div className="mt-auto flex items-center justify-end gap-xs pt-lg text-small text-text-tertiary">
        <Icon name="schedule" size={14} />
        {procedure.lastEdited}
      </div>
    </div>
  )
}

// ── List row ────────────────────────────────────────────────────
interface RowProps extends CardProps {
  first: boolean
}

function ProcedureRow({ procedure, first, onOpen, onDuplicate, onDelete }: RowProps) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-lg px-lg py-md transition-colors hover:bg-surface-hover ${
        first ? '' : 'border-t border-border'
      }`}
      onClick={onOpen}
    >
      <ProcedureBookIcon size={20} className="shrink-0 text-text-secondary" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-body text-text-primary">{procedure.name}</div>
        <div className="truncate text-small text-text-secondary">{procedure.description}</div>
      </div>
      <div className="flex shrink-0 items-center gap-xs text-small text-text-tertiary">
        <Icon name="schedule" size={14} />
        {procedure.lastEdited}
      </div>
      <ThreeDotMenu onEdit={onOpen} onDuplicate={onDuplicate} onDelete={onDelete} />
    </div>
  )
}
