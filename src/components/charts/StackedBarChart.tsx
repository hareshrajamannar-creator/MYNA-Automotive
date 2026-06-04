import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartColors } from './chartColors'

export interface BarSeries {
  key: string
  label: string
  color: string
}

export interface StackedBarChartProps {
  data: Array<Record<string, string | number>>
  series: BarSeries[]
  xKey: string
  height?: number
  /** Render bars side-by-side instead of stacked. */
  grouped?: boolean
  /** Rotate x-axis labels by this angle (e.g. -45). */
  xAxisAngle?: number
}

const axisTick = { fontSize: 12, fill: chartColors.axis, fontFamily: 'Roboto' }

export function StackedBarChart({ data, series, xKey, height = 300, grouped = false, xAxisAngle }: StackedBarChartProps) {
  const xTick = xAxisAngle
    ? { ...axisTick, angle: xAxisAngle, textAnchor: 'end' as const, dy: 4 }
    : axisTick
  const xAxisHeight = xAxisAngle ? 60 : undefined

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={xTick} tickLine={false} axisLine={{ stroke: chartColors.grid }} height={xAxisHeight} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12, fontFamily: 'Roboto' }}
          labelStyle={{ color: '#212121' }}
          itemStyle={{ color: '#555555' }}
        />
        <Legend
          align="left"
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: '#555555' }}>{value}</span>}
          wrapperStyle={{ fontSize: 12, fontFamily: 'Roboto', paddingTop: 8 }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={grouped ? undefined : 'a'}
            fill={s.color}
            radius={grouped || i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={32}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
