# Intake Patient Detail Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-page `IntakePatientDetailScreen` (left: patient info accordions, right: activity timeline) that opens via a new "View details" 3-dot menu item in the Intake table.

**Architecture:** Extract shared activity utilities from `ViewActivityDrawer` into `activityUtils.tsx`, build the new screen composing those utilities plus QuickViewDrawer's section components, then wire the new "View details" menu item and state into `IntakeScreen`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Material Symbols via `Icon` component

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/ViewActivityDrawer/activityUtils.tsx` | Shared activity logic + sub-components extracted from ViewActivityDrawer |
| Modify | `src/components/ViewActivityDrawer/ViewActivityDrawer.tsx` | Import from activityUtils (no behavior change) |
| Create | `src/components/QuickViewDrawer/patientSections.tsx` | Re-export the 6 section components + AccordionSection from QuickViewDrawer for reuse |
| Modify | `src/components/QuickViewDrawer/QuickViewDrawer.tsx` | Import sections from patientSections.tsx (no behavior change) |
| Create | `src/screens/IntakePatientDetailScreen.tsx` | New full-page detail screen |
| Modify | `src/screens/IntakeScreen.tsx` | Add `detailRow` state + "View details" menu item + conditional render |

---

### Task 1: Extract activity utilities into `activityUtils.tsx`

**Files:**
- Create: `src/components/ViewActivityDrawer/activityUtils.tsx`
- Modify: `src/components/ViewActivityDrawer/ViewActivityDrawer.tsx`

- [ ] **Step 1: Create `activityUtils.tsx`** with the extracted logic

```tsx
// src/components/ViewActivityDrawer/activityUtils.tsx
import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import { Activity, ActivityType, ViewActivityDrawerProps } from './ViewActivityDrawer.types'

export function parseDate(str: string): Date {
  return new Date(`${str}, 2026`)
}

