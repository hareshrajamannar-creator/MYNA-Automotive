import type { FC } from 'react'

export interface UserPromptInputProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  hideLabel?: boolean
  readOnly?: boolean
  autoHeight?: boolean
  minEditorHeight?: number
  placeholder?: string
  resolveType?: (label: string) => string
}

declare const UserPromptInput: FC<UserPromptInputProps>
export default UserPromptInput
