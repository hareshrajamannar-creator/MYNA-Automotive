import type { Metric } from '../components/MetricTiles/MetricTiles.types'

export type LogStatus = 'Resolved' | 'Transferred' | 'Abandoned'

export interface HealthcareLogRow {
  timestamp: string
  status: LogStatus
  contact: string
  channel: string
  duration: string
  topic: string
  [key: string]: string
}

export const HEALTHCARE_LOGS_METRICS: Metric[] = [
  { id: 'total', value: '12', label: 'Total conversation', info: true, tooltip: 'Total number of conversations handled by the agent in the selected period.' },
  { id: 'resolved', value: '8', label: 'Resolved', info: true, tooltip: 'Conversations that were fully resolved by the agent without human escalation.' },
  { id: 'transferred', value: '3', label: 'Transferred', info: true, tooltip: 'Conversations handed off to a human agent for further assistance.' },
  { id: 'abandoned', value: '1', label: 'Abandoned', info: true, tooltip: 'Conversations where the customer disconnected before resolution.' },
]

export const HEALTHCARE_LOGS_ROWS: HealthcareLogRow[] = [
  {
    timestamp: 'Feb 25, 2024, 5:30 pm',
    status: 'Resolved',
    contact: 'Dana Whitfield',
    channel: 'Voice',
    duration: '0:53',
    topic: 'Service appointment',
  },
  {
    timestamp: 'Feb 09, 2024, 5:30 pm',
    status: 'Resolved',
    contact: 'Robert Cho',
    channel: 'Voice',
    duration: '1:36',
    topic: 'New vehicle inquiry',
  },
  {
    timestamp: 'Feb 05, 2024, 5:30 pm',
    status: 'Resolved',
    contact: '+1 (628) 555-0110',
    channel: 'Chat',
    duration: '1:11',
    topic: 'Appointment reschedule',
  },
  {
    timestamp: 'Jan 25, 2024, 5:30 pm',
    status: 'Abandoned',
    contact: '+1 (310) 555-0190',
    channel: 'Chat',
    duration: '1:04',
    topic: 'Vehicle breakdown',
  },
  {
    timestamp: 'Jan 18, 2024, 5:30 pm',
    status: 'Transferred',
    contact: 'Elena Sokolova',
    channel: 'Voice',
    duration: '0:18',
    topic: 'Not stated',
  },
]
