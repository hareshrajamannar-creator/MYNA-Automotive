import React, { useState, useRef, useEffect, useCallback } from 'react'
import { TopNav, Icon, RefChip, ContextModal, EmptyHintField, SelectMenu } from '../components'
import StepsEditorToolbar from '../workflow/Molecules/Inputs/StepsEditorToolbar/StepsEditorToolbar'
import type { ContextModalResult } from '../components/ContextModal/ContextModal.types'
import { BackArrowIcon } from '../assets/BackArrowIcon'
import UserPromptInput from '../workflow/Molecules/Inputs/UserPromptInput/UserPromptInput'
import AddToolDrawer from '../workflow/Organisms/Drawers/AddToolDrawer/AddToolDrawer'
import { type Procedure, type ProcedureStep, type ContextItem, type RefKind, type Token } from '../data/procedureData'
import { useProcedureStore } from '../data/ProcedureStoreContext'

function parseStepsText(text: string): ProcedureStep[] {
  if (!text.trim()) return []
  return text
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => ({ title: l.replace(/^[\d•.\-\s]+/, '').trim(), bullets: [] }))
}

function stepsToEditorText(steps: ProcedureStep[]): string {
  return steps
    .map((step, i) => {
      const bullets = step.bullets
        .map((b) => {
          const content = b.tokens
            .map((t) => (typeof t === 'string' ? t : `{{${t.label}}}`))
            .join('')
          return content.trim() ? `• ${content.trim()}` : ''
        })
        .filter(Boolean)
        .join('\n')
      return bullets ? `${i + 1}. ${step.title}\n${bullets}` : `${i + 1}. ${step.title}`
    })
    .join('\n')
}

interface ProcedureDetailScreenProps {
  /** null = create a new procedure. */
  procedure: Procedure | null
  onBack: () => void
  product?: string
}

const TITLE_PLACEHOLDER = 'Enter procedure title'

const WHEN_PLACEHOLDER = `Describe the trigger that should activate this procedure.

Examples:
• Customer wants to reschedule an appointment
• User reports a payment issue`

const STEPS_PLACEHOLDER = `Start writing instructions…
Type "/" to insert a tool, field, or procedure.`


const STEPS_FIELD_MIN_HEIGHT = 360

