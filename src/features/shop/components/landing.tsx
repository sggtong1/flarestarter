import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { productConfig } from '@/features/shop/product.config'
import { checkoutSearch, defaultSelection, formatMoney, quoteSelection, type Selection } from '@/features/shop/catalog'
import { frameSpecValue, scrollBand } from '@/features/shop/spec-frame'
import { useTranslation } from '@/features/i18n/provider'
import { buttonVariants } from '@/components/ui/button'
import { BuyBox } from './buy-box'
import { HeroArt, PodStage } from './hero-art'
import { ProblemMark, SceneVignette } from './scene-art'
import { StoreShell } from './store-shell'

const DROPLETS = [0, 10, 18, 28, 36, 46, 54]

export function Landing({
  loggedIn,
  checkoutConfigured,
  preview,
}: {
  loggedIn: boolean
  checkoutConfigured: boolean
  preview: boolean
}) {
  const { t } = useTranslation()
  const unavailable = preview ? t('shop.previewCheckout') : t('shop.notConfigured')
  const [selection, setSelection] = useState<Selection>(defaultSelection)
  const quote = quoteSelection(selection)
  const copy = productConfig.copy
  const ship = productConfig.shipping
  const search = checkoutSearch(selection)
  const offers = productConfig.offers

  return (
    <StoreShell loggedIn={loggedIn}>
      <section id="nd-hero" className="nd-hero">
        <div className="nd-hero-glow" aria-hidden="true" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 py-10 pb-24 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-16 md:pb-16">
          <div>
            <p className="nd-kicker" style={{ color: 'var(--primary)' }}>
              {productConfig.brand.name} · {productConfig.product.name}
            </p>
            <h1 className="nd-display mt-4 text-[3.15rem] leading-[0.95] font-semibold tracking-[-0.045em] md:text-7xl lg:text-[5.35rem]">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: 'var(--fg-2)' }}>
              {copy.heroLede}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#buy" className={buttonVariants({ size: 'lg', className: 'nd-press' })}>{copy.primaryCta}</a>
              <a href="#how" className={buttonVariants({ size: 'lg', variant: 'outline', className: 'nd-press' })}>{copy.secondaryCta}</a>
            </div>
            <p className="mt-6 text-sm" style={{ color: 'var(--fg-3)' }}>
              {ship.priceLabel} · {ship.returnsDays}-day returns · Skip or cancel refills anytime
            </p>
          </div>
          <HeroArt />
        </div>
      </section>

      <section className="nd-reveal border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.problemKicker}</p>
          <h2 className="nd-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{copy.problemTitle}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--fg-2)' }}>{copy.problemLede}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.problems.map((item) => (
              <article key={item.id} className="nd-card rounded-3xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <ProblemMark id={item.id} />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="nd-story nd-story-how">
        <div className="nd-story-pin mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="nd-how-layout">
            <div>
              <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.howKicker}</p>
              <h2 className="nd-display mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.howTitle}</h2>
              <div className="nd-how-steps mt-6">
                {copy.steps.map((step, index) => (
                  <article
                    key={step.n}
                    className={`nd-how-step ${stepClass(index, copy.steps.length)}`}
                    style={{ animationRange: scrollBand(index, copy.steps.length) }}
                  >
                    <p className="font-mono text-sm" style={{ color: 'var(--fg-3)' }}>{step.n}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{step.title}</h3>
                    <p className="mt-2 max-w-md text-base leading-relaxed" style={{ color: 'var(--fg-2)' }}>{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <PodStage />
          </div>
        </div>
      </section>

      <section id="spaces" className="nd-story nd-story-spaces">
        <div className="nd-story-pin relative mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="nd-droplets" aria-hidden="true">
            {DROPLETS.map((start) => (
              <span key={start} className="nd-droplet" style={{ animationRange: `${start}% ${start + 38}%` }} />
            ))}
          </div>
          <header className="relative z-[3] max-w-xl">
            <p className="nd-kicker" style={{ color: '#9dcebb' }}>{copy.scenesKicker}</p>
            <h2 className="nd-display mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.scenesTitle}</h2>
          </header>
          <div className="nd-scene-stack relative z-[1] mt-6">
            {copy.scenes.map((scene, index) => (
              <article
                key={scene.id}
                className={`nd-scene ${stepClass(index, copy.scenes.length)}`}
                style={{ animationRange: scrollBand(index, copy.scenes.length) }}
              >
                <SceneVignette id={scene.id} title={scene.title} />
                <div>
                  <p className="font-mono text-xs" style={{ color: '#9dcebb' }}>{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 text-3xl font-semibold tracking-tight">{scene.title}</h3>
                  <p className="mt-2 text-base leading-relaxed" style={{ color: '#d9d0c4' }}>{scene.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="nd-meter" aria-hidden="true">
            <div className="nd-meter-fill" />
          </div>
        </div>
      </section>

      <section className="nd-reveal mx-auto grid max-w-6xl items-start gap-8 px-4 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-6 md:py-28">
        <div>
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.buyKicker}</p>
          <h2 className="nd-display mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.buyTitle}</h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--fg-2)' }}>
            {ship.priceLabel}. {ship.window}.
          </p>
        </div>
        <BuyBox
          selection={selection}
          onChange={setSelection}
          cta={
            checkoutConfigured ? (
              <Link to="/{-$locale}/checkout" search={search} className={buttonVariants({ size: 'lg', className: 'nd-press w-full' })}>
                {t('shop.checkoutCta')}
              </Link>
            ) : (
              <p className="rounded-2xl px-4 py-3 text-sm leading-relaxed" role="status" style={{ background: 'var(--bg-alt)', color: 'var(--fg-2)' }}>
                {unavailable}
              </p>
            )
          }
        />
      </section>

      <section id="specs" className="nd-reveal border-y" style={{ borderColor: 'var(--border)', background: 'linear-gradient(180deg, var(--bg-alt), var(--background))' }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.specsKicker}</p>
          <h2 className="nd-display mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{copy.specsTitle}</h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--fg-3)' }}>{copy.specsNote}</p>
          <dl className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {productConfig.specs.map((spec) => (
              <div key={spec.id} className="nd-card rounded-3xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <dt className="text-sm" style={{ color: 'var(--fg-3)' }}>{spec.label}</dt>
                <dd className="mt-2 text-3xl font-semibold tracking-tight">
                  <SpecValue value={spec.value} />
                </dd>
                <dd className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{spec.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="subscription" className="nd-reveal mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
        <div>
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.subKicker}</p>
          <h2 className="nd-display mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.subTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--fg-2)' }}>{copy.subLede}</p>
          <div className="mt-8 grid gap-4">
            {copy.subPoints.map((point) => (
              <article key={point.title} className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{point.body}</p>
              </article>
            ))}
          </div>
        </div>
        <ol className="nd-timeline">
          <li className="nd-tl" style={{ animationRange: 'entry 0% cover 26%' }}>
            <span className="nd-tl-mark" aria-hidden="true" />
            <span className="font-semibold">{offers.device.name}</span>
            <span className="text-sm tabular-nums" style={{ color: 'var(--fg-2)' }}>{formatMoney(offers.device.cents)}</span>
          </li>
          {([1, 2, 3] as const).map((months) => (
            <li key={months} className="nd-tl" style={{ animationRange: `entry ${16 + months * 14}% cover ${34 + months * 12}%` }}>
              <span className="nd-tl-mark" aria-hidden="true" />
              <span className="font-semibold">{offers.subscription.name}</span>
              <span className="text-sm tabular-nums" style={{ color: 'var(--fg-2)' }}>
                {formatMoney(offers.subscription.months[months].cents)} · {months === 1 ? t('shop.month1') : t('shop.monthN', { n: months })}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="nd-reveal border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.compareKicker}</p>
          <h2 className="nd-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{copy.compareTitle}</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr style={{ color: 'var(--fg-3)' }}>
                  <th className="py-3 pr-4 font-medium" />
                  <th className="py-3 pr-4 font-medium">{copy.compareTubs}</th>
                  <th className="nd-nook py-3 font-semibold" style={{ color: 'var(--primary)' }}>{copy.compareNook}</th>
                </tr>
              </thead>
              <tbody>
                {copy.comparison.map((row) => (
                  <tr key={row.label} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <th className="py-4 pr-4 font-medium">{row.label}</th>
                    <td className="py-4 pr-4" style={{ color: 'var(--fg-2)' }}>{row.tubs}</td>
                    <td className="nd-nook py-4 pr-3 pl-3">{row.nook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {productConfig.sampleQuotes.length > 0 && (
        <section className="nd-reveal mx-auto max-w-6xl px-4 py-20 md:px-6" aria-label={copy.quotesTitle}>
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.quotesKicker}</p>
          <h2 className="nd-display mt-3 text-4xl font-semibold tracking-tight">{copy.quotesTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm" style={{ color: 'var(--fg-3)' }}>{copy.quotesDisclaimer}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {productConfig.sampleQuotes.map((item) => (
              <figure key={item.name} className="nd-card rounded-3xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <blockquote className="text-lg leading-relaxed tracking-tight">“{item.quote}”</blockquote>
                <figcaption className="mt-5 text-sm" style={{ color: 'var(--fg-2)' }}>
                  {item.name}
                  <span style={{ color: 'var(--fg-3)' }}> · {item.context}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section id="faq" className="nd-faq nd-reveal border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
          <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.faqKicker}</p>
          <h2 className="nd-display mt-3 text-4xl font-semibold tracking-tight">{copy.faqTitle}</h2>
          <div className="mt-8">
            {productConfig.faq.map((item) => (
              <details key={item.q} className="border-b" style={{ borderColor: 'var(--border)' }}>
                <summary className="py-5 text-lg font-semibold">{item.q}</summary>
                <p className="pb-5 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="guarantee" className="nd-reveal mx-auto max-w-6xl px-4 py-20 md:px-6">
        <p className="nd-kicker" style={{ color: 'var(--primary)' }}>{copy.guaranteeKicker}</p>
        <h2 className="nd-display mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.guaranteeTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Policy title={ship.priceLabel} body={ship.window} />
          <Policy title={`${ship.returnsDays}-day returns`} body="Send the device back if it is not for you." />
          <Policy title={`${ship.guaranteeDays}-day guarantee`} body={ship.guarantee} />
        </div>
      </section>

      <section className="px-4 pb-28 md:px-6 md:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-14 md:px-14 md:py-20" style={{ background: productConfig.colors.accent, color: productConfig.colors.accentInk }}>
          <div className="pointer-events-none absolute -top-16 -right-10 w-64 opacity-25" aria-hidden="true">
            <HeroMark />
          </div>
          <h2 className="nd-display relative max-w-xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{copy.finalTitle}</h2>
          <p className="relative mt-4 max-w-xl text-lg leading-relaxed" style={{ color: 'color-mix(in srgb, var(--primary-foreground) 86%, transparent)' }}>{copy.finalLede}</p>
          <p className="relative mt-8 text-4xl font-semibold tabular-nums tracking-tight">{formatMoney(quote.dueTodayCents)}</p>
          {checkoutConfigured ? (
            <Link to="/{-$locale}/checkout" search={search} className="nd-press relative mt-6 inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold" style={{ color: productConfig.colors.ink }}>
              {copy.primaryCta}
            </Link>
          ) : (
            <p className="relative mt-6 max-w-md rounded-2xl bg-white/15 px-4 py-3 text-sm leading-relaxed" role="status">
              {unavailable}
            </p>
          )}
        </div>
      </section>

      <div className="nd-buybar fixed inset-x-0 bottom-0 z-40 border-t md:hidden" style={{ background: 'color-mix(in srgb, var(--card) 94%, transparent)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs" style={{ color: 'var(--fg-2)' }}>{productConfig.product.name}</p>
            <p className="font-semibold tabular-nums">{formatMoney(quote.dueTodayCents)}</p>
          </div>
          {checkoutConfigured ? (
            <Link to="/{-$locale}/checkout" search={search} className="nd-press ml-auto rounded-full px-4 py-2.5 text-sm font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {t('shop.checkoutCta')}
            </Link>
          ) : (
            <p className="ml-auto max-w-[12rem] text-right text-xs leading-snug" role="status" style={{ color: 'var(--fg-2)' }}>
              {unavailable}
            </p>
          )}
        </div>
      </div>
    </StoreShell>
  )
}

function stepClass(index: number, count: number): string {
  if (index === 0) return 'is-first'
  if (index === count - 1) return 'is-last'
  return 'is-mid'
}

function SpecValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      obs.disconnect()
      const started = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - started) / 1600)
        const eased = 1 - (1 - p) ** 3
        setText(p >= 1 ? value : frameSpecValue(value, eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return <span ref={ref} aria-label={value}>{text}</span>
}

function Policy({ title, body }: { title: string; body: string }) {
  return (
    <article className="nd-card rounded-3xl border p-6" style={{ borderColor: 'var(--border)' }}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>{body}</p>
    </article>
  )
}

function HeroMark() {
  return (
    <svg viewBox="0 0 80 120" className="h-auto w-full" aria-hidden="true">
      <rect width="80" height="120" rx="22" fill="white" />
      <rect x="18" y="22" width="44" height="36" rx="12" fill={productConfig.colors.accentHover} />
      <circle cx="40" cy="40" r="8" fill="white" />
    </svg>
  )
}
