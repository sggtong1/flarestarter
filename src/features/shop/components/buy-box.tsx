import type { ReactNode } from 'react'
import { productConfig } from '@/features/shop/product.config'
import {
  FREQUENCIES,
  MAX_QUANTITY,
  PACK_SIZES,
  formatMoney,
  parseSelection,
  quoteSelection,
  type FrequencyMonths,
  type PodPackSize,
  type Selection,
} from '@/features/shop/catalog'
import { useTranslation } from '@/features/i18n/provider'

export function BuyBox({
  selection,
  onChange,
  cta,
  busy = false,
}: {
  selection: Selection
  onChange: (next: Selection) => void
  cta?: ReactNode
  busy?: boolean
}) {
  const { t } = useTranslation()
  const quote = quoteSelection(selection)
  const copy = productConfig.copy
  const offers = productConfig.offers

  function patch(partial: Partial<Selection>) {
    const next = parseSelection({ ...selection, ...partial })
    if (next) onChange(next)
  }

  const unit = selection.frequencyMonths === 1 ? t('shop.month') : t('shop.months')

  return (
    <div id="buy" className="rounded-3xl border p-4 md:p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="grid gap-2">
        <OfferButton
          pressed={selection.kind === 'bundle'}
          title={t('shop.deviceBundle')}
          badge={t('shop.recommended')}
          detail={copy.includes}
          onClick={() => patch({ kind: 'bundle' })}
        />
        <OfferButton
          pressed={selection.kind === 'device'}
          title={t('shop.deviceOnly')}
          detail={copy.deviceOnlyNote}
          onClick={() => patch({ kind: 'device' })}
        />
        <OfferButton
          pressed={selection.kind === 'pods'}
          title={t('shop.podPacks')}
          detail={copy.podsNote}
          onClick={() => patch({ kind: 'pods' })}
        />
      </div>

      {selection.kind === 'bundle' && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>{t('shop.frequency')}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FREQUENCIES.map((months) => (
              <Choice
                key={months}
                pressed={selection.frequencyMonths === months}
                label={months === 1 ? t('shop.month1') : t('shop.monthN', { n: months })}
                hint={formatMoney(offers.subscription.months[months].cents)}
                onClick={() => patch({ frequencyMonths: months as FrequencyMonths })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {selection.kind === 'pods' && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium" style={{ color: 'var(--fg-2)' }}>{t('shop.podPacks')}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PACK_SIZES.map((size) => {
              const pack = offers.pods[size]
              return (
                <Choice
                  key={size}
                  pressed={selection.packSize === size}
                  label={t('shop.packOf', { n: size })}
                  hint={t('shop.perPod', { price: formatMoney(Math.round(pack.cents / pack.pods)) })}
                  onClick={() => patch({ packSize: size as PodPackSize })}
                />
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{t('shop.qty')}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-10 w-10 rounded-full border text-lg"
            style={{ borderColor: 'var(--border-strong)' }}
            aria-label={t('shop.qtyDecrease')}
            disabled={busy || selection.quantity <= 1}
            onClick={() => patch({ quantity: selection.quantity - 1 })}
          >
            −
          </button>
          <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{selection.quantity}</span>
          <button
            type="button"
            className="h-10 w-10 rounded-full border text-lg"
            style={{ borderColor: 'var(--border-strong)' }}
            aria-label={t('shop.qtyIncrease')}
            disabled={busy || selection.quantity >= MAX_QUANTITY}
            onClick={() => patch({ quantity: selection.quantity + 1 })}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--fg-2)' }}>{t('shop.dueToday')}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{formatMoney(quote.dueTodayCents)}</p>
        {quote.recurringCents != null && quote.recurringIntervalMonths != null && (
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-2)' }}>
            {t('shop.thenEvery', {
              price: formatMoney(quote.recurringCents),
              count: quote.recurringIntervalMonths,
              unit,
            })}
          </p>
        )}
        <ul className="mt-3 space-y-1 text-sm" style={{ color: 'var(--fg-2)' }}>
          {quote.lines.map((line) => (
            <li key={line.key} className="flex justify-between gap-3">
              <span>{line.name} × {line.quantity}</span>
              <span className="tabular-nums">{formatMoney(line.lineCents)}</span>
            </li>
          ))}
        </ul>
      </div>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  )
}

function OfferButton({
  pressed,
  title,
  detail,
  badge,
  onClick,
}: {
  pressed: boolean
  title: string
  detail: string
  badge?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="rounded-2xl border px-4 py-3 text-left transition-colors"
      style={{
        borderColor: pressed ? 'var(--primary)' : 'var(--border)',
        background: pressed ? 'var(--soft)' : 'transparent',
      }}
    >
      <span className="flex items-center gap-2">
        <span className="font-semibold">{title}</span>
        {badge && (
          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {badge}
          </span>
        )}
      </span>
      <span className="mt-1 block text-sm leading-snug" style={{ color: 'var(--fg-2)' }}>{detail}</span>
    </button>
  )
}

function Choice({
  pressed,
  label,
  hint,
  onClick,
}: {
  pressed: boolean
  label: string
  hint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="rounded-xl border px-2 py-2 text-center"
      style={{
        borderColor: pressed ? 'var(--primary)' : 'var(--border)',
        background: pressed ? 'var(--soft)' : 'transparent',
      }}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-0.5 block text-xs tabular-nums" style={{ color: 'var(--fg-2)' }}>{hint}</span>
    </button>
  )
}
