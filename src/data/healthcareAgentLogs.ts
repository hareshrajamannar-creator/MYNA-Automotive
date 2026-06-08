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
  { id: 'total', value: '12', label: 'Total conversation', info: true },
  { id: 'resolved', value: '8', label: 'Resolved', info: true },
  { id: 'transferred', value: '3', label: 'Transferred', info: true },
  { id: 'abandoned', value: '1', label: 'Abandoned', info: true },
]

export const HEALTHCARE_LOGS_ROWS: HealthcareLogRow[] = [
  {
    timestamp: 'Feb 25, 2024, 5:30 pm',
    status: 'Resolved',
    contact: 'Dana Whitfield',
    channel: 'Voice',
    duration: '0:53',
    topic: 'Appointment confirmation',
  },
  {
    timestamp: 'Feb 09, 2024, 5:30 pm',
    status: 'Resolved',
    contact: 'Robert Cho',
    channel: 'Voice',
    duration: '1:36',
    topic: 'New patient',
  },
  {
    timestamp: 'Feb 05, 2024, 5:30 pm',
    status: 'Resolved',
    contact: '+1 (628) 555-0110',
    channel: 'Chat',
    duration: '1:11',
    topic: 'Reschedule',
  },
  {
    timestamp: 'Jan 25, 2024, 5:30 pm',
    status: 'Abandoned',
    contact: '+1 (310) 555-0190',
    channel: 'Chat',
    duration: '1:04',
    topic: 'Urgent symptom',
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
