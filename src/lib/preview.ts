/**
 * Staging-only public preview. `APP_ENV` is a plain Wrangler var set to
 * "staging" in `env.staging` and left blank everywhere else, so production
 * and local dev stay on the normal path.
 *
 * Pure on purpose: the worker entry, robots route, and node tests can share
 * it without importing `cloudflare:workers`.
 */

export const PREVIEW_ROBOTS = 'noindex, nofollow'

export const PREVIEW_BANNER =
  'Preview build — prices, specs, and reviews are sample content, not real offers.'

export function isStagingPreview(appEnv: string | undefined | null): boolean {
  return appEnv === 'staging'
}

/** robots.txt body for the staging preview. Disallow the whole origin. */
export function previewRobotsTxt(): string {
  return ['User-agent: *', 'Disallow: /', ''].join('\n')
}

/**
 * Attach `X-Robots-Tag` on staging responses. Production responses are
 * returned unchanged. Protocol upgrades are left alone.
 */
export function withPreviewRobots(res: Response, appEnv: string | undefined | null): Response {
  if (!isStagingPreview(appEnv)) return res
  const isUpgrade = res.status === 101 || (res as { webSocket?: unknown }).webSocket != null
  if (isUpgrade) return res
  const headers = new Headers(res.headers)
  headers.set('X-Robots-Tag', PREVIEW_ROBOTS)
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}
