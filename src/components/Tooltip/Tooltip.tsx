import { useRef, useState } from 'react'
import { TooltipProps } from './Tooltip.types'

const VARIANT_MAX_WIDTH = {
  brief: 'max-w-[140px]',
  detail: 'max-w-[280px]',
}

export function Tooltip({ content, variant = 'detail', children, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  function show() {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.bottom + 8 })
    setVisible(true)
  }

  return (
    <span
      ref={ref}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && pos && (
        <span
          role="tooltip"
          className={`pointer-events-none fixed z-[120] w-max ${VARIANT_MAX_WIDTH[variant]} rounded-sm bg-tooltip px-sm py-xs text-small text-white shadow-tooltip`}
          style={{ left: pos.x, top: pos.y, transform: 'translateX(-50%)' }}
        >
          {content}
        </span>
      )}
    </span>
  )
}
