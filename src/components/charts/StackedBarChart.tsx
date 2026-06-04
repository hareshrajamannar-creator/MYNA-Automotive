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
}

const axisTick = { fontSize: 12, fill: chartColors.axis, fontFamily: 'Roboto' }

export function StackedBarChart({ data, series, xKey, height = 300 }: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: chartColors.grid }} />
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
            stackId="a"
            fill={s.color}
            radius={i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={48}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
