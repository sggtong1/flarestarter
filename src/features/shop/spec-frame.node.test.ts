import { describe, expect, it } from 'vitest'
import { frameSpecValue, scrollBand } from './spec-frame'

describe('frameSpecValue', () => {
  it('restores placeholder spec strings at the end of the count', () => {
    expect(frameSpecValue('Up to 25 sq ft', 1)).toBe('Up to 25 sq ft')
    expect(frameSpecValue('7.1 × 4.3 × 4.3 in', 1)).toBe('7.1 × 4.3 × 4.3 in')
    expect(frameSpecValue('About 30 days', 1)).toBe('About 30 days')
  })

  it('starts from zero and keeps the unit words', () => {
    expect(frameSpecValue('350 ml', 0)).toBe('0 ml')
    expect(frameSpecValue('Under 28 dB', 0)).toBe('Under 0 dB')
    expect(frameSpecValue('2.4 lb', 0.5)).toBe('1.2 lb')
  })
})

describe('scrollBand', () => {
  it('covers the full timeline and overlaps neighbors', () => {
    const first = scrollBand(0, 6)
    const last = scrollBand(5, 6)
    expect(first.startsWith('0.00%')).toBe(true)
    expect(last.endsWith('100.00%')).toBe(true)
    const mid = scrollBand(2, 3)
    expect(mid.endsWith('100.00%')).toBe(true)
  })
})
