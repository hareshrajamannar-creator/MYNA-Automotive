// Feedback records — the revamped "Recommendation" tab data model.
// A record is either an AI-generated recommendation or a user coaching session.
// Each record carries the copilot chat transcript that produced it plus the
// proposed changes (procedures, system prompts, voice settings, knowledge).

export type FeedbackSource = 'ai' | 'coaching'
export type FeedbackStatus = 'open' | 'applied' | 'rejected'
export type ChangeTargetType = 'procedure' | 'system-prompt' | 'voice-setting' | 'knowledge' | 'workflow'

export interface DiffLine {
  location?: string
  before?: string
  after: string
}

export interface TestRun {
  before: string
  after: string
}

// Side-pane detail views — how the edited artifact looks after the change.
export interface WorkflowNodeView {
  id: string
  title: string
  description?: string
  icon: string
  edited?: boolean
  branch?: string
}

export interface ProcedureBulletView {
  text: string
  state?: 'added' | 'removed'
}

export interface ProcedureStepView {
  title: string
  bullets: ProcedureBulletView[]
}

export interface ProcedureView {
  name: string
  whenToUse: string
  steps: ProcedureStepView[]
  tools: string[]
}

export interface ProposedChange {
  id: string
  targetType: ChangeTargetType
  targetName: string
  changeLabel: string
  rationale: string
  diff: DiffLine[]
  testRun?: TestRun
  // Optional richer side-pane views
  workflowView?: { nodes: WorkflowNodeView[]; fields: DiffLine[] }
  procedureView?: ProcedureView
}

export interface ToolStep {
  label: string
  status: 'done' | 'running' | 'failed'
}

export type CopilotMessage =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'assistant'; text: string }
  | { id: string; kind: 'thought'; text: string }
  | { id: string; kind: 'tool-steps'; title: string; steps: ToolStep[] }
  | { id: string; kind: 'change-card'; changeId: string }
  | { id: string; kind: 'test-run'; changeId: string }

export interface FeedbackRecord {
  id: string
  agentName: string
  source: FeedbackSource
  title: string
  summary: string
  status: FeedbackStatus
  timeAgo: string
  conversationCount?: number
  changes: ProposedChange[]
  chat: CopilotMessage[]
  linkedConversationId?: string
}

export const TARGET_TYPE_LABEL: Record<ChangeTargetType, string> = {
  procedure: 'Procedure',
  'system-prompt': 'System prompt',
  'voice-setting': 'Voice setting',
  knowledge: 'Knowledge',
  workflow: 'Workflow',
}

export const TARGET_TYPE_ICON: Record<ChangeTargetType, string> = {
  procedure: 'menu_book',
  'system-prompt': 'terminal',
  'voice-setting': 'graphic_eq',
  knowledge: 'school',
  workflow: 'account_tree',
}

export const SOURCE_LABEL: Record<FeedbackSource, string> = {
  ai: 'AI recommendation',
  coaching: 'Coaching',
}

// ── Seed records ──────────────────────────────────────────────────────────────

