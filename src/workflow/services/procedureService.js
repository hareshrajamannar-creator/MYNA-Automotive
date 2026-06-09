// Automotive procedure library — 34 procedures across 6 categories.
// IDs match the display names used in the LHS drawer dropdowns so drag-and-drop
// correctly seeds procedureIds without a separate name→id mapping step.

/** Sentinel ID for workflow-only custom procedures (not yet in the library). */
export const CUSTOM_PROCEDURE_ID = '__custom__';

export function isCustomProcedureId(id) {
  return id === CUSTOM_PROCEDURE_ID || id === 'Custom';
}

// ── Live procedure registry ───────────────────────────────────────────────
// AgentBuilder calls setLiveProcedures() on mount so that procedures created
// or edited in the Procedure Library are immediately visible on the canvas.
// Keyed by BOTH id and name so drag-and-drop (which uses name as the key) and
// node-detail lookups (which may use id) both hit the same entry.
let _liveRegistry = {};

export function setLiveProcedures(procedures) {
  _liveRegistry = {};
  if (!Array.isArray(procedures)) return;
  procedures.forEach((p) => {
    if (p.id)   _liveRegistry[p.id]   = p;
    if (p.name) _liveRegistry[p.name] = p;
  });
}

// Convert procedureData.ts context items to the workflow chip format.
function liveContextToChips(context) {
  if (!Array.isArray(context)) return [];
  const kindMap = { context: 'variable', file: 'attachment', link: 'link' };
  return context.map((c) => ({ value: c.label, type: kindMap[c.kind] || 'variable' }));
}

// Serialize rich ProcedureStep[] (with Bullet/Token structure) to a flat
// numbered-step string so the RHS detail panel can display it.
function richStepsToText(steps) {
  return steps.map((s, i) => {
    if (!s || typeof s !== 'object' || !s.title) return `${i + 1}.${s}`;
    const title = `${i + 1}.${s.title}`;
    if (!s.bullets || s.bullets.length === 0) return title;
    const bullets = s.bullets
      .map((b) => {
        const text = (b.tokens || [])
          .map((t) => (typeof t === 'string' ? t : `{{${t.label}}}`))
          .join('');
        return `• ${text.trim()}`;
      })
      .filter(Boolean)
      .join('\n');
    return bullets ? `${title}\n${bullets}` : title;
  }).join('\n');
}

