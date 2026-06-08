import { useState } from 'react'
import { Icon, IconRail, SideNav, TopNav, type NavSection, type RailGroup } from './components'
import { IntakeScreen, type IntakeDetailArgs } from './screens/IntakeScreen'
import { IntakePatientDetailScreen } from './screens/IntakePatientDetailScreen'
import { ReviewWaitlistScreen } from './screens/ReviewWaitlistScreen'
import { AgentDetailScreen } from './screens/AgentDetailScreen'
import { WorkflowEditorScreen } from './screens/WorkflowEditorScreen'
import { ProceduresScreen } from './screens/ProceduresScreen'
import { ManageAppointmentsScreen } from './screens/ManageAppointmentsScreen'
import { IntakeOutcomeScreen } from './screens/IntakeOutcomeScreen'
import logoSrc from './assets/birdeye-logo.svg'
import iconMarketing from './assets/icon-marketing.svg'
import iconAgents from './assets/icon-agents.svg'

const RAIL_GROUPS: RailGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Overview', icon: 'home' },
      { id: 'agents', label: 'Agents', icon: iconAgents, kind: 'image', badge: 'New' },
    ],
  },
  {
    id: 'marketing',
    header: 'Marketing',
    items: [
      { id: 'search', label: 'Search AI', icon: 'lightbulb' },
      { id: 'listings', label: 'Listings AI', icon: 'location_on' },
      { id: 'reviews', label: 'Reviews AI', icon: 'grade' },
      { id: 'social', label: 'Social AI', icon: 'workspaces' },
      { id: 'referral', label: 'Referral', icon: 'featured_seasonal_and_gifts' },
      { id: 'marketing-automation', label: 'Marketing Automation AI', icon: iconMarketing, kind: 'image' },
    ],
  },
  {
    id: 'operations',
    header: 'Operations',
    items: [
      { id: 'inbox', label: 'Inbox', icon: 'sms' },
      { id: 'frontdesk', label: 'Frontdesk', icon: 'desktop_windows' },
    ],
  },
  {
    id: 'cx',
    header: 'Customer experience',
    items: [
      { id: 'surveys', label: 'Surveys AI', icon: 'assignment_turned_in' },
      { id: 'ticketing', label: 'Ticketing', icon: 'shapes' },
      { id: 'insights', label: 'Insights AI', icon: 'emoji_objects' },
    ],
  },
  {
    id: 'footer',
    items: [
      { id: 'reports', label: 'Reports', icon: 'pie_chart' },
      { id: 'patients', label: 'Patients', icon: 'group' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'human-actions',
    label: 'Human actions',
    defaultExpanded: true,
    items: [
      { id: 'manage-appointments', label: 'Manage appointments' },
      { id: 'review-waitlist',     label: 'Review waitlist'     },
      { id: 'manage-intake',       label: 'Manage intake'       },
    ],
  },
  {
    id: 'agent',
    label: 'Agents',
    defaultExpanded: false,
    items: [
      { id: 'frontdesk-agent', label: 'Frontdesk agent' },
      { id: 'waitlist-agent',  label: 'Waitlist agent'  },
      { id: 'reminder-agent',  label: 'Reminder agent'  },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    defaultExpanded: false,
    items: [
      { id: 'frontdesk-overview',  label: 'Frontdesk overview'  },
      { id: 'no-shows-prevented',  label: 'No shows prevented'  },
      { id: 'waitlist-filled',     label: 'Waitlist filled'     },
      { id: 'intakes-completed',   label: 'Intakes completed'   },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    defaultExpanded: false,
    items: [
      { id: 'knowledge-base',     label: 'Knowledge base'     },
      { id: 'procedure-library',  label: 'Procedures'         },
      { id: 'phone-number',       label: 'Phone number'       },
      { id: 'web-widget',         label: 'Web widget'         },
      { id: 'appointment-widget', label: 'Appointment widget' },
      { id: 'providers',          label: 'Providers'          },
    ],
  },
]

const AGENT_NAMES: Record<string, string> = {
  'frontdesk-agent': 'Frontdesk agent',
  'waitlist-agent':  'Waitlist agent',
  'reminder-agent':  'Reminder agent',
}

export function App() {
  const [railActive, setRailActive] = useState('frontdesk')
  const [navActive, setNavActive] = useState('manage-appointments')
  const [editingAgentName, setEditingAgentName] = useState<string | null>(null)
  const [intakeDetail, setIntakeDetail] = useState<IntakeDetailArgs | null>(null)

  const isEditingWorkflow = editingAgentName !== null
  const isViewingDetail = intakeDetail !== null

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-text-primary">
      <IconRail
        logoSrc={logoSrc}
        brand="Birdeye"
        groups={RAIL_GROUPS}
        activeId={railActive}
        onSelect={setRailActive}
      />
      {!isEditingWorkflow && !isViewingDetail && (
        <SideNav
          title="Frontdesk"
          sections={NAV_SECTIONS}
          activeId={navActive}
          onSelect={setNavActive}
        />
      )}
      <main className="flex flex-1 flex-col overflow-hidden">
        {isEditingWorkflow ? (
          <>
            <TopNav title="Front desk" initials="S" />
            <div className="flex-1 overflow-hidden">
              <WorkflowEditorScreen
                agentName={editingAgentName}
                onClose={() => setEditingAgentName(null)}
              />
            </div>
          </>
        ) : navActive === 'manage-appointments' ? (
          <ManageAppointmentsScreen />
        ) : navActive === 'manage-intake' && isViewingDetail ? (
          <>
            <TopNav title="Front desk" initials="S" />
            <div className="flex shrink-0 items-center gap-xs border-b border-border px-2xl py-md">
              <button
                onClick={() => setIntakeDetail(null)}
                className="text-body text-text-action hover:underline"
              >
                Patients
              </button>
              <Icon name="chevron_right" size={16} className="text-text-icon" />
              <span className="text-body text-text-primary">{intakeDetail!.detail.patient}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <IntakePatientDetailScreen
                patient={intakeDetail!.detail}
                appointmentTime={intakeDetail!.appointmentTime}
                appointmentType={intakeDetail!.appointmentType}
                formType={intakeDetail!.row.formType}
                status={intakeDetail!.detail.status}
                bookedOn={intakeDetail!.row.bookedOn}
                insuranceProvider={intakeDetail!.insuranceProvider}
                sentVia={intakeDetail!.row.sentVia}
                onBack={() => setIntakeDetail(null)}
              />
            </div>
          </>
        ) : navActive === 'manage-intake' ? (
          <IntakeScreen onViewDetail={setIntakeDetail} />
        ) : navActive === 'review-waitlist' ? (
          <ReviewWaitlistScreen />
        ) : navActive === 'intakes-completed' ? (
          <IntakeOutcomeScreen />
        ) : navActive === 'procedure-library' ? (
          <ProceduresScreen />
        ) : AGENT_NAMES[navActive] ? (
          <AgentDetailScreen
            key={navActive}
            agentName={AGENT_NAMES[navActive]}
            onEditAgent={setEditingAgentName}
          />
        ) : (
          <ManageAppointmentsScreen />
        )}
      </main>
    </div>
  )
}
