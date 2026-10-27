import type { CSSProperties, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import '../storefront.css'
import { productConfig } from '@/features/shop/product.config'
import { useTranslation } from '@/features/i18n/provider'

export function brandStyle(): CSSProperties {
  const c = productConfig.colors
  return {
    colorScheme: 'light',
    background: c.paper,
    color: c.ink,
    ['--background' as string]: c.paper,
    ['--foreground' as string]: c.ink,
    ['--card' as string]: c.card,
    ['--bg-alt' as string]: c.paperDeep,
    ['--primary' as string]: c.accent,
    ['--primary-hover' as string]: c.accentHover,
    ['--primary-foreground' as string]: c.accentInk,
    ['--fg-2' as string]: c.muted,
    ['--fg-3' as string]: c.mutedSoft,
    ['--border' as string]: c.line,
    ['--border-strong' as string]: c.lineStrong,
    ['--soft' as string]: c.accentSoft,
    ['--ring' as string]: c.accent,
    ['--clay' as string]: c.clay,
  }
}

export function ShopMark({ compact = false }: { compact?: boolean }) {
  const { brand, colors } = productConfig
  return (
    <span className="inline-flex items-center gap-2.5 font-display font-semibold tracking-tight" style={{ color: 'inherit' }}>
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
        style={{ background: colors.accent, color: colors.accentInk }}
        aria-hidden="true"
      >
        {brand.mark}
      </span>
      {!compact && <span>{brand.name}</span>}
    </span>
  )
}

export function StoreShell({
  loggedIn,
  children,
  showBanner = true,
}: {
  loggedIn: boolean
  children: ReactNode
  showBanner?: boolean
}) {
  const { t } = useTranslation()
  const c = productConfig
  return (
    <div className="nd-root min-h-screen font-display" style={brandStyle()}>
      {showBanner && c.product.previewBanner && (
        <p className="px-4 py-2 text-center text-[13px] leading-snug" style={{ background: c.colors.ink, color: c.colors.paper }}>
          {c.product.previewBanner}
        </p>
      )}
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--background) 88%, transparent)' }}>
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Link to="/{-$locale}" aria-label={c.brand.name} className="shrink-0">
            <ShopMark />
          </Link>
          <div className="hidden items-center gap-5 text-sm md:flex" style={{ color: 'var(--fg-2)' }}>
            <Link to="/{-$locale}" hash="how">{t('shop.navHow')}</Link>
            <Link to="/{-$locale}" hash="spaces">{t('shop.navSpaces')}</Link>
            <Link to="/{-$locale}" hash="specs">{t('shop.navSpecs')}</Link>
            <Link to="/{-$locale}" hash="faq">{t('shop.navFaq')}</Link>
          </div>
          <div className="flex-1" />
          {loggedIn ? (
            <Link to="/{-$locale}/app/orders" className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>
              {t('shop.navOrders')}
            </Link>
          ) : (
            <Link to="/{-$locale}/login" search={{ next: '/checkout?offer=bundle&every=2' }} className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>
              {t('auth.login')}
            </Link>
          )}
          <Link to="/{-$locale}" hash="buy" className="nd-press rounded-full px-4 py-2 text-sm font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {t('shop.buy')}
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t px-4 py-10 md:px-6" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <ShopMark />
            <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{c.brand.tagline}</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--fg-3)' }}>{c.product.name}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm" style={{ color: 'var(--fg-2)' }}>
            <Link to="/{-$locale}" hash="faq">{t('shop.navFaq')}</Link>
            <Link to="/{-$locale}/privacy">{t('marketing.footerPrivacy')}</Link>
            <Link to="/{-$locale}/terms">{t('marketing.footerTerms')}</Link>
            <a href="/docs">{t('marketing.navDocs')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
