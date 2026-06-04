import { Bar, BarChart, Cell, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface RatingBar {
  label: string
  value: number
  color: string
}

export interface RatingBarChartProps {
  data: RatingBar[]
  height?: number
}

function kFormat(val: number | string): string {
  const n = Number(val)
  if (n >= 1000) return `${parseFloat((n / 1000).toFixed(1))}K`
  return String(n)
}

export function RatingBarChart({ data, height = 300 }: RatingBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#eaeaea" vertical={false} horizontal={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#212121', fontFamily: 'Roboto' }}
          tickLine={false}
          axisLine={{ stroke: '#eaeaea' }}
        />
        <YAxis hide width={0} />
        <Tooltip
          formatter={(v) => kFormat(v as number)}
          contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12, fontFamily: 'Roboto' }}
          labelStyle={{ color: '#212121' }}
          itemStyle={{ color: '#555555' }}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="value" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          <LabelList
            dataKey="value"
            position="top"
            formatter={kFormat}
            style={{ fontSize: 12, fill: '#212121', fontFamily: 'Roboto' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
