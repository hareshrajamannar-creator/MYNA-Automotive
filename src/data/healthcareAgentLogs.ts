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

/* Tiles — must match the row counts below: 8 Resolved + 3 Transferred + 1 Abandoned = 12 */
export const HEALTHCARE_LOGS_METRICS: Metric[] = [
  { id: 'total',       value: '12', label: 'Total conversations', info: true },
  { id: 'resolved',   value: '8',  label: 'Resolved',            info: true },
  { id: 'transferred', value: '3', label: 'Transferred',         info: true },
  { id: 'abandoned',  value: '1',  label: 'Abandoned',           info: true },
]

/* 12 rows: 8 Resolved, 3 Transferred, 1 Abandoned */
export const HEALTHCARE_LOGS_ROWS: HealthcareLogRow[] = [
  { timestamp: 'Mar 01, 2024, 10:14 am', status: 'Resolved',    contact: 'Michael Torres',       channel: 'Voice', duration: '1:22', topic: 'Prescription refill'    },
  { timestamp: 'Feb 28, 2024,  2:47 pm', status: 'Transferred', contact: '+1 (415) 555-0143',    channel: 'Voice', duration: '0:34', topic: 'Specialist referral'    },
  { timestamp: 'Feb 25, 2024,  5:30 pm', status: 'Resolved',    contact: 'Dana Whitfield',       channel: 'Voice', duration: '0:53', topic: 'Appointment confirmation' },
  { timestamp: 'Feb 22, 2024,  9:05 am', status: 'Resolved',    contact: 'Lisa Chen',            channel: 'Chat',  duration: '0:48', topic: 'Appointment confirmation' },
  { timestamp: 'Feb 20, 2024,  3:18 pm', status: 'Resolved',    contact: 'James Park',           channel: 'Voice', duration: '1:05', topic: 'Billing inquiry'         },
  { timestamp: 'Feb 15, 2024, 11:33 am', status: 'Resolved',    contact: 'Amy Rodriguez',        channel: 'Voice', duration: '2:14', topic: 'Insurance verification'  },
  { timestamp: 'Feb 12, 2024,  4:52 pm', status: 'Transferred', contact: '+1 (212) 555-0178',    channel: 'Chat',  duration: '0:22', topic: 'Specialist referral'    },
  { timestamp: 'Feb 10, 2024,  1:40 pm', status: 'Resolved',    contact: 'Thomas Hill',          channel: 'Voice', duration: '1:14', topic: 'Test results inquiry'    },
  { timestamp: 'Feb 09, 2024,  5:30 pm', status: 'Resolved',    contact: 'Robert Cho',           channel: 'Voice', duration: '1:36', topic: 'New patient'             },
  { timestamp: 'Feb 05, 2024,  5:30 pm', status: 'Resolved',    contact: '+1 (628) 555-0110',    channel: 'Chat',  duration: '1:11', topic: 'Reschedule'              },
  { timestamp: 'Jan 25, 2024,  5:30 pm', status: 'Abandoned',   contact: '+1 (310) 555-0190',    channel: 'Chat',  duration: '1:04', topic: 'Urgent symptom'          },
  { timestamp: 'Jan 18, 2024,  5:30 pm', status: 'Transferred', contact: 'Elena Sokolova',       channel: 'Voice', duration: '0:18', topic: 'Not stated'              },
]
