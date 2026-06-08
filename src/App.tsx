import { useState } from 'react'
import { ProcedureStoreProvider } from './data/ProcedureStoreContext'
import { IconRail, SideNav, TopNav, type NavSection, type RailGroup, type Product } from './components'
import { ManageAppointmentsScreen } from './screens/ManageAppointmentsScreen'
import { SalesPipelineScreen } from './screens/SalesPipelineScreen'
import { ServiceRequestsScreen } from './screens/ServiceRequestsScreen'
import { ManageIntakeScreen } from './screens/ManageIntakeScreen'
import { AppointmentOverviewScreen } from './screens/AppointmentOverviewScreen'
import { SalesScreen } from './screens/SalesScreen'
import { ServiceScreen } from './screens/ServiceScreen'
function EmptyResourceScreen({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />
      <div className="flex flex-1 items-center justify-center text-body text-text-secondary">
        No {label.toLowerCase()} data yet.
      </div>
    </div>
  )
}
import { AgentDetailScreen } from './screens/AgentDetailScreen'
import { WorkflowEditorScreen } from './screens/WorkflowEditorScreen'
import { ProceduresScreen } from './screens/ProceduresScreen'
import { ReviewWaitlistScreen } from './screens/ReviewWaitlistScreen'
import { InboxScreen } from './screens/InboxScreen'
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

