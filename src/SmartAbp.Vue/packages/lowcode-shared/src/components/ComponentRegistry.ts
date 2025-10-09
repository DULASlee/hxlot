/**
 * 🏗️ 企业级组件注册中心 v2.1 + ComponentGenie AI
 * SmartAbp低代码引擎 - 公共组件系统革命
 *
 * 核心功能:
 * - 统一组件注册、发现和管理
 * - 组件元数据管理和分类
 * - 依赖关系管理和解析
 * - 支持智能懒加载和内存管理
 * - 热更新支持（开发模式）
 * - 权限控制和版本管理
 * - 生命周期钩子和扩展点
 * - 性能监控和错误追踪
 * - 🧠 ComponentGenie AI智能分析与建议
 */

// ComponentGenie AI智能分析
import { analyzeComponent, type ComponentAnalysis as AIAnalysis } from '../ai/ComponentGenie'

export type ComponentCategory =
  | 'basic' | 'layout' | 'form' | 'data' | 'chart' | 'advanced' | 'business'
  | 'workflow' | 'utility' | 'designer' | 'inspector' | 'preview' | 'monitor'
  | 'template' | 'codegen' | 'aspire' | 'security' | 'theme' | 'modeling'
  | 'quality' | 'solution' | 'wizard' | 'resilience' | 'devops' | 'git' | 'cicd'
  | 'code' | 'chaos' | 'observability' | 'view';
export type LoadPriority = 'high' | 'medium' | 'low';

/**
 * 组件生命周期钩子
 */
export interface ComponentLifecycleHooks {
  /** 组件注册前 */
  beforeRegister?: (metadata: ComponentMetadata) => Promise<void> | void;
  /** 组件注册后 */
  afterRegister?: (metadata: ComponentMetadata) => Promise<void> | void;
  /** 组件加载前 */
  beforeLoad?: (name: string) => Promise<void> | void;
  /** 组件加载后 */
  afterLoad?: (name: string, component: any) => Promise<void> | void;
  /** 组件卸载前 */
  beforeUnload?: (name: string) => Promise<void> | void;
  /** 组件卸载后 */
  afterUnload?: (name: string) => Promise<void> | void;
}

/**
 * 组件扩展点
 */
export interface ComponentExtensionPoint {
  /** 扩展点名称 */
  name: string;
  /** 扩展点描述 */
  description?: string;
  /** 扩展点类型 */
  type: 'hook' | 'middleware' | 'plugin' | 'adapter';
  /** 扩展点优先级 */
  priority?: number;
  /** 扩展点处理器 */
  handler: (...args: any[]) => Promise<any> | any;
}

/**
 * 组件权限配置
 */
export interface ComponentPermission {
  /** 允许的角色 */
  roles?: string[];
  /** 允许的权限 */
  permissions?: string[];
  /** 是否公开访问 */
  public?: boolean;
  /** 自定义权限检查函数 */
  customCheck?: (user: any) => boolean;
}

/**
 * 组件版本信息
 */
export interface ComponentVersion {
  /** 版本号 */
  version: string;
  /** 变更日志 */
  changelog?: string;
  /** 是否已废弃 */
  deprecated?: boolean;
  /** 废弃信息 */
  deprecationMessage?: string;
  /** 兼容性信息 */
  compatibility?: string[];
}

/**
 * 组件元数据接口
 */
export interface ComponentMetadata {
  /** 组件名称 */
  name: string;
  /** 组件显示名称 */
  displayName: string;
  /** 组件描述 */
  description?: string;
  /** 组件分类 */
  category: ComponentCategory;
  /** 加载优先级 */
  priority: LoadPriority;
  /** 依赖的其他组件 */
  dependencies: string[];
  /** 所属bundle */
  bundle: string;
  /** 是否懒加载 */
  lazy: boolean;
  /** 是否预加载 */
  preload: boolean;
  /** 组件版本 */
  version: string;
  /** 组件标签 */
  tags: string[];
  /** 组件图标 */
  icon?: string;
  /** 组件大小估算 (KB) */
  estimatedSize?: number;
  /** 使用频率统计 */
  usageCount?: number;
  /** 最后使用时间 */
  lastUsed?: number;
  /** 权限配置 */
  permissions?: ComponentPermission;
  /** 生命周期钩子 */
  lifecycleHooks?: ComponentLifecycleHooks;
  /** 扩展点 */
  extensionPoints?: ComponentExtensionPoint[];
  /** 版本信息 */
  versionInfo?: ComponentVersion;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧠 ComponentGenie AI分析结果
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** ComponentGenie AI分析结果 */
  aiAnalysis?: AIAnalysis;
  /** AI建议分类（与手动分类比对） */
  aiSuggestedCategory?: ComponentCategory;
  /** AI分析置信度 (0-1) */
  aiConfidence?: number;
  /** AI优化建议数量 */
  aiSuggestionsCount?: number;
  /** 源代码（用于AI分析） */
  sourceCode?: string;
}

