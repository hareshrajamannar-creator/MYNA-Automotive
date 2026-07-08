import { useEffect, useRef, useState, useCallback } from 'react'
import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { Icon } from '../Icon/Icon'
import { SelectMenu } from '../SelectMenu/SelectMenu'
import { DatePickerModal } from '../DatePickerModal/DatePickerModal'
import { BookAppointmentDrawerProps } from './BookAppointmentDrawer.types'

// ─── Data ─────────────────────────────────────────────────────────────────────

const WIDGET_OPTIONS = [
  'All scripts appointment widget',
  'New patient widget',
  'Follow-up appointment widget',
  'Urgent care widget',
]

const LOCATION_OPTIONS = ['Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL', 'Seattle, WA']
const APPT_TYPE_OPTIONS = ['New consultation', 'Follow up', 'Procedure', 'Annual physical', 'Urgent care']
const PROVIDER_OPTIONS = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones']
const BOOK_FOR_OPTIONS = ['Myself', 'Someone else']
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

type ApptKey = 'location' | 'appointmentType' | 'provider' | 'dateTime'
type PatientKey = 'bookFor' | 'firstName' | 'lastName' | 'phone' | 'email' | 'gender' | 'dob' | 'address' | 'zipcode' | 'city' | 'state'

const APPT_FIELDS: { key: ApptKey; label: string; isDatePicker?: boolean; options?: string[] }[] = [
  { key: 'location',        label: 'Location',         options: LOCATION_OPTIONS },
  { key: 'appointmentType', label: 'Appointment type', options: APPT_TYPE_OPTIONS },
  { key: 'provider',        label: 'Provider',         options: PROVIDER_OPTIONS },
  { key: 'dateTime',        label: 'Date & time',      isDatePicker: true },
]

const PATIENT_REQUIRED: PatientKey[] = ['bookFor', 'firstName', 'phone', 'email', 'dob', 'address', 'zipcode', 'city', 'state']

const MAP_IMAGE = 'https://www.figma.com/api/mcp/asset/0b3ceb6c-10ea-4ea2-80c4-01a26a9cc376'

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-small text-text-primary">{label}</span>
      {required && <span className="text-[12px] leading-[18px] text-[#de1b0c]">*</span>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder = 'Enter input' }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-sm border border-border-selected bg-surface px-[12px] text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
    />
  )
}

