import { productConfig } from './product.config'

export const OFFER_KINDS = ['device', 'bundle', 'pods'] as const
export type OfferKind = (typeof OFFER_KINDS)[number]

export const FREQUENCIES = [1, 2, 3] as const
export type FrequencyMonths = (typeof FREQUENCIES)[number]

export const PACK_SIZES = [1, 3, 6] as const
export type PodPackSize = (typeof PACK_SIZES)[number]

export const MAX_QUANTITY = 5

export interface Selection {
  kind: OfferKind
  quantity: number
  frequencyMonths: FrequencyMonths
  packSize: PodPackSize
}

export const defaultSelection: Selection = {
  kind: 'bundle',
  quantity: 1,
  frequencyMonths: productConfig.offers.subscription.recommended,
  packSize: 3,
}

export interface QuoteLine {
  key: 'device' | 'subscription' | 'pods'
  name: string
  quantity: number
  unitCents: number
  lineCents: number
  recurring: { interval: 'month'; intervalCount: number } | null
}

export interface Quote {
  currency: 'usd'
  lines: QuoteLine[]
  /** Device + first pod (bundle) or the one-time total. Charged at checkout. */
  dueTodayCents: number
  recurringCents: number | null
  recurringIntervalMonths: number | null
  mode: 'payment' | 'subscription'
}

export interface BuiltLine {
  key: QuoteLine['key']
  quantity: number
  priceId?: string
  priceData?: {
    currency: string
    unitAmount: number
    productName: string
    recurring?: { interval: 'month'; intervalCount: number }
  }
}

export interface PriceIds {
  device?: string
  pods: Partial<Record<PodPackSize, string>>
  subscription: Partial<Record<FrequencyMonths, string>>
}

export interface ShopPriceEnv {
  STRIPE_PRICE_NOOKDRY_DEVICE?: string
  STRIPE_PRICE_NOOKDRY_PODS_1?: string
  STRIPE_PRICE_NOOKDRY_PODS_3?: string
  STRIPE_PRICE_NOOKDRY_PODS_6?: string
  STRIPE_PRICE_NOOKDRY_SUB_1?: string
  STRIPE_PRICE_NOOKDRY_SUB_2?: string
  STRIPE_PRICE_NOOKDRY_SUB_3?: string
}

function isFrequency(n: unknown): n is FrequencyMonths {
  return n === 1 || n === 2 || n === 3
}

function isPack(n: unknown): n is PodPackSize {
  return n === 1 || n === 3 || n === 6
}

function isKind(v: unknown): v is OfferKind {
  return v === 'device' || v === 'bundle' || v === 'pods'
}

/** Missing fields fall back to the bundle default. Present but invalid values return null. */
export function parseSelection(input: unknown): Selection | null {
  if (input == null) return { ...defaultSelection }
  if (typeof input !== 'object') return null
  const raw = input as Record<string, unknown>
  const kind = raw.kind === undefined ? defaultSelection.kind : raw.kind
  if (!isKind(kind)) return null
  const quantity = raw.quantity === undefined ? defaultSelection.quantity : raw.quantity
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null
  const frequencyMonths = raw.frequencyMonths === undefined ? defaultSelection.frequencyMonths : raw.frequencyMonths
  if (!isFrequency(frequencyMonths)) return null
  const packSize = raw.packSize === undefined ? defaultSelection.packSize : raw.packSize
  if (!isPack(packSize)) return null
  return { kind, quantity, frequencyMonths, packSize }
}

/** Keep numeric checkout params as numbers. The router JSON-encodes strings, which quotes them in the URL. */
export function coerceSearchNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

export function selectionFromSearch(search: {
  offer?: string
  every?: string | number
  qty?: string | number
  pack?: string | number
}): Selection {
  const parsed = parseSelection({
    kind: search.offer,
    frequencyMonths: search.every === undefined ? undefined : Number(search.every),
    quantity: search.qty === undefined ? undefined : Number(search.qty),
    packSize: search.pack === undefined ? undefined : Number(search.pack),
  })
  return parsed ?? { ...defaultSelection }
}

