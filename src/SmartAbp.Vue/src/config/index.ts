export interface AppConfig {
  apiBaseUrl: string
}

function normalizeUrl(url: unknown): string {
  const value = String(url ?? '').trim()
  if (!value) return '/'
  return value
}

const env = (import.meta as any)?.env || {}

export const appConfig: AppConfig = {
  apiBaseUrl: normalizeUrl(env.VITE_API_BASE_URL || (globalThis as any).__API_BASE_URL__),
}


