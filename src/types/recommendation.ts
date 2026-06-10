export type RecommendationGapType = 'procedure' | 'knowledge' | 'action'
export type RecommendationImpact = 'high' | 'medium'
export type RecommendationStatus = 'pending' | 'accepted' | 'rejected'
export type RecommendationSubType = 'new' | 'modification'
export type KnowledgeSource = 'business-details' | 'document'

export interface ConversationMessage {
  id: string
  sender: 'customer' | 'agent'
  text: string
  time: string
}

export interface ConversationRef {
  id: string
  customerName: string
  snippet: string
  date: string
  channel: 'voice' | 'chat' | 'text'
  messages: ConversationMessage[]
  simulatedMessages: ConversationMessage[]
}

export interface ProcedureContent {
  whenToUse: string
  steps: { title: string; bullets: string[] }[]
  tools: string[]
}

export interface KnowledgeContent {
  contentTitle: string
  source: KnowledgeSource
  missingFields?: string[]
  contentBody: string[]
  guideline: string
}

export interface ActionContent {
  toolName: string
  toolDescription: string
  toolCategory: string
}

export interface RecommendationItem {
  id: string
  type: RecommendationGapType
  subType: RecommendationSubType
  title: string
  description: string
  impact: RecommendationImpact
  timestamp: string
  status: RecommendationStatus
  conversationCount: number
  conversations: ConversationRef[]
  existingProcedureId?: string
  procedureContent?: ProcedureContent
  knowledgeContent?: KnowledgeContent
  actionContent?: ActionContent
}