function DropdownButton({ value, open, onClick, placeholder = 'Select' }: {
  value?: string; open: boolean; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; placeholder?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-[12px] pr-sm hover:bg-surface-l2 ${open ? 'border-primary' : 'border-border-selected'}`}
    >
      <span className={`min-w-0 flex-1 truncate text-left text-body ${value ? 'text-text-primary' : 'text-text-tertiary'}`}>
        {value || placeholder}
      </span>
      <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
    </button>
  )
}

// ─── Accordion wrapper ────────────────────────────────────────────────────────

function Accordion({ title, open, onToggle, children, topDivider }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode; topDivider?: boolean
}) {
  return (
    <div className={`border-b border-border${topDivider ? ' border-t' : ''}`}>
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-[14px] pr-sm"
      >
        <span className="text-body text-text-primary">{title}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} className="shrink-0 text-text-icon" />
      </button>
      {open && (
        <div className="pb-[16px]">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BookAppointmentDrawer({ open, onClose }: BookAppointmentDrawerProps) {
  const [booked, setBooked] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  // Widget
  const [widget, setWidget] = useState('')
  const [widgetMenuOpen, setWidgetMenuOpen] = useState(false)
  const widgetBtnRef = useRef<HTMLButtonElement>(null)

  // Accordion open state
  const [apptOpen, setApptOpen] = useState(true)
  const [patientOpen, setPatientOpen] = useState(true)

  // Appointment fields
  const [appt, setAppt] = useState<Partial<Record<ApptKey, string>>>({})
  const [openApptField, setOpenApptField] = useState<ApptKey | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<{ top: number; left: number } | null>(null)

  // Patient fields
  const [patient, setPatient] = useState<Partial<Record<PatientKey, string>>>({})
  const [openPatientField, setOpenPatientField] = useState<PatientKey | null>(null)
  const [agreed, setAgreed] = useState(false)

  // Shared anchor for SelectMenu dropdowns
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    if (!open) {
      setBooked(false)
      setTransitioning(false)
      setWidget('')
      setWidgetMenuOpen(false)
      setApptOpen(true)
      setPatientOpen(true)
      setAppt({})
      setOpenApptField(null)
      setDatePickerOpen(false)
      setPatient({})
      setOpenPatientField(null)
      setAgreed(false)
    }
  }, [open])

  // ── Widget menu ──
  function openWidgetMenu() {
    if (widgetMenuOpen) { setWidgetMenuOpen(false); return }
    const r = widgetBtnRef.current?.getBoundingClientRect()
    if (r) setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setWidgetMenuOpen(true)
    setOpenApptField(null)
    setOpenPatientField(null)
    setDatePickerOpen(false)
  }

  // ── Appointment field dropdowns ──
  function openApptDropdown(key: ApptKey, e: React.MouseEvent<HTMLButtonElement>) {
    const field = APPT_FIELDS.find(f => f.key === key)
    const r = e.currentTarget.getBoundingClientRect()
    if (field?.isDatePicker) {
      if (datePickerOpen) { setDatePickerOpen(false); return }
      setDatePickerAnchor({ top: r.top - 80, left: r.left })
      setDatePickerOpen(true)
      setOpenApptField(null)
      setOpenPatientField(null)
      setWidgetMenuOpen(false)
      return
    }
    if (openApptField === key) { setOpenApptField(null); return }
    setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpenApptField(key)
    setOpenPatientField(null)
    setWidgetMenuOpen(false)
    setDatePickerOpen(false)
  }

  // ── Patient field dropdowns ──
  function openPatientDropdown(key: PatientKey, e: React.MouseEvent<HTMLButtonElement>) {
    if (openPatientField === key) { setOpenPatientField(null); return }
    const r = e.currentTarget.getBoundingClientRect()
    setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpenPatientField(key)
    setOpenApptField(null)
    setWidgetMenuOpen(false)
    setDatePickerOpen(false)
  }

  const hasWidget = !!widget
  const apptComplete = APPT_FIELDS.every(f => !!appt[f.key])
  const patientComplete = PATIENT_REQUIRED.every(k => !!patient[k]) && agreed
  const canBook = hasWidget && apptComplete && patientComplete

  const patientDropdownOptions: Partial<Record<PatientKey, string[]>> = {
    bookFor: BOOK_FOR_OPTIONS,
    gender: GENDER_OPTIONS,
  }
  const activeApptField = APPT_FIELDS.find(f => f.key === openApptField && !f.isDatePicker)
  const activePatientField = openPatientField && patientDropdownOptions[openPatientField] ? openPatientField : null

  const goToSuccess = useCallback(() => {
    setTransitioning(true)
    setTimeout(() => {
      setBooked(true)
      setTransitioning(false)
    }, 900)
  }, [])

  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-[650px] max-w-[92vw] flex-col bg-surface shadow-dropdown transition-transform duration-200 ${
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
            <h2 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">Book an appointment</h2>
          </div>
          {!booked && (
            <button
              type="button"
              disabled={!canBook}
              onClick={() => canBook && goToSuccess()}
              className={`rounded-sm px-lg py-[7px] text-body transition-colors ${
                canBook
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'cursor-not-allowed bg-surface-selected text-text-tertiary'
              }`}
            >
              Book
            </button>
          )}
        </div>

        {/* ── Skeleton loader ── */}
        {transitioning && (
          <div className="flex flex-1 flex-col gap-[12px] overflow-hidden px-2xl pb-2xl pt-[12px]">
            <div className="h-[266px] w-full shrink-0 animate-pulse rounded-sm bg-surface-selected" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[6px]">
                <div className="h-[14px] w-[30%] animate-pulse rounded-sm bg-surface-selected" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="h-9 w-full animate-pulse rounded-sm bg-surface-selected" style={{ animationDelay: `${i * 60}ms` }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Form view ── */}
        {!booked && !transitioning && (
          <div className="flex flex-1 flex-col overflow-y-auto px-2xl pb-2xl pt-md">
            {/* Appointment widget */}
            <div className="flex flex-col gap-xs">
              <label className="text-small text-text-primary">Appointment widget</label>
              <button
                ref={widgetBtnRef}
                type="button"
                onClick={openWidgetMenu}
                className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${
                  widgetMenuOpen ? 'border-primary' : 'border-border-selected'
                }`}
              >
                <span className={`min-w-0 flex-1 truncate text-left text-body ${widget ? 'text-text-primary' : 'text-text-tertiary'}`}>
                  {widget || 'Select'}
                </span>
                <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
              </button>
            </div>

            {/* Accordions */}
            {hasWidget && (
              <div className="mt-lg flex flex-col">
                {/* Accordion 1 — Appointment details */}
                <Accordion
                  title="Appointment details"
                  open={apptOpen}
                  onToggle={() => setApptOpen(o => !o)}
                  topDivider
                >
                  <div className="flex flex-col gap-[12px]">
                    {APPT_FIELDS.map(field => (
                      <div key={field.key} className="flex flex-col gap-xs">
                        <FieldLabel label={field.label} required />
                        {field.isDatePicker ? (
                          <DropdownButton
                            value={appt[field.key]}
                            open={datePickerOpen}
                            onClick={e => openApptDropdown(field.key, e)}
                            placeholder="Select"
                          />
                        ) : (
                          <DropdownButton
                            value={appt[field.key]}
                            open={openApptField === field.key}
                            onClick={e => openApptDropdown(field.key, e)}
                            placeholder="Select"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Accordion>

                {/* Accordion 2 — Patient information */}
                <Accordion
                  title="Patient information"
                  open={patientOpen}
                  onToggle={() => setPatientOpen(o => !o)}
                                  >
                  <div className="flex flex-col gap-[12px]">
                    {/* Booking for */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Booking for" required />
                      <DropdownButton
                        value={patient.bookFor}
                        open={openPatientField === 'bookFor'}
                        onClick={e => openPatientDropdown('bookFor', e)}
                      />
                    </div>

                    {/* First name */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="First name" required />
                      <TextInput value={patient.firstName ?? ''} onChange={v => setPatient(p => ({ ...p, firstName: v }))} />
                    </div>

                    {/* Last name */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Last name" />
                      <TextInput value={patient.lastName ?? ''} onChange={v => setPatient(p => ({ ...p, lastName: v }))} />
                    </div>

                    {/* Phone number */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Phone number" required />
                      <div className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface focus-within:border-primary">
                        <div className="flex shrink-0 items-center gap-[4px] border-r border-border-selected px-[12px]">
                          <Icon name="call" size={20} className="text-text-icon" />
                          <span className="text-body text-text-primary">+1</span>
                          <Icon name="expand_more" size={16} className="text-text-tertiary" />
                        </div>
                        <input
                          type="tel"
                          value={patient.phone ?? ''}
                          onChange={e => setPatient(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Enter input"
                          className="min-w-0 flex-1 bg-transparent px-[12px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Email" required />
                      <TextInput value={patient.email ?? ''} onChange={v => setPatient(p => ({ ...p, email: v }))} />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Gender" />
                      <DropdownButton
                        value={patient.gender}
                        open={openPatientField === 'gender'}
                        onClick={e => openPatientDropdown('gender', e)}
                      />
                    </div>

                    {/* Date of birth */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Date of birth" required />
                      <TextInput value={patient.dob ?? ''} onChange={v => setPatient(p => ({ ...p, dob: v }))} placeholder="MM/DD/YYYY" />
                    </div>

                    {/* Address */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Address" required />
                      <TextInput value={patient.address ?? ''} onChange={v => setPatient(p => ({ ...p, address: v }))} />
                    </div>

                    {/* Zipcode */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="Zipcode" required />
                      <TextInput value={patient.zipcode ?? ''} onChange={v => setPatient(p => ({ ...p, zipcode: v }))} />
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="City" required />
                      <TextInput value={patient.city ?? ''} onChange={v => setPatient(p => ({ ...p, city: v }))} />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-xs">
                      <FieldLabel label="State" required />
                      <TextInput value={patient.state ?? ''} onChange={v => setPatient(p => ({ ...p, state: v }))} />
                    </div>

                    {/* Consent */}
                    <label className="flex cursor-pointer items-start gap-[4px] pt-xs">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        className="mt-[2px] size-4 shrink-0 cursor-pointer accent-primary"
                      />
                      <span className="text-body text-text-primary">
                        I understand that I am disclosing confidential information over a secure, encrypted connection and that this information will not be sold to any third party. By booking an appointment, I agree to{' '}
                        <span className="text-text-action">Birdeye Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-text-action">Privacy policy.</span>
                      </span>
                    </label>
                  </div>
                </Accordion>
              </div>
            )}
          </div>
        )}

        {/* ── Success state ── */}
        {booked && !transitioning && (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Thank you message */}
            <div className="px-2xl py-lg">
              <p className="text-[18px] leading-[28px] tracking-[-0.36px] text-text-primary">Thank you for your booking</p>
              <p className="mt-xs text-body text-text-secondary">We'll send you an appointment confirmation via text and email shortly.</p>
            </div>

            {/* Map with tooltip */}
            <div className="relative mx-2xl h-[266px] shrink-0 overflow-hidden rounded-sm border border-border-selected">
              <img
                src={MAP_IMAGE}
                alt="Location map"
                className="h-full w-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute left-[calc(50%-8px)] top-[190px] flex flex-col items-center">
                <div className="flex size-4 items-center justify-center rounded-full bg-[#e53935] shadow-md ring-2 ring-white">
                  <div className="size-[6px] rounded-full bg-white" />
                </div>
                <div className="h-[14px] w-[2px] bg-[#e53935]" />
              </div>
              <div className="absolute left-[calc(50%-80px)] top-[20px] w-[300px] overflow-hidden rounded-sm bg-surface shadow-[0px_10px_24px_0px_rgba(33,33,33,0.2)]">
                <div className="border-b border-border px-[16px] py-[12px]">
                  <p className="text-body text-text-primary">{appt.location || 'Location'}</p>
                  <p className="text-small text-text-tertiary">San Francisco, CA, USA</p>
                </div>
                <div className="flex flex-col gap-[8px] px-[16px] py-[12px]">
                  <div className="flex items-center gap-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-l2 text-small text-text-primary">
                      {appt.provider ? appt.provider.split(' ').map(w => w[0]).slice(0, 2).join('') : 'DR'}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-body text-text-primary">{appt.provider || 'Provider'}</p>
                      <p className="text-small text-text-tertiary">{appt.appointmentType || 'Appointment type'}</p>
                    </div>
                  </div>
                  <div className="pl-[48px]">
                    <p className="text-body text-text-primary">{appt.dateTime || 'Date & time'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="mx-2xl mt-lg rounded-sm bg-surface-l2 px-lg py-md">
              <p className="text-small text-text-tertiary">Contact details</p>
              <p className="mt-xs text-body text-text-primary">
                {[patient.firstName, patient.lastName].filter(Boolean).join(' ') || '—'}
              </p>
              {patient.phone && <p className="text-body text-text-primary">(+1) {patient.phone}</p>}
              {patient.email && <p className="text-body text-text-primary">{patient.email}</p>}
            </div>

            {/* Add to calendar */}
            <div className="mt-lg flex flex-col items-center gap-md px-2xl pb-2xl">
              <p className="text-body text-text-secondary">Add to your calendar?</p>
              <div className="grid w-full grid-cols-3 gap-[10px]">
                <button type="button" className="flex flex-col items-center gap-[5px] rounded-[6px] bg-[#f9fafb] px-[26px] py-[12px] hover:bg-surface-hover">
                  <img src="https://www.figma.com/api/mcp/asset/b9c85012-e0f1-43ad-92f2-7645a903be5e" alt="Google Calendar" className="size-6 object-cover" />
                  <span className="text-[12px] leading-[16px] text-text-primary">Google</span>
                </button>
                <button type="button" className="flex flex-col items-center gap-[5px] rounded-[6px] bg-[#f9fafb] px-[26px] py-[12px] hover:bg-surface-hover">
                  <img src="https://www.figma.com/api/mcp/asset/a20f743a-dda9-45e8-bdc1-8239d4f2a5e3" alt="iCal" className="h-5 w-[16px] object-cover" />
                  <span className="text-[12px] leading-[16px] text-text-primary">iCal</span>
                </button>
                <button type="button" className="flex flex-col items-center gap-[5px] rounded-[6px] bg-[#f9fafb] px-[26px] py-[12px] hover:bg-surface-hover">
                  <img src="https://www.figma.com/api/mcp/asset/ebda18eb-c171-40e1-9ab7-fed73bb8774b" alt="Outlook" className="size-6 object-cover" />
                  <span className="text-[12px] leading-[16px] text-text-primary">Outlook</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Widget dropdown */}
      {widgetMenuOpen && anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setWidgetMenuOpen(false)} />
          <div className="fixed z-[110]" style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
            <SelectMenu
              options={WIDGET_OPTIONS.map(o => ({ value: o, label: o }))}
              value={widget ? [widget] : []}
              onChange={val => { setWidget(val[0] ?? ''); setWidgetMenuOpen(false) }}
            />
          </div>
        </>
      )}

      {/* Appointment field dropdowns */}
      {activeApptField && anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setOpenApptField(null)} />
          <div className="fixed z-[110]" style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
            <SelectMenu
              options={(activeApptField.options ?? []).map(o => ({ value: o, label: o }))}
              value={appt[activeApptField.key] ? [appt[activeApptField.key]!] : []}
              onChange={val => { setAppt(a => ({ ...a, [activeApptField.key]: val[0] ?? '' })); setOpenApptField(null) }}
            />
          </div>
        </>
      )}

      {/* Patient field dropdowns */}
      {activePatientField && anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setOpenPatientField(null)} />
          <div className="fixed z-[110]" style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
            <SelectMenu
              options={(patientDropdownOptions[activePatientField] ?? []).map(o => ({ value: o, label: o }))}
              value={patient[activePatientField] ? [patient[activePatientField]!] : []}
              searchable={false}
              onChange={val => { setPatient(p => ({ ...p, [activePatientField]: val[0] ?? '' })); setOpenPatientField(null) }}
            />
          </div>
        </>
      )}

      {/* Date & time picker */}
      <DatePickerModal
        open={datePickerOpen}
        anchor={datePickerAnchor}
        variant="datetime"
        onClose={() => setDatePickerOpen(false)}
        onApply={value => setAppt(a => ({ ...a, dateTime: value }))}
      />
    </div>
  )
}
