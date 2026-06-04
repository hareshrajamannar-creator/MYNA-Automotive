export interface SummaryStat {
  id: string
  value: string
  label: string
  /** e.g. "8.4%" — sign comes from `trend`. */
  delta?: string
  trend?: 'up' | 'down'
}

export interface SummaryStatsProps {
  title?: string
  stats: SummaryStat[]
}

export function SummaryStats({ title = 'Summary', stats }: SummaryStatsProps) {
  return (
    <section className="rounded-md border border-border bg-surface p-2xl">
      <h3 className="mb-lg text-[16px] leading-6 tracking-[-0.32px] text-text-primary">{title}</h3>
      <div className="flex flex-wrap gap-x-[40px] gap-y-lg">
        {stats.map((s) => (
          <div key={s.id} className="min-w-[150px]">
            <div className="flex items-center gap-sm">
              <span className="text-[24px] leading-8 text-text-primary">{s.value}</span>
              {s.delta && (
                <span
                  className={`text-small font-medium ${
                    s.trend === 'down' ? 'text-chip-danger-text' : 'text-chip-success-text'
                  }`}
                >
                  {s.trend === 'down' ? '-' : '+'}{s.delta}
                </span>
              )}
            </div>
            <p className="text-body text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
