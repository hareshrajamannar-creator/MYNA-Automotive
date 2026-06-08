export interface AgentWorkflow {
  nodes: any[]
  nodeDetails: Record<string, any>
}

// Helper — all triggers use Conversation trigger subtype
const CONV_TRIGGER = {
  flowType: 'trigger' as const,
  data: {
    subtype: 'Conversation trigger',
    headerLabel: 'Conversation trigger',
    hasToggle: true,
    toggleEnabled: true,
    titlePlaceholder: 'Enter trigger name',
    descriptionPlaceholder: 'Enter description',
    hasAiIcon: false,
  },
}

// ─── Frontdesk Agent ─────────────────────────────────────────────────────────
// Workflow: Conversation trigger → Procedures (greet, detect intent, route)

const FRONTDESK_NODES = [
  { id: 'fd-1', ...CONV_TRIGGER, data: { ...CONV_TRIGGER.data, title: 'Channel' } },
  {
    id: 'fd-2',
    flowType: 'procedures',
    data: { title: 'Route to Procedure', subtype: 'Procedures', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' },
  },
]

const FRONTDESK_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Frontdesk agent',
    goals: 'Serves as the first point of contact for all inbound calls, texts, and chats — resolving customer inquiries, scheduling service and sales appointments, answering vehicle and inventory questions, verifying eligibility, and escalating complex cases to the right department or advisor.',
    outcomes: [
      "1. Customer inquiry is resolved or routed without human intervention",
      "2. Service or sales appointment is confirmed, modified, or cancelled and reflected in the DMS",
      "3. Vehicle availability, pricing, and recall status questions are answered instantly from live inventory and NHTSA data",
      "4. No customer is left waiting without a response or a clear next step",
      "5. Escalations include a full conversation summary and identified customer intent for the receiving advisor",
    ].join('\n'),
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
  },
  'fd-1': {
    triggerName: 'Inbound conversation',
    description: 'Fires when any inbound customer interaction is received — voice call, webchat message, or SMS text from any configured location.',
    voiceRows: [{ id: 'voice-1', condition: 'incoming_call', time: 'during_business' }],
    webChatRows: [{ id: 'web-1', condition: 'message_received', time: 'during_business' }],
  },
  'fd-2': {
    procedureIds: [
      'Greeting & Intent Detection',
      'Department Transfer',
      'General Inquiry',
      'Handle Unclear Message',
      'Emergency / Urgent Handling',
      'Talk to Human',
      'Spanish Language Handling',
      'Schedule Service Appointment',
      'Repair / Diagnostic Triage',
      'Recall Inquiry',
      'Service Status Check',
      'Reschedule / Cancel Appointment',
      'Warranty Inquiry',
      'New Vehicle Inquiry',
      'Parts Availability & Pricing',
      'After-Hours Lead Capture',
      'After-Hours Service Request',
    ],
  },
}

// ─── Reminder Agent ──────────────────────────────────────────────────────────
// Workflow: Conversation trigger → Send confirmation → Delay 24h → SMS reminder
//           → Branch (Confirmed | Reschedule | No response → Delay 22h → Voice call)

