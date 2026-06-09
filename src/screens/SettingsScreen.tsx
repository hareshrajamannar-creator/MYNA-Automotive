import { useEffect, useState } from 'react'
import { Icon, TopNav } from '../components'

interface SettingItem {
  icon: string
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
      { icon: 'settings',  label: 'Setup status' },
      { icon: 'qr_code_2', label: 'QR codes' },
    ],
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    description: 'One place to manage your AI ground truth across files, docs, images, and videos.',
    items: [
      { icon: 'perm_media',  label: 'Media library' },
      { icon: 'menu_book',   label: 'FAQs' },
      { icon: 'link',        label: 'Links' },
      { icon: 'description', label: 'Files' },
    ],
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Customize business-specific branding like color themes and brand names.',
    learnMore: true,
    items: [
      { icon: 'grid_view', label: 'Dashboard appearance' },
      { icon: 'mail',      label: 'Email and text' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect your social media pages to help promote brand content.',
    learnMore: true,
    items: [
      { icon: 'g_mobiledata',  label: 'Google',      status: '9 pages disconnected', statusColor: 'text-chip-danger-text' },
      { icon: 'facebook',      label: 'Facebook',    status: 'Permission needed',    statusColor: 'text-chip-danger-text' },
      { icon: 'photo_camera',  label: 'Instagram',   status: '1 of 16 connected',    statusColor: 'text-success' },
      { icon: 'close',         label: 'X (Twitter)', status: '1 page disconnected',  statusColor: 'text-chip-danger-text' },
      { icon: 'work',          label: 'LinkedIn',    status: '6 of 14 connected',    statusColor: 'text-success' },
      { icon: 'play_circle',   label: 'YouTube',     status: '6 of 14 connected',    statusColor: 'text-success' },
      { icon: 'apartment',     label: 'AppFolio',    status: '1 of 2 connected',     statusColor: 'text-success' },
      { icon: 'apps',          label: 'All apps' },
      { icon: 'hub',           label: 'API' },
    ],
  },
  {
    id: 'birdai',
    title: 'BirdAI',
    titleBadge: 'BETA',
    description: 'Optimize everyday tasks and boost your productivity with BirdAI.',
    learnMore: true,
    items: [
      { icon: 'auto_awesome', label: 'Manage BirdAI' },
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Manage and cross-promote reviews on your social sites.',
    learnMore: true,
    items: [
      { icon: 'content_paste',     label: 'Response templates' },
      { icon: 'playlist_add_check', label: 'Auto-reply rules' },
      { icon: 'slideshow',         label: 'Auto-share rules' },
    ],
  },
  {
    id: 'insights',
    title: 'Insights',
    description: "Reveal meaningful and actionable insights via customers' feedback.",
    learnMore: true,
    items: [
      { icon: 'lightbulb',   label: 'Categories' },
      { icon: 'text_fields', label: 'Keywords and adjectives' },
    ],
  },
  {
    id: 'competitors',
    title: 'Competitors',
    description: "Evaluate your competitors' strengths and weaknesses to reinforce your market strategy.",
    learnMore: true,
    items: [
      { icon: 'store', label: 'Manage competitors' },
    ],
  },
  {
    id: 'widgets',
    title: 'Widgets',
    description: 'Manage and customize your web and appointment widgets.',
    items: [
      { icon: 'chat',  label: 'Web widgets' },
      { icon: 'calendar_today',  label: 'Appointment widgets' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Get paid faster, improve customer satisfaction and track funds via Birdeye Payments.',
    learnMore: true,
    items: [
      { icon: 'payments', label: 'Set up payments' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account including users, employees, support and more.',
    learnMore: true,
    items: [
      { icon: 'person',          label: 'Users' },
      { icon: 'badge',           label: 'Employees' },
      { icon: 'support_agent',   label: 'Support' },
      { icon: 'admin_panel_settings', label: 'Roles & permissions' },
      { icon: 'security',        label: 'Security' },
      { icon: 'receipt_long',    label: 'Billing' },
      { icon: 'history',         label: 'Audit log' },
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
          <div className="shrink-0 bg-surface px-2xl pt-2xl pb-md">
            <div className="flex items-center gap-sm rounded-sm border border-border px-lg py-md">
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
          <div className="flex-1 overflow-y-auto px-2xl pb-2xl">
          <div className="flex flex-col gap-md">
            {filtered.map((section) => (
              <div key={section.id} id={section.id} className="rounded-sm border border-border bg-surface">
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
                        <Icon name={item.icon} size={22} className="shrink-0 text-text-icon" />
                        <div className="flex flex-col">
                          <span className="text-body text-text-primary">{item.label}</span>
                          {item.status && (
                            <span className={`flex items-center gap-xs text-small ${item.statusColor ?? 'text-text-secondary'}`}>
                              <span className="inline-block size-[6px] rounded-full bg-current" />
                              {item.status}
                            </span>
                          )}
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