export const PROCEDURES = [
  // ── Inbound General ──────────────────────────────────────────────────────
  { id: 'Greeting & Intent Detection', name: 'Greeting & Intent Detection', category: 'Inbound General', whenToUse: 'Every inbound call/chat/text session begins.', tools: ['Intent classifier', 'Knowledge base'], steps: ['Answer with dealership-branded greeting including agent name', 'Ask how the caller can be helped today', 'Use intent classifier to detect department and purpose', 'Confirm detected intent with caller', 'Route to appropriate procedure based on intent'], escalation: 'If intent cannot be determined after 2 attempts, transfer to human.' },
  { id: 'Department Transfer', name: 'Department Transfer', category: 'Inbound General', whenToUse: 'Caller requests specific department or intent maps to another department.', tools: ['Check business hours', 'CRM update', 'Trigger escalation'], steps: ['Confirm the department the caller wants to reach', 'Check business hours for the target department', 'If open, perform warm transfer with context summary', 'If closed, offer voicemail or callback scheduling', 'Log transfer in CRM with reason code'], escalation: 'If transfer fails 2x, offer direct callback from department.' },
  { id: 'General Inquiry', name: 'General Inquiry', category: 'Inbound General', whenToUse: 'Caller has a question not matching a specific procedure.', tools: ['Knowledge base', 'CRM update'], steps: ['Listen to the full question before responding', 'Search knowledge base for matching answer', 'Provide concise answer with source attribution', 'Ask if the caller has additional questions', 'Log inquiry topic in CRM for analytics'], escalation: 'If no knowledge base match found, transfer to human agent.' },
  { id: 'Handle Unclear Message', name: 'Handle Unclear Message', category: 'Inbound General', whenToUse: 'STT confidence is low or caller intent is ambiguous.', tools: ['ElevenLabs STT', 'Intent classifier', 'Trigger escalation'], steps: ['Apologize and ask the caller to rephrase', 'Offer 2-3 common intent options as suggestions', 'If still unclear, attempt one more rephrasing request', 'If unresolved, transfer to human agent'], escalation: 'After 2 failed clarification attempts, immediate human transfer.' },
  { id: 'Emergency / Urgent Handling', name: 'Emergency / Urgent Handling', category: 'Inbound General', whenToUse: 'Caller reports safety issue, vehicle breakdown, or emergency.', tools: ['Trigger escalation', 'CRM update'], steps: ['Acknowledge urgency immediately', 'If life-threatening, instruct caller to dial 911', 'For roadside emergencies, provide roadside assistance number', 'For urgent service needs, attempt immediate live transfer to service', 'Log emergency contact in CRM with priority flag'], escalation: 'Immediate human transfer for all emergency calls.' },
  { id: 'Talk to Human', name: 'Talk to Human', category: 'Inbound General', whenToUse: 'Caller explicitly requests a human agent.', tools: ['Trigger escalation', 'CRM update', 'Check business hours'], steps: ['Acknowledge the request without resistance', 'Ask if there is a specific person or department they need', 'Attempt warm transfer with conversation context', 'If no one available, offer callback with estimated wait time', 'Log request and outcome in CRM'], escalation: 'Always transfer; never deny a human transfer request.' },
  { id: 'Spanish Language Handling', name: 'Spanish Language Handling', category: 'Inbound General', whenToUse: 'Caller speaks Spanish or requests Spanish assistance.', tools: ['ElevenLabs STT', 'Voice identity', 'Intent classifier'], steps: ['Detect Spanish language via STT language detection', 'Switch agent language to Spanish', 'Continue with standard procedures in Spanish', 'If Spanish agent unavailable, offer callback from bilingual staff'], escalation: 'If no Spanish capability available, transfer to bilingual human.' },

  // ── Service ───────────────────────────────────────────────────────────────
  { id: 'Schedule Service Appointment', name: 'Schedule Service Appointment', category: 'Service', whenToUse: 'Caller wants to book a service appointment.', tools: ['DMS integration', 'Schedule appointment', 'VIN decode', 'Send confirmation', 'CRM update'], steps: ['Collect vehicle year, make, model, and mileage', 'Ask for the type of service needed', 'Look up VIN if available for service history context', 'Check available appointment slots in DMS', 'Confirm date, time, and service advisor', 'Send confirmation via SMS/email', 'Create appointment record in DMS'], escalation: 'If no slots available within 48 hours, transfer to service advisor.' },
  { id: 'Repair / Diagnostic Triage', name: 'Repair / Diagnostic Triage', category: 'Service', whenToUse: 'Caller describes a vehicle problem or warning light.', tools: ['Knowledge base', 'DMS integration', 'Schedule appointment', 'VIN decode'], steps: ['Collect symptom description and vehicle information', 'Ask clarifying questions about onset, frequency, severity', 'Check knowledge base for common diagnostic guidance', 'Assess urgency level (safe to drive vs. immediate attention)', 'If urgent, attempt same-day appointment booking', 'If not urgent, schedule next available appointment', 'Provide interim safety guidance'], escalation: 'If symptoms suggest safety risk, immediately transfer to service manager.' },
  { id: 'Recall Inquiry', name: 'Recall Inquiry', category: 'Service', whenToUse: 'Caller asks about recalls on their vehicle.', tools: ['VIN decode', 'NHTSA recall lookup', 'DMS integration', 'Schedule appointment', 'Send confirmation'], steps: ['Collect VIN or year/make/model', 'Query NHTSA recall database for open recalls', 'Report recall status and description to caller', 'If open recall exists, offer to schedule recall service', 'Confirm parts availability for recall repair', 'Book appointment and send confirmation'], escalation: 'If recall parts unavailable, transfer to service advisor for special order.' },
  { id: 'Service Status Check', name: 'Service Status Check', category: 'Service', whenToUse: 'Caller inquires about an in-progress repair.', tools: ['DMS integration', 'Voice identity', 'Send confirmation'], steps: ['Verify caller identity and vehicle', 'Look up active repair order in DMS', 'Provide current status and estimated completion time', 'If additional work was found, relay the details and cost', 'Offer to send status update via text'], escalation: 'If status unclear or additional authorization needed, transfer to service advisor.' },
  { id: 'Reschedule / Cancel Appointment', name: 'Reschedule / Cancel Appointment', category: 'Service', whenToUse: 'Caller wants to change or cancel an existing appointment.', tools: ['DMS integration', 'Schedule appointment', 'Send confirmation', 'CRM update'], steps: ['Verify caller identity and locate appointment', 'Confirm which appointment to modify', 'For reschedule: offer next available slots', 'For cancellation: confirm cancellation and reason', 'Update DMS record and send confirmation', 'If within 24 hours, note for no-show analytics exclusion'], escalation: 'If appointment is for recall or safety issue, attempt to retain before canceling.' },
  { id: 'Warranty Inquiry', name: 'Warranty Inquiry', category: 'Service', whenToUse: 'Caller asks about warranty coverage.', tools: ['VIN decode', 'DMS integration', 'Knowledge base'], steps: ['Collect VIN and current mileage', 'Look up warranty status via DMS/OEM integration', 'Explain coverage periods and what is/is not covered', 'If service is needed, offer to schedule under warranty', 'Provide disclaimer that final coverage determination is by service advisor'], escalation: 'If warranty dispute or denial, transfer to service manager.' },

  // ── Sales ─────────────────────────────────────────────────────────────────
  { id: 'New Vehicle Inquiry', name: 'New Vehicle Inquiry', category: 'Sales', whenToUse: 'Caller interested in purchasing a new vehicle.', tools: ['Inventory search', 'CRM update', 'Lead routing', 'Schedule appointment'], steps: ['Ask about desired vehicle type, features, and budget', 'Search real-time inventory for matching vehicles', 'Present top 2-3 matching options with key specs and pricing', 'Offer to schedule a test drive', 'Capture lead information in CRM', 'Route to appropriate sales consultant'], escalation: 'If caller requests specific pricing negotiation, transfer to sales manager.' },
  { id: 'Used / CPO Vehicle Inquiry', name: 'Used / CPO Vehicle Inquiry', category: 'Sales', whenToUse: 'Caller interested in pre-owned or certified vehicles.', tools: ['Inventory search', 'VIN decode', 'CRM update', 'Lead routing'], steps: ['Ask about preferences: make, model, year range, budget, features', 'Search used/CPO inventory for matches', 'Highlight CPO certification benefits if applicable', 'Share vehicle history summary (accident-free, service records)', 'Offer to schedule viewing or test drive', 'Capture lead and assign to used car sales'], escalation: 'If caller wants to negotiate price, transfer to used car manager.' },
  { id: 'Trade-In Valuation', name: 'Trade-In Valuation', category: 'Sales', whenToUse: 'Caller wants to know trade-in value of their current vehicle.', tools: ['Knowledge base', 'CRM update', 'Schedule appointment'], steps: ['Collect vehicle year, make, model, trim, mileage', 'Ask about vehicle condition (excellent/good/fair/poor)', 'Provide estimated range based on market data', 'Add disclaimer that final value requires in-person inspection', 'Offer to schedule in-person appraisal'], escalation: 'Never quote a firm trade-in value; always present as estimate range.' },
  { id: 'Finance Pre-Qualification', name: 'Finance Pre-Qualification', category: 'Sales', whenToUse: 'Caller asks about financing options or payment estimates.', tools: ['Knowledge base', 'CRM update', 'Lead routing', 'Schedule appointment'], steps: ['Explain general financing options available', 'Provide typical rate ranges without committing to specific rates', 'Explain that pre-qualification requires F&I department review', 'Offer to schedule appointment with finance manager', 'Capture lead with finance interest flag'], escalation: 'Never provide specific rate quotes; transfer to F&I for detailed discussion.' },
  { id: 'Test Drive Scheduling', name: 'Test Drive Scheduling', category: 'Sales', whenToUse: 'Caller wants to schedule a test drive.', tools: ['Inventory search', 'Schedule appointment', 'Send confirmation', 'CRM update', 'Lead routing'], steps: ['Confirm the vehicle(s) of interest', 'Verify vehicle availability on lot', 'Collect caller name, phone, and preferred date/time', 'Check sales consultant availability', 'Book test drive and send confirmation', 'Create/update lead in CRM'], escalation: 'If requested vehicle not in stock, offer similar alternatives or incoming inventory.' },
  { id: 'Internet Lead Qualification', name: 'Internet Lead Qualification', category: 'Sales', whenToUse: 'Following up on an online form submission or website inquiry.', tools: ['CRM update', 'Inventory search', 'Lead routing', 'Schedule appointment', 'Send confirmation'], steps: ['Reference the specific vehicle or inquiry from the lead source', 'Confirm continued interest and timeline', 'Ask qualifying questions: budget, trade-in, financing needs', 'Present relevant inventory matches', 'Offer immediate test drive or appointment', 'Update lead status in CRM with qualification notes'], escalation: 'If lead is hot (ready to buy today), immediate transfer to available sales consultant.' },

  // ── Parts ─────────────────────────────────────────────────────────────────
  { id: 'Parts Availability & Pricing', name: 'Parts Availability & Pricing', category: 'Parts', whenToUse: 'Caller inquires about parts availability or pricing.', tools: ['DMS integration', 'VIN decode', 'Knowledge base'], steps: ['Collect part description or part number', 'If VIN available, decode for exact fitment', 'Search parts inventory in DMS', 'Provide availability status and price range', 'Offer to place order if not in stock', 'Transfer to parts counter for complex orders'], escalation: 'For complex or special-order parts, transfer to parts department.' },

  // ── After-Hours ───────────────────────────────────────────────────────────
  { id: 'After-Hours Lead Capture', name: 'After-Hours Lead Capture', category: 'After-Hours', whenToUse: 'Sales inquiry received outside business hours.', tools: ['Check business hours', 'CRM update', 'Send confirmation', 'Lead routing'], steps: ['Inform caller of current business hours', 'Capture name, phone, email, and vehicle interest', 'Assure callback first thing next business day', 'Send confirmation text with business hours', 'Create priority lead in CRM for morning follow-up'], escalation: 'N/A — all after-hours leads queued for next-day follow-up.' },
  { id: 'After-Hours Service Request', name: 'After-Hours Service Request', category: 'After-Hours', whenToUse: 'Service inquiry received outside business hours.', tools: ['Check business hours', 'CRM update', 'Send confirmation'], steps: ['Inform caller of service department hours', 'Assess urgency of the service need', 'For emergencies, provide roadside assistance number', 'For non-urgent, capture details and schedule callback', 'Send confirmation text with next available service hours'], escalation: 'For true emergencies, provide emergency contact number if configured.' },

  // ── Outbound ──────────────────────────────────────────────────────────────
  { id: 'Lead Follow-Up Call', name: 'Lead Follow-Up Call', category: 'Outbound', whenToUse: 'Internet lead received — outbound call initiated within 5 minutes.', tools: ['CRM update', 'Inventory search', 'Schedule appointment', 'Send confirmation', 'Lead routing'], steps: ['Introduce self and reference the specific inquiry', 'Confirm interest and ask qualifying questions', 'Present matching inventory options', 'Offer to schedule test drive or appointment', 'If no answer, leave voicemail and send follow-up SMS', 'Update lead status in CRM'], escalation: 'If lead requests manager or has buying objection beyond script.' },
  { id: 'Missed Call Callback', name: 'Missed Call Callback', category: 'Outbound', whenToUse: 'Inbound call was missed — callback initiated within 15 minutes.', tools: ['CRM update', 'Intent classifier', 'Send confirmation'], steps: ['Apologize for missed call and ask how to help', 'Follow standard intent detection procedure', 'Route to appropriate department procedure', 'If no answer, send SMS with callback options'], escalation: 'Standard escalation per detected intent.' },
  { id: 'Appointment Confirmation', name: 'Appointment Confirmation', category: 'Outbound', whenToUse: 'Appointment is scheduled — confirmation journey begins.', tools: ['DMS integration', 'Send confirmation', 'Schedule appointment'], steps: ['Send immediate SMS confirmation with appointment details', '24 hours before: send SMS reminder with confirm/reschedule options', '2 hours before: place voice call for final confirmation', 'Process response: confirmed, rescheduled, or cancelled', 'Update appointment status in DMS'], escalation: 'If customer requests reschedule, attempt automated rebooking.' },
  { id: 'No-Show Re-Engagement', name: 'No-Show Re-Engagement', category: 'Outbound', whenToUse: 'Customer missed scheduled appointment without canceling.', tools: ['DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment'], steps: ['Wait 2 hours after missed appointment time', 'Send empathetic SMS acknowledging missed appointment', 'Offer easy one-click rescheduling link', 'If no response in 24 hours, follow up with voice call', 'Update CRM with no-show status and re-engagement outcome'], escalation: 'After 3 failed re-engagement attempts, flag for manual outreach.' },
  { id: 'Lease Maturity Outreach', name: 'Lease Maturity Outreach', category: 'Outbound', whenToUse: 'Customer lease matures within 90 days.', tools: ['CRM update', 'DMS integration', 'Inventory search', 'Lead routing', 'Send confirmation', 'Schedule appointment'], steps: ['Send initial SMS introducing lease-end options', 'Present three paths: lease new, purchase current, return', 'Offer to schedule consultation with sales consultant', 'Follow up at 60, 30, and 14 days if no response', 'Route engaged leads to sales team with lease details'], escalation: 'If customer has questions about payoff or fees, transfer to F&I.' },
  { id: 'Equity Mining Outreach', name: 'Equity Mining Outreach', category: 'Outbound', whenToUse: 'Vehicle equity analysis identifies upgrade opportunity.', tools: ['CRM update', 'DMS integration', 'Inventory search', 'Lead routing', 'Send confirmation'], steps: ['Send personalized SMS highlighting potential savings', 'Reference specific upgrade paths based on current vehicle', 'Offer no-obligation appraisal appointment', 'If interested, schedule with sales consultant'], escalation: 'If customer questions equity calculation, transfer to sales manager.' },
  { id: 'Service Lapse Re-Engagement', name: 'Service Lapse Re-Engagement', category: 'Outbound', whenToUse: 'Customer has not visited for service in 6+ months.', tools: ['DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment', 'Knowledge base'], steps: ['Send friendly SMS noting time since last visit', 'Highlight recommended maintenance based on mileage estimate', 'Offer convenient scheduling link', 'Include any current service specials or coupons'], escalation: 'N/A — informational outreach only.' },
  { id: 'CSI Follow-Up', name: 'CSI Follow-Up', category: 'Outbound', whenToUse: 'Customer completed service or purchase within last 48 hours.', tools: ['CRM update', 'Send confirmation', 'Tone analysis'], steps: ['Send satisfaction survey via SMS', 'If negative response detected, alert service/sales manager immediately', 'If positive, thank customer and request online review', 'Log survey response in CRM'], escalation: 'Negative CSI score triggers immediate manager notification.' },
  { id: 'NHTSA Recall Notification', name: 'NHTSA Recall Notification', category: 'Outbound', whenToUse: 'New recall issued affecting vehicles in customer database.', tools: ['NHTSA recall lookup', 'VIN decode', 'DMS integration', 'CRM update', 'Send confirmation', 'Schedule appointment'], steps: ['Identify affected vehicles in CRM/DMS via VIN matching', 'Send SMS notification about the recall with details', 'Explain safety implications and recommended action', 'Offer to schedule recall service appointment', 'Follow up if no response within 7 days'], escalation: 'If customer expresses safety concern, immediate transfer to service.' },
  { id: 'Orphan Customer Introduction', name: 'Orphan Customer Introduction', category: 'Outbound', whenToUse: "Customer's assigned salesperson has left the dealership.", tools: ['CRM update', 'Send confirmation', 'Lead routing'], steps: ['Send introductory SMS from new assigned representative', 'Reference purchase history and relationship context', 'Offer assistance with any current vehicle needs', 'Invite for complimentary vehicle health check'], escalation: 'N/A — relationship-building outreach only.' },
  { id: 'Welcome / Onboarding', name: 'Welcome / Onboarding', category: 'Outbound', whenToUse: 'New vehicle purchase or lease completed within 7 days.', tools: ['CRM update', 'Send confirmation', 'Knowledge base'], steps: ['Send welcome SMS with key contacts and service info', 'Provide link to schedule first complimentary service', 'Share tips for vehicle technology and features', 'Introduce loyalty program if applicable'], escalation: 'N/A — informational outreach only.' },
  { id: 'Unsold Showroom Follow-Up', name: 'Unsold Showroom Follow-Up', category: 'Outbound', whenToUse: 'Customer visited showroom but did not purchase.', tools: ['CRM update', 'Inventory search', 'Send confirmation', 'Lead routing'], steps: ['Send thank-you SMS within 2 hours of visit', 'Reference specific vehicles they viewed', 'Address any stated objections from visit notes', 'Offer additional inventory options or incentives', 'Schedule follow-up call for next day'], escalation: 'If customer indicates competitor offer, alert sales manager.' },

  // ── Healthcare Frontdesk ─────────────────────────────────────────────────────
  {
    id: 'Handle general inquiry',
    name: 'Handle general inquiry',
    category: 'Healthcare Frontdesk',
    whenToUse: 'Patient asks a general or informational question — hours, location, parking, insurance accepted, services offered, directions, telehealth availability, wait times.',
    tools: ['knowledge_base', 'birdeye_task_creator'],
    steps: [
      'Query knowledge_base with the patient\'s question.',
      'If no confident match: "That\'s a great question — let me have someone from our team get back to you. What\'s the best way to reach you?" Capture callback details via birdeye_task_creator. Skip to step 3.',
      'Answer in 1–2 sentences. Plain language. Never invent provider, insurance, or clinical details.',
      '"Is there anything else I can help with?" (agent_turn). Wait for the patient\'s next message.',
      'If patient indicates they\'re done → invoke Close_session.',
    ],
    escalation: 'If no knowledge base match, capture callback and queue for staff follow-up.',
  },
  {
    id: 'Talk to human',
    name: 'Talk to human',
    category: 'Healthcare Frontdesk',
    whenToUse: 'Patient explicitly asks to speak with a person, real agent, receptionist, or human — or expresses frustration with the AI.',
    tools: ['escalate_to_staff'],
    steps: [
      '"Of course — let me connect you with one of our team members. I\'ll pass along a quick note so you won\'t have to repeat yourself." Do not try to solve the issue first. Do not ask why.',
      'Invoke Escalate_to_staff with reason=human_requested.',
    ],
    escalation: 'Always honour human transfer requests immediately — no retention attempts.',
  },
  {
    id: 'Handle emergency or urgent concern',
    name: 'Handle emergency or urgent concern',
    category: 'Healthcare Frontdesk',
    whenToUse: "Patient describes worsening symptoms, medication reaction, post-visit concern they feel can't wait, anxiety about results, or any time-sensitive medical issue (but not life-threatening).",
    tools: ['appointment_management_agent', 'escalate_to_staff'],
    steps: [
      'State clearly: "If this is life-threatening — difficulty breathing, chest pain, loss of consciousness — please hang up and call 911 right now." Wait briefly. If patient confirms life-threatening → end conversation with 911 instruction.',
      '"I hear you — that sounds really uncomfortable. Let\'s get you taken care of." Ask one question only: is this a reaction, a worsening symptom, or a new concern? (agent_turn). Do not assess, diagnose, or advise.',
      'If same-day appointment is appropriate → invoke Appointment_Management_agent with visit_type=urgent.',
      'If immediate clinical eyes needed → invoke Escalate_to_staff with queue=nurse_line, priority=high.',
      'Always confirm next step explicitly: "I\'m connecting you to our nurse line now" or "You\'re booked at 2pm — please come straight in."',
      'Invoke Close_session.',
    ],
    escalation: 'Immediate escalation to nurse line for any clinical urgency. Life-threatening → 911.',
  },
  {
    id: 'Handle unclear message',
    name: 'Handle unclear message',
    category: 'Healthcare Frontdesk',
    whenToUse: "Patient's message is too vague, ambiguous, or out-of-scope to match any other procedure's trigger with confidence.",
    tools: ['escalate_to_staff'],
    steps: [
      '"I want to make sure I help you with the right thing — could you tell me a little more about what you\'re looking for?" (agent_turn). Wait for response. Other procedures may now fire if the new message matches their trigger.',
      'If still unclear: "Are you calling about an appointment, a question about your care, or something else?" (agent_turn). Wait for response. Match against procedure triggers.',
      'Never say "I don\'t understand." Instead: "Let me get someone from our team who can help you directly." Invoke Escalate_to_staff with reason=message_unclear_after_2_attempts.',
    ],
    escalation: 'After 2 failed clarification attempts, escalate to staff immediately.',
  },
];

