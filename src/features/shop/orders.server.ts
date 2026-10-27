import { and, desc, eq, isNull } from 'drizzle-orm'
import type Stripe from 'stripe'
import type { DB } from '@/db/client'
import { subscription } from '@/features/billing/billing.schema'
import type { PaymentProvider } from '@/features/billing/payment'
import { localizePath, type Locale } from '@/features/i18n/locale'
import {
  buildCheckout,
  formatMoney,
  parseSelection,
  priceIdsFromEnv,
  quoteSummary,
  type ShopPriceEnv,
} from './catalog'
import { isShopStripeEvent, shopMetadata } from './events'
import { isShopPurpose } from './purpose'
import { shopOrder, shopSubscription, type ShopOrder, type ShopSubscriptionRow } from './shop.schema'

export interface ShopOrderView {
  id: string
  email: string
  status: string
  kind: string
  quantity: number
  frequencyMonths: number | null
  packSize: number | null
  currency: string
  totalCents: number
  summary: string
  createdAt: number
  paidAt: number | null
}

export interface ShopSubscriptionView {
  id: string
  status: string
  frequencyMonths: number
  quantity: number
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: number | null
  pauseResumesAt: number | null
  createdAt: number
}

type ShopError = 'not_configured' | 'invalid_selection' | 'not_found' | 'forbidden' | 'stripe' | 'already_skipped' | 'invalid'

function ms(value: Date | number | null | undefined): number | null {
  if (value == null) return null
  return value instanceof Date ? value.getTime() : value
}

function orderView(row: ShopOrder): ShopOrderView {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    kind: row.kind,
    quantity: row.quantity,
    frequencyMonths: row.frequencyMonths,
    packSize: row.packSize,
    currency: row.currency,
    totalCents: row.totalCents,
    summary: row.summary,
    createdAt: ms(row.createdAt) ?? 0,
    paidAt: row.paidAt,
  }
}

function subView(row: ShopSubscriptionRow): ShopSubscriptionView {
  return {
    id: row.id,
    status: row.status,
    frequencyMonths: row.frequencyMonths,
    quantity: row.quantity,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    currentPeriodEnd: row.currentPeriodEnd,
    pauseResumesAt: row.pauseResumesAt,
    createdAt: ms(row.createdAt) ?? 0,
  }
}

function stripeId(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof (value as { id?: unknown }).id === 'string') {
    return (value as { id: string }).id
  }
  return null
}

function asLocale(value: string | undefined): Locale {
  return value === 'zh' ? 'zh' : 'en'
}

async function existingCustomerId(db: DB, userId: string): Promise<string | null> {
  const subs = await db.select({ customerId: subscription.customerId }).from(subscription).where(eq(subscription.userId, userId)).limit(1)
  if (subs[0]?.customerId) return subs[0].customerId
  const orders = await db
    .select({ customerId: shopOrder.stripeCustomerId })
    .from(shopOrder)
    .where(eq(shopOrder.userId, userId))
    .orderBy(desc(shopOrder.createdAt))
    .limit(5)
  return orders.find((row) => row.customerId)?.customerId ?? null
}

export async function startShopCheckout(
  db: DB,
  provider: PaymentProvider,
  user: { id: string; email: string },
  selectionInput: unknown,
  urls: { successUrl: string; cancelUrl: string },
  env: ShopPriceEnv & { STRIPE_SECRET_KEY?: string },
  now: number,
  locale: string | undefined,
): Promise<{ ok: true; url: string } | { ok: false; error: ShopError }> {
  const selection = parseSelection(selectionInput)
  if (!selection) return { ok: false, error: 'invalid_selection' }
  if (!env.STRIPE_SECRET_KEY?.trim()) return { ok: false, error: 'not_configured' }
  const built = buildCheckout(selection, priceIdsFromEnv(env))
  let customerId: string
  try {
    customerId = await provider.ensureCustomer(user, await existingCustomerId(db, user.id))
  } catch (err) {
    console.error('[shop] customer failed', err)
    return { ok: false, error: 'stripe' }
  }
  const id = crypto.randomUUID()
  await db.insert(shopOrder).values({
    id,
    userId: user.id,
    email: user.email,
    locale: asLocale(locale),
    status: 'pending',
    kind: selection.kind,
    quantity: selection.quantity,
    frequencyMonths: selection.kind === 'bundle' ? selection.frequencyMonths : null,
    packSize: selection.kind === 'pods' ? selection.packSize : null,
    currency: built.quote.currency,
    totalCents: built.quote.dueTodayCents,
    summary: quoteSummary(built.quote),
    stripeCustomerId: customerId,
    createdAt: new Date(now),
  })
  const meta = shopMetadata({
    orderId: id,
    userId: user.id,
    kind: selection.kind,
    quantity: selection.quantity,
    frequencyMonths: selection.kind === 'bundle' ? selection.frequencyMonths : undefined,
    packSize: selection.kind === 'pods' ? selection.packSize : undefined,
  })
  try {
    const session = await provider.createCheckoutSession({
      customerId,
      priceId: built.lineItems[0]?.priceId ?? 'inline',
      userId: user.id,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
      mode: built.quote.mode,
      lineItems: built.lineItems.map(({ quantity, priceId, priceData }) => ({ quantity, priceId, priceData })),
      metadata: meta,
      paymentMetadata: meta,
      collectShipping: true,
    })
    if (session.id) {
      await db.update(shopOrder).set({ stripeCheckoutSessionId: session.id }).where(eq(shopOrder.id, id))
    }
    return { ok: true, url: session.url }
  } catch (err) {
    console.error('[shop] checkout session failed', err)
    return { ok: false, error: 'stripe' }
  }
}

