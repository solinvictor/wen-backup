import type { CategoryMeta } from '@/lib/categories'

export function CategoryChip({
  category,
  active,
  onClick,
  href,
}: {
  category: CategoryMeta
  active?: boolean
  onClick?: () => void
  href?: string
}) {
  const { label, Icon, tint } = category

  const content = (
    <>
      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>
    </>
  )

  const classes = `inline-flex items-center gap-2 shrink-0 pl-1 pr-4 py-1 rounded-full border transition-all ${
    active
      ? 'border-soil bg-soil text-white'
      : 'border-soil/12 bg-white text-soil hover:border-soil/25'
  }`

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
