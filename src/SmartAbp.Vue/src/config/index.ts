export interface AppConfig {
  apiBaseUrl: string
}

function normalizeUrl(url: unknown): string {
  const value = String(url ?? "").trim()
  if (!value) return "/"
  return value
}

const env = (import.meta as unknown as { env?: Record<string, any> })?.env || {}

export const appConfig: AppConfig = {
  apiBaseUrl: normalizeUrl(env.VITE_API_BASE_URL || (globalThis as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__ || "https://localhost:44379"),
}