export function fmt(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function buildActivities(props: ViewActivityDrawerProps): Activity[] {
  const { patient, appointmentDate, appointmentTime, appointmentType, formType, status, bookedOn } = props
  const activities: Activity[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appt = appointmentDate ? parseDate(appointmentDate) : null
  const formSentDate = appt ? new Date(appt.getTime() - 7 * 86400000) : null
  const formWasSent = formSentDate ? formSentDate <= today : false

  activities.push({
    id: '1',
    type: 'booked',
    title: `${patient} booked an appointment for '${appointmentType ?? 'Consultation'}'`,
    subtitle: appointmentDate
      ? `Scheduled date: ${appointmentDate}  •  Scheduled time: ${appointmentTime ?? 'TBD'}`
      : undefined,
    date: bookedOn ? `${bookedOn}, 2026` : '',
  })

  activities.push({
    id: '2',
    type: 'check',
    title: 'Insurance verification initiated',
    date: bookedOn ? `${bookedOn}, 2026` : '',
  })

  if (formWasSent && formSentDate) {
    activities.push({
      id: '3',
      type: 'form-sent',
      title: `Intake form sent on ${fmt(formSentDate)}`,
      subtitle: formType ? `(${formType})` : undefined,
      date: fmt(formSentDate),
    })
  }

  if (formWasSent && appt) {
    const t3 = new Date(appt.getTime() - 3 * 86400000)
    if (t3 <= today) {
      activities.push({ id: '4', type: 'reminder', title: 'Intake form reminder sent', date: fmt(t3) })
    }

    if (status === 'Overdue' || status === 'Completed') {
      activities.push({ id: '5', type: 'check', title: 'Insurance verified', date: fmt(t3) })
    }

    const t2 = new Date(appt.getTime() - 2 * 86400000)
    if (t2 <= today) {
      activities.push({ id: '6', type: 'reminder', title: 'Intake reminder sent', date: fmt(t2) })
    }

    const t1 = new Date(appt.getTime() - 1 * 86400000)
    if (t1 <= today) {
      activities.push({ id: '7', type: 'reminder', title: 'Intake reminder sent', date: fmt(t1) })
    }
  }

  if (status === 'Completed' && appt) {
    activities.push({
      id: '8',
      type: 'completed',
      title: 'Intake form completed',
      actionLabel: 'View form',
      date: appointmentDate ? `${appointmentDate}, 2026` : '',
    })
  }

  return activities
}

export function ActivityIcon({ type }: { type: ActivityType }) {
  const iconMap: Record<ActivityType, string> = {
    booked:      'calendar_today',
    check:       'check',
    'form-sent': 'mail',
    reminder:    'notifications',
    completed:   'check',
  }
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full">
      <Icon name={iconMap[type]} size={18} className="text-text-primary" />
    </div>
  )
}

export function ActivityRow({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex gap-md">
      <div className="flex flex-col items-center">
        <ActivityIcon type={activity.type} />
        {!isLast && <div className="mt-xs w-px flex-1 bg-border" />}
      </div>
      <div className={`flex flex-1 items-start justify-between gap-lg ${isLast ? 'pb-0' : 'pb-2xl'}`}>
        <div className="flex flex-col gap-xs">
          <span className="text-body text-text-primary">{activity.title}</span>
          {activity.subtitle && (
            <span className="text-small text-text-secondary">{activity.subtitle}</span>
          )}
          {activity.actionLabel && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-fit items-center gap-xs text-small text-text-action hover:underline"
            >
              {expanded ? 'Hide details' : activity.actionLabel}
              <Icon name={expanded ? 'expand_less' : 'expand_more'} size={14} />
            </button>
          )}
        </div>
        <span className="shrink-0 text-small text-text-secondary">{activity.date}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `ViewActivityDrawer.tsx` to import from `activityUtils`**

Replace the entire file with:

```tsx
// src/components/ViewActivityDrawer/ViewActivityDrawer.tsx
import { buildActivities, ActivityRow } from './activityUtils'
import { Icon } from '../Icon/Icon'
import { ViewActivityDrawerProps } from './ViewActivityDrawer.types'

export function ViewActivityDrawer(props: ViewActivityDrawerProps) {
  const { open, patient, onClose } = props
  const activities = buildActivities(props)

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-black/20 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-[101] flex h-full w-[650px] flex-col bg-surface shadow-modal transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex shrink-0 items-center justify-between px-2xl py-xl">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            >
              <Icon name="arrow_back" size={20} />
            </button>
            <span className="text-h3 text-text-primary">All activity of {patient}</span>
          </div>
          <button type="button" className="text-body text-text-action hover:underline">
            View all details
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2xl py-lg">
          {activities.map((activity, i) => (
            <ActivityRow key={activity.id} activity={activity} isLast={i === activities.length - 1} />
          ))}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify build is clean**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive" && npm run build 2>&1 | tail -10
```

Expected: `✓ built in` with zero errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive"
git add src/components/ViewActivityDrawer/activityUtils.tsx src/components/ViewActivityDrawer/ViewActivityDrawer.tsx
git commit -m "refactor: extract activity utils into shared activityUtils.tsx"
```

---

### Task 2: Extract QuickViewDrawer patient section components

**Files:**
- Create: `src/components/QuickViewDrawer/patientSections.tsx`
- Modify: `src/components/QuickViewDrawer/QuickViewDrawer.tsx`

- [ ] **Step 1: Read the current QuickViewDrawer to get the exact section code**

Read `src/components/QuickViewDrawer/QuickViewDrawer.tsx` lines 1–260 to capture the full source of `AccordionSection`, `FieldRow`, `SubHeader`, `AppointmentInfoSection`, `BasicDetailsSection`, `InsuranceSection`, `ConsentSection`, `MedicalHistorySection`, `SocialHistorySection`.

- [ ] **Step 2: Create `patientSections.tsx`** by moving all those components into it

```tsx
// src/components/QuickViewDrawer/patientSections.tsx
// All section components exported for reuse in IntakePatientDetailScreen

export { AccordionSection } from './QuickViewDrawer'    // placeholder — replace with actual extracted code
```

Actually — do this instead: copy every function definition (`FieldRow`, `SubHeader`, `AccordionSection`, `AppointmentInfoSection`, `BasicDetailsSection`, `InsuranceSection`, `ConsentSection`, `MedicalHistorySection`, `SocialHistorySection`) verbatim from `QuickViewDrawer.tsx` into `patientSections.tsx`, add `export` to each one, and import `PatientDetail` from `./QuickViewDrawer.types`.

The file header:
```tsx
// src/components/QuickViewDrawer/patientSections.tsx
import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import { PatientDetail } from './QuickViewDrawer.types'
```

- [ ] **Step 3: Update `QuickViewDrawer.tsx`** — remove the local definitions of the 9 components and import them from `patientSections.tsx` instead. No other change to QuickViewDrawer.

- [ ] **Step 4: Verify build**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive" && npm run build 2>&1 | tail -10
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive"
git add src/components/QuickViewDrawer/patientSections.tsx src/components/QuickViewDrawer/QuickViewDrawer.tsx
git commit -m "refactor: extract patient section components to patientSections.tsx"
```

---

### Task 3: Build `IntakePatientDetailScreen`

**Files:**
- Create: `src/screens/IntakePatientDetailScreen.tsx`

- [ ] **Step 1: Create the screen**

```tsx
// src/screens/IntakePatientDetailScreen.tsx
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
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive" && npm run build 2>&1 | tail -10
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive"
git add src/screens/IntakePatientDetailScreen.tsx
git commit -m "feat: add IntakePatientDetailScreen"
```

---

### Task 4: Wire "View details" into `IntakeScreen`

**Files:**
- Modify: `src/screens/IntakeScreen.tsx`

- [ ] **Step 1: Add import and `detailRow` state**

At the top of `IntakeScreen.tsx`, add the import:
```tsx
import { IntakePatientDetailScreen } from './IntakePatientDetailScreen'
```

Inside the `IntakeScreen` function, after the existing state declarations (line ~181), add:
```tsx
const [detailRow, setDetailRow] = useState<PatientDetail | null>(null)
```

- [ ] **Step 2: Add "View details" to `rowMenuItems`**

In the `rowMenuItems` array (around line 266), add as the first item:
```tsx
{
  label: 'View details',
  onClick: (row) => {
    const detail = PATIENT_DETAILS[row.patient] ?? {}
    setDetailRow({
      patient: row.patient,
      status: activeTab === 'overdue' ? 'Overdue' : row.status,
      appointmentDate: row.appointmentDate,
      bookedOn: row.bookedOn,
      sentOn: row.sentOn,
      ...detail,
    })
  },
},
```

- [ ] **Step 3: Conditionally render `IntakePatientDetailScreen`**

Wrap the existing `return (...)` with a conditional. At the very start of the return, before the `<div className="flex h-full flex-col">`, add:

```tsx
if (detailRow) {
  return (
    <IntakePatientDetailScreen
      patient={detailRow}
      appointmentTime={PATIENT_DETAILS[detailRow.patient]?.appointmentTime}
      appointmentType={PATIENT_DETAILS[detailRow.patient]?.appointmentType ?? 'Consultation'}
      formType={detailRow.formType as string | undefined}
      status={detailRow.status}
      bookedOn={detailRow.bookedOn as string | undefined}
      insuranceProvider={PATIENT_DETAILS[detailRow.patient]?.insuranceProvider}
      sentVia={detailRow.sentVia as string | undefined}
      onBack={() => setDetailRow(null)}
    />
  )
}
```

- [ ] **Step 4: Verify build**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive" && npm run build 2>&1 | tail -10
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive"
git add src/screens/IntakeScreen.tsx
git commit -m "feat: wire View details menu item to IntakePatientDetailScreen"
```

---

### Task 5: Manual verification

- [ ] Run dev server: `cd "/Users/sampada.kudalkar/Documents/Myna/Final Intake flows/MYNA-Automotive" && npm run dev`
- [ ] Open `http://localhost:5173`, navigate to Manage Intake
- [ ] Hover a row → 3-dot menu → confirm "View details" appears alongside "Quick view", "View activity", "View form"
- [ ] Click "View details" → full page opens with correct patient name in header
- [ ] Left panel: appointment details section shows (no toggle), all 5 accordions expand/collapse
- [ ] Right panel: activity timeline shows correct steps for the row's status/dates
- [ ] Back arrow returns to the intake table (same tab active)
- [ ] "View activity" drawer still works (no regression)
- [ ] Try with a "Completed" row (e.g. Betty Hall) — "Intake form completed" step appears in timeline
