import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { localeHead } from '@/features/seo/seo'
import { getOrigin } from '@/features/seo/seo.fns'
import type { Locale } from '@/features/i18n/locale'
import { productConfig } from '@/features/shop/product.config'
import { storeJsonLd } from '@/features/shop/jsonld'
import { shopCheckoutStatusFn } from '@/features/shop/actions'
import { Landing } from '@/features/shop/components/landing'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/{-$locale}/')({
  loader: async () => {
    const origin = await getOrigin()
    const status = await shopCheckoutStatusFn({ data: {} })
    return { origin, checkoutConfigured: status.configured }
  },
  head: ({ loaderData, params }) => {
    const origin = loaderData?.origin ?? ''
    const locale = ((params as { locale?: string }).locale ?? 'en') as Locale
    const title = productConfig.seo.title
    const description = productConfig.seo.description
    const { meta, links } = localeHead({ origin, locale, path: '/', title, description })
    const image = `${origin}${productConfig.seo.ogImage}`
    const nextMeta = meta.map((item) => (item.property === 'og:image' ? { ...item, content: image } : item))
    nextMeta.push(
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: productConfig.brand.name },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    )
    return { meta: nextMeta, links }
  },
  component: Home,
})

function Home() {
  const { user, preview } = rootRoute.useLoaderData()
  const { origin, checkoutConfigured } = Route.useLoaderData()
  const jsonLd = JSON.stringify(storeJsonLd(origin)).replace(/</g, '\\u003c')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Landing loggedIn={!!user} checkoutConfigured={checkoutConfigured} preview={preview} />
    </>
  )
}
