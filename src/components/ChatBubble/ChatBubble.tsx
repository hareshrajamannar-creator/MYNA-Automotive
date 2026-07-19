import type { ReactNode } from 'react'
import { ChatBubbleProps } from './ChatBubble.types'

export function ChatBubble({
  sender,
  text,
  children,
  className = '',
  bubbleClassName = '',
  gap = 'gap-xs',
}: ChatBubbleProps) {
  const isBusiness = sender === 'business'
  return (
    <div className={`flex flex-col ${gap} ${isBusiness ? 'items-end' : 'items-start'} ${className}`}>
      <div
        className={[
          'rounded-lg text-body leading-[1.5] text-text-primary',
          isBusiness ? 'bg-[#dbeafe]' : 'bg-[#f0f0f0]',
          bubbleClassName || 'max-w-[70%] px-md py-sm',
        ].join(' ')}
      >
        {text}
      </div>
      {children}
    </div>
  )
}

export function ChatSystemLabel({ text }: { text: ReactNode }) {
  return (
    <div className="flex items-center justify-center">
      <span className="text-small text-text-tertiary">{text}</span>
    </div>
  )
}
