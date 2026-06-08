export type ProcedureCategory =
  | 'Inbound General'
  | 'Service'
  | 'Sales'
  | 'Parts'
  | 'After-Hours'
  | 'Outbound'
  | 'Healthcare Frontdesk'

// ── Rich step model ─────────────────────────────────────────────
// A step has a title and a list of bullets. Each bullet is a sequence
// of inline tokens — plain strings interleaved with reference chips
// (tools, context variables, sub-agents, procedures) so the steps
// editor can render inline chips exactly like Figma.

export type RefKind = 'tool' | 'context' | 'subagent' | 'procedure' | 'file' | 'link'

export interface Ref {
  kind: RefKind
  label: string
}

export type Token = string | Ref

export interface Bullet {
  tokens: Token[]
}

export interface ProcedureStep {
  title: string
  bullets: Bullet[]
}

export interface ContextItem {
  kind: 'context' | 'file' | 'link'
  label: string
}

export interface Procedure {
  id: string
  name: string
  category: ProcedureCategory
  /** Short, one-or-two line summary shown on the library card. */
  description: string
  /** Last edited label shown in the card footer. */
  lastEdited: string
  /** Trigger description shown in the "When to use this procedure?" field. */
  whenToUse: string
  steps: ProcedureStep[]
  tools: string[]
  context: ContextItem[]
}

// Helper to build a chip token quickly inside step bullets.
const ref = (kind: RefKind, label: string): Ref => ({ kind, label })

// ── Raw source data (automotive frontdesk procedures) ───────────
interface RawProcedure {
  id: string
  name: string
  category: ProcedureCategory
  description: string
  whenToUse: string
  steps: string[]
  tools: string[]
}

