/**
 * 🏗️ 企业级组件注册中心
 * SmartAbp低代码引擎 - 公共组件系统革命
 * 
 * 核心功能:
 * - 统一组件注册、发现和管理
 * - 组件元数据管理和分类
 * - 依赖关系管理和解析
 * - 支持智能懒加载和内存管理
 */

export type ComponentCategory = 'basic' | 'layout' | 'form' | 'data' | 'chart' | 'advanced' | 'business';
export type LoadPriority = 'high' | 'medium' | 'low';

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
}

/**
 * 🏗️ 企业级组件注册中心
 */
export class ComponentRegistry {
  private components = new Map<string, ComponentMetadata>();
  private loadedComponents = new Map<string, ComponentInstance>();
  private loadingPromises = new Map<string, Promise<any>>();
  private categoryIndex = new Map<ComponentCategory, Set<string>>();
  private dependencyGraph = new Map<string, Set<string>>();
  private usageStats = new Map<string, { count: number; lastUsed: number }>();

  /**
   * 注册组件
   */
  register(metadata: ComponentMetadata): void {
    // 验证组件元数据
    this.validateMetadata(metadata);

    // 注册组件
    this.components.set(metadata.name, metadata);

    // 更新分类索引
    this.updateCategoryIndex(metadata);

    // 构建依赖图
    this.buildDependencyGraph(metadata);

    console.log(`✅ 组件已注册: ${metadata.name} (${metadata.category})`);
  }

  /**
   * 批量注册组件
   */
  registerBatch(metadataList: ComponentMetadata[]): void {
    metadataList.forEach(metadata => this.register(metadata));
    console.log(`✅ 批量注册完成: ${metadataList.length} 个组件`);
  }

  /**
   * 异步加载组件
   */
  async load(name: string): Promise<any> {
    // 检查是否已加载
    if (this.loadedComponents.has(name)) {
      const instance = this.loadedComponents.get(name)!;
      this.updateUsageStats(name);
      instance.active = true;
      return instance.component;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(name)) {
      return await this.loadingPromises.get(name)!;
    }

    // 获取组件元数据
    const metadata = this.components.get(name);
    if (!metadata) {
      throw new Error(`组件未注册: ${name}`);
    }

    // 加载依赖组件
    await this.loadDependencies(metadata.dependencies);

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
        active: true
      };

      // 缓存组件实例
      this.loadedComponents.set(name, instance);
      this.updateUsageStats(name);

      console.log(`✅ 组件已加载: ${name}`);
      return component;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  /**
   * 卸载组件
   */
  unload(name: string): void {
    const instance = this.loadedComponents.get(name);
    if (instance) {
      instance.active = false;
      this.loadedComponents.delete(name);
      console.log(`🗑️ 组件已卸载: ${name}`);
    }
  }

  /**
   * 获取组件元数据
   */
  getMetadata(name: string): ComponentMetadata | null {
    return this.components.get(name) || null;
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

    return {
      totalComponents,
      loadedComponents,
      activeComponents,
      totalMemoryUsage,
      averageLoadTime
    };
  }

  /**
   * 获取使用统计
   */
  getUsageStats(): Map<string, { count: number; lastUsed: number }> {
    return new Map(this.usageStats);
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
  private async loadDependencies(dependencies: string[]): Promise<void> {
    if (dependencies.length === 0) return;

    console.log(`🔗 加载依赖组件: ${dependencies.join(', ')}`);
    await Promise.all(dependencies.map(dep => this.load(dep)));
  }

  /**
   * 实际加载组件
   */
  private async loadComponent(metadata: ComponentMetadata): Promise<any> {
    console.log(`⏳ 正在加载组件: ${metadata.name}`);
    
    // 模拟动态导入组件
    // 实际实现中，这里应该根据metadata.bundle进行动态导入
    try {
      // 示例: 根据bundle路径动态导入
      const componentModule = await import(`@smartabp/lowcode-designer/components/${metadata.name}`);
      return componentModule.default || componentModule;
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
export function registerComponent(metadata: ComponentMetadata): void {
  globalComponentRegistry.register(metadata);
}

/**
 * 快捷函数：加载组件
 */
export async function loadComponent(name: string): Promise<any> {
  return await globalComponentRegistry.load(name);
}

/**
 * 快捷函数：获取组件元数据
 */
export function getComponentMetadata(name: string): ComponentMetadata | null {
  return globalComponentRegistry.getMetadata(name);
}
