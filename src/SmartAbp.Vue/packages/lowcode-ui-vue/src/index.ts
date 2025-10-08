/**
 * SmartAbp Enterprise Low-Code Platform - UI Components Registry
 * 
 * Unified component registry for all UI components across the platform
 * Provides centralized component management and export
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// Re-export from core package root，避免子路径别名不匹配
export * from '@smartabp/lowcode-core'

// Optional sub-entries (keep graceful when directories not present)
// Note: left commented until modules are provided to avoid path errors
// export * from './composables'
// export * from './directives'
// export * from './plugins'

/**
 * Component registration system
 * 
 * @description
 * Centralized component registry for dynamic loading and version management
 */
export class ComponentRegistry {
  private static components = new Map<string, any>()

  /**
   * Register a component
   */
  static register(name: string, component: any): void {
    if (this.components.has(name)) {
      console.warn(`[ComponentRegistry] Component ${name} is already registered`)
    }
    this.components.set(name, component)
  }

  /**
   * Get a component by name
   */
  static get(name: string): any {
    const component = this.components.get(name)
    if (!component) {
      throw new Error(`[ComponentRegistry] Component ${name} not found`)
    }
    return component
  }

  /**
   * Check if component exists
   */
  static has(name: string): boolean {
    return this.components.has(name)
  }

  /**
   * Get all registered components
   */
  static getAll(): Map<string, any> {
    return new Map(this.components)
  }
}

/**
 * Global auto-registration plugin
 *
 * Usage:
 *   import { createApp } from 'vue'
 *   import { LowCodeUIPlugin } from '@smartabp/lowcode-ui-vue'
 *   createApp(App).use(LowCodeUIPlugin)
 */
export const LowCodeUIPlugin = {
  install(app: any) {
    // 1) Auto register all Vue SFCs under known packages using Vite's glob
    //    This runs at runtime in dev/build with eager=true so names are stable
    const componentModules = import.meta.glob([
      // core/designer/shared components SFCs
      '/src/SmartAbp.Vue/packages/lowcode-core/src/components/**/*.vue',
      '/src/SmartAbp.Vue/packages/lowcode-designer/src/components/**/*.vue',
      '/src/SmartAbp.Vue/packages/lowcode-shared/src/components/**/*.vue'
    ], { eager: true }) as Record<string, any>

    Object.entries(componentModules).forEach(([path, mod]) => {
      const comp = mod?.default
      if (!comp) return
      // Derive component name with prefix convention: Lc/Ld/Ls + FileName
      const name = deriveComponentName(path)
      if (name) {
        app.component(name, comp)
        ComponentRegistry.register(name, comp)
      }
    })
  }
}

function deriveComponentName(filePath: string): string | null {
  // e.g. /src/SmartAbp.Vue/packages/lowcode-core/src/components/SmartFormBuilder/SmartFormBuilder.vue
  const pkg = filePath.includes('/lowcode-core/') ? 'Lc'
    : filePath.includes('/lowcode-designer/') ? 'Ld'
      : filePath.includes('/lowcode-shared/') ? 'Ls'
        : null
  if (!pkg) return null
  const match = filePath.match(/([^/]+)\.vue$/)
  if (!match) return null
  const base = match[1]
  return `${pkg}${base}`
}

/**
 * Component sandbox system for safe component execution
 */
export class ComponentSandbox {
  /**
   * Create a secure execution environment for components
   */
  static createSandbox(component: any, options?: {
    permissions?: string[]
    isolation?: boolean
  }): any {
    // TODO: Implement component sandboxing
    return component
  }
}

/**
 * Initialize the component system
 */
export function initializeComponentSystem(): void {
  console.log('[SmartAbp] Component system initialized')
}

// Default export for plugin usage
export default {
  ComponentRegistry,
  ComponentSandbox,
  initializeComponentSystem,
  LowCodeUIPlugin
}