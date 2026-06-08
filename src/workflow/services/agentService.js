/**
 * agentService — in-memory mock for Content Hub prototype.
 * No Firebase / Firestore. All operations work on an in-memory store
 * so the agent builder canvas is fully interactive without a backend.
 */

/* ─── In-memory store ─── */
const _agents = new Map();

const _SEED_TOOLS = [
  // ── Automotive dealership tools ─────────────────────────────────────────
  {
    id: 'dms-integration',
    name: 'DMS Integration',
    icon: 'storage',
    description: 'Reads and writes appointment records, repair orders, vehicle data, and customer history in the Dealer Management System.',
    category: 'Dealership Systems',
    inputs: [{ name: 'query', type: 'string', description: 'DMS query or record ID' }],
    outputs: [{ name: 'result', type: 'object', description: 'DMS record data' }],
  },
  {
    id: 'send-confirmation',
    name: 'Send Confirmation',
    icon: 'send',
    description: 'Sends appointment confirmations, reminders, and follow-up messages via SMS and email to the customer.',
    category: 'Communication',
    inputs: [{ name: 'channel', type: 'string', description: 'sms | email | both' }, { name: 'message', type: 'string', description: 'Message body' }],
    outputs: [{ name: 'status', type: 'string', description: 'sent | failed' }],
  },
  {
    id: 'schedule-appointment',
    name: 'Schedule Appointment',
    icon: 'calendar_today',
    description: 'Checks availability and books, reschedules, or cancels service and sales appointments in the DMS.',
    category: 'Dealership Systems',
    inputs: [{ name: 'date', type: 'string' }, { name: 'time', type: 'string' }, { name: 'type', type: 'string' }],
    outputs: [{ name: 'appointmentId', type: 'string' }, { name: 'confirmed', type: 'boolean' }],
  },
  {
    id: 'voice-call',
    name: 'Voice Call',
    icon: 'call',
    description: 'Places or receives voice calls via ElevenLabs voice AI. Handles call routing, voicemail detection, and call logging.',
    category: 'Communication',
    inputs: [{ name: 'phoneNumber', type: 'string' }, { name: 'script', type: 'string' }],
    outputs: [{ name: 'outcome', type: 'string', description: 'answered | voicemail | no-answer' }],
  },
  {
    id: 'initiate-voice-call',
    name: 'Initiate voice call',
    icon: 'call',
    description: 'Places an outbound voice call to the customer and routes the outcome to Call accepted, Call rejected, or Call missed.',
    category: 'Communication',
    fields: [
      {
        id: 'initiate-voice-call-phone',
        label: 'Phone number',
        type: 'variable',
        defaultValue: 'Contact.PhoneNumber',
      },
      {
        id: 'initiate-voice-call-from-number',
        label: 'Call from',
        type: 'select',
        placeholder: 'Select',
        showInfoIcon: true,
        options: [
          'Main dealership line',
          'Service department',
          'Sales department',
          'Parts department',
        ],
      },
      {
        id: 'initiate-voice-call-calling-window',
        label: 'Calling window',
        type: 'radio',
        defaultValue: 'Custom range',
        options: ['During business hours', 'Custom range'],
        showWhenValue: 'Custom range',
        conditionalLayout: 'row',
        conditionalFields: [
          {
            id: 'initiate-voice-call-from',
            label: 'From',
            type: 'select',
            placeholder: 'Select',
            defaultValue: '9:00 AM',
            options: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
          },
          {
            id: 'initiate-voice-call-to',
            label: 'To',
            type: 'select',
            placeholder: 'Select',
            defaultValue: '10:00 PM',
            options: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'],
          },
        ],
      },
      {
        id: 'initiate-voice-call-retry',
        label: 'Retry settings',
        type: 'checkbox',
        layout: 'row',
        helpText: 'Enable automatic retry if customer does not connect on the first attempt',
        options: ['No answer', 'Call rejected', 'Voice mail'],
        defaultValue: ['No answer', 'Voice mail'],
        conditionalFields: [
          {
            id: 'initiate-voice-call-max-attempts',
            label: 'Max attempts',
            type: 'select',
            defaultValue: '2',
            options: ['1', '2', '3', '4', '5'],
          },
          {
            id: 'initiate-voice-call-retry-interval',
            label: 'Interval between retries',
            type: 'selectRow',
            selects: [
              {
                defaultValue: '24',
                options: ['1', '2', '4', '6', '12', '24', '48'],
              },
              {
                defaultValue: 'Hours',
                options: ['Minutes', 'Hours', 'Days'],
              },
            ],
          },
          {
            id: 'initiate-voice-call-voicemail',
            label: 'Configure voice mail message',
            type: 'textarea',
            placeholder: 'Enter your message here',
            showVariableToolbar: true,
            rows: 5,
            showWhenIncludes: 'Voice mail',
          },
        ],
      },
    ],
    inputs: [{ name: 'phoneNumber', type: 'string' }],
    outputs: [{ name: 'outcome', type: 'string', description: 'accepted | rejected | missed' }],
  },
  {
    id: 'crm-update',
    name: 'CRM Update',
    icon: 'sync_alt',
    description: 'Creates and updates lead records, contact notes, tags, and journey status in the CRM system.',
    category: 'Dealership Systems',
    inputs: [{ name: 'recordId', type: 'string' }, { name: 'fields', type: 'object' }],
    outputs: [{ name: 'success', type: 'boolean' }],
  },
  {
    id: 'inventory-search',
    name: 'Inventory Search',
    icon: 'inventory_2',
    description: 'Searches real-time vehicle inventory for new, used, and CPO vehicles matching customer preferences.',
    category: 'Dealership Systems',
    inputs: [{ name: 'filters', type: 'object', description: 'make, model, year, price, mileage' }],
    outputs: [{ name: 'vehicles', type: 'array', description: 'Matching inventory items' }],
  },
  {
    id: 'lead-routing',
    name: 'Lead Routing',
    icon: 'route',
    description: 'Assigns and routes leads to the appropriate sales consultant based on availability, specialty, and round-robin rules.',
    category: 'Sales',
    inputs: [{ name: 'leadId', type: 'string' }, { name: 'department', type: 'string' }],
    outputs: [{ name: 'assignedTo', type: 'string' }],
  },
  {
    id: 'trigger-escalation',
    name: 'Trigger Escalation',
    icon: 'priority_high',
    description: 'Immediately transfers the conversation to a live human agent with full context and priority queue placement.',
    category: 'Escalation',
    inputs: [{ name: 'reason', type: 'string' }, { name: 'priority', type: 'string', description: 'normal | high | urgent' }],
    outputs: [{ name: 'transferredTo', type: 'string' }],
  },
  {
    id: 'intent-classifier',
    name: 'Intent Classifier',
    icon: 'psychology',
    description: 'Detects the caller\'s department intent and purpose using NLP — routes to service, sales, parts, or general.',
    category: 'AI',
    inputs: [{ name: 'transcript', type: 'string' }],
    outputs: [{ name: 'intent', type: 'string' }, { name: 'confidence', type: 'number' }],
  },
  {
    id: 'vin-decode',
    name: 'VIN Decode',
    icon: 'qr_code',
    description: 'Decodes a VIN to retrieve year, make, model, trim, and service history for the vehicle.',
    category: 'Dealership Systems',
    inputs: [{ name: 'vin', type: 'string' }],
    outputs: [{ name: 'vehicle', type: 'object' }],
  },
  {
    id: 'check-business-hours',
    name: 'Check Business Hours',
    icon: 'schedule',
    description: 'Looks up department-specific business hours to determine availability for transfers and scheduling.',
    category: 'Operations',
    inputs: [{ name: 'department', type: 'string' }],
    outputs: [{ name: 'isOpen', type: 'boolean' }, { name: 'nextOpen', type: 'string' }],
  },
  {
    id: 'nhtsa-recall-lookup',
    name: 'NHTSA Recall Lookup',
    icon: 'find_in_page',
    description: 'Queries the NHTSA database for open recalls by VIN or year/make/model.',
    category: 'Compliance',
    inputs: [{ name: 'vin', type: 'string' }],
    outputs: [{ name: 'recalls', type: 'array' }],
  },
];

