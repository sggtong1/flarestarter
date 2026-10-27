import { test, expect } from 'vitest'
import { translateStripeEvent } from '@/features/billing/entitlement'
import { renderEmail } from '@/features/email/templates'
import {
  buildCheckout,
  checkoutSearch,
  coerceSearchNumber,
  defaultSelection,
  describeCheckout,
  formatMoney,
  listPlaceholders,
  parseSelection,
  priceIdsFromEnv,
  quoteSelection,
  quoteSummary,
  selectionFromSearch,
} from './catalog'
import { isShopStripeEvent, shopMetadata } from './events'
import { storeJsonLd } from './jsonld'
import { productLlms } from './llms'
import { productConfig } from './product.config'
import { safeNextPath } from './safe-next'
import { addUtcMonths, skipResumesAtUnix } from './schedule'

test('the primary offer is the device plus a refill subscription', () => {
  expect(defaultSelection.kind).toBe('bundle')
  expect(defaultSelection.frequencyMonths).toBe(2)
  const quote = quoteSelection(defaultSelection)
  expect(quote.mode).toBe('subscription')
  expect(quote.lines.map((line) => line.key)).toEqual(['device', 'subscription'])
  expect(quote.dueTodayCents).toBe(productConfig.offers.device.cents + productConfig.offers.subscription.months[2].cents)
  expect(quote.recurringCents).toBe(productConfig.offers.subscription.months[2].cents)
  expect(quote.recurringIntervalMonths).toBe(2)
})

test('quantity multiplies both the device and the recurring pod', () => {
  const quote = quoteSelection({ kind: 'bundle', quantity: 2, frequencyMonths: 1, packSize: 1 })
  expect(quote.dueTodayCents).toBe((productConfig.offers.device.cents + productConfig.offers.subscription.months[1].cents) * 2)
  expect(quote.recurringCents).toBe(productConfig.offers.subscription.months[1].cents * 2)
})

test('device-only and pod packs are one-time', () => {
  const device = quoteSelection({ kind: 'device', quantity: 1, frequencyMonths: 2, packSize: 3 })
  expect(device.mode).toBe('payment')
  expect(device.recurringCents).toBeNull()
  expect(device.dueTodayCents).toBe(productConfig.offers.device.cents)

  const pods = quoteSelection({ kind: 'pods', quantity: 2, frequencyMonths: 2, packSize: 3 })
  expect(pods.mode).toBe('payment')
  expect(pods.dueTodayCents).toBe(productConfig.offers.pods[3].cents * 2)
  expect(pods.lines[0].name).toContain('3')
})

test('changing cadence changes only the subscription line', () => {
  const two = quoteSelection({ kind: 'bundle', quantity: 1, frequencyMonths: 2, packSize: 1 })
  const three = quoteSelection({ kind: 'bundle', quantity: 1, frequencyMonths: 3, packSize: 1 })
  expect(two.lines[0]).toEqual(three.lines[0])
  expect(three.lines[1].unitCents).toBe(productConfig.offers.subscription.months[3].cents)
  expect(three.lines[1].recurring).toEqual({ interval: 'month', intervalCount: 3 })
})

test('parseSelection rejects bad quantity, kind, and cadence', () => {
  expect(parseSelection({ kind: 'bundle', quantity: 0 })).toBeNull()
  expect(parseSelection({ kind: 'bundle', quantity: 9 })).toBeNull()
  expect(parseSelection({ kind: 'lifetime' })).toBeNull()
  expect(parseSelection({ frequencyMonths: 4 })).toBeNull()
  expect(parseSelection({ packSize: 2 })).toBeNull()
  expect(parseSelection({ kind: 'device' })?.kind).toBe('device')
})

test('search params round-trip and invalid search falls back to the bundle', () => {
  const selection = { kind: 'pods' as const, quantity: 2, frequencyMonths: 3 as const, packSize: 6 as const }
  expect(selectionFromSearch(checkoutSearch(selection))).toEqual(selection)
  expect(selectionFromSearch({ offer: 'nope', qty: '0' }).kind).toBe('bundle')
  expect(coerceSearchNumber('2')).toBe(2)
  expect(coerceSearchNumber(2)).toBe(2)
  expect(selectionFromSearch({ offer: 'device', qty: 2, every: 1 })).toEqual({
    kind: 'device', quantity: 2, frequencyMonths: 1, packSize: 3,
  })
})

