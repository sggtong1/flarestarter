import { useState } from 'react'
import { createFileRoute, getRouteApi, useRouter } from '@tanstack/react-router'
import { requireUser } from '@/features/auth/middleware'
import { useTranslation } from '@/features/i18n/provider'
import { AppShell } from '@/components/app/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatMoney } from '@/features/shop/catalog'
import { listMyShopFn, manageShopSubscriptionFn, openShopPortalFn } from '@/features/shop/actions'
import type { ShopSubscriptionView } from '@/features/shop/orders.server'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/{-$locale}/app/orders')({
  head: () => ({ meta: [{ title: 'Orders' }, { name: 'robots', content: 'noindex' }] }),
  loader: async ({ params }) => {
    const user = await requireUser({ data: { locale: (params as { locale?: string }).locale } })
    const shop = await listMyShopFn()
    return { user, shop }
  },
  component: OrdersPage,
})

function day(ms: number | null): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function OrdersPage() {
  const { user, shop } = Route.useLoaderData()
  const { preview } = rootRoute.useLoaderData()
  const { t, locale } = useTranslation()
  const unavailable = preview ? t('shop.previewCheckout') : t('shop.notConfigured')
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function manage(id: string, action: 'cancel' | 'resume' | 'skip' | 'set_frequency', frequencyMonths?: number) {
    setBusy(id + action)
    setMessage(null)
    const result = await manageShopSubscriptionFn({ data: { action, subscriptionId: id, frequencyMonths } })
    setBusy(null)
    if (!result.ok) {
      setMessage(
        result.error === 'already_skipped' ? t('shop.alreadySkipped')
        : result.error === 'not_configured' ? unavailable
        : t('shop.manageFailed'),
      )
      return
    }
    await router.invalidate()
  }

  async function portal() {
    setMessage(null)
    const result = await openShopPortalFn({ data: { locale } })
    if (!result.ok) {
      setMessage(result.error === 'not_configured' ? unavailable : t('shop.manageFailed'))
      return
    }
    window.location.assign(result.url)
  }

  return (
    <AppShell user={user} active="orders" crumb={t('shop.navOrders')}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-h">{t('shop.ordersTitle')}</h1>
          <p className="mt-1.5 text-[14.5px] text-fg-2">{t('shop.ordersSub')}</p>
        </div>
        <Button variant="outline" onClick={() => void portal()}>{t('shop.portal')}</Button>
      </div>
      {message && <p className="mb-4 text-sm text-destructive">{message}</p>}

      <h2 className="mb-3 text-base font-semibold">{t('shop.subsTitle')}</h2>
      {shop.subscriptions.length === 0 ? (
        <p className="mb-8 text-sm text-fg-2">{t('shop.subsEmpty')}</p>
      ) : (
        <div className="mb-8 grid gap-3">
          {shop.subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              busy={busy}
              onManage={manage}
            />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-base font-semibold">{t('shop.ordersTitle')}</h2>
      {shop.orders.length === 0 ? (
        <p className="text-sm text-fg-2">{t('shop.ordersEmpty')}</p>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg-3">
                <th className="px-4 py-2">{t('shop.when')}</th>
                <th className="px-4 py-2">{t('shop.summary')}</th>
                <th className="px-4 py-2">{t('shop.total')}</th>
                <th className="px-4 py-2">{t('shop.status')}</th>
              </tr>
            </thead>
            <tbody>
              {shop.orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap">{day(order.createdAt)}</td>
                  <td className="px-4 py-3">{order.summary}</td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(order.totalCents, order.currency)}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AppShell>
  )
}

function SubscriptionCard({
  sub,
  busy,
  onManage,
}: {
  sub: ShopSubscriptionView
  busy: string | null
  onManage: (id: string, action: 'cancel' | 'resume' | 'skip' | 'set_frequency', frequencyMonths?: number) => Promise<void>
}) {
  const { t } = useTranslation()
  const [frequency, setFrequency] = useState(String(sub.frequencyMonths))
  const unit = sub.frequencyMonths === 1 ? t('shop.month') : t('shop.months')
  const paused = sub.pauseResumesAt != null && sub.pauseResumesAt > Date.now()
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{t('shop.everyN', { n: sub.frequencyMonths, unit })} · × {sub.quantity}</p>
        <p className="text-sm capitalize text-fg-2">{sub.status}{sub.cancelAtPeriodEnd ? ` · ${t('shop.canceling')}` : ''}</p>
      </div>
      <p className="mt-1 text-sm text-fg-3">
        {t('shop.when')}: {day(sub.currentPeriodEnd)}
        {paused && ` · ${t('shop.skippedUntil', { date: day(sub.pauseResumesAt) })}`}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-sm text-fg-2" htmlFor={`cadence-${sub.id}`}>{t('shop.cadence')}</label>
        <select
          id={`cadence-${sub.id}`}
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="1">{t('shop.month1')}</option>
          <option value="2">{t('shop.monthN', { n: 2 })}</option>
          <option value="3">{t('shop.monthN', { n: 3 })}</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          disabled={busy !== null || frequency === String(sub.frequencyMonths)}
          onClick={() => void onManage(sub.id, 'set_frequency', Number(frequency))}
        >
          {t('shop.saveFrequency')}
        </Button>
        <Button variant="outline" size="sm" disabled={busy !== null || paused || sub.status === 'canceled'} onClick={() => void onManage(sub.id, 'skip')}>
          {t('shop.skip')}
        </Button>
        {sub.cancelAtPeriodEnd ? (
          <Button size="sm" disabled={busy !== null} onClick={() => void onManage(sub.id, 'resume')}>{t('shop.keep')}</Button>
        ) : (
          <Button variant="outline" size="sm" disabled={busy !== null || sub.status === 'canceled'} onClick={() => void onManage(sub.id, 'cancel')}>
            {t('shop.cancel')}
          </Button>
        )}
      </div>
    </Card>
  )
}
