export interface ProcedurePickerItem {
  id: string
  title: string
  description: string
}

export interface ProceduresPickerDrawerProps {
  open: boolean
  procedures: ProcedurePickerItem[]
  selectedIds: string[]
  onClose: () => void
  onSave: (selectedIds: string[]) => void
}
