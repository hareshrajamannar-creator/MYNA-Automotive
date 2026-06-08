export interface PatientDetail {
  // from the row (required)
  patient: string
  status: string
  // Basic details
  age?: string
  gender?: string
  phone?: string
  email?: string
  emergencyContact?: string
  emergencyRelationship?: string
  emergencyPhone?: string
  emergencyEmail?: string
  // Insurance
  insuranceProvider?: string
  memberId?: string
  groupNumber?: string
  secondaryInsurance?: string
  // Consent
  consentTreatment?: string
  consentHipaa?: string
  consentFinancial?: string
  // Medical history (multi-entry)
  medications?: Array<{ name: string; dosage: string; frequency: string }>
  drugAllergies?: Array<{ medicine: string; reaction: string }>
  nonDrugAllergies?: Array<{ allergen: string; reaction: string }>
  preferredPharmacy?: string
  medicalConditions?: string[]
  surgicalHistory?: Array<{ procedure: string; year: string }>
  familyHistory?: Array<{ condition: string; relation: string }>
  hospitalizations?: Array<{ condition: string; year: string }>
  // Social history
  tobacco?: string
  alcohol?: string
  drugUsage?: string
  exercise?: string
  // Row data for dynamic summary
  appointmentDate?: string
  bookedOn?: string
  sentOn?: string
  // AI summary bullets
  aiSummary?: string[]
}

export interface QuickViewDrawerProps {
  open: boolean
  patient: PatientDetail | null
  onClose: () => void
}
