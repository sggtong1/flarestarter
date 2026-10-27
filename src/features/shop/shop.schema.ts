import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { user } from '@/features/auth/auth.schema'

export const shopOrder = sqliteTable('shop_order', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  locale: text('locale').notNull().default('en'),
  status: text('status').notNull().default('pending'),
  kind: text('kind').notNull(),
  quantity: integer('quantity').notNull(),
  frequencyMonths: integer('frequency_months'),
  packSize: integer('pack_size'),
  currency: text('currency').notNull(),
  totalCents: integer('total_cents').notNull(),
  summary: text('summary').notNull(),
  stripeCheckoutSessionId: text('stripe_checkout_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  confirmationSentAt: integer('confirmation_sent_at'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  paidAt: integer('paid_at'),
}, (t) => [
  index('shop_order_user_idx').on(t.userId),
  index('shop_order_session_idx').on(t.stripeCheckoutSessionId),
  index('shop_order_pi_idx').on(t.stripePaymentIntentId),
])

export const shopSubscription = sqliteTable('shop_subscription', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  orderId: text('order_id'),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  status: text('status').notNull(),
  frequencyMonths: integer('frequency_months').notNull(),
  quantity: integer('quantity').notNull(),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull().default(false),
  currentPeriodEnd: integer('current_period_end'),
  pauseResumesAt: integer('pause_resumes_at'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [
  index('shop_sub_user_idx').on(t.userId),
])

export type ShopOrder = typeof shopOrder.$inferSelect
export type ShopSubscriptionRow = typeof shopSubscription.$inferSelect