async function claimEmail(db: DB, orderId: string, now: number): Promise<boolean> {
  const updated = await db
    .update(shopOrder)
    .set({ confirmationSentAt: now })
    .where(and(eq(shopOrder.id, orderId), isNull(shopOrder.confirmationSentAt)))
    .returning({ id: shopOrder.id })
  return updated.length > 0
}

async function sendConfirmation(
  order: { email: string; locale: string; summary: string; totalCents: number; currency: string },
  origin: string,
): Promise<void> {
  const locale = asLocale(order.locale)
  const { sendEmail } = await import('@/features/email/email.server')
  await sendEmail({
    to: order.email,
    locale,
    template: 'order-confirmation',
    data: {
      url: `${origin}${localizePath(locale, '/app/orders')}`,
      summary: order.summary,
      total: formatMoney(order.totalCents, order.currency),
    },
  })
}

async function ensureSubscription(
  db: DB,
  fields: {
    userId: string
    orderId: string
    stripeSubscriptionId: string
    stripeCustomerId: string
    frequencyMonths: number
    quantity: number
  },
  now: number,
): Promise<void> {
  if (!fields.stripeCustomerId) return
  const existing = await db
    .select({ id: shopSubscription.id })
    .from(shopSubscription)
    .where(eq(shopSubscription.stripeSubscriptionId, fields.stripeSubscriptionId))
    .limit(1)
  if (existing[0]) return
  await db.insert(shopSubscription).values({
    id: crypto.randomUUID(),
    userId: fields.userId,
    orderId: fields.orderId,
    stripeSubscriptionId: fields.stripeSubscriptionId,
    stripeCustomerId: fields.stripeCustomerId,
    status: 'active',
    frequencyMonths: fields.frequencyMonths,
    quantity: fields.quantity,
    cancelAtPeriodEnd: false,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  })
}

async function markOrderPaid(
  db: DB,
  patch: {
    orderId?: string
    userId?: string
    sessionId?: string | null
    paymentIntentId?: string | null
    subscriptionId?: string | null
    customerId?: string | null
    amountTotal?: number | null
    currency?: string | null
  },
  now: number,
  origin: string,
): Promise<ShopOrder | null> {
  if (!patch.orderId) return null
  const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, patch.orderId))
  const order = rows[0]
  if (!order) return null
  if (patch.userId && patch.userId !== order.userId) return null
  const totalCents = patch.amountTotal ?? order.totalCents
  const currency = patch.currency ?? order.currency
  if (order.status !== 'refunded') {
    await db.update(shopOrder).set({
      status: 'paid',
      paidAt: order.paidAt ?? now,
      stripeCheckoutSessionId: patch.sessionId ?? order.stripeCheckoutSessionId,
      stripePaymentIntentId: patch.paymentIntentId ?? order.stripePaymentIntentId,
      stripeSubscriptionId: patch.subscriptionId ?? order.stripeSubscriptionId,
      stripeCustomerId: patch.customerId ?? order.stripeCustomerId,
      totalCents,
      currency,
    }).where(eq(shopOrder.id, order.id))
  }
  const subscriptionId = patch.subscriptionId ?? order.stripeSubscriptionId
  const customerId = patch.customerId ?? order.stripeCustomerId
  if (subscriptionId && customerId && order.kind === 'bundle' && order.frequencyMonths) {
    await ensureSubscription(db, {
      userId: order.userId,
      orderId: order.id,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      frequencyMonths: order.frequencyMonths,
      quantity: order.quantity,
    }, now)
  }
  if (order.status === 'refunded') return order
  const claimed = await claimEmail(db, order.id, now)
  if (!claimed) return order
  try {
    await sendConfirmation({ ...order, totalCents, currency }, origin)
  } catch (err) {
    console.error('[shop] confirmation email failed', err)
    await db.update(shopOrder).set({ confirmationSentAt: null }).where(and(eq(shopOrder.id, order.id), eq(shopOrder.confirmationSentAt, now)))
  }
  return order
}

