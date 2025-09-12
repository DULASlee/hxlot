import { describe, it, expect } from "vitest"
import { PluginManager } from "../kernel/plugins"
import { EventBus } from "../kernel/events"
import { CacheManager } from "../kernel/cache"
import { PerformanceMonitor } from "../kernel/monitor"
import type { CodegenPlugin } from "../kernel/types"
import { createLowCodeLogger } from "../adapters/logger-adapter"

function makeEnv() {
  const logger = createLowCodeLogger({ module: "pm" })
  const eventBus = new EventBus(logger)
  const cache = new CacheManager({ logger })
  const monitor = new PerformanceMonitor(logger)
  const config = {}
  const pm = new PluginManager(eventBus, cache, logger, monitor, config)
  return { pm, eventBus, cache, monitor, logger }
}

function makePlugin(name: string): CodegenPlugin {
  return {
    metadata: {
      name,
      version: "1.0.0",
      target: ["vue3"],
      dependencies: [],
      peerDependencies: [],
      capabilities: [],
    },
    canHandle: async (_schema: any) => true,
    generate: async (_schema: any) => ({
      code: "generated code",
      dependencies: [],
      metadata: {
        framework: "vue3",
        language: "typescript",
        generatedAt: Date.now(),
        checksum: "abc123",
        size: 100,
        generated: true,
      },
    }),
  }
}

describe("PluginManager basic flow", () => {
  it("register and initialize plugin", async () => {
    const { pm } = makeEnv()
    const plugin = makePlugin("p1")
    await pm.register(plugin)
    await pm.initializeAll()
    const got = pm.getPlugin("p1")
    expect(got).toBeTruthy()
  })

  it("dependency order resolves", async () => {
    const { pm } = makeEnv()
    const pA: CodegenPlugin = {
      metadata: {
        name: "A",
        version: "1.0.0",
        dependencies: [],
        peerDependencies: [],
        capabilities: [],
        target: ["vue3"],
      },
      canHandle: async () => true,
      generate: async () => ({
        code: "plugin A code",
        dependencies: [],
        metadata: {
          framework: "vue3",
          language: "typescript",
          generatedAt: Date.now(),
          checksum: "pluginA123",
          size: 200,
          plugin: "A",
        },
      }),
    }
    const pB: CodegenPlugin = {
      metadata: {
        name: "B",
        version: "1.0.0",
        dependencies: ["A"],
        peerDependencies: [],
        capabilities: [],
        target: ["vue3"],
      },
      canHandle: async () => true,
      generate: async () => ({
        code: "plugin B code",
        dependencies: [],
        metadata: {
          framework: "vue3",
          language: "typescript",
          generatedAt: Date.now(),
          checksum: "pluginB456",
          size: 300,
          plugin: "B",
        },
      }),
    }
    await pm.register(pA)
    await pm.register(pB)
    await pm.initializeAll()
    expect(pm.getPlugin("A")).toBeTruthy()
    expect(pm.getPlugin("B")).toBeTruthy()
  })
})
