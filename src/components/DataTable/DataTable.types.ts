import type { ReactNode } from 'react'

export interface Column<T> {
  key: keyof T
  label: string
  /** Initial column width in px (default 160). */
  width?: number
  /** Minimum width when resizing (default 80). */
  minWidth?: number
  sortable?: boolean
  /** Allow the user to drag-resize this column (default true). */
  resizable?: boolean
  render?: (value: T[keyof T], row: T) => ReactNode
}

export type SortDir = 'asc' | 'desc'

export interface RowAction<T> {
  /** Material Symbols icon name for the page-specific primary CTA. */
  icon?: string
  /** Custom React element to render instead of an Icon (takes priority over icon). */
  iconElement?: ReactNode
  label: string
  onClick: (row: T) => void
  visible?: (row: T) => boolean
}

export interface RowMenuItem<T> {
  label: string
  onClick: (row: T) => void
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  /** Primary CTA shown on row hover (page-specific). */
  rowAction?: RowAction<T>
  /** Items in the three-dots "more" menu shown on row hover. */
  rowMenuItems?: RowMenuItem<T>[]
}
