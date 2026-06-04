import { TabsProps } from './Tabs.types'

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-end gap-xs">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-stretch"
          >
            <span
              className={`flex h-9 items-center gap-xs rounded-sm px-sm text-body font-medium transition-colors ${
                active ? 'text-primary' : 'text-text-secondary hover:bg-surface-selected'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-[6px] py-px text-small font-medium leading-[18px] ${
                    active ? 'bg-primary text-white' : 'bg-surface-selected text-text-secondary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            <span className={`h-[2px] w-full ${active ? 'bg-primary' : 'bg-transparent'}`} />
          </button>
        )
      })}
    </div>
  )
}
