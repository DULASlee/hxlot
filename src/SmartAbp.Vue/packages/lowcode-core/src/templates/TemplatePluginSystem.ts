/**
 * 🎨 UI企业定制模版插件系统
 * SmartAbp低代码引擎 - 第二专题核心架构
 * 
 * 核心功能:
 * - 可插拔的UI模版架构
 * - 动态加载和卸载模版
 * - 版本控制和依赖管理
 * - 企业级定制化支持
 * - 主题切换和品牌定制
 * - 性能优化和内存管理
 */

// ComponentMetadata import removed - not currently used

export type TemplateType = 'component' | 'layout' | 'page' | 'theme' | 'style' | 'business';
export type TemplateStatus = 'loading' | 'loaded' | 'error' | 'unloaded';
export type PluginLifecycleState = 'inactive' | 'installing' | 'active' | 'error' | 'uninstalling';

/**
 * 模版版本信息
 */
export interface TemplateVersion {
  /** 版本号 */
  version: string;
  /** 语义化版本 */
  semver: {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
  };
  /** 发布时间 */
  publishedAt: string;
  /** 更新日志 */
  changelog: string;
  /** 兼容性信息 */
  compatibility: {
    minEngineVersion: string;
    maxEngineVersion?: string;
    supportedBrowsers: string[];
  };
  /** 是否为稳定版本 */
  stable: boolean;
  /** 是否已废弃 */
  deprecated: boolean;
}

/**
 * 模版依赖信息
 */
export interface TemplateDependency {
  /** 依赖模版名称 */
  name: string;
  /** 版本要求 */
  versionRange: string;
  /** 是否为可选依赖 */
  optional: boolean;
  /** 依赖类型 */
  type: 'runtime' | 'devtime' | 'peer';
  /** 冲突检测 */
  conflicts?: string[];
}

/**
 * 企业定制配置
 */
export interface EnterpriseCustomization {
  /** 企业标识 */
  enterpriseId: string;
  /** 品牌信息 */
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    favicon?: string;
  };
  /** 主题配置 */
  theme: {
    mode: 'light' | 'dark' | 'auto';
    customColors: Record<string, string>;
    customFonts: Record<string, string>;
    customSizes: Record<string, string>;
  };
  /** 布局配置 */
  layout: {
    headerHeight: number;
    sidebarWidth: number;
    footerHeight: number;
    borderRadius: number;
    spacing: Record<string, number>;
  };
  /** 功能配置 */
  features: {
    enabledFeatures: string[];
    disabledFeatures: string[];
    customFeatures: Record<string, any>;
  };
}

/**
 * 模版插件元数据
 */
