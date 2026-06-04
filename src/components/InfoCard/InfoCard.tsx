export interface InfoCardProps {
  title: string
  description: string
  /** Hover CTA label (revealed on hover). */
  actionLabel?: string
  onAction?: () => void
}

export function InfoCard({ title, description, actionLabel = 'Use agent', onAction }: InfoCardProps) {
  return (
    <div className="group flex h-full min-h-[216px] flex-col rounded-md border border-border bg-surface p-lg transition-colors hover:bg-surface-hover">
      <h3 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">{title}</h3>
      <p className="mt-sm flex-1 text-body text-text-secondary">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-lg self-start rounded-sm bg-primary px-lg py-[7px] text-body font-medium text-white opacity-0 transition-opacity hover:bg-primary-hover group-hover:opacity-100"
      >
        {actionLabel}
      </button>
    </div>
  )
}
