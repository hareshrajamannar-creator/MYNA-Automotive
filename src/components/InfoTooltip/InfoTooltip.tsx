import { useRef, useState } from 'react'
import infoIconUrl from '../../assets/icon-info.svg'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  function show() {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: r.left + r.width / 2, y: r.bottom + 8 })
    setVisible(true)
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="flex items-center justify-center text-text-tertiary hover:text-text-secondary"
        aria-label="More info"
      >
        <img src={infoIconUrl} alt="" width={16} height={16} className="opacity-40 hover:opacity-60" />
      </button>
      {visible && pos && (
        <div
          className="pointer-events-none fixed z-[120] w-[260px] rounded-md border border-border bg-surface p-[12px] shadow-dropdown"
          style={{ left: pos.x, top: pos.y, transform: 'translateX(-50%)' }}
        >
          <p className="text-small text-text-tertiary">{text}</p>
        </div>
      )}
    </>
  )
}
