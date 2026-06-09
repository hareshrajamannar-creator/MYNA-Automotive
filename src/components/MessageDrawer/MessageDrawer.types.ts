export interface MessageDrawerProps {
  open: boolean
  patient: string
  status?: string
  onClose: () => void
}
