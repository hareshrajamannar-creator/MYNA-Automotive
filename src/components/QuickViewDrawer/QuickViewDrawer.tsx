import { useState } from 'react'
import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { Icon } from '../Icon/Icon'
import type { PatientDetail, QuickViewDrawerProps } from './QuickViewDrawer.types'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-md last:mb-0">
      <p className="text-small text-text-secondary">{label}</p>
      <p className="text-body text-text-primary">{value || '-'}</p>
    </div>
  )
}

function SubHeader({ label }: { label: string }) {
  return (
    <p className="mb-xs mt-lg text-small uppercase tracking-wider text-text-tertiary">{label}</p>
  )
}

function AccordionSection({
  title,
  defaultOpen = false,
  isFirst = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  isFirst?: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <div className={isFirst ? '' : 'border-t border-border'}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between py-sm hover:bg-surface-hover"
      >
        <span className="text-body text-text-primary">{title}</span>
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          size={20}
          className="shrink-0 text-text-icon"
        />
      </button>

      {expanded && (
        <div className="pb-lg pt-sm">
          {children}
        </div>
      )}
    </div>
  )
}

function BasicDetailsSection({ p }: { p: PatientDetail }) {
  return (
    <>
      <FieldRow label="Age" value={p.age} />
      <FieldRow label="Gender" value={p.gender} />
      <FieldRow label="Phone number" value={p.phone} />
      <FieldRow label="Email" value={p.email} />
      <FieldRow label="Emergency contact" value={p.emergencyContact} />
      <FieldRow label="Relationship" value={p.emergencyRelationship} />
      <FieldRow label="Emergency contact phone" value={p.emergencyPhone} />
      <FieldRow label="Emergency contact email" value={p.emergencyEmail} />
    </>
  )
}

function InsuranceSection({ p }: { p: PatientDetail }) {
  return (
    <>
      <FieldRow label="Insurance provider" value={p.insuranceProvider} />
      <FieldRow label="Member / Subscriber ID" value={p.memberId} />
      <FieldRow label="Group number" value={p.groupNumber} />
      <FieldRow label="Secondary insurance" value={p.secondaryInsurance ?? '-'} />
    </>
  )
}

function ConsentSection({ p }: { p: PatientDetail }) {
  return (
    <>
      <FieldRow label="Consent to treatment" value={p.consentTreatment} />
      <FieldRow label="HIPAA acknowledgment" value={p.consentHipaa} />
      <FieldRow label="Financial responsibility" value={p.consentFinancial} />
    </>
  )
}

function MedicalHistorySection({ p }: { p: PatientDetail }) {
  return (
    <>
      <SubHeader label="Current medications" />
      {p.medications?.length ? (
        p.medications.map((m, i) => (
          <FieldRow key={i} label={m.name} value={`${m.dosage} · ${m.frequency}`} />
        ))
      ) : (
        <FieldRow label="Medications" value="-" />
      )}

      <SubHeader label="Drug allergies" />
      {p.drugAllergies?.length ? (
        p.drugAllergies.map((a, i) => (
          <FieldRow key={i} label={a.medicine} value={a.reaction} />
        ))
      ) : (
        <FieldRow label="Drug allergies" value="-" />
      )}

      <SubHeader label="Non-drug allergies" />
      {p.nonDrugAllergies?.length ? (
        p.nonDrugAllergies.map((a, i) => (
          <FieldRow key={i} label={a.allergen} value={a.reaction} />
        ))
      ) : (
        <FieldRow label="Non-drug allergies" value="-" />
      )}

      <SubHeader label="Preferred pharmacy" />
      <FieldRow label="Pharmacy" value={p.preferredPharmacy} />

      <SubHeader label="Medical conditions" />
      {p.medicalConditions?.length ? (
        p.medicalConditions.map((c, i) => (
          <FieldRow key={i} label="Condition" value={c} />
        ))
      ) : (
        <FieldRow label="Medical conditions" value="-" />
      )}

      <SubHeader label="Surgical history" />
      {p.surgicalHistory?.length ? (
        p.surgicalHistory.map((s, i) => (
          <FieldRow key={i} label={s.procedure} value={s.year} />
        ))
      ) : (
        <FieldRow label="Surgical history" value="-" />
      )}

      <SubHeader label="Family history" />
      {p.familyHistory?.length ? (
        p.familyHistory.map((f, i) => (
          <FieldRow key={i} label={f.condition} value={f.relation} />
        ))
      ) : (
        <FieldRow label="Family history" value="-" />
      )}

      <SubHeader label="Hospitalizations" />
      {p.hospitalizations?.length ? (
        p.hospitalizations.map((h, i) => (
          <FieldRow key={i} label={h.condition} value={h.year} />
        ))
      ) : (
        <FieldRow label="Hospitalizations" value="-" />
      )}
    </>
  )
}

