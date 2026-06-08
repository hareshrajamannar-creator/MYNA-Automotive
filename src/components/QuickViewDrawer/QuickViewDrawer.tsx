import { useState } from 'react'
import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { Icon } from '../Icon/Icon'
import type { PatientDetail, QuickViewDrawerProps, SectionStatus } from './QuickViewDrawer.types'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function deriveSectionStatus(hasData: boolean, rowStatus: string): SectionStatus {
  if (rowStatus === 'Not started') return 'not-started'
  return hasData ? 'completed' : 'not-filled'
}

function StatusBadge({ status }: { status: SectionStatus }) {
  if (status === 'completed') {
    return (
      <span className="flex items-center gap-xs text-small text-chip-success-text">
        <span className="size-[6px] rounded-full bg-chip-success-text" />
        Completed
      </span>
    )
  }
  if (status === 'not-filled') {
    return (
      <span className="flex items-center gap-xs text-small text-amber-600">
        <span className="size-[6px] rounded-full bg-amber-600" />
        Not filled
      </span>
    )
  }
  return (
    <span className="flex items-center gap-xs text-small text-text-tertiary">
      <span className="size-[6px] rounded-full bg-text-tertiary" />
      Not started
    </span>
  )
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-border py-sm last:border-0">
      <p className="text-small text-text-secondary">{label}</p>
      <p className="text-body text-text-primary">{value || '—'}</p>
    </div>
  )
}

function SubHeader({ label }: { label: string }) {
  return (
    <p className="mb-xs mt-lg text-small text-text-tertiary uppercase tracking-wider">{label}</p>
  )
}

function EmptyState({ status }: { status: SectionStatus }) {
  return (
    <div className="py-lg text-center">
      <p className="text-body text-text-secondary">
        {status === 'not-started'
          ? "Patient hasn't started the form yet."
          : 'Patient skipped this section.'}
      </p>
      <p className="mt-xs text-small text-text-tertiary">
        Data will appear once the form is submitted.
      </p>
    </div>
  )
}

