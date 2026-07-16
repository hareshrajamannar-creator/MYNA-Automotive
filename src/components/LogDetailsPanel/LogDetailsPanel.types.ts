import type { HealthcareLogRow } from '../../data/healthcareAgentLogs'

export interface LogDetailsMetric {
  id: string
  label: string
  value: string
}

export interface LogToolCall {
  id: string
  name: string
  propertyCount: number
  properties: { label: string; value: string }[]
}

export type LogTranscriptEntry =
  | { id: string; role: 'system'; text: string }
  | {
      id: string
      role: 'agent'
      text: string
      llmResponseTime?: string
      tts?: string
      procedure?: string
      knowledgeBase?: string
      toolCall?: LogToolCall
    }
  | { id: string; role: 'caller'; text: string; durationLabel?: string }

export interface LogDetailsPanelProps {
  row: HealthcareLogRow
  agentName?: string
  agentBadge?: string
  callerNumber?: string
  sidNumber?: string
  languageDetected?: string
  callEndReason?: string
  routedVia?: string
  metrics?: LogDetailsMetric[]
  summary?: string
  transcript?: LogTranscriptEntry[]
  durationSecs?: number
  onViewConversation?: () => void
}
