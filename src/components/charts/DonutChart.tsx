import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export interface DonutDatum {
  name: string
  value: number
  color: string
}

export interface DonutChartProps {
  data: DonutDatum[]
  centerValue?: string
  centerLabel?: string
  height?: number
}

export function DonutChart({ data, centerValue, centerLabel, height = 260 }: DonutChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="52%"
            outerRadius="90%"
            paddingAngle={1}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12, fontFamily: 'Roboto' }}
            itemStyle={{ color: '#555555' }}
          />
          <Legend
            align="left"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: '#555555' }}>{value}</span>}
            wrapperStyle={{ fontSize: 12, fontFamily: 'Roboto', paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center"
          style={{ top: 0, bottom: 40 }}
        >
          {centerValue && <span className="text-[22px] leading-7 text-text-primary">{centerValue}</span>}
          {centerLabel && <span className="text-small text-text-secondary">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
