import React, { Suspense } from 'react'
import {
  AUTOMOTIVE_AGENT_WORKFLOWS,
  HEALTHCARE_AGENT_WORKFLOWS,
  DENTAL_AGENT_WORKFLOWS,
} from '../data/agentWorkflows'
import { useProcedureStore } from '../data/ProcedureStoreContext'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AgentBuilderRaw from '../workflow/AgentBuilder/AgentBuilder'

// Cast to accept any props so TypeScript doesn't complain about JSX prop types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AgentBuilder = AgentBuilderRaw as unknown as React.ComponentType<any>

const EMPTY_WORKFLOW = {
  nodes: [],
  nodeDetails: { '__start__': { agentName: '', goals: '', outcomes: '', locations: [] } },
}

// Healthcare / Dental Frontdesk start-node details — defined inline to avoid
// any module-cache staleness from agentWorkflows.ts.
const HC_FRONTDESK_START = {
  agentName: 'Front desk agent',
  goals: 'Serves as the first point of contact for inbound calls, texts, and chats, resolving patient inquiries, managing appointments, verifying insurance, and escalating complex cases when needed',
  outcomes:
    "1. Patient's query is resolved or routed without human intervention\n" +
    '2. Appointment is confirmed, modified, or cancelled and reflected in the system\n' +
    '3. Insurance verification is completed prior to appointment confirmation\n' +
    '4. No patient is left waiting without a response or a clear next step\n' +
    '5. Escalations include a full summary of the conversation and identified intent',
  locations: [
    '1001 - Mountain View, CA',
    '1002 - Seattle, WA',
    '1004 - Chicago, IL',
    '1006 - Las Vegas, NV',
    '1007 - Dallas, TX',
    '1008 - Houston, TX',
    '1009 - Phoenix, AZ',
    '1010 - San Diego, CA',
    '1011 - Portland, OR',
    '1012 - Denver, CO',
    '1013 - Atlanta, GA',
    '1014 - Miami, FL',
  ],
}

interface WorkflowEditorScreenProps {
  agentName: string
  onClose: () => void
  product?: string
  agentStatus?: string
}

export function WorkflowEditorScreen({
  agentName,
  onClose,
  product = 'automotive',
  agentStatus = 'Running',
}: WorkflowEditorScreenProps) {
  const { procedures, addProcedure } = useProcedureStore()
  const agentBaseName = agentName.replace(/ - .+$/, '')
  const isHCProduct = product === 'healthcare' || product === 'dental'
  const filteredProcedures = procedures.filter((p) =>
    isHCProduct ? p.category === 'Healthcare Frontdesk' : p.category !== 'Healthcare Frontdesk'
  )

  // For healthcare / dental, patch the __start__ node details directly here
  // so we never rely on the agentWorkflows module cache being fresh.
  const isHC = product === 'healthcare' || product === 'dental'
  const workflowMap =
    product === 'healthcare' ? HEALTHCARE_AGENT_WORKFLOWS :
    product === 'dental'     ? DENTAL_AGENT_WORKFLOWS     :
                               AUTOMOTIVE_AGENT_WORKFLOWS
  const baseWorkflow = workflowMap[agentBaseName] ?? EMPTY_WORKFLOW

  const HC_FRONTDESK_FD2 = {
    procedureIds: [
      'Handle general inquiry',
      'Talk to human',
      'Book new appointment',
      'Reschedule appointment',
      'Cancel appointment',
      'Handle slot conflict',
      'Handle booking failure',
      'Verify insurance',
      'Appointment confirmation',
      'Waitlist slot confirmation',
      'Handle emergency or urgent concern',
      'Handle unclear message',
    ],
  }

  const workflow = isHC && agentBaseName === 'Frontdesk agent'
    ? {
        nodes: baseWorkflow.nodes,
        nodeDetails: {
          ...baseWorkflow.nodeDetails,
          '__start__': HC_FRONTDESK_START,
          'fd-2': HC_FRONTDESK_FD2,
        },
      }
    : baseWorkflow

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-sm text-gray-400">Loading…</div>}>
        <AgentBuilder
          key={`${agentName}::${product}`}
          pageTitle={agentName}
          appTitle={agentName}
          onClose={onClose}
          product={product}
          moduleSlug="myna"
          moduleContext="myna"
          sectionContext="workflow"
          navItems={[]}
          initialNodes={workflow.nodes}
          initialNodeDetails={workflow.nodeDetails}
          procedures={filteredProcedures}
          onAddProcedure={addProcedure}
          initialStatus={agentStatus}
        />
      </Suspense>
    </div>
  )
}