const AUTOMOTIVE_NAV_SECTIONS: NavSection[] = [
  {
    id: 'human-actions',
    label: 'Human actions',
    defaultExpanded: true,
    items: [
      { id: 'manage-appointments', label: 'Manage appointments' },
      { id: 'sales-pipeline',      label: 'Sales pipeline'      },
      { id: 'service-requests',    label: 'Service requests'    },
    ],
  },
  {
    id: 'agent',
    label: 'Agents',
    defaultExpanded: true,
    items: [
      { id: 'frontdesk-agent', label: 'Frontdesk agent' },
      { id: 'reminder-agent',  label: 'Reminder agent'  },
      { id: 'outreach-agent',  label: 'Outreach agent'  },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    defaultExpanded: true,
    items: [
      { id: 'conversations', label: 'Appointment overview' },
      { id: 'sales',         label: 'Sales'                },
      { id: 'service',       label: 'Service'              },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    defaultExpanded: true,
    items: [
      { id: 'providers',         label: 'Providers'  },
      { id: 'procedure-library', label: 'Procedures' },
      { id: 'widgets',           label: 'Widgets'    },
    ],
  },
]

const HEALTHCARE_NAV_SECTIONS: NavSection[] = [
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
    defaultExpanded: true,
    items: [
      { id: 'frontdesk-agent',              label: 'Frontdesk agent'             },
      { id: 'appointment-agent',            label: 'Appointment agent'           },
      { id: 'insurance-verification-agent', label: 'Insurance verification agent'},
      { id: 'waitlist-agent',               label: 'Waitlist agent'              },
      { id: 'pre-visit-agent',              label: 'Pre-visit agent'             },
      { id: 'reminder-agent',               label: 'Reminder agent'              },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    defaultExpanded: true,
    items: [
      { id: 'hc-frontdesk-overview', label: 'Frontdesk overview' },
      { id: 'hc-no-shows',           label: 'No shows prevented' },
      { id: 'hc-waitlist',           label: 'Waitlist filled'    },
      { id: 'hc-intakes',            label: 'Intakes completed'  },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    defaultExpanded: true,
    items: [
      { id: 'knowledge-base',    label: 'Knowledge base',      external: true },
      { id: 'procedure-library', label: 'Procedures'           },
      { id: 'phone-number',      label: 'Phone number'         },
      { id: 'web-widget',        label: 'Web widget'           },
      { id: 'appointment-widget',label: 'Appointment widget'   },
      { id: 'providers',         label: 'Providers'            },
      { id: 'forms',             label: 'Forms'                },
    ],
  },
]

const DENTAL_NAV_SECTIONS: NavSection[] = [
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
    defaultExpanded: true,
    items: [
      { id: 'frontdesk-agent',             label: 'Frontdesk agent'             },
      { id: 'appointment-agent',           label: 'Appointment agent'           },
      { id: 'insurance-verification-agent',label: 'Insurance verification agent'},
      { id: 'waitlist-agent',              label: 'Waitlist agent'              },
      { id: 'pre-visit-agent',             label: 'Pre-visit agent'             },
      { id: 'reminder-agent',              label: 'Reminder agent'              },
      { id: 'recall-agent',                label: 'Recall agent'                },
      { id: 'revenue-agent',               label: 'Revenue agent'               },
      { id: 'treatment-plan-agent',        label: 'Treatment plan agent'        },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    defaultExpanded: true,
    items: [
      { id: 'dental-frontdesk-overview', label: 'Frontdesk overview'   },
      { id: 'dental-no-shows',           label: 'No shows prevented'   },
      { id: 'dental-waitlist',           label: 'Waitlist filled'       },
      { id: 'dental-intakes',            label: 'Intakes completed'     },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    defaultExpanded: true,
    items: [
      { id: 'providers',         label: 'Providers'  },
      { id: 'procedure-library', label: 'Procedures' },
    ],
  },
]

const NAV_SECTIONS_BY_PRODUCT: Record<string, NavSection[]> = {
  automotive: AUTOMOTIVE_NAV_SECTIONS,
  healthcare:  HEALTHCARE_NAV_SECTIONS,
  dental:      DENTAL_NAV_SECTIONS,
}

const DEFAULT_NAV_BY_PRODUCT: Record<string, string> = {
  automotive: 'manage-appointments',
  healthcare:  'manage-appointment',
  dental:      'manage-appointments',
}

const PRODUCTS: Product[] = [
  { id: 'healthcare', label: 'Birdeye Healthcare' },
  { id: 'dental',     label: 'Birdeye Dental'     },
  { id: 'automotive', label: 'Birdeye Automotive'  },
]

const PRODUCT_BRAND: Record<string, string> = {
  healthcare: 'Birdeye Healthcare',
  dental:     'Birdeye Dental',
  automotive: 'Birdeye Automotive',
}

const AGENT_NAMES: Record<string, string> = {
  'frontdesk-agent': 'Frontdesk agent',
  'reminder-agent':  'Reminder agent',
  'outreach-agent':  'Outreach agent',
}

export function App() {
  const [railActive, setRailActive] = useState('frontdesk')
  const [navActive, setNavActive] = useState('manage-appointment')
  const [editingAgentName, setEditingAgentName] = useState<string | null>(null)
  const [activeProduct, setActiveProduct] = useState('automotive')

  function handleProductChange(id: string) {
    setActiveProduct(id)
    setNavActive(DEFAULT_NAV_BY_PRODUCT[id] ?? 'manage-appointments')
    setEditingAgentName(null)
  }

  const isEditingWorkflow = editingAgentName !== null

  return (
    <ProcedureStoreProvider>
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-text-primary">
      <IconRail
        logoSrc={logoSrc}
        brand={PRODUCT_BRAND[activeProduct]}
        groups={RAIL_GROUPS}
        activeId={railActive}
        onSelect={setRailActive}
        products={PRODUCTS}
        activeProduct={activeProduct}
        onProductChange={handleProductChange}
      />
      {!isEditingWorkflow && railActive !== 'inbox' && (
        <SideNav
          title="Frontdesk"
          sections={NAV_SECTIONS_BY_PRODUCT[activeProduct] ?? AUTOMOTIVE_NAV_SECTIONS}
          activeId={navActive}
          onSelect={setNavActive}
        />
      )}
      <main className="flex flex-1 flex-col overflow-hidden">
        {railActive === 'inbox' ? (
          <InboxScreen />
        ) : isEditingWorkflow ? (
          <>
            <TopNav title="Front desk" initials="S" />
            <div className="flex-1 overflow-hidden">
              <WorkflowEditorScreen
                agentName={editingAgentName}
                onClose={() => setEditingAgentName(null)}
                product={activeProduct}
              />
            </div>
          </>
        ) : navActive === 'review-waitlist' ? (
          <ReviewWaitlistScreen />
        ) : navActive === 'sales-pipeline' ? (
          <SalesPipelineScreen />
        ) : navActive === 'manage-intake' ? (
          <ManageIntakeScreen />
        ) : navActive === 'service-requests' ? (
          <ServiceRequestsScreen />
        ) : navActive === 'conversations' ? (
          <AppointmentOverviewScreen />
        ) : navActive === 'sales' ? (
          <SalesScreen />
        ) : navActive === 'service' ? (
          <ServiceScreen />
        ) : navActive === 'procedure-library' ? (
          <ProceduresScreen product={activeProduct} />
        ) : navActive === 'knowledge-base' ? (
          <EmptyResourceScreen label="Knowledge base" />
        ) : navActive === 'widgets' ? (
          <EmptyResourceScreen label="Widgets" />
        ) : navActive === 'phone-number' ? (
          <EmptyResourceScreen label="Phone number" />
        ) : navActive === 'voices' ? (
          <EmptyResourceScreen label="Voices" />
        ) : AGENT_NAMES[navActive] ? (
          <AgentDetailScreen
            key={navActive}
            agentName={AGENT_NAMES[navActive]}
            onEditAgent={setEditingAgentName}
            product={activeProduct}
          />
        ) : (
          <ManageAppointmentsScreen />
        )}
      </main>
    </div>
    </ProcedureStoreProvider>
  )
}
