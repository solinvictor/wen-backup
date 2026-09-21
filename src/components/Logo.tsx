import Image from 'next/image'
import Link from 'next/link'

// Source image is 1280x431 (aspect ~2.97:1). We size by height and let width follow.
const RATIO = 1280 / 431

type LogoProps = {
  /** Rendered height in px. Width is derived from the logo's aspect ratio. */
  height?: number
  /** Optional larger height from the `sm` breakpoint (640px) up. */
  smHeight?: number
  className?: string
  /** Link target. Pass null to render the bare image with no link. */
  href?: string | null
  onClick?: () => void
}

/**
 * WEN wordmark. The artwork is navy + green, so only use it on LIGHT
 * backgrounds. On dark sections (footer, admin sidebar) the navy letters vanish.
 */
export function Logo({ height = 28, smHeight, className = '', href = '/', onClick }: LogoProps) {
  const img = (
    <Image
      src="/brand/wen-logo.png"
      alt="WEN"
      width={Math.round(height * RATIO)}
      height={height}
      loading="eager"
      className="logo-img"
      style={{
        width: 'auto',
        maxWidth: 'none',
        ['--logo-h' as string]: `${height}px`,
        ['--logo-h-sm' as string]: `${smHeight ?? height}px`,
      }}
    />
  )

  if (href === null) return <span className={`inline-flex items-center ${className}`}>{img}</span>

  return (
    <Link href={href} onClick={onClick} className={`inline-flex items-center ${className}`} aria-label="WEN home">
      {img}
    </Link>
  )
}
