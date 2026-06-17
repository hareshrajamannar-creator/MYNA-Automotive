export interface VoicemailMessageProps {
  variant?: 'voicemail' | 'voice-chat'
  transcript: string
  summary?: string   // voice-chat only — shown in bubble instead of transcript
  duration: string   // e.g. "00:11"
  durationSecs: number
  time: string       // e.g. "10:42 PM"
  audioUrl?: string
}
