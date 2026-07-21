import type { CopilotMessage, ProposedChange } from '../../data/feedbackData'

export type ChangeDecision = 'accepted' | 'rejected'

export interface CoachCopilotProps {
  messages: CopilotMessage[]
  changes: ProposedChange[]
  changeDecisions: Record<string, ChangeDecision>
  onDecideChange: (changeId: string, decision: ChangeDecision) => void
  onOpenChange?: (changeId: string) => void
  onSend: (text: string) => void
  busy?: boolean
  composerPlaceholder?: string
}
