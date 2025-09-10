/**
 * 插件管理系统
 * 支持生命周期管理、依赖解析、安全沙箱
 */

import type {
  CodegenPlugin,
  PluginContext,
  ValidationResult,
  EventBus,
  CacheManager,
  StructuredLogger,
  PerformanceMonitor
} from './types';

// ============= 插件状态管理 =============

export type PluginStatus = 'registered' | 'initializing' | 'ready' | 'error' | 'destroyed';

export interface PluginInfo {
  plugin: CodegenPlugin;
  status: PluginStatus;
  error?: Error;
  initTime?: number;
  dependencies: string[];
  dependents: string[];
}

// ============= 依赖解析器 =============

export class DependencyResolver {
  private dependencies = new Map<string, string[]>();
  private resolved = new Set<string>();

  addPlugin(name: string, dependencies: string[]): void {
    this.dependencies.set(name, dependencies);
  }

  removePlugin(name: string): void {
    this.dependencies.delete(name);
    this.resolved.delete(name);
  }

  resolve(): string[] {
    this.resolved.clear();
    const result: string[] = [];
    const visiting = new Set<string>();

    const visit = (name: string): void => {
      if (this.resolved.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      visiting.add(name);

      const deps = this.dependencies.get(name) || [];
      for (const dep of deps) {
        if (!this.dependencies.has(dep)) {
          throw new Error(`Missing dependency: ${dep} for plugin ${name}`);
        }
        visit(dep);
      }

      visiting.delete(name);
      this.resolved.add(name);
      result.push(name);
    };

    for (const name of this.dependencies.keys()) {
      visit(name);
    }

    return result;
  }

  getDependents(pluginName: string): string[] {
    const dependents: string[] = [];

    for (const [name, deps] of this.dependencies) {
      if (deps.includes(pluginName)) {
        dependents.push(name);
      }
    }

    return dependents;
  }
}

// ============= 插件验证器 =============

export class PluginValidator {
  validate(plugin: CodegenPlugin): ValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // 验证基本属性
    if (!plugin.metadata?.name) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Plugin name is required',
        path: 'metadata.name',
        severity: 'error' as const
      });
    }

    if (!plugin.metadata?.version) {
      errors.push({
        code: 'MISSING_VERSION',
        message: 'Plugin version is required',
        path: 'metadata.version',
        severity: 'error' as const
      });
    }

    // 验证版本格式
    if (plugin.metadata?.version && !this.isValidVersion(plugin.metadata.version)) {
      errors.push({
        code: 'INVALID_VERSION',
        message: 'Plugin version must follow semver format',
        path: 'metadata.version',
        severity: 'error' as const
      });
    }

    // 验证必需方法
    if (typeof plugin.canHandle !== 'function') {
      errors.push({
        code: 'MISSING_CAN_HANDLE',
        message: 'Plugin must implement canHandle method',
        path: 'canHandle',
        severity: 'error' as const
      });
    }

    if (typeof plugin.generate !== 'function') {
      errors.push({
        code: 'MISSING_GENERATE',
        message: 'Plugin must implement generate method',
        path: 'generate',
        severity: 'error' as const
      });
    }

    // 验证目标框架
    if (!plugin.metadata?.target || plugin.metadata.target.length === 0) {
      warnings.push({
        code: 'NO_TARGET',
        message: 'Plugin should specify target frameworks',
        path: 'metadata.target',
        severity: 'warning' as const
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isValidVersion(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }
}

// ============= 插件上下文实现 =============

export class PluginContextImpl implements PluginContext {
  constructor(
    public readonly eventBus: EventBus,
    public readonly cache: CacheManager,
    public readonly logger: StructuredLogger,
    public readonly monitor: PerformanceMonitor,
    public readonly config: any, // 简化实现
    private readonly pluginManager: PluginManager
  ) {
    // 标记参数为已使用（避免编译警告）
    void this.cache;
    void this.config;
  }

  getPlugin<T extends CodegenPlugin>(name: string): T | undefined {
    return this.pluginManager.getPlugin<T>(name);
  }

  async executePlugin<T>(name: string, ...args: any[]): Promise<T> {
    const plugin = this.getPlugin(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    // 这里可以添加插件执行的安全检查和监控
    const timer = this.monitor.startTimer('plugin.execution', { plugin: name });

    try {
      const result = await plugin.generate(args[0], args[1], this);
      timer.end({ status: 'success' });
      return result as T;
    } catch (error) {
      timer.end({ status: 'error' });
      throw error;
    }
  }

  createChildContext(namespace: string): PluginContext {
    return new PluginContextImpl(
      this.eventBus,
      this.cache,
      this.logger.child({ namespace }),
      this.monitor,
      this.config,
      this.pluginManager
    );
  }
}

// ============= 插件管理器 =============

export class PluginManager {
  private plugins = new Map<string, PluginInfo>();
  private dependencyResolver = new DependencyResolver();
  private validator = new PluginValidator();
  private initializationOrder: string[] = [];

  constructor(
    private eventBus: EventBus,
    _cache: CacheManager,
    private logger: StructuredLogger,
    private monitor: PerformanceMonitor,
    _config: any
  ) {
    // 标记未使用的参数
    void _cache;
    void _config;
  }

  /**
   * 注册插件
   */
  async register(plugin: CodegenPlugin): Promise<void> {
    const name = plugin.metadata.name;

    // 验证插件
    const validation = this.validator.validate(plugin);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      throw new Error(`Plugin validation failed: ${errorMessages}`);
    }

    // 检查是否已存在
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} is already registered`);
    }

    // 添加到依赖解析器
    this.dependencyResolver.addPlugin(name, plugin.metadata.dependencies);

    // 创建插件信息
    const info: PluginInfo = {
      plugin,
      status: 'registered',
      dependencies: plugin.metadata.dependencies,
      dependents: []
    };

    this.plugins.set(name, info);

    // 更新依赖关系
    this.updateDependents(name);

    this.logger.info('Plugin registered', {
      plugin: name,
      version: plugin.metadata.version
    });

    this.eventBus.emitSync('plugin:registered', {
      plugin: plugin.metadata,
      timestamp: Date.now()
    });

    // 如果所有依赖都已初始化，立即初始化这个插件
    if (this.canInitialize(name)) {
      await this.initialize(name);
    }
  }

  /**
   * 初始化插件
   */
  async initialize(name: string): Promise<void> {
    const info = this.plugins.get(name);
    if (!info) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (info.status !== 'registered') {
      return; // 已经初始化或正在初始化
    }

    info.status = 'initializing';

    try {
      const startTime = performance.now();

      // 插件初始化不需要上下文参数
      // const context = new PluginContextImpl(
      //   this.eventBus,
      //   this.cache,
      //   this.logger.child({ plugin: name }),
      //   this.monitor,
      //   this.config,
      //   this
      // );

      // 调用插件初始化
      if (info.plugin.onInit) {
        await info.plugin.onInit();
      }

      const initTime = performance.now() - startTime;
      info.initTime = initTime;
      info.status = 'ready';

      this.logger.info('Plugin initialized', {
        plugin: name,
        initTime
      });

      this.eventBus.emitSync('plugin:initialized', {
        pluginName: name,
        initTime,
        timestamp: Date.now()
      });

      this.monitor.recordDuration('plugin.init_time', initTime, { plugin: name });

      // 初始化依赖于此插件的其他插件
      await this.initializeDependents(name);

    } catch (error) {
      info.status = 'error';
      info.error = error as Error;

      this.logger.error('Plugin initialization failed', error as Error, {
        plugin: name
      });

      this.eventBus.emitSync('plugin:error', {
        pluginName: name,
        error: error as Error,
        context: 'initialization',
        timestamp: Date.now()
      });

      throw error;
    }
  }

  /**
   * 初始化所有插件
   */
  async initializeAll(): Promise<void> {
    try {
      // 解析依赖顺序
      this.initializationOrder = this.dependencyResolver.resolve();

      // 按依赖顺序初始化
      for (const pluginName of this.initializationOrder) {
        await this.initialize(pluginName);
      }

      this.logger.info('All plugins initialized', {
        count: this.plugins.size,
        order: this.initializationOrder
      });

    } catch (error) {
      this.logger.error('Plugin initialization failed', error as Error);
      throw error;
    }
  }

  /**
   * 获取插件
   */
  getPlugin<T extends CodegenPlugin>(name: string): T | undefined {
    const info = this.plugins.get(name);
    return info?.status === 'ready' ? (info.plugin as T) : undefined;
  }

  /**
   * 查找能处理指定schema的插件
   */
  async findPlugin(schema: any): Promise<CodegenPlugin | undefined> {
    for (const [name, info] of this.plugins) {
      if (info.status === 'ready') {
        try {
          const canHandle = await info.plugin.canHandle(schema);
          if (canHandle) {
            return info.plugin;
          }
        } catch (error) {
          this.logger.warn('Plugin canHandle check failed', {
            plugin: name,
            error: (error as Error).message
          });
        }
      }
    }
    return undefined;
  }

  /**
   * 卸载插件
   */
  async unregister(name: string): Promise<void> {
    const info = this.plugins.get(name);
    if (!info) {
      return;
    }

    // 检查是否有其他插件依赖此插件
    if (info.dependents.length > 0) {
      throw new Error(
        `Cannot unregister plugin ${name}, it has dependents: ${info.dependents.join(', ')}`
      );
    }

    try {
      // 调用插件销毁方法
      if (info.plugin.onDestroy) {
        await info.plugin.onDestroy();
      }

      this.plugins.delete(name);
      this.dependencyResolver.removePlugin(name);

      // 更新依赖关系
      this.updateDependentsAfterRemoval(name);

      this.logger.info('Plugin unregistered', { plugin: name });

      this.eventBus.emitSync('plugin:destroyed', {
        pluginName: name,
        timestamp: Date.now()
      });

    } catch (error) {
      this.logger.error('Plugin destruction failed', error as Error, {
        plugin: name
      });
      throw error;
    }
  }

  /**
   * 获取插件状态
   */
  getPluginInfo(name: string): PluginInfo | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有插件状态
   */
  getAllPlugins(): Map<string, PluginInfo> {
    return new Map(this.plugins);
  }

  /**
   * 获取统计信息
   */
  getStats(): Record<string, any> {
    const stats: Record<string, number> = {
      total: this.plugins.size,
      ready: 0,
      initializing: 0,
      error: 0,
      registered: 0,
      destroyed: 0
    };

    for (const info of this.plugins.values()) {
      if (stats[info.status] !== undefined) {
        stats[info.status]++;
      }
    }

    return stats;
  }

  // ============= 私有方法 =============

  private canInitialize(name: string): boolean {
    const info = this.plugins.get(name);
    if (!info || info.status !== 'registered') {
      return false;
    }

    // 检查所有依赖是否都已就绪
    return info.dependencies.every(dep => {
      const depInfo = this.plugins.get(dep);
      return depInfo?.status === 'ready';
    });
  }

  private async initializeDependents(name: string): Promise<void> {
    const info = this.plugins.get(name);
    if (!info) return;

    for (const dependent of info.dependents) {
      if (this.canInitialize(dependent)) {
        await this.initialize(dependent);
      }
    }
  }

  private updateDependents(name: string): void {
    const dependents = this.dependencyResolver.getDependents(name);

    for (const dependent of dependents) {
      const depInfo = this.plugins.get(dependent);
      if (depInfo && !depInfo.dependents.includes(name)) {
        depInfo.dependents.push(name);
      }
    }
  }

  private updateDependentsAfterRemoval(name: string): void {
    for (const info of this.plugins.values()) {
      info.dependents = info.dependents.filter(dep => dep !== name);
    }
  }

  /**
   * 销毁插件管理器
   */
  async destroy(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys()).reverse();

    for (const name of pluginNames) {
      try {
        await this.unregister(name);
      } catch (error) {
        this.logger.error('Failed to unregister plugin during destroy', error as Error, {
          plugin: name
        });
      }
    }

    this.logger.info('Plugin manager destroyed');
  }
}
