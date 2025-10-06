import { beforeEach, describe, expect, it, vi } from "vitest"

interface Plugin {
  name: string
  version: string
  initialize: () => void | Promise<void>
  destroy?: () => void | Promise<void>
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private initialized: Set<string> = new Set()

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`)
    }
    this.plugins.set(plugin.name, plugin)
  }

  async initialize(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }
    await plugin.initialize()
    this.initialized.add(pluginName)
  }

  async destroy(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }
    if (plugin.destroy) {
      await plugin.destroy()
    }
    this.initialized.delete(pluginName)
    this.plugins.delete(pluginName)
  }

  isInitialized(pluginName: string): boolean {
    return this.initialized.has(pluginName)
  }

  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName)
  }
}

describe("PluginManager", () => {
  let pluginManager: PluginManager

  beforeEach(() => {
    pluginManager = new PluginManager()
  })

  it("should register a plugin successfully", async () => {
    const mockPlugin: Plugin = {
      name: "test-plugin",
      version: "1.0.0",
      initialize: vi.fn(),
    }

    await pluginManager.register(mockPlugin)
    expect(pluginManager.getPlugin("test-plugin")).toBe(mockPlugin)
  })

  it("should throw error when registering duplicate plugin", async () => {
    const mockPlugin: Plugin = {
      name: "test-plugin",
      version: "1.0.0",
      initialize: vi.fn(),
    }

    await pluginManager.register(mockPlugin)
    await expect(pluginManager.register(mockPlugin)).rejects.toThrow(
      "Plugin test-plugin is already registered"
    )
  })

  it("should initialize a plugin successfully", async () => {
    const initializeFn = vi.fn()
    const mockPlugin: Plugin = {
      name: "test-plugin",
      version: "1.0.0",
      initialize: initializeFn,
    }

    await pluginManager.register(mockPlugin)
    await pluginManager.initialize("test-plugin")

    expect(initializeFn).toHaveBeenCalledTimes(1)
    expect(pluginManager.isInitialized("test-plugin")).toBe(true)
  })

  it("should destroy a plugin successfully", async () => {
    const destroyFn = vi.fn()
    const mockPlugin: Plugin = {
      name: "test-plugin",
      version: "1.0.0",
      initialize: vi.fn(),
      destroy: destroyFn,
    }

    await pluginManager.register(mockPlugin)
    await pluginManager.initialize("test-plugin")
    await pluginManager.destroy("test-plugin")

    expect(destroyFn).toHaveBeenCalledTimes(1)
    expect(pluginManager.isInitialized("test-plugin")).toBe(false)
    expect(pluginManager.getPlugin("test-plugin")).toBeUndefined()
  })

  it("should handle plugin without destroy method", async () => {
    const mockPlugin: Plugin = {
      name: "test-plugin",
      version: "1.0.0",
      initialize: vi.fn(),
    }

    await pluginManager.register(mockPlugin)
    await pluginManager.initialize("test-plugin")
    await pluginManager.destroy("test-plugin")

    expect(pluginManager.isInitialized("test-plugin")).toBe(false)
  })

  it("should throw error when initializing non-existent plugin", async () => {
    await expect(pluginManager.initialize("non-existent")).rejects.toThrow(
      "Plugin non-existent not found"
    )
  })

  it("should throw error when destroying non-existent plugin", async () => {
    await expect(pluginManager.destroy("non-existent")).rejects.toThrow(
      "Plugin non-existent not found"
    )
  })
})