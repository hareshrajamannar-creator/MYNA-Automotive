import { Icon } from '../Icon/Icon'
import { MetricTilesProps } from './MetricTiles.types'

export function MetricTiles({ metrics }: MetricTilesProps) {
  return (
    <div className="flex gap-md">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="flex flex-1 flex-col items-start rounded-md border border-border px-xl pb-xl pt-lg transition-colors hover:bg-surface-hover"
        >
          <div className="flex items-baseline gap-sm">
            <span className="text-display text-text-primary">{metric.value}</span>
            {metric.delta && (
              <span className={`text-small ${metric.trend === 'down' ? 'text-chip-danger-text' : 'text-chip-success-text'}`}>
                {metric.trend === 'down' ? '-' : '+'}
                {metric.delta}
              </span>
            )}
          </div>
          <div className="mt-xs flex items-center gap-xs">
            <span className="text-body text-text-primary">{metric.label}</span>
            {metric.info && <Icon name="info" size={16} className="text-text-tertiary" />}
          </div>
        </div>
      ))}
    </div>
  )
}
