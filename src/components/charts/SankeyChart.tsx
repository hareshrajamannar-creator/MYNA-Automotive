import { useState, useCallback } from 'react'
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import { chartColors } from './chartColors'

export interface SankeyNode {
  name: string
  /** Optional tooltip breakdown shown on hover (for specific nodes) */
  breakdown?: Array<{ label: string; pct: string; value: number }>
}
export interface SankeyLink {
  source: number | string
  target: number | string
  value: number
}
export interface SankeyChartProps {
  nodes: SankeyNode[]
  links: SankeyLink[]
  height?: number
  /** Labels for 3 or 4 column groups */
  columnHeaders?: [string, string, string] | [string, string, string, string]
  /** Per-node color overrides keyed by node index */
  nodeColors?: Record<number, string>
}

const colorAt = (i: number, overrides?: Record<number, string>) =>
  overrides?.[i] ?? chartColors.categorical[i % chartColors.categorical.length]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeNode(overrides?: Record<number, string>, onHover?: (idx: number | null, x: number, y: number) => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Node({ x, y, width, height, index, payload, containerWidth }: any) {
    const onLeftEdge = x < containerWidth * 0.2
    const fill = colorAt(index, overrides)
    return (
      <g
        onMouseEnter={(e) => onHover?.(index, e.clientX, e.clientY)}
        onMouseLeave={() => onHover?.(null, 0, 0)}
        style={{ cursor: payload?.breakdown ? 'pointer' : 'default' }}
      >
        <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} />
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
}

function makeLink(overrides?: Record<number, string>, nameToIndex?: Map<string, number>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Link({ sourceX, sourceY, targetX, targetY, sourceControlX, targetControlX, linkWidth, payload }: any) {
    const src = payload?.source
    // Recharts passes source as a node object — resolve to index via name lookup
    let srcIdx = 0
    if (typeof src === 'number') {
      srcIdx = src
    } else if (typeof src?.index === 'number') {
      srcIdx = src.index
    } else if (src?.name && nameToIndex) {
      srcIdx = nameToIndex.get(src.name) ?? 0
    }
    return (
      <path
        d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke={colorAt(srcIdx, overrides)}
        strokeOpacity={0.2}
        strokeWidth={linkWidth}
      />
    )
  }
}

/* ── Breakdown tooltip ── */
interface BreakdownTooltipProps {
  x: number
  y: number
  items: Array<{ label: string; pct: string; value: number }>
}
function BreakdownTooltip({ x, y, items }: BreakdownTooltipProps) {
  return (
    <div style={{
      position: 'fixed', left: x + 12, top: y - 8, zIndex: 9999,
      background: '#fff', border: '1px solid #e5e9f0', borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      padding: '10px 14px', minWidth: 220,
      fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#212121',
      pointerEvents: 'none',
    }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, padding: '4px 0' }}>
          <span style={{ color: '#424242' }}>{item.label}</span>
          <span style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: '#7c4dff', fontWeight: 500 }}>{item.pct}</span>
            <span style={{ color: '#757575' }}>{item.value.toLocaleString()}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function SankeyChart({ nodes, links, height = 360, columnHeaders, nodeColors }: SankeyChartProps) {
  const [hoverState, setHoverState] = useState<{ idx: number; x: number; y: number } | null>(null)

  const handleHover = useCallback((idx: number | null, x: number, y: number) => {
    if (idx === null) { setHoverState(null); return }
    if (nodes[idx]?.breakdown) setHoverState({ idx, x, y })
    else setHoverState(null)
  }, [nodes])

  const nameToIndex = new Map(nodes.map((n, i) => [n.name, i]))
  const NodeComponent = makeNode(nodeColors, handleHover)
  const LinkComponent = makeLink(nodeColors, nameToIndex)

  const activeBreakdown = hoverState !== null ? nodes[hoverState.idx]?.breakdown : undefined

  return (
    <div style={{ position: 'relative' }}>
      {columnHeaders && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: 60,
          paddingRight: 90,
          height: 20,
          marginBottom: 6,
        }}>
          {columnHeaders.map((label) => (
            <span
              key={label}
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: '#9e9e9e',
                fontFamily: 'Roboto, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <Sankey
          data={{ nodes, links: links.map((l) => {
            const si = typeof l.source === 'string' ? nodes.findIndex((n) => n.name === l.source) : l.source
            const ti = typeof l.target === 'string' ? nodes.findIndex((n) => n.name === l.target) : l.target
            return { ...l, source: si, target: ti }
          }) }}
          nodePadding={10}
          nodeWidth={12}
          margin={{ top: 8, right: 90, bottom: 8, left: 60 }}
          node={<NodeComponent />}
          link={<LinkComponent />}
        >
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e9f0', fontSize: 12, fontFamily: 'Roboto' }} />
        </Sankey>
      </ResponsiveContainer>

      {activeBreakdown && hoverState && (
        <BreakdownTooltip x={hoverState.x} y={hoverState.y} items={activeBreakdown} />
      )}
    </div>
  )
}
