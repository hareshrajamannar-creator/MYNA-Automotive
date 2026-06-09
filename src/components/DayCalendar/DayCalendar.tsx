interface CalendarEvent {
  id: string
  name: string
  start: string
  end: string
  color: 'green' | 'red' | 'blue'
}

interface DayCalendarProps {
  day: Date
}

function buildSlots() {
  const slots: string[] = []
  for (let h = 6; h < 18; h++) {
    const period = h < 12 ? 'AM' : 'PM'
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h
    slots.push(`${String(display).padStart(2, '0')}:00 ${period}`)
    slots.push(`${String(display).padStart(2, '0')}:30 ${period}`)
  }
  return slots
}

const SLOTS = buildSlots()
const START_HOUR = 6
const SLOT_HEIGHT = 80 // px per 30-min slot → 160px per hour

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', name: 'Robin Willams', start: '08:00am', end: '09:00am', color: 'green' },
  { id: '2', name: 'Robin Willams', start: '08:00am', end: '09:00am', color: 'green' },
  { id: '3', name: 'Ruth Regan',    start: '09:00am', end: '10:00am', color: 'red'   },
  { id: '4', name: 'Ruth Regan',    start: '09:00am', end: '10:00am', color: 'blue'  },
]

const COLOR_MAP = {
  green: { bg: 'bg-[#edf7ed]', borderColor: '#4caf50', text: 'text-[#4caf50]' },
  red:   { bg: 'bg-[#fdecea]', borderColor: '#f44336', text: 'text-[#f44336]' },
  blue:  { bg: 'bg-[#edf4fc]', borderColor: '#3576cb', text: 'text-[#3576cb]' },
}

function parseHour(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})(am|pm)$/)
  if (!m) return 0
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  if (m[3] === 'pm' && h !== 12) h += 12
  if (m[3] === 'am' && h === 12) h = 0
  return h + min / 60
}

export function DayCalendar({ day: _day }: DayCalendarProps) {
  const pxPerHour = SLOT_HEIGHT * 2

  const now = new Date()
  const currentH = now.getHours() + now.getMinutes() / 60
  const showIndicator = currentH >= START_HOUR && currentH < START_HOUR + SLOTS.length / 2

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="relative flex flex-1">
        {/* Time label column — label is centered on the border-t line of each slot */}
        <div className="relative w-[88px] shrink-0">
          <div className="absolute right-0 top-0 h-full w-px bg-[#ccc]" />
          {SLOTS.map((label, i) => (
            <div
              key={i}
              className="relative"
              style={{ height: SLOT_HEIGHT }}
            >
              {/* Label centered on the TOP edge of this slot (= the grid line) */}
              <span className="absolute right-[12px] top-0 -translate-y-1/2 text-[11px] leading-none text-[#888]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="relative flex-1">
          {/* Grid lines — border-t so each line aligns with the label at the same slot index */}
          {SLOTS.map((_, i) => (
            <div
              key={i}
              className="border-t border-[#e8e8e8]"
              style={{ height: SLOT_HEIGHT }}
            />
          ))}

          {/* Events */}
          {MOCK_EVENTS.map((evt) => {
            const top = (parseHour(evt.start) - START_HOUR) * pxPerHour
            const height = (parseHour(evt.end) - parseHour(evt.start)) * pxPerHour
            const c = COLOR_MAP[evt.color]
            return (
              <div
                key={evt.id}
                className={`absolute left-[4px] right-[4px] cursor-pointer overflow-hidden rounded-[2px] ${c.bg}`}
                style={{ top, height: Math.max(height, 28) }}
              >
                <div
                  className="absolute bottom-[5%] left-0 top-[5%] w-[3px] rounded-[4px]"
                  style={{ backgroundColor: c.borderColor }}
                />
                <div className="pl-[10px] pt-[8px]">
                  <p className={`text-[12px] ${c.text}`}>{evt.name}</p>
                  <p className="text-[10px] text-[#555]">{evt.start} - {evt.end}</p>
                </div>
              </div>
            )
          })}

          {/* Current time indicator */}
          {showIndicator && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-10"
              style={{ top: (currentH - START_HOUR) * pxPerHour }}
            >
              <div className="relative flex items-center">
                <div className="size-2 rounded-full bg-primary" />
                <div className="h-px flex-1 bg-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
