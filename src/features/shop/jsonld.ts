import { moneyAmount } from './catalog'
import { productConfig } from './product.config'

/** Product + Offer + FAQPage + Organization for the storefront. Prices are the config placeholders. */
export function storeJsonLd(origin: string) {
  const c = productConfig
  const orgId = `${origin}/#organization`
  const productId = `${origin}/#nookdry`
  const image = `${origin}${c.seo.ogImage}`
  const offers: Record<string, unknown>[] = [
    {
      '@type': 'Offer',
      name: c.offers.device.name,
      sku: 'NOOKDRY-DEVICE',
      priceCurrency: 'USD',
      price: moneyAmount(c.offers.device.cents),
      availability: 'https://schema.org/InStock',
      url: `${origin}/checkout?offer=device`,
    },
  ]
  for (const months of [1, 2, 3] as const) {
    const cents = c.offers.subscription.months[months].cents
    offers.push({
      '@type': 'Offer',
      name: `${c.offers.subscription.name} (every ${months} ${months === 1 ? 'month' : 'months'})`,
      sku: `NOOKDRY-SUB-${months}`,
      priceCurrency: 'USD',
      price: moneyAmount(cents),
      availability: 'https://schema.org/InStock',
      url: `${origin}/checkout?offer=bundle&every=${months}`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: moneyAmount(cents),
        priceCurrency: 'USD',
        billingDuration: `P${months}M`,
        unitText: 'pod delivery',
      },
    })
  }
  for (const size of [1, 3, 6] as const) {
    const pack = c.offers.pods[size]
    offers.push({
      '@type': 'Offer',
      name: pack.name,
      sku: `NOOKDRY-PODS-${size}`,
      priceCurrency: 'USD',
      price: moneyAmount(pack.cents),
      availability: 'https://schema.org/InStock',
      url: `${origin}/checkout?offer=pods&pack=${size}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: c.brand.name,
        url: origin,
        logo: image,
      },
      {
        '@type': 'Product',
        '@id': productId,
        name: c.product.name,
        description: c.seo.description,
        image,
        brand: { '@type': 'Brand', name: c.brand.name },
        category: 'Dehumidifier',
        offers,
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}
