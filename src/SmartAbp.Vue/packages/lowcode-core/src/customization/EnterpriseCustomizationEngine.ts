/**
 * 🏢 企业定制化引擎
 * SmartAbp低代码引擎 - 第二专题企业定制化系统
 * 
 * 核心功能:
 * - 完整的企业CI/VI定制化支持
 * - 品牌识别系统和主题切换
 * - 布局定制和功能权限控制
 * - 实时预览和所见即所得编辑
 * - 多租户定制配置管理
 */

// EnterpriseCustomization type imported but not used - removed for now

export type CustomizationScope = 'global' | 'tenant' | 'user' | 'role';
export type ThemeMode = 'light' | 'dark' | 'auto' | 'custom';
export type LayoutMode = 'fixed' | 'fluid' | 'responsive' | 'adaptive';

/**
 * 品牌资产配置
 */
export interface BrandAssets {
  /** 主Logo */
  primaryLogo: {
    light: string;
    dark: string;
    favicon: string;
  };
  /** 辅助Logo */
  secondaryLogos: {
    horizontal: string;
    vertical: string;
    icon: string;
    watermark: string;
  };
  /** 品牌颜色 */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    neutral: string;
  };
  /** 渐变色 */
  gradients: {
    primary: string;
    secondary: string;
    background: string;
  };
  /** 字体系统 */
  typography: {
    primaryFont: string;
    secondaryFont: string;
    codeFont: string;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, number>;
  };
}

/**
 * 主题配置
 */
export interface ThemeConfiguration {
  /** 主题名称 */
  name: string;
  /** 主题模式 */
  mode: ThemeMode;
  /** 是否为默认主题 */
  isDefault: boolean;
  /** 品牌资产 */
  brandAssets: BrandAssets;
  /** 组件样式覆盖 */
  componentOverrides: Record<string, any>;
  /** CSS变量 */
  cssVariables: Record<string, string>;
  /** 暗色模式配置 */
  darkMode?: {
    enabled: boolean;
    autoSwitch: boolean;
    schedule?: {
      start: string;
      end: string;
    };
  };
}

/**
 * 布局配置
 */
export interface LayoutConfiguration {
  /** 布局模式 */
  mode: LayoutMode;
  /** 头部配置 */
  header: {
    height: number;
    fixed: boolean;
    transparent: boolean;
    showLogo: boolean;
    showSearch: boolean;
    showUserMenu: boolean;
  };
  /** 侧边栏配置 */
  sidebar: {
    width: number;
    collapsible: boolean;
    collapsed: boolean;
    position: 'left' | 'right';
    showIcons: boolean;
    showLabels: boolean;
  };
  /** 底部配置 */
  footer: {
    height: number;
    fixed: boolean;
    showCopyright: boolean;
    showLinks: boolean;
  };
  /** 内容区域 */
  content: {
    maxWidth: number;
    padding: number;
    margin: number;
    borderRadius: number;
  };
  /** 响应式断点 */
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

/**
 * 功能配置
 */
export interface FeatureConfiguration {
  /** 模块开关 */
  modules: {
    dashboard: boolean;
    userManagement: boolean;
    roleManagement: boolean;
    systemSettings: boolean;
    auditLogs: boolean;
    notifications: boolean;
    fileManager: boolean;
    reportCenter: boolean;
  };
  /** 功能开关 */
  features: {
    multiLanguage: boolean;
    multiTenant: boolean;
    realTimeNotifications: boolean;
    advancedSearch: boolean;
    dataExport: boolean;
    bulkOperations: boolean;
    workflowEngine: boolean;
    apiIntegration: boolean;
  };
  /** 权限配置 */
  permissions: {
    canCustomizeTheme: boolean;
    canModifyLayout: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
    canExportData: boolean;
    canIntegrateApi: boolean;
  };
}

/**
 * 定制化配置
 */
export interface CustomizationConfiguration {
  /** 配置ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description: string;
  /** 企业信息 */
  enterprise: {
    id: string;
    name: string;
    domain: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  };
  /** 作用域 */
  scope: CustomizationScope;
  /** 主题配置 */
  theme: ThemeConfiguration;
  /** 布局配置 */
  layout: LayoutConfiguration;
  /** 功能配置 */
  features: FeatureConfiguration;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 创建者 */
  createdBy: string;
  /** 是否激活 */
  active: boolean;
}

/**
 * 定制化预览配置
 */
export interface PreviewConfiguration {
  /** 预览模式 */
  mode: 'live' | 'snapshot' | 'comparison';
  /** 预览设备 */
  device: 'desktop' | 'tablet' | 'mobile';
  /** 预览分辨率 */
  resolution: {
    width: number;
    height: number;
  };
  /** 预览页面 */
  pages: string[];
  /** 实时更新 */
  realTimeUpdate: boolean;
}

/**
 * 🏢 企业定制化引擎
 */
export class EnterpriseCustomizationEngine {
  private configurations = new Map<string, CustomizationConfiguration>();
  private activeConfiguration?: CustomizationConfiguration;
  private themeCache = new Map<string, ThemeConfiguration>();
  private previewMode = false;
  // Preview config will be implemented in future versions
  private eventListeners = new Map<string, Set<Function>>();

