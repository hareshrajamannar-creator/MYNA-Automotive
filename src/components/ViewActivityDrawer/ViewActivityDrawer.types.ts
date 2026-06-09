export type ActivityType = 'google-review' | 'birdeye-review' | 'completed' | 'booked' | 'no-show' | 'survey'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  subtitle?: string
  actionLabel?: string
  date: string
}

export interface ViewActivityDrawerProps {
  open: boolean
  patient: string
  onClose: () => void
}
