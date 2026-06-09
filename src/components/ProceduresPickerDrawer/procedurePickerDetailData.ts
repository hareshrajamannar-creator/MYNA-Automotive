import {
  HC_PROCEDURES,
  type ContextItem,
  type ProcedureStep,
} from '../../data/procedureData'
import { getProcedureDetailContent } from '../../workflow/services/procedureService.js'

export interface ProcedureDetailDraft {
  id: string
  name: string
  whenToUse: string
  contextChips: { value: string; type: string }[]
  moreContextCount: number
  stepsText: string
}

const CATALOG_DETAIL_KEY: Record<string, string> = {
  greet: 'Greeting & Intent Detection',
  general: 'Handle general inquiry',
  emergency: 'Handle emergency or urgent concern',
  unclear: 'Handle unclear message',
  'talk-human': 'Talk to human',
  'identify-patient': 'Identify patient',
  'new-patient': 'New patient intake',
  'book-appointment': 'Book new appointment',
}

/** Catalog id → healthcare library procedure name */
const CATALOG_PROCEDURE_NAME: Record<string, string> = {
  general: 'Handle general inquiry',
  emergency: 'Handle emergency or urgent concern',
  unclear: 'Handle unclear message',
  'talk-human': 'Talk to human',
  'book-appointment': 'Book new appointment',
}

const GREET_STEPS = [
  '1.Deliver greeting',
  '• Voice: "Thank you for calling {location_name}. My name is Sarah. I\'m your virtual front desk assistant. How can I help you today?"',
  '• Chat/SMS: "Hi! I\'m Sarah, your virtual assistant at {location_name}. How can I help you today?"',
  '• For the first outbound text to this patient, include the opt-out footer.',
  '2.Wait for the patient to respond',
  '• Hand turn to patient {{agent_turn}}',
  '• The agent will follow the right procedure based on what the patient says. Procedures cover scheduling, general questions, urgent concerns, prescriptions, and requests to speak with someone.',
].join('\n')

const FALLBACK_STEPS: Record<string, string> = {
  'identify-patient': [
    '1.Verify identity',
    '• "Could I get your full name and date of birth?" {{agent_turn}}',
    '• Match the caller to an existing patient record using {{patient_lookup}}.',
    '2.Confirm match',
    '• Read back the matched name and last four digits of the phone number.',
    '• If no match, route to {{New patient intake}}.',
  ].join('\n'),
  'new-patient': [
    '1.Collect demographics',
    '• Ask for full name, date of birth, and phone number {{agent_turn}}',
    '• Capture address and email if needed.',
    '2.Collect insurance',
    '• Ask for insurance carrier and member ID {{agent_turn}}',
    '• Note if patient is self-pay.',
    '3.Save intake',
    '• Invoke {{birdeye_create_contact}} to create the patient record.',
  ].join('\n'),
}

const CATALOG_OVERRIDES: Record<string, Partial<ProcedureDetailDraft>> = {
  greet: {
    name: 'Greet and start the conversation',
    whenToUse: 'When an incoming call, web chat, or text arrives at the start of a new conversation',
    stepsText: GREET_STEPS,
  },
}

function richStepsToText(steps: ProcedureStep[]): string {
  return steps
    .map((step, i) => {
      const bullets = step.bullets
        .map((b) => {
          const content = b.tokens
            .map((t) => (typeof t === 'string' ? t : `{{${t.label}}}`))
            .join('')
          return content.trim() ? `• ${content.trim()}` : ''
        })
        .filter(Boolean)
        .join('\n')
      return bullets ? `${i + 1}.${step.title}\n${bullets}` : `${i + 1}.${step.title}`
    })
    .join('\n')
}

function contextToChips(context: ContextItem[] | undefined): { value: string; type: string }[] {
  if (!context?.length) return []
  const kindMap: Record<string, string> = {
    context: 'variable',
    file: 'attachment',
    link: 'link',
  }
  return context.map((c) => ({ value: c.label, type: kindMap[c.kind] || 'variable' }))
}

function findHcProcedure(catalogId: string, displayTitle: string) {
  const name = CATALOG_PROCEDURE_NAME[catalogId] ?? displayTitle
  return HC_PROCEDURES.find((p) => p.name === name)
}

function resolveStepsText(catalogId: string, displayTitle: string): string {
  if (catalogId === 'greet') return GREET_STEPS
  if (FALLBACK_STEPS[catalogId]) return FALLBACK_STEPS[catalogId]

  const hc = findHcProcedure(catalogId, displayTitle)
  if (hc?.steps?.length) return richStepsToText(hc.steps)

  const workflowKey = CATALOG_DETAIL_KEY[catalogId] ?? displayTitle
  const base = getProcedureDetailContent(workflowKey, {}, 'healthcare')
  return base.stepsText ?? ''
}

export function buildProcedureDetailDraft(catalogId: string, displayTitle: string): ProcedureDetailDraft {
  const workflowKey = CATALOG_DETAIL_KEY[catalogId] ?? displayTitle
  const overrides = CATALOG_OVERRIDES[catalogId] ?? {}
  const hc = findHcProcedure(catalogId, displayTitle)
  const base = getProcedureDetailContent(workflowKey, overrides, 'healthcare')
  const hcContext = contextToChips(hc?.context)

  return {
    id: catalogId,
    name: overrides.name ?? displayTitle,
    whenToUse: overrides.whenToUse ?? hc?.whenToUse ?? base.whenToUse ?? '',
    contextChips: hcContext.length ? hcContext : (base.contextChips ?? []) as { value: string; type: string }[],
    moreContextCount: hcContext.length ? 0 : (base.moreContextCount ?? 0),
    stepsText: overrides.stepsText ?? resolveStepsText(catalogId, displayTitle),
  }
}