/**
 * 组件实例接口
 */
export interface ComponentInstance {
  /** 组件元数据 */
  metadata: ComponentMetadata;
  /** 组件构造函数或组件对象 */
  component: any;
  /** 加载时间戳 */
  loadedAt: number;
  /** 内存占用估算 */
  memoryUsage?: number;
  /** 是否已激活 */
  active: boolean;
  /** 组件状态 */
  state?: Record<string, any>;
}

/**
 * 组件加载统计
 */
export interface ComponentLoadStats {
  /** 总组件数 */
  totalComponents: number;
  /** 已加载组件数 */
  loadedComponents: number;
  /** 活跃组件数 */
  activeComponents: number;
  /** 内存占用总计 */
  totalMemoryUsage: number;
  /** 加载时间统计 */
  averageLoadTime: number;
  /** 错误统计 */
  errorCount: number;
  /** 性能统计 */
  performanceMetrics: {
    averageLoadTime: number;
    slowestComponent: string;
    fastestComponent: string;
  };
}

/**
 * 性能监控指标
 */
export interface PerformanceMetric {
  /** 指标类型 */
  type: 'load' | 'render' | 'error' | 'memory';
  /** 组件名称 */
  component: string;
  /** 指标值 */
  value: number;
  /** 时间戳 */
  timestamp: number;
  /** 额外信息 */
  metadata?: Record<string, any>;
}

/**
 * 🏗️ 企业级组件注册中心 v2.0
 */
export class ComponentRegistry {
  private components = new Map<string, ComponentMetadata>();
  private loadedComponents = new Map<string, ComponentInstance>();
  private loadingPromises = new Map<string, Promise<any>>();
  private categoryIndex = new Map<ComponentCategory, Set<string>>();
  private dependencyGraph = new Map<string, Set<string>>();
  private usageStats = new Map<string, { count: number; lastUsed: number; }>();
  private performanceMetrics = new Map<string, PerformanceMetric[]>();
  private globalLifecycleHooks: ComponentLifecycleHooks = {};
  private extensionPoints = new Map<string, ComponentExtensionPoint[]>();
  private hotReloadEnabled = false;

  /**
   * 注册组件
   */
  async register(metadata: ComponentMetadata): Promise<void> {
    // 执行全局beforeRegister钩子
    if (this.globalLifecycleHooks.beforeRegister) {
      await this.globalLifecycleHooks.beforeRegister(metadata);
    }

    // 执行组件beforeRegister钩子
    if (metadata.lifecycleHooks?.beforeRegister) {
      await metadata.lifecycleHooks.beforeRegister(metadata);
    }

    // 验证组件元数据
    this.validateMetadata(metadata);

    // 检查版本冲突
    if (this.checkVersionConflict(metadata.name, metadata.version)) {
      console.warn(`⚠️ 版本冲突: ${metadata.name} v${metadata.version}`);
    }

    // 🧠 ComponentGenie AI智能分析
    if (metadata.sourceCode) {
      try {
        const aiAnalysis = analyzeComponent(metadata.name, metadata.sourceCode);
        
        // 增强元数据
        metadata.aiAnalysis = aiAnalysis;
        metadata.aiSuggestedCategory = this.mapAICategoryToRegistry(aiAnalysis.category);
        metadata.aiConfidence = aiAnalysis.confidence;
        metadata.aiSuggestionsCount = aiAnalysis.suggestions.length;
        
        // AI建议与手动分类比对
        if (metadata.aiSuggestedCategory !== metadata.category) {
          console.log(`🤔 AI建议分类: ${metadata.name} -> ${metadata.aiSuggestedCategory} (当前: ${metadata.category}, 置信度: ${(aiAnalysis.confidence * 100).toFixed(1)}%)`);
        }
        
        // 输出AI优化建议
        if (aiAnalysis.suggestions.length > 0) {
          console.log(`💡 ${metadata.name} AI优化建议 (${aiAnalysis.suggestions.length}个):`);
          aiAnalysis.suggestions.forEach((suggestion, index) => {
            console.log(`   ${index + 1}. [${suggestion.type}] ${suggestion.message} (影响: ${suggestion.impact}/5, 难度: ${suggestion.difficulty}/5)`);
          });
        }
        
      } catch (error) {
        console.warn(`⚠️ ComponentGenie分析失败: ${metadata.name}`, error);
      }
    }

    // 注册组件
    this.components.set(metadata.name, metadata);

    // 更新分类索引
    this.updateCategoryIndex(metadata);

    // 构建依赖图
    this.buildDependencyGraph(metadata);

    // 注册扩展点
    if (metadata.extensionPoints) {
      this.registerExtensionPoints(metadata.name, metadata.extensionPoints);
    }

    console.log(`✅ 组件已注册: ${metadata.name} (${metadata.category}) v${metadata.version}`);

    // 执行全局afterRegister钩子
    if (this.globalLifecycleHooks.afterRegister) {
      await this.globalLifecycleHooks.afterRegister(metadata);
    }

    // 执行组件afterRegister钩子
    if (metadata.lifecycleHooks?.afterRegister) {
      await metadata.lifecycleHooks.afterRegister(metadata);
    }
  }