const RAW: RawProcedure[] = [
  {
    id: 'p-001',
    name: 'Greet and open conversation',
    category: 'Inbound General',
    description: 'Identifies the caller, screens for urgency, and routes them to the right procedure.',
    whenToUse: 'Every inbound call, chat, or text session begins.',
    steps: [
      'Answer with the dealership-branded greeting including the agent name.',
      'Ask how the caller can be helped today.',
      'Use the intent classifier to detect department and purpose.',
      'Confirm the detected intent with the caller.',
      'Route to the appropriate procedure based on intent.',
    ],
    tools: ['Intent classifier', 'Knowledge base'],
  },
  {
    id: 'p-002',
    name: 'Handle general inquiry',
    category: 'Inbound General',
    description: 'Answers informational questions like hours, location, financing, and services.',
    whenToUse: 'Caller has a question that does not match a specific procedure.',
    steps: [
      'Listen to the full question before responding.',
      'Search the knowledge base for a matching answer.',
      'Provide a concise answer with source attribution.',
      'Ask if the caller has additional questions.',
      'Log the inquiry topic in CRM for analytics.',
    ],
    tools: ['Knowledge base', 'CRM update'],
  },
  {
    id: 'p-003',
    name: 'Department transfer',
    category: 'Inbound General',
    description: 'Routes the caller to the right department with a warm, context-rich handoff.',
    whenToUse: 'Caller requests a specific department or intent maps to another department.',
    steps: [
      'Confirm the department the caller wants to reach.',
      'Check business hours for the target department.',
      'If open, perform a warm transfer with a context summary.',
      'If closed, offer voicemail or callback scheduling.',
      'Log the transfer in CRM with a reason code.',
    ],
    tools: ['Check business hours', 'CRM update', 'Trigger escalation'],
  },
  {
    id: 'p-004',
    name: 'Handle unclear message',
    category: 'Inbound General',
    description: "Clarifies vague or out-of-scope messages to recover the caller's intent.",
    whenToUse: 'Speech-to-text confidence is low or caller intent is ambiguous.',
    steps: [
      'Apologize and ask the caller to rephrase.',
      'Offer 2–3 common intent options as suggestions.',
      'If still unclear, attempt one more rephrasing request.',
      'If unresolved, transfer to a human agent.',
    ],
    tools: ['ElevenLabs STT', 'Intent classifier', 'Trigger escalation'],
  },
  {
    id: 'p-006',
    name: 'Talk to human',
    category: 'Inbound General',
    description: 'Hands off to a live agent when the caller asks for a person or shows frustration.',
    whenToUse: 'Caller explicitly requests a human agent.',
    steps: [
      'Acknowledge the request without resistance.',
      'Ask if there is a specific person or department they need.',
      'Attempt a warm transfer with conversation context.',
      'If no one is available, offer a callback with an estimated wait time.',
      'Log the request and outcome in CRM.',
    ],
    tools: ['Trigger escalation', 'CRM update', 'Check business hours'],
  },
  {
    id: 'p-007',
    name: 'Identify caller',
    category: 'Inbound General',
    description: 'Confirms caller identity before any account or appointment action is taken.',
    whenToUse: 'Before performing any account-specific or appointment action.',
    steps: [
      'Ask for the name and phone number on the account.',
      'Match the details against the CRM record.',
      'Confirm the vehicle on file if relevant.',
      'Proceed only once identity is verified.',
    ],
    tools: ['Voice identity', 'CRM update'],
  },
  {
    id: 'p-008',
    name: 'Schedule service appointment',
    category: 'Service',
    description: 'Finds availability and schedules a new service visit for the customer.',
    whenToUse: 'Caller wants to book a service appointment.',
    steps: [
      'Collect vehicle year, make, model, and mileage.',
      'Ask for the type of service needed.',
      'Look up the VIN if available for service-history context.',
      'Check available appointment slots in the DMS.',
      'Confirm date, time, and service advisor.',
      'Send confirmation via SMS or email.',
      'Create the appointment record in the DMS.',
    ],
    tools: ['DMS integration', 'Schedule appointment', 'VIN decode', 'Send confirmation', 'CRM update'],
  },
  {
    id: 'p-012',
    name: 'Reschedule appointment',
    category: 'Service',
    description: 'Moves an existing upcoming appointment to a new time.',
    whenToUse: 'Caller wants to change an existing appointment.',
    steps: [
      'Verify caller identity and locate the appointment.',
      'Confirm which appointment to modify.',
      'Offer the next available slots.',
      'Update the DMS record and send confirmation.',
    ],
    tools: ['DMS integration', 'Schedule appointment', 'Send confirmation', 'CRM update'],
  },
  {
    id: 'p-012b',
    name: 'Cancel appointment',
    category: 'Service',
    description: 'Cancels an existing appointment and releases the slot.',
    whenToUse: 'Caller wants to cancel an existing appointment.',
    steps: [
      'Verify caller identity and locate the appointment.',
      'Confirm the cancellation and capture the reason.',
      'Release the slot back to availability.',
      'Update the DMS record and send confirmation.',
    ],
    tools: ['DMS integration', 'Send confirmation', 'CRM update'],
  },
  {
    id: 'p-008b',
    name: 'Book new appointment',
    category: 'Service',
    description: 'Finds availability and schedules a new visit for the customer.',
    whenToUse: 'Caller has no existing appointment and wants to book a visit.',
    steps: [
      'Confirm the reason for the visit.',
      'Check available appointment slots in the DMS.',
      'Offer the soonest options that fit the request.',
      'Confirm the booking and send confirmation.',
    ],
    tools: ['DMS integration', 'Schedule appointment', 'Send confirmation'],
  },
  {
    id: 'p-013b',
    name: 'Handle slot conflict',
    category: 'Service',
    description: 'Re-offers availability when the chosen slot was already taken.',
    whenToUse: 'The slot the caller picked is no longer available.',
    steps: [
      'Apologize for the conflict.',
      'Pull the next available slots from the DMS.',
      'Offer the closest alternatives to the original request.',
      'Confirm the new booking and send confirmation.',
    ],
    tools: ['DMS integration', 'Schedule appointment', 'Send confirmation'],
  },
  {
    id: 'p-009',
    name: 'Repair / diagnostic triage',
    category: 'Service',
    description: 'Triages a described vehicle problem and books the right level of service.',
    whenToUse: 'Caller describes a vehicle problem or warning light.',
    steps: [
      'Collect the symptom description and vehicle information.',
      'Ask clarifying questions about onset, frequency, and severity.',
      'Check the knowledge base for common diagnostic guidance.',
      'Assess urgency (safe to drive vs. immediate attention).',
      'Book a same-day or next-available appointment.',
      'Provide interim safety guidance.',
    ],
    tools: ['Knowledge base', 'DMS integration', 'Schedule appointment', 'VIN decode'],
  },
  {
    id: 'p-010',
    name: 'Recall inquiry',
    category: 'Service',
    description: 'Checks for open recalls on a vehicle and books recall service.',
    whenToUse: 'Caller asks about recalls on their vehicle.',
    steps: [
      'Collect the VIN or year/make/model.',
      'Query the NHTSA recall database for open recalls.',
      'Report the recall status and description to the caller.',
      'Offer to schedule recall service if an open recall exists.',
      'Book the appointment and send confirmation.',
    ],
    tools: ['VIN decode', 'NHTSA recall lookup', 'DMS integration', 'Schedule appointment', 'Send confirmation'],
  },
  {
    id: 'p-011',
    name: 'Service status check',
    category: 'Service',
    description: 'Reports the status and estimated completion of an in-progress repair.',
    whenToUse: 'Caller inquires about an in-progress repair.',
    steps: [
      'Verify caller identity and vehicle.',
      'Look up the active repair order in the DMS.',
      'Provide the current status and estimated completion time.',
      'Relay any additional work found and its cost.',
      'Offer to send a status update via text.',
    ],
    tools: ['DMS integration', 'Voice identity', 'Send confirmation'],
  },
  {
    id: 'p-013',
    name: 'Warranty inquiry',
    category: 'Service',
    description: 'Explains warranty coverage and books work under warranty when eligible.',
    whenToUse: 'Caller asks about warranty coverage.',
    steps: [
      'Collect the VIN and current mileage.',
      'Look up warranty status via DMS/OEM integration.',
      'Explain coverage periods and what is and is not covered.',
      'Offer to schedule under warranty if service is needed.',
    ],
    tools: ['VIN decode', 'DMS integration', 'Knowledge base'],
  },
  {
    id: 'p-014',
    name: 'New vehicle inquiry',
    category: 'Sales',
    description: 'Matches interest to inventory and captures a sales lead.',
    whenToUse: 'Caller is interested in purchasing a new vehicle.',
    steps: [
      'Ask about desired vehicle type, features, and budget.',
      'Search real-time inventory for matching vehicles.',
      'Present the top 2–3 options with key specs and pricing.',
      'Offer to schedule a test drive.',
      'Capture the lead in CRM and route to a sales consultant.',
    ],
    tools: ['Inventory search', 'CRM update', 'Lead routing', 'Schedule appointment'],
  },
  {
    id: 'p-015',
    name: 'Used / CPO vehicle inquiry',
    category: 'Sales',
    description: 'Matches pre-owned interest to inventory and shares vehicle history.',
    whenToUse: 'Caller is interested in pre-owned or certified vehicles.',
    steps: [
      'Ask about preferences: make, model, year range, budget, features.',
      'Search used/CPO inventory for matches.',
      'Highlight CPO certification benefits if applicable.',
      'Share a vehicle history summary.',
      'Offer to schedule a viewing or test drive.',
    ],
    tools: ['Inventory search', 'VIN decode', 'CRM update', 'Lead routing'],
  },
  {
    id: 'p-016',
    name: 'Trade-in valuation',
    category: 'Sales',
    description: 'Provides an estimated trade-in range and offers an in-person appraisal.',
    whenToUse: 'Caller wants to know the trade-in value of their current vehicle.',
    steps: [
      'Collect vehicle year, make, model, trim, and mileage.',
      'Ask about vehicle condition.',
      'Provide an estimated range based on market data.',
      'Add a disclaimer that the final value requires inspection.',
      'Offer to schedule an in-person appraisal.',
    ],
    tools: ['Knowledge base', 'CRM update', 'Schedule appointment'],
  },
  {
    id: 'p-017',
    name: 'Finance pre-qualification',
    category: 'Sales',
    description: 'Explains financing options and routes to F&I for detailed review.',
    whenToUse: 'Caller asks about financing options or payment estimates.',
    steps: [
      'Explain the general financing options available.',
      'Provide typical rate ranges without committing to specifics.',
      'Explain that pre-qualification requires F&I review.',
      'Offer to schedule with a finance manager.',
    ],
    tools: ['Knowledge base', 'CRM update', 'Lead routing', 'Schedule appointment'],
  },
  {
    id: 'p-018',
    name: 'Test drive scheduling',
    category: 'Sales',
    description: 'Confirms availability and books a test drive for the vehicles of interest.',
    whenToUse: 'Caller wants to schedule a test drive.',
    steps: [
      'Confirm the vehicle(s) of interest.',
      'Verify vehicle availability on the lot.',
      'Collect name, phone, and preferred date/time.',
      'Check sales consultant availability.',
      'Book the test drive and send confirmation.',
    ],
    tools: ['Inventory search', 'Schedule appointment', 'Send confirmation', 'CRM update', 'Lead routing'],
  },
  {
    id: 'p-019',
    name: 'Internet lead qualification',
    category: 'Sales',
    description: 'Follows up on an online inquiry and qualifies the lead.',
    whenToUse: 'Following up on an online form submission or website inquiry.',
    steps: [
      'Reference the specific vehicle or inquiry from the lead source.',
      'Confirm continued interest and timeline.',
      'Ask qualifying questions: budget, trade-in, financing.',
      'Present relevant inventory matches.',
      'Offer an immediate test drive or appointment.',
    ],
    tools: ['CRM update', 'Inventory search', 'Lead routing', 'Schedule appointment', 'Send confirmation'],
  },
  {
    id: 'p-020',
    name: 'Parts availability & pricing',
    category: 'Parts',
    description: 'Checks parts availability and pricing and offers to place an order.',
    whenToUse: 'Caller inquires about parts availability or pricing.',
    steps: [
      'Collect the part description or part number.',
      'Decode the VIN for exact fitment if available.',
      'Search the parts inventory in the DMS.',
      'Provide availability status and price range.',
      'Offer to place an order if not in stock.',
    ],
    tools: ['DMS integration', 'VIN decode', 'Knowledge base'],
  },
  {
    id: 'p-021',
    name: 'After-hours lead capture',
    category: 'After-Hours',
    description: 'Captures a sales inquiry received outside business hours for next-day follow-up.',
    whenToUse: 'A sales inquiry is received outside business hours.',
    steps: [
      'Inform the caller of current business hours.',
      'Capture name, phone, email, and vehicle interest.',
      'Assure a callback first thing the next business day.',
      'Send a confirmation text with business hours.',
      'Create a priority lead in CRM for morning follow-up.',
    ],
    tools: ['Check business hours', 'CRM update', 'Send confirmation', 'Lead routing'],
  },
  {
    id: 'p-022',
    name: 'After-hours service request',
    category: 'After-Hours',
    description: 'Triages a service inquiry received outside business hours.',
    whenToUse: 'A service inquiry is received outside business hours.',
    steps: [
      'Inform the caller of service department hours.',
      'Assess the urgency of the service need.',
      'Provide the roadside assistance number for emergencies.',
      'Capture details and schedule a callback for non-urgent needs.',
    ],
    tools: ['Check business hours', 'CRM update', 'Send confirmation'],
  },
  {
    id: 'p-023',
    name: 'Lead follow-up call',
    category: 'Outbound',
    description: 'Calls an internet lead within minutes to confirm interest and book a visit.',
    whenToUse: 'An internet lead is received and an outbound call is initiated within 5 minutes.',
    steps: [
      'Introduce yourself and reference the specific inquiry.',
      'Confirm interest and ask qualifying questions.',
      'Present matching inventory options.',
      'Offer to schedule a test drive or appointment.',
      'Leave a voicemail and send a follow-up SMS if no answer.',
    ],
    tools: ['CRM update', 'Inventory search', 'Schedule appointment', 'Send confirmation', 'Lead routing'],
  },
  {
    id: 'p-025',
    name: 'Appointment confirmation',
    category: 'Outbound',
    description: 'Runs the reminder journey that confirms a scheduled appointment.',
    whenToUse: 'An appointment is scheduled and the confirmation journey begins.',
    steps: [
      'Send an immediate SMS confirmation with appointment details.',
      'Send an SMS reminder 24 hours before with confirm/reschedule options.',
      'Place a final confirmation call 2 hours before.',
      'Process the response and update the appointment status in the DMS.',
    ],
    tools: ['DMS integration', 'Send confirmation', 'Schedule appointment'],
  },
  {
    id: 'p-026',
    name: 'No-show re-engagement',
    category: 'Outbound',
    description: 'Re-engages a customer who missed an appointment and offers easy rebooking.',
    whenToUse: 'Customer missed a scheduled appointment without canceling.',
    steps: [
      'Wait 2 hours after the missed appointment time.',
      'Send an empathetic SMS acknowledging the missed appointment.',
      'Offer a one-click rescheduling link.',
      'Follow up with a voice call if there is no response in 24 hours.',
    ],
    tools: ['DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment'],
  },
  {
    id: 'p-027',
    name: 'Lease maturity outreach',
    category: 'Outbound',
    description: 'Proactively presents lease-end options before a lease matures.',
    whenToUse: 'A customer lease matures within 90 days.',
    steps: [
      'Send an initial SMS introducing lease-end options.',
      'Present three paths: lease new, purchase, or return.',
      'Offer to schedule a consultation with a sales consultant.',
      'Follow up at 60, 30, and 14 days if there is no response.',
    ],
    tools: ['CRM update', 'DMS integration', 'Inventory search', 'Lead routing', 'Send confirmation', 'Schedule appointment'],
  },
  {
    id: 'p-029',
    name: 'Service lapse re-engagement',
    category: 'Outbound',
    description: 'Re-engages customers who have not visited for service in a while.',
    whenToUse: 'A customer has not visited for service in 6 or more months.',
    steps: [
      'Send a friendly SMS noting time since the last visit.',
      'Highlight recommended maintenance based on mileage estimate.',
      'Offer a convenient scheduling link.',
      'Include any current service specials or coupons.',
    ],
    tools: ['DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment', 'Knowledge base'],
  },
  {
    id: 'p-030',
    name: 'CSI follow-up',
    category: 'Outbound',
    description: 'Sends a satisfaction survey and escalates negative responses.',
    whenToUse: 'A customer completed a service or purchase within the last 48 hours.',
    steps: [
      'Send a satisfaction survey via SMS.',
      'Alert the service/sales manager immediately on a negative response.',
      'Thank the customer and request an online review on a positive response.',
      'Log the survey response in CRM.',
    ],
    tools: ['CRM update', 'Send confirmation', 'Tone analysis'],
  },
]

