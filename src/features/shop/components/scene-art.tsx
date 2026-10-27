/**
 * PLACEHOLDER vignettes — illustrated rooms, not photographs.
 * Scene `id` in product.config.ts selects which one renders.
 */
import type { ReactNode } from 'react'
import { productConfig } from '@/features/shop/product.config'

function Mini({ x, y }: { x: number; y: number }) {
  const c = productConfig.colors
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="34" height="54" rx="10" fill={c.card} stroke={c.line} />
      <rect x="7" y="8" width="20" height="16" rx="5" fill={c.accent} />
      <circle cx="17" cy="16" r="3" fill={c.accentInk} />
      <rect x="8" y="30" width="18" height="12" rx="3" fill={c.paperDeep} />
      <rect x="20" y="32" width="6" height="6" rx="1.5" fill={c.clay} />
    </g>
  )
}

function Room({ title, children }: { title: string; children: ReactNode }) {
  const c = productConfig.colors
  return (
    <svg viewBox="0 0 360 230" role="img" aria-label={title} className="nd-vignette">
      <rect width="360" height="230" rx="28" fill={c.paper} />
      <rect x="14" y="14" width="332" height="202" rx="22" fill={c.paperDeep} />
      {children}
    </svg>
  )
}

export function SceneVignette({ id, title }: { id: string; title: string }) {
  const c = productConfig.colors
  switch (id) {
    case 'closet':
      return (
        <Room title={title}>
          <rect x="36" y="36" width="288" height="150" rx="8" fill="#efe7db" />
          <path d="M52 58h256" stroke={c.lineStrong} strokeWidth="4" strokeLinecap="round" />
          <path d="M110 58v18M180 58v18M250 58v18" stroke={c.muted} strokeWidth="2" />
          <path d="M92 76c-18 26-16 70 4 92h36c8-28 2-64-8-92h-32z" fill={c.ink} opacity="0.78" />
          <path d="M168 76c-8 20 0 60 16 88h40c18-30 10-70-6-88h-50z" fill="#3a332c" />
          <path d="M236 78c-6 16 2 48 14 70h28c10-22 6-52-4-70h-38z" fill={c.accent} opacity="0.85" />
          <rect x="48" y="168" width="264" height="8" rx="2" fill={c.line} />
          <ellipse cx="120" cy="150" rx="16" ry="8" fill="#9ec4e0" opacity="0.55" />
          <ellipse cx="210" cy="142" rx="10" ry="6" fill="#9ec4e0" opacity="0.4" />
          <Mini x={270} y={132} />
        </Room>
      )
    case 'cabinet':
      return (
        <Room title={title}>
          <rect x="40" y="40" width="280" height="156" rx="8" fill="#e7dfd2" />
          <g transform="rotate(-16 78 118)">
            <rect x="48" y="48" width="28" height="130" rx="4" fill={c.card} stroke={c.line} />
          </g>
          <g transform="rotate(16 282 118)">
            <rect x="268" y="48" width="28" height="130" rx="4" fill={c.card} stroke={c.line} />
          </g>
          <path d="M150 58c20 10 28 36 18 58" fill="none" stroke={c.muted} strokeWidth="4" strokeLinecap="round" />
          <rect x="168" y="70" width="16" height="36" rx="4" fill={c.accentSoft} stroke={c.accent} />
          <rect x="196" y="78" width="14" height="28" rx="4" fill={c.clay} opacity="0.8" />
          <path d="M120 150h140" stroke={c.lineStrong} strokeWidth="3" />
          <Mini x={156} y={118} />
        </Room>
      )
    case 'drawer':
      return (
        <Room title={title}>
          <rect x="48" y="36" width="264" height="46" rx="8" fill={c.card} stroke={c.line} />
          <rect x="36" y="92" width="288" height="100" rx="12" fill={c.card} stroke={c.lineStrong} />
          <rect x="58" y="108" width="70" height="22" rx="6" fill={c.accentSoft} />
          <rect x="64" y="134" width="78" height="18" rx="6" fill="#d9c7b0" />
          <rect x="150" y="112" width="62" height="36" rx="6" fill={c.paperDeep} />
          <rect x="168" y="128" width="28" height="6" rx="3" fill={c.lineStrong} />
          <Mini x={230} y={112} />
          <rect x="150" y="136" width="36" height="6" rx="3" fill={c.clay} />
        </Room>
      )
    case 'entryway':
      return (
        <Room title={title}>
          <rect x="40" y="32" width="86" height="168" rx="6" fill="#e7dfd2" stroke={c.line} />
          <circle cx="112" cy="120" r="4" fill={c.clay} />
          <path d="M150 48c8 4 10 16 6 24l-8 28h22l6-36c2-12-6-24-16-22-4 0-8 2-10 6z" fill={c.ink} opacity="0.8" />
          <path d="M168 70h8" stroke={c.lineStrong} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="188" cy="168" rx="22" ry="10" fill={c.ink} opacity="0.75" />
          <ellipse cx="230" cy="172" rx="20" ry="9" fill="#3d342c" />
          <rect x="250" y="108" width="70" height="78" rx="8" fill={c.card} stroke={c.line} />
          <Mini x={268} y={122} />
        </Room>
      )
    case 'car':
      return (
        <Room title={title}>
          <path d="M36 150c20-70 70-92 144-92s130 28 150 92v36H36v-36z" fill="#dfe7ea" />
          <path d="M70 132c16-36 48-52 110-52 58 0 96 18 116 52" fill="none" stroke="#f7fbfc" strokeWidth="10" strokeLinecap="round" />
          <circle cx="92" cy="78" r="5" fill="#9ec4e0" opacity="0.7" />
          <circle cx="140" cy="64" r="3.5" fill="#9ec4e0" opacity="0.55" />
          <path d="M48 168c30-28 70-36 120-20 28 8 60 6 100-16 8 20 16 36 16 36H48s0-6 0 0z" fill={c.ink} opacity="0.82" />
          <rect x="78" y="154" width="70" height="28" rx="10" fill="#3a332c" />
          <Mini x={188} y={132} />
        </Room>
      )
    case 'rv':
      return (
        <Room title={title}>
          <rect x="32" y="40" width="296" height="150" rx="16" fill="#e7e2d8" />
          <rect x="48" y="56" width="120" height="70" rx="12" fill="#c5d7e4" />
          <path d="M48 108c20-16 40-8 60-18 18 14 36 10 60 8v28H48v-18z" fill={c.accent} opacity="0.45" />
          <circle cx="78" cy="74" r="6" fill="#f4efe7" opacity="0.8" />
          <rect x="188" y="52" width="120" height="28" rx="6" fill={c.card} stroke={c.line} />
          <path d="M48 150h264" stroke={c.lineStrong} strokeWidth="4" />
          <rect x="56" y="156" width="150" height="22" rx="6" fill={c.ink} opacity="0.18" />
          <Mini x={250} y={124} />
        </Room>
      )
    default:
      return (
        <Room title={title}>
          <Mini x={163} y={88} />
        </Room>
      )
  }
}

export function ProblemMark({ id }: { id: string }) {
  const c = productConfig.colors
  const common = { viewBox: '0 0 72 72', 'aria-hidden': true as const, className: 'nd-mark' }
  if (id === 'cabinet') {
    return (
      <svg {...common}>
        <rect x="10" y="12" width="52" height="48" rx="8" fill={c.accentSoft} />
        <path d="M36 16v40M18 28h10M44 28h10" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="40" r="3" fill={c.clay} />
      </svg>
    )
  }
  if (id === 'car') {
    return (
      <svg {...common}>
        <rect width="72" height="72" rx="18" fill="#e7eef2" />
        <path d="M14 44c6-16 14-22 22-22s16 6 22 22" fill="none" stroke={c.accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M16 46h40" stroke={c.ink} strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="28" r="3" fill="#7eb6d6" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect width="72" height="72" rx="18" fill={c.accentSoft} />
      <path d="M20 24h32M28 24v28M44 24v20" stroke={c.accent} strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="48" r="4" fill="#7eb6d6" />
    </svg>
  )
}
