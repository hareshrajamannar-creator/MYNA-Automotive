import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { Icon } from '../Icon/Icon'
import iconAi from '../../assets/icon-ai.svg'
import type { PatientDetail, QuickViewDrawerProps } from './QuickViewDrawer.types'
import {
  AccordionSection,
  AppointmentInfoSection,
  BasicDetailsSection,
  InsuranceSection,
  ConsentSection,
  MedicalHistorySection,
  SocialHistorySection,
} from './patientSections'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function parseProtoDate(str: string): Date {
  return new Date(`${str}, 2026`)
}

function buildDefaultSummary(p: PatientDetail): string[] {
  const bullets: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookedLabel = p.bookedOn ? ` booked on ${p.bookedOn}` : ''
  if (p.appointmentDate) bullets.push(`Appointment for ${p.appointmentDate}${bookedLabel}`)

  if (p.appointmentDate) {
    const appt = parseProtoDate(p.appointmentDate)
    const formSentDate = new Date(appt)
    formSentDate.setDate(formSentDate.getDate() - 7)

    const formWasSent = formSentDate <= today
    bullets.push(
      formWasSent
        ? `Intake form sent on ${formatDate(formSentDate)}`
        : `Intake form will be sent on ${formatDate(formSentDate)}`,
    )

    bullets.push(
      p.status === 'Overdue'
        ? 'Insurance verification completed'
        : 'Insurance verification is in progress',
    )

    if (formWasSent) {
      const offsets = [1, 2, 3]
      for (const days of offsets) {
        const reminderDate = new Date(appt)
        reminderDate.setDate(reminderDate.getDate() - days)
        if (reminderDate <= today) {
          bullets.push(`Last reminder sent via Email on ${formatDate(reminderDate)}`)
          break
        }
      }
    }
  }

  return bullets
}

export function QuickViewDrawer({ open, patient, onClose }: QuickViewDrawerProps) {
  if (!patient) return null

  const name = patient.patient
  const hasName = Boolean(name?.trim())
  const initials = hasName ? getInitials(name) : '--'
  const isOverdueOrNotStarted = patient.status === 'Not started' || patient.status === 'Overdue'
  const summaryBullets = patient.aiSummary?.length
    ? patient.aiSummary
    : isOverdueOrNotStarted
      ? buildDefaultSummary(patient)
      : null

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
          {summaryBullets ? (
            <div className="mx-2xl mb-lg rounded-lg border border-violet-200 bg-violet-50 p-lg">
              <div className="mb-sm flex items-center gap-xs">
                <img src={iconAi} alt="AI" className="size-5" />
                <span className="text-body text-text-primary">Summary</span>
              </div>
              <ul className="space-y-xs">
                {summaryBullets.map((bullet, i) => (
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
                <img src={iconAi} alt="AI" className="size-5 opacity-50" />
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
            <AccordionSection title="Appointment information" defaultOpen isFirst>
              <AppointmentInfoSection p={patient} />
            </AccordionSection>

            <AccordionSection title="Basic details">
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
