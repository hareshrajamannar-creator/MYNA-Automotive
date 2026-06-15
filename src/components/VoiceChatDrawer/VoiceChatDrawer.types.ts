export interface VoiceChatMessage {
  id: string | number
  role: 'system' | 'agent' | 'user'
  text: string
}

export interface VoiceChatDrawerProps {
  open: boolean
  messages: VoiceChatMessage[]
  summary?: string
  audioUrl?: string
  durationSecs?: number
  onClose: () => void
}