// ── Featured rich content (matches the Figma detail screen) ─────
// p-005 is the emergency/urgent procedure that the Figma detail and
// edit screens showcase, with structured steps, inline chips, and a
// filled context panel.
const EMERGENCY: Procedure = {
  id: 'p-005',
  name: 'Handle emergency or urgent concern',
  category: 'Inbound General',
  description: 'Detects urgent symptoms or safety issues and routes the caller fast, for caller safety.',
  lastEdited: 'May 18',
  whenToUse:
    "Caller describes a worsening problem, a safety issue, a breakdown they feel can't wait, anxiety about a vehicle fault, or any time-sensitive issue (but not life-threatening).",
  steps: [
    {
      title: 'Safety check first',
      bullets: [
        { tokens: ['State clearly: "If this is life-threatening — a fire, a crash, or anyone is hurt — please hang up and call 911 right now."'] },
        {
          tokens: [
            'Wait briefly for a response. If the caller confirms it is life-threatening → end with the 911 instruction ',
            ref('tool', 'End conversation'),
          ],
        },
      ],
    },
    {
      title: 'Acknowledge and triage',
      bullets: [
        { tokens: ['"I hear you — that sounds really stressful. Let\'s get you taken care of."'] },
        {
          tokens: [
            'One question only: is this a breakdown, a worsening fault, or a new concern ',
            ref('tool', 'agent_turn'),
          ],
        },
        { tokens: ['Do not assess, diagnose, or advise.'] },
      ],
    },
    {
      title: 'Route to care',
      bullets: [
        {
          tokens: [
            'If a same-day appointment is appropriate, invoke ',
            ref('subagent', 'Appointment_Management_agent'),
            ' ',
            ref('context', 'visit_type=urgent'),
          ],
        },
        {
          tokens: [
            'If immediate attention is needed → invoke ',
            ref('procedure', 'Escalate_to_staff'),
          ],
        },
        { tokens: ['Always confirm the next step explicitly: "I\'m connecting you to our service line now" or "You\'re booked at 2pm — please come straight in."'] },
      ],
    },
    {
      title: 'Close',
      bullets: [
        {
          tokens: ['Invoke ', ref('procedure', 'Close_session')],
        },
      ],
    },
  ],
  tools: ['patient_lookup', 'End conversation', 'agent_turn'],
  context: [
    { kind: 'context', label: 'Location.name' },
    { kind: 'context', label: 'Location.brand' },
    { kind: 'file', label: 'Products_list.PDF' },
    { kind: 'link', label: 'www.aspendental.com' },
  ],
}