export interface TemplatePluginMetadata {
  /** 插件名称 */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 插件描述 */
  description: string;
  /** 插件版本 */
  version: TemplateVersion;
  /** 插件作者 */
  author: {
    name: string;
    email: string;
    url?: string;
  };
  /** 插件类型 */
  type: TemplateType;
  /** 插件标签 */
  tags: string[];
  /** 插件图标 */
  icon: string;
  /** 插件截图 */
  screenshots: string[];
  /** 许可证 */
  license: string;
  /** 主页地址 */
  homepage?: string;
  /** 仓库地址 */
  repository?: string;
  /** 问题反馈地址 */
  bugs?: string;
  /** 依赖关系 */
  dependencies: TemplateDependency[];
  /** 支持的企业定制 */
  customization: {
    supportsBranding: boolean;
    supportsTheme: boolean;
    supportsLayout: boolean;
    customizableProperties: string[];
  };
  /** 性能指标 */
  performance: {
    bundleSize: number;
    loadTime: number;
    memoryUsage: number;
    renderTime: number;
  };
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 模版插件实例
 */
export interface TemplatePluginInstance {
  /** 插件元数据 */
  metadata: TemplatePluginMetadata;
  /** 插件状态 */
  status: TemplateStatus;
  /** 生命周期状态 */
  lifecycleState: PluginLifecycleState;
  /** 插件实例 */
  instance?: any;
  /** 加载时间 */
  loadedAt?: number;
  /** 错误信息 */
  error?: Error;
  /** 使用统计 */
  usage: {
    loadCount: number;
    renderCount: number;
    lastUsed: number;
    averageRenderTime: number;
  };
  /** 企业定制配置 */
  customization?: EnterpriseCustomization;
  /** 插件配置 */
  config: Record<string, any>;
}

/**
 * 插件注册表项
 */
export interface PluginRegistryEntry {
  /** 插件名称 */
  name: string;
  /** 插件路径或URL */
  source: string;
  /** 是否为远程插件 */
  remote: boolean;
  /** 插件哈希 */
  hash?: string;
  /** 缓存策略 */
  cacheStrategy: 'memory' | 'disk' | 'network';
  /** 预加载优先级 */
  preloadPriority: 'high' | 'medium' | 'low' | 'none';
}

/**
 * 插件加载选项
 */
export interface PluginLoadOptions {
  /** 是否强制重新加载 */
  forceReload?: boolean;
  /** 超时时间 */
  timeout?: number;
  /** 加载策略 */
  strategy?: 'lazy' | 'eager' | 'preload';
  /** 企业定制配置 */
  customization?: EnterpriseCustomization;
  /** 插件配置 */
  config?: Record<string, any>;
  /** 依赖解析选项 */
  resolveDependencies?: boolean;
}

/**
 * 🎨 模版插件系统
 */
export class TemplatePluginSystem {
  private pluginRegistry = new Map<string, PluginRegistryEntry>();
  private loadedPlugins = new Map<string, TemplatePluginInstance>();
  private dependencyGraph = new Map<string, Set<string>>();
  private loadingPromises = new Map<string, Promise<TemplatePluginInstance>>();
  private enterpriseConfig?: EnterpriseCustomization;
  private pluginCache = new Map<string, any>();
  private eventListeners = new Map<string, Set<Function>>();

  // 配置参数
  private maxCacheSize = 50;
  private loadTimeout = 10000; // 10秒
  private maxConcurrentLoads = 5;
  private enableHotReload = true;

  constructor(options: {
    maxCacheSize?: number;
    loadTimeout?: number;
    maxConcurrentLoads?: number;
    enableHotReload?: boolean;
    enterpriseConfig?: EnterpriseCustomization;
  } = {}) {
    this.maxCacheSize = options.maxCacheSize || this.maxCacheSize;
    this.loadTimeout = options.loadTimeout || this.loadTimeout;
    this.maxConcurrentLoads = options.maxConcurrentLoads || this.maxConcurrentLoads;
    this.enableHotReload = options.enableHotReload !== false;
    this.enterpriseConfig = options.enterpriseConfig;

    this.initializeSystem();
  }

  /**
   * 注册插件
   */
  registerPlugin(entry: PluginRegistryEntry): void {
    this.pluginRegistry.set(entry.name, entry);
    console.log(`📦 插件已注册: ${entry.name}`);
    this.emit('plugin:registered', { name: entry.name, entry });
  }

  /**
   * 批量注册插件
   */
  registerPlugins(entries: PluginRegistryEntry[]): void {
    entries.forEach(entry => this.registerPlugin(entry));
    console.log(`📦 批量注册完成: ${entries.length} 个插件`);
  }

