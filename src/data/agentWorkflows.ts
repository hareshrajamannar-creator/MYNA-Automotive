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
    agentName: 'Front desk agent',
    goals: 'Serves as the first point of contact for inbound calls, texts, and chats — routing customer inquiries, scheduling service and sales appointments, answering vehicle and inventory questions, and escalating complex cases to the right department.',
    outcomes: `1. Customer inquiry is resolved or routed without human intervention
2. Service or sales appointment is confirmed, modified, or cancelled and reflected in the DMS
3. Vehicle availability and pricing questions are answered instantly from inventory data
4. No customer is left waiting without a response or a clear next step
5. Escalations include a full summary of the conversation and identified customer intent`,
    locations: ['1001 - Mountain View, CA', '1002 - Seattle, WA', '1004 - Chicago, IL', '1006 - Las Vegas, NV'],
  },
  'fd-1': {
    triggerName: 'Channel',
    description: 'Starts when a voice, chat, or text conversation begins',
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
      'Used / CPO Vehicle Inquiry',
      'Trade-In Valuation',
      'Finance Pre-Qualification',
      'Test Drive Scheduling',
      'Internet Lead Qualification',
      'Parts Availability & Pricing',
      'After-Hours Lead Capture',
      'After-Hours Service Request',
    ],
  },
}

// ─── Reminder Agent ──────────────────────────────────────────────────────────

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
    goals: 'Execute proactive outbound journey workflows covering lead follow-up, customer re-engagement, recall notifications, and lifecycle marketing. Contact internet leads within 5 minutes of submission.',
    outcomes: 'Leads are contacted at speed-to-lead P0 targets, qualification notes are logged in CRM, and hot leads are immediately transferred to available sales consultants.',
    locations: ['1001 - Mountain View, CA', '1002 - Seattle, WA', '1004 - Chicago, IL', '1006 - Las Vegas, NV'],
  },
  'out-1': {
    triggerName: 'Internet Lead Received',
    description: 'Starts when a new internet lead is submitted from any configured lead source or website inquiry form.',
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
    goals: 'Serves as the first point of contact for inbound calls, texts, and chats — routing customer inquiries, scheduling service and sales appointments, answering vehicle and inventory questions, and escalating complex cases to the right department.',
    outcomes: [
      '1. Customer inquiry is resolved or routed without human intervention',
      '2. Service or sales appointment is confirmed, modified, or cancelled and reflected in the DMS',
      '3. Vehicle availability and pricing questions are answered instantly from inventory data',
      '4. No customer is left waiting without a response or a clear next step',
      '5. Escalations include a full summary of the conversation and identified customer intent',
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
      'Used / CPO Vehicle Inquiry',
      'Trade-In Valuation',
      'Finance Pre-Qualification',
      'Test Drive Scheduling',
      'Internet Lead Qualification',
      'Parts Availability & Pricing',
      'After-Hours Lead Capture',
      'After-Hours Service Request',
    ],
  },
}