export function ProcedureDetailScreen({ procedure, onBack, product = 'automotive' }: ProcedureDetailScreenProps) {
  const { addProcedure, updateProcedure, deleteProcedure } = useProcedureStore()
  const isNew = procedure === null
  const isHC = product === 'healthcare' || product === 'dental'
  const defaultCategory = isHC ? 'Healthcare Frontdesk' : 'Inbound General'

  const [title, setTitle] = useState(procedure?.name ?? '')
  const [whenToUse, setWhenToUse] = useState(procedure?.whenToUse ?? '')
  const [queue, setQueue] = useState<'Inbound' | 'Outbound'>(procedure?.queue ?? 'Inbound')
  const [queueMenuOpen, setQueueMenuOpen] = useState(false)
  const [queueAnchor, setQueueAnchor] = useState<{ top: number; left: number; width: number } | null>(null)
  const initialStepsText = stepsToEditorText(procedure?.steps ?? [])
  const [stepsText, setStepsText] = useState(initialStepsText)
  const [context, setContext] = useState<ContextItem[]>(procedure?.context ?? [])
  const [showAllContext, setShowAllContext] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [contextModalOpen, setContextModalOpen] = useState(false)
  const [toolPickerOpen, setToolPickerOpen] = useState(false)

  function handleContextSave(result: ContextModalResult) {
    const items: ContextItem[] = []
    result.fields
      .filter((f) => f.enabled)
      .forEach((f) => items.push({ kind: 'context', label: f.name.replace(/\s+/g, '.') }))
    result.knowledge.files.forEach((f) => items.push({ kind: 'file', label: f.name }))
    result.knowledge.links.forEach((l) => items.push({ kind: 'link', label: l.url }))
    result.brandItems
      .filter((b) => b.enabled)
      .forEach((b) => items.push({ kind: 'context', label: b.name }))
    if (result.industryEnabled) items.push({ kind: 'context', label: 'Industry.context' })
    setContext(items)
  }

  function handleSave() {
    const now = new Date()
    const saved: Procedure = {
      id: isNew ? `p-${Date.now()}` : procedure!.id,
      name: title.trim() || 'Untitled procedure',
      category: procedure?.category ?? defaultCategory,
      queue,
      channels: procedure?.channels ?? [],
      description: whenToUse.trim().split(/[.!?]/)[0].trim() || title.trim() || 'No description',
      lastEdited: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      whenToUse: whenToUse.trim(),
      steps: parseStepsText(stepsText),
      tools: procedure?.tools ?? [],
      context,
    }
    if (isNew) {
      addProcedure(saved)
    } else {
      updateProcedure(saved)
    }
    onBack()
  }

  function handleDelete() {
    if (procedure) deleteProcedure(procedure.id)
    setActionsOpen(false)
    onBack()
  }

  const dirty = isNew
    ? Boolean(title.trim() || whenToUse.trim() || stepsText.trim() || context.length)
    : (
      title !== procedure?.name ||
      whenToUse !== procedure?.whenToUse ||
      queue !== (procedure?.queue ?? 'Inbound') ||
      stepsText !== initialStepsText ||
      context.length !== (procedure?.context.length ?? 0)
    )

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex-1 overflow-auto bg-surface">
        {/* Header — sticky while the form body scrolls */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-surface px-2xl py-xl">
          <div className="flex min-w-0 items-center gap-sm">
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              className="flex size-8 items-center justify-center rounded-sm text-text-icon transition-colors hover:bg-surface-hover"
            >
              <BackArrowIcon color="#555" />
            </button>
            <h1 className="truncate text-h3 text-text-primary">
              {isNew ? 'New procedure' : procedure.name}
            </h1>
          </div>

          <div className="flex items-center gap-sm">
            {isNew ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-sm px-md py-xs text-body text-text-action transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  aria-label="More actions"
                  aria-expanded={actionsOpen}
                  onClick={() => setActionsOpen((o) => !o)}
                  className="flex size-9 items-center justify-center rounded-sm border border-border-selected bg-surface text-text-icon transition-colors hover:bg-surface-l2"
                >
                  <Icon name="more_vert" size={20} />
                </button>
                {actionsOpen && (
                  <>
                    <div className="fixed inset-0 z-[105]" onClick={() => setActionsOpen(false)} aria-hidden />
                    <div className="absolute right-0 top-full z-[110] mt-xs min-w-[168px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                      <button
                        type="button"
                        className="block w-full px-md py-sm text-left text-body text-chip-danger-text hover:bg-surface-hover"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={!dirty}
              onClick={dirty ? handleSave : undefined}
              className={`flex h-9 items-center rounded-sm px-lg text-body transition-colors ${
                dirty
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'cursor-not-allowed bg-surface-selected text-text-tertiary'
              }`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Body — wide left column + fixed context sidebar */}
        <div className="flex gap-2xl px-2xl pb-2xl pt-md">

          {/* Left — takes remaining space */}
          <div className="flex min-w-0 flex-1 flex-col gap-xl">
            <Field label="Procedure title">
              <EmptyHintField
                hint={TITLE_PLACEHOLDER}
                isEmpty={!title.trim()}
                className="h-10 rounded-sm border border-border-input bg-surface transition-colors hover:border-border focus-within:border-primary"
                hintClassName="flex items-center px-md"
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 w-full bg-transparent px-md text-body text-text-primary outline-none"
                />
              </EmptyHintField>
            </Field>

            <Field label="When should this procedure be used?">
              <EmptyHintField
                hint={WHEN_PLACEHOLDER}
                isEmpty={!whenToUse.trim()}
                className="rounded-sm border border-border-input bg-surface transition-colors hover:border-border focus-within:border-primary"
                hintClassName="p-md"
              >
                <textarea
                  value={whenToUse}
                  onChange={(e) => setWhenToUse(e.target.value)}
                  rows={isNew ? 5 : 4}
                  className="w-full resize-y bg-transparent p-md text-body leading-relaxed text-text-primary outline-none"
                />
              </EmptyHintField>
            </Field>

            <Field label="Type">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    setQueueAnchor({ top: rect.bottom, left: rect.left, width: rect.width })
                    setQueueMenuOpen((v) => !v)
                  }}
                  className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${
                    queueMenuOpen ? 'border-primary' : 'border-border-input'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-left text-body text-text-primary">{queue}</span>
                  <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
                </button>
                {queueMenuOpen && queueAnchor && (
                  <>
                    <div className="fixed inset-0 z-[105]" onClick={() => setQueueMenuOpen(false)} />
                    <div className="fixed z-[110]" style={{ top: queueAnchor.top, left: queueAnchor.left, width: queueAnchor.width }}>
                      <SelectMenu
                        options={[{ value: 'Inbound', label: 'Inbound' }, { value: 'Outbound', label: 'Outbound' }]}
                        value={[queue]}
                        searchable={false}
                        onChange={(val) => {
                          setQueue(val[0] as 'Inbound' | 'Outbound')
                          setQueueMenuOpen(false)
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </Field>

            <Field label="Steps" info>
              <ProcedureStepsPanel
                initialSteps={procedure?.steps ?? []}
                value={stepsText}
                onChange={setStepsText}
                isNew={isNew}
                onOpenToolDrawer={() => setToolPickerOpen(true)}
              />
            </Field>
          </div>

          {/* Right — fixed 400px context sidebar (auto-fills space freed from left) */}
          <div className="w-[400px] shrink-0">
            <Field label="Context" info>
              <div className="rounded-sm border border-border-input bg-surface">
                {context.length === 0 ? (
                  <p className="px-lg py-md text-body text-text-tertiary">No context added</p>
                ) : (
                  <div className="flex flex-wrap gap-sm px-lg pb-sm pt-md">
                    {(showAllContext ? context : context.slice(0, 20)).map((c, i) => (
                      <RefChip
                        key={`${c.label}-${i}`}
                        kind={c.kind}
                        label={c.label}
                        onRemove={() => setContext((arr) => arr.filter((_, idx) => idx !== i))}
                      />
                    ))}
                    {!showAllContext && context.length > 20 && (
                      <button
                        type="button"
                        onClick={() => setShowAllContext(true)}
                        className="self-center text-body text-text-action hover:text-primary-hover"
                      >
                        + {context.length - 20} more
                      </button>
                    )}
                  </div>
                )}
                <div className="px-lg py-sm">
                  <button
                    type="button"
                    onClick={() => setContextModalOpen(true)}
                    className="flex items-center gap-xs text-body text-text-action transition-colors hover:text-primary-hover"
                  >
                    <Icon name="add_circle" size={16} />
                    Add
                  </button>
                </div>
              </div>
            </Field>
          </div>

        </div>
      </div>

      <ContextModal
        open={contextModalOpen}
        onClose={() => setContextModalOpen(false)}
        onSave={handleContextSave}
      />

      <AddToolDrawer
        isOpen={toolPickerOpen}
        onClose={() => setToolPickerOpen(false)}
        onSelectTool={() => {}}
        product={product}
        activeNavId="frontdesk"
      />
    </div>
  )
}

// ── Field label wrapper ─────────────────────────────────────────
function Field({ label, info = false, children }: { label: string; info?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex h-[18px] items-center gap-xs">
        <span className="text-small text-text-primary">{label}</span>
        {info && <Icon name="info" size={16} className="text-text-tertiary" />}
      </div>
      {children}
    </div>
  )
}


// Mirrors the token type resolver in ProcedureDetailBody.jsx
const KNOWN_TOKENS: Record<string, string> = {
  agent_turn: 'tool',
  Escalate_to_staff: 'tool',
  escalate_to_staff: 'tool',
  'End conversation': 'product',
  Close_session: 'product',
  close_session: 'product',
  'Talk to Human': 'product',
  Appointment_Management_agent: 'address',
  appointment_management_agent: 'address',
}

function bulletIsEmpty(tokens: Token[]): boolean {
  return !tokens.some((t) => (typeof t === 'string' ? t.trim().length > 0 : Boolean(t.label?.trim())))
}

function resolveTokenType(label: string): string {
  if (KNOWN_TOKENS[label]) return KNOWN_TOKENS[label]
  if (/_agent$/i.test(label)) return 'address'
  if (/^[a-z][a-z0-9_]+$/.test(label)) return 'tool'
  if (label.includes('=')) return 'variable'
  return 'variable'
}

// Parses {{variable}} patterns in a plain string and renders inline chips.
function renderInlineString(
  text: string,
  baseKey: string | number,
  onRemoveInlineChip?: (label: string) => void,
): React.ReactNode {
  const parts = text.split(/({{[^}]+}})/)
  if (parts.length === 1) return <span key={baseKey}>{text}</span>
  return (
    <span key={baseKey}>
      {parts.map((part, i) => {
        const m = part.match(/^{{([^}]+)}}$/)
        if (m) {
          const label = m[1]
          return (
            <span key={i} contentEditable={false} style={{ display: 'inline-block', userSelect: 'none' }}>
              <RefChip kind="context" label={label} onRemove={onRemoveInlineChip ? () => onRemoveInlineChip(label) : undefined} />
            </span>
          )
        }
        return part ? <span key={i}>{part}</span> : null
      })}
    </span>
  )
}

// ── Bullet serializer ───────────────────────────────────────────────────────
// Walk a contentEditable bullet div and reconstruct Token[] from its childNodes.
// Text nodes → string tokens. Chip wrapper spans (data-chip-kind) → Ref tokens.
function serializeBulletEl(el: HTMLElement): Token[] {
  const tokens: Token[] = []
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) tokens.push(node.textContent)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement
      const kind = elem.dataset.chipKind as RefKind | undefined
      if (kind) {
        tokens.push({ kind, label: elem.dataset.chipLabel ?? '' })
      } else {
        const text = elem.textContent
        if (text) tokens.push(text)
      }
    }
  })
  return tokens.filter((t) => t !== '')
}

