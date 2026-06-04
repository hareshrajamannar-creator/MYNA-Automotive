import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartColors } from './chartColors'

export interface TrendPoint {
  label: string
  value: number
}

export interface TrendLineChartProps {
  data: TrendPoint[]
  height?: number
  color?: string
}

const axisTick = { fontSize: 12, fill: '#212121', fontFamily: 'Roboto' }

export function TrendLineChart({ data, height = 300, color = chartColors.resolved }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: chartColors.grid }} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12, fontFamily: 'Roboto' }}
          labelStyle={{ color: '#212121' }}
          itemStyle={{ color: '#555555' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
      </RLineChart>
    </ResponsiveContainer>
  )
}
