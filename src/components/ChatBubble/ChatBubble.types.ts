import type { ReactNode } from 'react'

export type ChatSender = 'business' | 'user'

export interface ChatBubbleProps {
  sender: ChatSender
  text: ReactNode
  children?: ReactNode
  className?: string
  /** Extra classes for the bubble surface (padding, max-width, etc.). */
  bubbleClassName?: string
  /** Gap token between the bubble and its meta caption (children). Defaults to 'gap-xs'. */
  gap?: string
}
