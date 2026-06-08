import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
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
}

const SANKEY_COLORS = [
  '#7c4dff', // Voice — purple
  '#e056c7', // Text — pink
  '#4cae3d', // Chat — green
  '#5b9bd5', // Agent involved — blue
  '#e056c7', // Human involved — pink
  '#8bc34a', // Resolved — light green
  '#4cae3d', // Routed — green
  '#f5a623', // Unresolved — orange
]
const colorAt = (i: number) => SANKEY_COLORS[i] ?? chartColors.categorical[i % chartColors.categorical.length]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Node({ x, y, width, height, index, payload, containerWidth }: any) {
  const onLeftEdge = x < containerWidth * 0.2
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={2} fill={colorAt(index)} />
      <text
        x={onLeftEdge ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={onLeftEdge ? 'end' : 'start'}
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

export function SankeyChart({ nodes, links, height = 360 }: SankeyChartProps) {
  const nameToIndex = new Map(nodes.map((n, i) => [n.name, i]))

  // Closure so each flow can be tinted with its source category's color.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Link = ({ sourceX, sourceY, targetX, targetY, sourceControlX, targetControlX, linkWidth, payload }: any) => {
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
        margin={{ top: 8, right: 100, bottom: 8, left: 8 }}
        node={<Node />}
        link={<Link />}
      >
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12, fontFamily: 'Roboto' }} />
      </Sankey>
    </ResponsiveContainer>
  )
}