const REMINDER_NODES = [
  { id: 'rem-1', ...CONV_TRIGGER, data: { ...CONV_TRIGGER.data, title: 'Appointment Scheduled' } },
  {
    id: 'rem-2',
    flowType: 'task',
    data: { title: 'Send Appointment Confirmation', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'rem-3',
    flowType: 'delay',
    data: { title: 'Wait until T-24h', subtype: 'Delay', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter delay name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'rem-4',
    flowType: 'task',
    data: { title: 'T-24h SMS Reminder', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'rem-5',
    flowType: 'branch',
    data: { title: 'Customer Response', subtype: 'Branch', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter branch name', descriptionPlaceholder: 'Enter description' },
  },
]

const REMINDER_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Reminder agent',
    goals: 'Manages appointment confirmation and reminder journeys through multi-channel touchpoints — SMS, voice, and email — to reduce no-shows, keep the service lane fully scheduled, and surface rebooking opportunities automatically.',
    outcomes: [
      '1. Appointment confirmation is sent immediately after booking and reflected in the DMS',
      '2. T-24h and T-2h reminders are delivered on schedule with one-click confirm or reschedule options',
      '3. No-shows are re-engaged within 2 hours with an empathetic SMS and rescheduling link',
      '4. Confirmed and rescheduled responses update the DMS record without human involvement',
      '5. Escalations and cancellations include a reason code for analytics and service advisor awareness',
    ].join('\n'),
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
  },
  'rem-1': {
    triggerName: 'Appointment Scheduled',
    description: 'Fires when a new appointment is created or confirmed in the DMS for any configured location.',
    voiceConditions: [{ field: 'event', operator: 'is', value: 'Appointment created in DMS' }],
    webchatConditions: [{ field: 'event', operator: 'is', value: 'SMS opt-in received' }],
  },
  'rem-2': {
    taskName: 'Send Appointment Confirmation',
    description: 'Send immediate SMS confirmation with appointment details, date, time, and service advisor name.',
    selectedTools: ['send-confirmation'],
  },
  'rem-3': { name: 'Wait until T-24h', duration: '24', unit: 'hours' },
  'rem-4': {
    taskName: 'T-24h SMS Reminder',
    description: 'Send SMS reminder with confirm/reschedule quick-reply options 24 hours before the appointment.',
    selectedTools: ['schedule-appointment'],
  },
  'rem-5': {
    basedOn: 'conditions',
    branches: [
      { id: 'rem-5-path-1', name: 'Confirmed' },
      { id: 'rem-5-path-2', name: 'Reschedule Requested' },
      { id: 'rem-5-path-fallback', name: 'No response', isFallback: true },
    ],
  },
  'rem-5-path-1': {
    branchName: 'Confirmed',
    description: 'Customer confirmed appointment via quick-reply or voice',
    conditions: [],
    parentId: 'rem-5',
    isBranchPath: true,
    nodes: [
      { id: 'rem-6', flowType: 'task', data: { title: 'Mark Confirmed & Close Journey', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'rem-5-path-2': {
    branchName: 'Reschedule Requested',
    description: 'Customer requested to reschedule or cancel',
    conditions: [],
    parentId: 'rem-5',
    isBranchPath: true,
    nodes: [
      { id: 'rem-7', flowType: 'procedures', data: { title: 'Process Reschedule', subtype: 'Procedures', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'rem-5-path-fallback': {
    branchName: 'No response',
    description: 'No response received — escalate to T-2h voice call',
    conditions: [],
    parentId: 'rem-5',
    isBranchPath: true,
    isFallback: true,
    nodes: [
      { id: 'rem-8', flowType: 'delay', data: { title: 'Wait until T-2h', subtype: 'Delay', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter delay name', descriptionPlaceholder: 'Enter description' } },
      { id: 'rem-9', flowType: 'task', data: { title: 'T-2h Voice Confirmation Call', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'rem-6': {
    taskName: 'Mark Confirmed & Close Journey',
    description: 'Mark appointment as confirmed in DMS and end the reminder journey.',
    selectedTools: ['crm-update'],
  },
  'rem-7': { procedureIds: ['Reschedule / Cancel Appointment'] },
  'rem-8': { name: 'Wait until T-2h', duration: '22', unit: 'hours' },
  'rem-9': {
    taskName: 'T-2h Voice Confirmation Call',
    description: 'Place outbound voice call for final confirmation 2 hours before the appointment.',
    selectedTools: ['voice-call'],
  },
}

// ─── Outreach Agent ──────────────────────────────────────────────────────────
// Workflow: Conversation trigger → LLM outreach call → Branch (Interested | No Answer | Objection)

const OUTREACH_NODES = [
  { id: 'out-1', ...CONV_TRIGGER, data: { ...CONV_TRIGGER.data, title: 'Internet Lead Received' } },
  {
    id: 'out-2',
    flowType: 'task',
    data: { title: 'Initial Outreach Call', subtype: 'Custom', hasToggle: true, toggleEnabled: true, hasAiIcon: true, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'out-3',
    flowType: 'branch',
    data: { title: 'Lead Response', subtype: 'Branch', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter branch name', descriptionPlaceholder: 'Enter description' },
  },
]

const OUTREACH_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Outreach agent',
    goals: 'Executes proactive outbound journey workflows — internet lead follow-up, no-show re-engagement, recall notifications, equity mining, and lifecycle marketing — ensuring every lead and customer receives a timely, personalised touchpoint at every stage of the ownership journey.',
    outcomes: [
      '1. Internet leads are contacted within 5 minutes of submission at speed-to-lead P0 targets',
      '2. Qualification notes, vehicle interest, and timeline are captured in CRM on every call',
      '3. Hot leads ready to buy today are transferred immediately to an available sales consultant',
      '4. No-shows and unsold showroom visitors receive re-engagement within 2 hours via SMS',
      '5. All outbound touches comply with TCPA, DNC, and opt-out rules with automatic suppression',
    ].join('\n'),
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
  },
  'out-1': {
    triggerName: 'Internet Lead Received',
    description: 'Fires when a new internet lead is submitted from any configured lead source or website inquiry form.',
    voiceConditions: [{ field: 'event', operator: 'is', value: 'New internet lead submitted' }],
    webchatConditions: [{ field: 'event', operator: 'is', value: 'Website inquiry form submitted' }],
  },
  'out-2': {
    taskName: 'Initial Outreach Call',
    description: 'Introduce self, reference the specific inquiry, confirm interest and ask qualifying questions. Present matching inventory and offer test drive. Initiate within 5 minutes of lead receipt.',
    llmModel: 'Fast',
    systemPrompt: "You are calling on behalf of the dealership to follow up on an internet lead. Be professional, friendly, and reference the specific vehicle or inquiry. Your goal is to confirm interest, ask qualifying questions (budget, timeline, trade-in), and schedule a test drive or appointment.",
    userPrompt: 'Lead inquiry: {{Lead_inquiry}}\nVehicle interest: {{Vehicle_interest}}\nCustomer name: {{Customer_name}}',
  },
  'out-3': {
    basedOn: 'conditions',
    branches: [
      { id: 'out-3-path-1', name: 'Interested / Engaged' },
      { id: 'out-3-path-2', name: 'No Answer' },
      { id: 'out-3-path-fallback', name: 'Objection / Transfer', isFallback: true },
    ],
  },
  'out-3-path-1': {
    branchName: 'Interested / Engaged',
    description: 'Lead expressed interest — qualify and schedule',
    conditions: [],
    parentId: 'out-3',
    isBranchPath: true,
    nodes: [
      { id: 'out-4', flowType: 'procedures', data: { title: 'Qualify Lead & Schedule', subtype: 'Procedures', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'out-3-path-2': {
    branchName: 'No Answer',
    description: 'Lead did not answer — leave voicemail and follow up via SMS',
    conditions: [],
    parentId: 'out-3',
    isBranchPath: true,
    nodes: [
      { id: 'out-5', flowType: 'task', data: { title: 'Voicemail + Follow-Up SMS', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'out-3-path-fallback': {
    branchName: 'Objection / Transfer',
    description: 'Lead raised an objection or requested a manager',
    conditions: [],
    parentId: 'out-3',
    isBranchPath: true,
    isFallback: true,
    nodes: [
      { id: 'out-6', flowType: 'task', data: { title: 'Transfer to Sales Manager', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'out-4': { procedureIds: ['Internet Lead Qualification', 'Test Drive Scheduling'] },
  'out-5': {
    taskName: 'Voicemail + Follow-Up SMS',
    description: 'Leave professional voicemail referencing the inquiry, then send follow-up SMS with callback link and top inventory match.',
    selectedTools: ['voice-call'],
  },
  'out-6': {
    taskName: 'Transfer to Sales Manager',
    description: 'Immediately transfer to available sales manager. Log objection or manager request in CRM with full conversation context.',
    selectedTools: ['trigger-escalation'],
  },
}

// ─── Healthcare / Dental Frontdesk node details ───────────────────────────────

const FRONTDESK_HC_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Front desk agent - North region',
    goals: 'Serves as the first point of contact for inbound calls, texts, and chats, resolving patient inquiries, managing appointments, verifying insurance, and escalating complex cases when needed',
    outcomes: [
      "1. Patient's query is resolved or routed without human intervention",
      '2. Appointment is confirmed, modified, or cancelled and reflected in the system',
      '3. Insurance verification is completed prior to appointment confirmation',
      '4. No patient is left waiting without a response or a clear next step',
      '5. Escalations include a full summary of the conversation and identified intent',
    ].join('\n'),
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
  },
  'fd-1': { ...FRONTDESK_NODE_DETAILS['fd-1'] },
  'fd-2': {
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
  },
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const AUTOMOTIVE_AGENT_WORKFLOWS: Record<string, AgentWorkflow> = {
  'Frontdesk agent': { nodes: FRONTDESK_NODES, nodeDetails: FRONTDESK_NODE_DETAILS },
  'Reminder agent':  { nodes: REMINDER_NODES,  nodeDetails: REMINDER_NODE_DETAILS  },
  'Outreach agent':  { nodes: OUTREACH_NODES,  nodeDetails: OUTREACH_NODE_DETAILS  },
}

export const HEALTHCARE_AGENT_WORKFLOWS: Record<string, AgentWorkflow> = {
  'Frontdesk agent': { nodes: FRONTDESK_NODES, nodeDetails: FRONTDESK_HC_NODE_DETAILS },
  'Reminder agent':  { nodes: REMINDER_NODES,  nodeDetails: REMINDER_NODE_DETAILS     },
  'Outreach agent':  { nodes: OUTREACH_NODES,  nodeDetails: OUTREACH_NODE_DETAILS     },
}

// Dental shares the healthcare configuration
export const DENTAL_AGENT_WORKFLOWS = HEALTHCARE_AGENT_WORKFLOWS

// Default export kept for backward compat
export const AGENT_WORKFLOWS = AUTOMOTIVE_AGENT_WORKFLOWS

export function getAgentWorkflows(product?: string) {
  if (product === 'healthcare' || product === 'dental') return HEALTHCARE_AGENT_WORKFLOWS
  return AUTOMOTIVE_AGENT_WORKFLOWS
}