const HEALTHCARE_REMINDER_NODES = [
  { id: 'hcr-1', flowType: 'trigger',    data: { title: 'Appointment is booked',          subtype: 'Appointment booked', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter trigger name',          descriptionPlaceholder: 'Enter description' } },
  { id: 'hcr-2', flowType: 'task',       data: { title: 'Appointment reminder',            subtype: 'Integration',        hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',             descriptionPlaceholder: '3 weeks, 3 days and 24 hours before · Email & text' } },
  { id: 'hcr-3', flowType: 'delay',      data: { title: 'Until 12 hrs before appointment', subtype: 'Delay',              hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings',    descriptionPlaceholder: 'Waits for a specific time or event' } },
  { id: 'hcr-4', flowType: 'branch',     data: { title: 'Based on conditions',             subtype: 'Branch',             hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter branch name',           descriptionPlaceholder: 'Appointment confirmed or not?' } },
]

const HEALTHCARE_REMINDER_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Reminder agent - North region',
    goals: 'Reduce appointment no-shows through automated multi-channel reminders sent at 3 weeks, 3 days, and 24 hours before each appointment, with live agent handoff on patient request.',
    outcomes:
      '1. Appointment confirmation rates improve\n' +
      '2. No-show rate decreases\n' +
      '3. Patients receive timely reminders with one-click reschedule options\n' +
      '4. Unanswered calls trigger SMS follow-up automatically\n' +
      '5. Live agent handoff is seamless when patients request it',
    locations: [
      '1001 - Mountain View, CA',
      '1002 - Seattle, WA',
      '1004 - Chicago, IL',
      '1006 - Las Vegas, NV',
      '1007 - Dallas, TX',
      '1013 - Atlanta, GA',
    ],
  },
  'hcr-1': {
    triggerName: 'Appointment is booked',
    description: 'Starts when a new appointment is created or confirmed in the system for any configured location.',
    conditions: [
      { id: 1, fieldValue: 'appointment_status', operatorValue: 'equals', valueValue: 'booked' },
    ],
    conditionOptions: {
      field: [
        { value: 'appointment_status', label: 'Appointment status' },
        { value: 'appointment_type',   label: 'Appointment type' },
        { value: 'location',           label: 'Location' },
        { value: 'provider',           label: 'Provider' },
        { value: 'insurance_verified', label: 'Insurance verified' },
      ],
      operator: [
        { value: 'equals',     label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains',   label: 'Contains' },
        { value: 'is_set',     label: 'Is set' },
      ],
      value: [
        { value: 'booked',    label: 'Booked' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending',   label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'rescheduled', label: 'Rescheduled' },
      ],
    },
  },
  'hcr-2': {
    taskName: 'Appointment reminder',
    description: '3 weeks, 3 days and 24 hours before · Email & text',
    selectedTools: ['reminder-tool'],
  },
  'hcr-3': { name: 'Until 12 hrs before appointment', duration: '12', unit: 'hours' },
  'hcr-4': {
    basedOn: 'conditions',
    branches: [
      { id: 'hcr-4-path-1', name: 'Appointment not confirmed' },
      { id: 'hcr-4-path-2', name: 'Appointment confirmed', isFallback: true },
    ],
  },
  'hcr-4-path-1': {
    branchName: 'Appointment not confirmed',
    description: 'Patient replied and confirmed the appointment.',
    conditions: [
      { id: 1, fieldValue: 'patient_response', operatorValue: 'equals', valueValue: 'confirmed' },
    ],
    conditionOptions: {
      field: [
        { value: 'patient_response',    label: 'Patient response' },
        { value: 'appointment_status',  label: 'Appointment status' },
        { value: 'reminder_channel',    label: 'Reminder channel' },
        { value: 'response_time',       label: 'Response time' },
      ],
      operator: [
        { value: 'equals',     label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains',   label: 'Contains' },
        { value: 'is_set',     label: 'Is set' },
      ],
      value: [
        { value: 'confirmed',    label: 'Confirmed' },
        { value: 'cancelled',    label: 'Cancelled' },
        { value: 'rescheduled',  label: 'Rescheduled' },
        { value: 'no_response',  label: 'No response' },
      ],
    },
    parentId: 'hcr-4',
    isBranchPath: true,
    nodes: [
      { id: 'hcr-5', flowType: 'voiceCall', data: { title: 'Initiate voice call', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter name', descriptionPlaceholder: 'Call the patient for their upcoming appointment' } },
    ],
  },
  'hcr-4-path-2': {
    branchName: 'Appointment confirmed',
    description: 'Patient did not respond or did not confirm the appointment.',
    conditions: [
      { id: 1, fieldValue: 'patient_response', operatorValue: 'equals', valueValue: 'no_response' },
    ],
    conditionOptions: {
      field: [
        { value: 'patient_response',    label: 'Patient response' },
        { value: 'appointment_status',  label: 'Appointment status' },
        { value: 'reminder_channel',    label: 'Reminder channel' },
        { value: 'response_time',       label: 'Response time' },
      ],
      operator: [
        { value: 'equals',     label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains',   label: 'Contains' },
        { value: 'is_set',     label: 'Is set' },
      ],
      value: [
        { value: 'confirmed',    label: 'Confirmed' },
        { value: 'cancelled',    label: 'Cancelled' },
        { value: 'rescheduled',  label: 'Rescheduled' },
        { value: 'no_response',  label: 'No response' },
      ],
    },
    parentId: 'hcr-4',
    isBranchPath: true,
    isFallback: true,
    nodes: [
      { id: 'hcr-10', flowType: 'task', data: { title: 'Send text reminder', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: '3 hours before' } },
    ],
  },
  'hcr-5': {
    taskName: 'Initiate voice call',
    description: 'Calls the patient for their upcoming appointment',
    toolId: 'initiate-voice-call',
    branches: [
      { id: 'hcr-5-vc-completed', name: 'Call answered', isVoiceCallBranch: true, isFallback: false },
      { id: 'hcr-5-vc-rejected',  name: 'Call rejected',  isVoiceCallBranch: true, isFallback: false },
      { id: 'hcr-5-vc-missed',    name: 'Call missed',    isVoiceCallBranch: true, isFallback: true  },
      { id: 'hcr-5-vc-voicemail', name: 'Voicemail',     isVoiceCallBranch: true, isFallback: false },
    ],
  },
  'hcr-5-vc-completed': {
    branchName: 'Call answered',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [
      { id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'answered' },
    ],
    conditionOptions: {
      field: [
        { value: 'call_status',      label: 'Call status' },
        { value: 'call_duration',    label: 'Call duration' },
        { value: 'patient_response', label: 'Patient response' },
        { value: 'call_attempt',     label: 'Call attempt' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'answered',   label: 'Answered' },
        { value: 'rejected',   label: 'Rejected' },
        { value: 'missed',     label: 'Missed' },
        { value: 'voicemail',  label: 'Voicemail' },
      ],
    },
    parentId: 'hcr-5',
    isBranchPath: true,
    nodes: [
      { id: 'hcr-6', flowType: 'subagent', data: { title: 'Front desk agent - North region', subtype: 'Sub-agent', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Call subagent', descriptionPlaceholder: 'Call subagent workflow.' } },
    ],
  },
  'hcr-5-vc-rejected': {
    branchName: 'Call rejected',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [
      { id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'rejected' },
    ],
    conditionOptions: {
      field: [
        { value: 'call_status',      label: 'Call status' },
        { value: 'call_duration',    label: 'Call duration' },
        { value: 'patient_response', label: 'Patient response' },
        { value: 'call_attempt',     label: 'Call attempt' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'answered',   label: 'Answered' },
        { value: 'rejected',   label: 'Rejected' },
        { value: 'missed',     label: 'Missed' },
        { value: 'voicemail',  label: 'Voicemail' },
      ],
    },
    parentId: 'hcr-5',
    isBranchPath: true,
    nodes: [
      { id: 'hcr-7', flowType: 'delay', data: { title: 'Wait 2 hours',       subtype: 'Delay',        hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits for a specific time or event' } },
      { id: 'hcr-8', flowType: 'task',  data: { title: 'Send text reminder',  subtype: 'Integration',  hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Enter description' } },
    ],
  },
  'hcr-5-vc-missed': {
    branchName: 'Call missed',
    isVoiceCallBranch: true,
    isFallback: true,
    conditions: [
      { id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'missed' },
    ],
    conditionOptions: {
      field: [
        { value: 'call_status',      label: 'Call status' },
        { value: 'call_duration',    label: 'Call duration' },
        { value: 'patient_response', label: 'Patient response' },
        { value: 'call_attempt',     label: 'Call attempt' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'answered',   label: 'Answered' },
        { value: 'rejected',   label: 'Rejected' },
        { value: 'missed',     label: 'Missed' },
        { value: 'voicemail',  label: 'Voicemail' },
      ],
    },
    parentId: 'hcr-5',
    isBranchPath: true,
    nodes: [
      { id: 'hcr-11', flowType: 'delay', data: { title: 'Wait 2 hours',      subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits for a specific time or event' } },
      { id: 'hcr-9',  flowType: 'task',  data: { title: 'Send text reminder', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: '3 hours before' } },
    ],
  },
  'hcr-5-vc-voicemail': {
    branchName: 'Voicemail',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [
      { id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'voicemail' },
    ],
    conditionOptions: {
      field: [
        { value: 'call_status',      label: 'Call status' },
        { value: 'call_duration',    label: 'Call duration' },
        { value: 'patient_response', label: 'Patient response' },
        { value: 'call_attempt',     label: 'Call attempt' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'answered',   label: 'Answered' },
        { value: 'rejected',   label: 'Rejected' },
        { value: 'missed',     label: 'Missed' },
        { value: 'voicemail',  label: 'Voicemail' },
      ],
    },
    parentId: 'hcr-5',
    isBranchPath: true,
    nodes: [],
  },
  'hcr-6': { selectedAgent: 'frontdesk-north', name: 'Front desk agent - North region', description: 'Transfers to the front desk agent for assisted patient handling', intent: 'Reminder' },
  'hcr-7': { name: 'Wait 2 hours',       duration: '2', unit: 'hours' },
  'hcr-8': { taskName: 'Send text reminder', description: '3 hours before', selectedTools: ['send-confirmation'] },
  'hcr-9':  { taskName: 'Send text reminder', description: '3 hours before', selectedTools: ['send-confirmation'] },
  'hcr-10': { taskName: 'Send text reminder', description: '3 hours before', selectedTools: ['send-confirmation'] },
  'hcr-11': { name: 'Wait 2 hours', duration: '2', unit: 'hours' },
}

export const AUTOMOTIVE_AGENT_WORKFLOWS: Record<string, AgentWorkflow> = {
  'Front desk agent': { nodes: FRONTDESK_NODES,           nodeDetails: FRONTDESK_NODE_DETAILS           },
  'Reminder agent':  { nodes: HEALTHCARE_REMINDER_NODES,  nodeDetails: HEALTHCARE_REMINDER_NODE_DETAILS },
  'Outreach agent':  { nodes: OUTREACH_NODES,             nodeDetails: OUTREACH_NODE_DETAILS            },
}

export const HEALTHCARE_AGENT_WORKFLOWS: Record<string, AgentWorkflow> = {
  'Front desk agent': { nodes: FRONTDESK_NODES,             nodeDetails: FRONTDESK_HC_NODE_DETAILS          },
  'Reminder agent':  { nodes: HEALTHCARE_REMINDER_NODES,   nodeDetails: HEALTHCARE_REMINDER_NODE_DETAILS   },
  'Outreach agent':  { nodes: OUTREACH_NODES,              nodeDetails: OUTREACH_NODE_DETAILS              },
}

// ─── Shared voice-call conditionOptions (reused across all three dental agents) ─

const VC_CONDITION_OPTIONS = {
  field: [
    { value: 'call_status',      label: 'Call status' },
    { value: 'call_duration',    label: 'Call duration' },
    { value: 'patient_response', label: 'Patient response' },
    { value: 'call_attempt',     label: 'Call attempt' },
  ],
  operator: [
    { value: 'equals',       label: 'Equals' },
    { value: 'not_equals',   label: 'Does not equal' },
    { value: 'greater_than', label: 'Greater than' },
  ],
  value: [
    { value: 'answered',  label: 'Answered' },
    { value: 'rejected',  label: 'Rejected' },
    { value: 'missed',    label: 'Missed' },
    { value: 'voicemail', label: 'Voicemail' },
  ],
}

// ─── Dental: Recall Agent ────────────────────────────────────────────────────
// Sketch: trigger → send recall email → send recall SMS → delay 2 days
//   → branch (app not booked / booked)
//     → "App not booked": initiate voice call
//         → call answered:  (empty — frontdesk routing done inside call)
//         → call rejected:  (empty)
//         → call missed:    delay 1 day → send recall SMS → branch (same condition)
//     → "Appointment booked" fallback: (empty)

const RECALL_NODES = [
  {
    id: 'rcl-1',
    flowType: 'trigger' as const,
    data: { title: 'Contact is added to segment: Hygiene recall', subtype: 'Trigger', headerLabel: 'Trigger', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter trigger name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'rcl-2',
    flowType: 'task' as const,
    data: { title: 'Send recall email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a personalized hygiene recall email with a self-schedule link' },
  },
  {
    id: 'rcl-3',
    flowType: 'task' as const,
    data: { title: 'Send recall text', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a short recall text with a booking link' },
  },
  {
    id: 'rcl-4',
    flowType: 'delay' as const,
    data: { title: 'Delay for 2 days', subtype: 'Delay', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits for a specific time or event' },
  },
  {
    id: 'rcl-5',
    flowType: 'branch' as const,
    data: { title: 'Based on conditions', subtype: 'Branch', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter branch name', descriptionPlaceholder: 'Appointment booked or not?' },
  },
]

const RECALL_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Recall agent',
    goals: 'Reactivate overdue patients by sending personalized recall outreach via email, text, and voice, and booking them into hygiene appointments.',
    outcomes:
      '1. Patient books a hygiene appointment via self-schedule link\n' +
      '2. Patient books over the phone during the voice call\n' +
      '3. Voicemail left. Patient calls back to book\n' +
      '4. Patient does not respond. Sequence completes without booking',
    locations: ['Atlanta, GA', 'Dallas, TX', 'Chicago, IL', 'Miami, FL'],
  },
  'rcl-1': {
    triggerName: 'Contact is added to segment: Hygiene recall',
    description: 'Starts when a contact is added to the Hygiene recall segment, indicating the patient is overdue for a hygiene visit.',
    conditions: [
      { id: 1, fieldValue: 'segment', operatorValue: 'equals', valueValue: 'hygiene_recall' },
    ],
    conditionOptions: {
      field: [
        { value: 'segment',         label: 'Segment' },
        { value: 'last_visit_date', label: 'Last visit date' },
        { value: 'recall_due_date', label: 'Recall due date' },
        { value: 'patient_status',  label: 'Patient status' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'hygiene_recall', label: 'Hygiene recall' },
        { value: 'active',         label: 'Active' },
        { value: 'inactive',       label: 'Inactive' },
      ],
    },
  },
  'rcl-2': {
    taskName: 'Send recall email',
    description: 'Sends a personalized hygiene recall email with a self-schedule link',
    selectedTools: ['send-confirmation', 'dms-integration'],
  },
  'rcl-3': {
    taskName: 'Send recall text',
    description: 'Sends a short recall text with a booking link',
    selectedTools: ['send-confirmation'],
  },
  'rcl-4': { name: 'Delay for 2 days', duration: '2', unit: 'days' },
  'rcl-5': {
    basedOn: 'conditions',
    branches: [
      { id: 'rcl-5-path-1', name: 'Appointment not booked' },
      { id: 'rcl-5-path-2', name: 'Appointment booked', isFallback: true },
    ],
  },
  'rcl-5-path-1': {
    branchName: 'Appointment not booked',
    description: 'Patient has not booked. Escalates to a voice call',
    conditions: [
      { id: 1, fieldValue: 'future_appointment', operatorValue: 'equals', valueValue: 'false' },
    ],
    conditionOptions: {
      field: [
        { value: 'future_appointment', label: 'Future appointment' },
        { value: 'appointment_status', label: 'Appointment status' },
        { value: 'booking_response',   label: 'Booking response' },
      ],
      operator: [
        { value: 'equals',     label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
      ],
      value: [
        { value: 'true',  label: 'True' },
        { value: 'false', label: 'False' },
      ],
    },
    parentId: 'rcl-5',
    isBranchPath: true,
    nodes: [
      {
        id: 'rcl-6',
        flowType: 'voiceCall',
        data: { title: 'Initiate voice call', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter name', descriptionPlaceholder: 'Calls the patient to book a hygiene recall appointment', branches: [{ id: 'rcl-6-vc-completed', name: 'Call answered', isVoiceCallBranch: true }, { id: 'rcl-6-vc-rejected', name: 'Call rejected', isVoiceCallBranch: true }, { id: 'rcl-6-vc-missed', name: 'Call missed', isVoiceCallBranch: true }, { id: 'rcl-6-vc-voicemail', name: 'Voicemail', isVoiceCallBranch: true, isFallback: true }] },
      },
    ],
  },
  'rcl-5-path-2': {
    branchName: 'Appointment booked',
    description: 'Patient already booked. No further outreach needed',
    conditions: [
      { id: 1, fieldValue: 'future_appointment', operatorValue: 'equals', valueValue: 'true' },
    ],
    conditionOptions: {
      field: [
        { value: 'future_appointment', label: 'Future appointment' },
        { value: 'appointment_status', label: 'Appointment status' },
      ],
      operator: [{ value: 'equals', label: 'Equals' }],
      value: [{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }],
    },
    parentId: 'rcl-5',
    isBranchPath: true,
    isFallback: true,
    nodes: [],
  },
  'rcl-6': {
    taskName: 'Initiate voice call',
    description: 'Calls the patient to book a hygiene recall appointment',
    toolId: 'initiate-voice-call',
    phoneNumber: 'Contact.PhoneNumber',
    callFrom: '',
    startingProcedure: 'Hygiene recall procedure',
    routeToFrontdesk: true,
    contextItems: [
      { id: '1', label: 'Patient ID',       variable: 'Contact.PatientId'      },
      { id: '2', label: 'Patient name',     variable: 'Contact.FullName'       },
      { id: '3', label: 'Last visit date',  variable: 'Contact.LastVisitDate'  },
      { id: '4', label: 'Recall due date',  variable: 'Contact.RecallDueDate'  },
      { id: '5', label: 'Provider ID',      variable: 'Contact.ProviderId'     },
    ],
    retrySettings: { noAnswer: true, callRejected: false, voiceMail: true },
    voicemailMessage: 'Hi {{Contact.FirstName}}, this is {{Practice.Name}} calling to schedule your hygiene recall appointment. Please call us back at {{Practice.PhoneNumber}} to book your visit.',
    maxAttempts: 2,
    retryInterval: 24,
    retryIntervalUnit: 'Hours',
    branches: [
      { id: 'rcl-6-vc-completed', name: 'Call answered', isVoiceCallBranch: true, isFallback: false },
      { id: 'rcl-6-vc-rejected',  name: 'Call rejected', isVoiceCallBranch: true, isFallback: false },
      { id: 'rcl-6-vc-missed',    name: 'Call missed',   isVoiceCallBranch: true, isFallback: false },
      { id: 'rcl-6-vc-voicemail', name: 'Voicemail',    isVoiceCallBranch: true, isFallback: true  },
    ],
  },
  'rcl-6-vc-completed': {
    branchName: 'Call answered',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'answered' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rcl-6',
    isBranchPath: true,
    nodes: [
      { id: 'rcl-6-fd', flowType: 'subagent', data: { title: 'Front desk agent - North region', subtype: 'Sub-agent', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Call subagent', descriptionPlaceholder: 'Call subagent workflow.' } },
    ],
  },
  'rcl-6-vc-rejected': {
    branchName: 'Call rejected',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'rejected' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rcl-6',
    isBranchPath: true,
    nodes: [
      { id: 'rcl-r1', flowType: 'delay', data: { title: 'Delay for 1 day',   subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'rcl-r-email', flowType: 'task', data: { title: 'Send recall email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up recall email with a booking link' } },
      { id: 'rcl-r2', flowType: 'task',  data: { title: 'Send recall text',    subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up recall text with a booking link' } },
    ],
  },
  'rcl-6-vc-missed': {
    branchName: 'Call missed',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'missed' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rcl-6',
    isBranchPath: true,
    nodes: [
      { id: 'rcl-m1', flowType: 'delay', data: { title: 'Delay for 1 day',   subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'rcl-m-email', flowType: 'task', data: { title: 'Send recall email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up recall email with a booking link' } },
      { id: 'rcl-m2', flowType: 'task',  data: { title: 'Send recall text',    subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up recall text with a booking link' } },
    ],
  },
  'rcl-6-vc-voicemail': {
    branchName: 'Voicemail',
    isVoiceCallBranch: true,
    isFallback: true,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'voicemail' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rcl-6',
    isBranchPath: true,
    nodes: [
      { id: 'rcl-v1', flowType: 'delay', data: { title: 'Delay for 1 day',   subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'rcl-v-email', flowType: 'task', data: { title: 'Send recall email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up recall email with a booking link' } },
      { id: 'rcl-v2', flowType: 'task',  data: { title: 'Send recall text',    subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up recall text with a booking link' } },
    ],
  },
  // ── Rejected path sub-nodes ──
  'rcl-r1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'rcl-r2': { taskName: 'Send recall text', description: 'Sends a follow-up recall text with a booking link', selectedTools: ['send-confirmation'] },
  // ── Missed path sub-nodes ──
  'rcl-m1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'rcl-m2': { taskName: 'Send recall text', description: 'Sends a follow-up recall text with a booking link', selectedTools: ['send-confirmation'] },
  // ── Voicemail path sub-nodes ──
  'rcl-v1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'rcl-v2': { taskName: 'Send recall text', description: 'Sends a follow-up recall text with a booking link', selectedTools: ['send-confirmation'] },
  // Front desk agent subagent node
  'rcl-6-fd': { selectedAgent: 'frontdesk-north', name: 'Front desk agent - North region', description: 'Transfers to the front desk agent for assisted patient handling on recall calls', intent: 'Recall' },
  // ── Email task nodeDetails ──
  'rcl-r-email': { taskName: 'Send recall email', description: 'Sends a follow-up recall email with a booking link', selectedTools: ['send-confirmation'] },
  'rcl-m-email': { taskName: 'Send recall email', description: 'Sends a follow-up recall email with a booking link', selectedTools: ['send-confirmation'] },
  'rcl-v-email': { taskName: 'Send recall email', description: 'Sends a follow-up recall email with a booking link', selectedTools: ['send-confirmation'] },
}

// ─── Dental: Revenue (Payment) Agent ─────────────────────────────────────────
// Sketch: trigger → send payment due email → send payment due SMS → delay 2 days
//   → branch (payment not done / done)
//     → "Payment not done": initiate voice call → start procedure: payment reminder
//         → call rejected:  repeat-after-branch (same sequence)
//         → call missed:    delay 1 day → send payment due SMS → repeat-after-branch
//     → fallback (payment done): (empty)

const REVENUE_NODES = [
  {
    id: 'rev-1',
    flowType: 'trigger' as const,
    data: { title: 'Contact added to segment: Overdue 30 days', subtype: 'Trigger', headerLabel: 'Trigger', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter trigger name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'rev-2',
    flowType: 'task' as const,
    data: { title: 'Send payment due email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a personalized payment reminder email with a click-to-pay link' },
  },
  {
    id: 'rev-3',
    flowType: 'task' as const,
    data: { title: 'Send payment due text', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a short text with a secure payment link' },
  },
  {
    id: 'rev-4',
    flowType: 'delay' as const,
    data: { title: 'Delay for 2 days', subtype: 'Delay', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits for a specific time or event' },
  },
  {
    id: 'rev-5',
    flowType: 'branch' as const,
    data: { title: 'Based on conditions', subtype: 'Branch', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter branch name', descriptionPlaceholder: 'Payment done or not?' },
  },
]

const REVENUE_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Revenue agent',
    goals: 'Collect outstanding patient balances by delivering timely, personalized payment reminders via email, text, and voice, and reducing A/R days.',
    outcomes:
      '1. Patient pays via click-to-pay link in email or text\n' +
      '2. Payment collected or payment plan set up over the phone\n' +
      '3. Dispute escalated to billing team for resolution\n' +
      '4. Patient does not respond. Sequence completes after retry',
    locations: ['Atlanta, GA', 'Dallas, TX', 'Chicago, IL', 'Miami, FL'],
  },
  'rev-1': {
    triggerName: 'Contact added to segment: Overdue 30 days',
    description: 'Starts when a patient is added to the Overdue 30 days segment, indicating an outstanding balance older than 30 days.',
    conditions: [
      { id: 1, fieldValue: 'segment',     operatorValue: 'equals',       valueValue: 'overdue_30_days' },
      { id: 2, fieldValue: 'balance_age', operatorValue: 'greater_than', valueValue: '30_days' },
    ],
    conditionOptions: {
      field: [
        { value: 'segment',         label: 'Segment' },
        { value: 'balance_age',     label: 'Balance age (days)' },
        { value: 'balance_amount',  label: 'Balance amount' },
        { value: 'payment_status',  label: 'Payment status' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'overdue_30_days', label: 'Overdue 30 days' },
        { value: '30_days',         label: '30 days' },
        { value: '60_days',         label: '60 days' },
        { value: 'paid',            label: 'Paid' },
        { value: 'unpaid',          label: 'Unpaid' },
      ],
    },
  },
  'rev-2': {
    taskName: 'Send payment due email',
    description: 'Sends a personalized payment reminder email with a click-to-pay link',
    selectedTools: ['send-confirmation', 'dms-integration'],
  },
  'rev-3': {
    taskName: 'Send payment due text',
    description: 'Sends a short text with a secure payment link',
    selectedTools: ['send-confirmation'],
  },
  'rev-4': { name: 'Delay for 2 days', duration: '2', unit: 'days' },
  'rev-5': {
    basedOn: 'conditions',
    branches: [
      { id: 'rev-5-path-1', name: 'Payment not done' },
      { id: 'rev-5-path-2', name: 'Payment done', isFallback: true },
    ],
  },
  'rev-5-path-1': {
    branchName: 'Payment not done',
    description: 'Balance still outstanding. Escalates to a voice call',
    conditions: [
      { id: 1, fieldValue: 'payment_done', operatorValue: 'equals', valueValue: 'false' },
    ],
    conditionOptions: {
      field: [
        { value: 'payment_done',   label: 'Payment done' },
        { value: 'payment_status', label: 'Payment status' },
        { value: 'balance_amount', label: 'Balance amount' },
      ],
      operator: [{ value: 'equals', label: 'Equals' }, { value: 'not_equals', label: 'Does not equal' }],
      value: [{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }],
    },
    parentId: 'rev-5',
    isBranchPath: true,
    nodes: [
      {
        id: 'rev-6',
        flowType: 'voiceCall',
        data: { title: 'Initiate voice call', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter name', descriptionPlaceholder: 'Calls the patient to collect payment or arrange a plan', branches: [{ id: 'rev-6-vc-completed', name: 'Call answered', isVoiceCallBranch: true }, { id: 'rev-6-vc-rejected', name: 'Call rejected', isVoiceCallBranch: true }, { id: 'rev-6-vc-missed', name: 'Call missed', isVoiceCallBranch: true }, { id: 'rev-6-vc-voicemail', name: 'Voicemail', isVoiceCallBranch: true, isFallback: true }] },
      },
    ],
  },
  'rev-5-path-2': {
    branchName: 'Payment done',
    description: 'Payment received. Sequence complete',
    conditions: [
      { id: 1, fieldValue: 'payment_done', operatorValue: 'equals', valueValue: 'true' },
    ],
    conditionOptions: {
      field: [{ value: 'payment_done', label: 'Payment done' }],
      operator: [{ value: 'equals', label: 'Equals' }],
      value: [{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }],
    },
    parentId: 'rev-5',
    isBranchPath: true,
    isFallback: true,
    nodes: [],
  },
  'rev-6': {
    taskName: 'Initiate voice call',
    description: 'Calls the patient to collect payment or arrange a payment plan',
    toolId: 'initiate-voice-call',
    phoneNumber: 'Contact.PhoneNumber',
    callFrom: '',
    startingProcedure: 'Payment reminder procedure',
    routeToFrontdesk: false,
    contextItems: [
      { id: '1', label: 'Patient ID',        variable: 'Contact.PatientId'       },
      { id: '2', label: 'Patient name',      variable: 'Contact.FullName'        },
      { id: '3', label: 'Balance amount',    variable: 'Contact.BalanceAmount'   },
      { id: '4', label: 'Invoice ID',        variable: 'Contact.InvoiceId'       },
      { id: '5', label: 'Payment due date',  variable: 'Contact.PaymentDueDate'  },
    ],
    retrySettings: { noAnswer: true, callRejected: false, voiceMail: true },
    voicemailMessage: 'Hi {{Contact.FirstName}}, this is {{Practice.Name}} calling regarding an outstanding balance of {{Contact.BalanceAmount}} on your account. Please call us back at {{Practice.PhoneNumber}} to discuss your payment options.',
    maxAttempts: 2,
    retryInterval: 24,
    retryIntervalUnit: 'Hours',
    branches: [
      { id: 'rev-6-vc-completed', name: 'Call answered', isVoiceCallBranch: true, isFallback: false },
      { id: 'rev-6-vc-rejected',  name: 'Call rejected', isVoiceCallBranch: true, isFallback: false },
      { id: 'rev-6-vc-missed',    name: 'Call missed',   isVoiceCallBranch: true, isFallback: false },
      { id: 'rev-6-vc-voicemail', name: 'Voicemail',    isVoiceCallBranch: true, isFallback: true  },
    ],
  },
  'rev-6-vc-completed': {
    branchName: 'Call answered',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'answered' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rev-6',
    isBranchPath: true,
    nodes: [
      { id: 'rev-6-fd', flowType: 'subagent', data: { title: 'Front desk agent - North region', subtype: 'Sub-agent', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Call subagent', descriptionPlaceholder: 'Calls the subagent workflow' } },
    ],
  },
  'rev-6-vc-rejected': {
    branchName: 'Call rejected',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'rejected' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rev-6',
    isBranchPath: true,
    nodes: [
      { id: 'rev-r1', flowType: 'delay', data: { title: 'Delay for 1 day',       subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'rev-r-email', flowType: 'task', data: { title: 'Send payment due email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up payment reminder email with a click-to-pay link' } },
      { id: 'rev-r2', flowType: 'task',  data: { title: 'Send payment due text',   subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up payment reminder text' } },
    ],
  },
  'rev-6-vc-missed': {
    branchName: 'Call missed',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'missed' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rev-6',
    isBranchPath: true,
    nodes: [
      { id: 'rev-m1', flowType: 'delay', data: { title: 'Delay for 1 day',       subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'rev-m-email', flowType: 'task', data: { title: 'Send payment due email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up payment reminder email with a click-to-pay link' } },
      { id: 'rev-m2', flowType: 'task',  data: { title: 'Send payment due text',   subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up payment reminder text' } },
    ],
  },
  'rev-6-vc-voicemail': {
    branchName: 'Voicemail',
    isVoiceCallBranch: true,
    isFallback: true,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'voicemail' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'rev-6',
    isBranchPath: true,
    nodes: [
      { id: 'rev-v1', flowType: 'delay', data: { title: 'Delay for 1 day',       subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'rev-v-email', flowType: 'task', data: { title: 'Send payment due email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up payment reminder email with a click-to-pay link' } },
      { id: 'rev-v2', flowType: 'task',  data: { title: 'Send payment due text',   subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up payment reminder text' } },
    ],
  },
  // ── Rejected/Missed/Voicemail path sub-nodes ──
  'rev-r1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'rev-r2': { taskName: 'Send payment due text', description: 'Sends a follow-up payment reminder text', selectedTools: ['send-confirmation'] },
  'rev-m1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'rev-m2': { taskName: 'Send payment due text', description: 'Sends a follow-up payment reminder text', selectedTools: ['send-confirmation'] },
  'rev-v1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'rev-v2': { taskName: 'Send payment due text', description: 'Sends a follow-up payment reminder text', selectedTools: ['send-confirmation'] },
  // Front desk agent subagent node
  'rev-6-fd': { selectedAgent: 'frontdesk-north', name: 'Front desk agent - North region', description: 'Transfers to the front desk agent for assisted patient handling on payment calls', intent: 'Revenue' },
  // ── Email task nodeDetails ──
  'rev-r-email': { taskName: 'Send payment due email', description: 'Sends a follow-up payment reminder email with a click-to-pay link', selectedTools: ['send-confirmation'] },
  'rev-m-email': { taskName: 'Send payment due email', description: 'Sends a follow-up payment reminder email with a click-to-pay link', selectedTools: ['send-confirmation'] },
  'rev-v-email': { taskName: 'Send payment due email', description: 'Sends a follow-up payment reminder email with a click-to-pay link', selectedTools: ['send-confirmation'] },
}

// ─── Dental: Treatment Plan Agent ────────────────────────────────────────────
// Sketch: trigger → send TP email → send TP SMS → delay 2 days
//   → branch (TP not scheduled / scheduled)
//     → "Treatment plan not scheduled": initiate voice call → start procedure: TP coordinator
//         → call rejected:  repeat-after-branch (same check)
//         → call missed:    delay 1 day → send TP SMS → repeat-after-branch
//     → fallback (scheduled): (empty)

const TREATMENT_PLAN_NODES = [
  {
    id: 'tpa-1',
    flowType: 'trigger' as const,
    data: { title: 'Contact is added to segment: Treatment plan due', subtype: 'Trigger', headerLabel: 'Trigger', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter trigger name', descriptionPlaceholder: 'Enter description' },
  },
  {
    id: 'tpa-2',
    flowType: 'task' as const,
    data: { title: 'Send treatment plan unscheduled email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a personalized treatment plan email with a scheduling link' },
  },
  {
    id: 'tpa-3',
    flowType: 'task' as const,
    data: { title: 'Send treatment plan unscheduled text', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a short text with a treatment plan scheduling link' },
  },
  {
    id: 'tpa-4',
    flowType: 'delay' as const,
    data: { title: 'Delay for 2 days', subtype: 'Delay', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits for a specific time or event' },
  },
  {
    id: 'tpa-5',
    flowType: 'branch' as const,
    data: { title: 'Based on conditions', subtype: 'Branch', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter branch name', descriptionPlaceholder: 'Treatment plan scheduled or not?' },
  },
]

const TREATMENT_PLAN_NODE_DETAILS: Record<string, any> = {
  '__start__': {
    agentName: 'Treatment plan agent',
    goals: 'Convert unscheduled treatment plans into booked appointments by following up via email, text, and voice, connecting engaged patients with the treatment plan coordinator.',
    outcomes:
      '1. Patient schedules via self-schedule link in email or text\n' +
      '2. Appointment booked over the phone during the voice call\n' +
      '3. Patient connected to treatment plan coordinator for complex questions\n' +
      '4. Patient does not respond. Sequence completes after retry',
    locations: ['Atlanta, GA', 'Dallas, TX', 'Chicago, IL', 'Miami, FL'],
  },
  'tpa-1': {
    triggerName: 'Contact is added to segment: Treatment plan due',
    description: 'Starts when a contact is added to the Treatment plan due segment. Treatment plan has been presented but no appointment is scheduled.',
    conditions: [
      { id: 1, fieldValue: 'segment', operatorValue: 'equals', valueValue: 'treatment_plan_due' },
    ],
    conditionOptions: {
      field: [
        { value: 'segment',              label: 'Segment' },
        { value: 'treatment_plan_status',label: 'Treatment plan status' },
        { value: 'days_since_presented', label: 'Days since presented' },
        { value: 'tp_value',             label: 'Treatment plan value' },
      ],
      operator: [
        { value: 'equals',       label: 'Equals' },
        { value: 'not_equals',   label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
      ],
      value: [
        { value: 'treatment_plan_due',  label: 'Treatment plan due' },
        { value: 'presented',           label: 'Presented' },
        { value: 'accepted',            label: 'Accepted' },
        { value: 'declined',            label: 'Declined' },
      ],
    },
  },
  'tpa-2': {
    taskName: 'Send treatment plan unscheduled email',
    description: 'Sends a personalized treatment plan email with a scheduling link',
    selectedTools: ['send-confirmation', 'dms-integration'],
  },
  'tpa-3': {
    taskName: 'Send treatment plan unscheduled text',
    description: 'Sends a short text with a treatment plan scheduling link',
    selectedTools: ['send-confirmation'],
  },
  'tpa-4': { name: 'Delay for 2 days', duration: '2', unit: 'days' },
  'tpa-5': {
    basedOn: 'conditions',
    branches: [
      { id: 'tpa-5-path-1', name: 'Treatment plan not scheduled' },
      { id: 'tpa-5-path-2', name: 'Treatment plan scheduled', isFallback: true },
    ],
  },
  'tpa-5-path-1': {
    branchName: 'Treatment plan not scheduled',
    description: 'Patient has not scheduled. Escalates to a voice call',
    conditions: [
      { id: 1, fieldValue: 'treatment_plan_scheduled', operatorValue: 'equals', valueValue: 'false' },
    ],
    conditionOptions: {
      field: [
        { value: 'treatment_plan_scheduled', label: 'Treatment plan scheduled' },
        { value: 'treatment_plan_status',    label: 'Treatment plan status' },
        { value: 'future_appointment',       label: 'Future appointment' },
      ],
      operator: [{ value: 'equals', label: 'Equals' }, { value: 'not_equals', label: 'Does not equal' }],
      value: [{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }],
    },
    parentId: 'tpa-5',
    isBranchPath: true,
    nodes: [
      {
        id: 'tpa-6',
        flowType: 'voiceCall',
        data: { title: 'Initiate voice call', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter name', descriptionPlaceholder: 'Calls the patient to discuss and schedule their treatment plan', branches: [{ id: 'tpa-6-vc-completed', name: 'Call answered', isVoiceCallBranch: true }, { id: 'tpa-6-vc-rejected', name: 'Call rejected', isVoiceCallBranch: true }, { id: 'tpa-6-vc-missed', name: 'Call missed', isVoiceCallBranch: true }, { id: 'tpa-6-vc-voicemail', name: 'Voicemail', isVoiceCallBranch: true, isFallback: true }] },
      },
    ],
  },
  'tpa-5-path-2': {
    branchName: 'Treatment plan scheduled',
    description: 'Patient already scheduled. No further outreach needed',
    conditions: [
      { id: 1, fieldValue: 'treatment_plan_scheduled', operatorValue: 'equals', valueValue: 'true' },
    ],
    conditionOptions: {
      field: [{ value: 'treatment_plan_scheduled', label: 'Treatment plan scheduled' }],
      operator: [{ value: 'equals', label: 'Equals' }],
      value: [{ value: 'true', label: 'True' }, { value: 'false', label: 'False' }],
    },
    parentId: 'tpa-5',
    isBranchPath: true,
    isFallback: true,
    nodes: [],
  },
  'tpa-6': {
    taskName: 'Initiate voice call',
    description: 'Calls the patient to discuss the treatment plan and schedule their appointment',
    toolId: 'initiate-voice-call',
    phoneNumber: 'Contact.PhoneNumber',
    callFrom: '',
    startingProcedure: 'Treatment plan coordinator procedure',
    routeToFrontdesk: true,
    contextItems: [
      { id: '1', label: 'Patient ID',         variable: 'Contact.PatientId'        },
      { id: '2', label: 'Patient name',       variable: 'Contact.FullName'         },
      { id: '3', label: 'Treatment plan ID',  variable: 'Contact.TreatmentPlanId'  },
      { id: '4', label: 'Provider ID',        variable: 'Contact.ProviderId'       },
      { id: '5', label: 'Plan value',         variable: 'Contact.TreatmentPlanValue'},
    ],
    retrySettings: { noAnswer: true, callRejected: false, voiceMail: true },
    voicemailMessage: 'Hi {{Contact.FirstName}}, this is {{Practice.Name}} calling to discuss your treatment plan and help you schedule your next appointment. Please call us back at {{Practice.PhoneNumber}} at your earliest convenience.',
    maxAttempts: 2,
    retryInterval: 24,
    retryIntervalUnit: 'Hours',
    branches: [
      { id: 'tpa-6-vc-completed', name: 'Call answered', isVoiceCallBranch: true, isFallback: false },
      { id: 'tpa-6-vc-rejected',  name: 'Call rejected', isVoiceCallBranch: true, isFallback: false },
      { id: 'tpa-6-vc-missed',    name: 'Call missed',   isVoiceCallBranch: true, isFallback: false },
      { id: 'tpa-6-vc-voicemail', name: 'Voicemail',    isVoiceCallBranch: true, isFallback: true  },
    ],
  },
  'tpa-6-vc-completed': {
    branchName: 'Call answered',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'answered' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'tpa-6',
    isBranchPath: true,
    nodes: [
      { id: 'tpa-6-fd', flowType: 'subagent', data: { title: 'Front desk agent - North region', subtype: 'Sub-agent', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Call subagent', descriptionPlaceholder: 'Call subagent workflow.' } },
    ],
  },
  'tpa-6-vc-rejected': {
    branchName: 'Call rejected',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'rejected' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'tpa-6',
    isBranchPath: true,
    nodes: [
      { id: 'tpa-r1', flowType: 'delay', data: { title: 'Delay for 1 day',                      subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'tpa-r-email', flowType: 'task', data: { title: 'Send treatment plan email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up treatment plan email with a scheduling link' } },
      { id: 'tpa-r2', flowType: 'task',  data: { title: 'Send treatment plan unscheduled text',   subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up treatment plan text with a scheduling link' } },
    ],
  },
  'tpa-6-vc-missed': {
    branchName: 'Call missed',
    isVoiceCallBranch: true,
    isFallback: false,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'missed' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'tpa-6',
    isBranchPath: true,
    nodes: [
      { id: 'tpa-m1', flowType: 'delay', data: { title: 'Delay for 1 day', subtype: 'Delay', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'tpa-m-email', flowType: 'task', data: { title: 'Send treatment plan email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up treatment plan email with a scheduling link' } },
      { id: 'tpa-m2', flowType: 'task', data: { title: 'Send treatment plan unscheduled text', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up treatment plan text with a scheduling link' } },
    ],
  },
  'tpa-6-vc-voicemail': {
    branchName: 'Voicemail',
    isVoiceCallBranch: true,
    isFallback: true,
    conditions: [{ id: 1, fieldValue: 'call_status', operatorValue: 'equals', valueValue: 'voicemail' }],
    conditionOptions: VC_CONDITION_OPTIONS,
    parentId: 'tpa-6',
    isBranchPath: true,
    nodes: [
      { id: 'tpa-v1', flowType: 'delay', data: { title: 'Delay for 1 day',                      subtype: 'Delay',       hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Configure delay settings', descriptionPlaceholder: 'Waits before retrying' } },
      { id: 'tpa-v-email', flowType: 'task', data: { title: 'Send treatment plan email', subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name', descriptionPlaceholder: 'Sends a follow-up treatment plan email with a scheduling link' } },
      { id: 'tpa-v2', flowType: 'task',  data: { title: 'Send treatment plan unscheduled text',   subtype: 'Integration', hasToggle: true, toggleEnabled: true, hasAiIcon: false, titlePlaceholder: 'Enter task name',          descriptionPlaceholder: 'Sends a follow-up treatment plan text with a scheduling link' } },
    ],
  },
  // ── Rejected/Missed/Voicemail path sub-nodes ──
  'tpa-r1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'tpa-r2': { taskName: 'Send treatment plan unscheduled text', description: 'Sends a follow-up treatment plan text with a scheduling link', selectedTools: ['send-confirmation'] },
  'tpa-m1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'tpa-m2': { taskName: 'Send treatment plan unscheduled text', description: 'Sends a follow-up treatment plan text with a scheduling link', selectedTools: ['send-confirmation'] },
  'tpa-v1': { name: 'Delay for 1 day', duration: '1', unit: 'days' },
  'tpa-v2': { taskName: 'Send treatment plan unscheduled text', description: 'Sends a follow-up treatment plan text with a scheduling link', selectedTools: ['send-confirmation'] },
  // Front desk agent subagent node
  'tpa-6-fd': { selectedAgent: 'frontdesk-north', name: 'Front desk agent - North region', description: 'Transfers to the front desk agent for assisted patient handling on treatment plan calls', intent: 'Treatment plan' },
  // ── Email task nodeDetails ──
  'tpa-r-email': { taskName: 'Send treatment plan email', description: 'Sends a follow-up treatment plan email with a scheduling link', selectedTools: ['send-confirmation'] },
  'tpa-m-email': { taskName: 'Send treatment plan email', description: 'Sends a follow-up treatment plan email with a scheduling link', selectedTools: ['send-confirmation'] },
  'tpa-v-email': { taskName: 'Send treatment plan email', description: 'Sends a follow-up treatment plan email with a scheduling link', selectedTools: ['send-confirmation'] },
}

// Dental extends healthcare with three additional agent workflows
export const DENTAL_AGENT_WORKFLOWS: Record<string, AgentWorkflow> = {
  ...HEALTHCARE_AGENT_WORKFLOWS,
  'Recall agent':         { nodes: RECALL_NODES,         nodeDetails: RECALL_NODE_DETAILS         },
  'Revenue agent':        { nodes: REVENUE_NODES,         nodeDetails: REVENUE_NODE_DETAILS         },
  'Treatment plan agent': { nodes: TREATMENT_PLAN_NODES,  nodeDetails: TREATMENT_PLAN_NODE_DETAILS  },
}

// Default export kept for backward compat
export const AGENT_WORKFLOWS = AUTOMOTIVE_AGENT_WORKFLOWS

export function getAgentWorkflows(product?: string) {
  if (product === 'dental') return DENTAL_AGENT_WORKFLOWS
  if (product === 'healthcare') return HEALTHCARE_AGENT_WORKFLOWS
  return AUTOMOTIVE_AGENT_WORKFLOWS
}
