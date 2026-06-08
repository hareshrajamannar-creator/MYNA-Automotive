import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import { Activity, ActivityType, ViewActivityDrawerProps } from './ViewActivityDrawer.types'

function parseDate(str: string): Date {
  return new Date(`${str}, 2026`)
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function buildActivities(props: ViewActivityDrawerProps): Activity[] {
  const { patient, appointmentDate, appointmentTime, appointmentType, formType, status, bookedOn, insuranceProvider, sentVia } = props
  const activities: Activity[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appt = appointmentDate ? parseDate(appointmentDate) : null
  const formSentDate = appt ? new Date(appt.getTime() - 7 * 86400000) : null
  const formWasSent = formSentDate ? formSentDate <= today : false
  const providerName = insuranceProvider ?? 'Insurance'
  const channel = sentVia === 'email' ? 'Email' : 'SMS'

  activities.push({
    id: '1',
    type: 'booked',
    title: `${patient} booked an appointment for '${appointmentType ?? 'Consultation'}'`,
    subtitle: appointmentDate
      ? `Scheduled date: ${appointmentDate}  •  Scheduled time: ${appointmentTime ?? 'TBD'}`
      : undefined,
    date: bookedOn ? `${bookedOn}, 2026` : '',
  })

  activities.push({
    id: '2',
    type: 'check',
    title: 'Insurance verification initiated',
    subtitle: `${providerName} verification started`,
    date: bookedOn ? `${bookedOn}, 2026` : '',
  })

  if (formWasSent && formSentDate) {
    activities.push({
      id: '3',
      type: 'check',
      title: 'Intake form sent',
      subtitle: `${formType ?? 'New patient'} forms sent via ${channel}`,
      date: fmt(formSentDate),
    })
  }

  if (formWasSent && appt) {
    const t3 = new Date(appt.getTime() - 3 * 86400000)
    if (t3 <= today) {
      activities.push({
        id: '4',
        type: 'check',
        title: 'Intake form reminder sent',
        subtitle: `Reminder sent via SMS on ${fmt(t3)}`,
        date: fmt(t3),
      })
    }

    if (status === 'Overdue' || status === 'Completed') {
      activities.push({
        id: '5',
        type: 'check',
        title: 'Insurance verified',
        subtitle: `${providerName} verified`,
        date: fmt(t3),
      })
    }

    const t2 = new Date(appt.getTime() - 2 * 86400000)
    if (t2 <= today) {
      activities.push({
        id: '6',
        type: 'check',
        title: 'Follow-up reminder sent',
        subtitle: `Reminder sent via SMS on ${fmt(t2)}`,
        date: fmt(t2),
      })
    }

    const t1 = new Date(appt.getTime() - 1 * 86400000)
    if (t1 <= today) {
      activities.push({
        id: '7',
        type: 'check',
        title: 'Intake reminder sent',
        subtitle: `Reminder sent via SMS on ${fmt(t1)}`,
        date: fmt(t1),
      })
    }
  }

  if (status === 'Completed' && appt) {
    activities.push({
      id: '8',
      type: 'check',
      title: 'Intake form completed',
      actionLabel: 'View form',
      date: appointmentDate ? `${appointmentDate}, 2026` : '',
    })
  }

  return activities
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const icon = type === 'booked' ? 'calendar_today' : 'check'

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
      <Icon name={icon} size={18} className="text-text-primary" />
    </div>
  )
}

function ActivityRow({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex gap-md">
      {/* Icon + connector line */}
      <div className="flex flex-col items-center">
        <ActivityIcon type={activity.type} />
        {!isLast && <div className="mt-xs w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={`flex flex-1 items-start justify-between gap-lg ${isLast ? 'pb-0' : 'pb-2xl'}`}>
        <div className="flex flex-col gap-xs">
          <span className="text-body text-text-primary">{activity.title}</span>
          {activity.subtitle && (
            <span className="text-small text-text-secondary">{activity.subtitle}</span>
          )}
          {activity.actionLabel && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-fit items-center gap-xs text-small text-text-action hover:underline"
            >
              {expanded ? 'Hide details' : activity.actionLabel}
              <Icon name={expanded ? 'expand_less' : 'expand_more'} size={14} />
            </button>
          )}
        </div>
        <span className="shrink-0 text-small text-text-secondary">{activity.date}</span>
      </div>
    </div>
  )
}

export function ViewActivityDrawer(props: ViewActivityDrawerProps) {
  const { open, patient, onClose } = props
  const activities = buildActivities(props)

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/20 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-[101] flex h-full w-[650px] flex-col bg-surface shadow-modal transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-2xl py-xl">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            >
              <Icon name="arrow_back" size={20} />
            </button>
            <span className="text-h3 text-text-primary">All activity of {patient}</span>
          </div>
          <button type="button" className="text-body text-text-action hover:underline">
            View all details
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-2xl py-lg">
          {activities.map((activity, i) => (
            <ActivityRow key={activity.id} activity={activity} isLast={i === activities.length - 1} />
          ))}
        </div>
      </div>
    </>
  )
}
