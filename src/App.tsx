import { useState } from 'react'
import { IconRail, SideNav, type NavSection, type RailGroup } from './components'
import { ManageAppointmentsScreen } from './screens/ManageAppointmentsScreen'
import { SalesPipelineScreen } from './screens/SalesPipelineScreen'
import { ServiceRequestsScreen } from './screens/ServiceRequestsScreen'
// import { ConversationsScreen } from './screens/ConversationsScreen'
import { AppointmentOverviewScreen } from './screens/AppointmentOverviewScreen'
import { SalesScreen } from './screens/SalesScreen'
import logoSrc from './assets/birdeye-logo.svg'
import iconMarketing from './assets/icon-marketing.svg'
import iconAgents from './assets/icon-agents.svg'

// L1 rail — exact groups, order, icons and dividers from Figma
// (Material Symbols + brand SVGs). Sections are split by dividers; the
// rail collapses to 56px and expands to show labels/headers on hover.
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
      { id: 'sales-pipeline', label: 'Sales pipeline' },
      { id: 'service-requests', label: 'Service requests' },
    ],
  },
  {
    id: 'agent',
    label: 'Agent',
    defaultExpanded: false,
    items: [
      { id: 'dealership-agent', label: 'Dealership agent' },
      { id: 'bdc-agent', label: 'BDC agent' },
      { id: 'journey-agent', label: 'Journey agent' },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    defaultExpanded: false,
    items: [
      { id: 'conversations', label: 'Appointment overview' },
      { id: 'sales', label: 'Sales' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    defaultExpanded: false,
    items: [{ id: 'knowledge-base', label: 'Knowledge base' }],
  },
  {
    id: 'settings',
    label: 'Settings',
    defaultExpanded: false,
    items: [
      { id: 'widgets', label: 'Widgets' },
      { id: 'phone-number', label: 'Phone number' },
      { id: 'voices', label: 'Voices' },
    ],
  },
]

export function App() {
  const [railActive, setRailActive] = useState('frontdesk')
  const [navActive, setNavActive] = useState('manage-appointments')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-text-primary">
      <IconRail
        logoSrc={logoSrc}
        brand="Birdeye"
        groups={RAIL_GROUPS}
        activeId={railActive}
        onSelect={setRailActive}
      />
      <SideNav
        title="Frontdesk"
        sections={NAV_SECTIONS}
        activeId={navActive}
        onSelect={setNavActive}
      />
      <main className="flex-1 overflow-hidden">
        {navActive === 'sales-pipeline' ? (
          <SalesPipelineScreen />
        ) : navActive === 'service-requests' ? (
          <ServiceRequestsScreen />
        ) : navActive === 'conversations' ? (
          <AppointmentOverviewScreen />
        ) : navActive === 'sales' ? (
          <SalesScreen />
        ) : (
          <ManageAppointmentsScreen />
        )}
      </main>
    </div>
  )
}
