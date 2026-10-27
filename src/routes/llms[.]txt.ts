import { createFileRoute } from '@tanstack/react-router'
import { llms } from 'fumadocs-core/source'
import { source } from '@/features/docs/source'
import { productLlms } from '@/features/shop/llms'
import { env } from '@/lib/env'

// `/llms.txt` — Nookdry product brief, then the docs index. See https://llmstxt.org.
const handler = () => {
  let origin = ''
  try { origin = new URL(env.BETTER_AUTH_URL).origin } catch { /* origin is optional in the brief */ }
  const body = `${productLlms(origin)}\n\n---\n\n# Docs\n\n${llms(source).index()}`
  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  })
}

export const Route = createFileRoute('/llms.txt')({
  server: { handlers: { GET: handler } },
})
