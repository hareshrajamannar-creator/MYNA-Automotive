export type AppointmentView = 'table' | 'calendar'

export interface PageHeaderProps {
  date: Date
  providerLabel?: string
  view?: AppointmentView
  isToday?: boolean
  onPrev?: () => void
  onNext?: () => void
  onToday?: () => void
  onProviderClick?: () => void
  onViewChange?: (view: AppointmentView) => void
  onCustomizeColumns?: () => void
  onFilter?: () => void
}
