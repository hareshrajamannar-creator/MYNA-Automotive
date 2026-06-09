import { useState } from 'react'
import { BackArrowIcon } from '../assets/BackArrowIcon'
import { Icon, TopNav } from '../components'

interface NewFrontdeskAgentSetupScreenProps {
  onBack: () => void
  onCancel: () => void
  onComplete?: (agentName: string) => void
}

const STEPS = [
  { id: 1, label: 'Configure channels' },
  { id: 2, label: 'Select procedures' },
  { id: 3, label: 'Select integrations' },
  { id: 4, label: 'Review summary' },
] as const

const PROGRESS_BY_STEP: Record<number, number> = {
  1: 17,
  2: 50,
  3: 75,
  4: 100,
}

const CHANNELS = [
  { id: 'voice', label: 'Voice call', icon: 'call' },
  { id: 'webchat', label: 'Web chat', icon: 'chat' },
  { id: 'text', label: 'Text', icon: 'sms' },
] as const

type ChannelId = (typeof CHANNELS)[number]['id']

const INPUT_CLASS =
  'h-9 w-full rounded-sm border border-border-input bg-surface px-md text-body text-text-primary focus:border-primary focus:outline-none'

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-lg">
      {STEPS.map((step) => {
        const isActive = step.id === currentStep
        const isComplete = step.id < currentStep
        return (
          <div key={step.id} className="flex items-center gap-md">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-small ${
                isActive
                  ? 'bg-primary text-white'
                  : isComplete
                    ? 'bg-surface-selected text-text-secondary'
                    : 'bg-surface-selected text-text-tertiary'
              }`}
            >
              {step.id}
            </span>
            <span
              className={`text-body ${
                isActive ? 'text-text-primary' : 'text-text-tertiary'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ChannelCard({
  label,
  icon,
  selected,
  onToggle,
}: {
  label: string
  icon: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-1 items-center gap-md rounded-sm border px-lg py-md transition-colors ${
        selected
          ? 'border-primary bg-surface-selected'
          : 'border-border-selected bg-surface hover:bg-surface-l2'
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-sm border ${
          selected ? 'border-primary bg-primary text-white' : 'border-border-selected bg-surface'
        }`}
      >
        {selected && <Icon name="check" size={14} />}
      </span>
      <Icon name={icon} size={20} className="text-text-icon" />
      <span className="text-body text-text-primary">{label}</span>
    </button>
  )
}

function ConfigureChannelsStep({
  agentName,
  onAgentNameChange,
  selectedChannels,
  onToggleChannel,
}: {
  agentName: string
  onAgentNameChange: (value: string) => void
  selectedChannels: Set<ChannelId>
  onToggleChannel: (id: ChannelId) => void
}) {
  return (
    <div className="flex max-w-[640px] flex-col gap-xl">
      <div>
        <h2 className="text-h3 text-text-primary">Getting started</h2>
        <p className="mt-xs text-body text-text-secondary">
          Name your agent and choose the channels it will serve
        </p>
      </div>

      <div className="flex flex-col gap-sm">
        <label className="text-body text-text-primary">Agent name</label>
        <input
          type="text"
          value={agentName}
          onChange={(e) => onAgentNameChange(e.target.value)}
          className={INPUT_CLASS}
        />
        <p className="text-small text-text-secondary">
          This is the name your agent uses when greeting patients
        </p>
      </div>

      <div className="flex flex-col gap-md">
        <div>
          <p className="text-body text-text-primary">Channels</p>
          <p className="mt-xs text-body text-text-secondary">
            Choose the channels this agent should handle
          </p>
        </div>
        <div className="flex gap-md">
          {CHANNELS.map((channel) => (
            <ChannelCard
              key={channel.id}
              label={channel.label}
              icon={channel.icon}
              selected={selectedChannels.has(channel.id)}
              onToggle={() => onToggleChannel(channel.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PlaceholderStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex max-w-[640px] flex-col gap-sm">
      <h2 className="text-h3 text-text-primary">{title}</h2>
      <p className="text-body text-text-secondary">{description}</p>
    </div>
  )
}

export function NewFrontdeskAgentSetupScreen({
  onBack,
  onCancel,
  onComplete,
}: NewFrontdeskAgentSetupScreenProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [agentName, setAgentName] = useState('Myna')
  const [selectedChannels, setSelectedChannels] = useState<Set<ChannelId>>(new Set())

  const toggleChannel = (id: ChannelId) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1)
      return
    }
    onComplete?.(agentName.trim() || 'New frontdesk agent')
  }

  const progress = PROGRESS_BY_STEP[currentStep] ?? 0

  return (
    <div className="flex h-full flex-col">
      <TopNav initials="S" />

      <div className="flex h-16 shrink-0 items-center justify-between bg-surface px-2xl">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
          >
            <BackArrowIcon />
          </button>
          <h1 className="text-h3 text-text-primary">New front desk agent</h1>
        </div>
        <div className="flex items-center gap-md">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm px-md py-xs text-body text-text-action hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-9 items-center rounded-sm bg-primary px-lg text-body text-white transition-colors hover:bg-primary-hover"
          >
            {currentStep === STEPS.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden px-2xl pb-2xl pt-lg">
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-sm border border-border bg-surface">
          <aside className="flex w-[280px] shrink-0 flex-col border-r border-border px-xl py-xl">
            <div className="mb-xl">
              <h2 className="text-body text-text-primary">Agent setup</h2>
              <p className="mt-xs text-small text-text-secondary">
                Configure channels, procedures, and tools
              </p>
            </div>

            <StepIndicator currentStep={currentStep} />

            <div className="mt-auto pt-xl">
              <div className="mb-sm flex items-center justify-between text-small text-text-secondary">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-selected">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </aside>

          <div className="flex-1 overflow-auto px-2xl py-xl">
            {currentStep === 1 && (
              <ConfigureChannelsStep
                agentName={agentName}
                onAgentNameChange={setAgentName}
                selectedChannels={selectedChannels}
                onToggleChannel={toggleChannel}
              />
            )}
            {currentStep === 2 && (
              <PlaceholderStep
                title="Select procedures"
                description="Choose the procedures this agent will use to handle patient conversations."
              />
            )}
            {currentStep === 3 && (
              <PlaceholderStep
                title="Select integrations"
                description="Connect the tools and systems this agent needs to operate."
              />
            )}
            {currentStep === 4 && (
              <PlaceholderStep
                title="Review summary"
                description="Review your agent configuration before creating it."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