  /**
   * 加载插件
   */
  async loadPlugin(name: string, options: PluginLoadOptions = {}): Promise<TemplatePluginInstance> {
    // 检查是否已加载
    if (this.loadedPlugins.has(name) && !options.forceReload) {
      const plugin = this.loadedPlugins.get(name)!;
      this.updateUsageStats(plugin);
      return plugin;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    // 创建加载Promise
    const loadPromise = this.executePluginLoad(name, options);
    this.loadingPromises.set(name, loadPromise);

    try {
      const plugin = await loadPromise;
      this.loadedPlugins.set(name, plugin);
      return plugin;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) {
      console.warn(`插件未找到: ${name}`);
      return;
    }

    console.log(`🗑️ 开始卸载插件: ${name}`);
    plugin.lifecycleState = 'uninstalling';

    try {
      // 检查依赖关系
      const dependents = this.findDependents(name);
      if (dependents.length > 0) {
        console.warn(`插件 ${name} 被以下插件依赖: ${dependents.join(', ')}`);
        throw new Error(`无法卸载插件 ${name}，存在依赖关系`);
      }

      // 执行插件清理
      if (plugin.instance && typeof plugin.instance.destroy === 'function') {
        await plugin.instance.destroy();
      }

      // 清理缓存
      this.pluginCache.delete(name);
      this.loadedPlugins.delete(name);

      console.log(`✅ 插件卸载完成: ${name}`);
      this.emit('plugin:unloaded', { name, plugin });
    } catch (error) {
      plugin.lifecycleState = 'error';
      plugin.error = error as Error;
      console.error(`❌ 插件卸载失败: ${name}`, error);
      throw error;
    }
  }

  /**
   * 获取插件实例
   */
  getPlugin(name: string): TemplatePluginInstance | undefined {
    return this.loadedPlugins.get(name);
  }

  /**
   * 获取所有已加载插件
   */
  getLoadedPlugins(): TemplatePluginInstance[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * 搜索插件
   */
  searchPlugins(query: {
    type?: TemplateType;
    tags?: string[];
    author?: string;
    keyword?: string;
  }): PluginRegistryEntry[] {
    const results: PluginRegistryEntry[] = [];
    
    this.pluginRegistry.forEach((entry, name) => {
      const plugin = this.loadedPlugins.get(name);
      if (!plugin) return;

      const metadata = plugin.metadata;
      let matches = true;

      if (query.type && metadata.type !== query.type) matches = false;
      if (query.author && !metadata.author.name.includes(query.author)) matches = false;
      if (query.tags && !query.tags.some(tag => metadata.tags.includes(tag))) matches = false;
      if (query.keyword) {
        const keyword = query.keyword.toLowerCase();
        const searchText = `${metadata.name} ${metadata.displayName} ${metadata.description}`.toLowerCase();
        if (!searchText.includes(keyword)) matches = false;
      }

      if (matches) {
        results.push(entry);
      }
    });

    return results;
  }

  /**
   * 设置企业定制配置
   */
  setEnterpriseCustomization(config: EnterpriseCustomization): void {
    this.enterpriseConfig = config;
    console.log(`🏢 企业定制配置已更新: ${config.enterpriseId}`);
    
    // 更新所有已加载插件的定制配置
    this.loadedPlugins.forEach(plugin => {
      if (plugin.metadata.customization.supportsBranding) {
        plugin.customization = config;
        this.applyCustomization(plugin);
      }
    });

    this.emit('customization:updated', config);
  }

  /**
   * 获取插件依赖图
   */
  getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencyGraph);
  }

  /**
   * 检查插件兼容性
   */
  checkCompatibility(pluginName: string, _targetVersion?: string): {
    compatible: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) {
      return {
        compatible: false,
        issues: ['插件未找到'],
        suggestions: ['请先加载插件']
      };
    }

    const issues: string[] = [];
    const suggestions: string[] = [];

    // 检查引擎版本兼容性
    const engineVersion = this.getCurrentEngineVersion();
    const compatibility = plugin.metadata.version.compatibility;
    
    if (this.compareVersion(engineVersion, compatibility.minEngineVersion) < 0) {
      issues.push(`引擎版本过低，需要 ${compatibility.minEngineVersion}，当前 ${engineVersion}`);
      suggestions.push('请升级SmartAbp引擎版本');
    }