function AccordionSection({
  title,
  status,
  defaultOpen = false,
  children,
}: {
  title: string
  status: SectionStatus
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-2xl py-sm hover:bg-surface-hover"
      >
        <span className="text-body text-text-primary">{title}</span>
        <div className="flex items-center gap-sm">
          <StatusBadge status={status} />
          <Icon name={expanded ? 'expand_less' : 'expand_more'} size={20} className="text-text-icon" />
        </div>
      </button>

      {expanded && (
        <div className="px-2xl pb-lg pt-sm">
          {status !== 'completed' ? <EmptyState status={status} /> : children}
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
      <FieldRow label="Secondary insurance" value={p.secondaryInsurance ?? 'None'} />
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
        <FieldRow label="Medications" value="None reported" />
      )}

      <SubHeader label="Drug allergies" />
      {p.drugAllergies?.length ? (
        p.drugAllergies.map((a, i) => (
          <FieldRow key={i} label={a.medicine} value={a.reaction} />
        ))
      ) : (
        <FieldRow label="Drug allergies" value="None reported" />
      )}

      <SubHeader label="Non-drug allergies" />
      {p.nonDrugAllergies?.length ? (
        p.nonDrugAllergies.map((a, i) => (
          <FieldRow key={i} label={a.allergen} value={a.reaction} />
        ))
      ) : (
        <FieldRow label="Non-drug allergies" value="None reported" />
      )}

      <SubHeader label="Preferred pharmacy" />
      <FieldRow label="Pharmacy" value={p.preferredPharmacy} />

      <SubHeader label="Medical conditions" />
      {p.medicalConditions?.length ? (
        p.medicalConditions.map((c, i) => (
          <FieldRow key={i} label="Condition" value={c} />
        ))
      ) : (
        <FieldRow label="Medical conditions" value="None reported" />
      )}

      <SubHeader label="Surgical history" />
      {p.surgicalHistory?.length ? (
        p.surgicalHistory.map((s, i) => (
          <FieldRow key={i} label={s.procedure} value={s.year} />
        ))
      ) : (
        <FieldRow label="Surgical history" value="None reported" />
      )}

      <SubHeader label="Family history" />
      {p.familyHistory?.length ? (
        p.familyHistory.map((f, i) => (
          <FieldRow key={i} label={f.condition} value={f.relation} />
        ))
      ) : (
        <FieldRow label="Family history" value="None reported" />
      )}

      <SubHeader label="Hospitalizations" />
      {p.hospitalizations?.length ? (
        p.hospitalizations.map((h, i) => (
          <FieldRow key={i} label={h.condition} value={h.year} />
        ))
      ) : (
        <FieldRow label="Hospitalizations" value="None reported" />
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

  const initials = getInitials(patient.patient)
  const rowStatus = patient.status

  const hasBasic = !!(patient.age || patient.gender || patient.phone || patient.email)
  const hasInsurance = !!(patient.insuranceProvider || patient.memberId)
  const hasConsent = !!(patient.consentTreatment || patient.consentHipaa)
  const hasMedical = !!(
    patient.medications?.length ||
    patient.drugAllergies?.length ||
    patient.nonDrugAllergies?.length ||
    patient.preferredPharmacy ||
    patient.medicalConditions?.length ||
    patient.surgicalHistory?.length ||
    patient.familyHistory?.length ||
    patient.hospitalizations?.length
  )
  const hasSocial = !!(
    patient.tobacco || patient.alcohol || patient.drugUsage || patient.exercise
  )

  const basicStatus     = deriveSectionStatus(hasBasic,     rowStatus)
  const insuranceStatus = deriveSectionStatus(hasInsurance, rowStatus)
  const consentStatus   = deriveSectionStatus(hasConsent,   rowStatus)
  const medicalStatus   = deriveSectionStatus(hasMedical,   rowStatus)
  const socialStatus    = deriveSectionStatus(hasSocial,    rowStatus)

  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-[666px] max-w-[92vw] flex-col bg-surface shadow-dropdown transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-2xl pb-lg pt-2xl">
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
            className="rounded-sm px-md py-xs text-body text-text-action hover:bg-surface-hover"
          >
            View form
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Patient identity */}
          <div className="flex flex-col items-center gap-sm px-2xl pb-lg pt-sm">
            <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-[18px] text-green-700">
              {initials}
            </div>
            <p className="text-[18px] text-text-primary">{patient.patient}</p>
            <div className="flex items-center gap-sm">
              {(['send', 'chat_bubble', 'mail'] as const).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="flex size-9 items-center justify-center rounded-sm border border-border text-text-icon hover:bg-surface-l2"
                >
                  <Icon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {patient.aiSummary && patient.aiSummary.length > 0 && (
            <div className="mx-2xl mb-lg rounded-lg border border-violet-200 bg-violet-50 p-lg">
              <div className="mb-sm flex items-center gap-xs">
                <Icon name="auto_awesome" size={16} className="text-violet-500" />
                <span className="text-body text-text-primary">Summary</span>
              </div>
              <ul className="space-y-xs">
                {patient.aiSummary.map((bullet, i) => (
                  <li key={i} className="flex gap-xs text-body text-text-secondary">
                    <span className="mt-[6px] size-1 shrink-0 rounded-full bg-text-secondary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accordion sections */}
          <AccordionSection title="Basic details" status={basicStatus} defaultOpen={hasBasic}>
            <BasicDetailsSection p={patient} />
          </AccordionSection>

          <AccordionSection title="Insurance" status={insuranceStatus}>
            <InsuranceSection p={patient} />
          </AccordionSection>

          <AccordionSection title="Consent" status={consentStatus}>
            <ConsentSection p={patient} />
          </AccordionSection>

          <AccordionSection title="Medical history" status={medicalStatus}>
            <MedicalHistorySection p={patient} />
          </AccordionSection>

          <AccordionSection title="Social history" status={socialStatus}>
            <SocialHistorySection p={patient} />
          </AccordionSection>
        </div>
      </aside>
    </div>
  )
}