/** Frontdesk RHS Procedures pane — canonical panel copy (Figma reference) */
export const FRONTDESK_PROCEDURE_PANEL = {
  'Talk to Human': {
    name: 'Talk to human',
    whenToUse: 'Patient explicitly asks to speak with a person, real agent, receptionist, or human — or expresses frustration with the AI.',
  },
  'General Inquiry': {
    name: 'Handle general inquiry',
    whenToUse: 'Patient asks a general or informational question — hours, location, parking, insurance accepted.',
  },
  'Handle Unclear Message': {
    name: 'Handle unclear message',
    whenToUse: "Patient's message is too vague, or out-of-scope",
  },
  'Emergency / Urgent Handling': {
    name: 'Handle emergency or urgent concern',
    whenToUse: "Patient describes worsening symptoms, medication reaction, post-visit concern they feel can't wait.",
  },
};

/** RHS Procedures pane — default panel copy */
export const PROCEDURE_PANEL_DISPLAY = { ...FRONTDESK_PROCEDURE_PANEL };

/** RHS Procedures pane — healthcare / dental panel copy (IDs = display names, no overrides needed) */
export const PROCEDURE_PANEL_DISPLAY_HC = {
  'Handle general inquiry':             { name: 'Handle general inquiry',             whenToUse: 'Patient asks a general or informational question.' },
  'Handle emergency or urgent concern': { name: 'Handle emergency or urgent concern', whenToUse: "Patient describes worsening symptoms or a time-sensitive medical issue." },
  'Handle unclear message':             { name: 'Handle unclear message',             whenToUse: "Patient's message is too vague or out-of-scope." },
  'Talk to human':                      { name: 'Talk to human',                      whenToUse: 'Patient explicitly asks to speak with a person or expresses frustration.' },
};

