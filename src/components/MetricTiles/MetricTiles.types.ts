export interface Metric {
  id: string
  value: number | string
  label: string
  /** Optional delta shown next to the value, e.g. "1.3%". */
  delta?: string
  trend?: 'up' | 'down'
  /** Show an info icon after the label. */
  info?: boolean
}

export interface MetricTilesProps {
  metrics: Metric[]
}
