import { useState } from 'react'
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { useTranslation } from '@/features/i18n/provider'
import { shopCheckoutStatusFn, startShopCheckoutFn } from '@/features/shop/actions'
import { productConfig } from '@/features/shop/product.config'
import { coerceSearchNumber, selectionFromSearch, type Selection } from '@/features/shop/catalog'
import { BuyBox } from '@/features/shop/components/buy-box'
import { StoreShell } from '@/features/shop/components/store-shell'

const rootRoute = getRouteApi('__root__')

interface CheckoutSearch {
  offer?: string
  every?: number
  qty?: number
  pack?: number
}

export const Route = createFileRoute('/{-$locale}/checkout')({
  validateSearch: (s: Record<string, unknown>): CheckoutSearch => ({
    offer: typeof s.offer === 'string' ? s.offer : undefined,
    every: coerceSearchNumber(s.every),
    qty: coerceSearchNumber(s.qty),
    pack: coerceSearchNumber(s.pack),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const selection = selectionFromSearch(deps)
    const status = await shopCheckoutStatusFn({ data: { selection } })
    return { status }
  },
  head: () => ({
    meta: [
      { title: `Checkout · ${productConfig.product.name}` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: CheckoutPage,
})

function CheckoutPage() {
  const search = Route.useSearch()
  const { status } = Route.useLoaderData()
  const { user, preview } = rootRoute.useLoaderData()
  const { t, locale } = useTranslation()
  const [selection, setSelection] = useState<Selection>(() => selectionFromSearch(search))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const next = `/checkout?offer=${selection.kind}&every=${selection.frequencyMonths}&qty=${selection.quantity}&pack=${selection.packSize}`

  async function placeOrder() {
    setBusy(true)
    setError(null)
    const result = await startShopCheckoutFn({ data: { selection, locale } })
    setBusy(false)
    if (!result.ok) {
      setError(result.error === 'not_configured' ? (preview ? t('shop.previewCheckout') : t('shop.notConfigured')) : t('shop.manageFailed'))
      return
    }
    window.location.assign(result.url)
  }

  return (
    <StoreShell loggedIn={!!user}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t('shop.checkoutTitle')}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{t('shop.checkoutSub')}</p>
          <div className="mt-6">
            <BuyBox selection={selection} onChange={setSelection} busy={busy} />
          </div>
        </div>
        <aside className="h-fit rounded-3xl border p-5 md:sticky md:top-[calc(6rem+var(--preview-banner-h,0px))]" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">{productConfig.product.name}</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            {t('shop.shippingNote', {
              shipping: productConfig.shipping.priceLabel,
              returns: productConfig.shipping.returnsDays,
            })}
          </p>
          {status.mode === 'test' && (
            <p className="mt-4 rounded-xl px-3 py-2 text-sm" style={{ background: 'var(--soft)' }}>{t('shop.testMode')}</p>
          )}
          {status.inlinePrices && status.configured && (
            <p className="mt-3 text-sm" style={{ color: 'var(--fg-2)' }}>{t('shop.inlinePrices')}</p>
          )}
          {!status.configured && (
            <p className="mt-4 rounded-xl px-3 py-2 text-sm" role="status" style={{ background: 'var(--bg-alt)' }}>
              {preview ? t('shop.previewCheckout') : t('shop.notConfigured')}
            </p>
          )}
          {user ? (
            <>
              <p className="mt-4 text-sm" style={{ color: 'var(--fg-2)' }}>{t('shop.signedInAs', { email: user.email })}</p>
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              <button
                type="button"
                className={buttonVariants({ size: 'lg', className: 'mt-4 w-full' })}
                disabled={busy || !status.configured}
                onClick={() => void placeOrder()}
              >
                {t('shop.placeOrder')}
              </button>
            </>
          ) : (
            <div className="mt-5 grid gap-2">
              <Link to="/{-$locale}/login" search={{ next }} className={buttonVariants({ size: 'lg', className: 'w-full' })}>
                {t('shop.signInToBuy')}
              </Link>
              <Link to="/{-$locale}/register" search={{ next }} className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full' })}>
                {t('shop.createAccount')}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </StoreShell>
  )
}