    if (compatibility.maxEngineVersion && 
        this.compareVersion(engineVersion, compatibility.maxEngineVersion) > 0) {
      issues.push(`引擎版本过高，最大支持 ${compatibility.maxEngineVersion}，当前 ${engineVersion}`);
      suggestions.push('请降级SmartAbp引擎版本或等待插件更新');
    }

    // 检查依赖兼容性
    plugin.metadata.dependencies.forEach(dep => {
      const depPlugin = this.loadedPlugins.get(dep.name);
      if (!depPlugin && !dep.optional) {
        issues.push(`缺少必需依赖: ${dep.name}`);
        suggestions.push(`请安装依赖插件: ${dep.name}`);
      }
    });

    return {
      compatible: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * 预加载高优先级插件
   */
  async preloadHighPriorityPlugins(): Promise<void> {
    const highPriorityPlugins = Array.from(this.pluginRegistry.values())
      .filter(entry => entry.preloadPriority === 'high')
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`🚀 开始预加载 ${highPriorityPlugins.length} 个高优先级插件`);

    const loadPromises = highPriorityPlugins.map(entry =>
      this.loadPlugin(entry.name, { strategy: 'preload' }).catch(error => {
        console.error(`预加载插件失败: ${entry.name}`, error);
        return null;
      })
    );

    const results = await Promise.allSettled(loadPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`✅ 预加载完成: ${successCount}/${highPriorityPlugins.length} 个插件`);
  }

  /**
   * 热重载插件
   */
  async hotReloadPlugin(name: string): Promise<void> {
    if (!this.enableHotReload) {
      console.warn('热重载功能已禁用');
      return;
    }

    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔥 开始热重载插件: ${name} (第 ${attempt}/${maxRetries} 次尝试)`);
        
        // 保存当前配置
        const currentPlugin = this.loadedPlugins.get(name);
        const config = currentPlugin?.config;
        const customization = currentPlugin?.customization;

        // 卸载插件 (带错误恢复)
        try {
          if (this.loadedPlugins.has(name)) {
            await this.unloadPlugin(name);
          }
        } catch (unloadError) {
          console.warn(`⚠️ 卸载插件时出错，但继续重载: ${name}`, unloadError);
          // 强制清理状态
          this.loadedPlugins.delete(name);
          this.pluginCache.delete(name);
        }

        // 等待短暂时间确保清理完成
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));

        // 重新加载插件
        await this.loadPlugin(name, {
          forceReload: true,
          config,
          customization
        });

        console.log(`✅ 热重载成功: ${name} (第 ${attempt} 次尝试)`);
        this.emit('plugin:hot-reloaded', { name, attempt });
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ 热重载失败: ${name} (第 ${attempt}/${maxRetries} 次尝试)`, error);
        
        if (attempt < maxRetries) {
          // 指数退避重试
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          console.log(`⏳ ${delay}ms 后重试热重载...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ 热重载最终失败: ${name}，已尝试 ${maxRetries} 次`);
    this.emit('plugin:hot-reload-failed', { name, error: lastError, attempts: maxRetries });
    throw lastError || new Error(`插件热重载失败: ${name}`);
  }

  /**
   * 获取系统统计信息
   */
  getSystemStats(): {
    totalPlugins: number;
    loadedPlugins: number;
    cacheSize: number;
    memoryUsage: number;
    averageLoadTime: number;
    errorRate: number;
  } {
    const loadedPlugins = Array.from(this.loadedPlugins.values());
    const totalLoadTime = loadedPlugins.reduce((sum, p) => sum + (p.loadedAt || 0), 0);
    const errorCount = loadedPlugins.filter(p => p.status === 'error').length;

    return {
      totalPlugins: this.pluginRegistry.size,
      loadedPlugins: this.loadedPlugins.size,
      cacheSize: this.pluginCache.size,
      memoryUsage: this.calculateMemoryUsage(),
      averageLoadTime: loadedPlugins.length > 0 ? totalLoadTime / loadedPlugins.length : 0,
      errorRate: loadedPlugins.length > 0 ? errorCount / loadedPlugins.length : 0
    };
  }

