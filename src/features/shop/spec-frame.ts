/** Interpolate every number in a spec string. 0 collapses them; 1 restores the written value. */
export function frameSpecValue(template: string, progress: number): string {
  const t = Math.min(1, Math.max(0, progress))
  return template.replace(/\d+(?:\.\d+)?/g, (raw) => {
    const target = Number(raw)
    const current = target * t
    if (raw.includes('.')) {
      const decimals = raw.split('.')[1]?.length ?? 1
      return current.toFixed(decimals)
    }
    return String(Math.round(current))
  })
}

/** Scroll-timeline window for item `index` of `count`, with a short crossfade overlap. */
export function scrollBand(index: number, count: number): string {
  const slot = 100 / count
  const pad = slot * 0.22
  const start = Math.max(0, index * slot - pad)
  const end = Math.min(100, (index + 1) * slot + pad)
  return `${start.toFixed(2)}% ${end.toFixed(2)}%`
}
