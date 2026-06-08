export interface SelectOption {
  value: string
  label: string
}

export interface SelectMenuProps {
  options: SelectOption[]
  /** Currently selected values. */
  value: string[]
  /** Multi-select (checkboxes + Select all + Apply) vs single-select. */
  multi?: boolean
  searchable?: boolean
  onChange: (value: string[]) => void
  /** Multi-select only — fired when the Apply button is pressed. */
  onApply?: () => void
}
