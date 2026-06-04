export interface DateChangeProps {
  date: Date
  isToday: boolean
  onPrev: () => void
  onNext: () => void
  onToday?: () => void
}
