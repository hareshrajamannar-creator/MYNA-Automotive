import { Icon } from '../Icon/Icon'

interface CalendarEvent {
  id: string
  name: string
  start: string
  end: string
  day: number
  color?: 'green' | 'blue' | 'orange'
  warning?: boolean
}

interface WeekCalendarProps {
  weekStart: Date
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = ['07:00am', '08:00am', '09:00am', '10:00am', '11:00am', '12:00pm', '01:00pm', '02:00pm']

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1',  name: 'Robin Willams',      start: '08:00am', end: '09:00am',  day: 0, color: 'green' },
  { id: '2',  name: 'David Goggins',      start: '08:00am', end: '08:30am',  day: 1, color: 'green', warning: true },
  { id: '3',  name: 'Rafeque Mohammed',   start: '08:30am', end: '09:00am',  day: 1, color: 'green' },
  { id: '4',  name: 'David Goggins',      start: '08:00am', end: '08:30am',  day: 2, color: 'green' },
  { id: '5',  name: 'Kapoor Klause',      start: '08:00am', end: '08:30am',  day: 3, color: 'green' },
  { id: '6',  name: 'Mark Rufflow',       start: '08:15am', end: '09:00am',  day: 3, color: 'blue' },
  { id: '7',  name: 'Ruth Regan',         start: '09:00am', end: '10:00am',  day: 0, color: 'green' },
  { id: '8',  name: 'Mark Rufflow',       start: '09:00am', end: '09:30am',  day: 4, color: 'blue' },
  { id: '9',  name: 'Rafeque Mohammed',   start: '09:30am', end: '10:00am',  day: 4, color: 'blue' },
]

const COLOR_MAP = {
  green:  { bg: 'bg-[#f0fdf4]', border: 'border-l-[#22c55e]', text: 'text-[#15803d]' },
  blue:   { bg: 'bg-[#eff6ff]', border: 'border-l-[#3b82f6]', text: 'text-[#1d4ed8]' },
  orange: { bg: 'bg-[#fff7ed]', border: 'border-l-[#f97316]', text: 'text-[#c2410c]' },
}

function parseHour(t: string): number {
  const m = t.match(/^(\d{2}):(\d{2})(am|pm)$/)
  if (!m) return 0
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  if (m[3] === 'pm' && h !== 12) h += 12
  if (m[3] === 'am' && h === 12) h = 0
  return h + min / 60
}

export function WeekCalendar({ weekStart }: WeekCalendarProps) {
  const startHour = 7
  const rowHeight = 80

  function getDates() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - d.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d)
      dd.setDate(dd.getDate() + i)
      return dd
    })
  }

  const dates = getDates()
  const today = new Date()

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {/* Day header row */}
      <div className="sticky top-0 z-10 flex border-b border-border bg-surface">
        <div className="w-[72px] shrink-0" />
        {dates.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString()
          return (
            <div key={i} className="flex flex-1 items-center justify-center border-l border-border py-sm">
              <span className={`text-small ${isToday ? 'text-text-action' : 'text-text-secondary'}`}>
                {DAYS[i].slice(0, d.getDay() === 3 ? 9 : 999).split('day')[0] + 'day'}
              </span>
              <span className={`ml-xs text-small ${isToday ? 'text-text-action' : 'text-text-secondary'}`}>
                {d.getDate()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="relative flex flex-1">
        {/* Hour labels */}
        <div className="w-[72px] shrink-0">
          {HOURS.map((h) => (
            <div key={h} className="flex h-[80px] items-start justify-end pr-sm pt-0">
              <span className="text-small text-text-secondary">{h}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="relative flex flex-1">
          {dates.map((_, dayIdx) => (
            <div key={dayIdx} className="relative flex-1 border-l border-border">
              {HOURS.map((h) => (
                <div key={h} className="h-[80px] border-b border-border" />
              ))}

              {/* Events for this day */}
              {MOCK_EVENTS.filter((e) => e.day === dayIdx).map((evt) => {
                const top = (parseHour(evt.start) - startHour) * rowHeight
                const height = (parseHour(evt.end) - parseHour(evt.start)) * rowHeight
                const c = COLOR_MAP[evt.color ?? 'green']
                return (
                  <div
                    key={evt.id}
                    className={`absolute left-[2px] right-[2px] rounded-sm border-l-[3px] ${c.bg} ${c.border} px-sm py-xs`}
                    style={{ top, height: Math.max(height, 28) }}
                  >
                    <div className="flex items-center gap-xs">
                      <span className={`truncate text-small ${c.text}`}>{evt.name}</span>
                      {evt.warning && <Icon name="warning" size={12} className="shrink-0 text-[#f59e0b]" />}
                    </div>
                    <span className="text-[10px] text-text-secondary">{evt.start} - {evt.end}</span>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Current time indicator */}
          {(() => {
            const now = new Date()
            const h = now.getHours() + now.getMinutes() / 60
            if (h < startHour || h > startHour + HOURS.length) return null
            const top = (h - startHour) * rowHeight
            const dayIdx = now.getDay()
            const leftPercent = (dayIdx / 7) * 100
            const widthPercent = 100 / 7
            return (
              <div className="pointer-events-none absolute z-10" style={{ top, left: `${leftPercent}%`, width: `${widthPercent}%` }}>
                <div className="relative flex items-center">
                  <div className="size-2 rounded-full bg-primary" />
                  <div className="h-px flex-1 bg-primary" />
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