const _customTools = new Map(_SEED_TOOLS.map(t => [t.id, t]));
const _agentListeners = new Set();
const _toolListeners = new Set();

function _notifyAgentListeners() {
  const list = Array.from(_agents.values());
  _agentListeners.forEach((cb) => cb(list));
}

function _notifyToolListeners() {
  const list = Array.from(_customTools.values());
  _toolListeners.forEach((cb) => cb(list));
}

/* ─── Agent operations ─── */

export function subscribeToAgents(callback) {
  _agentListeners.add(callback);
  callback(Array.from(_agents.values()));
  return () => _agentListeners.delete(callback);
}

export async function saveAgent(id, agent) {
  _agents.set(id, { ...agent, id });
  _notifyAgentListeners();
}

export async function deleteAgent(id) {
  _agents.delete(id);
  _notifyAgentListeners();
}

export async function getAgentBySlug(_moduleSlug, _agentSlug) {
  return null;
}

export function getCachedAgent(_agentSlug, _moduleSlug) {
  return null;
}

export async function prefetchAgent() {}

export async function getAgentsByModuleSlug(_moduleSlug) {
  return Array.from(_agents.values());
}

/* ─── Custom tool operations ─── */

export async function saveCustomTool(tool) {
  _customTools.set(tool.id, tool);
  _notifyToolListeners();
  return tool;
}