test('missing Stripe price ids fall back to placeholder amounts', () => {
  const built = buildCheckout(defaultSelection, priceIdsFromEnv({}))
  expect(built.lineItems.every((line) => !line.priceId && line.priceData)).toBe(true)
  const sub = built.lineItems.find((line) => line.key === 'subscription')
  expect(sub?.priceData?.unitAmount).toBe(productConfig.offers.subscription.months[2].cents)
  expect(sub?.priceData?.recurring).toEqual({ interval: 'month', intervalCount: 2 })
  expect(built.lineItems.find((line) => line.key === 'device')?.priceData?.recurring).toBeUndefined()
})

test('configured price ids are preferred over inline amounts', () => {
  const built = buildCheckout(
    { kind: 'pods', quantity: 1, frequencyMonths: 1, packSize: 6 },
    priceIdsFromEnv({ STRIPE_PRICE_NOOKDRY_PODS_6: 'price_pods_6' }),
  )
  expect(built.lineItems).toEqual([{ key: 'pods', quantity: 1, priceId: 'price_pods_6' }])
})

test('describeCheckout reports test mode and inline prices without leaking the key', () => {
  const off = describeCheckout('', priceIdsFromEnv({}), defaultSelection)
  expect(off).toEqual({ configured: false, mode: 'off', inlinePrices: true })
  const testMode = describeCheckout('sk_test_123', priceIdsFromEnv({ STRIPE_PRICE_NOOKDRY_DEVICE: 'price_device', STRIPE_PRICE_NOOKDRY_SUB_2: 'price_sub' }), defaultSelection)
  expect(testMode).toEqual({ configured: true, mode: 'test', inlinePrices: false })
  const live = describeCheckout('sk_live_123', priceIdsFromEnv({}), { kind: 'device', quantity: 1, frequencyMonths: 2, packSize: 1 })
  expect(live.mode).toBe('live')
  expect(JSON.stringify(testMode)).not.toContain('sk_test')
})

test('quote summary is stable for the confirmation email', () => {
  expect(quoteSummary(quoteSelection(defaultSelection))).toContain('Nookdry device × 1')
  expect(formatMoney(7900)).toBe('$79.00')
})

test('skipping a refill resumes one cadence after the current period', () => {
  const periodEnd = Date.UTC(2026, 0, 15)
  expect(new Date(addUtcMonths(periodEnd, 2)).toISOString()).toBe('2026-03-15T00:00:00.000Z')
  expect(skipResumesAtUnix(periodEnd, 2, periodEnd - 1000)).toBe(Math.floor(Date.UTC(2026, 2, 15) / 1000))
  // Jan 31 + 1 month does not land in March.
  expect(new Date(addUtcMonths(Date.UTC(2026, 0, 31), 1)).toISOString()).toBe('2026-02-28T00:00:00.000Z')
  // A period that already ended counts from now.
  const now = Date.UTC(2026, 5, 10)
  expect(skipResumesAtUnix(Date.UTC(2026, 0, 1), 1, now)).toBe(Math.floor(Date.UTC(2026, 6, 10) / 1000))
})

test('shop checkouts are ignored by SaaS entitlement', () => {
  const meta = shopMetadata({ orderId: 'ord_1', userId: 'usr_1', kind: 'device' })
  const payment: any = {
    id: 'evt_shop_pay',
    type: 'checkout.session.completed',
    data: { object: { mode: 'payment', payment_status: 'paid', customer: 'cus', payment_intent: 'pi_device', metadata: meta } },
  }
  expect(isShopStripeEvent(payment)).toBe(true)
  expect(translateStripeEvent(payment)).toEqual({ type: 'ignored', eventId: 'evt_shop_pay' })

  const sub: any = {
    id: 'evt_shop_sub',
    type: 'customer.subscription.updated',
    created: 10,
    data: { object: { id: 'sub', customer: 'cus', status: 'active', metadata: meta, items: { data: [{ price: { id: 'price' }, current_period_end: 20 }] } } },
  }
  expect(translateStripeEvent(sub).type).toBe('ignored')

  const invoice: any = {
    id: 'evt_shop_inv',
    type: 'invoice.payment_failed',
    created: 10,
    data: { object: { customer: 'cus', parent: { subscription_details: { metadata: meta } } } },
  }
  expect(isShopStripeEvent(invoice)).toBe(true)
  expect(translateStripeEvent(invoice).type).toBe('ignored')
})