  /**
   * 清理系统缓存
   */
  clearCache(): void {
    this.pluginCache.clear();
    console.log('🗑️ 插件缓存已清理');
    this.emit('cache:cleared');
  }

  /**
   * 销毁插件系统
   */
  async destroy(): Promise<void> {
    console.log('🗑️ 开始销毁插件系统...');

    // 卸载所有插件
    const unloadPromises = Array.from(this.loadedPlugins.keys()).map(name =>
      this.unloadPlugin(name).catch(error => {
        console.error(`卸载插件失败: ${name}`, error);
      })
    );

    await Promise.allSettled(unloadPromises);

    // 清理资源
    this.pluginRegistry.clear();
    this.loadedPlugins.clear();
    this.dependencyGraph.clear();
    this.loadingPromises.clear();
    this.pluginCache.clear();
    this.eventListeners.clear();

    console.log('✅ 插件系统已销毁');
  }

  // ========== 事件系统 ==========

  /**
   * 监听事件
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error);
        }
      });
    }
  }

  // ========== 私有方法 ==========

  /**
   * 初始化系统
   */
  private initializeSystem(): void {
    console.log('🚀 初始化模版插件系统...');
    
    // 注册默认插件
    this.registerDefaultPlugins();
    
    // 启动清理任务
    this.startCleanupTask();
    
    console.log('✅ 模版插件系统初始化完成');
  }

  /**
   * 执行插件加载
   */
  private async executePluginLoad(name: string, options: PluginLoadOptions): Promise<TemplatePluginInstance> {
    const entry = this.pluginRegistry.get(name);
    if (!entry) {
      throw new Error(`插件未注册: ${name}`);
    }

    console.log(`⏳ 开始加载插件: ${name}`);
    const startTime = Date.now();

    try {
      // 创建插件实例
      const instance: TemplatePluginInstance = {
        metadata: await this.loadPluginMetadata(entry),
        status: 'loading',
        lifecycleState: 'installing',
        usage: {
          loadCount: 0,
          renderCount: 0,
          lastUsed: Date.now(),
          averageRenderTime: 0
        },
        config: options.config || {}
      };

      // 检查依赖
      if (options.resolveDependencies !== false) {
        await this.resolveDependencies(instance.metadata);
      }

      // 加载插件代码
      instance.instance = await this.loadPluginCode(entry, options);
      
      // 应用企业定制
      if (options.customization || this.enterpriseConfig) {
        instance.customization = options.customization || this.enterpriseConfig;
        this.applyCustomization(instance);
      }

      // 初始化插件
      if (instance.instance && typeof instance.instance.initialize === 'function') {
        await instance.instance.initialize(instance.config);
      }

      instance.status = 'loaded';
      instance.lifecycleState = 'active';
      instance.loadedAt = Date.now();

      const loadTime = instance.loadedAt - startTime;
      console.log(`✅ 插件加载完成: ${name} (${loadTime}ms)`);

      this.emit('plugin:loaded', { name, instance, loadTime });
      return instance;
    } catch (error) {
      console.error(`❌ 插件加载失败: ${name}`, error);
      const errorInstance: TemplatePluginInstance = {
        metadata: {} as TemplatePluginMetadata,
        status: 'error',
        lifecycleState: 'error',
        error: error as Error,
        usage: {
          loadCount: 0,
          renderCount: 0,
          lastUsed: Date.now(),
          averageRenderTime: 0
        },
        config: {}
      };
      this.emit('plugin:error', { name, error, instance: errorInstance });
      throw error;
    }
  }

