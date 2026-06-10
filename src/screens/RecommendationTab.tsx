import { useState } from 'react'
import { Chip, Icon } from '../components'
import type { ChipVariant } from '../components'
import { RECOMMENDATION_ITEMS } from '../data/recommendationData'
import type { ConversationRef, RecommendationGapType, RecommendationItem } from '../types/recommendation'
import { BackArrowIcon } from '../assets/BackArrowIcon'

const GAP_CONFIG: Record<RecommendationGapType, { icon: string; label: string; barColor: string; borderColor: string }> = {
  procedure:  { icon: 'description', label: 'Procedure gap',  barColor: 'bg-primary',           borderColor: 'border-l-primary' },
  knowledge:  { icon: 'menu_book',   label: 'Knowledge gap',  barColor: 'bg-chip-warning-text',  borderColor: 'border-l-chip-warning-text' },
  action:     { icon: 'build',       label: 'Action gap',     barColor: 'bg-chip-success-text',  borderColor: 'border-l-chip-success-text' },
}

const IMPACT_VARIANT: Record<string, ChipVariant> = {
  high: 'warning',
  medium: 'neutral',
}

const SORT_OPTIONS = [
  { value: 'impact', label: 'Impact' },
  { value: 'newest', label: 'Newest' },
] as const

type SortBy = (typeof SORT_OPTIONS)[number]['value']
type FilterType = RecommendationGapType | 'all'
type RightView = { kind: 'detail' } | { kind: 'conversations' } | { kind: 'conversation-thread'; conversation: ConversationRef } | { kind: 'simulate'; conversation: ConversationRef } | { kind: 'test-pick-conversation' }

function sortItems(items: RecommendationItem[], sortBy: SortBy): RecommendationItem[] {
  if (sortBy === 'impact') {
    return [...items].sort((a, b) => (a.impact === 'high' ? 0 : 1) - (b.impact === 'high' ? 0 : 1))
  }
  return items
}

