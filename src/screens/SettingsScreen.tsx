import { useEffect, useState } from 'react'
import { Icon, TopNav } from '../components'
import iconQrCode from '../assets/icon-qr-code.svg'
import iconSetupStatus from '../assets/icon-setup-status.svg'
import iconMediaLibrary from '../assets/icon-media-library.svg'
import iconFaqs from '../assets/icon-faqs.svg'
import iconLinks from '../assets/icon-links.svg'
import iconFiles from '../assets/icon-files.svg'
import iconDashboard from '../assets/icon-dashboard.svg'
import iconEmailText from '../assets/icon-email-text.svg'
import iconGoogle from '../assets/icon-google.svg'
import iconFacebook from '../assets/icon-facebook.svg'
import iconInstagram from '../assets/icon-instagram.svg'
import iconTwitter from '../assets/icon-twitter.svg'
import iconLinkedin from '../assets/icon-linkedin.svg'
import iconYoutube from '../assets/icon-youtube.svg'
import iconAppfolio from '../assets/icon-appfolio.svg'
import iconAllApps from '../assets/icon-all-apps.svg'
import iconApi from '../assets/icon-api.svg'
import iconAi from '../assets/icon-ai.svg'
import iconResponseTemplates from '../assets/icon-response-templates.svg'
import iconAutoReplyRules from '../assets/icon-auto-reply-rules.svg'
import iconAutoShareRules from '../assets/icon-auto-share-rules.svg'
import iconCategories from '../assets/icon-categories.svg'
import iconKeywords from '../assets/icon-keywords.svg'
import iconManageCompetitors from '../assets/icon-manage-competitors.svg'
import iconWebWidgets from '../assets/icon-web-widgets.svg'
import iconPayments from '../assets/icon-payments.svg'
import iconUsers from '../assets/icon-users.svg'
import iconEmployees from '../assets/icon-employees.svg'
import iconSupport from '../assets/icon-support.svg'
import iconBilling from '../assets/icon-billing.svg'
import iconAppointments from '../assets/icon-appointments.svg'
import iconTeams from '../assets/icon-teams.svg'

interface SettingItem {
  icon: string
  iconSrc?: string
  label: string
  status?: string
  statusColor?: string
}

interface SettingsSection {
  id: string
  title: string
  titleBadge?: string
  description: string
  learnMore?: boolean
  items: SettingItem[]
}

const SETTINGS_NAV = [
  'Business info',
  'Knowledge',
  'Branding',
  'Integrations',
  'BirdAI',
  'Reviews',
  'Insights',
  'Competitors',
  'Widgets',
  'Payments',
  'Account',
]

