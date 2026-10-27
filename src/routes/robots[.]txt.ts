import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/lib/env'
import { buildRobots } from '@/features/seo/seo'
import { isStagingPreview, previewRobotsTxt } from '@/lib/preview'

const handler = () => {
  // Staging preview must not be indexed, and must not require a valid
  // BETTER_AUTH_URL just to answer robots.txt.
  const body = isStagingPreview(env.APP_ENV)
    ? previewRobotsTxt()
    : buildRobots(new URL(env.BETTER_AUTH_URL).origin)
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

export const Route = createFileRoute('/robots.txt')({
  server: { handlers: { GET: handler } },
})
