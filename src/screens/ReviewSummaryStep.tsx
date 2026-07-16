import { type ReactNode } from 'react'
import { Icon, LanguageFlag } from '../components'
import type { HealthcareProcedureCatalogItem } from '../data/healthcareProcedureCatalog'
import type { WizardLocation } from '../data/wizardLocations'
import {
  TEXT_FALLBACK_AFTER,
  TEXT_FALLBACK_BEFORE,
  WEBCHAT_FALLBACK_AFTER,
  WEBCHAT_FALLBACK_DURING,
  type TextChannelSettings,
  type WebChatChannelSettings,
} from './channelSetupSettings.types'
import { getAgentLanguage } from '../data/agentLanguages'
import type { AgentLanguageId } from '../data/agentLanguages'

type ChannelId = 'voice' | 'webchat' | 'text' | 'email' | 'facebook' | 'instagram'
type RecordingMode = 'off' | 'announced' | 'silent'

interface AdditionalVoiceConfig {
  label: string
  voice: string
  language: AgentLanguageId
  whenToUse: string
  speed: number
}

const LABEL_CLASS = 'text-small text-text-secondary'

const FIELD_CLASS =
  'w-full rounded-sm border border-border bg-surface px-md text-body text-text-primary'

function SectionHeader({
  title,
  onEdit,
  editAriaLabel,
}: {
  title: string
  onEdit: () => void
  editAriaLabel: string
}) {
  return (
    <div className="mb-lg flex items-center gap-xs">
      <h3 className="text-h3 text-text-primary">{title}</h3>
      <button
        type="button"
        onClick={onEdit}
        aria-label={editAriaLabel}
        className="flex items-center justify-center text-text-tertiary transition-colors hover:text-primary"
      >
        <Icon name="edit" size={16} />
      </button>
    </div>
  )
}

function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-lg">{children}</div>
}

function ReadField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-xs">
      <label className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  )
}

function TextBox({ value, multiline = false }: { value: string; multiline?: boolean }) {
  if (multiline) {
    return (
      <div className={`${FIELD_CLASS} min-h-[160px] whitespace-pre-wrap py-sm leading-relaxed`}>
        {value || '—'}
      </div>
    )
  }
  return <div className={`${FIELD_CLASS} flex h-9 items-center`}>{value || '—'}</div>
}

function ChipBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[52px] flex-wrap items-start gap-sm rounded-sm border border-border bg-surface px-md py-sm">
      {children}
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="flex h-7 items-center rounded-sm border border-border bg-surface px-md text-small text-text-secondary">
      {label}
    </span>
  )
}

function LanguageChip({ id }: { id: string }) {
  const lang = getAgentLanguage(id as AgentLanguageId)
  return (
    <span className="flex h-7 items-center gap-xs rounded-sm bg-chip-neutral-bg px-sm text-body text-text-primary">
      <LanguageFlag countryCode={lang.countryCode} label={lang.label} size="sm" />
      {lang.label}
    </span>
  )
}

export interface ReviewSummaryStepProps {
  agentName: string
  systemPrompt: string
  language: string
  additionalLanguages: string[]
  selectedChannels: Set<ChannelId>
  voice: string
  additionalVoices: string[]
  additionalVoiceConfigs?: AdditionalVoiceConfig[]
  voiceSpeed?: number
  greeting: string
  recording: RecordingMode
  consent: string
  webchatSettings: WebChatChannelSettings
  textSettings: TextChannelSettings
  locations: WizardLocation[]
  selectedLocationIds: string[]
  procedures: HealthcareProcedureCatalogItem[]
  selectedProcedureIds: string[]
  onEditStep: (step: number) => void
  onViewProcedure: (id: string) => void
}

