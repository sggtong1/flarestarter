import { isShopPurpose, SHOP_PURPOSE } from './purpose'

export function shopMetadata(fields: Record<string, string | number | null | undefined>): Record<string, string> {
  const out: Record<string, string> = { purpose: SHOP_PURPOSE }
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === '') continue
    out[key] = String(value)
  }
  return out
}

/** True when this Stripe event belongs to the store and must not grant SaaS Pro. */
export function isShopStripeEvent(event: { data?: { object?: unknown } } | null | undefined): boolean {
  const obj = event?.data?.object as Record<string, unknown> | undefined
  if (!obj || typeof obj !== 'object') return false
  const meta = (value: unknown) =>
    value && typeof value === 'object' ? (value as { purpose?: string }) : undefined
  if (isShopPurpose(meta(obj.metadata))) return true
  const subscriptionDetails = obj.subscription_details as { metadata?: unknown } | undefined
  if (isShopPurpose(meta(subscriptionDetails?.metadata))) return true
  const parent = obj.parent as { subscription_details?: { metadata?: unknown } } | undefined
  if (isShopPurpose(meta(parent?.subscription_details?.metadata))) return true
  const lines = obj.lines as { data?: Array<{ metadata?: unknown }> } | undefined
  if (Array.isArray(lines?.data) && lines.data.some((line) => isShopPurpose(meta(line?.metadata)))) return true
  return false
}
