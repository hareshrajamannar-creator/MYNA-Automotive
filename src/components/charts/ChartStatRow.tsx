export interface ChartStat {
  value: string
  label: string
  /** Optional icon shown inline after the value. Currently supports 'star'. */
  icon?: 'star'
}

export interface ChartStatRowProps {
  stats: ChartStat[]
}

export function ChartStatRow({ stats }: ChartStatRowProps) {
  return (
    <div className="mb-lg flex items-end gap-2xl">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="flex items-center gap-xs">
            <span className="text-h3 font-normal text-text-primary">{s.value}</span>
            {s.icon === 'star' && (
              <span className="text-h3 leading-none" style={{ color: '#f59e0b' }}>★</span>
            )}
          </div>
          <p className="text-small text-text-secondary">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