const SECTIONS: SettingsSection[] = [
  {
    id: 'business-info',
    title: 'Business info',
    description: 'Add all your business locations and unlock the power of Birdeye.',
    learnMore: true,
    items: [
      { icon: 'near_me',   label: 'Business' },
      { icon: '', iconSrc: iconSetupStatus, label: 'Setup status' },
      { icon: '', iconSrc: iconQrCode, label: 'QR codes' },
    ],
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    description: 'One place to manage your AI ground truth across files, docs, images, and videos.',
    items: [
      { icon: '', iconSrc: iconMediaLibrary, label: 'Media library' },
      { icon: '', iconSrc: iconFaqs,  label: 'FAQs' },
      { icon: '', iconSrc: iconLinks, label: 'Links' },
      { icon: '', iconSrc: iconFiles, label: 'Files' },
    ],
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Customize business-specific branding like color themes and brand names.',
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconDashboard,  label: 'Dashboard appearance' },
      { icon: '', iconSrc: iconEmailText, label: 'Email and text' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect your social media pages to help promote brand content.',
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconGoogle,    label: 'Google',      status: '9 pages disconnected', statusColor: 'text-chip-danger-text' },
      { icon: '', iconSrc: iconFacebook,  label: 'Facebook',    status: 'Permission needed',    statusColor: 'text-chip-danger-text' },
      { icon: '', iconSrc: iconInstagram, label: 'Instagram',   status: '1 of 16 connected',    statusColor: 'text-accent-positive' },
      { icon: '', iconSrc: iconTwitter,   label: 'X (Twitter)', status: '1 page disconnected',  statusColor: 'text-chip-danger-text' },
      { icon: '', iconSrc: iconLinkedin,  label: 'LinkedIn',    status: '6 of 14 connected',    statusColor: 'text-accent-positive' },
      { icon: '', iconSrc: iconYoutube,   label: 'YouTube',     status: '6 of 14 connected',    statusColor: 'text-accent-positive' },
      { icon: '', iconSrc: iconAppfolio,  label: 'AppFolio',    status: '1 of 2 connected',     statusColor: 'text-accent-positive' },
      { icon: '', iconSrc: iconAllApps,   label: 'All apps' },
      { icon: '', iconSrc: iconApi,       label: 'API' },
    ],
  },
  {
    id: 'birdai',
    title: 'BirdAI',
    titleBadge: 'BETA',
    description: 'Optimize everyday tasks and boost your productivity with BirdAI.',
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconAi, label: 'Manage BirdAI' },
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Manage and cross-promote reviews on your social sites.',
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconResponseTemplates, label: 'Response templates' },
      { icon: '', iconSrc: iconAutoReplyRules,   label: 'Auto-reply rules' },
      { icon: '', iconSrc: iconAutoShareRules,   label: 'Auto-share rules' },
    ],
  },
  {
    id: 'insights',
    title: 'Insights',
    description: "Reveal meaningful and actionable insights via customers' feedback.",
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconCategories, label: 'Categories' },
      { icon: '', iconSrc: iconKeywords,  label: 'Keywords and adjectives' },
    ],
  },
  {
    id: 'competitors',
    title: 'Competitors',
    description: "Evaluate your competitors' strengths and weaknesses to reinforce your market strategy.",
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconManageCompetitors, label: 'Manage competitors' },
    ],
  },
  {
    id: 'widgets',
    title: 'Widgets',
    description: 'Manage and customize your web and appointment widgets.',
    items: [
      { icon: '', iconSrc: iconWebWidgets, label: 'Web widgets' },
      { icon: '', iconSrc: iconAppointments, label: 'Appointment widgets' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Get paid faster, improve customer satisfaction and track funds via Birdeye Payments.',
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconPayments, label: 'Set up payments' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account including users, employees, support and more.',
    learnMore: true,
    items: [
      { icon: '', iconSrc: iconUsers,     label: 'Users' },
      { icon: '', iconSrc: iconTeams,     label: 'Teams' },
      { icon: '', iconSrc: iconEmployees, label: 'Employees' },
      { icon: '', iconSrc: iconBilling,   label: 'Billing' },
      { icon: '', iconSrc: iconSupport,   label: 'Support' },
      { icon: 'language',                 label: 'Timezone' },
      { icon: 'grid_view',                label: 'Products' },
    ],
  },
]

export function SettingsScreen({ initialTab, onTabConsumed }: { initialTab?: string | null; onTabConsumed?: () => void }) {
  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState(initialTab ?? SETTINGS_NAV[0])

  useEffect(() => {
    if (!initialTab) return
    setActiveNav(initialTab)
    const sectionId = SECTIONS.find((s) => s.title === initialTab)?.id
    if (!sectionId) return
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    onTabConsumed?.()
  }, [initialTab, onTabConsumed])

  const filtered = query.trim()
    ? SECTIONS.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.items.some((item) => item.label.toLowerCase().includes(query.toLowerCase())),
      )
    : SECTIONS

  return (
    <div className="flex h-full">
      {/* Left settings nav — matches SideNav styling */}
      <aside className="flex h-full w-[222px] flex-col border-r border-border bg-surface-l2">
        <div className="flex h-[52px] shrink-0 flex-col justify-center px-lg">
          <h1 className="text-h3 text-text-primary">Settings</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-xs overflow-y-auto px-lg py-sm">
          {SETTINGS_NAV.map((item) => {
            const isActive = activeNav === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setActiveNav(item)
                  const sectionId = SECTIONS.find((s) => s.title === item)?.id
                  if (sectionId) {
                    const el = document.getElementById(sectionId)
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className={`flex h-7 w-full items-center rounded-sm px-sm py-[6px] text-left text-body font-light text-text-primary transition-colors ${
                  isActive ? 'bg-surface-selected' : 'hover:bg-surface-selected'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Right side — TopNav + content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav initials="S" />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Sticky search bar */}
          <div className="shrink-0 px-2xl pt-2xl pb-md" style={{ backgroundColor: '#F5F5F5' }}>
            <div className="flex items-center gap-sm rounded-sm border border-border bg-surface px-lg py-md">
              <Icon name="search" size={20} className="shrink-0 text-text-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search settings"
                className="flex-1 bg-transparent text-body text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>

          {/* Scrollable section cards */}
          <div className="flex-1 overflow-y-auto px-2xl pb-2xl" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="flex flex-col gap-md">
            {filtered.map((section) => (
              <div key={section.id} id={section.id} className="rounded-sm bg-surface">
                {/* Section header — 24px padding */}
                <div className="px-2xl pt-2xl">
                  <div className="flex items-center gap-sm">
                    <h3 className="text-h3 text-text-primary">{section.title}</h3>
                    {section.titleBadge && (
                      <span className="rounded-sm border border-border px-xs py-[1px] text-[10px] text-text-secondary">
                        {section.titleBadge}
                      </span>
                    )}
                  </div>
                  <p className="mt-xs text-body text-text-secondary">
                    {section.description}
                    {section.learnMore && (
                      <>{' '}<button type="button" className="text-text-action hover:underline">Learn more</button></>
                    )}
                  </p>
                </div>

                {/* Items — 3 col grid, each item 88px tall */}
                {section.items.length > 0 && (
                  <div className="grid grid-cols-3 px-2xl pb-2xl pt-lg">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="flex h-[88px] items-center gap-md rounded-sm px-sm text-left hover:bg-surface-hover"
                      >
                        {item.iconSrc
                          ? <img src={item.iconSrc} alt="" className="size-[22px] shrink-0 text-text-icon" />
                          : <Icon name={item.icon} size={22} className="shrink-0 text-text-icon" />
                        }
                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-center gap-sm">
                            <span className="text-body text-text-primary">{item.label}</span>
                            {item.status && (
                              <span className="flex shrink-0 items-center gap-xs text-small whitespace-nowrap text-[#8F8F8F]">
                                <span className={`inline-block size-[6px] shrink-0 rounded-full bg-current ${item.statusColor ?? 'text-accent-positive'}`} />
                                {item.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
