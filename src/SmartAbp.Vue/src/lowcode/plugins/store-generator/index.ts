import type {
  CodegenPlugin,
  PluginContext,
  PluginMetadata,
  ValidationResult,
  GeneratedCode,
  Schema,
} from "../../kernel/types"

export interface StoreGeneratorConfig {
  framework?: "pinia"
  persist?: boolean
  persistKey?: string
}

export class StoreGeneratorPlugin
  implements CodegenPlugin<Schema, StoreGeneratorConfig, GeneratedCode>
{
  readonly metadata: PluginMetadata = {
    name: "store-generator",
    version: "0.1.0",
    description: "基于Schema的Store代码生成器（骨架版）",
    author: "SmartAbp Team",
    dependencies: [],
    peerDependencies: ["pinia"],
    target: ["vue3"],
    capabilities: ["generator"],
  }

  canHandle(schema: Schema): boolean {
    return schema.type === "module"
  }

  async validate(schema: Schema): Promise<ValidationResult> {
    const errors: ValidationResult["errors"] = []
    if (!schema.id)
      errors.push({
        code: "STORE_SCHEMA_ID",
        message: "缺少schema.id",
        path: "id",
        severity: "error",
      })
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  async generate(
    schema: Schema,
    config: StoreGeneratorConfig = {},
    context: PluginContext,
  ): Promise<GeneratedCode> {
    const timer = context.monitor.startTimer("store.codegen")
    try {
      const code = this.emitPiniaStore(schema, {
        persist: config.persist ?? true,
        persistKey: config.persistKey ?? `__store:${schema.id}`,
      })
      timer.end({ status: "success" })
      return {
        code,
        dependencies: ["pinia"],
        metadata: {
          framework: "vue3",
          language: "typescript",
          generatedAt: Date.now(),
          checksum: `${schema.id}-${schema.version}`,
          size: code.length,
        },
      }
    } catch (e) {
      timer.end({ status: "error" })
      throw e
    }
  }

  private emitPiniaStore(schema: Schema, opts: { persist: boolean; persistKey: string }): string {
    const storeName = schema.metadata?.storeName || schema.id
    const stateKeys: string[] = Array.isArray(schema.metadata?.state) ? schema.metadata?.state : []
    const stateLines = stateKeys.map((k) => `${k}: undefined as unknown as any`).join(",\n    ")
    const gettersLines = stateKeys.map((k) => `${k}: computed(() => state.${k})`).join(",\n    ")

    return `import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'

export const use${capitalize(storeName)}Store = defineStore('${storeName}', () => {
  // State
  const state = reactive({
    ${stateLines}
  })

  ${
    opts.persist
      ? `// 持久化适配器与方法
  const __storage = (() => {
    try {
      if (typeof localStorage !== 'undefined') {
        return {
          get: (k: string) => localStorage.getItem(k),
          set: (k: string, v: string) => localStorage.setItem(k, v),
          remove: (k: string) => localStorage.removeItem(k)
        }
      }
    } catch {}
    try {
      if (typeof sessionStorage !== 'undefined') {
        return {
          get: (k: string) => sessionStorage.getItem(k),
          set: (k: string, v: string) => sessionStorage.setItem(k, v),
          remove: (k: string) => sessionStorage.removeItem(k)
        }
      }
    } catch {}
    const mem = new Map<string, string>()
    return {
      get: (k: string) => mem.get(k) || null,
      set: (k: string, v: string) => { mem.set(k, v) },
      remove: (k: string) => { mem.delete(k) }
    }
  })()

  function __persistState() {
    try { __storage.set('${opts.persistKey}', JSON.stringify(state)) } catch {}
  }

  function __restoreState() {
    try {
      const raw = __storage.get('${opts.persistKey}')
      if (raw) Object.assign(state, JSON.parse(raw))
    } catch {}
  }

  __restoreState()
  watch(state, __persistState, { deep: true })
  `
      : ""
  }

  // Getters
  const getters = {
    ${gettersLines}
  }

  // Actions
  function reset() {
    Object.keys(state).forEach(k => (state as any)[k] = undefined)
    ${opts.persist ? "__persistState()" : ""}
  }

  return { state, getters, reset }
})
`
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default StoreGeneratorPlugin
