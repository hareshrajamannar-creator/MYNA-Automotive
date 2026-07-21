import React, { createContext, useContext, useState } from 'react'
import { FEEDBACK_RECORDS, type FeedbackRecord, type FeedbackStatus } from './feedbackData'

interface FeedbackStore {
  records: FeedbackRecord[]
  addRecord: (record: FeedbackRecord) => void
  updateStatus: (id: string, status: FeedbackStatus) => void
  recordsForAgent: (agentName: string) => FeedbackRecord[]
}

const FeedbackStoreContext = createContext<FeedbackStore | null>(null)

export function FeedbackStoreProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<FeedbackRecord[]>(FEEDBACK_RECORDS)

  const addRecord = (record: FeedbackRecord) =>
    setRecords((prev) => [record, ...prev])

  const updateStatus = (id: string, status: FeedbackStatus) =>
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

  const recordsForAgent = (agentName: string) =>
    records.filter((r) => r.agentName === agentName)

  return (
    <FeedbackStoreContext.Provider value={{ records, addRecord, updateStatus, recordsForAgent }}>
      {children}
    </FeedbackStoreContext.Provider>
  )
}

export function useFeedbackStore(): FeedbackStore {
  const ctx = useContext(FeedbackStoreContext)
  if (!ctx) throw new Error('useFeedbackStore must be used inside FeedbackStoreProvider')
  return ctx
}