/** Default procedure IDs for Frontdesk agent procedures node */
export const FRONTDESK_PROCEDURE_IDS = [
  'Talk to Human',
  'General Inquiry',
  'Handle Unclear Message',
  'Emergency / Urgent Handling',
];

export function getProcedurePanelDefaults(product) {
  return product === 'healthcare' || product === 'dental'
    ? PROCEDURE_PANEL_DISPLAY_HC
    : PROCEDURE_PANEL_DISPLAY;
}

export function resolveProcedurePanelText(procedure, overrides = {}, product) {
  const defaults = getProcedurePanelDefaults(product);
  const id = procedure.id;
  return {
    name: overrides[id]?.name || defaults[id]?.name || (isCustomProcedureId(id) ? 'Custom' : procedure.name),
    whenToUse: overrides[id]?.whenToUse || defaults[id]?.whenToUse || procedure.whenToUse || procedure.description || '',
  };
}

export function getProcedureById(id) {
  if (_liveRegistry[id]) return _liveRegistry[id];
  return PROCEDURES.find((p) => p.id === id) || null;
}

export function getProceduresByIds(ids = []) {
  return ids.map((id) => getProcedureById(id)).filter(Boolean);
}

/** Shared context chips shown in the RHS procedure detail panel */
const DETAIL_CONTEXT_CHIPS = [
  { value: 'Provider_first_name', type: 'variable' },
  { value: 'Business_ID', type: 'variable' },
  { value: 'Products_list.PDF', type: 'attachment' },
  { value: 'www.aspendental.com', type: 'link' },
];