  // CSS注入器
  private styleElement?: HTMLStyleElement;
  private cssVariables = new Map<string, string>();

  constructor() {
    this.initializeEngine();
  }

  /**
   * 创建定制化配置
   */
  createConfiguration(config: Partial<CustomizationConfiguration>): CustomizationConfiguration {
    const id = config.id || this.generateConfigId();
    
    const configuration: CustomizationConfiguration = {
      id,
      name: config.name || `配置-${id}`,
      description: config.description || '',
      enterprise: config.enterprise || this.getDefaultEnterpriseInfo(),
      scope: config.scope || 'tenant',
      theme: config.theme || this.getDefaultTheme(),
      layout: config.layout || this.getDefaultLayout(),
      features: config.features || this.getDefaultFeatures(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: config.createdBy || 'system',
      active: config.active !== false
    };

    this.configurations.set(id, configuration);
    console.log(`🏢 创建企业定制配置: ${configuration.name} (${id})`);
    
    this.emit('configuration:created', configuration);
    return configuration;
  }

  /**
   * 应用定制化配置
   */
  async applyConfiguration(configId: string): Promise<void> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`定制化配置未找到: ${configId}`);
    }

    console.log(`🎨 应用企业定制配置: ${config.name}`);
    
    try {
      // 应用主题
      await this.applyTheme(config.theme);
      
      // 应用布局
      await this.applyLayout(config.layout);
      
      // 应用功能配置
      await this.applyFeatures(config.features);
      
      // 设置为活跃配置
      this.activeConfiguration = config;
      
      console.log(`✅ 企业定制配置应用完成: ${config.name}`);
      this.emit('configuration:applied', config);
    } catch (error) {
      console.error(`❌ 应用定制配置失败: ${config.name}`, error);
      this.emit('configuration:error', { config, error });
      throw error;
    }
  }

  /**
   * 更新定制化配置
   */
  updateConfiguration(configId: string, updates: Partial<CustomizationConfiguration>): CustomizationConfiguration {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`定制化配置未找到: ${configId}`);
    }

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.configurations.set(configId, updatedConfig);
    console.log(`📝 更新企业定制配置: ${updatedConfig.name}`);
    
    // 如果是当前活跃配置，立即应用更新
    if (this.activeConfiguration?.id === configId) {
      this.applyConfiguration(configId).catch(console.error);
    }
    
    this.emit('configuration:updated', updatedConfig);
    return updatedConfig;
  }

  /**
   * 删除定制化配置
   */
  deleteConfiguration(configId: string): void {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`定制化配置未找到: ${configId}`);
    }

    // 如果是当前活跃配置，先切换到默认配置
    if (this.activeConfiguration?.id === configId) {
      this.applyDefaultConfiguration();
    }

    this.configurations.delete(configId);
    console.log(`🗑️ 删除企业定制配置: ${config.name}`);
    
    this.emit('configuration:deleted', config);
  }

  /**
   * 获取所有配置
   */
  getConfigurations(): CustomizationConfiguration[] {
    return Array.from(this.configurations.values());
  }

  /**
   * 获取活跃配置
   */
  getActiveConfiguration(): CustomizationConfiguration | undefined {
    return this.activeConfiguration;
  }

  /**
   * 切换主题模式
   */
  async switchThemeMode(mode: ThemeMode): Promise<void> {
    if (!this.activeConfiguration) {
      throw new Error('没有活跃的定制化配置');
    }

    const updatedTheme = {
      ...this.activeConfiguration.theme,
      mode
    };

    await this.applyTheme(updatedTheme);
    
    // 更新配置
    this.updateConfiguration(this.activeConfiguration.id, {
      theme: updatedTheme
    });

    console.log(`🌙 主题模式已切换: ${mode}`);
    this.emit('theme:mode-changed', { mode, theme: updatedTheme });
  }

  /**
   * 启动预览模式
   */
  startPreview(config: PreviewConfiguration): void {
    this.previewMode = true;
    // Preview config functionality to be implemented
    
    console.log(`👁️ 启动定制预览模式: ${config.mode}`);
    this.emit('preview:started', config);
  }

  /**
   * 停止预览模式
   */
  stopPreview(): void {
    this.previewMode = false;
    // Preview config cleanup to be implemented
    
    // 恢复到正常配置
    if (this.activeConfiguration) {
      this.applyConfiguration(this.activeConfiguration.id);
    }
    
    console.log('👁️ 预览模式已停止');
    this.emit('preview:stopped');
  }

  /**
   * 实时预览配置更改
   */
  previewConfiguration(config: Partial<CustomizationConfiguration>): void {
    if (!this.previewMode) {
      console.warn('预览模式未启动');
      return;
    }

    // 临时应用配置
    if (config.theme) {
      this.applyTheme(config.theme, true);
    }
    if (config.layout) {
      this.applyLayout(config.layout, true);
    }
    if (config.features) {
      this.applyFeatures(config.features, true);
    }

    this.emit('preview:updated', config);
  }

  /**
   * 导出定制化配置
   */
  exportConfiguration(configId: string): string {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`定制化配置未找到: ${configId}`);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * 导入定制化配置
   */
  importConfiguration(configData: string): CustomizationConfiguration {
    try {
      const config = JSON.parse(configData) as CustomizationConfiguration;
      
      // 生成新ID避免冲突
      config.id = this.generateConfigId();
      config.createdAt = new Date().toISOString();
      config.updatedAt = new Date().toISOString();
      
      return this.createConfiguration(config);
    } catch (error) {
      throw new Error(`导入配置失败: ${error}`);
    }
  }

  /**
   * 获取CSS变量
   */
  getCSSVariables(): Record<string, string> {
    return Object.fromEntries(this.cssVariables);
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfiguration | undefined {
    return this.activeConfiguration?.theme;
  }

  /**
   * 验证配置有效性
   */
  validateConfiguration(config: CustomizationConfiguration): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证必填字段
    if (!config.name) errors.push('配置名称不能为空');
    if (!config.enterprise.id) errors.push('企业ID不能为空');
    
    // 验证主题配置
    if (!config.theme.name) errors.push('主题名称不能为空');
    if (!config.theme.brandAssets.primaryLogo.light) {
      warnings.push('建议设置明亮模式Logo');
    }
    
    // 验证颜色格式
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(config.theme.brandAssets.colors.primary)) {
      errors.push('主色调格式无效');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 销毁定制化引擎
   */
  destroy(): void {
    // 清理样式
    if (this.styleElement) {
      this.styleElement.remove();
    }
    
    // 清理数据
    this.configurations.clear();
    this.themeCache.clear();
    this.cssVariables.clear();
    this.eventListeners.clear();
    
    this.activeConfiguration = undefined;
    // Preview config cleanup to be implemented
    
    console.log('🗑️ 企业定制化引擎已销毁');
  }

  // ========== 事件系统 ==========

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

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
   * 初始化引擎
   */
  private initializeEngine(): void {
    // 创建样式元素
    if (typeof document !== 'undefined') {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'smartabp-customization-styles';
      document.head.appendChild(this.styleElement);
    }

    // 创建默认配置
    this.createDefaultConfiguration();
    
    console.log('🚀 企业定制化引擎初始化完成');
  }

  /**
   * 应用主题
   */
  private async applyTheme(theme: ThemeConfiguration, preview = false): Promise<void> {
    console.log(`🎨 应用主题: ${theme.name} (${theme.mode})`);

    // 应用CSS变量
    this.applyCSSVariables(theme);
    
    // 应用品牌资产
    this.applyBrandAssets(theme.brandAssets);
    
    // 应用组件样式覆盖
    this.applyComponentOverrides(theme.componentOverrides);
    
    // 应用暗色模式
    if (theme.darkMode?.enabled) {
      this.applyDarkMode(theme.darkMode);
    }

    if (!preview) {
      // 缓存主题
      this.themeCache.set(theme.name, theme);
    }
  }

  /**
   * 应用布局
   */
  private async applyLayout(layout: LayoutConfiguration, _preview = false): Promise<void> {
    console.log(`📐 应用布局: ${layout.mode}`);

    // 生成布局CSS
    const layoutCSS = this.generateLayoutCSS(layout);
    this.injectCSS(layoutCSS, 'layout');
    
    // 设置响应式断点
    this.applyResponsiveBreakpoints(layout.breakpoints);
  }

  /**
   * 应用功能配置
   */
  private async applyFeatures(features: FeatureConfiguration, _preview = false): Promise<void> {
    console.log('⚙️ 应用功能配置');

    // 设置全局功能开关
    if (typeof window !== 'undefined') {
      (window as any).SmartAbpFeatures = features;
    }

    // 发送功能配置更新事件
    this.emit('features:updated', features);
  }

  /**
   * 应用CSS变量
   */
  private applyCSSVariables(theme: ThemeConfiguration): void {
    const variables = new Map<string, string>();
    
    // 品牌颜色
    Object.entries(theme.brandAssets.colors).forEach(([key, value]) => {
      variables.set(`--color-${key}`, value);
    });
    
    // 字体
    variables.set('--font-primary', theme.brandAssets.typography.primaryFont);
    variables.set('--font-secondary', theme.brandAssets.typography.secondaryFont);
    variables.set('--font-code', theme.brandAssets.typography.codeFont);
    
    // 字体大小
    Object.entries(theme.brandAssets.typography.fontSizes).forEach(([key, value]) => {
      variables.set(`--font-size-${key}`, value);
    });
    
    // 应用到DOM
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      variables.forEach((value, key) => {
        root.style.setProperty(key, value);
        this.cssVariables.set(key, value);
      });
    }
  }

  /**
   * 应用品牌资产
   */
  private applyBrandAssets(assets: BrandAssets): void {
    // 更新Favicon
    if (typeof document !== 'undefined' && assets.primaryLogo.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = assets.primaryLogo.favicon;
    }

    // 发送品牌资产更新事件
    this.emit('brand:assets-updated', assets);
  }

  /**
   * 应用组件样式覆盖
   */
  private applyComponentOverrides(overrides: Record<string, any>): void {
    const css = this.generateComponentOverrideCSS(overrides);
    this.injectCSS(css, 'component-overrides');
  }

  /**
   * 应用暗色模式
   */
  private applyDarkMode(darkMode: NonNullable<ThemeConfiguration['darkMode']>): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    
    if (darkMode.enabled) {
      html.classList.add('dark-mode');
      
      // 自动切换
      if (darkMode.autoSwitch && darkMode.schedule) {
        this.setupAutoThemeSwitch(darkMode.schedule);
      }
    } else {
      html.classList.remove('dark-mode');
    }
  }

  /**
   * 设置自动主题切换
   */
  private setupAutoThemeSwitch(schedule: { start: string; end: string }): void {
    const checkTime = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMin] = schedule.start.split(':').map(Number);
      const [endHour, endMin] = schedule.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      const shouldBeDark = currentTime >= startTime || currentTime < endTime;
      
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        html.classList.toggle('auto-dark-mode', shouldBeDark);
      }
    };

    // 立即检查
    checkTime();
    
    // 每分钟检查一次
    setInterval(checkTime, 60000);
  }

  /**
   * 应用响应式断点
   */
  private applyResponsiveBreakpoints(breakpoints: LayoutConfiguration['breakpoints']): void {
    const css = `
      :root {
        --breakpoint-xs: ${breakpoints.xs}px;
        --breakpoint-sm: ${breakpoints.sm}px;
        --breakpoint-md: ${breakpoints.md}px;
        --breakpoint-lg: ${breakpoints.lg}px;
        --breakpoint-xl: ${breakpoints.xl}px;
        --breakpoint-xxl: ${breakpoints.xxl}px;
      }
    `;
    
    this.injectCSS(css, 'breakpoints');
  }

  /**
   * 生成布局CSS
   */
  private generateLayoutCSS(layout: LayoutConfiguration): string {
    return `
      /* 头部样式 */
      .smartabp-header {
        height: ${layout.header.height}px;
        position: ${layout.header.fixed ? 'fixed' : 'relative'};
        background-color: ${layout.header.transparent ? 'transparent' : 'var(--color-primary)'};
        z-index: 1000;
      }
      
      /* 侧边栏样式 */
      .smartabp-sidebar {
        width: ${layout.sidebar.collapsed ? '64px' : layout.sidebar.width + 'px'};
        position: fixed;
        ${layout.sidebar.position}: 0;
        top: ${layout.header.fixed ? layout.header.height : 0}px;
        transition: width 0.3s ease;
      }
      
      /* 内容区域样式 */
      .smartabp-content {
        margin-left: ${layout.sidebar.position === 'left' ? (layout.sidebar.collapsed ? 64 : layout.sidebar.width) : 0}px;
        margin-right: ${layout.sidebar.position === 'right' ? (layout.sidebar.collapsed ? 64 : layout.sidebar.width) : 0}px;
        margin-top: ${layout.header.fixed ? layout.header.height : 0}px;
        padding: ${layout.content.padding}px;
        max-width: ${layout.content.maxWidth > 0 ? layout.content.maxWidth + 'px' : '100%'};
        border-radius: ${layout.content.borderRadius}px;
      }
      
      /* 底部样式 */
      .smartabp-footer {
        height: ${layout.footer.height}px;
        position: ${layout.footer.fixed ? 'fixed' : 'relative'};
        bottom: 0;
        width: 100%;
      }
    `;
  }

  /**
   * 生成组件覆盖CSS
   */
  private generateComponentOverrideCSS(overrides: Record<string, any>): string {
    let css = '';
    
    Object.entries(overrides).forEach(([component, styles]) => {
      css += `.smartabp-${component} {\n`;
      Object.entries(styles as Record<string, string>).forEach(([property, value]) => {
        css += `  ${property}: ${value};\n`;
      });
      css += '}\n\n';
    });
    
    return css;
  }

  /**
   * 注入CSS
   */
  private injectCSS(css: string, id: string): void {
    if (!this.styleElement) return;
    
    // 移除旧的同ID样式
    const existingStyle = this.styleElement.sheet;
    if (existingStyle) {
      // 简化实现，直接追加
      this.styleElement.textContent += `\n/* ${id} */\n${css}\n`;
    }
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfiguration(): void {
    const defaultConfig = this.createConfiguration({
      name: '默认配置',
      description: 'SmartAbp默认企业定制配置',
      scope: 'global'
    });
    
    // 应用默认配置
    this.applyConfiguration(defaultConfig.id);
  }

  /**
   * 应用默认配置
   */
  private applyDefaultConfiguration(): void {
    const defaultConfig = Array.from(this.configurations.values())
      .find(config => config.name === '默认配置');
    
    if (defaultConfig) {
      this.applyConfiguration(defaultConfig.id);
    }
  }

  /**
   * 生成配置ID
   */
  private generateConfigId(): string {
    return `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取默认企业信息
   */
  private getDefaultEnterpriseInfo() {
    return {
      id: 'smartabp-default',
      name: 'SmartAbp企业',
      domain: 'smartabp.com',
      industry: 'technology',
      size: 'enterprise' as const
    };
  }

  /**
   * 获取默认主题
   */
  private getDefaultTheme(): ThemeConfiguration {
    return {
      name: '默认主题',
      mode: 'light',
      isDefault: true,
      brandAssets: {
        primaryLogo: {
          light: '/assets/logo-light.svg',
          dark: '/assets/logo-dark.svg',
          favicon: '/favicon.ico'
        },
        secondaryLogos: {
          horizontal: '/assets/logo-horizontal.svg',
          vertical: '/assets/logo-vertical.svg',
          icon: '/assets/logo-icon.svg',
          watermark: '/assets/logo-watermark.svg'
        },
        colors: {
          primary: '#1890ff',
          secondary: '#722ed1',
          accent: '#13c2c2',
          success: '#52c41a',
          warning: '#faad14',
          error: '#ff4d4f',
          info: '#1890ff',
          neutral: '#8c8c8c'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          secondary: 'linear-gradient(135deg, #722ed1 0%, #13c2c2 100%)',
          background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)'
        },
        typography: {
          primaryFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          secondaryFont: 'Georgia, "Times New Roman", serif',
          codeFont: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
          fontSizes: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '20px',
            '2xl': '24px',
            '3xl': '30px',
            '4xl': '36px'
          },
          fontWeights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeights: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75
          }
        }
      },
      componentOverrides: {},
      cssVariables: {},
      darkMode: {
        enabled: true,
        autoSwitch: false
      }
    };
  }

  /**
   * 获取默认布局
   */
  private getDefaultLayout(): LayoutConfiguration {
    return {
      mode: 'responsive',
      header: {
        height: 64,
        fixed: true,
        transparent: false,
        showLogo: true,
        showSearch: true,
        showUserMenu: true
      },
      sidebar: {
        width: 256,
        collapsible: true,
        collapsed: false,
        position: 'left',
        showIcons: true,
        showLabels: true
      },
      footer: {
        height: 48,
        fixed: false,
        showCopyright: true,
        showLinks: true
      },
      content: {
        maxWidth: 1200,
        padding: 24,
        margin: 16,
        borderRadius: 8
      },
      breakpoints: {
        xs: 480,
        sm: 768,
        md: 1024,
        lg: 1280,
        xl: 1536,
        xxl: 1920
      }
    };
  }

  /**
   * 获取默认功能
   */
  private getDefaultFeatures(): FeatureConfiguration {
    return {
      modules: {
        dashboard: true,
        userManagement: true,
        roleManagement: true,
        systemSettings: true,
        auditLogs: true,
        notifications: true,
        fileManager: true,
        reportCenter: true
      },
      features: {
        multiLanguage: true,
        multiTenant: true,
        realTimeNotifications: true,
        advancedSearch: true,
        dataExport: true,
        bulkOperations: true,
        workflowEngine: false,
        apiIntegration: true
      },
      permissions: {
        canCustomizeTheme: true,
        canModifyLayout: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canExportData: true,
        canIntegrateApi: true
      }
    };
  }
}

/**
 * 工厂函数：创建企业定制化引擎
 */
export function createEnterpriseCustomizationEngine(): EnterpriseCustomizationEngine {
  return new EnterpriseCustomizationEngine();
}

/**
 * 全局企业定制化引擎实例
 */
let globalCustomizationEngine: EnterpriseCustomizationEngine | null = null;

/**
 * 获取全局企业定制化引擎
 */
export function getGlobalCustomizationEngine(): EnterpriseCustomizationEngine {
  if (!globalCustomizationEngine) {
    globalCustomizationEngine = new EnterpriseCustomizationEngine();
  }
  return globalCustomizationEngine;
}
