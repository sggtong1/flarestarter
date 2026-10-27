import { test, expect } from 'vitest'
import { isStagingPreview, previewRobotsTxt, withPreviewRobots, PREVIEW_ROBOTS } from './preview'

test('only the staging app env is a preview', () => {
  expect(isStagingPreview('staging')).toBe(true)
  expect(isStagingPreview('production')).toBe(false)
  expect(isStagingPreview('')).toBe(false)
  expect(isStagingPreview(undefined)).toBe(false)
  expect(isStagingPreview(null)).toBe(false)
  expect(isStagingPreview('staging ')).toBe(false)
})

test('preview robots.txt disallows the whole site and lists no sitemap', () => {
  const body = previewRobotsTxt()
  expect(body).toContain('User-agent: *')
  expect(body).toContain('Disallow: /')
  expect(body).not.toContain('Allow:')
  expect(body).not.toContain('Sitemap:')
})

test('staging responses gain an X-Robots-Tag and keep status and body', async () => {
  const res = withPreviewRobots(new Response('hello', { status: 200, headers: { 'content-type': 'text/html' } }), 'staging')
  expect(res.headers.get('x-robots-tag')).toBe(PREVIEW_ROBOTS)
  expect(res.headers.get('content-type')).toContain('text/html')
  expect(res.status).toBe(200)
  expect(await res.text()).toBe('hello')
})

test('non-staging responses are not retagged', () => {
  const original = new Response('ok')
  expect(withPreviewRobots(original, 'production')).toBe(original)
  expect(withPreviewRobots(original, undefined)).toBe(original)
  expect(withPreviewRobots(original, '')).toBe(original)
})

test('protocol upgrades pass through on staging', () => {
  const status101 = { status: 101 } as unknown as Response
  expect(withPreviewRobots(status101, 'staging')).toBe(status101)
  const wsResponse = { status: 200, webSocket: {} } as unknown as Response
  expect(withPreviewRobots(wsResponse, 'staging')).toBe(wsResponse)
})