export const FEEDBACK_RECORDS: FeedbackRecord[] = [
  {
    id: 'fb-1',
    agentName: 'Front desk agent',
    source: 'ai',
    title: 'Add a payment processing procedure',
    summary: '12 customers asked about payments with no agent guidance available.',
    status: 'open',
    timeAgo: '2h ago',
    conversationCount: 12,
    changes: [
      {
        id: 'fb-1-c1',
        targetType: 'procedure',
        targetName: 'Payment processing',
        changeLabel: 'New procedure',
        rationale:
          '12 conversations in the past 7 days ended unresolved because the agent had no guidance on handling payment requests. A new procedure gives it a clear path for phone, online, and in-person payments.',
        diff: [
          {
            location: 'Step 1 — Identify payment type',
            after:
              'Ask what the payment is for (service invoice, parts order, outstanding balance), look up the customer account, and confirm the amount due.',
          },
          {
            location: 'Step 2 — Process payment',
            after:
              'Phone — collect card details securely through the DMS. Online — share the payment portal link. In person — confirm location and business hours.',
          },
          {
            location: 'Step 3 — Confirm and follow up',
            after:
              'Send payment confirmation via email or text, update the customer record, and escalate to billing if the payment fails.',
          },
        ],
        testRun: {
          before: "I'm sorry, I don't have information about making payments. Is there anything else I can help with?",
          after:
            "I'd be happy to help with that. You can pay securely at payments.dealership.com — you'll just need the invoice number from your receipt. Would you like me to text you the link?",
        },
        procedureView: {
          name: 'Payment processing',
          whenToUse:
            'When a customer asks about making a payment for services, parts, or outstanding balances — by phone, online, or in person.',
          steps: [
            {
              title: 'Identify payment type',
              bullets: [
                { text: 'Ask what the payment is for (service invoice, parts order, outstanding balance)', state: 'added' },
                { text: 'Look up the customer account by name or phone number', state: 'added' },
                { text: 'Confirm the amount due', state: 'added' },
              ],
            },
            {
              title: 'Process payment',
              bullets: [
                { text: 'Phone — collect card details securely and process through the DMS', state: 'added' },
                { text: 'Online — direct the customer to the payment portal link', state: 'added' },
                { text: 'In person — confirm location and business hours', state: 'added' },
              ],
            },
            {
              title: 'Confirm and follow up',
              bullets: [
                { text: 'Send payment confirmation via email or text', state: 'added' },
                { text: 'Update the customer record in the DMS', state: 'added' },
                { text: 'If payment fails, offer alternatives or escalate to billing', state: 'added' },
              ],
            },
          ],
          tools: ['DMS integration', 'Send confirmation'],
        },
      },
    ],
    chat: [
      {
        id: 'fb-1-m1',
        kind: 'thought',
        text: 'I clustered 12 recent conversations where customers asked about payments and the agent had no guidance. Let me review the current procedure library for coverage.',
      },
      {
        id: 'fb-1-m2',
        kind: 'tool-steps',
        title: 'Gathering data from 3 tools',
        steps: [
          { label: 'Analyzing 12 conversations', status: 'done' },
          { label: 'Searching procedure library', status: 'done' },
          { label: 'Reading agent config', status: 'done' },
        ],
      },
      {
        id: 'fb-1-m3',
        kind: 'assistant',
        text: 'The agent has no procedure covering payment requests — every payment question ends with "I don\'t have that information". I drafted a new payment processing procedure covering phone, online, and in-person payments.',
      },
      { id: 'fb-1-m4', kind: 'change-card', changeId: 'fb-1-c1' },
      { id: 'fb-1-m5', kind: 'test-run', changeId: 'fb-1-c1' },
    ],
  },
  {
    id: 'fb-2',
    agentName: 'Front desk agent',
    source: 'ai',
    title: 'Update appointment rescheduling for same-day changes',
    summary: 'Same-day reschedule and waitlist paths are missing from the current procedure.',
    status: 'open',
    timeAgo: '5h ago',
    conversationCount: 8,
    changes: [
      {
        id: 'fb-2-c1',
        targetType: 'procedure',
        targetName: 'Appointment rescheduling',
        changeLabel: '1 update',
        rationale:
          "8 conversations were flagged because customers requesting same-day reschedules were told it wasn't possible, causing escalations. The updated step checks technician availability in real time and falls back to the waitlist.",
        diff: [
          {
            location: 'Step 2 — Check availability',
            before: 'Search for available slots on the requested date.',
            after:
              'Search for available slots. For same-day, check technician availability in real time. If no slots, offer to add the customer to the waitlist.',
          },
        ],
        testRun: {
          before: "I'm sorry, same-day changes aren't possible. The earliest I can offer is tomorrow morning.",
          after:
            "I understand the urgency — let me check today's technician availability. I have a 2:15 PM slot open today; I can move your Thursday appointment there and flag the concern for your technician.",
        },
        procedureView: {
          name: 'Appointment rescheduling',
          whenToUse:
            'When a customer requests to reschedule an existing appointment, including same-day changes and waitlist additions.',
          steps: [
            {
              title: 'Look up existing appointment',
              bullets: [
                { text: "Retrieve the appointment using the customer's name, phone, or confirmation number" },
                { text: 'Confirm details with the customer' },
              ],
            },
            {
              title: 'Check availability',
              bullets: [
                { text: 'Search for available slots on the requested date.', state: 'removed' },
                { text: 'Search for open slots on the requested date', state: 'added' },
                { text: 'For same-day: check technician availability in real time', state: 'added' },
                { text: 'If no slots — offer to add to the waitlist', state: 'added' },
              ],
            },
            {
              title: 'Confirm reschedule',
              bullets: [
                { text: 'Book the new slot and cancel the old one' },
                { text: 'Send updated confirmation to the customer' },
                { text: 'Notify the service advisor if technician assignment changes' },
              ],
            },
          ],
          tools: ['Schedule appointment', 'Send confirmation'],
        },
      },
    ],
    chat: [
      {
        id: 'fb-2-m1',
        kind: 'thought',
        text: 'Customers asking for same-day reschedules keep getting refused. Let me inspect the rescheduling procedure to see what the agent is following.',
      },
      {
        id: 'fb-2-m2',
        kind: 'tool-steps',
        title: 'Gathering data from 2 tools',
        steps: [
          { label: 'Analyzing 8 conversations', status: 'done' },
          { label: 'Reading procedure "Appointment rescheduling"', status: 'done' },
        ],
      },
      {
        id: 'fb-2-m3',
        kind: 'assistant',
        text: 'The current procedure only searches slots on the requested date — it has no same-day path, so the agent refuses those requests. I updated step 2 to check technician availability in real time and offer the waitlist as a fallback.',
      },
      { id: 'fb-2-m4', kind: 'change-card', changeId: 'fb-2-c1' },
      { id: 'fb-2-m5', kind: 'test-run', changeId: 'fb-2-c1' },
    ],
  },
  {
    id: 'fb-3',
    agentName: 'Front desk agent',
    source: 'ai',
    title: 'Escalate safety concerns within 30 seconds',
    summary: 'Safety-critical calls are taking 3+ minutes to reach a human agent.',
    status: 'applied',
    timeAgo: '1d ago',
    conversationCount: 5,
    changes: [
      {
        id: 'fb-3-c1',
        targetType: 'procedure',
        targetName: 'Emergency escalation',
        changeLabel: '1 update',
        rationale:
          '5 safety-concern conversations were handled through standard intake, causing 3+ minute delays before a human responded. Urgency detection now skips intake and transfers within 30 seconds.',
        diff: [
          {
            location: 'Transfer time target',
            before: 'Escalate to a live agent within 2 minutes.',
            after:
              'Detect urgency signals at the start. Transfer within 30 seconds. Skip standard intake when urgency keywords are present.',
          },
        ],
        testRun: {
          before: 'I can help with that. First, can I get your name and the year, make, and model of your vehicle?',
          after:
            "I'm flagging this as a safety concern and escalating to our on-call service advisor right now. Please pull over if you're driving — they'll call you back within 30 seconds.",
        },
      },
    ],
    chat: [
      {
        id: 'fb-3-m1',
        kind: 'thought',
        text: 'Safety-critical calls are being routed through standard intake. Reviewing the escalation procedure and the flagged transcripts.',
      },
      {
        id: 'fb-3-m2',
        kind: 'tool-steps',
        title: 'Gathering data from 2 tools',
        steps: [
          { label: 'Analyzing 5 conversations', status: 'done' },
          { label: 'Reading procedure "Emergency escalation"', status: 'done' },
        ],
      },
      {
        id: 'fb-3-m3',
        kind: 'assistant',
        text: 'The procedure asked intake questions before escalating, even when customers reported brake failure or smoke. I added urgency detection that skips intake and cuts the transfer target from 2 minutes to 30 seconds.',
      },
      { id: 'fb-3-m4', kind: 'change-card', changeId: 'fb-3-c1' },
      { id: 'fb-3-m5', kind: 'test-run', changeId: 'fb-3-c1' },
    ],
  },
  {
    id: 'fb-4',
    agentName: 'Front desk agent',
    source: 'ai',
    title: 'Add business hours to the knowledge base',
    summary: 'Agent is saying "I don\'t have that information" for 19 business hours questions.',
    status: 'open',
    timeAgo: '1h ago',
    conversationCount: 19,
    changes: [
      {
        id: 'fb-4-c1',
        targetType: 'knowledge',
        targetName: 'Business hours',
        changeLabel: 'New knowledge',
        rationale:
          '19 conversations ended with the agent unable to answer — the business hours record is missing or outdated. Adding current, weekend, and holiday hours resolves all of them.',
        diff: [
          {
            location: 'Knowledge base — Business hours',
            after:
              'Weekdays 7 AM – 7 PM, Saturday 8 AM – 5 PM, Sunday 10 AM – 3 PM. Parts & accessories available on weekends. Holiday closures listed on the locations page.',
          },
        ],
        testRun: {
          before: "I'm sorry, I don't have that information available right now.",
          after:
            "We're open Saturday 8 AM – 5 PM and Sunday 10 AM – 3 PM. Would you like me to book you a weekend slot?",
        },
      },
    ],
    chat: [
      {
        id: 'fb-4-m1',
        kind: 'thought',
        text: 'A large cluster of unanswered questions is about operating hours. Checking the knowledge base for a business hours record.',
      },
      {
        id: 'fb-4-m2',
        kind: 'tool-steps',
        title: 'Gathering data from 2 tools',
        steps: [
          { label: 'Analyzing 19 conversations', status: 'done' },
          { label: 'Searching knowledge base', status: 'done' },
        ],
      },
      {
        id: 'fb-4-m3',
        kind: 'assistant',
        text: 'There is no business hours record in the knowledge base, so the agent cannot answer any hours question. I drafted a record with weekday, weekend, and holiday hours.',
      },
      { id: 'fb-4-m4', kind: 'change-card', changeId: 'fb-4-c1' },
      { id: 'fb-4-m5', kind: 'test-run', changeId: 'fb-4-c1' },
    ],
  },
  {
    id: 'fb-5',
    agentName: 'Front desk agent',
    source: 'coaching',
    title: 'Use a softer, more casual tone',
    summary: 'Coached from a conversation — greeting felt stiff and transactional.',
    status: 'applied',
    timeAgo: '3d ago',
    conversationCount: 1,
    linkedConversationId: '1',
    changes: [
      {
        id: 'fb-5-c1',
        targetType: 'system-prompt',
        targetName: 'System prompt',
        changeLabel: '1 addition',
        rationale:
          'The diagnosis showed the greeting felt stiff because there is no instruction guiding the agent toward warmth — the only conversational guidance emphasizes brevity. This addition gives it clear direction to keep things soft and casual.',
        diff: [
          {
            location: 'System prompt — tone',
            after:
              'When communicating with customers, use a warm, soft, and casual tone — friendly and approachable, like chatting with a helpful neighbor rather than a formal customer service rep.',
          },
        ],
        testRun: {
          before: 'Hey Jimmy, thanks for checking us out! What can I help you with today?',
          after: 'Ciao Jimmy! What can I help you find or take care of today?',
        },
      },
    ],
    chat: [
      { id: 'fb-5-m1', kind: 'user', text: 'The tone needs to be a bit soft and casual' },
      {
        id: 'fb-5-m2',
        kind: 'thought',
        text: "I'll pull up the conversation and the agent's configuration to see what's driving the current tone.",
      },
      {
        id: 'fb-5-m3',
        kind: 'tool-steps',
        title: 'Gathering data from 3 tools',
        steps: [
          { label: 'Reading conversation', status: 'done' },
          { label: 'Reading agent config', status: 'done' },
          { label: 'Searching policies', status: 'done' },
        ],
      },
      {
        id: 'fb-5-m4',
        kind: 'assistant',
        text: 'The greeting felt stiff because nothing in the system prompt guides the agent toward warmth — the only conversational guidance emphasizes brevity. I drafted a tone addition and tested it against the original conversation.',
      },
      { id: 'fb-5-m5', kind: 'change-card', changeId: 'fb-5-c1' },
      { id: 'fb-5-m6', kind: 'test-run', changeId: 'fb-5-c1' },
    ],
  },
  {
    id: 'fb-6',
    agentName: 'Front desk agent',
    source: 'coaching',
    title: 'Slow down speech on voice calls',
    summary: 'Coached from a call — older callers asked the agent to repeat itself.',
    status: 'open',
    timeAgo: '5d ago',
    conversationCount: 1,
    changes: [
      {
        id: 'fb-6-c1',
        targetType: 'voice-setting',
        targetName: 'Voice settings',
        changeLabel: '1 update',
        rationale:
          'Callers asked the agent to repeat itself 3 times in one call. Reducing speaking rate and adding a short pause after key details makes confirmations easier to follow.',
        diff: [
          { location: 'Speaking rate', before: '1.15x', after: '1.0x' },
          {
            location: 'Pauses',
            before: 'No pause after key details.',
            after: 'Add a 400ms pause after dates, times, and phone numbers.',
          },
        ],
        testRun: {
          before: 'YourappointmentisconfirmedforTuesdayJune17at2:15PM — anything else?',
          after: 'Your appointment is confirmed for Tuesday, June 17 … at 2:15 PM. Is there anything else you need?',
        },
      },
    ],
    chat: [
      { id: 'fb-6-m1', kind: 'user', text: 'The agent talks too fast on calls, the caller kept asking it to repeat' },
      {
        id: 'fb-6-m2',
        kind: 'thought',
        text: 'Let me check the voice settings and review the call recording metadata for repeat requests.',
      },
      {
        id: 'fb-6-m3',
        kind: 'tool-steps',
        title: 'Gathering data from 2 tools',
        steps: [
          { label: 'Reading voice settings', status: 'done' },
          { label: 'Analyzing call transcript', status: 'done' },
        ],
      },
      {
        id: 'fb-6-m4',
        kind: 'assistant',
        text: 'The speaking rate is set to 1.15x with no pauses after key details, which is why confirmations were hard to follow. I propose reducing the rate to 1.0x and adding a short pause after dates, times, and phone numbers.',
      },
      { id: 'fb-6-m5', kind: 'change-card', changeId: 'fb-6-c1' },
      { id: 'fb-6-m6', kind: 'test-run', changeId: 'fb-6-c1' },
    ],
  },
  // ── Reminder agent ──────────────────────────────────────────────────────────
  {
    id: 'fb-7',
    agentName: 'Reminder agent',
    source: 'coaching',
    title: 'Reminder texts should include a reschedule link',
    summary: 'Coached from a conversation — patients replied asking how to reschedule.',
    status: 'open',
    timeAgo: '4h ago',
    conversationCount: 1,
    changes: [
      {
        id: 'fb-7-c1',
        targetType: 'workflow',
        targetName: 'Appointment reminder',
        changeLabel: '1 update',
        rationale:
          'The reminder message is configured inside the workflow\'s "Appointment reminder" step. It only stated the date and time, so patients who needed to reschedule had to call in. The updated message adds a one-tap reschedule link and the clinic location.',
        diff: [
          {
            location: 'Appointment reminder — message text',
            before: 'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}}.',
            after:
              'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}} at {{clinic_location}}. Reply C to confirm, or tap {{reschedule_link}} to pick a new time.',
          },
        ],
        testRun: {
          before: 'Hi Dana, this is a reminder for your appointment on Jun 17 at 2:15 PM.',
          after:
            'Hi Dana, this is a reminder for your appointment on Jun 17 at 2:15 PM at Rock Dental — Mountain View. Reply C to confirm, or tap rockdental.co/r/8f2 to pick a new time.',
        },
        workflowView: {
          nodes: [
            { id: 'hcr-1', title: 'Appointment is booked', description: 'Trigger — appointment status equals booked', icon: 'bolt' },
            { id: 'hcr-2', title: 'Appointment reminder', description: '3 weeks, 3 days and 24 hours before · Email & text', icon: 'notifications', edited: true },
            { id: 'hcr-3', title: 'Until 12 hrs before appointment', description: 'Delay — wait for specific time', icon: 'schedule' },
            { id: 'hcr-4', title: 'Based on conditions', description: 'Appointment confirmed or not?', icon: 'alt_route' },
            { id: 'hcr-5', title: 'Initiate voice call', description: 'Call the patient for their upcoming appointment', icon: 'call', branch: 'Appointment not confirmed' },
            { id: 'hcr-10', title: 'Send text reminder', description: '3 hours before', icon: 'sms', branch: 'Appointment confirmed' },
          ],
          fields: [
            {
              location: 'Reminder message',
              before: 'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}}.',
              after:
                'Hi {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}} at {{clinic_location}}. Reply C to confirm, or tap {{reschedule_link}} to pick a new time.',
            },
          ],
        },
      },
    ],
    chat: [
      { id: 'fb-7-m1', kind: 'user', text: 'The reminder text needs to be changed — patients keep replying asking how to reschedule' },
      {
        id: 'fb-7-m2',
        kind: 'thought',
        text: "The reminder text isn't a standalone setting — it lives inside the agent's workflow. I'll walk the workflow configuration to find where the message is set.",
      },
      {
        id: 'fb-7-m3',
        kind: 'tool-steps',
        title: 'Gathering data from 3 tools',
        steps: [
          { label: 'Reading workflow', status: 'done' },
          { label: 'Reading step "Appointment reminder" config', status: 'done' },
          { label: 'Analyzing patient replies', status: 'done' },
        ],
      },
      {
        id: 'fb-7-m4',
        kind: 'assistant',
        text: 'Found it — the message text is configured on the "Appointment reminder" step of the workflow (sent 3 weeks, 3 days, and 24 hours before, via email and text). It only states the date and time. I updated it to include the clinic location and a one-tap reschedule link. Click the change to see where it sits in the workflow.',
      },
      { id: 'fb-7-m5', kind: 'change-card', changeId: 'fb-7-c1' },
      { id: 'fb-7-m6', kind: 'test-run', changeId: 'fb-7-c1' },
    ],
  },
  {
    id: 'fb-8',
    agentName: 'Reminder agent',
    source: 'ai',
    title: 'Voice reminder should offer rescheduling before ending the call',
    summary: '14 reminder calls ended without confirming — patients wanted a different time.',
    status: 'open',
    timeAgo: '1d ago',
    conversationCount: 14,
    changes: [
      {
        id: 'fb-8-c1',
        targetType: 'workflow',
        targetName: 'Initiate voice call',
        changeLabel: '1 update',
        rationale:
          'The "Initiate voice call" step is the voice agent inside the reminder workflow — it runs from a starting procedure. It currently starts from "Appointment Confirmation", which only asks for a confirm/cancel. Pointing the call at the updated procedure lets it offer rescheduling in the same call.',
        diff: [
          {
            location: 'Initiate voice call — starting procedure',
            before: 'Appointment Confirmation (confirm or cancel only)',
            after: 'Appointment Confirmation (confirm, reschedule, or cancel)',
          },
        ],
        testRun: {
          before:
            "This is a reminder for your appointment tomorrow at 2:15 PM. Can you confirm you'll be attending? … Okay, I'll mark it unconfirmed. Goodbye.",
          after:
            "This is a reminder for your appointment tomorrow at 2:15 PM. Can you confirm, or would a different time work better? I can rebook you right now on this call.",
        },
        workflowView: {
          nodes: [
            { id: 'hcr-1', title: 'Appointment is booked', description: 'Trigger — appointment status equals booked', icon: 'bolt' },
            { id: 'hcr-2', title: 'Appointment reminder', description: '3 weeks, 3 days and 24 hours before · Email & text', icon: 'notifications' },
            { id: 'hcr-3', title: 'Until 12 hrs before appointment', description: 'Delay — wait for specific time', icon: 'schedule' },
            { id: 'hcr-4', title: 'Based on conditions', description: 'Appointment confirmed or not?', icon: 'alt_route' },
            { id: 'hcr-5', title: 'Initiate voice call', description: 'Voice agent — starting procedure + voice settings', icon: 'call', branch: 'Appointment not confirmed', edited: true },
            { id: 'hcr-10', title: 'Send text reminder', description: '3 hours before', icon: 'sms', branch: 'Appointment confirmed' },
          ],
          fields: [
            {
              location: 'Starting procedure',
              before: 'Appointment Confirmation (confirm or cancel only)',
              after: 'Appointment Confirmation (confirm, reschedule, or cancel)',
            },
          ],
        },
      },
      {
        id: 'fb-8-c2',
        targetType: 'procedure',
        targetName: 'Appointment Confirmation',
        changeLabel: '2 updates',
        rationale:
          'The starting procedure itself also needs the reschedule path — otherwise the voice agent has no steps to follow when a patient asks for a different time.',
        diff: [
          {
            location: 'Step 4 — Process response',
            before: 'Process response: confirmed or cancelled.',
            after: 'Process response: confirmed, rescheduled, or cancelled. For reschedules, search open slots and rebook in the same call.',
          },
        ],
        procedureView: {
          name: 'Appointment Confirmation',
          whenToUse: 'Appointment is scheduled — confirmation journey begins.',
          steps: [
            {
              title: 'Send confirmations and reminders',
              bullets: [
                { text: 'Send immediate SMS confirmation with appointment details' },
                { text: '24 hours before: send SMS reminder with confirm/reschedule options' },
                { text: '2 hours before: place voice call for final confirmation' },
              ],
            },
            {
              title: 'Process response',
              bullets: [
                { text: 'Process response: confirmed or cancelled', state: 'removed' },
                { text: 'Process response: confirmed, rescheduled, or cancelled', state: 'added' },
                { text: 'For reschedules, search open slots and rebook in the same call', state: 'added' },
              ],
            },
            {
              title: 'Update records',
              bullets: [{ text: 'Update appointment status in the PMS' }],
            },
          ],
          tools: ['Schedule appointment', 'Send confirmation'],
        },
      },
    ],
    chat: [
      {
        id: 'fb-8-m1',
        kind: 'thought',
        text: '14 reminder calls ended unconfirmed with patients asking about other times. The call behavior is configured in the workflow — let me trace the "Initiate voice call" step and its starting procedure.',
      },
      {
        id: 'fb-8-m2',
        kind: 'tool-steps',
        title: 'Gathering data from 4 tools',
        steps: [
          { label: 'Analyzing 14 call transcripts', status: 'done' },
          { label: 'Reading workflow', status: 'done' },
          { label: 'Reading "Initiate voice call" config', status: 'done' },
          { label: 'Reading procedure "Appointment Confirmation"', status: 'done' },
        ],
      },
      {
        id: 'fb-8-m3',
        kind: 'assistant',
        text: 'The voice agent inside the "Initiate voice call" step starts from the "Appointment Confirmation" procedure, which only supports confirm or cancel — so patients who wanted a new time got nothing. This needs two changes: point the call step at the updated procedure, and add the reschedule path to the procedure itself.',
      },
      { id: 'fb-8-m4', kind: 'change-card', changeId: 'fb-8-c1' },
      { id: 'fb-8-m5', kind: 'change-card', changeId: 'fb-8-c2' },
      { id: 'fb-8-m6', kind: 'test-run', changeId: 'fb-8-c1' },
    ],
  },
]

