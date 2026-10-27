import { createServerFn } from '@tanstack/react-start'
import { describeCheckout, parseSelection, priceIdsFromEnv, type Selection } from './catalog'

function localeOf(value: unknown): 'en' | 'zh' | undefined {
  return value === 'zh' ? 'zh' : value === 'en' ? 'en' : undefined
}

export const shopCheckoutStatusFn = createServerFn({ method: 'GET' })
  .validator((d: { selection?: Partial<Selection> }) => d ?? {})
  .handler(async ({ data }) => {
    const { env } = await import('@/lib/env')
    const selection = parseSelection(data?.selection) ?? parseSelection(null)!
    return describeCheckout(env.STRIPE_SECRET_KEY, priceIdsFromEnv(env), selection)
  })

export const startShopCheckoutFn = createServerFn({ method: 'POST' })
  .validator((d: { selection: unknown; locale?: string }) => ({
    selection: d?.selection,
    locale: localeOf(d?.locale),
  }))
  .handler(async ({ data }) => {
    const { env } = await import('@/lib/env')
    const { createDb } = await import('@/db/client')
    const { readUser } = await import('@/features/auth/readUser.server')
    const { startShopCheckout } = await import('./orders.server')
    const { localizePath } = await import('@/features/i18n/locale')
    const user = await readUser()
    if (!user) return { ok: false as const, error: 'forbidden' as const }
    // Construct Stripe only after the key check. An empty secret makes the
    // SDK throw, which would turn the checkout button into a 500.
    if (!env.STRIPE_SECRET_KEY?.trim()) return { ok: false as const, error: 'not_configured' as const }
    const { createStripeProvider } = await import('@/features/billing/stripe')
    const origin = new URL(env.BETTER_AUTH_URL).origin
    const locale = data.locale
    return startShopCheckout(
      createDb(env.DB),
      createStripeProvider(env),
      user,
      data.selection,
      {
        successUrl: `${origin}${localizePath(locale ?? 'en', '/order/confirmation')}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}${localizePath(locale ?? 'en', '/checkout')}`,
      },
      env,
      Date.now(),
      locale,
    )
  })

export const confirmShopCheckoutFn = createServerFn({ method: 'POST' })
  .validator((d: { sessionId?: string }) => ({ sessionId: typeof d?.sessionId === 'string' ? d.sessionId : '' }))
  .handler(async ({ data }) => {
    const { env } = await import('@/lib/env')
    const { createDb } = await import('@/db/client')
    const { readUser } = await import('@/features/auth/readUser.server')
    const { createStripeProvider } = await import('@/features/billing/stripe')
    const { confirmShopCheckout } = await import('./orders.server')
    const user = await readUser()
    if (!user) return { ok: false as const, error: 'forbidden' as const }
    if (!data.sessionId) return { ok: false as const, error: 'not_found' as const }
    if (!env.STRIPE_SECRET_KEY?.trim()) return { ok: false as const, error: 'not_configured' as const }
    return confirmShopCheckout(
      createDb(env.DB),
      createStripeProvider(env),
      user.id,
      data.sessionId,
      Date.now(),
      new URL(env.BETTER_AUTH_URL).origin,
    )
  })

export const listMyShopFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { env } = await import('@/lib/env')
  const { createDb } = await import('@/db/client')
  const { readUser } = await import('@/features/auth/readUser.server')
  const { listShopForUser } = await import('./orders.server')
  const user = await readUser()
  if (!user) return { orders: [], subscriptions: [] }
  return listShopForUser(createDb(env.DB), user.id)
})

export const manageShopSubscriptionFn = createServerFn({ method: 'POST' })
  .validator((d: { action?: string; subscriptionId?: string; frequencyMonths?: number }) => ({
    action: d?.action,
    subscriptionId: typeof d?.subscriptionId === 'string' ? d.subscriptionId : '',
    frequencyMonths: d?.frequencyMonths,
  }))
  .handler(async ({ data }) => {
    const action = data.action
    if (action !== 'cancel' && action !== 'resume' && action !== 'skip' && action !== 'set_frequency') {
      return { ok: false as const, error: 'invalid' as const }
    }
    const { env } = await import('@/lib/env')
    const { createDb } = await import('@/db/client')
    const { readUser } = await import('@/features/auth/readUser.server')
    const { manageShopSubscriptionForUser } = await import('./orders.server')
    const user = await readUser()
    if (!user) return { ok: false as const, error: 'forbidden' as const }
    if (!env.STRIPE_SECRET_KEY?.trim()) return { ok: false as const, error: 'not_configured' as const }
    const { createStripeProvider } = await import('@/features/billing/stripe')
    return manageShopSubscriptionForUser(
      createDb(env.DB),
      createStripeProvider(env),
      user.id,
      { action, subscriptionId: data.subscriptionId, frequencyMonths: data.frequencyMonths },
      env,
      Date.now(),
    )
  })

export const openShopPortalFn = createServerFn({ method: 'POST' })
  .validator((d: { locale?: string }) => ({ locale: localeOf(d?.locale) }))
  .handler(async ({ data }) => {
    const { env } = await import('@/lib/env')
    const { createDb } = await import('@/db/client')
    const { readUser } = await import('@/features/auth/readUser.server')
    const { createStripeProvider } = await import('@/features/billing/stripe')
    const { openShopPortal } = await import('./orders.server')
    const { localizePath } = await import('@/features/i18n/locale')
    const user = await readUser()
    if (!user) return { ok: false as const, error: 'forbidden' as const }
    if (!env.STRIPE_SECRET_KEY?.trim()) return { ok: false as const, error: 'not_configured' as const }
    const origin = new URL(env.BETTER_AUTH_URL).origin
    return openShopPortal(
      createDb(env.DB),
      createStripeProvider(env),
      user.id,
      `${origin}${localizePath(data.locale ?? 'en', '/app/orders')}`,
    )
  })

export const adminShopFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { env } = await import('@/lib/env')
  const { createDb } = await import('@/db/client')
  const { assertAdmin } = await import('@/features/admin/assert-admin.server')
  const { listShopForAdmin } = await import('./orders.server')
  await assertAdmin()
  return listShopForAdmin(createDb(env.DB))
})
