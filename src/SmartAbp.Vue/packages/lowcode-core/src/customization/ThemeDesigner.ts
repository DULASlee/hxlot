/**
 * 🎨 主题设计器
 * SmartAbp低代码引擎 - 第二专题可视化主题编辑器
 * 
 * 核心功能:
 * - 可视化主题编辑和实时预览
 * - 颜色选择器和调色板管理
 * - 字体系统和排版设计
 * - 响应式布局设计器
 * - 主题导入导出和版本管理
 */

import { ThemeConfiguration, LayoutConfiguration } from './EnterpriseCustomizationEngine';

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';
export type DesignMode = 'visual' | 'code' | 'preview';

/**
 * 颜色配置
 */
export interface ColorConfiguration {
  /** 颜色值 */
  value: string;
  /** 颜色格式 */
  format: ColorFormat;
  /** 颜色名称 */
  name: string;
  /** 颜色描述 */
  description: string;
  /** 是否为主色调 */
  isPrimary: boolean;
  /** 颜色变体 */
  variants: {
    light: string;
    dark: string;
    muted: string;
  };
}

/**
 * 字体配置
 */
export interface FontConfiguration {
  /** 字体族 */
  family: string;
  /** 字体名称 */
  name: string;
  /** 字体来源 */
  source: 'system' | 'google' | 'custom';
  /** 字体URL */
  url?: string;
  /** 字体权重 */
  weights: number[];
  /** 字体样式 */
  styles: ('normal' | 'italic')[];
  /** 字符集 */
  subsets: string[];
}

/**
 * 设计历史记录
 */
export interface DesignHistory {
  /** 历史ID */
  id: string;
  /** 操作类型 */
  action: 'color-change' | 'font-change' | 'layout-change' | 'import' | 'reset';
  /** 操作描述 */
  description: string;
  /** 操作时间 */
  timestamp: number;
  /** 操作前状态 */
  before: any;
  /** 操作后状态 */
  after: any;
}

/**
 * 调色板
 */
export interface ColorPalette {
  /** 调色板名称 */
  name: string;
  /** 调色板描述 */
  description: string;
  /** 调色板颜色 */
  colors: ColorConfiguration[];
  /** 是否为系统调色板 */
  isSystem: boolean;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 🎨 主题设计器
 */
export class ThemeDesigner {
  private currentTheme: ThemeConfiguration;
  private designHistory: DesignHistory[] = [];
  private colorPalettes = new Map<string, ColorPalette>();
  private fontLibrary = new Map<string, FontConfiguration>();
  private designMode: DesignMode = 'visual';
  private previewElement?: HTMLElement;
  private eventListeners = new Map<string, Set<Function>>();

  // 设计器配置
  private maxHistorySize = 50;
  // Auto-save functionality to be implemented in future versions
  private realTimePreview = true;

  constructor(initialTheme?: ThemeConfiguration) {
    this.currentTheme = initialTheme || this.createDefaultTheme();
    this.initializeDesigner();
  }

  /**
   * 设置颜色
   */
  setColor(colorKey: string, color: ColorConfiguration): void {
    const oldValue = this.currentTheme.brandAssets.colors[colorKey as keyof typeof this.currentTheme.brandAssets.colors];
    
    // 更新主题颜色
    (this.currentTheme.brandAssets.colors as any)[colorKey] = color.value;
    
    // 记录历史
    this.recordHistory({
      action: 'color-change',
      description: `修改颜色 ${colorKey}: ${oldValue} → ${color.value}`,
      before: { [colorKey]: oldValue },
      after: { [colorKey]: color.value }
    });

    // 实时预览
    if (this.realTimePreview) {
      this.applyColorPreview(colorKey, color);
    }

    console.log(`🎨 设置颜色: ${colorKey} = ${color.value}`);
    this.emit('color:changed', { key: colorKey, color, oldValue });
  }

  /**
   * 生成颜色变体
   */
  generateColorVariants(baseColor: string): ColorConfiguration['variants'] {
    const color = this.parseColor(baseColor);
    
    return {
      light: this.lightenColor(color, 0.2),
      dark: this.darkenColor(color, 0.2),
      muted: this.desaturateColor(color, 0.3)
    };
  }

  /**
   * 创建调色板
   */
  createColorPalette(name: string, colors: ColorConfiguration[]): ColorPalette {
    const palette: ColorPalette = {
      name,
      description: `自定义调色板 - ${name}`,
      colors,
      isSystem: false,
      createdAt: new Date().toISOString()
    };

    this.colorPalettes.set(name, palette);
    console.log(`🎨 创建调色板: ${name} (${colors.length} 种颜色)`);
    
    this.emit('palette:created', palette);
    return palette;
  }

