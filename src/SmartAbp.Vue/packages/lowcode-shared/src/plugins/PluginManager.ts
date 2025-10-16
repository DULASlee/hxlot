/**
 * Plugin system for lowcode-shared
 * - Lightweight manager to register plugins and trigger lifecycle hooks
 * - Designed to be framework-agnostic and safe for bundler module resolution
 */

export type PluginHookName = 'beforeComponentLoad' | 'afterComponentLoad' | 'onError';

export interface PluginHookPayload {
  // Name of the component being processed (if applicable)
  componentName?: string;
  // Whether the component was loaded from cache
  fromCache?: boolean;
  // Arbitrary contextual data bag for future extensibility
  [key: string]: unknown;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version?: string;
  description?: string;
  author?: string;
}

export interface LowCodePlugin {
  name: string;
  metadata?: PluginMetadata;
  // Optional lifecycle hooks; each can be sync or async
  beforeComponentLoad?: (payload: PluginHookPayload) => void | Promise<void>;
  afterComponentLoad?: (payload: PluginHookPayload) => void | Promise<void>;
  onError?: (payload: PluginHookPayload & { error: unknown }) => void | Promise<void>;
}

export interface AssemblyPluginConfig {
  name: string;
  plugin: LowCodePlugin;
  beforeComponentLoad?: (payload: PluginHookPayload) => void | Promise<void>;
  afterComponentLoad?: (payload: PluginHookPayload) => void | Promise<void>;
  onError?: (payload: PluginHookPayload & { error: unknown }) => void | Promise<void>;
}

export class PluginManager {
  private readonly registeredPlugins: LowCodePlugin[] = [];
  private readonly pluginStatus = new Map<string, 'enabled' | 'disabled'>();

  registerPlugin(plugin: LowCodePlugin): void {
    const hasSameName = this.registeredPlugins.some(p => p.name === plugin.name);
    if (!hasSameName) {
      this.registeredPlugins.push(plugin);
      this.pluginStatus.set(plugin.name, 'enabled');
      // Auto-generate metadata if not provided
      if (!plugin.metadata) {
        plugin.metadata = {
          id: plugin.name,
          name: plugin.name
        };
      }
    }
  }

  unregisterPlugin(pluginName: string): void {
    const index = this.registeredPlugins.findIndex(p => p.name === pluginName);
    if (index >= 0) this.registeredPlugins.splice(index, 1);
    this.pluginStatus.delete(pluginName);
  }

  getAllPlugins(): ReadonlyArray<AssemblyPluginConfig> {
    return this.registeredPlugins.map(plugin => ({
      name: plugin.name,
      plugin,
      beforeComponentLoad: plugin.beforeComponentLoad,
      afterComponentLoad: plugin.afterComponentLoad,
      onError: plugin.onError
    }));
  }

  getStatus(pluginName: string): 'enabled' | 'disabled' {
    return this.pluginStatus.get(pluginName) ?? 'enabled';
  }

  enable(pluginName: string): void {
    if (this.registeredPlugins.some(p => p.name === pluginName)) {
      this.pluginStatus.set(pluginName, 'enabled');
    }
  }

  disable(pluginName: string): void {
    if (this.registeredPlugins.some(p => p.name === pluginName)) {
      this.pluginStatus.set(pluginName, 'disabled');
    }
  }

  async triggerHook(hookName: PluginHookName, payload: PluginHookPayload, componentName?: string): Promise<void> {
    // Normalize payload
    const normalizedPayload: PluginHookPayload = {
      ...payload,
      componentName: payload.componentName ?? componentName,
    };

    for (const plugin of this.registeredPlugins) {
      try {
        const hook = plugin[hookName];
        if (typeof hook === 'function') {
          if (hookName === 'onError') {
            const errorPayload = normalizedPayload as PluginHookPayload & { error: unknown };
            await (hook as (p: PluginHookPayload & { error: unknown }) => void | Promise<void>)(errorPayload);
          } else {
            await (hook as (p: PluginHookPayload) => void | Promise<void>)(normalizedPayload);
          }
        }
      } catch (error) {
        // Best-effort error isolation: a faulty plugin should not break the pipeline
        // eslint-disable-next-line no-console
        console.error(`[PluginManager] Hook '${hookName}' failed in plugin '${plugin.name}':`, error);
      }
    }
  }
}

// Global singleton used by lowcode-shared consumers
export const globalPluginManager = new PluginManager();

// Status constant for UI usage
export const PluginStatus = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
} as const;
export type PluginStatus = typeof PluginStatus[keyof typeof PluginStatus];