/** Full RHS detail content keyed by workflow procedure ID */
export const PROCEDURE_DETAIL_CONTENT = {
  'Greeting & Intent Detection': {
    whenToUse: 'Incoming call, web chat, or SMS arrives — no prior session context',
    contextChips: DETAIL_CONTEXT_CHIPS,
    moreContextCount: 25,
    stepsText: [
      '1. Deliver greeting',
      '• Voice: "Thank you for calling {location_name}. My name is Sarah, I\'m your virtual front desk assistant. How can I help you today?"',
      '• Chat/SMS: "Hi! I\'m Sarah, your virtual assistant at {location_name}. How can I help you today?"',
      '• If first outbound SMS to this patient, append TCPA opt-out footer.',
      '2. Wait for patient response',
      '• Hand turn to patient {{agent_turn}}',
      '• The agent\'s other procedures (or sub-agents) will fire based on what the patient says — their triggers cover scheduling, FAQ, urgency, prescriptions, and human requests.',
    ].join('\n'),
  },
  'Talk to Human': {
    whenToUse: 'Patient explicitly asks to speak with a person, real agent, receptionist, or human — or expresses frustration with the AI.',
    contextChips: DETAIL_CONTEXT_CHIPS,
    moreContextCount: 25,
    stepsText: [
      '1. Acknowledge the request',
      '• "Absolutely — I\'ll connect you with a member of our team right away."',
      '• Do not argue or try to retain the caller in the AI flow.',
      '2. Gather context for handoff',
      '• Ask if there is a specific person or department they need {{agent_turn}}',
      '• Summarize the conversation so far for the receiving agent',
      '3. Transfer or callback',
      '• If staff available → warm transfer with context',
      '• If unavailable → offer callback with estimated wait time',
    ].join('\n'),
  },
  'General Inquiry': {
    whenToUse: 'Patient asks a general or informational question — hours, location, parking, insurance accepted.',
    contextChips: DETAIL_CONTEXT_CHIPS,
    moreContextCount: 25,
    stepsText: [
      '1. Listen to the full question',
      '• Let the patient finish before responding {{agent_turn}}',
      '• Do not interrupt or assume intent',
      '2. Search and answer',
      '• Search the knowledge base for a matching answer',
      '• Provide a concise answer with source attribution when available',
      '3. Confirm and close the loop',
      '• Ask if the patient has additional questions',
      '• If unresolved, route to {{Talk to Human}} or the appropriate procedure',
    ].join('\n'),
  },
  'Handle Unclear Message': {
    whenToUse: "Patient's message is too vague, or out-of-scope",
    contextChips: DETAIL_CONTEXT_CHIPS,
    moreContextCount: 25,
    stepsText: [
      '1. Clarify politely',
      '• Apologize and ask the patient to rephrase {{agent_turn}}',
      '• Offer 2–3 common intent options as suggestions',
      '2. Retry once',
      '• If still unclear, attempt one more rephrasing request',
      '• Keep responses short and option-based',
      '3. Escalate if needed',
      '• If unresolved after 2 attempts, transfer to a human agent',
      '• Log the interaction for quality review',
    ].join('\n'),
  },
  'Emergency / Urgent Handling': {
    whenToUse: "Patient describes worsening symptoms, medication reaction, post-visit concern they feel can't wait.",
    contextChips: DETAIL_CONTEXT_CHIPS,
    moreContextCount: 25,
    stepsText: [
      '1. Safety check first',
      '• State clearly: "If this is life-threatening — please hang up and call 911 right now."',
      '• Wait briefly for a response. If life-threatening → end with the 911 instruction {{End conversation}}',
      '2. Acknowledge and triage',
      '• "I hear you — that sounds really stressful. Let\'s get you taken care of."',
      '• One question only: is this a new concern, a worsening symptom, or a medication reaction {{agent_turn}}',
      '• Do not assess, diagnose, or advise.',
      '3. Route to care',
      '• If same-day appointment is appropriate, invoke {{Appointment_Management_agent}} {{visit_type=urgent}}',
      '• If immediate attention is needed → invoke {{Escalate_to_staff}}',
      '• Always confirm the next step explicitly.',
      '4. Close',
      '• Invoke {{Close_session}}',
    ].join('\n'),
  },
};