  /**
   * 应用调色板
   */
  applyColorPalette(paletteName: string): void {
    const palette = this.colorPalettes.get(paletteName);
    if (!palette) {
      throw new Error(`调色板未找到: ${paletteName}`);
    }

    const oldColors = { ...this.currentTheme.brandAssets.colors };

    // 应用调色板颜色
    palette.colors.forEach((color, index) => {
      const colorKeys = Object.keys(this.currentTheme.brandAssets.colors);
      if (index < colorKeys.length) {
        (this.currentTheme.brandAssets.colors as any)[colorKeys[index]] = color.value;
      }
    });

    // 记录历史
    this.recordHistory({
      action: 'color-change',
      description: `应用调色板: ${paletteName}`,
      before: oldColors,
      after: { ...this.currentTheme.brandAssets.colors }
    });

    console.log(`🎨 应用调色板: ${paletteName}`);
    this.emit('palette:applied', { palette, oldColors });
  }

  /**
   * 设置字体
   */
  setFont(fontType: 'primary' | 'secondary' | 'code', font: FontConfiguration): void {
    const fontKey = `${fontType}Font` as keyof typeof this.currentTheme.brandAssets.typography;
    const oldValue = this.currentTheme.brandAssets.typography[fontKey];

    // 加载字体（如果需要）
    if (font.source === 'google' || font.source === 'custom') {
      this.loadFont(font);
    }

    // 更新主题字体
    (this.currentTheme.brandAssets.typography as any)[fontKey] = font.family;

    // 记录历史
    this.recordHistory({
      action: 'font-change',
      description: `修改${fontType}字体: ${oldValue} → ${font.family}`,
      before: { [fontKey]: oldValue },
      after: { [fontKey]: font.family }
    });

    // 实时预览
    if (this.realTimePreview) {
      this.applyFontPreview(fontType, font);
    }

    console.log(`🔤 设置字体: ${fontType} = ${font.family}`);
    this.emit('font:changed', { type: fontType, font, oldValue });
  }

  /**
   * 更新布局配置
   */
  updateLayout(layoutUpdates: Partial<LayoutConfiguration>): void {
    const oldLayout = { ...this.currentTheme };

    // 更新布局配置（注意：这里需要扩展ThemeConfiguration包含layout）
    // 简化实现，实际需要在ThemeConfiguration中添加layout字段
    Object.assign(this.currentTheme, layoutUpdates);

    // 记录历史
    this.recordHistory({
      action: 'layout-change',
      description: '更新布局配置',
      before: oldLayout,
      after: { ...this.currentTheme }
    });

    // 实时预览
    if (this.realTimePreview) {
      this.applyLayoutPreview(layoutUpdates);
    }

    console.log('📐 更新布局配置');
    this.emit('layout:changed', { updates: layoutUpdates, oldLayout });
  }

  /**
   * 切换设计模式
   */
  setDesignMode(mode: DesignMode): void {
    const oldMode = this.designMode;
    this.designMode = mode;

    console.log(`🎛️ 切换设计模式: ${oldMode} → ${mode}`);
    this.emit('mode:changed', { mode, oldMode });
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (this.designHistory.length === 0) {
      console.warn('没有可撤销的操作');
      return false;
    }

    const lastAction = this.designHistory.pop()!;
    
    // 恢复到之前的状态
    this.applyHistoryState(lastAction.before);

    console.log(`↶ 撤销操作: ${lastAction.description}`);
    this.emit('history:undo', lastAction);
    return true;
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    // 简化实现，实际需要维护redo栈
    console.warn('重做功能暂未实现');
    return false;
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.designHistory = [];
    console.log('🗑️ 清除设计历史记录');
    this.emit('history:cleared');
  }

  /**
   * 重置主题为默认
   */
  resetToDefault(): void {
    const oldTheme = { ...this.currentTheme };
    this.currentTheme = this.createDefaultTheme();

    // 记录历史
    this.recordHistory({
      action: 'reset',
      description: '重置为默认主题',
      before: oldTheme,
      after: { ...this.currentTheme }
    });

    console.log('🔄 重置为默认主题');
    this.emit('theme:reset', { oldTheme, newTheme: this.currentTheme });
  }

  /**
   * 导入主题
   */
  importTheme(themeData: string | ThemeConfiguration): void {
    let theme: ThemeConfiguration;
    
    if (typeof themeData === 'string') {
      try {
        theme = JSON.parse(themeData);
      } catch (error) {
        throw new Error(`主题数据格式错误: ${error}`);
      }
    } else {
      theme = themeData;
    }

    const oldTheme = { ...this.currentTheme };
    this.currentTheme = theme;

    // 记录历史
    this.recordHistory({
      action: 'import',
      description: `导入主题: ${theme.name}`,
      before: oldTheme,
      after: { ...this.currentTheme }
    });

    console.log(`📥 导入主题: ${theme.name}`);
    this.emit('theme:imported', { theme, oldTheme });
  }

