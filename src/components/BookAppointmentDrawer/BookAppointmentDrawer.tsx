import { useEffect, useRef, useState, useCallback } from 'react'
import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { Icon } from '../Icon/Icon'
import { SelectMenu } from '../SelectMenu/SelectMenu'
import { DatePickerModal } from '../DatePickerModal/DatePickerModal'
import { BookAppointmentDrawerProps } from './BookAppointmentDrawer.types'

// ─── Step 1 data ─────────────────────────────────────────────────────────────

const WIDGET_OPTIONS = [
  'All scripts appointment widget',
  'New patient widget',
  'Follow-up appointment widget',
  'Urgent care widget',
]

const LOCATION_OPTIONS = ['Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL', 'Seattle, WA']
const APPT_TYPE_OPTIONS = ['New consultation', 'Follow up', 'Procedure', 'Annual physical', 'Urgent care']
const PROVIDER_OPTIONS = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Jones']

type FieldKey = 'location' | 'appointmentType' | 'provider' | 'dateTime'

const FIELDS: { key: FieldKey; label: string; isDatePicker?: boolean; options?: string[] }[] = [
  { key: 'location', label: 'Location', options: LOCATION_OPTIONS },
  { key: 'appointmentType', label: 'Appointment type', options: APPT_TYPE_OPTIONS },
  { key: 'provider', label: 'Provider', options: PROVIDER_OPTIONS },
  { key: 'dateTime', label: 'Date & time', isDatePicker: true },
]

// ─── Step 2 data ─────────────────────────────────────────────────────────────

const BOOK_FOR_OPTIONS = ['Myself', 'Someone else']
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

type Step2Key = 'bookFor' | 'firstName' | 'lastName' | 'phone' | 'email' | 'gender' | 'dob' | 'address' | 'zipcode' | 'city' | 'state'

const STEP2_REQUIRED: Step2Key[] = ['bookFor', 'firstName', 'phone', 'email', 'dob', 'address', 'zipcode', 'city', 'state']

const MAP_IMAGE = 'https://www.figma.com/api/mcp/asset/0b3ceb6c-10ea-4ea2-80c4-01a26a9cc376'

