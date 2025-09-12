import type { RawMetadata, UnifiedMetadata } from "../../kernel/types"

interface WorkerRequest {
  id: number
  action: "normalize" | "optimize"
  payload: any
}

interface WorkerResponse<T = unknown> {
  id: string | number
  ok: boolean
  result?: T
  error?: { message: string; stack?: string }
}

function transformToUnified(input: RawMetadata): UnifiedMetadata {
  const id = input.id || "Anonymous"
  const version = input.version || "1.0.0"
  const type = (
    ["component", "page", "layout", "module"].includes(String(input.type))
      ? input.type
      : "component"
  ) as UnifiedMetadata["type"]
  return {
    id,
    version,
    type,
    i18n: input.i18n || {},
    a11y: input.a11y || {},
    dependencies: Array.isArray(input.dependencies) ? input.dependencies : [],
    capabilities: Array.isArray(input.capabilities) ? input.capabilities : [],
    runtime: {
      auth: input.runtime?.auth,
      tenant: input.runtime?.tenant,
      persist: input.runtime?.persist,
      lazy: Boolean(input.runtime?.lazy),
      degrade: Boolean(input.runtime?.degrade),
    },
    generator: {
      targets: Array.isArray(input.generator?.targets) ? input.generator?.targets : ["vue3"],
      qualityGates: input.generator?.qualityGates || { type: true, lint: true, test: false },
    },
    extra: input.extra || {},
  }
}

function optimizeMetadata(unified: UnifiedMetadata): UnifiedMetadata {
  const result = { ...unified }
  if (!result.dependencies) result.dependencies = []
  return result
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, action, payload } = e.data
  const respond = (data: WorkerResponse) => (self as any).postMessage(data)
  try {
    if (action === "normalize") {
      const unified = transformToUnified(payload as RawMetadata)
      return respond({ id, ok: true, result: unified })
    }
    if (action === "optimize") {
      const optimized = optimizeMetadata(payload as UnifiedMetadata)
      return respond({ id, ok: true, result: optimized })
    }
    return respond({ id, ok: false, error: { message: `Unknown action ${action}` } })
  } catch (err) {
    const error = err as Error
    return respond({ id, ok: false, error: { message: error.message, stack: error.stack } })
  }
}
