import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { productConfig } from '@/features/shop/product.config'
import { checkoutSearch, defaultSelection, formatMoney, quoteSelection, type Selection } from '@/features/shop/catalog'
import { useTranslation } from '@/features/i18n/provider'
import { buttonVariants } from '@/components/ui/button'
import { BuyBox } from './buy-box'
import { HeroArt } from './hero-art'
import { StoreShell } from './store-shell'

export function Landing({ loggedIn }: { loggedIn: boolean }) {
  const { t } = useTranslation()
  const [selection, setSelection] = useState<Selection>(defaultSelection)
  const quote = quoteSelection(selection)
  const copy = productConfig.copy
  const ship = productConfig.shipping
  const search = checkoutSearch(selection)

  return (
    <StoreShell loggedIn={loggedIn}>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
            {productConfig.brand.name} · {productConfig.product.name}
          </p>
          <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-semibold tracking-tight md:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            {copy.heroLede}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#buy" className={buttonVariants({ size: 'lg' })}>{copy.primaryCta}</a>
            <a href="#how" className={buttonVariants({ size: 'lg', variant: 'outline' })}>{copy.secondaryCta}</a>
          </div>
          <p className="mt-6 text-sm" style={{ color: 'var(--fg-3)' }}>
            {ship.priceLabel} · {ship.returnsDays}-day returns · Skip or cancel refills anytime
          </p>
        </div>
        <div className="nd-float">
          <HeroArt />
        </div>
      </section>

      <section className="nd-reveal border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.problemKicker}</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{copy.problemTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--fg-2)' }}>{copy.problemLede}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.problems.map((item) => (
              <article key={item.title} className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="nd-reveal mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.howKicker}</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{copy.howTitle}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {copy.steps.map((step) => (
            <li key={step.n}>
              <p className="font-mono text-sm" style={{ color: 'var(--fg-3)' }}>{step.n}</p>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="spaces" className="nd-reveal" style={{ background: productConfig.colors.ink, color: productConfig.colors.paper }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <p className="text-sm font-medium" style={{ color: '#9dcebb' }}>{copy.scenesKicker}</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{copy.scenesTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {copy.scenes.map((scene) => (
              <article key={scene.title} className="rounded-2xl p-5" style={{ background: '#2a251f' }}>
                <h3 className="text-lg font-semibold">{scene.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#d9d0c4' }}>{scene.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nd-reveal mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1fr_1.1fr] md:px-6 md:py-24">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.buyKicker}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{copy.buyTitle}</h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            {productConfig.shipping.priceLabel}. {productConfig.shipping.window}.
          </p>
        </div>
        <BuyBox
          selection={selection}
          onChange={setSelection}
          cta={
            <Link to="/{-$locale}/checkout" search={search} className={buttonVariants({ size: 'lg', className: 'w-full' })}>
              {t('shop.checkoutCta')}
            </Link>
          }
        />
      </section>

      <section id="specs" className="nd-reveal border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.specsKicker}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{copy.specsTitle}</h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--fg-3)' }}>{copy.specsNote}</p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {productConfig.specs.map((spec) => (
              <div key={spec.id} className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <dt className="text-sm" style={{ color: 'var(--fg-3)' }}>{spec.label}</dt>
                <dd className="mt-1 text-xl font-semibold">{spec.value}</dd>
                <dd className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{spec.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="subscription" className="nd-reveal mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.subKicker}</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{copy.subTitle}</h2>
        <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: 'var(--fg-2)' }}>{copy.subLede}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.subPoints.map((point) => (
            <article key={point.title} className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="nd-reveal border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.compareKicker}</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{copy.compareTitle}</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--fg-3)' }}>
                  <th className="py-3 pr-4 font-medium" />
                  <th className="py-3 pr-4 font-medium">{copy.compareTubs}</th>
                  <th className="py-3 font-semibold" style={{ color: 'var(--primary)' }}>{copy.compareNook}</th>
                </tr>
              </thead>
              <tbody>
                {copy.comparison.map((row) => (
                  <tr key={row.label} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <th className="py-4 pr-4 font-medium">{row.label}</th>
                    <td className="py-4 pr-4" style={{ color: 'var(--fg-2)' }}>{row.tubs}</td>
                    <td className="py-4">{row.nook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {productConfig.sampleQuotes.length > 0 && (
        <section className="nd-reveal mx-auto max-w-6xl px-4 py-16 md:px-6" aria-label={copy.quotesTitle}>
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.quotesKicker}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{copy.quotesTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm" style={{ color: 'var(--fg-3)' }}>{copy.quotesDisclaimer}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {productConfig.sampleQuotes.map((quote) => (
              <figure key={quote.name} className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <blockquote className="text-base leading-relaxed">“{quote.quote}”</blockquote>
                <figcaption className="mt-4 text-sm" style={{ color: 'var(--fg-2)' }}>
                  {quote.name}
                  <span style={{ color: 'var(--fg-3)' }}> · {quote.context}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section id="faq" className="nd-reveal border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
          <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.faqKicker}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{copy.faqTitle}</h2>
          <div className="mt-6">
            {productConfig.faq.map((item) => (
              <details key={item.q} className="border-b" style={{ borderColor: 'var(--border)' }}>
                <summary className="cursor-pointer py-4 font-semibold">{item.q}</summary>
                <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="guarantee" className="nd-reveal mx-auto max-w-6xl px-4 py-16 md:px-6">
        <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{copy.guaranteeKicker}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{copy.guaranteeTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Policy title={ship.priceLabel} body={ship.window} />
          <Policy title={`${ship.returnsDays}-day returns`} body="Send the device back if it is not for you." />
          <Policy title={`${ship.guaranteeDays}-day guarantee`} body={ship.guarantee} />
        </div>
      </section>

      <section className="px-4 pb-28 md:px-6 md:pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl px-6 py-12 md:px-12" style={{ background: productConfig.colors.accent, color: productConfig.colors.accentInk }}>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{copy.finalTitle}</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'color-mix(in srgb, var(--primary-foreground) 84%, transparent)' }}>{copy.finalLede}</p>
          <p className="mt-6 text-2xl font-semibold tabular-nums">{formatMoney(quote.dueTodayCents)}</p>
          <Link to="/{-$locale}/checkout" search={search} className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold" style={{ color: productConfig.colors.ink }}>
            {copy.primaryCta}
          </Link>
        </div>
      </section>

      <div className="nd-sticky fixed inset-x-0 bottom-0 z-40 border-t md:hidden" style={{ background: 'color-mix(in srgb, var(--card) 94%, transparent)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs" style={{ color: 'var(--fg-2)' }}>{productConfig.product.name}</p>
            <p className="font-semibold tabular-nums">{formatMoney(quote.dueTodayCents)}</p>
          </div>
          <Link to="/{-$locale}/checkout" search={search} className="ml-auto rounded-full px-4 py-2.5 text-sm font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {t('shop.checkoutCta')}
          </Link>
        </div>
      </div>
    </StoreShell>
  )
}

function Policy({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{body}</p>
    </article>
  )
}