function periodEndMs(sub: Stripe.Subscription): number | null {
  const end = sub.items.data[0]?.current_period_end
  return end ? end * 1000 : null
}

async function applySubscription(db: DB, sub: Stripe.Subscription, deleted: boolean, now: number): Promise<void> {
  const existing = await db.select().from(shopSubscription).where(eq(shopSubscription.stripeSubscriptionId, sub.id)).limit(1)
  const metaFreq = Number(sub.metadata?.frequencyMonths)
  const frequencyMonths = metaFreq === 1 || metaFreq === 2 || metaFreq === 3
    ? metaFreq
    : existing[0]?.frequencyMonths
  const userId = sub.metadata?.userId || existing[0]?.userId
  if (!userId || !frequencyMonths) return
  const customerId = stripeId(sub.customer) ?? existing[0]?.stripeCustomerId
  if (!customerId) return
  const quantity = Number(sub.metadata?.quantity) || existing[0]?.quantity || sub.items.data[0]?.quantity || 1
  const values = {
    status: deleted ? 'canceled' : sub.status,
    frequencyMonths,
    quantity,
    cancelAtPeriodEnd: deleted ? false : sub.cancel_at_period_end,
    currentPeriodEnd: periodEndMs(sub),
    pauseResumesAt: sub.pause_collection?.resumes_at ? sub.pause_collection.resumes_at * 1000 : null,
    stripeCustomerId: customerId,
    updatedAt: new Date(now),
  }
  if (!existing[0]) {
    await db.insert(shopSubscription).values({
      id: crypto.randomUUID(),
      userId,
      orderId: sub.metadata?.orderId || null,
      stripeSubscriptionId: sub.id,
      createdAt: new Date(now),
      ...values,
    })
    return
  }
  await db.update(shopSubscription).set(values).where(eq(shopSubscription.id, existing[0].id))
}

function invoiceSubscriptionId(obj: unknown): string | null {
  const inv = obj as {
    subscription?: string | { id?: string } | null
    parent?: { subscription_details?: { subscription?: string | { id?: string } | null } | null } | null
  }
  return stripeId(inv.subscription ?? inv.parent?.subscription_details?.subscription ?? null)
}

export async function shouldHandleShopEvent(db: DB, event: Stripe.Event): Promise<boolean> {
  if (isShopStripeEvent(event)) return true
  if (event.type === 'charge.refunded') {
    const pi = stripeId((event.data.object as Stripe.Charge).payment_intent)
    if (!pi) return false
    const rows = await db.select({ id: shopOrder.id }).from(shopOrder).where(eq(shopOrder.stripePaymentIntentId, pi)).limit(1)
    return rows.length > 0
  }
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const rows = await db.select({ id: shopSubscription.id }).from(shopSubscription).where(eq(shopSubscription.stripeSubscriptionId, sub.id)).limit(1)
    return rows.length > 0
  }
  if (event.type === 'invoice.payment_failed') {
    const id = invoiceSubscriptionId(event.data.object)
    if (!id) return false
    const rows = await db.select({ id: shopSubscription.id }).from(shopSubscription).where(eq(shopSubscription.stripeSubscriptionId, id)).limit(1)
    return rows.length > 0
  }
  return false
}

