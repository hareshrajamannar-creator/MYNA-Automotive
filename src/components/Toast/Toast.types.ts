export interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
  actionLabel?: string
  onAction?: () => void
}
