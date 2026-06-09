export interface Metric {
  id: string
  value: number | string
  label: string
  /** Optional delta shown next to the value, e.g. "1.3%". */
  delta?: string
  trend?: 'up' | 'down'
  /** When true, a downward trend is shown in green (e.g. no-show rate — lower is better). */
  positiveDown?: boolean
  /** Show an info icon after the label. */
  info?: boolean
}

export interface MetricTilesProps {
  metrics: Metric[]
}
