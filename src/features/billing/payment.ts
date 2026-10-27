import type { DomainEvent } from './entitlement'

export interface CheckoutPriceData {
  currency: string
  unitAmount: number
  productName: string
  recurring?: { interval: 'month'; intervalCount: number }
}

export interface CheckoutLineItem {
  quantity: number
  priceId?: string
  priceData?: CheckoutPriceData
}

export interface CheckoutInput {
  customerId: string
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
  mode: 'subscription' | 'payment'
  /** When set, replaces the single `priceId` line. Mixed one-time + recurring is valid in subscription mode. */
  lineItems?: CheckoutLineItem[]
  metadata?: Record<string, string>
  /** Copied onto the Subscription (subscription mode) or PaymentIntent (payment mode). */
  paymentMetadata?: Record<string, string>
  /** Collect a US shipping address on the hosted Checkout page. */
  collectShipping?: boolean
}

export interface CheckoutSessionSnapshot {
  id: string
  status: string | null
  paymentStatus: string
  mode: string
  customerId: string | null
  subscriptionId: string | null
  paymentIntentId: string | null
  metadata: Record<string, string>
  amountTotal: number | null
  currency: string | null
}

export interface ManagedSubscription {
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: number | null
  pauseResumesAt: number | null
}

export type SubscriptionManage =
  | { action: 'cancel_at_period_end'; subscriptionId: string }
  | { action: 'resume'; subscriptionId: string }
  | { action: 'skip'; subscriptionId: string; frequencyMonths: number }
  | {
      action: 'set_price'
      subscriptionId: string
      priceId?: string
      priceData?: CheckoutPriceData & { recurring: { interval: 'month'; intervalCount: number } }
      metadata?: Record<string, string>
    }

export interface PaymentProvider {
  ensureCustomer(user: { id: string; email: string }, existingCustomerId: string | null): Promise<string>
  createCheckoutSession(input: CheckoutInput): Promise<{ url: string; id?: string }>
  createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }>
  parseWebhook(rawBody: string, signature: string): Promise<DomainEvent>
  /** Immediately cancel a live subscription. MUST be idempotent: canceling an
   *  already-canceled/missing subscription resolves (webhook retries re-run it). */
  cancelSubscription(subscriptionId: string): Promise<void>
  /** Store subscription changes: cancel at period end, resume, skip one cycle, or swap the recurring price. */
  manageSubscription(input: SubscriptionManage): Promise<ManagedSubscription>
  retrieveCheckoutSession(sessionId: string): Promise<CheckoutSessionSnapshot | null>
}