export function ReviewSummaryStep({
  agentName,
  systemPrompt,
  language,
  additionalLanguages,
  selectedChannels,
  voice,
  additionalVoiceConfigs = [],
  greeting,
  recording,
  consent,
  webchatSettings,
  textSettings,
  locations,
  selectedLocationIds,
  procedures,
  selectedProcedureIds,
  onEditStep,
  onViewProcedure,
}: ReviewSummaryStepProps) {
  const selectedLocations = locations.filter((l) => selectedLocationIds.includes(l.id))
  const selectedProcedures = procedures.filter((p) => selectedProcedureIds.includes(p.id))
  const primaryLang = getAgentLanguage(language as AgentLanguageId)

  return (
    <div className="w-full max-w-[700px] flex flex-col gap-2xl">
      <div>
        <h2 className="text-h3 text-text-primary">Review summary</h2>
        <p className="mt-[2px] text-small text-text-tertiary">
          Review your configurations before creating the agent
        </p>
      </div>

      {/* Getting started */}
      <section className="flex flex-col gap-0">
        <SectionHeader title="Getting started" editAriaLabel="Edit getting started" onEdit={() => onEditStep(1)} />
        <FieldGroup>
          <ReadField label="Name">
            <TextBox value={agentName} />
          </ReadField>

          <ReadField label="Locations">
            {selectedLocations.length === 0 ? (
              <ChipBox><span className="text-body text-text-tertiary">No locations selected</span></ChipBox>
            ) : (
              <ChipBox>
                {selectedLocations.map((loc) => (
                  <Pill key={loc.id} label={loc.name} />
                ))}
              </ChipBox>
            )}
          </ReadField>
        </FieldGroup>
      </section>

      {/* Configure agent */}
      <section className="flex flex-col gap-0">
        <SectionHeader title="Configure agent" editAriaLabel="Edit configure agent" onEdit={() => onEditStep(2)} />
        <FieldGroup>
          <ReadField label="System prompt *">
            <TextBox value={systemPrompt} multiline />
          </ReadField>

          <ReadField label="Language">
            <p className="-mt-[2px] text-small text-text-tertiary">
              Choose the default and additional languages the agent will communicate in.
            </p>
            <div className={`${FIELD_CLASS} flex h-9 items-center gap-sm`}>
              <LanguageFlag countryCode={primaryLang.countryCode} label={primaryLang.label} />
              <span className="flex-1">{primaryLang.label}</span>
              <Icon name="expand_more" size={18} className="shrink-0 text-text-icon" />
            </div>
          </ReadField>

          {additionalLanguages.length > 0 && (
            <ReadField label="Additional language">
              <ChipBox>
                {additionalLanguages.map((id) => (
                  <LanguageChip key={id} id={id} />
                ))}
                <Icon name="expand_more" size={18} className="ml-auto shrink-0 self-center text-text-icon" />
              </ChipBox>
            </ReadField>
          )}
        </FieldGroup>
      </section>

      {/* Channel configuration */}
      <section className="flex flex-col gap-0">
        <SectionHeader title="Channel configuration" editAriaLabel="Edit channel configuration" onEdit={() => onEditStep(3)} />

        {selectedChannels.size === 0 ? (
          <div className={`${FIELD_CLASS} flex h-16 items-center justify-center text-text-tertiary`}>
            No channels selected.
          </div>
        ) : (
          <FieldGroup>
            {selectedChannels.has('voice') && (
              <>
                <ReadField label="Default voice *">
                  <div className={`${FIELD_CLASS} flex h-9 items-center gap-sm`}>
                    <span className="flex-1">{voice || '—'}</span>
                    <Icon name="chevron_right" size={20} className="shrink-0 text-text-icon" />
                  </div>
                </ReadField>

                {additionalVoiceConfigs.length > 0 && (
                  <ReadField label="Additional voice">
                    <ChipBox>
                      {additionalVoiceConfigs.map((cfg) => {
                        const lang = getAgentLanguage(cfg.language)
                        return (
                          <span
                            key={cfg.label}
                            className="flex h-7 items-center gap-xs rounded-sm bg-chip-neutral-bg px-sm text-body text-text-primary"
                          >
                            <LanguageFlag countryCode={lang.countryCode} label={lang.label} size="sm" />
                            {cfg.label}
                          </span>
                        )
                      })}
                    </ChipBox>
                  </ReadField>
                )}

                <ReadField label="Greeting message">
                  <TextBox value={greeting} multiline />
                </ReadField>

                <ReadField label="Recording">
                  <TextBox
                    value={
                      recording === 'off'
                        ? 'Off'
                        : recording === 'announced'
                          ? 'Record with announced consent'
                          : 'Record silently'
                    }
                  />
                </ReadField>

                {recording === 'announced' && consent && (
                  <ReadField label="Consent message">
                    <TextBox value={consent} multiline />
                  </ReadField>
                )}
              </>
            )}

            {selectedChannels.has('webchat') && (
              <ReadField label="Web chat settings">
                <FieldGroup>
                  <ReadField label="AI agent name">
                    <TextBox value={webchatSettings.aiAgentName || '—'} />
                  </ReadField>
                  {webchatSettings.duringEnabled && (
                    <ReadField label="Fallback message (during business hours)">
                      <TextBox value={WEBCHAT_FALLBACK_DURING} multiline />
                    </ReadField>
                  )}
                  {webchatSettings.afterEnabled && (
                    <ReadField label="Fallback message (after business hours)">
                      <TextBox value={WEBCHAT_FALLBACK_AFTER} multiline />
                    </ReadField>
                  )}
                </FieldGroup>
              </ReadField>
            )}

            {selectedChannels.has('text') && (
              <ReadField label="Text settings">
                <FieldGroup>
                  <ReadField label="Unsubscribe text">
                    <TextBox value={textSettings.unsubscribeEnabled ? 'Enabled' : 'Disabled'} />
                  </ReadField>
                  {textSettings.beforeEnabled && (
                    <ReadField label="Fallback message (before business hours)">
                      <TextBox value={TEXT_FALLBACK_BEFORE} multiline />
                    </ReadField>
                  )}
                  {textSettings.afterEnabled && (
                    <ReadField label="Fallback message (after business hours)">
                      <TextBox value={TEXT_FALLBACK_AFTER} multiline />
                    </ReadField>
                  )}
                </FieldGroup>
              </ReadField>
            )}
          </FieldGroup>
        )}
      </section>

      {/* Procedures */}
      <section className="flex flex-col gap-0">
        <SectionHeader title="Procedures" editAriaLabel="Edit procedures" onEdit={() => onEditStep(4)} />
        {selectedProcedures.length === 0 ? (
          <div className={`${FIELD_CLASS} flex h-16 items-center justify-center text-text-tertiary`}>
            No procedures selected.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-lg">
            {selectedProcedures.map((procedure) => (
              <ProcedureCard
                key={procedure.id}
                title={procedure.title}
                description={procedure.description}
                onView={() => onViewProcedure(procedure.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProcedureCard({
  title,
  description,
  onView,
}: {
  title: string
  description: string
  onView: () => void
}) {
  return (
    <div className="group relative flex min-h-[148px] flex-col rounded-md border border-border bg-surface p-xl transition-colors hover:border-border-selected hover:bg-surface-l2">
      <button
        type="button"
        onClick={onView}
        className="absolute right-xl top-xl hidden text-body text-text-action hover:text-primary-hover group-hover:block"
      >
        View
      </button>
      <Icon name="menu_book" size={20} className="mb-md shrink-0 text-text-icon" />
      <h4 className="mb-xs pr-lg text-body text-text-primary">{title}</h4>
      <p className="line-clamp-3 text-body text-text-secondary">{description}</p>
    </div>
  )
}