// ─── Shared field components ──────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-small text-text-primary">{label}</span>
      {required && <span className="text-[12px] leading-[18px] text-[#de1b0c]">*</span>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder = 'Enter input',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-sm border border-border-selected bg-surface px-[12px] text-body text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BookAppointmentDrawer({ open, onClose }: BookAppointmentDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [transitioning, setTransitioning] = useState(false)

  // Step 1 state
  const [widget, setWidget] = useState('')
  const [values, setValues] = useState<Partial<Record<FieldKey, string>>>({})
  const [openField, setOpenField] = useState<string | null>(null)
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null)
  const [widgetMenuOpen, setWidgetMenuOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<{ top: number; left: number } | null>(null)
  const widgetBtnRef = useRef<HTMLButtonElement>(null)

  // Step 2 state
  const [s2, setS2] = useState<Partial<Record<Step2Key, string>>>({})
  const [s2OpenField, setS2OpenField] = useState<Step2Key | null>(null)
  const [s2Anchor, setS2Anchor] = useState<{ top: number; left: number; width: number } | null>(null)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setTransitioning(false)
      setWidget('')
      setValues({})
      setOpenField(null)
      setWidgetMenuOpen(false)
      setDatePickerOpen(false)
      setS2({})
      setS2OpenField(null)
      setAgreed(false)
    }
  }, [open])

  const goToStep = useCallback((next: 1 | 2 | 3) => {
    setTransitioning(true)
    setTimeout(() => {
      setStep(next)
      setTransitioning(false)
    }, 900)
  }, [])

  // ── Step 1 handlers ──
  function openWidgetMenu() {
    if (widgetMenuOpen) { setWidgetMenuOpen(false); return }
    const r = widgetBtnRef.current?.getBoundingClientRect()
    if (r) setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setWidgetMenuOpen(true)
    setOpenField(null)
    setDatePickerOpen(false)
  }

  function openFieldMenu(key: FieldKey, e: React.MouseEvent<HTMLButtonElement>) {
    const field = FIELDS.find(f => f.key === key)
    const r = e.currentTarget.getBoundingClientRect()
    if (field?.isDatePicker) {
      if (datePickerOpen) { setDatePickerOpen(false); return }
      setDatePickerAnchor({ top: r.bottom, left: r.left })
      setDatePickerOpen(true)
      setOpenField(null)
      setWidgetMenuOpen(false)
      return
    }
    if (openField === key) { setOpenField(null); return }
    setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpenField(key)
    setWidgetMenuOpen(false)
    setDatePickerOpen(false)
  }

  const hasWidget = !!widget
  const canGoNext = hasWidget && FIELDS.every((f) => !!values[f.key])
  const activeField = FIELDS.find((f) => f.key === openField && !f.isDatePicker)

  // ── Step 2 handlers ──
  function openS2Dropdown(key: Step2Key, e: React.MouseEvent<HTMLButtonElement>) {
    if (s2OpenField === key) { setS2OpenField(null); return }
    const r = e.currentTarget.getBoundingClientRect()
    setS2Anchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setS2OpenField(key)
  }

  const canBook = STEP2_REQUIRED.every(k => !!s2[k]) && agreed

  const s2DropdownOptions: Partial<Record<Step2Key, string[]>> = {
    bookFor: BOOK_FOR_OPTIONS,
    gender: GENDER_OPTIONS,
  }
  const activeS2Field = s2OpenField && s2DropdownOptions[s2OpenField] ? s2OpenField : null

  // ── Back button logic ──
  function handleBack() {
    if (step === 3) { onClose(); return }
    if (step === 2) { setStep(1); return }
    onClose()
  }

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
              onClick={handleBack}
              className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            >
              <BackArrowIcon />
            </button>
            <h2 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">Book an appointment</h2>
          </div>
          {step === 1 && (
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => canGoNext && goToStep(2)}
              className={`rounded-sm px-lg py-[7px] text-body transition-colors ${
                canGoNext
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'cursor-not-allowed bg-surface-selected text-text-tertiary'
              }`}
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              disabled={!canBook}
              onClick={() => canBook && goToStep(3)}
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
            {/* Map placeholder */}
            <div className="h-[266px] w-full shrink-0 animate-pulse rounded-sm bg-surface-selected" />
            {/* Field skeletons */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[6px]">
                <div className="h-[14px] w-[30%] animate-pulse rounded-sm bg-surface-selected" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="h-9 w-full animate-pulse rounded-sm bg-surface-selected" style={{ animationDelay: `${i * 60}ms` }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1 content ── */}
        {step === 1 && !transitioning && (
          <div className="flex flex-1 flex-col overflow-y-auto px-2xl pb-2xl pt-md">
            {/* Appointment widget field */}
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

            {/* Schedule a visit — 24px gap from widget, 12px between fields */}
            {hasWidget && (
              <div className="mt-lg flex flex-col gap-[12px]">
                <p className="text-body text-text-tertiary">Schedule a visit</p>
                {FIELDS.map((field) => (
                  <div key={field.key} className="flex flex-col gap-xs">
                    <label className="text-small text-text-primary">{field.label}</label>
                    <button
                      type="button"
                      onClick={(e) => openFieldMenu(field.key, e)}
                      className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${
                        (openField === field.key || (field.isDatePicker && datePickerOpen))
                          ? 'border-primary'
                          : 'border-border-selected'
                      }`}
                    >
                      <span className={`min-w-0 flex-1 truncate text-left text-body ${values[field.key] ? 'text-text-primary' : 'text-text-tertiary'}`}>
                        {values[field.key] || 'Select'}
                      </span>
                      <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2 content ── */}
        {step === 2 && !transitioning && (
          <div className="flex flex-1 flex-col gap-[12px] overflow-y-auto px-2xl pb-2xl pt-[12px]">
            {/* Map */}
            <div className="relative h-[266px] w-full shrink-0 overflow-hidden rounded-sm border border-border-selected">
              <img
                src={MAP_IMAGE}
                alt="Location map"
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />

              {/* Red pin */}
              <div className="absolute left-[calc(50%-8px)] top-[190px] flex flex-col items-center">
                <div className="flex size-4 items-center justify-center rounded-full bg-[#e53935] shadow-md ring-2 ring-white">
                  <div className="size-[6px] rounded-full bg-white" />
                </div>
                <div className="h-[14px] w-[2px] bg-[#e53935]" />
              </div>

              {/* Tooltip card */}
              <div className="absolute left-[calc(50%-80px)] top-[20px] w-[300px] overflow-hidden rounded-sm bg-surface shadow-[0px_10px_24px_0px_rgba(33,33,33,0.2)]">
                {/* Location row */}
                <div className="border-b border-border px-[16px] py-[12px]">
                  <p className="text-body text-text-primary">{values.location || 'Location'}</p>
                  <p className="text-small text-text-tertiary">San Francisco, CA, USA</p>
                </div>

                {/* Provider + appointment row */}
                <div className="flex flex-col gap-[8px] px-[16px] py-[12px]">
                  <div className="flex items-center gap-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-l2 text-small text-text-primary">
                      {values.provider ? values.provider.split(' ').map(w => w[0]).slice(0, 2).join('') : 'DR'}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-body text-text-primary">{values.provider || 'Provider'}</p>
                      <p className="text-small text-text-tertiary">{values.appointmentType || 'Appointment type'}</p>
                    </div>
                  </div>
                  <div className="pl-[48px]">
                    <p className="text-body text-text-primary">{values.dateTime || 'Date & time'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Book for */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Booking for" required />
              <button
                type="button"
                onClick={(e) => openS2Dropdown('bookFor', e)}
                className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-[12px] pr-sm hover:bg-surface-l2 ${
                  s2OpenField === 'bookFor' ? 'border-primary' : 'border-border-selected'
                }`}
              >
                <span className={`min-w-0 flex-1 truncate text-left text-body ${s2.bookFor ? 'text-text-primary' : 'text-text-tertiary'}`}>
                  {s2.bookFor || 'Select'}
                </span>
                <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
              </button>
            </div>

            {/* First name */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="First name" required />
              <TextInput value={s2.firstName ?? ''} onChange={v => setS2(p => ({ ...p, firstName: v }))} />
            </div>

            {/* Last name */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Last name" />
              <TextInput value={s2.lastName ?? ''} onChange={v => setS2(p => ({ ...p, lastName: v }))} />
            </div>

            {/* Phone number */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Phone number" required />
              <div className="flex h-9 w-full items-center rounded-sm border border-border-selected bg-surface focus-within:border-primary">
                <div className="flex shrink-0 items-center gap-[4px] border-r border-border-selected px-[12px]">
                  <Icon name="call" size={20} className="text-text-icon" />
                  <span className="text-body text-text-primary">+1</span>
                  <Icon name="expand_more" size={16} className="text-text-tertiary" />
                </div>
                <input
                  type="tel"
                  value={s2.phone ?? ''}
                  onChange={e => setS2(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Enter input"
                  className="min-w-0 flex-1 bg-transparent px-[12px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Email" required />
              <TextInput value={s2.email ?? ''} onChange={v => setS2(p => ({ ...p, email: v }))} />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Gender" />
              <button
                type="button"
                onClick={(e) => openS2Dropdown('gender', e)}
                className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-[12px] pr-sm hover:bg-surface-l2 ${
                  s2OpenField === 'gender' ? 'border-primary' : 'border-border-selected'
                }`}
              >
                <span className={`min-w-0 flex-1 truncate text-left text-body ${s2.gender ? 'text-text-primary' : 'text-text-tertiary'}`}>
                  {s2.gender || 'Select'}
                </span>
                <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
              </button>
            </div>

            {/* Date of birth */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Date of birth" required />
              <TextInput value={s2.dob ?? ''} onChange={v => setS2(p => ({ ...p, dob: v }))} placeholder="MM/DD/YYYY" />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Address" required />
              <TextInput value={s2.address ?? ''} onChange={v => setS2(p => ({ ...p, address: v }))} />
            </div>

            {/* Zipcode */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="Zipcode" required />
              <TextInput value={s2.zipcode ?? ''} onChange={v => setS2(p => ({ ...p, zipcode: v }))} />
            </div>

            {/* City */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="City" required />
              <TextInput value={s2.city ?? ''} onChange={v => setS2(p => ({ ...p, city: v }))} />
            </div>

            {/* State */}
            <div className="flex flex-col gap-[4px]">
              <FieldLabel label="State" required />
              <TextInput value={s2.state ?? ''} onChange={v => setS2(p => ({ ...p, state: v }))} />
            </div>

            {/* Consent checkbox */}
            <label className="flex cursor-pointer items-start gap-[4px] py-[8px]">
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
        )}

        {/* ── Step 3 — Success ── */}
        {step === 3 && !transitioning && (
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
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {/* Red pin */}
              <div className="absolute left-[calc(50%-8px)] top-[190px] flex flex-col items-center">
                <div className="flex size-4 items-center justify-center rounded-full bg-[#e53935] shadow-md ring-2 ring-white">
                  <div className="size-[6px] rounded-full bg-white" />
                </div>
                <div className="h-[14px] w-[2px] bg-[#e53935]" />
              </div>
              {/* Tooltip card */}
              <div className="absolute left-[calc(50%-80px)] top-[20px] w-[300px] overflow-hidden rounded-sm bg-surface shadow-[0px_10px_24px_0px_rgba(33,33,33,0.2)]">
                <div className="border-b border-border px-[16px] py-[12px]">
                  <p className="text-body text-text-primary">{values.location || 'Location'}</p>
                  <p className="text-small text-text-tertiary">San Francisco, CA, USA</p>
                </div>
                <div className="flex flex-col gap-[8px] px-[16px] py-[12px]">
                  <div className="flex items-center gap-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-l2 text-small text-text-primary">
                      {values.provider ? values.provider.split(' ').map(w => w[0]).slice(0, 2).join('') : 'DR'}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-body text-text-primary">{values.provider || 'Provider'}</p>
                      <p className="text-small text-text-tertiary">{values.appointmentType || 'Appointment type'}</p>
                    </div>
                  </div>
                  <div className="pl-[48px]">
                    <p className="text-body text-text-primary">{values.dateTime || 'Date & time'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="mx-2xl mt-lg rounded-sm bg-surface-l2 px-lg py-md">
              <p className="text-small text-text-tertiary">Contact details</p>
              <p className="mt-xs text-body text-text-primary">
                {[s2.firstName, s2.lastName].filter(Boolean).join(' ') || '—'}
              </p>
              {s2.phone && (
                <p className="text-body text-text-primary">(+1) {s2.phone}</p>
              )}
              {s2.email && (
                <p className="text-body text-text-primary">{s2.email}</p>
              )}
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
              options={WIDGET_OPTIONS.map((o) => ({ value: o, label: o }))}
              value={widget ? [widget] : []}
              onChange={(val) => { setWidget(val[0] ?? ''); setWidgetMenuOpen(false) }}
            />
          </div>
        </>
      )}

      {/* Field dropdowns (step 1 non-date) */}
      {activeField && anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setOpenField(null)} />
          <div className="fixed z-[110]" style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
            <SelectMenu
              options={(activeField.options ?? []).map((o) => ({ value: o, label: o }))}
              value={values[activeField.key] ? [values[activeField.key]!] : []}
              onChange={(val) => { setValues((v) => ({ ...v, [activeField.key]: val[0] ?? '' })); setOpenField(null) }}
            />
          </div>
        </>
      )}

      {/* Step 2 dropdowns */}
      {activeS2Field && s2Anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setS2OpenField(null)} />
          <div className="fixed z-[110]" style={{ top: s2Anchor.top, left: s2Anchor.left, width: s2Anchor.width }}>
            <SelectMenu
              options={(s2DropdownOptions[activeS2Field] ?? []).map(o => ({ value: o, label: o }))}
              value={s2[activeS2Field] ? [s2[activeS2Field]!] : []}
              searchable={false}
              onChange={(val) => { setS2(p => ({ ...p, [activeS2Field]: val[0] ?? '' })); setS2OpenField(null) }}
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
        onApply={(value) => setValues((v) => ({ ...v, dateTime: value }))}
      />
    </div>
  )
}
