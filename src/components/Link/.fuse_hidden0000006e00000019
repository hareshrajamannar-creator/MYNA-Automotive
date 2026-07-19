import type { LinkAsAnchorProps, LinkAsButtonProps, LinkProps } from './Link.types'

const LINK_BASE =
  'text-text-action no-underline hover:no-underline hover:text-primary-hover'

export function Link(props: LinkProps) {
  const { className = '', children } = props
  const classes = [LINK_BASE, className].filter(Boolean).join(' ')

  if (props.as === 'button') {
    const { as: _as, ...buttonProps } = props as LinkAsButtonProps
    return (
      <button type="button" className={classes} {...buttonProps}>
        {children}
      </button>
    )
  }

  const { as: _as, ...anchorProps } = props as LinkAsAnchorProps
  return (
    <a className={classes} {...anchorProps}>
      {children}
    </a>
  )
}