function SocialHistorySection({ p }: { p: PatientDetail }) {
  return (
    <>
      <FieldRow label="Tobacco / Smoking" value={p.tobacco} />
      <FieldRow label="Alcohol consumption" value={p.alcohol} />
      <FieldRow label="Drug usage" value={p.drugUsage} />
      <FieldRow label="Exercise" value={p.exercise} />
    </>
  )
}

export function QuickViewDrawer({ open, patient, onClose }: QuickViewDrawerProps) {
  if (!patient) return null

  const name = patient.patient
  const hasName = Boolean(name?.trim())
  const initials = hasName ? getInitials(name) : '--'
  const hasSummary = Boolean(patient.aiSummary?.length)

  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-[666px] max-w-[92vw] flex-col bg-surface shadow-dropdown transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header — single row */}
        <div className="flex shrink-0 items-center justify-between px-2xl py-xl">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              aria-label="Back"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            >
              <BackArrowIcon />
            </button>
            <h2 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">
              Quick view
            </h2>
          </div>
          <button
            type="button"
            className="text-small text-text-action hover:underline"
          >
            View form
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Patient identity */}
          <div className="flex flex-col items-center gap-sm px-2xl pb-lg pt-sm">
            <div
              className={`flex size-14 items-center justify-center rounded-full text-[18px] ${
                hasName ? 'bg-green-100 text-green-700' : 'bg-surface-subtle text-text-tertiary'
              }`}
            >
              {initials}
            </div>
            <p className="text-[18px] text-text-primary">{name}</p>
            <div className="flex items-center gap-sm">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-sm border border-border text-text-icon hover:bg-surface-l2"
              >
                <Icon name="send" size={18} />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-sm border border-border text-text-icon hover:bg-surface-l2"
              >
                <Icon name="chat_bubble" size={18} />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-sm border border-border text-text-icon hover:bg-surface-l2"
              >
                <Icon name="mail" size={18} />
              </button>
            </div>
          </div>

          {/* AI Summary */}
          {hasSummary ? (
            <div className="mx-2xl mb-lg rounded-lg border border-violet-200 bg-violet-50 p-lg">
              <div className="mb-sm flex items-center gap-xs">
                <Icon name="auto_awesome" size={16} className="text-violet-500" />
                <span className="text-body text-text-primary">Summary</span>
              </div>
              <ul className="space-y-xs">
                {patient.aiSummary!.map((bullet, i) => (
                  <li key={i} className="flex gap-xs text-body text-text-secondary">
                    <span className="mt-[6px] size-1 shrink-0 rounded-full bg-text-secondary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mx-2xl mb-lg rounded-lg border border-border bg-surface-subtle p-lg">
              <div className="mb-md flex items-center gap-xs">
                <Icon name="auto_awesome" size={16} className="text-text-icon" />
                <p className="text-body text-text-secondary">
                  Get insights and actions for {hasName ? name : 'this patient'}
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white hover:bg-primary-hover"
              >
                Generate summary
              </button>
            </div>
          )}

          {/* Accordion sections — inset container, no outer border */}
          <div className="mx-2xl mb-xl">
            <AccordionSection title="Basic details" defaultOpen isFirst>
              <BasicDetailsSection p={patient} />
            </AccordionSection>

            <AccordionSection title="Insurance">
              <InsuranceSection p={patient} />
            </AccordionSection>

            <AccordionSection title="Consent">
              <ConsentSection p={patient} />
            </AccordionSection>

            <AccordionSection title="Medical history">
              <MedicalHistorySection p={patient} />
            </AccordionSection>

            <AccordionSection title="Social history">
              <SocialHistorySection p={patient} />
            </AccordionSection>
          </div>
        </div>
      </aside>
    </div>
  )
}