export function RecommendationTab() {
  const [items, setItems] = useState<RecommendationItem[]>(RECOMMENDATION_ITEMS)
  const [selectedId, setSelectedId] = useState<string>(RECOMMENDATION_ITEMS[0]?.id ?? '')
  const [sortBy, setSortBy] = useState<SortBy>('impact')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [rightView, setRightView] = useState<RightView>({ kind: 'detail' })

  const visibleItems = sortItems(
    filterType === 'all' ? items.filter((i) => i.status === 'pending') : items.filter((i) => i.status === 'pending' && i.type === filterType),
    sortBy,
  )
  const selected = items.find((i) => i.id === selectedId) ?? visibleItems[0]

  const gapCounts = {
    procedure: items.filter((i) => i.status === 'pending' && i.type === 'procedure').length,
    knowledge: items.filter((i) => i.status === 'pending' && i.type === 'knowledge').length,
    action: items.filter((i) => i.status === 'pending' && i.type === 'action').length,
  }
  const totalGaps = gapCounts.procedure + gapCounts.knowledge + gapCounts.action

  function handleSelectItem(id: string) {
    setSelectedId(id)
    setRightView({ kind: 'detail' })
    setAddMenuOpen(false)
  }

  function handleAccept(item: RecommendationItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'accepted' as const } : i)))
    const nextPending = visibleItems.find((i) => i.id !== item.id)
    if (nextPending) {
      setSelectedId(nextPending.id)
      setRightView({ kind: 'detail' })
    }
  }

  function handleReject(item: RecommendationItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'rejected' as const } : i)))
    const nextPending = visibleItems.find((i) => i.id !== item.id)
    if (nextPending) {
      setSelectedId(nextPending.id)
      setRightView({ kind: 'detail' })
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div className="flex w-[370px] shrink-0 flex-col border-r border-border">
        {/* Header */}
        <div className="px-lg py-md">
          <span className="text-body text-text-primary">Recommendations</span>
        </div>

        {/* Gap proportion bar */}
        {totalGaps > 0 && (
          <div className="px-lg pb-md">
            <div className="flex h-2 overflow-hidden rounded-full">
              {gapCounts.procedure > 0 && (
                <div className={`${GAP_CONFIG.procedure.barColor}`} style={{ width: `${(gapCounts.procedure / totalGaps) * 100}%` }} />
              )}
              {gapCounts.knowledge > 0 && (
                <div className={`${GAP_CONFIG.knowledge.barColor}`} style={{ width: `${(gapCounts.knowledge / totalGaps) * 100}%` }} />
              )}
              {gapCounts.action > 0 && (
                <div className={`${GAP_CONFIG.action.barColor}`} style={{ width: `${(gapCounts.action / totalGaps) * 100}%` }} />
              )}
            </div>
            <div className="mt-sm flex items-center gap-lg">
              {(['procedure', 'knowledge', 'action'] as const).map((type) => (
                <div key={type} className="flex items-center gap-xs">
                  <div className={`size-2 rounded-full ${GAP_CONFIG[type].barColor}`} />
                  <span className="text-small text-text-secondary">{GAP_CONFIG[type].label}s</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border px-lg py-sm">
          <span className="text-small text-text-secondary">{visibleItems.length} items</span>
          <div className="flex items-center gap-sm">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSortOpen((o) => !o); setFilterOpen(false) }}
                className="flex h-7 items-center gap-xs rounded-sm px-sm text-small text-text-secondary hover:bg-surface-hover"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <Icon name="expand_more" size={16} className="text-text-icon" />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-[105]" onClick={() => setSortOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full z-[110] mt-xs min-w-[120px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`block w-full px-md py-sm text-left text-body hover:bg-surface-hover ${sortBy === opt.value ? 'text-primary' : 'text-text-primary'}`}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setFilterOpen((o) => !o); setSortOpen(false) }}
                className={`flex h-7 items-center gap-xs rounded-sm px-sm text-small hover:bg-surface-hover ${filterType !== 'all' ? 'text-primary' : 'text-text-secondary'}`}
              >
                <Icon name="filter_list" size={16} />
                Filters {filterType !== 'all' ? '1' : '0'}
              </button>
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-[105]" onClick={() => setFilterOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full z-[110] mt-xs min-w-[160px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                    <button
                      type="button"
                      className={`block w-full px-md py-sm text-left text-body hover:bg-surface-hover ${filterType === 'all' ? 'text-primary' : 'text-text-primary'}`}
                      onClick={() => { setFilterType('all'); setFilterOpen(false) }}
                    >
                      All types
                    </button>
                    {(['procedure', 'knowledge', 'action'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`block w-full px-md py-sm text-left text-body hover:bg-surface-hover ${filterType === type ? 'text-primary' : 'text-text-primary'}`}
                        onClick={() => { setFilterType(type); setFilterOpen(false) }}
                      >
                        {GAP_CONFIG[type].label}s
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {visibleItems.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-body text-text-secondary">
              No recommendations
            </div>
          ) : (
            visibleItems.map((item) => {
              const config = GAP_CONFIG[item.type]
              const isSelected = selected?.id === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item.id)}
                  className={`block w-full border-b border-border px-lg py-md text-left transition-colors ${isSelected ? 'bg-surface-selected' : 'hover:bg-surface-hover'}`}
                >
                  <div className="flex items-center gap-xs">
                    <Icon name={config.icon} size={14} className="text-text-tertiary" />
                    <span className="text-small text-text-tertiary uppercase">{config.label}</span>
                  </div>
                  <p className="mt-xs text-body text-text-primary">{item.title}</p>
                  <p className="mt-xs line-clamp-2 text-small text-text-secondary">{item.description}</p>
                  <div className="mt-sm flex items-center justify-between">
                    <Chip label={item.impact === 'high' ? 'High' : 'Medium'} variant={IMPACT_VARIANT[item.impact]} />
                    <span className="text-small text-text-tertiary">{item.timestamp}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selected ? (
          rightView.kind === 'detail' ? (
            <RecommendationDetail
              item={selected}
              onAccept={() => handleAccept(selected)}
              onReject={() => handleReject(selected)}
              addMenuOpen={addMenuOpen}
              setAddMenuOpen={setAddMenuOpen}
              onViewConversations={() => setRightView({ kind: 'conversations' })}
              onTest={() => setRightView({ kind: 'test-pick-conversation' })}
            />
          ) : rightView.kind === 'test-pick-conversation' ? (
            <TestPickConversationView
              item={selected}
              onBack={() => setRightView({ kind: 'detail' })}
              onPickConversation={(conv) => setRightView({ kind: 'simulate', conversation: conv })}
            />
          ) : rightView.kind === 'conversations' ? (
            <ConversationListView
              item={selected}
              onBack={() => setRightView({ kind: 'detail' })}
              onOpenThread={(conv) => setRightView({ kind: 'conversation-thread', conversation: conv })}
            />
          ) : rightView.kind === 'conversation-thread' ? (
            <ConversationThreadView
              conversation={rightView.conversation}
              onBack={() => setRightView({ kind: 'conversations' })}
              onSimulate={() => setRightView({ kind: 'simulate', conversation: rightView.conversation })}
            />
          ) : (
            <SimulationView
              item={selected}
              conversation={rightView.conversation}
              onBack={() => setRightView({ kind: 'test-pick-conversation' })}
            />
          )
        ) : (
          <div className="flex flex-1 items-center justify-center text-body text-text-secondary">
            Select a recommendation to view details
          </div>
        )}
      </div>
    </div>
  )
}

// --- Detail panel ---

interface RecommendationDetailProps {
  item: RecommendationItem
  onAccept: () => void
  onReject: () => void
  addMenuOpen: boolean
  setAddMenuOpen: (open: boolean) => void
  onViewConversations: () => void
  onTest: () => void
}

function RecommendationDetail({ item, onAccept, onReject, addMenuOpen, setAddMenuOpen, onViewConversations, onTest }: RecommendationDetailProps) {
  const config = GAP_CONFIG[item.type]
  const isKnowledge = item.type === 'knowledge'

  const headerLabel = item.type === 'procedure'
    ? (item.subType === 'modification' ? 'Update procedure' : 'Add procedure')
    : item.type === 'knowledge'
      ? 'Update knowledge'
      : 'Add tool'

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-2xl py-lg">
        <span className="text-body text-text-primary">{headerLabel}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2xl py-xl">
        {/* Recommendation callout */}
        <div className={`rounded-sm border border-border ${config.borderColor} border-l-4 bg-surface p-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-sm">
              <Icon name="auto_awesome" size={18} className="text-chip-warning-text" />
              <span className="text-body text-text-primary">Recommendation</span>
            </div>
            <span className="text-small text-text-tertiary">{item.timestamp}</span>
          </div>
          <p className="mt-sm text-body text-text-secondary">{item.description}</p>
          <div className="mt-md flex items-center justify-between">
            <button
              type="button"
              onClick={onViewConversations}
              className="flex items-center gap-xs text-small text-text-action hover:underline"
            >
              <Icon name="forum" size={14} />
              View {item.conversationCount} conversations
            </button>
            <div className="flex items-center gap-sm">
              <button
                type="button"
                onClick={onReject}
                className="flex h-9 items-center rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={onTest}
                className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
              >
                <Icon name="play_arrow" size={18} className="text-text-icon" />
                Test
              </button>
              {isKnowledge ? (
                <KnowledgeActionButton item={item} />
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAddMenuOpen(!addMenuOpen)}
                    className="flex h-9 items-center gap-xs rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
                  >
                    Add
                    <Icon name="expand_more" size={16} />
                  </button>
                  {addMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[105]" onClick={() => setAddMenuOpen(false)} aria-hidden />
                      <div className="absolute right-0 top-full z-[110] mt-xs min-w-[200px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
                        <button
                          type="button"
                          className="flex w-full items-center gap-sm px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                          onClick={() => { onAccept(); setAddMenuOpen(false) }}
                        >
                          <Icon name="add" size={18} className="text-text-icon" />
                          Add to agent
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-sm px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover"
                          onClick={() => { onAccept(); setAddMenuOpen(false) }}
                        >
                          <Icon name="library_add" size={18} className="text-text-icon" />
                          Add to agent & library
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended content */}
        <div className="mt-xl">
          {item.type === 'procedure' && item.procedureContent && (
            <ProcedurePreview item={item} />
          )}
          {item.type === 'knowledge' && item.knowledgeContent && (
            <KnowledgePreview item={item} />
          )}
          {item.type === 'action' && item.actionContent && (
            <ActionPreview item={item} />
          )}
        </div>

      </div>
    </div>
  )
}

// --- Knowledge action button (no direct add) ---

function KnowledgeActionButton({ item }: { item: RecommendationItem }) {
  const source = item.knowledgeContent?.source
  const label = source === 'business-details' ? 'Update business details' : 'Upload document'
  const icon = source === 'business-details' ? 'settings' : 'upload_file'

  return (
    <button
      type="button"
      className="flex h-9 items-center gap-xs rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  )
}

// --- Test: pick a conversation to simulate ---

interface TestPickConversationViewProps {
  item: RecommendationItem
  onBack: () => void
  onPickConversation: (conv: ConversationRef) => void
}

function TestPickConversationView({ item, onBack, onPickConversation }: TestPickConversationViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-sm border-b border-border px-2xl py-lg">
        <button
          type="button"
          onClick={onBack}
          className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
        >
          <BackArrowIcon />
        </button>
        <Icon name="play_arrow" size={18} className="text-text-icon" />
        <span className="text-body text-text-primary">Test recommendation</span>
      </div>
      <div className="px-2xl pt-lg">
        <p className="text-body text-text-secondary">
          Select a conversation to simulate how the agent would respond with <span className="text-text-primary">{item.title}</span> applied.
        </p>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2xl py-lg">
        <div className="flex flex-col gap-sm">
          {item.conversations.map((conv) => {
            const channelIcon = conv.channel === 'voice' ? 'call' : conv.channel === 'chat' ? 'chat' : 'sms'
            const channelLabel = conv.channel === 'voice' ? 'Voice' : conv.channel === 'chat' ? 'Chat' : 'Text'
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onPickConversation(conv)}
                className="flex w-full items-start gap-md rounded-sm border border-border p-lg text-left transition-colors hover:bg-surface-hover"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-l2">
                  <Icon name={channelIcon} size={18} className="text-text-icon" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-primary">{conv.customerName}</span>
                    <span className="text-small text-text-tertiary">{conv.date}</span>
                  </div>
                  <p className="mt-xs line-clamp-2 text-small text-text-secondary">{conv.snippet}</p>
                  <div className="mt-sm flex items-center gap-sm">
                    <Chip label={channelLabel} variant="neutral" />
                    <span className="text-small text-text-action">Simulate →</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- Conversation list view ---

interface ConversationListViewProps {
  item: RecommendationItem
  onBack: () => void
  onOpenThread: (conv: ConversationRef) => void
}

function ConversationListView({ item, onBack, onOpenThread }: ConversationListViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-sm border-b border-border px-2xl py-lg">
        <button
          type="button"
          onClick={onBack}
          className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
        >
          <BackArrowIcon />
        </button>
        <span className="text-body text-text-primary">Conversations ({item.conversationCount})</span>
      </div>
      <p className="px-2xl pt-lg text-small text-text-secondary">
        These conversations led to the recommendation: <span className="text-text-primary">{item.title}</span>
      </p>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2xl py-lg">
        <div className="flex flex-col gap-sm">
          {item.conversations.map((conv) => {
            const channelIcon = conv.channel === 'voice' ? 'call' : conv.channel === 'chat' ? 'chat' : 'sms'
            const channelLabel = conv.channel === 'voice' ? 'Voice' : conv.channel === 'chat' ? 'Chat' : 'Text'
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onOpenThread(conv)}
                className="flex w-full items-start gap-md rounded-sm border border-border p-lg text-left transition-colors hover:bg-surface-hover"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-l2">
                  <Icon name={channelIcon} size={18} className="text-text-icon" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-text-primary">{conv.customerName}</span>
                    <span className="text-small text-text-tertiary">{conv.date}</span>
                  </div>
                  <p className="mt-xs line-clamp-2 text-small text-text-secondary">{conv.snippet}</p>
                  <div className="mt-sm flex items-center gap-xs">
                    <Chip label={channelLabel} variant="neutral" />
                  </div>
                </div>
                <Icon name="chevron_right" size={18} className="mt-sm text-text-tertiary" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- Conversation thread view ---

interface ConversationThreadViewProps {
  conversation: ConversationRef
  onBack: () => void
  onSimulate: () => void
}

function ConversationThreadView({ conversation, onBack, onSimulate }: ConversationThreadViewProps) {
  const channelLabel = conversation.channel === 'voice' ? 'Voice' : conversation.channel === 'chat' ? 'Chat' : 'Text'

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-2xl py-lg">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <BackArrowIcon />
          </button>
          <span className="text-body text-text-primary">{conversation.customerName}</span>
          <Chip label={channelLabel} variant="neutral" />
        </div>
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={onSimulate}
            className="flex h-9 items-center gap-xs rounded-sm border border-border-selected bg-surface px-lg text-body text-text-primary hover:bg-surface-l2"
          >
            <Icon name="play_arrow" size={18} />
            Simulate
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2xl py-xl">
        <div className="flex flex-col gap-lg">
          {conversation.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] rounded-md p-md ${msg.sender === 'customer' ? 'bg-surface-l2' : 'bg-primary/5 border border-primary/10'}`}>
                <div className="flex items-center gap-xs">
                  <Icon
                    name={msg.sender === 'customer' ? 'person' : 'smart_toy'}
                    size={14}
                    className="text-text-tertiary"
                  />
                  <span className="text-small text-text-tertiary">
                    {msg.sender === 'customer' ? conversation.customerName : 'AI agent'}
                  </span>
                  <span className="text-small text-text-tertiary">· {msg.time}</span>
                </div>
                <p className="mt-xs text-body text-text-primary">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Simulation view (before/after comparison) ---

interface SimulationViewProps {
  item: RecommendationItem
  conversation: ConversationRef
  onBack: () => void
}

function SimulationView({ item, conversation, onBack }: SimulationViewProps) {
  const config = GAP_CONFIG[item.type]

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-2xl py-lg">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <BackArrowIcon />
          </button>
          <Icon name="play_arrow" size={18} className="text-text-icon" />
          <span className="text-body text-text-primary">Simulation — {conversation.customerName}</span>
        </div>
      </div>

      {/* Applied recommendation banner */}
      <div className="flex items-center gap-sm border-b border-border bg-surface-l2 px-2xl py-sm">
        <Icon name={config.icon} size={16} className="text-text-tertiary" />
        <span className="text-small text-text-secondary">
          Simulated with: <span className="text-text-primary">{item.title}</span>
        </span>
      </div>

      {/* Side-by-side columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Before */}
        <div className="flex flex-1 flex-col border-r border-border">
          <div className="flex items-center gap-xs border-b border-border px-lg py-sm">
            <Icon name="history" size={16} className="text-chip-danger-text" />
            <span className="text-small text-chip-danger-text">Before</span>
            <span className="text-small text-text-tertiary">— without recommendation</span>
          </div>
          <div className="flex-1 overflow-y-auto px-lg py-lg">
            <div className="flex flex-col gap-md">
              {conversation.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-md p-md ${msg.sender === 'customer' ? 'bg-surface-l2' : 'bg-chip-danger-bg border border-chip-danger-bg'}`}>
                    <div className="flex items-center gap-xs">
                      <Icon name={msg.sender === 'customer' ? 'person' : 'smart_toy'} size={12} className="text-text-tertiary" />
                      <span className="text-small text-text-tertiary">
                        {msg.sender === 'customer' ? conversation.customerName : 'AI agent'}
                      </span>
                      <span className="text-small text-text-tertiary">· {msg.time}</span>
                    </div>
                    <p className="mt-xs text-body text-text-primary">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* After */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-xs border-b border-border px-lg py-sm">
            <Icon name="auto_awesome" size={16} className="text-chip-success-text" />
            <span className="text-small text-chip-success-text">After</span>
            <span className="text-small text-text-tertiary">— with recommendation applied</span>
          </div>
          <div className="flex-1 overflow-y-auto px-lg py-lg">
            <div className="flex flex-col gap-md">
              {conversation.simulatedMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-md p-md ${msg.sender === 'customer' ? 'bg-surface-l2' : 'bg-chip-success-bg border border-chip-success-bg'}`}>
                    <div className="flex items-center gap-xs">
                      <Icon name={msg.sender === 'customer' ? 'person' : 'smart_toy'} size={12} className="text-text-tertiary" />
                      <span className="text-small text-text-tertiary">
                        {msg.sender === 'customer' ? conversation.customerName : 'AI agent'}
                      </span>
                      <span className="text-small text-text-tertiary">· {msg.time}</span>
                    </div>
                    <p className="mt-xs text-body text-text-primary">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Type-specific previews ---

function ProcedurePreview({ item }: { item: RecommendationItem }) {
  const content = item.procedureContent!
  return (
    <div>
      <h3 className="text-h3 text-text-primary">{item.title}</h3>
      {item.subType === 'modification' && item.existingProcedureId && (
        <div className="mt-sm flex items-center gap-xs">
          <Icon name="edit" size={14} className="text-text-tertiary" />
          <span className="text-small text-text-tertiary">Modifies existing procedure</span>
        </div>
      )}
      <div className="mt-lg">
        <span className="text-small text-text-tertiary">When to use</span>
        <p className="mt-xs text-body text-text-secondary">{content.whenToUse}</p>
      </div>
      <div className="mt-lg flex flex-col gap-lg">
        {content.steps.map((step, idx) => (
          <div key={idx}>
            <span className="text-body text-text-primary">{idx + 1}. {step.title}</span>
            <ul className="mt-xs flex flex-col gap-xs pl-xl">
              {step.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="list-disc text-body text-text-secondary">{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {content.tools.length > 0 && (
        <div className="mt-lg">
          <span className="text-small text-text-tertiary">Tools</span>
          <div className="mt-sm flex flex-wrap gap-sm">
            {content.tools.map((tool) => (
              <span key={tool} className="inline-flex items-center gap-xs rounded-sm border border-border bg-surface-l2 px-sm py-xs text-small text-text-secondary">
                <Icon name="build" size={14} />
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KnowledgePreview({ item }: { item: RecommendationItem }) {
  const content = item.knowledgeContent!
  const isBusinessDetails = content.source === 'business-details'

  return (
    <div>
      <h3 className="text-h3 text-text-primary">{content.contentTitle}</h3>

      {/* What's missing */}
      <div className="mt-lg rounded-sm border border-border bg-surface-l2 p-lg">
        <div className="flex items-center gap-sm">
          <Icon name="warning" size={18} className="text-chip-warning-text" />
          <span className="text-body text-text-primary">What's missing</span>
        </div>
        <ul className="mt-sm flex flex-col gap-xs pl-xl">
          {content.contentBody.map((line, idx) => (
            <li key={idx} className="list-disc text-body text-text-secondary">{line}</li>
          ))}
        </ul>
      </div>

      {/* Missing fields (for business details) */}
      {isBusinessDetails && content.missingFields && content.missingFields.length > 0 && (
        <div className="mt-lg">
          <span className="text-small text-text-tertiary">Missing fields</span>
          <div className="mt-sm flex flex-wrap gap-sm">
            {content.missingFields.map((field) => (
              <span key={field} className="inline-flex items-center gap-xs rounded-sm border border-chip-warning-bg bg-chip-warning-bg px-sm py-xs text-small text-chip-warning-text">
                <Icon name="error_outline" size={14} />
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How to fix */}
      <div className="mt-lg rounded-sm border border-border p-lg">
        <div className="flex items-center gap-sm">
          <Icon name={isBusinessDetails ? 'settings' : 'upload_file'} size={18} className="text-primary" />
          <span className="text-body text-text-primary">How to resolve</span>
        </div>
        <p className="mt-sm text-body text-text-secondary">{content.guideline}</p>
      </div>
    </div>
  )
}

function ActionPreview({ item }: { item: RecommendationItem }) {
  const content = item.actionContent!
  return (
    <div>
      <h3 className="text-h3 text-text-primary">{content.toolName}</h3>
      <div className="mt-sm flex items-center gap-xs">
        <Chip label={content.toolCategory} variant="neutral" />
      </div>
      <p className="mt-lg text-body text-text-secondary">{content.toolDescription}</p>
    </div>
  )
}
