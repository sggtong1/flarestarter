import { formatMoney, listPlaceholders } from './catalog'
import { productConfig } from './product.config'

/** Product brief for /llms.txt. States plainly that prices, specs, and quotes are placeholders. */
export function productLlms(origin = ''): string {
  const c = productConfig
  const home = origin || '/'
  const lines = [
    `# ${c.product.name}`,
    '',
    `${c.product.name} is a cordless, rechargeable dehumidifier for small closed spaces: closets, cabinets, drawers, entryways, cars, and RVs. The parent brand name is configurable (${c.brand.name} is a placeholder).`,
    '',
    'The commercial offer is a one-time device plus a refill-pod subscription (every 1, 2, or 3 months). The bundle is the primary way to buy. Device-only checkout and one-time pod packs (1, 3, or 6) are secondary.',
    '',
    '## Placeholder notice',
    '',
    'Prices, specifications, shipping, the guarantee, photography, and quotes on the site are placeholders. Sample quotes are layout content, not reviews from customers. Do not cite them as measured facts or testimonials.',
    '',
    '## Placeholder inventory',
    '',
    ...listPlaceholders().map((note) => `- ${note.label}: ${note.current}`),
    '',
    '## Prices (placeholder USD)',
    '',
    `- Device: ${formatMoney(c.offers.device.cents)} once`,
    `- Refill every month: ${formatMoney(c.offers.subscription.months[1].cents)}`,
    `- Refill every 2 months: ${formatMoney(c.offers.subscription.months[2].cents)} (recommended)`,
    `- Refill every 3 months: ${formatMoney(c.offers.subscription.months[3].cents)}`,
    `- Pod pack of 1: ${formatMoney(c.offers.pods[1].cents)}`,
    `- Pod pack of 3: ${formatMoney(c.offers.pods[3].cents)}`,
    `- Pod pack of 6: ${formatMoney(c.offers.pods[6].cents)}`,
    '',
    'A bundle charges the device and the first pod today, then the pod price on the chosen cadence. Subscriptions can be skipped for one cycle, moved between cadences, or canceled at the end of the current period. The device is kept after cancel.',
    '',
    '## Pages',
    '',
    `- ${home} — product landing page`,
    `- ${origin}/checkout — plan, quantity, then Stripe Checkout (test mode when the secret key is sk_test)`,
    `- ${origin}/llms.txt — this file, followed by the docs index`,
    '',
    '## FAQ',
    '',
    ...c.faq.flatMap((item) => [`### ${item.q}`, '', item.a, '']),
    '',
    'Content and prices are edited in src/features/shop/product.config.ts. Stripe Price ids, when set, override the inline placeholder amounts at charge time.',
  ]
  return lines.join('\n')
}
