import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '@/features/auth/auth.client'
import { AppShell } from '@/components/app/app-shell'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/features/i18n/provider'
import { formatMoney } from '@/features/shop/catalog'
import { adminShopFn } from '@/features/shop/actions'

export const Route = createFileRoute('/{-$locale}/admin/orders')({
  loader: () => adminShopFn(),
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: AdminOrders,
})

function when(ms: number | null): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function AdminOrders() {
  const { orders, subscriptions } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const { t } = useTranslation()
  return (
    <AppShell
      user={{ name: session?.user?.name, email: session?.user?.email ?? '', role: session?.user?.role ?? 'admin', image: session?.user?.image ?? null }}
      active="admin-orders"
      crumb={t('shop.adminOrders')}
    >
      <h1 className="text-xl font-semibold">{t('shop.adminOrders')} ({orders.length})</h1>
      <p className="mt-1.5 text-[14.5px] text-fg-2">{t('shop.adminOrdersSub')}</p>
      <Card className="mt-4 overflow-x-auto p-0">
        {orders.length === 0 ? (
          <p className="p-4 text-sm text-fg-2">{t('shop.emptyAdmin')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg-3">
                <th className="px-4 py-2">{t('shop.when')}</th>
                <th className="px-4 py-2">{t('shop.customer')}</th>
                <th className="px-4 py-2">{t('shop.summary')}</th>
                <th className="px-4 py-2">{t('shop.total')}</th>
                <th className="px-4 py-2">{t('shop.status')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap">{when(order.createdAt)}</td>
                  <td className="px-4 py-3">{order.email}</td>
                  <td className="px-4 py-3">{order.summary}</td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(order.totalCents, order.currency)}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <h2 className="mt-8 text-lg font-semibold">{t('shop.adminSubs')} ({subscriptions.length})</h2>
      <Card className="mt-4 overflow-x-auto p-0">
        {subscriptions.length === 0 ? (
          <p className="p-4 text-sm text-fg-2">{t('shop.subsEmpty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg-3">
                <th className="px-4 py-2">{t('shop.cadence')}</th>
                <th className="px-4 py-2">{t('shop.qty')}</th>
                <th className="px-4 py-2">{t('shop.status')}</th>
                <th className="px-4 py-2">{t('shop.when')}</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-t border-border">
                  <td className="px-4 py-3">{t('shop.everyN', { n: sub.frequencyMonths, unit: sub.frequencyMonths === 1 ? t('shop.month') : t('shop.months') })}</td>
                  <td className="px-4 py-3">{sub.quantity}</td>
                  <td className="px-4 py-3 capitalize">{sub.status}{sub.cancelAtPeriodEnd ? ' · canceling' : ''}</td>
                  <td className="px-4 py-3">{when(sub.currentPeriodEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppShell>
  )
}
