/**
 * PLACEHOLDER illustration — not a product photograph.
 * Replace with photography before launch; keep the markup so the scroll motion still has a target.
 */
import { productConfig } from '@/features/shop/product.config'

export function DeviceFigure({ snap = false }: { snap?: boolean }) {
  const c = productConfig.colors
  const uid = snap ? 'snap' : 'hero'
  return (
    <div className={snap ? 'nd-device-wrap is-snap' : 'nd-device-wrap'}>
    <svg viewBox="0 0 420 540" role="img" aria-label={`${productConfig.product.name} device illustration`} className="nd-device">
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="48%" stopColor={c.paper} />
          <stop offset="100%" stopColor={c.paperDeep} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f8a6c" />
          <stop offset="100%" stopColor={c.accent} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.34" />
          <stop offset="70%" stopColor={c.accent} stopOpacity="0.05" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="210" cy="486" rx="128" ry="18" fill={c.ink} opacity="0.13" />
      <ellipse cx="214" cy="250" rx="188" ry="196" fill={`url(#${uid}-glow)`} />
      <rect x="136" y="86" width="164" height="352" rx="48" fill={c.ink} opacity="0.14" />

      <rect x="116" y="62" width="172" height="360" rx="50" fill={`url(#${uid}-body)`} />
      <rect x="116" y="62" width="172" height="360" rx="50" fill="none" stroke={c.line} strokeWidth="2" />
      <path d="M154 96c-12 48-10 150 8 250" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="10" strokeLinecap="round" />

      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="164" y={96 + i * 11} width="76" height="3.5" rx="1.5" fill={c.lineStrong} opacity="0.85" />
      ))}

      <rect x="154" y="162" width="96" height="96" rx="30" fill={`url(#${uid}-glass)`} />
      <rect x="162" y="170" width="80" height="80" rx="26" fill={c.accentHover} />
      <circle cx="202" cy="210" r="30" fill={c.accent} />
      <g transform="translate(202 210)">
        <g className="nd-fan">
          {[0, 60, 120].map((deg) => (
            <rect key={deg} x="-3.2" y="-26" width="6.4" height="20" rx="3" fill={c.accentInk} transform={`rotate(${deg})`} />
          ))}
          <circle r="5.5" fill={c.accentInk} />
          <circle r="2.2" fill={c.accent} />
        </g>
      </g>
      <circle cx="258" cy="178" r="4.5" fill={c.clay} />
      <circle cx="258" cy="178" r="2" fill="#f6d3c4" />

      {snap && (
        <g className="nd-mist" fill={c.accentSoft}>
          <circle cx="168" cy="148" r="7" />
          <circle cx="236" cy="140" r="5" />
          <circle cx="202" cy="132" r="6" />
        </g>
      )}

      <path d="M140 292h140" stroke={c.line} strokeWidth="2" />
      <rect x="146" y="308" width="112" height="86" rx="18" fill={c.ink} opacity="0.07" />
      <rect x="188" y="400" width="28" height="8" rx="3" fill={c.ink} opacity="0.4" />
      <path d="M248 96h18" stroke={c.lineStrong} strokeWidth="3" strokeLinecap="round" />
    </svg>
    {snap && <span className="nd-snap-anchor" aria-hidden="true"><span className="nd-snap-ring" /></span>}
    <svg viewBox="0 0 96 70" aria-hidden="true" className="nd-pod-piece">
      <rect width="96" height="70" rx="16" fill={c.card} stroke={c.lineStrong} strokeWidth="1.5" />
      <rect x="12" y="12" width="72" height="18" rx="7" fill={c.accentSoft} />
      <path d="M18 21h28" stroke={c.accent} strokeWidth="2" strokeLinecap="round" />
      <rect x="12" y="38" width="40" height="8" rx="4" fill={c.paperDeep} />
      <rect x="64" y="36" width="20" height="20" rx="7" fill={c.clay} />
      <circle cx="74" cy="46" r="3.2" fill={c.paper} />
    </svg>
    </div>
  )
}

export function HeroArt() {
  return (
    <div className="nd-hero-stage">
      <div className="nd-ring nd-ring-a" aria-hidden="true" />
      <div className="nd-ring nd-ring-b" aria-hidden="true" />
      <div className="nd-hero-device">
        <div className="nd-hero-parallax">
          <div className="nd-float">
            <DeviceFigure />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PodStage() {
  return (
    <div className="nd-pod-stage">
      <DeviceFigure snap />
    </div>
  )
}