export function checkoutSearch(selection: Selection): { offer: OfferKind; every: number; qty: number; pack: number } {
  return {
    offer: selection.kind,
    every: selection.frequencyMonths,
    qty: selection.quantity,
    pack: selection.packSize,
  }
}

export function formatMoney(cents: number, currency: string = productConfig.offers.currency): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

export function moneyAmount(cents: number): string {
  return (cents / 100).toFixed(2)
}

function priceId(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function priceIdsFromEnv(env: ShopPriceEnv): PriceIds {
  return {
    device: priceId(env.STRIPE_PRICE_NOOKDRY_DEVICE),
    pods: {
      1: priceId(env.STRIPE_PRICE_NOOKDRY_PODS_1),
      3: priceId(env.STRIPE_PRICE_NOOKDRY_PODS_3),
      6: priceId(env.STRIPE_PRICE_NOOKDRY_PODS_6),
    },
    subscription: {
      1: priceId(env.STRIPE_PRICE_NOOKDRY_SUB_1),
      2: priceId(env.STRIPE_PRICE_NOOKDRY_SUB_2),
      3: priceId(env.STRIPE_PRICE_NOOKDRY_SUB_3),
    },
  }
}

export function quoteSelection(selection: Selection): Quote {
  const { offers } = productConfig
  const lines: QuoteLine[] = []
  if (selection.kind === 'device' || selection.kind === 'bundle') {
    lines.push({
      key: 'device',
      name: offers.device.name,
      quantity: selection.quantity,
      unitCents: offers.device.cents,
      lineCents: offers.device.cents * selection.quantity,
      recurring: null,
    })
  }
  if (selection.kind === 'bundle') {
    const unit = offers.subscription.months[selection.frequencyMonths].cents
    const count = selection.frequencyMonths
    lines.push({
      key: 'subscription',
      name: `${offers.subscription.name} (every ${count} ${count === 1 ? 'month' : 'months'})`,
      quantity: selection.quantity,
      unitCents: unit,
      lineCents: unit * selection.quantity,
      recurring: { interval: 'month', intervalCount: count },
    })
  }
  if (selection.kind === 'pods') {
    const pack = offers.pods[selection.packSize]
    lines.push({
      key: 'pods',
      name: pack.name,
      quantity: selection.quantity,
      unitCents: pack.cents,
      lineCents: pack.cents * selection.quantity,
      recurring: null,
    })
  }
  const dueTodayCents = lines.reduce((sum, line) => sum + line.lineCents, 0)
  const recurring = lines.find((line) => line.recurring)
  return {
    currency: offers.currency,
    lines,
    dueTodayCents,
    recurringCents: recurring ? recurring.lineCents : null,
    recurringIntervalMonths: recurring?.recurring?.intervalCount ?? null,
    mode: selection.kind === 'bundle' ? 'subscription' : 'payment',
  }
}

export function quoteSummary(quote: Quote): string {
  return quote.lines.map((line) => `${line.name} × ${line.quantity}`).join('; ')
}

export function buildCheckout(selection: Selection, priceIds: PriceIds): { quote: Quote; lineItems: BuiltLine[] } {
  const quote = quoteSelection(selection)
  const lineItems = quote.lines.map((line): BuiltLine => {
    const id =
      line.key === 'device' ? priceIds.device
      : line.key === 'pods' ? priceIds.pods[selection.packSize]
      : priceIds.subscription[selection.frequencyMonths]
    if (id) return { key: line.key, quantity: line.quantity, priceId: id }
    return {
      key: line.key,
      quantity: line.quantity,
      priceData: {
        currency: quote.currency,
        unitAmount: line.unitCents,
        productName: line.name,
        ...(line.recurring ? { recurring: line.recurring } : {}),
      },
    }
  })
  return { quote, lineItems }
}

export function describeCheckout(
  secret: string | undefined,
  priceIds: PriceIds,
  selection: Selection,
): { configured: boolean; mode: 'off' | 'test' | 'live'; inlinePrices: boolean } {
  const trimmed = secret?.trim() ?? ''
  const mode = !trimmed ? 'off' : trimmed.startsWith('sk_test') || trimmed.startsWith('rk_test') ? 'test' : 'live'
  const built = buildCheckout(selection, priceIds)
  return {
    configured: mode !== 'off',
    mode,
    inlinePrices: built.lineItems.some((line) => !line.priceId),
  }
}

export interface PlaceholderNote {
  id: string
  label: string
  current: string
}

/** Every owner-facing placeholder, so the launch checklist cannot drift from the config. */
export function listPlaceholders(): PlaceholderNote[] {
  const c = productConfig
  const notes: PlaceholderNote[] = [
    { id: 'brand.name', label: 'Parent brand name', current: c.brand.name },
    { id: 'brand.mark', label: 'Logo mark', current: c.brand.mark },
    { id: 'brand.tagline', label: 'Brand tagline', current: c.brand.tagline },
    { id: 'colors', label: 'Brand colors (accent / paper / ink)', current: `${c.colors.accent} / ${c.colors.paper} / ${c.colors.ink}` },
    { id: 'product.previewBanner', label: 'Preview banner (clear when real content ships)', current: c.product.previewBanner },
    { id: 'offers.device', label: 'Device price, one-time', current: formatMoney(c.offers.device.cents) },
    { id: 'offers.subscription.1', label: 'Refill subscription every 1 month', current: formatMoney(c.offers.subscription.months[1].cents) },
    { id: 'offers.subscription.2', label: 'Refill subscription every 2 months', current: formatMoney(c.offers.subscription.months[2].cents) },
    { id: 'offers.subscription.3', label: 'Refill subscription every 3 months', current: formatMoney(c.offers.subscription.months[3].cents) },
    { id: 'offers.pods.1', label: 'One-time 1-pod pack', current: formatMoney(c.offers.pods[1].cents) },
    { id: 'offers.pods.3', label: 'One-time 3-pod pack', current: formatMoney(c.offers.pods[3].cents) },
    { id: 'offers.pods.6', label: 'One-time 6-pod pack', current: formatMoney(c.offers.pods[6].cents) },
    { id: 'shipping.window', label: 'Shipping window', current: c.shipping.window },
    { id: 'shipping.priceLabel', label: 'Shipping price label', current: c.shipping.priceLabel },
    { id: 'shipping.returnsDays', label: 'Return window (days)', current: String(c.shipping.returnsDays) },
    { id: 'shipping.guaranteeDays', label: 'Guarantee (days)', current: String(c.shipping.guaranteeDays) },
    { id: 'shipping.guarantee', label: 'Guarantee copy', current: c.shipping.guarantee },
    { id: 'seo.ogImage', label: 'Social share image', current: c.seo.ogImage },
    { id: 'seo.title', label: 'SEO title', current: c.seo.title },
    { id: 'seo.description', label: 'SEO description', current: c.seo.description },
    { id: 'faq', label: 'FAQ answers (they cite placeholder specs and policies)', current: `${c.faq.length} questions` },
    { id: 'sampleQuotes', label: 'Sample quotes — not real reviews; delete before launch', current: `${c.sampleQuotes.length} quotes` },
    { id: 'heroArt', label: 'Product illustration (inline SVG, not a photograph)', current: 'placeholder' },
    { id: 'manifest', label: 'public/manifest.json name and theme_color', current: 'kept in sync with this config by hand' },
    { id: 'favicon', label: 'public/favicon.ico and logo192/512.png (starter marks)', current: 'starter assets' },
  ]
  for (const spec of c.specs) {
    notes.push({ id: `specs.${spec.id}`, label: `Spec: ${spec.label}`, current: spec.value })
  }
  return notes
}
