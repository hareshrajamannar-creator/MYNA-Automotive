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

// ── Rich procedures (automotive frontdesk) ──────────────────────

const RICH_PROCEDURES: Procedure[] = [
  // ── p-001 ──────────────────────────────────────────────────────
  {
    id: 'p-001',
    name: 'Greet and open conversation',
    category: 'Inbound General',
    description: 'Identifies the caller, screens for urgency, and routes them to the right procedure.',
    lastEdited: 'May 18',
    whenToUse: 'Every inbound call, chat, or text session begins.',
    steps: [
      {
        title: 'Deliver branded greeting',
        bullets: [
          { tokens: ['Answer with the dealership name and agent name — pull ', ref('context', 'Location.name'), ' and ', ref('context', 'Agent.name'), ' from context.'] },
          { tokens: ['Keep the greeting warm and under 10 seconds.'] },
        ],
      },
      {
        title: 'Invite the request',
        bullets: [
          { tokens: ['Ask an open-ended "How can I help you today?" — do not suggest a topic.'] },
          { tokens: ['Listen to the full opening statement before processing intent.'] },
        ],
      },
      {
        title: 'Classify intent',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Intent classifier'), ' on the caller\'s opening message.'] },
          { tokens: ['Map the result to one of the registered intent categories (service, sales, parts, general, emergency).'] },
        ],
      },
      {
        title: 'Confirm and route',
        bullets: [
          { tokens: ['Confirm detected intent with the caller: "It sounds like you\'d like to [intent] — is that right?"'] },
          { tokens: ['On confirmation, invoke the appropriate procedure for the detected intent.'] },
        ],
      },
    ],
    tools: ['Intent classifier', 'Knowledge base'],
    context: [
      { kind: 'context', label: 'Location.name' },
      { kind: 'context', label: 'Agent.name' },
    ],
  },

  // ── p-002 ──────────────────────────────────────────────────────
  {
    id: 'p-002',
    name: 'Handle general inquiry',
    category: 'Inbound General',
    description: 'Answers informational questions like hours, location, financing, and services.',
    lastEdited: 'May 12',
    whenToUse: 'Caller has a question that does not match a specific procedure.',
    steps: [
      {
        title: 'Fully hear the question',
        bullets: [
          { tokens: ['Let the caller finish their full question without interruption.'] },
          { tokens: ['Restate the question briefly to confirm understanding.'] },
        ],
      },
      {
        title: 'Search for an answer',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Knowledge base'), ' with the caller\'s question as the query.'] },
          { tokens: ['Use ', ref('context', 'Location.name'), ' as a filter to surface location-specific answers (hours, address, services).'] },
        ],
      },
      {
        title: 'Deliver the answer',
        bullets: [
          { tokens: ['Provide a concise answer — one or two sentences maximum.'] },
          { tokens: ['Include the source if relevant (e.g., "According to our service page…").'] },
        ],
      },
      {
        title: 'Wrap and log',
        bullets: [
          { tokens: ['Ask if the caller has additional questions.'] },
          { tokens: ['Log the inquiry topic via ', ref('tool', 'CRM update'), ' for analytics and routing improvements.'] },
        ],
      },
    ],
    tools: ['Knowledge base', 'CRM update'],
    context: [
      { kind: 'context', label: 'Location.name' },
      { kind: 'context', label: 'Location.hours' },
    ],
  },

  // ── p-003 ──────────────────────────────────────────────────────
  {
    id: 'p-003',
    name: 'Department transfer',
    category: 'Inbound General',
    description: 'Routes the caller to the right department with a warm, context-rich handoff.',
    lastEdited: 'May 6',
    whenToUse: 'Caller requests a specific department or intent maps to another department.',
    steps: [
      {
        title: 'Confirm destination',
        bullets: [
          { tokens: ['Confirm which department the caller wants: Service, Sales, Parts, Finance, or Management.'] },
          { tokens: ['If ambiguous, ask one clarifying question only.'] },
        ],
      },
      {
        title: 'Check availability',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Check business hours'), ' with the target department ID.'] },
          { tokens: ['Compare against ', ref('context', 'Location.hours'), ' to determine whether the department is open.'] },
        ],
      },
      {
        title: 'Transfer or offer alternatives',
        bullets: [
          { tokens: ['If the department is open: perform a warm transfer with a one-sentence context summary for the receiving agent.'] },
          { tokens: ['If the department is closed: offer voicemail, callback scheduling, or escalate via ', ref('tool', 'Trigger escalation'), '.'] },
        ],
      },
      {
        title: 'Log the transfer',
        bullets: [
          { tokens: ['Record the transfer outcome and reason code via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['Check business hours', 'CRM update', 'Trigger escalation'],
    context: [
      { kind: 'context', label: 'Location.name' },
      { kind: 'context', label: 'Location.hours' },
    ],
  },

  // ── p-004 ──────────────────────────────────────────────────────
  {
    id: 'p-004',
    name: 'Handle unclear message',
    category: 'Inbound General',
    description: "Clarifies vague or out-of-scope messages to recover the caller's intent.",
    lastEdited: 'Apr 29',
    whenToUse: 'Speech-to-text confidence is low or caller intent is ambiguous.',
    steps: [
      {
        title: 'Apologize and prompt rephrasing',
        bullets: [
          { tokens: ['Apologize without blaming the caller: "I\'m sorry — I didn\'t quite catch that."'] },
          { tokens: ['Ask the caller to rephrase using different words.'] },
        ],
      },
      {
        title: 'Offer intent suggestions',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Intent classifier'), ' on the low-confidence transcript to surface the top 3 candidate intents.'] },
          { tokens: ['Present the top 2–3 options to the caller: "Were you calling about service, sales, or something else?"'] },
        ],
      },
      {
        title: 'Final clarification attempt',
        bullets: [
          { tokens: ['If still unclear after two attempts, make one final open-ended rephrasing request.'] },
          { tokens: ['If unresolved, invoke ', ref('tool', 'Trigger escalation'), ' to hand off to a human agent.'] },
        ],
      },
    ],
    tools: ['ElevenLabs STT', 'Intent classifier', 'Trigger escalation'],
    context: [
      { kind: 'context', label: 'Location.name' },
      { kind: 'context', label: 'Location.hours' },
    ],
  },

  // ── p-006 ──────────────────────────────────────────────────────
  {
    id: 'p-006',
    name: 'Talk to human',
    category: 'Inbound General',
    description: 'Hands off to a live agent when the caller asks for a person or shows frustration.',
    lastEdited: 'Apr 22',
    whenToUse: 'Caller explicitly requests a human agent.',
    steps: [
      {
        title: 'Acknowledge without resistance',
        bullets: [
          { tokens: ['Confirm the request immediately: "Of course — let me connect you with a team member."'] },
          { tokens: ['Do not attempt to deflect or resolve the issue before transferring.'] },
        ],
      },
      {
        title: 'Identify the right person',
        bullets: [
          { tokens: ['Ask if the caller has a specific person or department in mind.'] },
          { tokens: ['Invoke ', ref('tool', 'Check business hours'), ' to confirm the team is available.'] },
        ],
      },
      {
        title: 'Warm transfer',
        bullets: [
          { tokens: ['Initiate a warm transfer via ', ref('tool', 'Trigger escalation'), ' with a conversation context summary.'] },
          { tokens: ['If no one is available, offer a callback with an estimated wait time based on ', ref('context', 'Location.hours'), '.'] },
        ],
      },
      {
        title: 'Log the request',
        bullets: [
          { tokens: ['Record the escalation request and outcome via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['Trigger escalation', 'CRM update', 'Check business hours'],
    context: [
      { kind: 'context', label: 'Location.name' },
      { kind: 'context', label: 'Location.hours' },
    ],
  },

  // ── p-007 ──────────────────────────────────────────────────────
  {
    id: 'p-007',
    name: 'Identify caller',
    category: 'Inbound General',
    description: 'Confirms caller identity before any account or appointment action is taken.',
    lastEdited: 'Apr 15',
    whenToUse: 'Before performing any account-specific or appointment action.',
    steps: [
      {
        title: 'Collect identity details',
        bullets: [
          { tokens: ['Ask for the name and phone number associated with the account.'] },
          { tokens: ['Store collected values as ', ref('context', 'Customer_name'), ' and ', ref('context', 'Customer_phone'), '.'] },
        ],
      },
      {
        title: 'Verify against CRM',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Voice identity'), ' to match the caller\'s voice profile if available.'] },
          { tokens: ['Cross-reference name and phone against the CRM record via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
      {
        title: 'Confirm vehicle on file',
        bullets: [
          { tokens: ['If the task is vehicle-related, confirm the vehicle on file matches the caller\'s description.'] },
          { tokens: ['Store as ', ref('context', 'Vehicle_details'), ' for use in downstream steps.'] },
        ],
      },
      {
        title: 'Proceed on verified identity',
        bullets: [
          { tokens: ['Only proceed to the requested action after identity is confirmed.'] },
          { tokens: ['If identity cannot be verified, invoke ', ref('procedure', 'Talk to human'), ' to hand off.'] },
        ],
      },
    ],
    tools: ['Voice identity', 'CRM update'],
    context: [
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Customer_phone' },
      { kind: 'context', label: 'Vehicle_details' },
    ],
  },

  // ── p-008 ──────────────────────────────────────────────────────
  {
    id: 'p-008',
    name: 'Schedule service appointment',
    category: 'Service',
    description: 'Finds availability and schedules a new service visit for the customer.',
    lastEdited: 'Apr 8',
    whenToUse: 'Caller wants to book a service appointment.',
    steps: [
      {
        title: 'Collect vehicle details',
        bullets: [
          { tokens: ['Ask for year, make, model, and mileage → store as ', ref('context', 'Vehicle_details'), '.'] },
          { tokens: ['If VIN is available, invoke ', ref('tool', 'VIN decode'), ' for service-history context.'] },
        ],
      },
      {
        title: 'Identify service type',
        bullets: [
          { tokens: ['Ask what type of service is needed (oil change, repair, recall, etc.).'] },
          { tokens: ['Cross-reference ', ref('context', 'Vehicle_details'), ' with known maintenance schedules.'] },
        ],
      },
      {
        title: 'Find and confirm slot',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'DMS integration'), ' and ', ref('tool', 'Schedule appointment'), ' to pull available slots.'] },
          { tokens: ['Offer the soonest 2–3 options that fit the caller\'s preference.'] },
          { tokens: ['Confirm date, time, and service advisor with the caller.'] },
        ],
      },
      {
        title: 'Confirm and log',
        bullets: [
          { tokens: ['Send SMS/email via ', ref('tool', 'Send confirmation'), ' with appointment details.'] },
          { tokens: ['Create the appointment record in DMS and update ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Schedule appointment', 'VIN decode', 'Send confirmation', 'CRM update'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-012 ──────────────────────────────────────────────────────
  {
    id: 'p-012',
    name: 'Reschedule appointment',
    category: 'Service',
    description: 'Moves an existing upcoming appointment to a new time.',
    lastEdited: 'Apr 2',
    whenToUse: 'Caller wants to change an existing appointment.',
    steps: [
      {
        title: 'Verify identity and locate appointment',
        bullets: [
          { tokens: ['Invoke ', ref('procedure', 'Identify caller'), ' to confirm identity.'] },
          { tokens: ['Look up the existing appointment via ', ref('tool', 'DMS integration'), ' → store as ', ref('context', 'Appointment_id'), '.'] },
        ],
      },
      {
        title: 'Confirm which appointment to change',
        bullets: [
          { tokens: ['If the customer has multiple upcoming appointments, present them and confirm which one to modify.'] },
        ],
      },
      {
        title: 'Offer new slots',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Schedule appointment'), ' to retrieve the next available slots.'] },
          { tokens: ['Offer the closest 2–3 options to the original time.'] },
        ],
      },
      {
        title: 'Update and confirm',
        bullets: [
          { tokens: ['Update the DMS record via ', ref('tool', 'DMS integration'), ' with the new date and time.'] },
          { tokens: ['Send an updated confirmation via ', ref('tool', 'Send confirmation'), ' and log via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Schedule appointment', 'Send confirmation', 'CRM update'],
    context: [
      { kind: 'context', label: 'Appointment_id' },
      { kind: 'context', label: 'Customer_name' },
    ],
  },

  // ── p-012b ─────────────────────────────────────────────────────
  {
    id: 'p-012b',
    name: 'Cancel appointment',
    category: 'Service',
    description: 'Cancels an existing appointment and releases the slot.',
    lastEdited: 'Mar 28',
    whenToUse: 'Caller wants to cancel an existing appointment.',
    steps: [
      {
        title: 'Verify identity and locate appointment',
        bullets: [
          { tokens: ['Invoke ', ref('procedure', 'Identify caller'), ' to confirm identity.'] },
          { tokens: ['Look up the appointment via ', ref('tool', 'DMS integration'), ' using ', ref('context', 'Customer_name'), ' or ', ref('context', 'Appointment_id'), '.'] },
        ],
      },
      {
        title: 'Confirm cancellation and capture reason',
        bullets: [
          { tokens: ['Read back the appointment details and ask the caller to confirm cancellation.'] },
          { tokens: ['Capture the cancellation reason — store for reporting.'] },
        ],
      },
      {
        title: 'Release the slot',
        bullets: [
          { tokens: ['Cancel the appointment in ', ref('tool', 'DMS integration'), ' to release the slot back to availability.'] },
        ],
      },
      {
        title: 'Send confirmation',
        bullets: [
          { tokens: ['Send a cancellation confirmation via ', ref('tool', 'Send confirmation'), '.'] },
          { tokens: ['Log the cancellation via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Send confirmation', 'CRM update'],
    context: [
      { kind: 'context', label: 'Appointment_id' },
      { kind: 'context', label: 'Customer_name' },
    ],
  },

  // ── p-008b ─────────────────────────────────────────────────────
  {
    id: 'p-008b',
    name: 'Book new appointment',
    category: 'Service',
    description: 'Finds availability and schedules a new visit for the customer.',
    lastEdited: 'Mar 20',
    whenToUse: 'Caller has no existing appointment and wants to book a visit.',
    steps: [
      {
        title: 'Confirm reason for visit',
        bullets: [
          { tokens: ['Ask the caller what brings them in — maintenance, repair, recall, or other.'] },
          { tokens: ['Store the reason as ', ref('context', 'Visit_reason'), ' for downstream scheduling.'] },
        ],
      },
      {
        title: 'Check availability',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'DMS integration'), ' with the visit reason to find open slots.'] },
          { tokens: ['Offer the soonest slots that match the requested service type.'] },
        ],
      },
      {
        title: 'Confirm and book',
        bullets: [
          { tokens: ['Confirm the chosen date and time with the caller.'] },
          { tokens: ['Invoke ', ref('tool', 'Schedule appointment'), ' to create the booking record.'] },
        ],
      },
      {
        title: 'Send confirmation',
        bullets: [
          { tokens: ['Send appointment confirmation via ', ref('tool', 'Send confirmation'), ' with date, time, and location ', ref('context', 'Location.name'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Schedule appointment', 'Send confirmation'],
    context: [
      { kind: 'context', label: 'Visit_reason' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-013b ─────────────────────────────────────────────────────
  {
    id: 'p-013b',
    name: 'Handle slot conflict',
    category: 'Service',
    description: 'Re-offers availability when the chosen slot was already taken.',
    lastEdited: 'Mar 14',
    whenToUse: 'The slot the caller picked is no longer available.',
    steps: [
      {
        title: 'Apologize for the conflict',
        bullets: [
          { tokens: ['Inform the caller that the requested slot is no longer available — do not over-explain.'] },
          { tokens: ['Keep the tone positive: "Let me find you the next best option."'] },
        ],
      },
      {
        title: 'Pull alternative slots',
        bullets: [
          { tokens: ['Re-invoke ', ref('tool', 'DMS integration'), ' to fetch the next available openings.'] },
          { tokens: ['Filter results to slots closest to the caller\'s original preference.'] },
        ],
      },
      {
        title: 'Offer alternatives',
        bullets: [
          { tokens: ['Present 2–3 alternative slots via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Let the caller choose; do not push a specific option.'] },
        ],
      },
      {
        title: 'Confirm the new booking',
        bullets: [
          { tokens: ['Book the selected slot and send an updated confirmation via ', ref('tool', 'Send confirmation'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Schedule appointment', 'Send confirmation'],
    context: [
      { kind: 'context', label: 'Appointment_id' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-009 ──────────────────────────────────────────────────────
  {
    id: 'p-009',
    name: 'Repair / diagnostic triage',
    category: 'Service',
    description: 'Triages a described vehicle problem and books the right level of service.',
    lastEdited: 'Mar 7',
    whenToUse: 'Caller describes a vehicle problem or warning light.',
    steps: [
      {
        title: 'Collect symptom and vehicle info',
        bullets: [
          { tokens: ['Ask the caller to describe the symptom as specifically as possible.'] },
          { tokens: ['Collect vehicle year, make, model, and mileage → store as ', ref('context', 'Vehicle_details'), '.'] },
          { tokens: ['If VIN is available, invoke ', ref('tool', 'VIN decode'), ' for service-history context.'] },
        ],
      },
      {
        title: 'Clarify onset and severity',
        bullets: [
          { tokens: ['Ask when the problem started, how often it occurs, and whether warning lights are on.'] },
          { tokens: ['Do not diagnose — only gather detail for the technician.'] },
        ],
      },
      {
        title: 'Check guidance and assess urgency',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Knowledge base'), ' with the symptom description to surface common diagnostic notes.'] },
          { tokens: ['Assess urgency: safe to drive (schedule next available) vs. immediate attention needed (same-day or tow).'] },
        ],
      },
      {
        title: 'Book appointment and advise',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'DMS integration'), ' and ', ref('tool', 'Schedule appointment'), ' with appropriate urgency flag.'] },
          { tokens: ['Provide interim safety guidance if warranted (e.g., "Do not drive the vehicle").'] },
        ],
      },
    ],
    tools: ['Knowledge base', 'DMS integration', 'Schedule appointment', 'VIN decode'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-010 ──────────────────────────────────────────────────────
  {
    id: 'p-010',
    name: 'Recall inquiry',
    category: 'Service',
    description: 'Checks for open recalls on a vehicle and books recall service.',
    lastEdited: 'Feb 26',
    whenToUse: 'Caller asks about recalls on their vehicle.',
    steps: [
      {
        title: 'Collect vehicle identifier',
        bullets: [
          { tokens: ['Ask for the VIN or year/make/model → store as ', ref('context', 'Vehicle_details'), '.'] },
          { tokens: ['Invoke ', ref('tool', 'VIN decode'), ' to normalize the vehicle identifier.'] },
        ],
      },
      {
        title: 'Query recall database',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'NHTSA recall lookup'), ' with the decoded VIN.'] },
          { tokens: ['Retrieve all open and closed recalls for the vehicle.'] },
        ],
      },
      {
        title: 'Report recall status',
        bullets: [
          { tokens: ['Summarize open recalls by name and safety impact to the caller.'] },
          { tokens: ['Clarify that recall repairs are performed at no cost to the customer.'] },
        ],
      },
      {
        title: 'Book recall service if applicable',
        bullets: [
          { tokens: ['If an open recall exists, offer to schedule immediately via ', ref('tool', 'DMS integration'), ' and ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Send the appointment confirmation via ', ref('tool', 'Send confirmation'), '.'] },
        ],
      },
    ],
    tools: ['VIN decode', 'NHTSA recall lookup', 'DMS integration', 'Schedule appointment', 'Send confirmation'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-011 ──────────────────────────────────────────────────────
  {
    id: 'p-011',
    name: 'Service status check',
    category: 'Service',
    description: 'Reports the status and estimated completion of an in-progress repair.',
    lastEdited: 'Feb 18',
    whenToUse: 'Caller inquires about an in-progress repair.',
    steps: [
      {
        title: 'Verify identity and vehicle',
        bullets: [
          { tokens: ['Invoke ', ref('procedure', 'Identify caller'), ' to confirm identity and link to vehicle.'] },
          { tokens: ['Confirm ', ref('context', 'Vehicle_details'), ' matches the active repair order.'] },
        ],
      },
      {
        title: 'Look up repair order',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'DMS integration'), ' to retrieve the active repair order by vehicle or appointment ID.'] },
          { tokens: ['Optionally invoke ', ref('tool', 'Voice identity'), ' for identity confirmation if not already done.'] },
        ],
      },
      {
        title: 'Provide status update',
        bullets: [
          { tokens: ['Report the current repair status and estimated completion time.'] },
          { tokens: ['If additional work was found, relay the description and cost estimate before proceeding.'] },
        ],
      },
      {
        title: 'Send status update',
        bullets: [
          { tokens: ['Offer to send a status update via text using ', ref('tool', 'Send confirmation'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Voice identity', 'Send confirmation'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Customer_name' },
    ],
  },

  // ── p-013 ──────────────────────────────────────────────────────
  {
    id: 'p-013',
    name: 'Warranty inquiry',
    category: 'Service',
    description: 'Explains warranty coverage and books work under warranty when eligible.',
    lastEdited: 'Feb 11',
    whenToUse: 'Caller asks about warranty coverage.',
    steps: [
      {
        title: 'Collect vehicle and mileage',
        bullets: [
          { tokens: ['Ask for the VIN and current mileage → store as ', ref('context', 'Vehicle_details'), '.'] },
          { tokens: ['Invoke ', ref('tool', 'VIN decode'), ' to retrieve vehicle production date and original warranty start.'] },
        ],
      },
      {
        title: 'Look up warranty status',
        bullets: [
          { tokens: ['Query warranty status via ', ref('tool', 'DMS integration'), ' using the VIN and mileage.'] },
          { tokens: ['Retrieve coverage periods for basic, powertrain, and any extended plans.'] },
        ],
      },
      {
        title: 'Explain coverage',
        bullets: [
          { tokens: ['Summarize what is and is not covered under active warranties.'] },
          { tokens: ['Reference ', ref('tool', 'Knowledge base'), ' for OEM warranty terms if detailed explanation is needed.'] },
        ],
      },
      {
        title: 'Offer warranty service booking',
        bullets: [
          { tokens: ['If a covered repair is needed, offer to schedule immediately — note the warranty coverage on the appointment.'] },
        ],
      },
    ],
    tools: ['VIN decode', 'DMS integration', 'Knowledge base'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-014 ──────────────────────────────────────────────────────
  {
    id: 'p-014',
    name: 'New vehicle inquiry',
    category: 'Sales',
    description: 'Matches interest to inventory and captures a sales lead.',
    lastEdited: 'Feb 3',
    whenToUse: 'Caller is interested in purchasing a new vehicle.',
    steps: [
      {
        title: 'Understand preferences',
        bullets: [
          { tokens: ['Ask about desired vehicle type, key features, and budget range.'] },
          { tokens: ['Store preferences as ', ref('context', 'Vehicle_details'), ' for inventory matching.'] },
        ],
      },
      {
        title: 'Search inventory',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Inventory search'), ' with the collected preferences.'] },
          { tokens: ['Filter results to new vehicles in stock at ', ref('context', 'Location.name'), '.'] },
        ],
      },
      {
        title: 'Present options',
        bullets: [
          { tokens: ['Present the top 2–3 matching vehicles with key specs and pricing.'] },
          { tokens: ['Ask which option most closely matches what the caller had in mind.'] },
        ],
      },
      {
        title: 'Capture lead and route',
        bullets: [
          { tokens: ['Offer to schedule a test drive via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Capture the lead via ', ref('tool', 'CRM update'), ' and route to a sales consultant via ', ref('tool', 'Lead routing'), '.'] },
        ],
      },
    ],
    tools: ['Inventory search', 'CRM update', 'Lead routing', 'Schedule appointment'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-015 ──────────────────────────────────────────────────────
  {
    id: 'p-015',
    name: 'Used / CPO vehicle inquiry',
    category: 'Sales',
    description: 'Matches pre-owned interest to inventory and shares vehicle history.',
    lastEdited: 'Jan 27',
    whenToUse: 'Caller is interested in pre-owned or certified vehicles.',
    steps: [
      {
        title: 'Capture preferences',
        bullets: [
          { tokens: ['Ask about preferred make, model, year range, budget, and must-have features.'] },
          { tokens: ['Note whether CPO certification is a priority.'] },
        ],
      },
      {
        title: 'Search used/CPO inventory',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Inventory search'), ' filtered to used and CPO stock at ', ref('context', 'Location.name'), '.'] },
          { tokens: ['If CPO is desired, highlight certification benefits in the result summary.'] },
        ],
      },
      {
        title: 'Share vehicle history',
        bullets: [
          { tokens: ['For top matches, invoke ', ref('tool', 'VIN decode'), ' to retrieve accident and service history.'] },
          { tokens: ['Summarize history highlights — one-owner, accident-free, service records — relevant to the caller.'] },
        ],
      },
      {
        title: 'Capture lead',
        bullets: [
          { tokens: ['Offer to schedule a viewing or test drive.'] },
          { tokens: ['Capture the lead via ', ref('tool', 'CRM update'), ' and route via ', ref('tool', 'Lead routing'), '.'] },
        ],
      },
    ],
    tools: ['Inventory search', 'VIN decode', 'CRM update', 'Lead routing'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-016 ──────────────────────────────────────────────────────
  {
    id: 'p-016',
    name: 'Trade-in valuation',
    category: 'Sales',
    description: 'Provides an estimated trade-in range and offers an in-person appraisal.',
    lastEdited: 'Jan 19',
    whenToUse: 'Caller wants to know the trade-in value of their current vehicle.',
    steps: [
      {
        title: 'Collect vehicle details',
        bullets: [
          { tokens: ['Ask for year, make, model, trim level, and current mileage → store as ', ref('context', 'Vehicle_details'), '.'] },
        ],
      },
      {
        title: 'Assess condition',
        bullets: [
          { tokens: ['Ask the caller to describe condition: excellent, good, fair, or rough.'] },
          { tokens: ['Reference ', ref('tool', 'Knowledge base'), ' for condition-grading definitions if needed.'] },
        ],
      },
      {
        title: 'Provide estimated range',
        bullets: [
          { tokens: ['Generate an estimated trade-in range based on market data from ', ref('tool', 'Knowledge base'), '.'] },
          { tokens: ['Add a disclaimer: final value is subject to in-person inspection.'] },
        ],
      },
      {
        title: 'Offer appraisal appointment',
        bullets: [
          { tokens: ['Offer to schedule an in-person appraisal via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Log the trade-in interest via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['Knowledge base', 'CRM update', 'Schedule appointment'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-017 ──────────────────────────────────────────────────────
  {
    id: 'p-017',
    name: 'Finance pre-qualification',
    category: 'Sales',
    description: 'Explains financing options and routes to F&I for detailed review.',
    lastEdited: 'Jan 12',
    whenToUse: 'Caller asks about financing options or payment estimates.',
    steps: [
      {
        title: 'Explain financing options',
        bullets: [
          { tokens: ['Summarize available options: dealership finance, manufacturer incentives, lease, and balloon.'] },
          { tokens: ['Reference ', ref('tool', 'Knowledge base'), ' for current promotional rates.'] },
        ],
      },
      {
        title: 'Provide indicative ranges',
        bullets: [
          { tokens: ['Provide typical APR and term ranges without committing to specific figures.'] },
          { tokens: ['Clarify that rates depend on credit profile, which requires F&I review.'] },
        ],
      },
      {
        title: 'Set expectations for pre-qualification',
        bullets: [
          { tokens: ['Explain that pre-qualification is non-binding and does not impact credit score.'] },
          { tokens: ['Describe the documents needed: proof of income, ID, and current registration.'] },
        ],
      },
      {
        title: 'Schedule with finance manager',
        bullets: [
          { tokens: ['Offer to schedule an appointment with a finance manager via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Capture the lead via ', ref('tool', 'CRM update'), ' and route via ', ref('tool', 'Lead routing'), '.'] },
        ],
      },
    ],
    tools: ['Knowledge base', 'CRM update', 'Lead routing', 'Schedule appointment'],
    context: [
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-018 ──────────────────────────────────────────────────────
  {
    id: 'p-018',
    name: 'Test drive scheduling',
    category: 'Sales',
    description: 'Confirms availability and books a test drive for the vehicles of interest.',
    lastEdited: 'Jan 5',
    whenToUse: 'Caller wants to schedule a test drive.',
    steps: [
      {
        title: 'Confirm vehicle of interest',
        bullets: [
          { tokens: ['Ask which vehicle(s) the caller wants to test drive → store as ', ref('context', 'Vehicle_details'), '.'] },
        ],
      },
      {
        title: 'Verify vehicle availability',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Inventory search'), ' to confirm the vehicle is in stock at ', ref('context', 'Location.name'), '.'] },
        ],
      },
      {
        title: 'Collect contact and preference',
        bullets: [
          { tokens: ['Collect name, phone, and preferred date/time → store as ', ref('context', 'Customer_name'), '.'] },
        ],
      },
      {
        title: 'Book and confirm',
        bullets: [
          { tokens: ['Check sales consultant availability and book via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Send a confirmation via ', ref('tool', 'Send confirmation'), ' and capture the lead via ', ref('tool', 'CRM update'), ' and ', ref('tool', 'Lead routing'), '.'] },
        ],
      },
    ],
    tools: ['Inventory search', 'Schedule appointment', 'Send confirmation', 'CRM update', 'Lead routing'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-019 ──────────────────────────────────────────────────────
  {
    id: 'p-019',
    name: 'Internet lead qualification',
    category: 'Sales',
    description: 'Follows up on an online inquiry and qualifies the lead.',
    lastEdited: 'Dec 28',
    whenToUse: 'Following up on an online form submission or website inquiry.',
    steps: [
      {
        title: 'Reference the inquiry',
        bullets: [
          { tokens: ['Open by referencing the specific vehicle or topic from the lead submission → use ', ref('context', 'Vehicle_details'), '.'] },
          { tokens: ['Do not make the caller repeat information already submitted online.'] },
        ],
      },
      {
        title: 'Confirm interest and timeline',
        bullets: [
          { tokens: ['Ask whether the caller is still interested and their purchase timeline.'] },
          { tokens: ['Capture urgency level: within a week, this month, or just browsing.'] },
        ],
      },
      {
        title: 'Ask qualifying questions',
        bullets: [
          { tokens: ['Confirm budget range, trade-in vehicle, and financing preference.'] },
          { tokens: ['Update lead record via ', ref('tool', 'CRM update'), ' with qualification responses.'] },
        ],
      },
      {
        title: 'Present matches and close',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Inventory search'), ' for matching vehicles.'] },
          { tokens: ['Offer a test drive or appointment via ', ref('tool', 'Schedule appointment'), ' and route the qualified lead via ', ref('tool', 'Lead routing'), '.'] },
          { tokens: ['Send a follow-up summary via ', ref('tool', 'Send confirmation'), '.'] },
        ],
      },
    ],
    tools: ['CRM update', 'Inventory search', 'Lead routing', 'Schedule appointment', 'Send confirmation'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Customer_name' },
    ],
  },

  // ── p-020 ──────────────────────────────────────────────────────
  {
    id: 'p-020',
    name: 'Parts availability & pricing',
    category: 'Parts',
    description: 'Checks parts availability and pricing and offers to place an order.',
    lastEdited: 'Dec 19',
    whenToUse: 'Caller inquires about parts availability or pricing.',
    steps: [
      {
        title: 'Collect part details',
        bullets: [
          { tokens: ['Ask for the part description or OEM part number.'] },
          { tokens: ['If the caller doesn\'t have the part number, ask for the vehicle year/make/model and affected component.'] },
        ],
      },
      {
        title: 'Confirm fitment via VIN',
        bullets: [
          { tokens: ['If a VIN is available, invoke ', ref('tool', 'VIN decode'), ' to confirm exact part fitment for the vehicle.'] },
          { tokens: ['Store the decoded vehicle as ', ref('context', 'Vehicle_details'), ' to avoid re-collecting during the same call.'] },
        ],
      },
      {
        title: 'Search parts inventory',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'DMS integration'), ' to look up availability and price in the parts management system.'] },
          { tokens: ['Also check ', ref('tool', 'Knowledge base'), ' for any OEM supersession notes.'] },
        ],
      },
      {
        title: 'Present availability and offer ordering',
        bullets: [
          { tokens: ['Report in-stock status, price, and lead time.'] },
          { tokens: ['If not in stock, offer to place a special order and provide an estimated arrival date.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'VIN decode', 'Knowledge base'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-021 ──────────────────────────────────────────────────────
  {
    id: 'p-021',
    name: 'After-hours lead capture',
    category: 'After-Hours',
    description: 'Captures a sales inquiry received outside business hours for next-day follow-up.',
    lastEdited: 'Dec 11',
    whenToUse: 'A sales inquiry is received outside business hours.',
    steps: [
      {
        title: 'Communicate hours',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Check business hours'), ' to retrieve actual opening time.'] },
          { tokens: ['Inform the caller of ', ref('context', 'Location.hours'), ' and the next available opening time.'] },
        ],
      },
      {
        title: 'Capture inquiry details',
        bullets: [
          { tokens: ['Collect name, phone, email, and vehicle of interest → store as ', ref('context', 'Customer_name'), ' and ', ref('context', 'Vehicle_details'), '.'] },
          { tokens: ['Assure the caller that a team member will follow up the next business morning.'] },
        ],
      },
      {
        title: 'Send confirmation',
        bullets: [
          { tokens: ['Send a confirmation text via ', ref('tool', 'Send confirmation'), ' with ', ref('context', 'Location.hours'), ' and a brief summary of the inquiry.'] },
        ],
      },
      {
        title: 'Create priority lead',
        bullets: [
          { tokens: ['Create a priority lead in CRM via ', ref('tool', 'CRM update'), ' flagged for morning follow-up.'] },
          { tokens: ['Route the lead via ', ref('tool', 'Lead routing'), ' to the appropriate sales team.'] },
        ],
      },
    ],
    tools: ['Check business hours', 'CRM update', 'Send confirmation', 'Lead routing'],
    context: [
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Location.hours' },
    ],
  },

  // ── p-022 ──────────────────────────────────────────────────────
  {
    id: 'p-022',
    name: 'After-hours service request',
    category: 'After-Hours',
    description: 'Triages a service inquiry received outside business hours.',
    lastEdited: 'Dec 4',
    whenToUse: 'A service inquiry is received outside business hours.',
    steps: [
      {
        title: 'Communicate service hours',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Check business hours'), ' to retrieve the service department schedule.'] },
          { tokens: ['Inform the caller of ', ref('context', 'Location.hours'), ' and the next available service window.'] },
        ],
      },
      {
        title: 'Assess urgency',
        bullets: [
          { tokens: ['Ask if the vehicle is driveable or if there is an immediate safety concern.'] },
          { tokens: ['If urgent/unsafe, provide the roadside assistance number immediately.'] },
        ],
      },
      {
        title: 'Handle non-urgent requests',
        bullets: [
          { tokens: ['For non-urgent needs, collect contact details and the service description.'] },
          { tokens: ['Log via ', ref('tool', 'CRM update'), ' for next-morning callback scheduling.'] },
        ],
      },
      {
        title: 'Confirm and close',
        bullets: [
          { tokens: ['Send a confirmation via ', ref('tool', 'Send confirmation'), ' with service hours and expected callback time.'] },
        ],
      },
    ],
    tools: ['Check business hours', 'CRM update', 'Send confirmation'],
    context: [
      { kind: 'context', label: 'Location.hours' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-023 ──────────────────────────────────────────────────────
  {
    id: 'p-023',
    name: 'Lead follow-up call',
    category: 'Outbound',
    description: 'Calls an internet lead within minutes to confirm interest and book a visit.',
    lastEdited: 'Nov 26',
    whenToUse: 'An internet lead is received and an outbound call is initiated within 5 minutes.',
    steps: [
      {
        title: 'Introduce and reference inquiry',
        bullets: [
          { tokens: ['Introduce by name and mention the specific vehicle or inquiry from the lead source.'] },
          { tokens: ['Reference ', ref('context', 'Vehicle_details'), ' so the caller knows you reviewed their submission.'] },
        ],
      },
      {
        title: 'Confirm interest and qualify',
        bullets: [
          { tokens: ['Ask qualifying questions: purchase timeline, budget, trade-in, and financing.'] },
          { tokens: ['Update ', ref('tool', 'CRM update'), ' with qualification responses in real time.'] },
        ],
      },
      {
        title: 'Present inventory matches',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Inventory search'), ' with the caller\'s stated preferences.'] },
          { tokens: ['Present the top 2 matches briefly — make, trim, and price.'] },
        ],
      },
      {
        title: 'Convert or follow up',
        bullets: [
          { tokens: ['Offer an immediate test drive or appointment via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['If no answer: leave a voicemail and send an SMS follow-up via ', ref('tool', 'Send confirmation'), '.'] },
          { tokens: ['Route the lead via ', ref('tool', 'Lead routing'), ' for continued follow-up.'] },
        ],
      },
    ],
    tools: ['CRM update', 'Inventory search', 'Schedule appointment', 'Send confirmation', 'Lead routing'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Customer_name' },
    ],
  },

  // ── p-025 ──────────────────────────────────────────────────────
  {
    id: 'p-025',
    name: 'Appointment confirmation',
    category: 'Outbound',
    description: 'Runs the reminder journey that confirms a scheduled appointment.',
    lastEdited: 'Nov 17',
    whenToUse: 'An appointment is scheduled and the confirmation journey begins.',
    steps: [
      {
        title: 'Send immediate confirmation',
        bullets: [
          { tokens: ['Send an SMS confirmation immediately after booking via ', ref('tool', 'Send confirmation'), '.'] },
          { tokens: ['Include ', ref('context', 'Appointment_id'), ', date, time, service type, and ', ref('context', 'Location.name'), '.'] },
        ],
      },
      {
        title: 'Send 24-hour reminder',
        bullets: [
          { tokens: ['Send an SMS reminder 24 hours before via ', ref('tool', 'Send confirmation'), ' with confirm/reschedule options.'] },
          { tokens: ['Include a quick-reply link to reschedule if needed.'] },
        ],
      },
      {
        title: 'Final confirmation call',
        bullets: [
          { tokens: ['Place a voice confirmation call 2 hours before the appointment.'] },
          { tokens: ['Allow the customer to confirm, reschedule, or cancel via voice response.'] },
        ],
      },
      {
        title: 'Update appointment status',
        bullets: [
          { tokens: ['Process the response and update appointment status in DMS via ', ref('tool', 'DMS integration'), '.'] },
          { tokens: ['If no response is received, invoke ', ref('tool', 'Schedule appointment'), ' to flag for manual follow-up.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'Send confirmation', 'Schedule appointment'],
    context: [
      { kind: 'context', label: 'Appointment_id' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-026 ──────────────────────────────────────────────────────
  {
    id: 'p-026',
    name: 'No-show re-engagement',
    category: 'Outbound',
    description: 'Re-engages a customer who missed an appointment and offers easy rebooking.',
    lastEdited: 'Nov 9',
    whenToUse: 'Customer missed a scheduled appointment without canceling.',
    steps: [
      {
        title: 'Wait before outreach',
        bullets: [
          { tokens: ['Wait 2 hours after the scheduled appointment time before sending outreach.'] },
          { tokens: ['Confirm no-show status in DMS via ', ref('tool', 'DMS integration'), ' before contacting.'] },
        ],
      },
      {
        title: 'Send empathetic SMS',
        bullets: [
          { tokens: ['Send an SMS via ', ref('tool', 'Send confirmation'), ' acknowledging the missed appointment without blame.'] },
          { tokens: ['Keep the tone warm: "We noticed you weren\'t able to make it — no worries at all."'] },
        ],
      },
      {
        title: 'Offer rescheduling',
        bullets: [
          { tokens: ['Include a one-click rescheduling link pointing to the next available slots via ', ref('tool', 'Schedule appointment'), '.'] },
        ],
      },
      {
        title: 'Voice follow-up',
        bullets: [
          { tokens: ['If no response within 24 hours, place a follow-up voice call.'] },
          { tokens: ['Log all outreach attempts via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment'],
    context: [
      { kind: 'context', label: 'Appointment_id' },
      { kind: 'context', label: 'Customer_name' },
    ],
  },

  // ── p-027 ──────────────────────────────────────────────────────
  {
    id: 'p-027',
    name: 'Lease maturity outreach',
    category: 'Outbound',
    description: 'Proactively presents lease-end options before a lease matures.',
    lastEdited: 'Nov 2',
    whenToUse: 'A customer lease matures within 90 days.',
    steps: [
      {
        title: 'Initial outreach',
        bullets: [
          { tokens: ['Send an SMS via ', ref('tool', 'Send confirmation'), ' introducing lease-end options at the 90-day mark.'] },
          { tokens: ['Reference ', ref('context', 'Vehicle_details'), ' and the lease maturity date so the message is personalized.'] },
        ],
      },
      {
        title: 'Present lease-end paths',
        bullets: [
          { tokens: ['Present the three options clearly: lease a new vehicle, purchase the current vehicle, or return and walk away.'] },
          { tokens: ['Invoke ', ref('tool', 'Inventory search'), ' to surface relevant new models for the "lease new" path.'] },
        ],
      },
      {
        title: 'Offer consultation',
        bullets: [
          { tokens: ['Offer to schedule a consultation with a sales consultant via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['Route the lead via ', ref('tool', 'Lead routing'), ' and log via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
      {
        title: 'Cadenced follow-up',
        bullets: [
          { tokens: ['Schedule follow-up touchpoints at 60, 30, and 14 days via ', ref('tool', 'DMS integration'), ' if no response.'] },
        ],
      },
    ],
    tools: ['CRM update', 'DMS integration', 'Inventory search', 'Lead routing', 'Send confirmation', 'Schedule appointment'],
    context: [
      { kind: 'context', label: 'Vehicle_details' },
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Location.name' },
    ],
  },

  // ── p-029 ──────────────────────────────────────────────────────
  {
    id: 'p-029',
    name: 'Service lapse re-engagement',
    category: 'Outbound',
    description: 'Re-engages customers who have not visited for service in a while.',
    lastEdited: 'Oct 24',
    whenToUse: 'A customer has not visited for service in 6 or more months.',
    steps: [
      {
        title: 'Personalized outreach SMS',
        bullets: [
          { tokens: ['Send an SMS via ', ref('tool', 'Send confirmation'), ' noting time since last visit — reference ', ref('context', 'Customer_name'), ' and vehicle from ', ref('tool', 'DMS integration'), '.'] },
          { tokens: ['Keep the tone friendly and non-pressuring.'] },
        ],
      },
      {
        title: 'Highlight recommended maintenance',
        bullets: [
          { tokens: ['Reference ', ref('tool', 'Knowledge base'), ' for maintenance intervals based on mileage estimate.'] },
          { tokens: ['Mention the most relevant service (e.g., oil change, brake inspection, tire rotation).'] },
        ],
      },
      {
        title: 'Offer scheduling and specials',
        bullets: [
          { tokens: ['Include a scheduling link via ', ref('tool', 'Schedule appointment'), '.'] },
          { tokens: ['If applicable, include current service specials sourced from ', ref('tool', 'Knowledge base'), '.'] },
        ],
      },
      {
        title: 'Log outreach',
        bullets: [
          { tokens: ['Log the outreach event via ', ref('tool', 'CRM update'), ' to track response rates.'] },
        ],
      },
    ],
    tools: ['DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment', 'Knowledge base'],
    context: [
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Vehicle_details' },
    ],
  },

  // ── p-030 ──────────────────────────────────────────────────────
  {
    id: 'p-030',
    name: 'CSI follow-up',
    category: 'Outbound',
    description: 'Sends a satisfaction survey and escalates negative responses.',
    lastEdited: 'Oct 16',
    whenToUse: 'A customer completed a service or purchase within the last 48 hours.',
    steps: [
      {
        title: 'Send satisfaction survey',
        bullets: [
          { tokens: ['Send a satisfaction survey via SMS through ', ref('tool', 'Send confirmation'), ' within 48 hours of completion.'] },
          { tokens: ['Personalize with ', ref('context', 'Customer_name'), ' and service/purchase details from ', ref('context', 'Appointment_id'), '.'] },
        ],
      },
      {
        title: 'Handle negative response',
        bullets: [
          { tokens: ['Invoke ', ref('tool', 'Tone analysis'), ' on the survey response to classify sentiment.'] },
          { tokens: ['On a negative response, alert the service or sales manager immediately via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
      {
        title: 'Handle positive response',
        bullets: [
          { tokens: ['Thank the customer and request an online review — include a direct link in the follow-up message.'] },
          { tokens: ['Log the positive response in ', ref('tool', 'CRM update'), ' for reporting.'] },
        ],
      },
      {
        title: 'Log all survey outcomes',
        bullets: [
          { tokens: ['Record the survey response, sentiment, and any actions taken via ', ref('tool', 'CRM update'), '.'] },
        ],
      },
    ],
    tools: ['CRM update', 'Send confirmation', 'Tone analysis'],
    context: [
      { kind: 'context', label: 'Customer_name' },
      { kind: 'context', label: 'Appointment_id' },
    ],
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
  lastEdited: 'Oct 8',
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

// Final list — emergency procedure inserted at position 3 to mirror Figma.
export const PROCEDURES: Procedure[] = [
  ...RICH_PROCEDURES.slice(0, 2),
  EMERGENCY,
  ...RICH_PROCEDURES.slice(2),
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
  'Recall — reactivate and book recare',
  'Revenue — resolve outstanding balance',
  'Treatment plan — schedule recommended treatment',
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
    lastEdited: 'Jun 9',
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
    lastEdited: 'Jun 7',
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
    lastEdited: 'Jun 5',
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
    lastEdited: 'Jun 3',
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
    lastEdited: 'Jun 2',
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
    lastEdited: 'May 30',
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
    lastEdited: 'May 27',
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
    lastEdited: 'May 24',
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
    lastEdited: 'May 21',
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
    lastEdited: 'May 18',
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
    lastEdited: 'May 15',
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
    lastEdited: 'May 11',
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

// ── Outbound agent procedures (Birdeye Dental) ─────────────────

const DENTAL_RECALL_CONTEXT: ContextItem[] = [
  { kind: 'context', label: 'location_name' },
  { kind: 'context', label: 'patient_first_name' },
  { kind: 'context', label: 'patient_is_minor' },
  { kind: 'context', label: 'contact_dob' },
  { kind: 'context', label: 'recare_type' },
  { kind: 'context', label: 'provider_name' },
  { kind: 'context', label: 'callback_number' },
]

const DENTAL_REVENUE_CONTEXT: ContextItem[] = [
  { kind: 'context', label: 'location_name' },
  { kind: 'context', label: 'patient_first_name' },
  { kind: 'context', label: 'patient_is_minor' },
  { kind: 'context', label: 'contact_dob' },
  { kind: 'context', label: 'outstanding_balance' },
  { kind: 'context', label: 'statement_date' },
  { kind: 'context', label: 'payment_link' },
  { kind: 'context', label: 'callback_number' },
]

const DENTAL_TP_CONTEXT: ContextItem[] = [
  { kind: 'context', label: 'location_name' },
  { kind: 'context', label: 'patient_first_name' },
  { kind: 'context', label: 'patient_is_minor' },
  { kind: 'context', label: 'contact_dob' },
  { kind: 'context', label: 'recommending_provider' },
  { kind: 'context', label: 'callback_number' },
]

HC_PROCEDURES_UNSORTED.push(
  {
    id: 'dental-ob-01',
    name: 'Recall — reactivate and book recare',
    category: 'Healthcare Frontdesk',
    description: 'Outbound call to reactivate a patient due or overdue for routine or preventive care (cleaning, exam, recare) and book the appointment.',
    lastEdited: 'Jun 16',
    whenToUse: 'Outbound call to a patient who is due or overdue for routine or preventive care (cleaning, periodic exam, recare, or unscheduled hygiene). Myna places the call to help them get back on the schedule.',
    steps: [
      {
        title: 'Reach the right person',
        bullets: [
          { tokens: ['Greet and identify: "Hello, this is Myna calling from ', ref('context', 'location_name'), '. May I please speak with ', ref('context', 'patient_first_name'), '?"'] },
          { tokens: ['If the person is unavailable → ask for a good callback time, share no details, go to step 7.'] },
          { tokens: ['If wrong number / not the patient → apologize, disclose nothing, honor any do-not-contact request. ', ref('tool', 'update_state')] },
          { tokens: ['If voicemail → leave a HIPAA-safe message (name, office, ', ref('context', 'callback_number'), ', no health details).'] },
        ],
      },
      {
        title: 'Verify identity (before any specifics)',
        bullets: [
          { tokens: ['If ', ref('context', 'patient_is_minor'), ' is false → ask the patient\'s date of birth and match it. ', ref('tool', 'lookup_patient')] },
          { tokens: ['If ', ref('context', 'patient_is_minor'), ' is true → confirm you\'re speaking with the patient\'s parent/legal guardian, verify the guardian\'s DOB. ', ref('tool', 'lookup_patient'), ' Then confirm which child by first name + DOB (one child at a time; never reference siblings).'] },
          { tokens: ['Never read stored details aloud. On mismatch/unauthorized → ask once more; if it still fails, disclose nothing, suggest calling ', ref('context', 'callback_number'), ', then ', ref('subagent', 'Router'), '.'] },
        ],
      },
      {
        title: 'State the reason for the call',
        bullets: [
          { tokens: ['Let them know they\'re due for their ', ref('context', 'recare_type'), '; keep it brief. ', ref('tool', 'get_recall_status')] },
        ],
      },
      {
        title: 'Gauge interest',
        bullets: [
          { tokens: ['Interested → go to step 5.'] },
          { tokens: ['Not now → offer a self-schedule text. ', ref('tool', 'send_text_confirmation'), ' Note the preference. ', ref('tool', 'update_state'), ' Go to step 7.'] },
          { tokens: ['Asks to stop → acknowledge. ', ref('tool', 'opt_out_processor'), ' ', ref('tool', 'update_state'), ' Go to step 7.'] },
        ],
      },
      {
        title: 'Book the recare appointment',
        bullets: [
          { tokens: ['"Let me check what\'s available." Get the preferred date, then ', ref('tool', 'get_available_slots')] },
          { tokens: ['Offer 2–3 slots; confirm the slot and provider together.'] },
          { tokens: ['Book ', ref('tool', 'create_appointment'), ' with ', ref('context', 'contact_dob'), ' (and dependent DOB for a child).'] },
        ],
      },
      {
        title: 'Anything out of scope',
        bullets: [
          { tokens: ['If the patient raises something outside recare scheduling → "Sure, give me just a moment." ', ref('tool', 'update_state'), ' Then ', ref('subagent', 'Router'), ' (don\'t explain the transfer).'] },
        ],
      },
      {
        title: 'Close',
        bullets: [
          { tokens: ['Confirm what was done; offer a text confirmation. ', ref('tool', 'send_text_confirmation')] },
          { tokens: ['"Is there anything else I can help you with today?" If no → "On a scale of 1 to 5, how was your experience today?"'] },
          { tokens: ['"Thank you so much — have a great day."'] },
        ],
      },
    ],
    tools: ['lookup_patient', 'get_recall_status', 'get_available_slots', 'create_appointment', 'send_text_confirmation', 'update_state', 'opt_out_processor'],
    context: DENTAL_RECALL_CONTEXT,
  },
  {
    id: 'dental-ob-02',
    name: 'Revenue — resolve outstanding balance',
    category: 'Healthcare Frontdesk',
    description: 'Outbound call to help a patient or guarantor pay securely, set up a payment plan, or route a dispute — respectfully, never like collections.',
    lastEdited: 'Jun 16',
    whenToUse: 'Outbound call to a patient or guarantor with an outstanding balance. Myna calls to help them pay securely, set up a payment plan, or route a dispute — respectfully, never like collections.',
    steps: [
      {
        title: 'Reach the right person',
        bullets: [
          { tokens: ['Greet and identify; ask for ', ref('context', 'patient_first_name'), '.'] },
          { tokens: ['Unavailable → ask for a callback time, no account details, go to step 6.'] },
          { tokens: ['Wrong number / not the account holder → apologize, disclose nothing, honor do-not-contact. ', ref('tool', 'update_state')] },
          { tokens: ['Voicemail → leave a message with NO balance or account details (name, office, ', ref('context', 'callback_number'), ').'] },
        ],
      },
      {
        title: 'Verify identity (before any account specifics)',
        bullets: [
          { tokens: ['Confirm you\'re speaking with the account holder / parent or legal guardian; verify their date of birth. ', ref('tool', 'lookup_patient'), ' Never read stored details aloud.'] },
          { tokens: ['On mismatch/unauthorized → disclose nothing, suggest calling ', ref('context', 'callback_number'), ', then ', ref('subagent', 'Router'), '.'] },
        ],
      },
      {
        title: 'State the reason for the call',
        bullets: [
          { tokens: ['Let them know there\'s a balance you\'d like to help resolve. ', ref('tool', 'get_account_balance'), ' State only the amount and statement date — for a minor the balance sits on the guarantor account; don\'t itemize per-child clinical detail.'] },
        ],
      },
      {
        title: 'Resolve the balance',
        bullets: [
          { tokens: ['Pay now → "I\'ll text you a secure link to take care of it." ', ref('tool', 'send_payment_link'), ' Never take card or bank numbers by voice; if offered, stop and use the link.'] },
          { tokens: ['Payment plan → confirm a workable arrangement at a high level, then ', ref('tool', 'create_payment_plan')] },
          { tokens: ['Dispute / itemized question → don\'t speculate. ', ref('tool', 'update_state'), ' Then ', ref('subagent', 'Router'), ' (billing).'] },
          { tokens: ['Asks to stop → ', ref('tool', 'opt_out_processor'), ' ', ref('tool', 'update_state')] },
        ],
      },
      {
        title: 'Anything out of scope',
        bullets: [
          { tokens: ['"Sure, give me just a moment." ', ref('tool', 'update_state'), ' Then ', ref('subagent', 'Router'), '.'] },
        ],
      },
      {
        title: 'Close',
        bullets: [
          { tokens: ['Confirm what was done; offer a text confirmation/receipt. ', ref('tool', 'send_text_confirmation')] },
          { tokens: ['"Anything else I can help with today?" If no → CSAT "On a scale of 1 to 5…"'] },
          { tokens: ['"Thank you so much — have a great day."'] },
        ],
      },
    ],
    tools: ['lookup_patient', 'get_account_balance', 'send_payment_link', 'create_payment_plan', 'send_text_confirmation', 'update_state', 'opt_out_processor'],
    context: DENTAL_REVENUE_CONTEXT,
  },
  {
    id: 'dental-ob-03',
    name: 'Treatment plan — schedule recommended treatment',
    category: 'Healthcare Frontdesk',
    description: 'Outbound call to help a patient book provider-recommended treatment that hasn\'t been scheduled yet. No clinical advice — cost questions routed to financial coordinator.',
    lastEdited: 'Jun 16',
    whenToUse: 'Outbound call to a patient with treatment their provider recommended but that hasn\'t been scheduled. Myna calls to help book it — no clinical advice, and cost questions are routed to the financial coordinator.',
    steps: [
      {
        title: 'Reach the right person',
        bullets: [
          { tokens: ['Greet and identify; ask for ', ref('context', 'patient_first_name'), '.'] },
          { tokens: ['Unavailable → ask for a callback time, no treatment details, go to step 6.'] },
          { tokens: ['Wrong number / not the patient → apologize, disclose nothing, honor do-not-contact. ', ref('tool', 'update_state')] },
          { tokens: ['Voicemail → leave a message with NO treatment or health details (name, office, ', ref('context', 'callback_number'), ').'] },
        ],
      },
      {
        title: 'Verify identity (before any specifics)',
        bullets: [
          { tokens: ['If ', ref('context', 'patient_is_minor'), ' is false → verify the patient\'s DOB. ', ref('tool', 'lookup_patient')] },
          { tokens: ['If ', ref('context', 'patient_is_minor'), ' is true → verify the guardian\'s DOB, then confirm which child by first name + DOB (one child at a time; never reference siblings).'] },
          { tokens: ['Never read stored details aloud. On mismatch/unauthorized → disclose nothing, suggest calling ', ref('context', 'callback_number'), ', then ', ref('subagent', 'Router'), '.'] },
        ],
      },
      {
        title: 'State the reason for the call (high-level)',
        bullets: [
          { tokens: ['"Your dentist recommended some follow-up care, and I\'d like to help you schedule it." Keep clinical detail off the call. ', ref('tool', 'get_treatment_plan')] },
        ],
      },
      {
        title: 'Handle the response',
        bullets: [
          { tokens: ['Interested → go to step 5.'] },
          { tokens: ['Clinical question (do I need it? is it urgent?) → do not advise; "I can have the provider follow up with you." ', ref('tool', 'update_state'), ' Then ', ref('subagent', 'Router'), '.'] },
          { tokens: ['Cost / insurance / financing → keep high-level, don\'t quote detailed costs. ', ref('tool', 'update_state'), ' Then ', ref('subagent', 'Router'), ' (financial coordinator).'] },
          { tokens: ['Not now → send an info text. ', ref('tool', 'send_text_confirmation'), ' Asks to stop → ', ref('tool', 'opt_out_processor'), ' ', ref('tool', 'update_state'), ' Go to step 6.'] },
        ],
      },
      {
        title: 'Book the treatment appointment',
        bullets: [
          { tokens: ['Confirm the recommended procedure and provider. ', ref('tool', 'get_services_and_specialists')] },
          { tokens: ['Get the preferred date, then ', ref('tool', 'get_available_slots'), '; offer 2–3 slots and confirm.'] },
          { tokens: ['Book ', ref('tool', 'create_appointment'), ' with ', ref('context', 'contact_dob'), ' (and dependent DOB for a child).'] },
        ],
      },
      {
        title: 'Close',
        bullets: [
          { tokens: ['Confirm what was done; offer a text confirmation. ', ref('tool', 'send_text_confirmation')] },
          { tokens: ['"Anything else I can help with today?" If no → CSAT "On a scale of 1 to 5…"'] },
          { tokens: ['"Thank you so much — have a great day."'] },
        ],
      },
    ],
    tools: ['lookup_patient', 'get_treatment_plan', 'get_services_and_specialists', 'get_available_slots', 'create_appointment', 'send_text_confirmation', 'update_state', 'opt_out_processor'],
    context: DENTAL_TP_CONTEXT,
  },
)

export const HC_PROCEDURES = sortProceduresByOrder(HC_PROCEDURES_UNSORTED, HC_PROCEDURE_ORDER)

export const HC_ALL_CATEGORIES: ProcedureCategory[] = ['Healthcare Frontdesk']
