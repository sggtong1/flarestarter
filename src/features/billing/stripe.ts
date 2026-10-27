import Stripe from 'stripe'
import { skipResumesAtUnix } from '@/features/shop/schedule'
import { translateStripeEvent, type DomainEvent } from './entitlement'
import type { CheckoutLineItem, ManagedSubscription, PaymentProvider, CheckoutInput, CheckoutSessionSnapshot } from './payment'

interface StripeEnv { STRIPE_SECRET_KEY: string; STRIPE_WEBHOOK_SECRET: string }

export function createStripeProvider(env: StripeEnv): PaymentProvider {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })
  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  return {
    async ensureCustomer(user, existingCustomerId) {
      if (existingCustomerId) return existingCustomerId
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } })
      return customer.id
    },
    async createCheckoutSession(input: CheckoutInput) {
      const metadata = input.paymentMetadata ?? input.metadata
      const session = await stripe.checkout.sessions.create({
        mode: input.mode,
        customer: input.customerId,
        line_items: input.lineItems?.length
          ? input.lineItems.map(toStripeLine)
          : [{ price: input.priceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.userId,
        metadata: input.metadata,
        ...(input.collectShipping ? { shipping_address_collection: { allowed_countries: ['US'] } } : {}),
        ...(input.mode === 'subscription'
          ? { subscription_data: metadata ? { metadata } : undefined }
          : { payment_intent_data: metadata ? { metadata } : undefined }),
      })
      if (!session.url) throw new Error('Stripe did not return a checkout URL')
      return { url: session.url, id: session.id }
    },
    async createPortalSession(customerId, returnUrl) {
      const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl })
      return { url: session.url }
    },
    async parseWebhook(rawBody, signature): Promise<DomainEvent> {
      const event = await stripe.webhooks.constructEventAsync(rawBody, signature, env.STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider)
      return translateStripeEvent(event)
    },
    async cancelSubscription(subscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscriptionId)
      } catch (err) {
        // Idempotency: a webhook retry after a partial failure may hit a sub
        // that is already canceled or gone — both mean "done", not an error.
        if (err instanceof Stripe.errors.StripeInvalidRequestError &&
            (err.code === 'resource_missing' || /canceled/i.test(err.message))) return
        throw err
      }
    },
    async manageSubscription(input): Promise<ManagedSubscription> {
      if (input.action === 'cancel_at_period_end') {
        return snapshot(await stripe.subscriptions.update(input.subscriptionId, { cancel_at_period_end: true }))
      }
      if (input.action === 'resume') {
        return snapshot(await stripe.subscriptions.update(input.subscriptionId, { cancel_at_period_end: false }))
      }
      if (input.action === 'skip') {
        const current = await stripe.subscriptions.retrieve(input.subscriptionId)
        const resumes = current.pause_collection?.resumes_at
        if (resumes && resumes * 1000 > Date.now()) throw new Error('already_skipped')
        const periodEnd = current.items.data[0]?.current_period_end
        if (!periodEnd) throw new Error('missing_period')
        const resumesAt = skipResumesAtUnix(periodEnd * 1000, input.frequencyMonths)
        return snapshot(await stripe.subscriptions.update(input.subscriptionId, {
          pause_collection: { behavior: 'void', resumes_at: resumesAt },
        }))
      }
      const current = await stripe.subscriptions.retrieve(input.subscriptionId)
      const item = current.items.data[0]
      if (!item) throw new Error('missing_item')
      let priceId = input.priceId
      if (!priceId) {
        if (!input.priceData?.recurring) throw new Error('missing_price')
        const price = await stripe.prices.create({
          currency: input.priceData.currency,
          unit_amount: input.priceData.unitAmount,
          recurring: {
            interval: input.priceData.recurring.interval,
            interval_count: input.priceData.recurring.intervalCount,
          },
          product_data: { name: input.priceData.productName },
        })
        priceId = price.id
      }
      return snapshot(await stripe.subscriptions.update(input.subscriptionId, {
        items: [{ id: item.id, price: priceId }],
        proration_behavior: 'none',
        ...(input.metadata ? { metadata: { ...current.metadata, ...input.metadata } } : {}),
      }))
    },
    async retrieveCheckoutSession(sessionId): Promise<CheckoutSessionSnapshot | null> {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        const customer = session.customer
        const subscription = session.subscription
        const paymentIntent = session.payment_intent
        return {
          id: session.id,
          status: session.status,
          paymentStatus: session.payment_status,
          mode: session.mode,
          customerId: typeof customer === 'string' ? customer : (customer?.id ?? null),
          subscriptionId: typeof subscription === 'string' ? subscription : (subscription?.id ?? null),
          paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id ?? null),
          metadata: session.metadata ?? {},
          amountTotal: session.amount_total,
          currency: session.currency,
        }
      } catch (err) {
        console.error('[billing] retrieve checkout session failed', err)
        return null
      }
    },
  }
}

function toStripeLine(line: CheckoutLineItem): Stripe.Checkout.SessionCreateParams.LineItem {
  if (line.priceId) return { price: line.priceId, quantity: line.quantity }
  if (!line.priceData) throw new Error('Checkout line needs a price id or inline price data')
  return {
    quantity: line.quantity,
    price_data: {
      currency: line.priceData.currency,
      unit_amount: line.priceData.unitAmount,
      product_data: { name: line.priceData.productName },
      ...(line.priceData.recurring
        ? { recurring: { interval: line.priceData.recurring.interval, interval_count: line.priceData.recurring.intervalCount } }
        : {}),
    },
  }
}

function snapshot(sub: Stripe.Subscription): ManagedSubscription {
  const item = sub.items.data[0]
  return {
    status: sub.status,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    currentPeriodEnd: item?.current_period_end ? item.current_period_end * 1000 : null,
    pauseResumesAt: sub.pause_collection?.resumes_at ? sub.pause_collection.resumes_at * 1000 : null,
  }
}