// ── Editable bullet with stable placeholder ─────────────────────────────────
// IMPORTANT: never call setState inside onInput — doing so triggers a React
// re-render which reconciles the contentEditable children against the original
// token spans, erasing whatever the user just typed.
// The placeholder visibility is controlled via CSS `visibility` (not conditional
// rendering) so the contentEditable's DOM position stays fixed across renders.
function EditableBulletLine({
  bullet,
  bulletRef,
  onFocus,
  onBlur,
  onRemoveChip,
}: {
  bullet: { tokens: Token[] }
  bulletRef: (el: HTMLDivElement | null) => void
  onFocus?: (el: HTMLDivElement) => void
  onBlur: (el: HTMLElement) => void
  onRemoveChip: (tokenIdx: number) => void
}) {
  // Derived only from the tokens prop — no local state, no onInput setState
  const showHint = bulletIsEmpty(bullet.tokens)

  return (
    <div className="relative min-h-[24px] flex-1">
      {/* Always in DOM — visibility toggle never shifts sibling positions */}
      <div
        className="pointer-events-none absolute inset-0 select-none text-body leading-relaxed text-text-tertiary"
        style={{ visibility: showHint ? 'visible' : 'hidden' }}
        aria-hidden
      >
        Write instruction…
      </div>
      <div
        ref={bulletRef}
        contentEditable
        suppressContentEditableWarning
        className="relative text-body leading-relaxed text-text-secondary outline-none"
        onFocus={(e) => onFocus?.(e.currentTarget)}
        onBlur={(e) => onBlur(e.currentTarget)}
      >
        {bullet.tokens.map((token, k) =>
          typeof token === 'string' ? (
            renderInlineString(token, k)
          ) : (
            <span
              key={k}
              contentEditable={false}
              data-chip-kind={token.kind}
              data-chip-label={token.label}
              style={{ display: 'inline-block', userSelect: 'none' }}
            >
              <RefChip
                kind={token.kind}
                label={token.label}
                onRemove={() => onRemoveChip(k)}
              />
            </span>
          )
        )}
      </div>
    </div>
  )
}