export async function applyShopStripeEvent(
  db: DB,
  event: Stripe.Event,
  now: number,
  opts: { origin: string; cancelSubscription?: (subscriptionId: string) => Promise<void> },
): Promise<void> {
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session
    if (!isShopPurpose(session.metadata)) return
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return
    await markOrderPaid(db, {
      orderId: session.metadata?.orderId,
      userId: session.metadata?.userId,
      sessionId: session.id,
      paymentIntentId: stripeId(session.payment_intent),
      subscriptionId: stripeId(session.subscription),
      customerId: stripeId(session.customer),
      amountTotal: session.amount_total,
      currency: session.currency,
    }, now, opts.origin)
    return
  }
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if (!orderId || !isShopPurpose(session.metadata)) return
    await db.update(shopOrder).set({ status: 'canceled' }).where(and(eq(shopOrder.id, orderId), eq(shopOrder.status, 'pending')))
    return
  }
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    await applySubscription(db, event.data.object as Stripe.Subscription, event.type === 'customer.subscription.deleted', now)
    return
  }
  if (event.type === 'invoice.payment_failed') {
    const id = invoiceSubscriptionId(event.data.object)
    if (!id) return
    await db.update(shopSubscription).set({ status: 'past_due', updatedAt: new Date(now) }).where(eq(shopSubscription.stripeSubscriptionId, id))
    return
  }
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    if (!charge.refunded && charge.amount_refunded !== charge.amount) return
    const pi = stripeId(charge.payment_intent)
    if (!pi) return
    const rows = await db.select().from(shopOrder).where(eq(shopOrder.stripePaymentIntentId, pi)).limit(1)
    const order = rows[0]
    if (!order) return
    await db.update(shopOrder).set({ status: 'refunded' }).where(eq(shopOrder.id, order.id))
    if (order.stripeSubscriptionId && opts.cancelSubscription) {
      try { await opts.cancelSubscription(order.stripeSubscriptionId) } catch (err) { console.error('[shop] refund cancel failed', err) }
    }
  }
}

export async function confirmShopCheckout(
  db: DB,
  provider: PaymentProvider,
  userId: string,
  sessionId: string,
  now: number,
  origin: string,
): Promise<{ ok: true; state: 'paid' | 'pending'; order: ShopOrderView | null } | { ok: false; error: ShopError }> {
  const snap = await provider.retrieveCheckoutSession(sessionId)
  if (!snap || !isShopPurpose(snap.metadata)) return { ok: false, error: 'not_found' }
  if (snap.metadata.userId !== userId) return { ok: false, error: 'forbidden' }
  const paid = snap.paymentStatus === 'paid' || snap.paymentStatus === 'no_payment_required'
  if (paid) {
    await markOrderPaid(db, {
      orderId: snap.metadata.orderId,
      userId,
      sessionId: snap.id,
      paymentIntentId: snap.paymentIntentId,
      subscriptionId: snap.subscriptionId,
      customerId: snap.customerId,
      amountTotal: snap.amountTotal,
      currency: snap.currency,
    }, now, origin)
  }
  const orderId = snap.metadata.orderId
  if (!orderId) return { ok: true, state: paid ? 'paid' : 'pending', order: null }
  const rows = await db.select().from(shopOrder).where(and(eq(shopOrder.id, orderId), eq(shopOrder.userId, userId)))
  const order = rows[0]
  return { ok: true, state: order?.status === 'paid' ? 'paid' : 'pending', order: order ? orderView(order) : null }
}

export async function listShopForUser(db: DB, userId: string): Promise<{ orders: ShopOrderView[]; subscriptions: ShopSubscriptionView[] }> {
  const orders = await db.select().from(shopOrder).where(eq(shopOrder.userId, userId)).orderBy(desc(shopOrder.createdAt)).limit(50)
  const subscriptions = await db.select().from(shopSubscription).where(eq(shopSubscription.userId, userId)).orderBy(desc(shopSubscription.createdAt)).limit(20)
  return { orders: orders.map(orderView), subscriptions: subscriptions.map(subView) }
}

export async function listShopForAdmin(db: DB): Promise<{ orders: ShopOrderView[]; subscriptions: ShopSubscriptionView[] }> {
  const orders = await db.select().from(shopOrder).orderBy(desc(shopOrder.createdAt)).limit(100)
  const subscriptions = await db.select().from(shopSubscription).orderBy(desc(shopSubscription.createdAt)).limit(100)
  return { orders: orders.map(orderView), subscriptions: subscriptions.map(subView) }
}

