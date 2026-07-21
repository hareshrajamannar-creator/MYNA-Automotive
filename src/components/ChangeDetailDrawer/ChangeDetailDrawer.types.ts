import type { ProposedChange } from '../../data/feedbackData'

export interface ChangeDetailDrawerProps {
  open: boolean
  change: ProposedChange | null
  onClose: () => void
}
