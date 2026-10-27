import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { useTranslation } from '@/features/i18n/provider'
import { confirmShopCheckoutFn } from '@/features/shop/actions'
import { formatMoney } from '@/features/shop/catalog'
import { productConfig } from '@/features/shop/product.config'
import { StoreShell } from '@/features/shop/components/store-shell'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/{-$locale}/order/confirmation')({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === 'string' ? s.session_id : '',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => confirmShopCheckoutFn({ data: { sessionId: deps.session_id } }),
  head: () => ({
    meta: [
      { title: `Order · ${productConfig.product.name}` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: ConfirmationPage,
})

function ConfirmationPage() {
  const result = Route.useLoaderData()
  const { session_id } = Route.useSearch()
  const { user } = rootRoute.useLoaderData()
  const { t } = useTranslation()
  const paid = result.ok && result.state === 'paid'
  return (
    <StoreShell loggedIn={!!user} showBanner={false}>
      <div className="mx-auto max-w-xl px-4 py-16 md:py-24">
        <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{productConfig.product.name}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          {paid ? t('shop.confirmationTitle') : result.ok ? t('shop.confirmationPending') : t('shop.confirmationMissing')}
        </h1>
        {result.ok && result.order && (
          <>
            <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--fg-2)' }}>
              {t('shop.confirmationBody', { email: result.order.email })}
            </p>
            <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <p className="text-sm" style={{ color: 'var(--fg-2)' }}>{result.order.summary}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(result.order.totalCents, result.order.currency)}</p>
              <p className="mt-2 text-sm capitalize" style={{ color: 'var(--fg-3)' }}>{result.order.status}</p>
            </div>
          </>
        )}
        {!result.ok && result.error === 'forbidden' && (
          <Link to="/{-$locale}/login" search={{ next: `/order/confirmation?session_id=${session_id}` }} className={buttonVariants({ size: 'lg', className: 'mt-8' })}>
            {t('shop.signInToBuy')}
          </Link>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/{-$locale}/app/orders" className={buttonVariants({ size: 'lg' })}>{t('shop.viewOrders')}</Link>
          <Link to="/{-$locale}" className={buttonVariants({ size: 'lg', variant: 'outline' })}>{t('shop.backHome')}</Link>
        </div>
      </div>
    </StoreShell>
  )
}
