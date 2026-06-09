import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import { Activity, ActivityType, ViewActivityDrawerProps } from './ViewActivityDrawer.types'

function BirdeyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.6417 15.8029L17.6417 15.8027L17.6384 15.8014C17.5927 15.7816 17.5463 15.7632 17.4992 15.7463L12.7315 13.8611L12.7311 13.8618C12.6006 13.804 12.4564 13.7713 12.3044 13.7713C11.7231 13.7713 11.2518 14.2403 11.2518 14.8187C11.2518 15.0578 11.3332 15.2774 11.4688 15.4537L11.4681 15.4544L11.4764 15.4638C11.5005 15.4944 11.5259 15.524 11.5532 15.5517L14.9714 19.459L14.9715 19.4589C15.3977 19.9372 16.0196 20.2391 16.7125 20.2391C17.9972 20.2391 19.0387 19.2029 19.0387 17.9247C19.0387 16.9752 18.4638 16.1598 17.6417 15.8029M16.0713 7.92504C17.1523 7.58657 18.3171 8.14557 18.673 9.17345C19.0289 10.2013 18.4411 11.3088 17.36 11.6473C16.2791 11.9856 15.1142 11.4266 14.7583 10.3989C14.4025 9.37094 14.9903 8.26336 16.0713 7.92504M23.5537 9.17994C23.3965 8.95849 23.168 8.81665 22.9198 8.75419L22.9196 8.75053L21.9876 8.50627C21.9741 8.46262 21.9653 8.41842 21.9506 8.37481C20.9828 5.51383 17.8153 3.95809 14.8755 4.89999C13.3526 5.38783 12.1944 6.45242 11.5617 7.76098L9.87757 10.4368L5.88029 8.85972L5.87765 8.86265C5.62588 8.76042 5.33869 8.73796 5.05933 8.82742C4.44192 9.02534 4.10609 9.67275 4.30931 10.2738C4.33911 10.3616 4.38134 10.4416 4.42915 10.5168L4.4222 10.5248L8.59266 16.045C8.59643 16.05 8.59829 16.0555 8.60205 16.0603C8.60577 16.0655 8.61067 16.0695 8.61463 16.0746L11.5983 20.2565C12.9021 22.5847 15.7227 23.9859 18.4456 23.1135C21.3852 22.1718 22.984 19.089 22.0161 16.228C21.7148 15.3376 21.2002 14.5738 20.5458 13.9722C21.3708 13.1844 21.9306 12.1679 22.1398 11.0647L23.0412 10.8043L23.0406 10.7945C23.1205 10.7643 23.1987 10.7278 23.2723 10.6784C23.7751 10.3402 23.9012 9.66943 23.5537 9.17994" fill="#1976D2"/>
    </svg>
  )
}

function buildActivities(patient: string): Activity[] {
  return [
    { id: '1',  type: 'google-review',  title: `${patient} wrote a 4-star review`,                                       actionLabel: 'Show details',  date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '2',  type: 'completed',      title: `${patient} completed the follow-up appointment`,                          subtitle: 'Amount $300',      date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '3',  type: 'booked',         title: `${patient} booked a appointment for 'Tooth extraction'`,                  subtitle: 'Scheduled date: Mar 28, 2025  •  Scheduled time: 2:00 PM', date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '4',  type: 'google-review',  title: `${patient} wrote a 4-star review`,                                       actionLabel: 'Show details',  date: 'Oct 20, 2025' },
    { id: '5',  type: 'booked',         title: `${patient} booked a follow-up appointment`,                               subtitle: 'Scheduled date: Mar 28, 2025  •  Scheduled time: 2:00 PM', date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '6',  type: 'survey',         title: `${patient} responded to Customer Satisfaction Survey with a score of 8/10`, actionLabel: 'Show details', date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '7',  type: 'birdeye-review', title: `${patient} wrote a 4-star review`,                                       actionLabel: 'Show details',  date: 'Mar 20, 2025' },
    { id: '8',  type: 'no-show',        title: `No-show for an appointment for 'Tooth cleaning'`,                         subtitle: 'Amount $500',      date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '9',  type: 'survey',         title: `${patient} responded to Customer Feedback Survey with a score of 5/10`,   actionLabel: 'Show response', date: 'Mar 20, 2025 • 2:00 PM' },
    { id: '10', type: 'completed',      title: `${patient} completed an appointment for 'Tooth cleaning'`,                date: 'Mar 20, 2025 • 2:00 PM' },
  ]
}

function ActivityIcon({ type }: { type: ActivityType }) {
  if (type === 'google-review') {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    )
  }

  if (type === 'birdeye-review') {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
        <BirdeyeIcon />
      </div>
    )
  }

  const iconMap: Record<string, string> = {
    completed: 'check',
    check:     'check',
    survey:    'check',
    booked:    'calendar_today',
    'no-show': 'close',
    'form-sent': 'description',
    reminder:  'notifications',
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full">
      <Icon name={iconMap[type] ?? 'circle'} size={18} className="text-text-primary" />
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

export function ViewActivityDrawer({ open, patient, onClose }: ViewActivityDrawerProps) {
  const activities = buildActivities(patient)

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