test('a normal Pro payment is still a lifetime grant', () => {
  const ev: any = { id: 'evt_life', type: 'checkout.session.completed', data: { object: { mode: 'payment', payment_status: 'paid', customer: 'cus', payment_intent: 'pi' } } }
  expect(isShopStripeEvent(ev)).toBe(false)
  expect(translateStripeEvent(ev).type).toBe('purchase.completed')
})

test('json-ld publishes product, offers, faq, and organization with placeholder prices', () => {
  const graph = storeJsonLd('https://shop.example')
  const types = graph['@graph'].map((node) => node['@type'])
  expect(types).toEqual(['Organization', 'Product', 'FAQPage'])
  const product = graph['@graph'][1] as unknown as { name: string; offers: Array<{ price: string; sku: string }> }
  expect(product.name).toBe('Nookdry')
  expect(product.offers.find((offer) => offer.sku === 'NOOKDRY-DEVICE')?.price).toBe('79.00')
  expect(product.offers.find((offer) => offer.sku === 'NOOKDRY-SUB-2')?.price).toBe('26.00')
  expect(graph['@graph'][0]).toMatchObject({ name: productConfig.brand.name, url: 'https://shop.example' })
  const faq = graph['@graph'][2] as { mainEntity: unknown[] }
  expect(faq.mainEntity.length).toBe(productConfig.faq.length)
})

test('llms.txt names the product, the subscription, and says quotes are not reviews', () => {
  const text = productLlms('https://shop.example')
  expect(text).toContain('# Nookdry')
  expect(text).toContain('refill-pod subscription')
  expect(text).toContain('not reviews')
  expect(text).toContain('placeholder')
  expect(text).toContain('https://shop.example/checkout')
})

test('placeholder inventory covers brand, prices, specs, and sample quotes', () => {
  const ids = listPlaceholders().map((note) => note.id)
  for (const id of ['brand.name', 'colors', 'offers.device', 'offers.subscription.2', 'offers.pods.3', 'sampleQuotes', 'seo.ogImage', 'shipping.guarantee']) {
    expect(ids).toContain(id)
  }
  for (const spec of productConfig.specs) expect(ids).toContain(`specs.${spec.id}`)
  expect(productConfig.copy.quotesDisclaimer.toLowerCase()).toContain('not reviews')
})

test('safeNextPath allows in-app paths only', () => {
  expect(safeNextPath('/checkout?offer=bundle')).toBe('/checkout?offer=bundle')
  expect(safeNextPath('//evil.example')).toBeNull()
  expect(safeNextPath('https://evil.example')).toBeNull()
  expect(safeNextPath('/\\evil')).toBeNull()
  expect(safeNextPath(null)).toBeNull()
})

test('order confirmation email includes the summary and total', async () => {
  const rendered = await renderEmail({
    template: 'order-confirmation',
    locale: 'en',
    data: { url: 'https://shop.example/app/orders', summary: 'Nookdry device × 1', total: '$105.00' },
  })
  expect(rendered.subject).toContain('Nookdry')
  expect(rendered.html).toContain('Nookdry device × 1')
  expect(rendered.html).toContain('$105.00')
  expect(rendered.text).toContain('https://shop.example/app/orders')
  const zh = await renderEmail({
    template: 'order-confirmation',
    locale: 'zh',
    data: { url: 'https://shop.example/zh/app/orders', summary: 'Nookdry', total: '$79.00' },
  })
  expect(zh.subject).toContain('Nookdry')
  expect(zh.html).toContain('订单')
})
