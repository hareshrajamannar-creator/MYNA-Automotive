import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { chartColors } from './chartColors'

export interface SankeyNode {
  name: string
}
export interface SankeyLink {
  source: number
  target: number
  value: number
}
export interface SankeyChartProps {
  nodes: SankeyNode[]
  links: SankeyLink[]
  height?: number
  colors?: string[]
}

const DEFAULT_SANKEY_COLORS = [
  '#7c4dff', '#e056c7', '#4cae3d', '#5b9bd5', '#e056c7',
  '#8bc34a', '#4cae3d', '#f5a623',
]

export function SankeyChart({ nodes, links, height = 360, colors }: SankeyChartProps) {
  const palette = colors ?? DEFAULT_SANKEY_COLORS
  const colorAt = (i: number) => palette[i] ?? chartColors.categorical[i % chartColors.categorical.length]
  const nameToIndex = new Map(nodes.map((n, i) => [n.name, i]))
  const sourceIndices = new Set(links.map((l) => l.source))
  const terminalIndices = new Set(nodes.map((_, i) => i).filter((i) => !sourceIndices.has(i)))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NodeComponent = ({ x, y, width, height, index, payload }: any) => {
    const labelOnLeft = terminalIndices.has(index)
    const labelX = labelOnLeft ? x - 8 : x + width + 8
    const anchor = labelOnLeft ? 'end' : 'start'
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx={2} fill={colorAt(index)} />
        <text
          x={labelX}
          y={y + height / 2}
          textAnchor={anchor}
          dominantBaseline="middle"
          fontFamily="Roboto"
          fontSize={12}
          fill="#212121"
        >
          {payload.name}
        </text>
      </g>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LinkComponent = ({ sourceX, sourceY, targetX, targetY, sourceControlX, targetControlX, linkWidth, payload }: any) => {
    const src = payload?.source
    const srcIdx =
      typeof src === 'number' ? src : src?.index ?? nameToIndex.get(src?.name) ?? 0
    return (
      <path
        d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke={colorAt(srcIdx)}
        strokeOpacity={0.3}
        strokeWidth={linkWidth}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Sankey
        data={{ nodes, links }}
        nodePadding={26}
        nodeWidth={12}
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        node={<NodeComponent />}
        link={<LinkComponent />}
      >
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const entry = payload[0]
            const name = String(entry.name ?? '')
            const value = Number(entry.value ?? 0)
            const color = colorAt(nameToIndex.get(name) ?? 0)
            return (
              <ChartTooltip
                label={name}
                items={[{ color, label: name, value }]}
                accentColor={color}
              />
            )
          }}
        />
      </Sankey>
    </ResponsiveContainer>
  )
}