export async function deleteCustomTool(id) {
  _customTools.delete(id);
  _notifyToolListeners();
}

export function subscribeToCustomTools(callback) {
  _toolListeners.add(callback);
  callback(Array.from(_customTools.values()));
  return () => _toolListeners.delete(callback);
}

export async function getCustomTools() {
  return Array.from(_customTools.values());
}

function _formatInputLabel(name, explicitLabel) {
  if (explicitLabel) return explicitLabel;
  const spaced = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

// Transform agentService tool → CustomToolViewer field format
function _toolToViewerFields(tool) {
  if (tool.fields) return tool; // already in viewer format
  const fields = (tool.inputs || []).map((inp, i) => {
    const label = _formatInputLabel(inp.name, inp.label);
    const id = `${tool.id}-in-${i}`;

    // Boolean → toggle
    if (inp.type === 'boolean') {
      return { id, label, type: 'toggle', required: false };
    }

    // Enum (pipe-separated options in description or options array) → select
    const isEnum = (inp.description && inp.description.includes(' | ')) || Array.isArray(inp.options);
    if (isEnum || inp.type === 'enum') {
      const raw = Array.isArray(inp.options)
        ? inp.options
        : (inp.description || '').split(' | ').map((o) => o.trim()).filter(Boolean);
      return {
        id, label, type: 'select', required: false,
        options: raw.map((o) => ({ label: o, value: o })),
      };
    }

    // Object or array → variable chip (maps a workflow variable)
    if (inp.type === 'object' || inp.type === 'array') {
      return { id, label, type: 'variable', required: false, placeholder: inp.description || 'Map a workflow variable' };
    }

    // Number → number field
    if (inp.type === 'number') {
      return { id, label, type: 'number', required: false, placeholder: inp.description || '' };
    }

    // Default string → variable chip (most tool inputs map from workflow variables)
    return { id, label, type: 'variable', required: false, placeholder: inp.description || 'Map a workflow variable' };
  });
  return { ...tool, fields };
}

export async function getCustomToolsByIds(ids) {
  return (ids || []).map((id) => _customTools.get(id)).filter(Boolean).map(_toolToViewerFields);
}