// ── Coaching session script builder ───────────────────────────────────────────
// Builds the scripted copilot response for a brand-new coaching session started
// from the inbox (Coach button / thumbs-down feedback). The prototype plays
// these messages back with staged delays so the session feels live.

let coachSeq = 0

export function buildCoachingSession(agentName: string, seedText: string, sourceMessage?: string): FeedbackRecord {
  coachSeq += 1
  const rid = `coach-${Date.now()}-${coachSeq}`
  const changeId = `${rid}-c1`
  const quoted = sourceMessage ? `"${sourceMessage}"` : 'the flagged message'
  return {
    id: rid,
    agentName,
    source: 'coaching',
    title: seedText.length > 60 ? `${seedText.slice(0, 57)}…` : seedText,
    summary: 'Coached from a conversation in the inbox.',
    status: 'open',
    timeAgo: 'Just now',
    conversationCount: 1,
    changes: [
      {
        id: changeId,
        targetType: 'system-prompt',
        targetName: 'System prompt',
        changeLabel: '1 addition',
        rationale: `Your feedback ("${seedText}") pointed at a gap in the agent's guidance — nothing in the current system prompt covers it. This addition gives the agent explicit direction, applied to all future conversations.`,
        diff: [
          {
            location: 'System prompt — coaching',
            after: `When responding to customers, follow this guidance: ${seedText}.`,
          },
        ],
        testRun: {
          before: sourceMessage ?? 'Hey, thanks for checking us out! What can I help you with today?',
          after: 'Hi there! Happy to help — what can I take care of for you today?',
        },
      },
    ],
    chat: [
      { id: `${rid}-m1`, kind: 'user', text: seedText },
      {
        id: `${rid}-m2`,
        kind: 'thought',
        text: `I'll pull up the conversation and the agent's configuration to understand what's driving ${quoted}.`,
      },
      {
        id: `${rid}-m3`,
        kind: 'tool-steps',
        title: 'Gathering data from 3 tools',
        steps: [
          { label: 'Reading conversation', status: 'done' },
          { label: 'Reading agent config', status: 'done' },
          { label: 'Searching procedures and policies', status: 'done' },
        ],
      },
      {
        id: `${rid}-m4`,
        kind: 'assistant',
        text: "I found the gap — the current system prompt has no guidance covering your feedback. I drafted an addition and tested it against the original conversation. Review the change below and accept it to start training, or tell me what to tweak.",
      },
      { id: `${rid}-m5`, kind: 'change-card', changeId },
      { id: `${rid}-m6`, kind: 'test-run', changeId },
    ],
  }
}

// Scripted reply appended when the user sends a follow-up tweak in the copilot.
export function buildFollowUpMessages(recordId: string, followUp: string): CopilotMessage[] {
  coachSeq += 1
  const base = `${recordId}-f${coachSeq}`
  return [
    { id: `${base}-m1`, kind: 'user', text: followUp },
    {
      id: `${base}-m2`,
      kind: 'tool-steps',
      title: 'Gathering data from 1 tool',
      steps: [{ label: 'Reading field', status: 'done' }],
    },
    {
      id: `${base}-m3`,
      kind: 'assistant',
      text: "I've folded that into the proposed change — the draft above now reflects your tweak. Accept the change to apply it, or keep refining.",
    },
  ]
}
