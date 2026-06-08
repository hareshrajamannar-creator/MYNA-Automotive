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

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-sm border-b border-border px-2xl py-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
        >
          <Icon name="arrow_back" size={20} />
        </button>
        <span className="text-h3 text-text-primary">All activity of {patient.patient}</span>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — 30% */}
        <div className="flex w-[30%] shrink-0 flex-col overflow-y-auto border-r border-border">
          {/* Appointment details — always expanded, no toggle */}
          <div className="border-b border-border px-2xl py-lg">
            <span className="text-h4 text-text-primary">Appointment details</span>
          </div>
          <div className="px-2xl py-lg">
            <AppointmentInfoSection p={patient} />
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
