import { useEffect, useMemo, useState } from 'react'
import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { Icon } from '../Icon/Icon'
import { ProcedureListCard } from '../ProcedureListCard/ProcedureListCard'
import { ProcedurePickerDetailView } from './ProcedurePickerDetailView'
import {
  buildProcedureDetailDraft,
  type ProcedureDetailDraft,
} from './procedurePickerDetailData'
import type { ProceduresPickerDrawerProps } from './ProceduresPickerDrawer.types'

type DrawerView = 'list' | 'detail'

export function ProceduresPickerDrawer({
  open,
  procedures,
  selectedIds,
  onClose,
  onSave,
}: ProceduresPickerDrawerProps) {
  const [query, setQuery] = useState('')
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds)
  const [view, setView] = useState<DrawerView>('list')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [detailDrafts, setDetailDrafts] = useState<Record<string, ProcedureDetailDraft>>({})

  useEffect(() => {
    if (open) {
      setDraftIds(selectedIds)
      setQuery('')
      setView('list')
      setViewingId(null)
      setDetailDrafts({})
    }
  }, [open, selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return procedures
    return procedures.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    )
  }, [procedures, query])

  const viewingProcedure = viewingId
    ? procedures.find((p) => p.id === viewingId)
    : undefined

  const activeDetailDraft = viewingId
    ? detailDrafts[viewingId] ??
      (viewingProcedure
        ? buildProcedureDetailDraft(viewingId, viewingProcedure.title)
        : null)
    : null

  const toggle = (id: string) => {
    setDraftIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const openDetail = (id: string) => {
    const procedure = procedures.find((p) => p.id === id)
    if (!procedure) return
    setDetailDrafts((current) => ({
      ...current,
      [id]: current[id] ?? buildProcedureDetailDraft(id, procedure.title),
    }))
    setViewingId(id)
    setView('detail')
  }

  const closeDetail = () => {
    setView('list')
    setViewingId(null)
  }

  const saveDetail = (draft: ProcedureDetailDraft) => {
    setDetailDrafts((current) => ({ ...current, [draft.id]: draft }))
    closeDetail()
  }

  const handleOverlayClick = () => {
    if (view === 'detail') {
      closeDetail()
      return
    }
    onClose()
  }

  const handleBack = () => {
    if (view === 'detail') {
      closeDetail()
      return
    }
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={handleOverlayClick}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-[650px] max-w-[92vw] flex-col bg-surface shadow-dropdown transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {view === 'detail' && activeDetailDraft ? (
          <ProcedurePickerDetailView
            key={viewingId}
            draft={activeDetailDraft}
            onBack={closeDetail}
            onSave={saveDetail}
          />
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between px-2xl pb-lg pt-2xl">
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={handleBack}
                  className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
                >
                  <BackArrowIcon />
                </button>
                <h2 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">Procedures</h2>
              </div>
              <button
                type="button"
                onClick={() => onSave(draftIds)}
                className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
              >
                Save
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-md overflow-hidden px-2xl pb-2xl">
              <div className="flex h-9 shrink-0 items-center gap-sm rounded-sm border border-border-input bg-surface px-md">
                <Icon name="search" size={20} className="shrink-0 text-text-icon" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search procedure"
                  className="min-w-0 flex-1 bg-transparent text-body text-text-primary outline-none placeholder:text-text-tertiary"
                />
              </div>

              <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-body text-text-tertiary">
                    No procedures match your search.
                  </div>
                ) : (
                  filtered.map((procedure) => (
                    <ProcedureListCard
                      key={procedure.id}
                      title={procedure.title}
                      description={procedure.description}
                      selectable
                      selected={draftIds.includes(procedure.id)}
                      onToggle={() => toggle(procedure.id)}
                      onView={() => openDetail(procedure.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