  /**
   * 加载插件元数据
   */
  private async loadPluginMetadata(entry: PluginRegistryEntry): Promise<TemplatePluginMetadata> {
    // 简化实现，实际会从插件包中读取metadata.json
    return {
      name: entry.name,
      displayName: entry.name,
      description: `${entry.name} 插件`,
      version: {
        version: '1.0.0',
        semver: { major: 1, minor: 0, patch: 0 },
        publishedAt: new Date().toISOString(),
        changelog: '初始版本',
        compatibility: {
          minEngineVersion: '1.0.0',
          supportedBrowsers: ['chrome', 'firefox', 'safari', 'edge']
        },
        stable: true,
        deprecated: false
      },
      author: {
        name: 'SmartAbp Team',
        email: 'team@smartabp.com'
      },
      type: 'component',
      tags: ['ui', 'template'],
      icon: 'default-icon.svg',
      screenshots: [],
      license: 'MIT',
      dependencies: [],
      customization: {
        supportsBranding: true,
        supportsTheme: true,
        supportsLayout: true,
        customizableProperties: ['color', 'font', 'spacing']
      },
      performance: {
        bundleSize: 0,
        loadTime: 0,
        memoryUsage: 0,
        renderTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 加载插件代码
   */
  private async loadPluginCode(entry: PluginRegistryEntry, options: PluginLoadOptions): Promise<any> {
    // 检查缓存
    if (this.pluginCache.has(entry.name) && !options.forceReload) {
      return this.pluginCache.get(entry.name);
    }

    let pluginCode: any;

    if (entry.remote) {
      // 远程插件加载
      pluginCode = await this.loadRemotePlugin(entry);
    } else {
      // 本地插件加载
      pluginCode = await this.loadLocalPlugin(entry);
    }

    // 缓存插件代码
    if (this.pluginCache.size >= this.maxCacheSize) {
      // 清理最旧的缓存
      const firstKey = this.pluginCache.keys().next().value;
      if (firstKey) {
        this.pluginCache.delete(firstKey);
      }
    }
    this.pluginCache.set(entry.name, pluginCode);

    return pluginCode;
  }

  /**
   * 加载远程插件
   */
  private async loadRemotePlugin(entry: PluginRegistryEntry): Promise<any> {
    const response = await fetch(entry.source, {
      method: 'GET',
      headers: {
        'Accept': 'application/javascript'
      }
    });

    if (!response.ok) {
      throw new Error(`远程插件加载失败: ${response.status} ${response.statusText}`);
    }

    const code = await response.text();
    
    // 动态执行插件代码
    const module = { exports: {} };
    const func = new Function('module', 'exports', 'require', code);
    func(module, module.exports, this.createRequireFunction());
    
    return module.exports;
  }

  /**
   * 加载本地插件
   */
  private async loadLocalPlugin(entry: PluginRegistryEntry): Promise<any> {
    // 动态import本地插件
    const module = await import(entry.source);
    return module.default || module;
  }

  /**
   * 创建require函数
   */
  private createRequireFunction(): (id: string) => any {
    return (id: string) => {
      // 简化的require实现
      if (id.startsWith('@smartabp/')) {
        // 返回内部模块
        return this.getInternalModule(id);
      }
      throw new Error(`模块未找到: ${id}`);
    };
  }

  /**
   * 获取内部模块
   */
  private getInternalModule(id: string): any {
    // 返回SmartAbp内部模块
    switch (id) {
      case '@smartabp/lowcode-shared':
        return {}; // 实际返回shared模块
      case '@smartabp/lowcode-core':
        return {}; // 实际返回core模块
      default:
        throw new Error(`内部模块未找到: ${id}`);
    }
  }

  /**
   * 解析依赖关系
   */
  private async resolveDependencies(metadata: TemplatePluginMetadata): Promise<void> {
    for (const dep of metadata.dependencies) {
      if (!this.loadedPlugins.has(dep.name) && !dep.optional) {
        console.log(`📦 加载依赖插件: ${dep.name}`);
        await this.loadPlugin(dep.name);
      }
    }

    // 更新依赖图
    const deps = new Set(metadata.dependencies.map(d => d.name));
    this.dependencyGraph.set(metadata.name, deps);
  }

  /**
   * 查找依赖者
   */
  private findDependents(pluginName: string): string[] {
    const dependents: string[] = [];
    
    this.dependencyGraph.forEach((deps, name) => {
      if (deps.has(pluginName)) {
        dependents.push(name);
      }
    });

    return dependents;
  }

  /**
   * 应用企业定制
   */
  private applyCustomization(plugin: TemplatePluginInstance): void {
    if (!plugin.customization || !plugin.instance) return;

    const customization = plugin.customization;
    
    // 应用品牌定制
    if (plugin.metadata.customization.supportsBranding && plugin.instance.setBranding) {
      plugin.instance.setBranding(customization.branding);
    }

    // 应用主题定制
    if (plugin.metadata.customization.supportsTheme && plugin.instance.setTheme) {
      plugin.instance.setTheme(customization.theme);
    }

    // 应用布局定制
    if (plugin.metadata.customization.supportsLayout && plugin.instance.setLayout) {
      plugin.instance.setLayout(customization.layout);
    }
  }

  /**
   * 更新使用统计
   */
  private updateUsageStats(plugin: TemplatePluginInstance): void {
    plugin.usage.loadCount++;
    plugin.usage.lastUsed = Date.now();
  }

  /**
   * 注册默认插件
   */
  private registerDefaultPlugins(): void {
    // 注册一些默认的UI模版插件
    const defaultPlugins: PluginRegistryEntry[] = [
      {
        name: 'basic-components',
        source: '/plugins/basic-components.js',
        remote: false,
        cacheStrategy: 'memory',
        preloadPriority: 'high'
      },
      {
        name: 'form-components',
        source: '/plugins/form-components.js',
        remote: false,
        cacheStrategy: 'memory',
        preloadPriority: 'medium'
      },
      {
        name: 'chart-components',
        source: '/plugins/chart-components.js',
        remote: false,
        cacheStrategy: 'disk',
        preloadPriority: 'low'
      }
    ];

    this.registerPlugins(defaultPlugins);
  }

  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000); // 每5分钟执行一次清理
  }

  /**
   * 执行清理
   */
  private performCleanup(): void {
    const now = Date.now();
    const cleanupThreshold = 30 * 60 * 1000; // 30分钟

    // 清理长时间未使用的插件
    this.loadedPlugins.forEach((plugin, name) => {
      if (now - plugin.usage.lastUsed > cleanupThreshold && plugin.lifecycleState === 'active') {
        console.log(`🧹 清理长时间未使用的插件: ${name}`);
        this.unloadPlugin(name).catch(error => {
          console.error(`清理插件失败: ${name}`, error);
        });
      }
    });
  }

  /**
   * 计算内存使用
   */
  private calculateMemoryUsage(): number {
    // 简化的内存计算
    let totalMemory = 0;
    this.loadedPlugins.forEach(plugin => {
      totalMemory += plugin.metadata.performance.memoryUsage;
    });
    return totalMemory;
  }

  /**
   * 获取当前引擎版本
   */
  private getCurrentEngineVersion(): string {
    return '1.0.0'; // 实际从package.json或其他地方获取
  }

  /**
   * 版本比较
   */
  private compareVersion(version1: string, version2: string): number {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }
}

/**
 * 工厂函数：创建插件系统
 */
export function createTemplatePluginSystem(options?: {
  maxCacheSize?: number;
  loadTimeout?: number;
  maxConcurrentLoads?: number;
  enableHotReload?: boolean;
  enterpriseConfig?: EnterpriseCustomization;
}): TemplatePluginSystem {
  return new TemplatePluginSystem(options);
}

/**
 * 全局插件系统实例
 */
let globalPluginSystem: TemplatePluginSystem | null = null;

/**
 * 获取全局插件系统
 */
export function getGlobalTemplatePluginSystem(): TemplatePluginSystem {
  if (!globalPluginSystem) {
    globalPluginSystem = new TemplatePluginSystem();
  }
  return globalPluginSystem;
}
