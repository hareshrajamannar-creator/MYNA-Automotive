import { useState } from 'react'
import { Icon } from '../components/Icon/Icon'
import { PatientDetail } from '../components/QuickViewDrawer/QuickViewDrawer.types'
import {
  AccordionSection,
  AppointmentInfoSection,
  BasicDetailsSection,
  InsuranceSection,
  ConsentSection,
  MedicalHistorySection,
  SocialHistorySection,
} from '../components/QuickViewDrawer/patientSections'
import { buildActivities, ActivityRow } from '../components/ViewActivityDrawer/activityUtils'
import { ViewActivityDrawerProps } from '../components/ViewActivityDrawer/ViewActivityDrawer.types'

interface IntakePatientDetailScreenProps {
  patient: PatientDetail
  appointmentTime?: string
  appointmentType?: string
  formType?: string
  status?: string
  bookedOn?: string
  insuranceProvider?: string
  sentVia?: string
  onBack: () => void
}

export function IntakePatientDetailScreen({
  patient,
  appointmentTime,
  appointmentType,
  formType,
  status,
  bookedOn,
  insuranceProvider,
  sentVia,
  onBack,
}: IntakePatientDetailScreenProps) {
  const activityProps: ViewActivityDrawerProps = {
    open: true,
    patient: patient.patient,
    onClose: onBack,
    appointmentDate: patient.appointmentDate,
    appointmentTime: appointmentTime ?? patient.appointmentTime,
    appointmentType: appointmentType ?? patient.appointmentType,
    formType,
    status,
    bookedOn: bookedOn ?? patient.bookedOn,
    insuranceProvider: insuranceProvider ?? patient.insuranceProvider,
    sentVia,
  }
  const activities = buildActivities(activityProps)
  const [apptExpanded, setApptExpanded] = useState(true)

  const initials = patient.patient
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — floating card */}
        <div className="w-[30%] shrink-0 overflow-y-auto bg-surface-l2 p-lg">
          <div className="overflow-hidden rounded-lg border border-border bg-surface">

            {/* Patient header — avatar + name + actions */}
            <div className="flex flex-col items-center px-lg py-xl">
              <div className="flex size-16 items-center justify-center rounded-full bg-chip-success-bg text-lg text-chip-success-text">
                {initials}
              </div>
              <span className="mt-sm text-h3 text-text-primary">{patient.patient}</span>
              <div className="mt-sm flex items-center gap-xs">
                {(['send', 'chat', 'mail', 'smartphone', 'more_vert'] as const).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
                  >
                    <Icon name={icon} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Appointment details — collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setApptExpanded((e) => !e)}
                className="flex w-full items-center justify-between px-lg py-sm hover:bg-surface-hover"
              >
                <span className="text-body text-text-primary">Appointment details</span>
                <div className="flex items-center gap-xs">
                  <Icon name="edit" size={16} className="text-text-icon" />
                  <Icon name={apptExpanded ? 'expand_less' : 'expand_more'} size={20} className="text-text-icon" />
                </div>
              </button>
              {apptExpanded && (
                <div className="px-lg pb-lg pt-sm">
                  <AppointmentInfoSection p={patient} />
                </div>
              )}
            </div>

            {/* Collapsible accordions */}
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

        {/* Right panel — 70% */}
        <div className="flex flex-1 flex-col overflow-y-auto px-2xl py-xl">
          <div className="mb-lg flex items-baseline gap-md">
            <span className="text-h3 text-text-primary">Appointment booked</span>
            {bookedOn && (
              <span className="text-small text-text-secondary">{bookedOn}, 2026</span>
            )}
          </div>
          <div>
            {activities.map((activity, i) => (
              <ActivityRow key={activity.id} activity={activity} isLast={i === activities.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