  /**
   * 导出主题
   */
  exportTheme(): string {
    return JSON.stringify(this.currentTheme, null, 2);
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfiguration {
    return { ...this.currentTheme };
  }

  /**
   * 获取设计历史
   */
  getDesignHistory(): DesignHistory[] {
    return [...this.designHistory];
  }

  /**
   * 获取所有调色板
   */
  getColorPalettes(): ColorPalette[] {
    return Array.from(this.colorPalettes.values());
  }

  /**
   * 获取字体库
   */
  getFontLibrary(): FontConfiguration[] {
    return Array.from(this.fontLibrary.values());
  }

  /**
   * 预览主题
   */
  previewTheme(theme: ThemeConfiguration): void {
    if (!this.previewElement) {
      console.warn('预览元素未设置');
      return;
    }

    // 应用预览样式
    this.applyThemeToElement(this.previewElement, theme);
    
    console.log(`👁️ 预览主题: ${theme.name}`);
    this.emit('theme:previewed', theme);
  }

  /**
   * 设置预览元素
   */
  setPreviewElement(element: HTMLElement): void {
    this.previewElement = element;
    console.log('👁️ 设置预览元素');
  }

  /**
   * 销毁设计器
   */
  destroy(): void {
    this.designHistory = [];
    this.colorPalettes.clear();
    this.fontLibrary.clear();
    this.eventListeners.clear();
    this.previewElement = undefined;
    
    console.log('🗑️ 主题设计器已销毁');
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
   * 初始化设计器
   */
  private initializeDesigner(): void {
    // 初始化系统调色板
    this.initializeSystemPalettes();
    
    // 初始化字体库
    this.initializeFontLibrary();
    
    console.log('🚀 主题设计器初始化完成');
  }

  /**
   * 记录历史
   */
  private recordHistory(historyItem: Omit<DesignHistory, 'id' | 'timestamp'>): void {
    const history: DesignHistory = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...historyItem
    };

    this.designHistory.push(history);

    // 限制历史记录数量
    if (this.designHistory.length > this.maxHistorySize) {
      this.designHistory.shift();
    }
  }

  /**
   * 应用历史状态
   */
  private applyHistoryState(state: any): void {
    // 根据状态类型应用不同的恢复逻辑
    if (state.colors) {
      Object.assign(this.currentTheme.brandAssets.colors, state.colors);
    }
    if (state.typography) {
      Object.assign(this.currentTheme.brandAssets.typography, state.typography);
    }
    // 可以继续扩展其他状态的恢复逻辑
  }

  /**
   * 应用颜色预览
   */
  private applyColorPreview(colorKey: string, color: ColorConfiguration): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty(`--color-${colorKey}`, color.value);
    
    // 应用颜色变体
    const variants = this.generateColorVariants(color.value);
    root.style.setProperty(`--color-${colorKey}-light`, variants.light);
    root.style.setProperty(`--color-${colorKey}-dark`, variants.dark);
    root.style.setProperty(`--color-${colorKey}-muted`, variants.muted);
  }

  /**
   * 应用字体预览
   */
  private applyFontPreview(fontType: string, font: FontConfiguration): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty(`--font-${fontType}`, font.family);
  }

  /**
   * 应用布局预览
   */
  private applyLayoutPreview(layoutUpdates: Partial<LayoutConfiguration>): void {
    if (typeof document === 'undefined') return;

    // 简化实现，实际需要根据具体的布局更新应用样式
    console.log('📐 应用布局预览', layoutUpdates);
  }