async function saveManaged(
  db: DB,
  id: string,
  snap: { status: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: number | null; pauseResumesAt: number | null },
  frequencyMonths: number,
  now: number,
): Promise<void> {
  await db.update(shopSubscription).set({
    status: snap.status,
    cancelAtPeriodEnd: snap.cancelAtPeriodEnd,
    currentPeriodEnd: snap.currentPeriodEnd,
    pauseResumesAt: snap.pauseResumesAt,
    frequencyMonths,
    updatedAt: new Date(now),
  }).where(eq(shopSubscription.id, id))
}

export async function manageShopSubscriptionForUser(
  db: DB,
  provider: PaymentProvider,
  userId: string,
  request: { action: 'cancel' | 'resume' | 'skip' | 'set_frequency'; subscriptionId: string; frequencyMonths?: number },
  env: ShopPriceEnv & { STRIPE_SECRET_KEY?: string },
  now: number,
): Promise<{ ok: true; subscription: ShopSubscriptionView } | { ok: false; error: ShopError }> {
  if (!env.STRIPE_SECRET_KEY?.trim()) return { ok: false, error: 'not_configured' }
  const rows = await db.select().from(shopSubscription).where(and(eq(shopSubscription.id, request.subscriptionId), eq(shopSubscription.userId, userId)))
  const row = rows[0]
  if (!row) return { ok: false, error: 'not_found' }
  try {
    if (request.action === 'cancel') {
      const snap = await provider.manageSubscription({ action: 'cancel_at_period_end', subscriptionId: row.stripeSubscriptionId })
      await saveManaged(db, row.id, snap, row.frequencyMonths, now)
    } else if (request.action === 'resume') {
      const snap = await provider.manageSubscription({ action: 'resume', subscriptionId: row.stripeSubscriptionId })
      await saveManaged(db, row.id, snap, row.frequencyMonths, now)
    } else if (request.action === 'skip') {
      const snap = await provider.manageSubscription({ action: 'skip', subscriptionId: row.stripeSubscriptionId, frequencyMonths: row.frequencyMonths })
      await saveManaged(db, row.id, snap, row.frequencyMonths, now)
    } else {
      const frequencyMonths = request.frequencyMonths
      if (frequencyMonths !== 1 && frequencyMonths !== 2 && frequencyMonths !== 3) return { ok: false, error: 'invalid' }
      const built = buildCheckout(
        { kind: 'bundle', quantity: row.quantity, frequencyMonths, packSize: 1 },
        priceIdsFromEnv(env),
      )
      const line = built.lineItems.find((item) => item.key === 'subscription')
      if (!line) return { ok: false, error: 'invalid' }
      const snap = await provider.manageSubscription({
        action: 'set_price',
        subscriptionId: row.stripeSubscriptionId,
        priceId: line.priceId,
        priceData: line.priceData?.recurring
          ? { ...line.priceData, recurring: line.priceData.recurring }
          : undefined,
        metadata: shopMetadata({
          userId,
          orderId: row.orderId,
          kind: 'bundle',
          quantity: row.quantity,
          frequencyMonths,
        }),
      })
      await saveManaged(db, row.id, snap, frequencyMonths, now)
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'already_skipped') return { ok: false, error: 'already_skipped' }
    console.error('[shop] manage subscription failed', err)
    return { ok: false, error: 'stripe' }
  }
  const fresh = await db.select().from(shopSubscription).where(eq(shopSubscription.id, row.id))
  if (!fresh[0]) return { ok: false, error: 'not_found' }
  return { ok: true, subscription: subView(fresh[0]) }
}

export async function openShopPortal(
  db: DB,
  provider: PaymentProvider,
  userId: string,
  returnUrl: string,
): Promise<{ ok: true; url: string } | { ok: false; error: ShopError }> {
  const subs = await db.select().from(shopSubscription).where(eq(shopSubscription.userId, userId)).orderBy(desc(shopSubscription.createdAt)).limit(1)
  let customerId: string | null = subs[0]?.stripeCustomerId ?? null
  if (!customerId) {
    const orders = await db.select().from(shopOrder).where(eq(shopOrder.userId, userId)).orderBy(desc(shopOrder.createdAt)).limit(5)
    customerId = orders.find((row) => row.stripeCustomerId)?.stripeCustomerId ?? null
  }
  if (!customerId) return { ok: false, error: 'not_found' }
  try {
    const session = await provider.createPortalSession(customerId, returnUrl)
    return { ok: true, url: session.url }
  } catch (err) {
    console.error('[shop] portal failed', err)
    return { ok: false, error: 'stripe' }
  }
}