// ── Steps panel ─────────────────────────────────────────────────────────────
// Identical visual layout in read + edit mode. Text is directly editable in-place:
// step titles via <input>, bullet lines via contentEditable divs with inline chips.
function ProcedureStepsPanel({
  initialSteps,
  value,
  onChange,
  isNew,
  onOpenToolDrawer,
}: {
  initialSteps: ProcedureStep[]
  value: string
  onChange: (v: string) => void
  isNew: boolean
  onOpenToolDrawer?: () => void
}) {
  const lastFocusedBulletRef = useRef<HTMLDivElement | null>(null)
  const getActiveEditable = useCallback(() => lastFocusedBulletRef.current, [])
  const hasStructure = !isNew && initialSteps.length > 0
  const [isEditing, setIsEditing] = useState(isNew)
  const [editSteps, setEditSteps] = useState<ProcedureStep[]>(initialSteps)
  const [isFocused, setIsFocused] = useState(false)

  // Refs to every title input and bullet div so we can focus them precisely
  const titleRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const bulletRefs = useRef<Record<string, HTMLDivElement | null>>({})
  // Remembers which element to focus once edit mode activates
  const pendingFocusKey = useRef<string | null>(null)

  // After isEditing flips to true, focus the element the user clicked on
  useEffect(() => {
    if (!isEditing || !pendingFocusKey.current) return
    const key = pendingFocusKey.current
    pendingFocusKey.current = null
    requestAnimationFrame(() => {
      if (key.startsWith('t-')) {
        titleRefs.current[parseInt(key.slice(2))]?.focus()
      } else if (key.startsWith('b-')) {
        const [, si, bi] = key.split('-')
        bulletRefs.current[`${si}-${bi}`]?.focus()
      }
    })
  }, [isEditing])

  function enterEditAt(key: string) {
    pendingFocusKey.current = key
    setIsEditing(true)
  }

  function updateTitle(i: number, title: string) {
    const updated = editSteps.map((s, idx) => (idx === i ? { ...s, title } : s))
    setEditSteps(updated)
    onChange(stepsToEditorText(updated))
  }

  function updateBulletOnBlur(si: number, bi: number, el: HTMLElement) {
    const tokens = serializeBulletEl(el)
    const updated = editSteps.map((s, i) =>
      i === si
        ? { ...s, bullets: s.bullets.map((b, j) => (j === bi ? { tokens } : b)) }
        : s
    )
    setEditSteps(updated)
    onChange(stepsToEditorText(updated))
  }

  function removeChipFromBullet(si: number, bi: number, tokenIdx: number) {
    const bKey = `${si}-${bi}`
    const updated = editSteps.map((s, i) =>
      i === si
        ? {
            ...s,
            bullets: s.bullets.map((b, j) =>
              j === bi ? { tokens: b.tokens.filter((_, k) => k !== tokenIdx) } : b
            ),
          }
        : s
    )
    setEditSteps(updated)
    onChange(stepsToEditorText(updated))
    // Restore focus to the bullet after chip removal re-render
    setTimeout(() => bulletRefs.current[bKey]?.focus(), 0)
  }

  function removeInlineChipFromStringToken(si: number, bi: number, tokenIdx: number, label: string) {
    const pattern = `{{${label}}}`
    const bKey = `${si}-${bi}`
    const updated = editSteps.map((s, i) => {
      if (i !== si) return s
      return {
        ...s,
        bullets: s.bullets.map((b, j) => {
          if (j !== bi) return b
          return {
            tokens: b.tokens.map((t, k) => {
              if (k !== tokenIdx || typeof t !== 'string') return t
              const idx = t.indexOf(pattern)
              if (idx === -1) return t
              return t.slice(0, idx) + t.slice(idx + pattern.length)
            }),
          }
        }),
      }
    })
    setEditSteps(updated)
    onChange(stepsToEditorText(updated))
    setTimeout(() => bulletRefs.current[bKey]?.focus(), 0)
  }

  const borderCls = isFocused ? 'border-primary' : 'border-border-input'

  function handleFocus() { setIsFocused(true) }
  function handleBlur(e: React.FocusEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsFocused(false)
  }

  // New procedures (no structure yet) — use UserPromptInput inside the same shell
  if (!hasStructure) {
    return (
      <div
        className={`min-h-[360px] rounded-sm border bg-surface p-[24px] transition-colors ${borderCls}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div className="steps-editor-shell">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <UserPromptInput
            hideLabel autoHeight
            value={value} onChange={onChange}
            resolveType={resolveTokenType}
            minEditorHeight={STEPS_FIELD_MIN_HEIGHT}
            placeholder={STEPS_PLACEHOLDER}
            {...({ onOpenToolDrawer } as any)}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-[360px] rounded-sm border bg-surface p-[24px] transition-colors ${borderCls}`}
      style={{ cursor: !isEditing ? 'text' : 'default' }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="flex flex-col gap-[14px]">
        {editSteps.map((step, i) => (
          <div key={i} className="flex flex-col gap-[5px]">

            {/* ── Step title ── */}
            <div className="flex items-start gap-0">
              <span className="shrink-0 text-[14px] leading-[20px] tracking-[-0.28px] text-text-primary">
                {i + 1}.
              </span>
              {isEditing ? (
                <div className="relative min-h-[20px] flex-1 pl-[4px]">
                  <div
                    className="pointer-events-none absolute inset-0 select-none text-[14px] leading-[20px] text-text-tertiary"
                    style={{ visibility: step.title.trim() ? 'hidden' : 'visible' }}
                    aria-hidden
                  >
                    Step title
                  </div>
                  <input
                    ref={(el) => { titleRefs.current[i] = el }}
                    type="text"
                    value={step.title}
                    onChange={(e) => updateTitle(i, e.target.value)}
                    className="relative w-full bg-transparent text-[14px] leading-[20px] tracking-[-0.28px] text-text-primary outline-none"
                  />
                </div>
              ) : (
                <span
                  data-target-key={`t-${i}`}
                  className="flex-1 pl-[4px] text-[14px] leading-[20px] tracking-[-0.28px] text-text-primary"
                  onClick={() => enterEditAt(`t-${i}`)}
                >
                  {step.title}
                </span>
              )}
            </div>

            {/* ── Bullets — disc list matching workflow RHS .stepBullets ── */}
            {step.bullets.length > 0 && (
              <ul className="mt-[2px] list-disc list-outside pl-6" style={{ marginLeft: 0 }}>
                {step.bullets.map((bullet, j) => {
                  const bKey = `${i}-${j}`
                  return (
                    <li
                      key={j}
                      className="mb-[6px] text-[14px] leading-[20px] tracking-[-0.28px] text-text-primary last:mb-0"
                    >
                      {isEditing ? (
                        <EditableBulletLine
                          bullet={bullet}
                          bulletRef={(el) => {
                            bulletRefs.current[bKey] = el
                          }}
                          onFocus={(el) => { lastFocusedBulletRef.current = el }}
                          onBlur={(el) => updateBulletOnBlur(i, j, el)}
                          onRemoveChip={(k) => removeChipFromBullet(i, j, k)}
                        />
                      ) : (
                        <span
                          data-target-key={`b-${i}-${j}`}
                          className="text-[14px] leading-[20px] tracking-[-0.28px] text-text-primary"
                          onClick={() => enterEditAt(`b-${i}-${j}`)}
                        >
                          {bullet.tokens.map((token, k) =>
                            typeof token === 'string' ? (
                              renderInlineString(token, k, (label) => removeInlineChipFromStringToken(i, j, k, label))
                            ) : (
                              <RefChip key={k} kind={token.kind} label={token.label} className="mx-[2px] align-middle" onRemove={() => removeChipFromBullet(i, j, k)} />
                            )
                          )}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
      <StepsEditorToolbar
        getActiveEditable={getActiveEditable}
        onAfterInsert={() => {}}
        onOpenToolDrawer={onOpenToolDrawer}
      />
    </div>
  )
}