  /**
   * 加载字体
   */
  private loadFont(font: FontConfiguration): void {
    if (typeof document === 'undefined') return;

    if (font.source === 'google') {
      // 加载Google字体
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/\s+/g, '+')}&display=swap`;
      document.head.appendChild(link);
    } else if (font.source === 'custom' && font.url) {
      // 加载自定义字体
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.url;
      document.head.appendChild(link);
    }
  }

  /**
   * 应用主题到元素
   */
  private applyThemeToElement(element: HTMLElement, theme: ThemeConfiguration): void {
    // 应用颜色
    Object.entries(theme.brandAssets.colors).forEach(([key, value]) => {
      element.style.setProperty(`--color-${key}`, value);
    });

    // 应用字体
    element.style.setProperty('--font-primary', theme.brandAssets.typography.primaryFont);
    element.style.setProperty('--font-secondary', theme.brandAssets.typography.secondaryFont);
    element.style.setProperty('--font-code', theme.brandAssets.typography.codeFont);
  }

  /**
   * 初始化系统调色板
   */
  private initializeSystemPalettes(): void {
    // Material Design调色板
    const materialPalette = this.createColorPalette('Material Design', [
      { value: '#2196F3', format: 'hex', name: 'Blue', description: 'Material Blue', isPrimary: true, variants: this.generateColorVariants('#2196F3') },
      { value: '#4CAF50', format: 'hex', name: 'Green', description: 'Material Green', isPrimary: false, variants: this.generateColorVariants('#4CAF50') },
      { value: '#FF9800', format: 'hex', name: 'Orange', description: 'Material Orange', isPrimary: false, variants: this.generateColorVariants('#FF9800') },
      { value: '#F44336', format: 'hex', name: 'Red', description: 'Material Red', isPrimary: false, variants: this.generateColorVariants('#F44336') }
    ]);
    materialPalette.isSystem = true;

    // Ant Design调色板
    const antPalette = this.createColorPalette('Ant Design', [
      { value: '#1890ff', format: 'hex', name: 'Daybreak Blue', description: 'Ant Design Primary', isPrimary: true, variants: this.generateColorVariants('#1890ff') },
      { value: '#52c41a', format: 'hex', name: 'Polar Green', description: 'Ant Design Success', isPrimary: false, variants: this.generateColorVariants('#52c41a') },
      { value: '#faad14', format: 'hex', name: 'Calendula Gold', description: 'Ant Design Warning', isPrimary: false, variants: this.generateColorVariants('#faad14') },
      { value: '#ff4d4f', format: 'hex', name: 'Dust Red', description: 'Ant Design Error', isPrimary: false, variants: this.generateColorVariants('#ff4d4f') }
    ]);
    antPalette.isSystem = true;
  }

  /**
   * 初始化字体库
   */
  private initializeFontLibrary(): void {
    // 系统字体
    const systemFonts: FontConfiguration[] = [
      {
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        name: 'System Sans',
        source: 'system',
        weights: [300, 400, 500, 600, 700],
        styles: ['normal'],
        subsets: ['latin']
      },
      {
        family: 'Georgia, "Times New Roman", serif',
        name: 'System Serif',
        source: 'system',
        weights: [400, 700],
        styles: ['normal', 'italic'],
        subsets: ['latin']
      },
      {
        family: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
        name: 'System Mono',
        source: 'system',
        weights: [400],
        styles: ['normal'],
        subsets: ['latin']
      }
    ];

    // Google字体
    const googleFonts: FontConfiguration[] = [
      {
        family: 'Inter',
        name: 'Inter',
        source: 'google',
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ['normal'],
        subsets: ['latin', 'latin-ext']
      },
      {
        family: 'Roboto',
        name: 'Roboto',
        source: 'google',
        weights: [100, 300, 400, 500, 700, 900],
        styles: ['normal', 'italic'],
        subsets: ['latin', 'latin-ext']
      },
      {
        family: 'Poppins',
        name: 'Poppins',
        source: 'google',
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ['normal', 'italic'],
        subsets: ['latin', 'latin-ext']
      }
    ];

    // 添加到字体库
    [...systemFonts, ...googleFonts].forEach(font => {
      this.fontLibrary.set(font.name, font);
    });
  }

  /**
   * 创建默认主题
   */
  private createDefaultTheme(): ThemeConfiguration {
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
      cssVariables: {}
    };
  }

  /**
   * 解析颜色
   */
  private parseColor(color: string): { r: number; g: number; b: number; a?: number } {
    // 简化实现，实际需要完整的颜色解析
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return { r, g, b };
    }
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * 加亮颜色
   */
  private lightenColor(color: { r: number; g: number; b: number }, amount: number): string {
    const r = Math.min(255, Math.floor(color.r + (255 - color.r) * amount));
    const g = Math.min(255, Math.floor(color.g + (255 - color.g) * amount));
    const b = Math.min(255, Math.floor(color.b + (255 - color.b) * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 加深颜色
   */
  private darkenColor(color: { r: number; g: number; b: number }, amount: number): string {
    const r = Math.max(0, Math.floor(color.r * (1 - amount)));
    const g = Math.max(0, Math.floor(color.g * (1 - amount)));
    const b = Math.max(0, Math.floor(color.b * (1 - amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 降低饱和度
   */
  private desaturateColor(color: { r: number; g: number; b: number }, amount: number): string {
    const gray = Math.floor(color.r * 0.299 + color.g * 0.587 + color.b * 0.114);
    const r = Math.floor(color.r + (gray - color.r) * amount);
    const g = Math.floor(color.g + (gray - color.g) * amount);
    const b = Math.floor(color.b + (gray - color.b) * amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

/**
 * 工厂函数：创建主题设计器
 */
export function createThemeDesigner(initialTheme?: ThemeConfiguration): ThemeDesigner {
  return new ThemeDesigner(initialTheme);
}
