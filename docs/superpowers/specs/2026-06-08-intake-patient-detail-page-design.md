# Intake Patient Detail Page — Design Spec

**Date:** 2026-06-08  
**Status:** Approved  
**Figma reference:** https://www.figma.com/design/BKU2QO3RwZZMoBXif2oSCn/Myna-Healthcare?node-id=817-164327

---

## Context

The Intake screen currently has two drawer-based views for a patient row: "Quick view" (patient details) and "View activity" (activity timeline). Product wants a full-page **detail view** that combines both into a single screen, accessible via a new "View details" option in the 3-dot row menu. The existing "View activity" drawer is retained alongside it.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back   All activity of [Patient Name]                        │
├───────────────────────┬─────────────────────────────────────────┤
│  LEFT PANEL (30%)     │  RIGHT PANEL (70%)                      │
│  sticky, scrollable   │  scrollable                             │
│                       │                                         │
│  Appointment Details  │  Activity Timeline                      │
│  (always expanded)    │  (same buildActivities() steps)         │
│                       │                                         │
│  ▼ Basic Details      │                                         │
│  ▼ Insurance          │                                         │
│  ▼ Consent            │                                         │
│  ▼ Medical History    │                                         │
│  ▼ Social History     │                                         │
└───────────────────────┴─────────────────────────────────────────┘
```

---

## New Screen: `IntakePatientDetailScreen`

**File:** `src/screens/IntakePatientDetailScreen.tsx`

**Props:**
```typescript
interface IntakePatientDetailScreenProps {
  patient: PatientDetail        // same PatientDetail type from QuickViewDrawer.types.ts
  appointmentTime?: string
  appointmentType?: string
  formType?: string
  status?: string
  onBack: () => void
}
```

### Header
- Full-width bar: back arrow button (arrow_back Icon) + `"All activity of {patient.patient}"` as h3 text
- Uses the same header chrome pattern: `flex items-center gap-sm px-2xl py-xl border-b border-border`

### Left Panel (30% width)
- White card, full height, border-right
- **Appointment Details section** (always expanded, no toggle): renders the same fields as `QuickViewDrawer`'s Appointment accordion — appointment type, date/time, location, date of birth, insurance name, question
- **Collapsible accordions** (closed by default, same content as QuickViewDrawer):
  - Basic Details
  - Insurance
  - Consent
  - Medical History
  - Social History
- Accordion toggle: chevron icon, `text-h4 text-text-primary` header, `border-b border-border`

### Right Panel (70% width)
- Padded content area (`px-2xl py-xl`)
- Section title: `"Appointment booked"` as `text-h3 text-text-primary`, with the booked date as `text-small text-text-secondary`
- Activity timeline: reuse `buildActivities()` from `ViewActivityDrawer` + the same `ActivityRow` / `ActivityIcon` sub-components
  - Extract `buildActivities`, `ActivityRow`, `ActivityIcon` into a shared file `src/components/ViewActivityDrawer/activityUtils.tsx` so both the drawer and the detail page can import them

---

## Changes to Existing Files

### `src/components/ViewActivityDrawer/activityUtils.tsx` (new)
Extract from `ViewActivityDrawer.tsx`:
- `parseDate`, `fmt`, `buildActivities`, `ActivityIcon`, `ActivityRow`
- `ViewActivityDrawer.tsx` imports from this file (no behavior change)

### `src/screens/IntakeScreen.tsx`
- Add state: `const [detailRow, setDetailRow] = useState<IntakePatient | null>(null)`
- When `detailRow` is set, render `IntakePatientDetailScreen` instead of the table layout
- Add `"View details"` to `rowMenuItems`:
  ```typescript
  { label: 'View details', onClick: (row) => { const detail = PATIENT_DETAILS[row.patient] ?? {}; setDetailRow({ ...row, ...detail }) } }
  ```
- Keep existing "Quick view" and "View activity" items unchanged

### `src/App.tsx`
No changes needed — `IntakeScreen` handles its own sub-navigation via local state.

---

## Data Flow

`IntakeScreen` holds `detailRow: PatientDetail | null`. When set:
1. Renders `<IntakePatientDetailScreen patient={detailRow} onBack={() => setDetailRow(null)} ... />`
2. `onBack` clears `detailRow`, returning to the table

The `PatientDetail` object already contains all fields needed for both panels (appointment, basic, insurance, consent, medical, social). No new data fetching required.

---

## Verification

1. `npm run build` — zero TypeScript errors
2. `npm run dev` — navigate to Manage Intake
3. Hover a row → 3-dot menu → "View details" → full page opens
4. Left panel shows appointment details + all accordions (expand/collapse each)
5. Right panel shows correct activity steps for the row's status and dates
6. Back button returns to intake table
7. "View activity" drawer still works independently (no regression)