// Default context set used to fill out non-featured procedures.
const DEFAULT_CONTEXT: ContextItem[] = [
  { kind: 'context', label: 'Location.name' },
  { kind: 'context', label: 'Location.hours' },
]

function transform(raw: RawProcedure): Procedure {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    description: raw.description,
    lastEdited: 'May 18',
    whenToUse: raw.whenToUse,
    steps: raw.steps.map((title) => ({ title, bullets: [] })),
    tools: raw.tools,
    context: DEFAULT_CONTEXT,
  }
}

// Final list — emergency procedure inserted at position 3 to mirror Figma.
const transformed = RAW.map(transform)
export const PROCEDURES: Procedure[] = [
  ...transformed.slice(0, 2),
  EMERGENCY,
  ...transformed.slice(2),
]

export const ALL_CATEGORIES: ProcedureCategory[] = [
  'Inbound General',
  'Service',
  'Sales',
  'Parts',
  'After-Hours',
  'Outbound',
]

// ── Healthcare Frontdesk procedures ────────────────────────────────────────────
const HC_CONTEXT: ContextItem[] = [
  { kind: 'context', label: 'Location.name' },
  { kind: 'context', label: 'Location.brand' },
  { kind: 'context', label: 'Patient.name' },
  { kind: 'context', label: 'Patient.dob' },
  { kind: 'context', label: 'Patient.phone' },
  { kind: 'context', label: 'Patient.insurance' },
  { kind: 'context', label: 'Appointment.type' },
  { kind: 'context', label: 'Appointment.date' },
  { kind: 'context', label: 'Provider.name' },
  { kind: 'file',    label: 'Insurance_accepted.PDF' },
  { kind: 'file',    label: 'Office_hours.PDF' },
  { kind: 'link',    label: 'Patient_portal_url' },
  { kind: 'link',    label: 'Telehealth_link' },
]

/** Display order for healthcare Procedures library and workflow procedure nodes */
export const HC_PROCEDURE_ORDER = [
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
] as const

function sortProceduresByOrder(procedures: Procedure[], order: readonly string[]): Procedure[] {
  const rank = new Map(order.map((name, index) => [name, index]))
  return [...procedures].sort(
    (a, b) =>
      (rank.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b.name) ?? Number.MAX_SAFE_INTEGER),
  )
}