  /**
   * 批量注册组件
   */
  async registerBatch(metadataList: ComponentMetadata[]): Promise<void> {
    console.log(`🚀 开始批量注册 ${metadataList.length} 个组件`);

    for (const metadata of metadataList) {
      try {
        await this.register(metadata);
      } catch (error) {
        console.error(`❌ 组件注册失败: ${metadata.name}`, error);
      }
    }

    console.log(`✅ 批量注册完成: ${metadataList.length} 个组件`);
  }

  /**
   * 异步加载组件
   */
  async load(name: string, user?: any): Promise<any> {
    const startTime = performance.now();

    // 执行全局beforeLoad钩子
    if (this.globalLifecycleHooks.beforeLoad) {
      await this.globalLifecycleHooks.beforeLoad(name);
    }

    // 获取组件元数据
    const metadata = this.components.get(name);
    if (!metadata) {
      throw new Error(`组件未注册: ${name}`);
    }

    // 执行组件beforeLoad钩子
    if (metadata.lifecycleHooks?.beforeLoad) {
      await metadata.lifecycleHooks.beforeLoad(name);
    }

    // 权限检查
    if (user && !this.checkPermission(name, user)) {
      throw new Error(`权限不足: ${name}`);
    }

    // 检查是否已加载
    if (this.loadedComponents.has(name)) {
      const instance = this.loadedComponents.get(name)!;
      this.updateUsageStats(name);
      instance.active = true;

      // 记录性能指标
      this.recordPerformanceMetric({
        type: 'load',
        component: name,
        value: performance.now() - startTime,
        timestamp: Date.now()
      });

      return instance.component;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(name)) {
      return await this.loadingPromises.get(name)!;
    }

    // 加载依赖组件
    await this.loadDependencies(metadata.dependencies, user);

    // 创建加载Promise
    const loadPromise = this.loadComponent(metadata);
    this.loadingPromises.set(name, loadPromise);

    try {
      const component = await loadPromise;

      // 创建组件实例
      const instance: ComponentInstance = {
        metadata,
        component,
        loadedAt: Date.now(),
        memoryUsage: this.estimateMemoryUsage(component),
        active: true,
        state: {}
      };

      // 缓存组件实例
      this.loadedComponents.set(name, instance);
      this.updateUsageStats(name);

      // 记录性能指标
      const loadTime = performance.now() - startTime;
      this.recordPerformanceMetric({
        type: 'load',
        component: name,
        value: loadTime,
        timestamp: Date.now()
      });

      console.log(`✅ 组件已加载: ${name} (${loadTime.toFixed(2)}ms)`);

      // 执行全局afterLoad钩子
      if (this.globalLifecycleHooks.afterLoad) {
        await this.globalLifecycleHooks.afterLoad(name, component);
      }

      // 执行组件afterLoad钩子
      if (metadata.lifecycleHooks?.afterLoad) {
        await metadata.lifecycleHooks.afterLoad(name, component);
      }

      return component;
    } catch (error) {
      // 记录错误指标
      this.recordPerformanceMetric({
        type: 'error',
        component: name,
        value: 1,
        timestamp: Date.now(),
        metadata: { error: (error as Error).message }
      });
      throw error;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  /**
   * 卸载组件
   */
  async unload(name: string): Promise<void> {
    const instance = this.loadedComponents.get(name);
    if (!instance) return;

    // 执行全局beforeUnload钩子
    if (this.globalLifecycleHooks.beforeUnload) {
      await this.globalLifecycleHooks.beforeUnload(name);
    }

    // 执行组件beforeUnload钩子
    if (instance.metadata.lifecycleHooks?.beforeUnload) {
      await instance.metadata.lifecycleHooks.beforeUnload(name);
    }

    instance.active = false;
    this.loadedComponents.delete(name);

    // 执行全局afterUnload钩子
    if (this.globalLifecycleHooks.afterUnload) {
      await this.globalLifecycleHooks.afterUnload(name);
    }

    // 执行组件afterUnload钩子
    if (instance.metadata.lifecycleHooks?.afterUnload) {
      await instance.metadata.lifecycleHooks.afterUnload(name);
    }

    console.log(`🗑️ 组件已卸载: ${name}`);
  }

  /**
   * 热更新组件（开发模式）
   */
  async hotReload(componentName: string): Promise<void> {
    if (!this.hotReloadEnabled) {
      console.warn('⚠️ 热更新未启用');
      return;
    }

    const oldComponent = this.loadedComponents.get(componentName);
    if (!oldComponent) {
      throw new Error(`组件未加载: ${componentName}`);
    }

    console.log(`🔄 开始热更新: ${componentName}`);

    // 1. 保存状态
    const state = oldComponent.state || {};

    // 2. 卸载旧组件
    await this.unload(componentName);

    // 3. 清除缓存
    this.loadingPromises.delete(componentName);

    // 4. 重新加载
    await this.load(componentName);

    // 5. 恢复状态
    const newInstance = this.loadedComponents.get(componentName);
    if (newInstance) {
      newInstance.state = state;
    }

    console.log(`✅ 热更新完成: ${componentName}`);
  }

  /**
   * 启用热更新
   */
  enableHotReload(): void {
    this.hotReloadEnabled = true;

    if (import.meta.hot) {
      import.meta.hot.on('component-update', (data: any) => {
        this.hotReload(data.componentName);
      });
    }

    console.log('🔥 热更新已启用');
  }

  /**
   * 设置全局生命周期钩子
   */
  setGlobalLifecycleHooks(hooks: ComponentLifecycleHooks): void {
    this.globalLifecycleHooks = { ...this.globalLifecycleHooks, ...hooks };
  }

  /**
   * 注册扩展点
   */
  registerExtensionPoints(componentName: string, extensionPoints: ComponentExtensionPoint[]): void {
    this.extensionPoints.set(componentName, extensionPoints);
  }

  /**
   * 执行扩展点
   */
  async executeExtensionPoint(componentName: string, pointName: string, ...args: any[]): Promise<any> {
    const points = this.extensionPoints.get(componentName) || [];
    const point = points.find(p => p.name === pointName);

    if (!point) {
      throw new Error(`扩展点不存在: ${componentName}.${pointName}`);
    }

    return await point.handler(...args);
  }

  /**
   * 权限检查
   */
  checkPermission(componentName: string, user: any): boolean {
    const metadata = this.components.get(componentName);
    if (!metadata?.permissions) return true;

    const permission = metadata.permissions;

    // 公开访问
    if (permission.public) return true;

    // 自定义权限检查
    if (permission.customCheck) {
      return permission.customCheck(user);
    }

    // 角色检查
    if (permission.roles && permission.roles.length > 0) {
      if (!user.roles || !permission.roles.some(role => user.roles.includes(role))) {
        return false;
      }
    }

    // 权限检查
    if (permission.permissions && permission.permissions.length > 0) {
      if (!user.permissions || !permission.permissions.some(perm => user.permissions.includes(perm))) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取用户可用组件
   */
  getAvailableComponents(user?: any): ComponentMetadata[] {
    return Array.from(this.components.values()).filter(component =>
      this.checkPermission(component.name, user)
    );
  }

  /**
   * 版本冲突检查
   */
  checkVersionConflict(componentName: string, version: string): boolean {
    const existing = this.components.get(componentName);
    if (!existing) return false;

    // 简单的版本比较（实际项目中应使用semver）
    return existing.version !== version;
  }

  /**
   * 获取组件元数据
   */
  getMetadata(name: string): ComponentMetadata | null {
    return this.components.get(name) || null;
  }

  /**
   * 检查组件是否已注册
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * 获取所有已注册的组件Map（只读访问）
   */
  get componentsMap(): ReadonlyMap<string, ComponentMetadata> {
    return this.components;
  }

  /**
   * 获取分类下的所有组件
   */
  getCategoryComponents(category: ComponentCategory): ComponentMetadata[] {
    const componentNames = this.categoryIndex.get(category) || new Set();
    return Array.from(componentNames)
      .map(name => this.components.get(name)!)
      .filter(Boolean);
  }

  /**
   * 搜索组件
   */
  searchComponents(query: string): ComponentMetadata[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.components.values())
      .filter(metadata =>
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.displayName.toLowerCase().includes(lowerQuery) ||
        metadata.description?.toLowerCase().includes(lowerQuery) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  /**
   * 获取组件依赖关系
   */
  getDependencies(name: string): string[] {
    const metadata = this.components.get(name);
    return metadata?.dependencies || [];
  }

  /**
   * 获取依赖此组件的其他组件
   */
  getDependents(name: string): string[] {
    const dependents: string[] = [];
    for (const [componentName, deps] of this.dependencyGraph) {
      if (deps.has(name)) {
        dependents.push(componentName);
      }
    }
    return dependents;
  }

  /**
   * 获取加载统计信息
   */
  getLoadStats(): ComponentLoadStats {
    const totalComponents = this.components.size;
    const loadedComponents = this.loadedComponents.size;
    const activeComponents = Array.from(this.loadedComponents.values())
      .filter(instance => instance.active).length;

    const totalMemoryUsage = Array.from(this.loadedComponents.values())
      .reduce((total, instance) => total + (instance.memoryUsage || 0), 0);

    const loadTimes = Array.from(this.loadedComponents.values())
      .map(instance => Date.now() - instance.loadedAt);
    const averageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0;

    // 性能指标
    const loadMetrics = Array.from(this.performanceMetrics.values())
      .flat()
      .filter(m => m.type === 'load');

    const performanceMetrics = {
      averageLoadTime: loadMetrics.length > 0
        ? loadMetrics.reduce((sum, m) => sum + m.value, 0) / loadMetrics.length
        : 0,
      slowestComponent: loadMetrics.length > 0
        ? loadMetrics.reduce((slowest, m) => m.value > slowest.value ? m : slowest).component
        : '',
      fastestComponent: loadMetrics.length > 0
        ? loadMetrics.reduce((fastest, m) => m.value < fastest.value ? m : fastest).component
        : ''
    };

    // 错误统计
    const errorCount = Array.from(this.performanceMetrics.values())
      .flat()
      .filter(m => m.type === 'error').length;

    return {
      totalComponents,
      loadedComponents,
      activeComponents,
      totalMemoryUsage,
      averageLoadTime,
      errorCount,
      performanceMetrics
    };
  }

  /**
   * 获取使用统计
   */
  getUsageStats(): Map<string, { count: number; lastUsed: number; }> {
    return new Map(this.usageStats);
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(componentName?: string): PerformanceMetric[] {
    if (componentName) {
      return this.performanceMetrics.get(componentName) || [];
    }
    return Array.from(this.performanceMetrics.values()).flat();
  }

  /**
   * 清理不活跃的组件
   */
  cleanupInactive(maxIdleTime: number = 5 * 60 * 1000): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [name, stats] of this.usageStats) {
      if (now - stats.lastUsed > maxIdleTime) {
        const instance = this.loadedComponents.get(name);
        if (instance && !instance.active) {
          this.unload(name);
          cleanedCount++;
        }
      }
    }

    console.log(`🧹 清理完成: ${cleanedCount} 个不活跃组件`);
    return cleanedCount;
  }

  /**
   * 预加载高优先级组件
   */
  async preloadHighPriority(): Promise<void> {
    const highPriorityComponents = Array.from(this.components.values())
      .filter(metadata => metadata.priority === 'high' && metadata.preload)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)); // 按使用频率排序

    console.log(`🚀 开始预加载 ${highPriorityComponents.length} 个高优先级组件`);

    for (const metadata of highPriorityComponents) {
      try {
        await this.load(metadata.name);
      } catch (error) {
        console.error(`❌ 预加载失败: ${metadata.name}`, error);
      }
    }
  }

  // ========== 私有方法 ==========

  /**
   * 验证组件元数据
   */
  private validateMetadata(metadata: ComponentMetadata): void {
    if (!metadata.name) {
      throw new Error('组件名称不能为空');
    }
    if (!metadata.displayName) {
      throw new Error('组件显示名称不能为空');
    }
    if (!metadata.category) {
      throw new Error('组件分类不能为空');
    }
    if (!metadata.bundle) {
      throw new Error('组件bundle不能为空');
    }
    if (!metadata.version) {
      throw new Error('组件版本不能为空');
    }
  }

  /**
   * 更新分类索引
   */
  private updateCategoryIndex(metadata: ComponentMetadata): void {
    if (!this.categoryIndex.has(metadata.category)) {
      this.categoryIndex.set(metadata.category, new Set());
    }
    this.categoryIndex.get(metadata.category)!.add(metadata.name);
  }

  /**
   * 构建依赖图
   */
  private buildDependencyGraph(metadata: ComponentMetadata): void {
    this.dependencyGraph.set(metadata.name, new Set(metadata.dependencies));
  }

  /**
   * 加载依赖组件
   */
  private async loadDependencies(dependencies: string[], user?: any): Promise<void> {
    if (dependencies.length === 0) return;

    console.log(`🔗 加载依赖组件: ${dependencies.join(', ')}`);
    await Promise.all(dependencies.map(dep => this.load(dep, user)));
  }

  /**
   * 实际加载组件
   */
  private async loadComponent(metadata: ComponentMetadata): Promise<any> {
    console.log(`⏳ 正在加载组件: ${metadata.name}`);

    // 模拟动态导入组件
    // 实际实现中，这里应该根据metadata.bundle进行动态导入
    try {
      // ✅ 简化实现：直接抛出错误，由上层处理
      throw new Error(`Dynamic component loading not implemented for: ${metadata.name}`);
    } catch (error) {
      // 降级处理：尝试其他路径
      console.warn(`⚠️ 主路径加载失败，尝试备用路径: ${metadata.name}`);

      // 返回占位组件
      return {
        name: metadata.name,
        render: () => `<div>组件加载中: ${metadata.displayName}</div>`
      };
    }
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(_component: any): number {
    // 简单估算，实际实现可以更精确
    return Math.random() * 1024; // 模拟 0-1KB 的内存占用
  }

  /**
   * 更新使用统计
   */
  private updateUsageStats(name: string): void {
    const current = this.usageStats.get(name) || { count: 0, lastUsed: 0 };
    this.usageStats.set(name, {
      count: current.count + 1,
      lastUsed: Date.now()
    });

    // 更新组件元数据中的使用统计
    const metadata = this.components.get(name);
    if (metadata) {
      metadata.usageCount = current.count + 1;
      metadata.lastUsed = Date.now();
    }
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(metric: PerformanceMetric): void {
    const existing = this.performanceMetrics.get(metric.component) || [];
    existing.push(metric);

    // 只保留最近100个指标
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }

    this.performanceMetrics.set(metric.component, existing);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧠 ComponentGenie AI相关方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 将ComponentGenie的AI分类映射到组件注册系统的分类
   */
  private mapAICategoryToRegistry(aiCategory: string): ComponentCategory {
    const categoryMap: Record<string, ComponentCategory> = {
      'FORM_COMPONENT': 'form',
      'DATA_DISPLAY': 'data',
      'LAYOUT_COMPONENT': 'layout',
      'INTERACTIVE_COMPONENT': 'basic',
      'UTILITY_COMPONENT': 'utility',
      'BUSINESS_COMPONENT': 'business',
      'UNKNOWN': 'basic'
    };
    
    return categoryMap[aiCategory] || 'basic';
  }

  /**
   * 获取组件的AI分析结果
   */
  getComponentAIAnalysis(name: string): AIAnalysis | undefined {
    const metadata = this.components.get(name);
    return metadata?.aiAnalysis;
  }

  /**
   * 获取所有组件的AI统计信息
   */
  getAIStatistics(): {
    totalAnalyzed: number;
    averageConfidence: number;
    categoryDistribution: Record<string, number>;
    totalSuggestions: number;
    highConfidenceComponents: string[];
  } {
    const stats = {
      totalAnalyzed: 0,
      averageConfidence: 0,
      categoryDistribution: {} as Record<string, number>,
      totalSuggestions: 0,
      highConfidenceComponents: [] as string[]
    };

    let totalConfidence = 0;
    
    for (const [name, metadata] of this.components) {
      if (metadata.aiAnalysis) {
        stats.totalAnalyzed++;
        totalConfidence += metadata.aiConfidence || 0;
        stats.totalSuggestions += metadata.aiSuggestionsCount || 0;
        
        // 高置信度组件（置信度 > 80%）
        if ((metadata.aiConfidence || 0) > 0.8) {
          stats.highConfidenceComponents.push(name);
        }
        
        // 分类分布
        const category = metadata.aiAnalysis.category;
        stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
      }
    }
    
    stats.averageConfidence = stats.totalAnalyzed > 0 ? totalConfidence / stats.totalAnalyzed : 0;
    
    return stats;
  }

  /**
   * 批量重新分析所有有源代码的组件
   */
  async reanalyzeAllComponents(): Promise<void> {
    console.log('🧠 开始批量重新分析所有组件...');
    
    let analyzed = 0;
    for (const [name, metadata] of this.components) {
      if (metadata.sourceCode) {
        try {
          const aiAnalysis = analyzeComponent(name, metadata.sourceCode);
          
          // 更新AI分析结果
          metadata.aiAnalysis = aiAnalysis;
          metadata.aiSuggestedCategory = this.mapAICategoryToRegistry(aiAnalysis.category);
          metadata.aiConfidence = aiAnalysis.confidence;
          metadata.aiSuggestionsCount = aiAnalysis.suggestions.length;
          
          analyzed++;
        } catch (error) {
          console.warn(`⚠️ 重新分析失败: ${name}`, error);
        }
      }
    }
    
    console.log(`✅ 批量重新分析完成: ${analyzed}个组件`);
    
    // 输出整体AI统计
    const stats = this.getAIStatistics();
    console.log('📊 AI分析统计:', stats);
  }

  /**
   * 获取AI建议最多的组件（需要优化的组件）
   */
  getComponentsNeedingOptimization(minSuggestions: number = 2): Array<{
    name: string;
    suggestions: number;
    confidence: number;
    category: string;
  }> {
    const results: Array<{
      name: string;
      suggestions: number;
      confidence: number;
      category: string;
    }> = [];
    
    for (const [name, metadata] of this.components) {
      if (metadata.aiAnalysis && (metadata.aiSuggestionsCount || 0) >= minSuggestions) {
        results.push({
          name,
          suggestions: metadata.aiSuggestionsCount || 0,
          confidence: metadata.aiConfidence || 0,
          category: metadata.aiAnalysis.category
        });
      }
    }
    
    return results.sort((a, b) => b.suggestions - a.suggestions);
  }
}

/**
 * 全局组件注册中心实例
 */
export const globalComponentRegistry = new ComponentRegistry();

/**
 * 工厂函数：创建组件注册中心
 */
export function createComponentRegistry(): ComponentRegistry {
  return new ComponentRegistry();
}

/**
 * 快捷函数：注册组件
 */
export async function registerComponent(metadata: ComponentMetadata): Promise<void> {
  await globalComponentRegistry.register(metadata);
}

/**
 * 快捷函数：加载组件
 */
export async function loadComponent(name: string, user?: any): Promise<any> {
  return await globalComponentRegistry.load(name, user);
}

/**
 * 快捷函数：获取组件元数据
 */
export function getComponentMetadata(name: string): ComponentMetadata | null {
  return globalComponentRegistry.getMetadata(name);
}

/**
 * 快捷函数：热更新组件
 */
export async function hotReloadComponent(name: string): Promise<void> {
  return await globalComponentRegistry.hotReload(name);
}

/**
 * 快捷函数：启用热更新
 */
export function enableHotReload(): void {
  globalComponentRegistry.enableHotReload();
}