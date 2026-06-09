import { useState } from 'react'
import { Icon } from '../components'
import aiIconSrc from '../assets/ai-icon.svg'

interface PatientDetailScreenProps {
  patientName: string
  onBack?: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface AccordionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  children?: React.ReactNode
  showEdit?: boolean
}

function Accordion({ title, expanded, onToggle, children, showEdit }: AccordionProps) {
  return (
    <div className="border-t border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-md text-left"
      >
        <span className="text-body text-text-primary">{title}</span>
        <span className="flex items-center gap-xs">
          {expanded && showEdit && (
            <span
              className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name="edit" size={16} />
            </span>
          )}
          <span className="flex size-7 items-center justify-center rounded-sm text-text-icon">
            <Icon name={expanded ? 'expand_less' : 'expand_more'} size={18} />
          </span>
        </span>
      </button>
      {expanded && children}
    </div>
  )
}

interface ActivityItem {
  id: string
  icon: string
  iconBg: string
  title: string
  subtitle?: string
  link?: string
  date: string
}

export function PatientDetailScreen({ patientName, onBack }: PatientDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('all-activity')
  const [basicExpanded, setBasicExpanded] = useState(true)
  const [commExpanded, setCommExpanded] = useState(false)
  const [customExpanded, setCustomExpanded] = useState(false)
  const [systemExpanded, setSystemExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)

  const tabs = [
    { id: 'all-activity', label: 'All activity' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'communication', label: 'Communication' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'intelligence', label: 'Intelligence', hasAi: true },
  ]

  const activities: ActivityItem[] = [
    {
      id: '1',
      icon: 'grade',
      iconBg: 'bg-amber-100 text-amber-600',
      title: `${patientName} wrote a 4-star review`,
      link: 'Show details ↓',
      date: 'Mar 20, 2025',
    },
    {
      id: '2',
      icon: 'check_circle',
      iconBg: 'bg-green-100 text-green-600',
      title: `${patientName} completed the follow-up appointment`,
      subtitle: 'Amount $300',
      date: 'Mar 18, 2025',
    },
    {
      id: '3',
      icon: 'calendar_today',
      iconBg: 'bg-blue-100 text-blue-600',
      title: `${patientName} booked an appointment for 'Tooth extraction'`,
      subtitle: 'Scheduled date: Mar 28, 2025 • Scheduled time: 2:00 PM • Amount $1200',
      date: 'Mar 15, 2025',
    },
    {
      id: '4',
      icon: 'grade',
      iconBg: 'bg-amber-100 text-amber-600',
      title: `${patientName} wrote a 4-star review`,
      link: 'Show details ↓',
      date: 'Mar 12, 2025',
    },
    {
      id: '5',
      icon: 'calendar_today',
      iconBg: 'bg-blue-100 text-blue-600',
      title: `${patientName} booked a follow-up appointment`,
      subtitle: 'Scheduled date: Mar 28, 2025 • Scheduled time: 2:00 PM • Amount $200',
      date: 'Mar 10, 2025',
    },
    {
      id: '6',
      icon: 'send',
      iconBg: 'bg-purple-100 text-purple-600',
      title: `${patientName} responded to Customer Satisfaction Survey with a score of 8/10`,
      link: 'Show details',
      date: 'Mar 5, 2025',
    },
    {
      id: '7',
      icon: 'grade',
      iconBg: 'bg-amber-100 text-amber-600',
      title: `${patientName} wrote a 4-star review`,
      link: 'Show details ↓',
      date: 'Feb 28, 2025',
    },
    {
      id: '8',
      icon: 'close',
      iconBg: 'bg-red-100 text-red-500',
      title: `No-show for an appointment for 'Tooth cleaning'`,
      subtitle: 'Amount $500',
      date: 'Feb 20, 2025',
    },
    {
      id: '9',
      icon: 'send',
      iconBg: 'bg-purple-100 text-purple-600',
      title: `${patientName} responded to Customer Feedback Survey with a score of 5/10`,
      link: 'Show details',
      date: 'Feb 10, 2025',
    },
    {
      id: '10',
      icon: 'send',
      iconBg: 'bg-purple-100 text-purple-600',
      title: `CX Survey has been sent to ${patientName}`,
      date: 'Feb 1, 2025',
    },
  ]

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Left sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col overflow-y-auto border-r border-border bg-white px-lg py-xl">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-sm">
          <div
            className="flex size-20 items-center justify-center rounded-full text-xl"
            style={{ backgroundColor: '#c8e6c9', color: '#2e7d32' }}
          >
            {getInitials(patientName)}
          </div>
          <span className="text-lg text-text-primary">{patientName}</span>
        </div>

        {/* Action buttons */}
        <div className="mt-md flex items-center justify-center gap-xs">
          {(['send', 'chat', 'mail', 'whatsapp', 'more_vert'] as const).map((icon) => (
            <button
              key={icon}
              className="flex size-8 items-center justify-center rounded-sm border border-border-selected text-text-icon hover:bg-surface-l2"
            >
              <Icon name={icon} size={16} />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-lg border-t border-border" />

        {/* Basic details accordion */}
        <Accordion
          title="Basic details"
          expanded={basicExpanded}
          onToggle={() => setBasicExpanded((v) => !v)}
          showEdit
        >
          <div className="flex flex-col gap-sm pb-md">
            {[
              { label: 'Email', value: 'john.doe@gmail.com' },
              { label: 'Phone', value: '+1 (555) 123-4567' },
              { label: 'WhatsApp', value: '+1 (555) 123-4567' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-small text-text-secondary">{label}</div>
                <div className="text-body text-text-primary">{value}</div>
              </div>
            ))}
            {/* Experience score */}
            <div>
              <div className="text-small text-text-secondary">Experience score</div>
              <div className="mt-xs inline-flex items-center rounded-sm bg-red-100 px-sm py-xs text-small text-red-700">
                4
              </div>
            </div>
            {[
              { label: 'Location', value: 'San Francisco, +2 more' },
              { label: 'Contact type', value: 'Converted lead' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-small text-text-secondary">{label}</div>
                <div className="text-body text-text-primary">{value}</div>
              </div>
            ))}
            {/* Lists */}
            <div>
              <div className="text-small text-text-secondary">Lists</div>
              <button className="text-body text-primary hover:underline">Add to list</button>
            </div>
            {[
              { label: 'Segments', value: 'Diabetes patients' },
              { label: 'Last activity', value: '4 hours ago' },
              { label: 'Created on', value: 'Mar 15, 2024' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-small text-text-secondary">{label}</div>
                <div className="text-body text-text-primary">{value}</div>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion
          title="Communication preferences"
          expanded={commExpanded}
          onToggle={() => setCommExpanded((v) => !v)}
        />
        <Accordion
          title="Custom fields"
          expanded={customExpanded}
          onToggle={() => setCustomExpanded((v) => !v)}
        />
        <Accordion
          title="System fields"
          expanded={systemExpanded}
          onToggle={() => setSystemExpanded((v) => !v)}
        />
        <Accordion
          title="Tags"
          expanded={tagsExpanded}
          onToggle={() => setTagsExpanded((v) => !v)}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Breadcrumb */}
        <div className="px-2xl pt-lg">
          <div className="flex items-center gap-xs text-body">
            <button className="text-primary hover:underline" onClick={onBack}>
              Patients
            </button>
            <span className="text-text-secondary">&gt;</span>
            <span className="text-text-primary">{patientName}</span>
          </div>
        </div>

        {/* AI banner */}
        <div
          className="mx-2xl mt-lg flex items-center justify-between rounded-sm border px-lg py-md"
          style={{ borderColor: '#c5b3f5', backgroundColor: '#faf8ff' }}
        >
          <div className="flex items-center gap-sm">
            <img src={aiIconSrc} alt="AI" className="size-5" />
            <span className="text-body text-text-primary">
              Get insights and actions for {patientName}
            </span>
          </div>
          <button
            className="rounded-sm px-lg py-sm text-body text-white"
            style={{ backgroundColor: '#6834b7' }}
          >
            Generate summary
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-lg border-b border-border px-2xl">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex items-center gap-xs border-b-2 px-md py-sm text-body transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.hasAi && (
                  <img src={aiIconSrc} alt="" style={{ width: 14, height: 14 }} />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 border-b border-border px-2xl py-lg">
          {[
            { value: 'Mar 15, 2024', label: 'Created on' },
            { value: '50', label: 'Campaigns sent' },
            { value: '$4.0K', label: 'Total revenue' },
            { value: 'Mar 20, 2025', label: 'Last activity' },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col gap-xs ${i < 3 ? 'border-r border-border pr-lg' : ''} ${i > 0 ? 'pl-lg' : ''}`}
            >
              <span className="text-h3 text-text-primary">{value}</span>
              <span className="text-small text-text-secondary">{label}</span>
            </div>
          ))}
        </div>

        {/* Search + filter row */}
        <div className="flex items-center gap-sm px-2xl py-md">
          <input
            type="text"
            placeholder="Search activity…"
            className="h-9 flex-1 rounded-sm border border-border px-md text-body text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
          />
          <select className="h-9 rounded-sm border border-border px-md text-body text-text-primary">
            <option>All time</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <select className="h-9 rounded-sm border border-border px-md text-body text-text-primary">
            <option>All entities</option>
            <option>Appointments</option>
            <option>Reviews</option>
            <option>Surveys</option>
          </select>
        </div>

        {/* Activity feed */}
        <div className="px-2xl pb-2xl">
          <div className="relative flex flex-col">
            {/* Vertical connector line */}
            <div className="absolute bottom-8 left-4 top-8 w-px bg-border" />
            {activities.map((item) => (
              <div key={item.id} className="relative flex items-start gap-md py-sm">
                {/* Icon circle */}
                <div
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  <Icon name={item.icon} size={16} />
                </div>
                {/* Content */}
                <div className="flex flex-1 items-start justify-between gap-md">
                  <div>
                    <div className="text-body text-text-primary">{item.title}</div>
                    {item.subtitle && (
                      <div className="mt-xs text-small text-text-secondary">{item.subtitle}</div>
                    )}
                    {item.link && (
                      <button className="mt-xs text-small text-primary hover:underline">
                        {item.link}
                      </button>
                    )}
                  </div>
                  <span className="shrink-0 text-small text-text-secondary">{item.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Show more */}
          <button className="mt-md rounded-sm border border-border px-lg py-sm text-body text-text-primary hover:bg-surface-hover">
            Show more
          </button>
        </div>
      </div>
    </div>
  )
}