function isRichProcedureSteps(steps) {
  return (
    Array.isArray(steps)
    && steps.length > 0
    && steps[0]
    && typeof steps[0] === 'object'
    && steps[0].title
  );
}

function formatProcedureSteps(steps) {
  if (!Array.isArray(steps)) return typeof steps === 'string' ? steps : '';
  // Rich ProcedureStep[] from procedureData.ts has objects with .title + .bullets
  if (isRichProcedureSteps(steps)) {
    return richStepsToText(steps);
  }
  return steps.map((s, i) => `${i + 1}.${s}`).join('\n');
}

/** Healthcare workflow IDs → canonical PROCEDURE_DETAIL_CONTENT keys */
const PROCEDURE_DETAIL_ID_ALIASES = {
  'Handle general inquiry': 'General Inquiry',
  'Handle emergency or urgent concern': 'Emergency / Urgent Handling',
  'Handle unclear message': 'Handle Unclear Message',
  'Talk to human': 'Talk to Human',
};

/** Merge library defaults, panel display names, and saved field overrides for RHS detail */
export function getProcedureDetailContent(id, fieldOverrides = {}, product) {
  const proc = getProcedureById(id);
  const panel = proc
    ? resolveProcedurePanelText(proc, {}, product)
    : { name: isCustomProcedureId(id) ? 'Custom' : id, whenToUse: '' };
  const detailKey = PROCEDURE_DETAIL_ID_ALIASES[id] ?? id;
  const detail = PROCEDURE_DETAIL_CONTENT[detailKey] || {};

  // For HC/dental products, prefer live procedure library data over hardcoded
  // PROCEDURE_DETAIL_CONTENT — the library has richer steps and correct context.
  // For automotive, the hardcoded detail still provides the best content.
  const isHC = product === 'healthcare' || product === 'dental';
  // Only prefer live library steps when they use the rich title + bullets model.
  // Flat string[] steps fall through to PROCEDURE_DETAIL_CONTENT bulleted copy.
  const liveSteps = isHC && isRichProcedureSteps(proc?.steps)
    ? (formatProcedureSteps(proc.steps) || null)
    : null;
  const liveContext = isHC && proc?.context?.length ? liveContextToChips(proc.context) : null;

  return {
    id,
    name: fieldOverrides.name || panel.name,
    whenToUse: fieldOverrides.whenToUse ?? detail.whenToUse ?? panel.whenToUse ?? proc?.whenToUse ?? '',
    contextChips: fieldOverrides.contextChips ?? liveContext ?? detail.contextChips ?? liveContextToChips(proc?.context),
    moreContextCount: liveContext ? 0 : (detail.moreContextCount ?? 0),
    stepsText: fieldOverrides.stepsText ?? liveSteps ?? detail.stepsText ?? formatProcedureSteps(proc?.steps),
    addToLibrary: fieldOverrides.addToLibrary ?? false,
  };
}
