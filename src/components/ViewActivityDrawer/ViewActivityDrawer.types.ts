export type ActivityType = 'booked' | 'check' | 'form-sent' | 'reminder' | 'completed'

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
  appointmentDate?: string
  appointmentTime?: string
  appointmentType?: string
  formType?: string
  status?: string
  bookedOn?: string
}
