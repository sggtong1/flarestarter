import { productConfig } from '@/features/shop/product.config'

/** Wordmark from the store config. `compact` renders the mark only. */
export function Logo({ size = 18, compact = false }: { size?: number; compact?: boolean }) {
  const { brand, colors } = productConfig
  return (
    <span
      className="inline-flex items-center gap-[9px] font-display font-semibold tracking-[-0.3px] text-foreground"
      style={{ fontSize: size }}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-lg text-[13px] font-bold"
        style={{
          width: 28,
          height: 28,
          background: colors.accent,
          color: colors.accentInk,
        }}
      >
        {brand.mark}
      </span>
      {!compact && <span>{brand.name}</span>}
    </span>
  )
}
