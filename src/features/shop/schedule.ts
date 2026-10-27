/** Add calendar months in UTC without overflowing the day (Jan 31 + 1 month = Feb 28/29). */
export function addUtcMonths(ms: number, months: number): number {
  const d = new Date(ms)
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, last))
  return d.getTime()
}

/**
 * Unix seconds when collection should resume so the upcoming renewal is skipped
 * for one cadence. If the current period end is already past, count from `nowMs`.
 */
export function skipResumesAtUnix(currentPeriodEndMs: number, frequencyMonths: number, nowMs = Date.now()): number {
  const base = Math.max(currentPeriodEndMs, nowMs)
  return Math.floor(addUtcMonths(base, frequencyMonths) / 1000)
}
