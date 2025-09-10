import type { RawMetadata, UnifiedMetadata, PluginContext } from '../../kernel/types'
import { globalContentCache } from '../../federation/content-cache'
import { WorkerPool } from '../worker-pool'

const MODEL_VERSION = 'v1'

function stableStringify(obj: any): string {
  const allKeys = new Set<string>()
  JSON.stringify(obj, (k, v) => (allKeys.add(k), v))
  return JSON.stringify(obj, Array.from(allKeys).sort())
}

async function computeKey(input: RawMetadata): Promise<string> {
  const normalized = stableStringify({ model: MODEL_VERSION, input })
  const enc = new TextEncoder().encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export class MetadataPipeline {
  private pool?: WorkerPool
  private inflight = new Map<string, Promise<UnifiedMetadata>>()
  constructor(private context: PluginContext) {}

  async processMetadata(input: RawMetadata): Promise<UnifiedMetadata> {
    const start = performance.now?.() ?? Date.now()
    const key = await computeKey(input)

    // 1) 缓存命中（内容寻址）
    try {
      const cached = globalContentCache.getWithStats(key)
      if (cached) {
        const json = new TextDecoder().decode(cached)
        const unified = JSON.parse(json) as UnifiedMetadata
        const duration = (performance.now?.() ?? Date.now()) - start
        await this.emitProcessed(duration, true)
        return unified
      }
    } catch {}

    try {
      // in-flight 去重
      if (this.inflight.has(key)) {
        return await this.inflight.get(key)!
      }

      const promise = (async () => {
        // 2) 验证输入（轻量）
        const validated = await this.validateMetadata(input)
        // 3) 归一化 + 4) 优化：优先走Worker
        const useWorkers = typeof Worker !== 'undefined'
        let optimized: UnifiedMetadata
        if (useWorkers) {
          if (!this.pool) {
            const createWorker = () => new Worker(new URL('../workers/metadata.worker.ts', import.meta.url), { type: 'module' })
            this.pool = new WorkerPool({ name: 'metadata', size: Math.max(2, navigator?.hardwareConcurrency ? Math.min(4, navigator.hardwareConcurrency) : 2), timeoutMs: 5000 }, createWorker)
            try { (globalThis as any).__metadataWorkerPool = this.pool } catch {}
          }
          const unified = await this.pool.exec<RawMetadata, UnifiedMetadata>('normalize', validated)
          optimized = await this.pool.exec<UnifiedMetadata, UnifiedMetadata>('optimize', unified)
        } else {
          const unified = this.transformToUnified(validated)
          optimized = await this.optimizeMetadata(unified)
        }
        // 5) 生成跨平台配置（stub）
        const crossPlatform = this.generateCrossPlatformConfig(optimized)
        // 6) 写入缓存
        try {
          const bytes = new TextEncoder().encode(JSON.stringify(crossPlatform))
          globalContentCache.set(key, bytes, { type: 'metadata', size: bytes.byteLength, tags: ['metadata', MODEL_VERSION] })
        } catch {}

        const duration = (performance.now?.() ?? Date.now()) - start
        await this.emitProcessed(duration, false)
        return crossPlatform
      })()

      this.inflight.set(key, promise)
      const result = await promise
      this.inflight.delete(key)
      return result
    } catch (error) {
      this.context.logger.error('Metadata processing failed', error as Error)
      const recovered = await this.recoverFromError(error as Error, input)
      const duration = (performance.now?.() ?? Date.now()) - start
      await this.context.eventBus.emit('metadata:recovered', { duration, strategy: 'minimal', timestamp: Date.now() })
      return recovered
    }
  }

  private async emitProcessed(duration: number, cacheHit: boolean): Promise<void> {
    this.context.monitor.recordDuration('metadata.process', duration)
    await this.context.eventBus.emit('metadata:processed', { key: 'metadata', duration, cacheHit, timestamp: Date.now() })
    try {
      if (typeof dispatchEvent !== 'undefined') {
        dispatchEvent(new CustomEvent('lowcode:metadata:processed', { detail: { duration, cacheHit } }))
      }
    } catch {}
  }

  private async validateMetadata(input: RawMetadata): Promise<RawMetadata> {
    if (!input || typeof input !== 'object') throw new Error('Invalid metadata: not an object')
    // 轻量字段检查
    return input
  }

  private transformToUnified(input: RawMetadata): UnifiedMetadata {
    const id = input.id || 'Anonymous'
    const version = input.version || '1.0.0'
    const type = (['component','page','layout','module'].includes(String(input.type)) ? input.type : 'component') as UnifiedMetadata['type']
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
        degrade: Boolean(input.runtime?.degrade)
      },
      generator: {
        targets: Array.isArray(input.generator?.targets) ? input.generator?.targets : ['vue3'],
        qualityGates: input.generator?.qualityGates || { type: true, lint: true, test: false }
      },
      extra: input.extra || {}
    }
  }

  private async optimizeMetadata(unified: UnifiedMetadata): Promise<UnifiedMetadata> {
    // 去冗余/默认填充：示意实现
    const result = { ...unified }
    if (!result.dependencies) result.dependencies = []
    return result
  }

  private generateCrossPlatformConfig(unified: UnifiedMetadata): UnifiedMetadata {
    // P1：填充平台配置占位（stub）
    const platform = {
      vite: {
        define: { __LOWCODE__: true },
        optimizeDeps: { include: unified.dependencies || [] }
      },
      webpack: {
        providePlugin: { LOWCODE: true },
        externals: (unified.dependencies || []).reduce((acc: any, d) => (acc[d] = d, acc), {})
      },
      uniapp: {
        navigationStyle: 'default',
        lazyLoad: Boolean(unified.runtime?.lazy)
      },
      abp: {
        permissions: unified.runtime?.auth?.roles || [],
        multiTenancy: Boolean(unified.runtime?.tenant?.required)
      }
    }
    return { ...unified, platform }
  }

  private async recoverFromError(_error: Error, input: RawMetadata): Promise<UnifiedMetadata> {
    // 最小降级：仅保留基本可用字段
    const minimal = this.transformToUnified({ id: input.id || 'Anonymous', version: input.version || '1.0.0', type: input.type || 'component' })
    return minimal
  }
}


