/** Internal path only — blocks protocol-relative and absolute URLs. */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  if (raw.startsWith('/\\')) return null
  if (raw.includes('://')) return null
  if (raw.includes('\\')) return null
  return raw
}

export function parseAuthSearch(s: Record<string, unknown>): { next?: string } {
  return { next: typeof s.next === 'string' ? s.next : undefined }
}
