import { createServerFn } from '@tanstack/react-start'
import { isStagingPreview } from '@/lib/preview'

/** True only when this build was deployed with APP_ENV=staging. */
export const getPreview = createServerFn({ method: 'GET' }).handler(async (): Promise<boolean> => {
  // Lazy env import (repo convention): keeps cloudflare:workers out of client graphs.
  const { env } = await import('@/lib/env')
  return isStagingPreview(env.APP_ENV)
})