const HC_PROCEDURES_UNSORTED: Procedure[] = [
  {
    id: 'hc-fd-02',
    name: 'Handle general inquiry',
    category: 'Healthcare Frontdesk',
    description: 'Answers informational questions about hours, location, insurance, services, and directions. Includes emergency triage when patient mentions an urgent concern.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Patient asks a general or informational question — hours, location, parking, insurance accepted, services offered, directions, telehealth availability, wait times.',
    steps: [
      {
        title: 'Look up the answer',
        bullets: [
          { tokens: ['Query ', ref('tool', 'knowledge_base'), ' with the patient\'s question.'] },
          { tokens: ['If no confident match → "That\'s a great question — let me have someone from our team get back to you. What\'s the best way to reach you?" Use ', ref('tool', 'lead_capture'), ' to capture callback details and ', ref('tool', 'birdeye_create_contact'), ' to create a contact. Move to step 4.'] },
        ],
      },
      {
        title: 'If it\'s an emergency',
        bullets: [
          { tokens: ['If patient mentions an emergency: state clearly: "If this is life-threatening — difficulty breathing, chest pain, loss of consciousness — please hang up and call 911 right now."'] },
          { tokens: ['Wait briefly. If patient confirms life-threatening → end with 911 instruction (', ref('tool', 'End conversation'), ').'] },
          { tokens: ['If unclear → respond contextually: "I hear you — that sounds really uncomfortable. Let\'s get you taken care of."'] },
          { tokens: ['If business hours → use ', ref('tool', 'transfer_to_human'), '.'] },
          { tokens: ['If outside business hours → "Our teams are not available as it\'s outside working hours. We\'ll have someone call or text you back tomorrow — can I take your request?" Move to step 4.'] },
          { tokens: ['Do not assess, diagnose, or advise.'] },
        ],
      },
      {
        title: 'Deliver the answer conversationally',
        bullets: [
          { tokens: ['Answer in 1–2 sentences. Plain language. No FAQ recitation.'] },
          { tokens: ['Never invent provider, insurance, or clinical details.'] },
        ],
      },
      {
        title: 'Check for follow-up',
        bullets: [
          { tokens: ['"Is there anything else I can help with?" (', ref('tool', 'agent_turn'), ')'] },
          { tokens: ['Wait for the patient\'s next message — other procedures fire on their own triggers.'] },
          { tokens: ['If patient indicates they\'re done → invoke ', ref('procedure', 'Close_session'), '.'] },
        ],
      },
    ],
    tools: ['knowledge_base', 'lead_capture', 'birdeye_create_contact', 'transfer_to_human', 'End conversation', 'agent_turn'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-03',
    name: 'Handle emergency or urgent concern',
    category: 'Healthcare Frontdesk',
    description: 'Triages urgent (non-life-threatening) patient concerns and routes to same-day care or nurse line.',
    lastEdited: 'Jun 2026',
    whenToUse: "Patient describes worsening symptoms, medication reaction, post-visit concern they feel can't wait, anxiety about results, or any time-sensitive medical issue (but not life-threatening).",
    steps: [
      {
        title: 'Safety check first',
        bullets: [
          { tokens: ['State clearly: "If this is life-threatening — difficulty breathing, chest pain, loss of consciousness — please hang up and call 911 right now."'] },
          { tokens: ['Wait briefly. If patient confirms life-threatening → end with 911 instruction. Invoke ', ref('tool', 'End conversation'), '.'] },
        ],
      },
      {
        title: 'Acknowledge and triage',
        bullets: [
          { tokens: ['"I hear you — that sounds really uncomfortable. Let\'s get you taken care of."'] },
          { tokens: ['One question only: is this a reaction, a worsening symptom, or a new concern? (', ref('tool', 'agent_turn'), '). Do not assess, diagnose, or advise.'] },
        ],
      },
      {
        title: 'Route to care',
        bullets: [
          { tokens: ['If same-day appointment appropriate → invoke ', ref('subagent', 'Appointment_Management_agent'), ' with visit_type=urgent.'] },
          { tokens: ['If immediate clinical eyes needed → invoke ', ref('procedure', 'Escalate_to_staff'), ' with queue=nurse_line, priority=high.'] },
          { tokens: ['Always confirm next step explicitly: "I\'m connecting you to our nurse line now" or "You\'re booked at 2pm — please come straight in."'] },
        ],
      },
      {
        title: 'Close',
        bullets: [{ tokens: ['Invoke ', ref('procedure', 'Close_session'), '.'] }],
      },
    ],
    tools: ['agent_turn', 'End conversation', 'Escalate_to_staff'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-04',
    name: 'Handle unclear message',
    category: 'Healthcare Frontdesk',
    description: 'Recovers unclear or ambiguous patient messages through two guided clarification attempts before escalating.',
    lastEdited: 'Jun 2026',
    whenToUse: "Patient's message is too vague, ambiguous, or out-of-scope to match any other procedure's trigger with confidence.",
    steps: [
      {
        title: 'Ask one open clarifying question',
        bullets: [
          { tokens: ['"I want to make sure I help you with the right thing — could you tell me a little more about what you\'re looking for?" (', ref('tool', 'agent_turn'), ')'] },
          { tokens: ['Wait for response. Other procedures may fire if the new message matches their trigger.'] },
        ],
      },
      {
        title: 'Try once more with options',
        bullets: [
          { tokens: ['If still unclear: "Are you calling about an appointment, a question about your care, or something else?" (', ref('tool', 'agent_turn'), ')'] },
          { tokens: ['Wait for response. Match against procedure triggers.'] },
        ],
      },
      {
        title: 'Escalate gracefully',
        bullets: [
          { tokens: ['Never say "I don\'t understand." Instead: "Let me get someone from our team who can help you directly."'] },
          { tokens: ['Invoke ', ref('procedure', 'Escalate_to_staff'), ' with reason=message_unclear_after_2_attempts.'] },
        ],
      },
    ],
    tools: ['agent_turn', 'Escalate_to_staff'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-05',
    name: 'Talk to human',
    category: 'Healthcare Frontdesk',
    description: 'Immediately connects the patient to a live team member when requested, or captures a callback request if outside business hours.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Patient explicitly asks to speak with a person, real agent, receptionist, or human — or expresses frustration with the AI.',
    steps: [
      {
        title: 'Acknowledge immediately',
        bullets: [
          { tokens: ['Respond contextually: "Of course — let me connect you with one of our team members. I\'ll pass along a quick note so you won\'t have to repeat yourself."'] },
          { tokens: ['Do not try to solve the issue first. Do not ask why.'] },
        ],
      },
      {
        title: 'Hand off',
        bullets: [
          { tokens: ['If business hours → use ', ref('tool', 'transfer_to_human'), '.'] },
          { tokens: ['If outside business hours → "Our teams are not available as it\'s outside working hours. We\'ll have someone call or text you back tomorrow — can I take your request?" Use ', ref('tool', 'lead_capture'), ' to capture callback details.'] },
        ],
      },
    ],
    tools: ['transfer_to_human', 'lead_capture'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-06',
    name: 'Book new appointment',
    category: 'Healthcare Frontdesk',
    description: 'Identifies the patient, captures details for new patients, verifies insurance, offers available slots, and confirms the appointment.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Patient wants to schedule a new appointment and mentions it explicitly ("I want to book an appointment").',
    steps: [
      {
        title: 'Identify the patient',
        bullets: [
          { tokens: ['Always say something natural before the tool runs: "Let me pull up your details — just one moment."'] },
          { tokens: ['Invoke ', ref('tool', 'lookup_patient'), ' using call_sid: ', ref('context', 'call_sid'), ' for caller ID.'] },
          { tokens: ['If present → proceed to step 2 with that number. If not → check conversation history for any phone number already provided.'] },
          { tokens: ['If still not found → "Could I get the best phone number for you?"'] },
          { tokens: ['If existing patient (is_new_patient = false) → skip to step 4. If new patient → continue to step 2.'] },
        ],
      },
      {
        title: 'Capture patient details',
        bullets: [
          { tokens: ['Ask: "Will this appointment be for you, or for someone else?" — skip if already clear from context.'] },
          { tokens: ['If booking for self → invoke ', ref('tool', 'Capture_new_patient_details'), '.'] },
          { tokens: ['If booking for someone else → invoke ', ref('tool', 'Capture_dependent_details'), '.'] },
        ],
      },
      {
        title: 'Verify insurance',
        bullets: [
          { tokens: ['Invoke ', ref('procedure', 'Verify_insurance'), '. Wait for the result before showing slots.'] },
          { tokens: ['If verified → proceed to step 4 and surface any flag in the final confirmation.'] },
          { tokens: ['If patient abandons due to coverage issue → skip to step 5 with outcome = abandoned_at_insurance.'] },
        ],
      },
      {
        title: 'Offer and confirm slot',
        bullets: [
          { tokens: ['Check past appointments and use only the last appointment\'s provider. Invoke ', ref('tool', 'Get_services_and_specialists'), '.'] },
          { tokens: ['Based on provider, invoke ', ref('tool', 'get_available_slots'), ' and present options.'] },
        ],
      },
      {
        title: 'Create the appointment',
        bullets: [
          { tokens: ['Acknowledge: "Great — booking that for you now."'] },
          { tokens: ['Call ', ref('tool', 'create_appointment'), ' with all collected fields. Pass both contact_dob and dependent dob if booking for someone else.'] },
          { tokens: ['On slot_taken error → invoke ', ref('procedure', 'Handle_slot_conflict'), '.'] },
          { tokens: ['On system error → invoke ', ref('procedure', 'Handle_booking_failure'), '.'] },
        ],
      },
      {
        title: 'Confirm booking and close',
        bullets: [
          { tokens: ['"You\'re all set — {service_name} with {specialist_name} on {date} at {time}."'] },
          { tokens: ['If insurance flag from step 3: append context (PA, COB, pending, self-pay) in plain language.'] },
          { tokens: ['Invoke ', ref('procedure', 'Confirm_and_close'), '.'] },
        ],
      },
    ],
    tools: ['lookup_patient', 'Capture_new_patient_details', 'Capture_dependent_details', 'Get_services_and_specialists', 'get_available_slots', 'create_appointment'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-07',
    name: 'Reschedule appointment',
    category: 'Healthcare Frontdesk',
    description: 'Looks up the patient\'s existing appointments, finds a new slot, and moves the appointment without re-triggering insurance verification.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Patient has an existing appointment and wants to move it to a different date or time — "change my appointment," "can we move it," "something came up."',
    steps: [
      {
        title: 'Identify the patient',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'lookup_patient'), '. Required to retrieve existing appointments.'] },
          { tokens: ['If no existing appointments found → "I\'m not seeing an upcoming appointment under that number. Would you like me to book a new one?" If yes → invoke ', ref('procedure', 'Book_new_appointment'), '.'] },
        ],
      },
      {
        title: 'Present existing appointments',
        bullets: [
          { tokens: ['"I can see you have {N} upcoming appointment(s): {list with provider, date, time}. Which one would you like to reschedule?"'] },
          { tokens: ['If only one → "I see your appointment with {provider} on {date} at {time}. Is that the one you\'d like to reschedule?"'] },
        ],
      },
      {
        title: 'Find a new slot',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'get_available_slots'), '. Rescheduling does NOT re-trigger insurance verification unless the visit type is changing.'] },
          { tokens: ['Present up to 3 slot options. Confirm patient\'s choice.'] },
        ],
      },
      {
        title: 'Execute the reschedule',
        bullets: [
          { tokens: ['Acknowledge: "Moving that for you now."'] },
          { tokens: ['Call ', ref('tool', 'reschedule_appointment'), ' with the existing appointment_id from lookup result, plus new slot details.'] },
          { tokens: ['On slot_taken error → invoke ', ref('procedure', 'Handle_slot_conflict'), '.'] },
          { tokens: ['On system error → invoke ', ref('procedure', 'Handle_booking_failure'), '.'] },
        ],
      },
      {
        title: 'Confirm and close',
        bullets: [
          { tokens: ['"Done — I\'ve moved your appointment to {new_date} at {new_time}."'] },
          { tokens: ['Invoke ', ref('procedure', 'Confirm_and_close'), '.'] },
        ],
      },
    ],
    tools: ['lookup_patient', 'get_available_slots', 'reschedule_appointment'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-08',
    name: 'Cancel appointment',
    category: 'Healthcare Frontdesk',
    description: 'Locates the patient\'s appointment, confirms the cancellation intent, and releases the slot — with an optional offer to rebook.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Patient wants to cancel an existing appointment without immediately rebooking — "I need to cancel," "I can\'t make it," "please remove my appointment."',
    steps: [
      {
        title: 'Identify the patient',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'lookup_patient'), '.'] },
          { tokens: ['If no existing appointments → "I\'m not seeing an upcoming appointment under that number — there may not be anything to cancel. Is there anything else I can help with?"'] },
        ],
      },
      {
        title: 'Present existing appointments',
        bullets: [
          { tokens: ['"I can see your appointment with {provider} on {date} at {time}. Is that the one you\'d like to cancel?"'] },
          { tokens: ['If multiple → list them and ask which one. Save the chosen appointment_id from lookup result.'] },
        ],
      },
      {
        title: 'Confirm intention to cancel',
        bullets: [
          { tokens: ['"Just to confirm — you\'d like to cancel your appointment with {provider} on {date} at {time}. Is that right?"'] },
          { tokens: ['This is a destructive action — confirmation is required before proceeding.'] },
        ],
      },
      {
        title: 'Execute cancellation',
        bullets: [
          { tokens: ['Acknowledge: "Cancelling that for you."'] },
          { tokens: ['Call ', ref('tool', 'cancel_appointment'), ' with the appointment_id from lookup result.'] },
          { tokens: ['On error → invoke ', ref('procedure', 'Handle_booking_failure'), '.'] },
        ],
      },
      {
        title: 'Confirm and close',
        bullets: [
          { tokens: ['"Done — your appointment has been cancelled. We hope to see you again soon."'] },
          { tokens: ['Invoke ', ref('procedure', 'Confirm_and_close'), '.'] },
        ],
      },
    ],
    tools: ['lookup_patient', 'cancel_appointment'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-09',
    name: 'Handle slot conflict',
    category: 'Healthcare Frontdesk',
    description: 'Re-offers availability when the chosen slot was taken between selection and write, with up to 2 automatic retries.',
    lastEdited: 'Jun 2026',
    whenToUse: 'The create_appointment or reschedule_appointment tool returned a slot_taken error — the selected slot was booked by someone else between selection and write.',
    steps: [
      {
        title: 'Brief apology and re-query',
        bullets: [
          { tokens: ['"I\'m so sorry — that slot just got taken. Let me find you the next best option right away."'] },
          { tokens: ['Call ', ref('tool', 'get_available_slots'), ' live for the same specialist and date window.'] },
        ],
      },
      {
        title: 'Re-offer alternatives',
        bullets: [
          { tokens: ['If alternatives exist → present up to 3 new options. On selection, retry the original write (return to Book new appointment step 5 or Reschedule appointment step 4).'] },
          { tokens: ['If none available → "I wasn\'t able to find another slot that fits right now. I\'ve noted your preferred time and our team will reach out within one business day."'] },
        ],
      },
      {
        title: 'Log request if needed',
        bullets: [
          { tokens: ['If no alternatives accepted → call ', ref('tool', 'birdeye_task_creator'), ' with patient, preferred time, specialist, callback number, priority = high.'] },
          { tokens: ['Invoke ', ref('procedure', 'Confirm_and_close'), '.'] },
        ],
      },
      {
        title: 'Retry cap',
        bullets: [
          { tokens: ['Maximum 2 automatic retries per session. If exceeded → invoke ', ref('procedure', 'Escalate_to_staff'), ' with reason = slot_conflict_retry_exceeded.'] },
        ],
      },
    ],
    tools: ['get_available_slots', 'birdeye_task_creator'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-10',
    name: 'Handle booking failure',
    category: 'Healthcare Frontdesk',
    description: 'Recovers gracefully from tool failures (connectivity errors, timeouts, patient creation failures) by logging a high-priority staff task and confirming callback details.',
    lastEdited: 'Jun 2026',
    whenToUse: 'A tool call (create_appointment, reschedule_appointment, cancel_appointment, lookup_patient) failed for a non-slot reason — connectivity error, API timeout, or patient creation failed.',
    steps: [
      {
        title: 'Reassure patient — no technical detail',
        bullets: [
          { tokens: ['"I want to make sure your appointment gets handled correctly — let me have our team confirm this directly."'] },
          { tokens: ['Never expose system errors. Never ask the patient to call back.'] },
        ],
      },
      {
        title: 'Confirm callback details',
        bullets: [
          { tokens: ['"I\'ve noted everything — {service_name}, {date}, {time}. Someone will reach out shortly. Is your best number still {phone_on_file}?"'] },
        ],
      },
      {
        title: 'Log staff task',
        bullets: [
          { tokens: ['Call ', ref('tool', 'update_state'), ' to save all collected information.'] },
          { tokens: ['Call ', ref('tool', 'birdeye_task_creator'), ' with all booking context + session transcript URL. Priority = high. Add internal comment: "Booking tool failed — manual completion needed."'] },
          { tokens: ['If SMS available → send acknowledgment via ', ref('tool', 'sms_gateway'), ': "Thanks for calling — our team will follow up on your request shortly."'] },
        ],
      },
      {
        title: 'Close',
        bullets: [
          { tokens: ['Invoke ', ref('procedure', 'Confirm_and_close'), ' with outcome = booking_pending_manual.'] },
        ],
      },
    ],
    tools: ['update_state', 'birdeye_task_creator', 'sms_gateway'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-11',
    name: 'Verify insurance',
    category: 'Healthcare Frontdesk',
    description: 'Runs a real-time eligibility check so the patient knows their copay and coverage status before picking a slot. Handles PA requirements, COB, self-pay, and pending verification paths.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Runs eligibility check against the patient\'s insurance on file or newly collected, so the patient knows their copay and coverage status before they pick a time.',
    steps: [
      {
        title: 'Check what\'s on file',
        bullets: [
          { tokens: ['Call ', ref('tool', 'ehr_insurance_read'), ' for the patient.'] },
          { tokens: ['If insurance found AND last_verified < 30 days → skip to step 3.'] },
          { tokens: ['If found but stale (>30 days) → use existing data, go to step 3 (re-verify).'] },
          { tokens: ['If not found OR member_id missing → go to step 2.'] },
        ],
      },
      {
        title: 'Collect insurance details from patient',
        bullets: [
          { tokens: ['"To confirm your coverage, could I get your insurance plan name?"'] },
          { tokens: ['"And your member ID — that\'s on the front of your insurance card."'] },
          { tokens: ['If patient is a dependent → "Is this plan in your name, or are you on someone else\'s plan?" If dependent → capture subscriber name, DOB, and relationship.'] },
          { tokens: ['If patient says "no insurance" → skip to step 4 with path = self_pay.'] },
          { tokens: ['If patient can\'t provide after 2 attempts → skip to step 4 with path = data_missing.'] },
          { tokens: ['Normalize payer name via ', ref('tool', 'payer_name_normalizer'), '. If payer not in dictionary → invoke ', ref('procedure', 'Escalate_to_staff'), ' with reason = payer_unknown.'] },
        ],
      },
      {
        title: 'Run real-time eligibility check',
        bullets: [
          { tokens: ['Acknowledge: "Let me check your coverage — just one moment."'] },
          { tokens: ['Call ', ref('tool', 'availity_270_submit'), ' (primary, ~98% payer coverage). Timeout = 4 seconds on live call.'] },
          { tokens: ['On timeout or error → retry once on ', ref('tool', 'change_hc_270_fallback'), '.'] },
          { tokens: ['If both fail → "I\'m pulling that up — I\'ll make sure everything\'s confirmed before your visit." Queue background retry. Set verification_status = pending and go to step 4.'] },
          { tokens: ['On success → call ', ref('tool', 'edi_271_parser'), ' to extract coverage_status, copay_amount, deductible, in_network_status, prior_auth_required, referral_required, cob_flag.'] },
        ],
      },
      {
        title: 'Branch on result and communicate',
        bullets: [
          { tokens: ['Clean (active, in-network, no flags): "Great news — your {payer} is active and accepted here. Your estimated copay is ${copay}." Persist via ', ref('tool', 'ehr_coverage_write'), '. Return with insurance.verified.'] },
          { tokens: ['PA / referral required: "Your coverage looks active — one thing to flag: your plan requires {pa_or_referral} for this type of visit. Our team will handle that before your appointment." Create high-priority billing task. Return with insurance.verified (pa_flag=true).'] },
          { tokens: ['Coverage issue (inactive / out-of-network): "I wasn\'t able to verify active coverage with {payer}. You can give me updated insurance, proceed as self-pay, or have our billing team reach out. Which works best?"'] },
          { tokens: ['COB (multiple active plans): "It looks like you have more than one active plan — our billing team will sort out primary vs. secondary before your visit. Could I get the second plan\'s details too?"'] },
          { tokens: ['Self-pay: load rate from ', ref('tool', 'practice_kb'), '. "For a {service_name} visit as self-pay, the rate is ${self_pay_rate}. Would you like to proceed?"'] },
        ],
      },
      {
        title: 'Persist and return',
        bullets: [
          { tokens: ['Call ', ref('tool', 'ehr_coverage_write'), ' with parsed coverage details and verification timestamp.'] },
          { tokens: ['Emit appropriate event and return control to ', ref('procedure', 'Book_new_appointment'), '.'] },
        ],
      },
    ],
    tools: ['ehr_insurance_read', 'payer_name_normalizer', 'availity_270_submit', 'change_hc_270_fallback', 'edi_271_parser', 'ehr_coverage_write', 'practice_kb'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-12',
    name: 'Appointment confirmation',
    category: 'Healthcare Frontdesk',
    description: 'Outbound flow that confirms a scheduled appointment via text then voice call, branching on patient response.',
    lastEdited: 'Jun 2026',
    whenToUse: 'Triggered outbound when an appointment is scheduled and the confirmation journey begins.',
    steps: [
      {
        title: 'Branch: LLM — patient response check',
        bullets: [
          { tokens: ['If patient confirmed the slot → invoke ', ref('tool', 'update_state'), ' with confirmed = true.'] },
          { tokens: ['If patient has not confirmed AND it\'s been 10 minutes → proceed to outbound call step.'] },
          { tokens: ['If patient asks something else → transfer to Frontdesk agent OR respond: "I\'m here to only discuss the waitlist slot confirmation — for anything else, someone from my team will get back to you."'] },
        ],
      },
      {
        title: 'Send text (if slot is open and unconfirmed after 10 min)',
        bullets: [
          { tokens: ['Use ', ref('tool', 'sms_gateway'), ' to send slot confirmation text with confirm / decline options.'] },
        ],
      },
      {
        title: 'Make outbound call',
        bullets: [
          { tokens: ['Initiate outbound voice call to patient.'] },
        ],
      },
      {
        title: 'Branch: LLM — call response',
        bullets: [
          { tokens: ['If patient confirmed the slot → invoke ', ref('tool', 'update_state'), ' with confirmed = true.'] },
          { tokens: ['If patient has not confirmed → end call → loop back to fetch waitlist node.'] },
          { tokens: ['If patient asks something else → transfer to Frontdesk agent OR respond: "I\'m here to only discuss the waitlist slot confirmation — for anything else, someone from my team will get back to you."'] },
        ],
      },
    ],
    tools: ['update_state', 'sms_gateway'],
    context: HC_CONTEXT,
  },
  {
    id: 'hc-fd-13',
    name: 'Waitlist slot confirmation',
    category: 'Healthcare Frontdesk',
    description: 'Contacts waitlisted patients when a slot opens, confirms via text then outbound call, and loops back to the waitlist if unconfirmed.',
    lastEdited: 'Jun 2026',
    whenToUse: 'A slot opens on the waitlist and the system needs to offer it to the next eligible patient.',
    steps: [
      {
        title: 'Check slot and notify',
        bullets: [
          { tokens: ['If the slot is open → use ', ref('tool', 'sms_gateway'), ' to send text to waitlisted patient.'] },
        ],
      },
      {
        title: 'Branch: LLM — text response',
        bullets: [
          { tokens: ['If patient confirmed → invoke ', ref('tool', 'update_state'), '.'] },
          { tokens: ['If patient has not confirmed AND it\'s been 10 minutes → proceed to make outbound call.'] },
          { tokens: ['If patient asks something else → transfer to Frontdesk agent OR: "I\'m here to only discuss the waitlist slot confirmation — for anything else, someone from my team will get back to you."'] },
        ],
      },
      {
        title: 'Make outbound call',
        bullets: [
          { tokens: ['Initiate outbound voice call to patient.'] },
        ],
      },
      {
        title: 'Branch: LLM — call response',
        bullets: [
          { tokens: ['If patient confirmed the slot → invoke ', ref('tool', 'update_state'), '.'] },
          { tokens: ['If patient has not confirmed → end call → loop back to ', ref('tool', 'Fetch_Waitlist'), ' node.'] },
          { tokens: ['If patient asks something else → transfer to Frontdesk agent OR: "I\'m here to only discuss the waitlist slot confirmation — for anything else, someone from my team will get back to you."'] },
        ],
      },
    ],
    tools: ['sms_gateway', 'update_state', 'Fetch_Waitlist'],
    context: HC_CONTEXT,
  },
]

export const HC_PROCEDURES = sortProceduresByOrder(HC_PROCEDURES_UNSORTED, HC_PROCEDURE_ORDER)

export const HC_ALL_CATEGORIES: ProcedureCategory[] = ['Healthcare Frontdesk']
