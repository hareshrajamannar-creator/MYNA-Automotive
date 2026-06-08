import { useEffect, useState } from 'react'
import { Icon } from '../Icon/Icon'
import { BackArrowIcon } from '../../assets/BackArrowIcon'
import { SelectMenu } from '../SelectMenu/SelectMenu'
import { FormDrawerProps } from './FormDrawer.types'

export function FormDrawer({
  open,
  title,
  subtitle,
  fields,
  submitLabel,
  requiredKeys,
  initialValues,
  onClose,
  onSubmit,
}: FormDrawerProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [openField, setOpenField] = useState<string | null>(null)
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? {})
      setOpenField(null)
    }
  }, [open, initialValues])

  const required = requiredKeys ?? fields.map((f) => f.key)
  const canSubmit = required.every((k) => !!values[k])

  function openMenu(key: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (openField === key) {
      setOpenField(null)
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    setAnchor({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpenField(key)
  }

  const activeField = fields.find((f) => f.key === openField && f.type === 'select')

  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-[650px] max-w-[92vw] flex-col bg-surface shadow-dropdown transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-2xl pb-lg pt-2xl">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              aria-label="Back"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-sm text-text-icon hover:bg-surface-hover"
            >
              <BackArrowIcon />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[16px] leading-6 tracking-[-0.32px] text-text-primary">{title}</h2>
              {subtitle && <span className="text-small text-text-secondary">{subtitle}</span>}
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm px-md py-xs text-body font-medium text-text-action hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => onSubmit(values)}
              className={`rounded-sm px-lg py-[7px] text-body font-medium transition-colors ${
                canSubmit
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'cursor-not-allowed bg-surface-selected text-text-tertiary'
              }`}
            >
              {submitLabel}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-1 flex-col gap-md overflow-y-auto px-2xl pb-2xl pt-md">
          {fields.map((field) => {
            const value = values[field.key] ?? ''
            return (
              <div key={field.key} className="flex flex-col gap-xs">
                <label className="text-small text-text-primary">{field.label}</label>
                {field.type === 'text' ? (
                  <input
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder ?? 'Enter input'}
                    className="h-9 w-full rounded-sm border border-border-selected bg-surface px-md text-body text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => openMenu(field.key, e)}
                    className={`flex h-9 w-full items-center gap-sm rounded-sm border bg-surface pl-md pr-sm hover:bg-surface-l2 ${
                      openField === field.key ? 'border-primary' : 'border-border-selected'
                    }`}
                  >
                    <span className={`min-w-0 flex-1 truncate text-left text-body ${value ? 'text-text-primary' : 'text-text-tertiary'}`}>
                      {value || field.placeholder || 'Select'}
                    </span>
                    <Icon name="expand_more" size={20} className="shrink-0 text-text-icon" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* Select menu */}
      {activeField && anchor && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setOpenField(null)} />
          <div className="fixed z-[110]" style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
            <SelectMenu
              options={(activeField.options ?? []).map((o) => ({ value: o, label: o }))}
              value={values[activeField.key] ? [values[activeField.key]] : []}
              searchable={(activeField.options ?? []).length > 6}
              onChange={(val) => {
                setValues((v) => ({ ...v, [activeField.key]: val[0] ?? '' }))
                setOpenField(null)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
