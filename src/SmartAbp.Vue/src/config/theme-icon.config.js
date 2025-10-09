/**
 * 🎨 SmartAbp 主题图标配置中心
 *
 * 配置驱动设计原则：
 * - 所有主题、图标、存储键名从此配置文件读取
 * - 遵循开闭原则：扩展主题只需修改此配置，业务代码零改动
 * - 严禁硬编码：消除所有魔法字符串和硬编码值
 *
 * @author SmartAbp Team
 * @date 2025-10-01
 */
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 存储键名配置（严禁硬编码）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * LocalStorage 存储键名配置
 * 统一管理所有存储键名，避免硬编码和键名冲突
 */
export const STORAGE_KEYS = {
    /** 主题存储键 */
    THEME: 'app-theme',
    /** 主题备份键（用于错误恢复） */
    THEME_BACKUP: 'app-theme-backup',
    /** 图标风格存储键 */
    ICON_STYLE: 'smartabp-icon-style',
    /** 图标风格备份键（用于错误恢复） */
    ICON_STYLE_BACKUP: 'smartabp-icon-style-backup'
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 默认值配置
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 系统默认值配置
 * 当无法从存储恢复或发生错误时使用的默认值
 */
export const DEFAULT_VALUES = {
    /** 默认主题：科技蓝 */
    THEME: 'tech-blue',
    /** 默认图标风格：Element Plus（企业级推荐） */
    ICON_STYLE: 'element-plus'
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 主题-图标风格绑定配置（配置驱动核心）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 主题与图标风格的绑定关系配置
 *
 * 遵循开闭原则：
 * - 对扩展开放：新增主题只需在此添加配置项
 * - 对修改关闭：业务代码无需修改即可支持新主题
 *
 * 使用示例：
 * ```typescript
 * // 添加新主题 'business-red' 使用 'antd' 图标
 * 'business-red': 'antd'
 * ```
 */
export const THEME_ICON_BINDING = {
    /** 科技蓝主题 → Element Plus 图标 */
    'tech-blue': 'element-plus',
    /** 深绿色主题 → Element Plus 图标 */
    'deep-green': 'element-plus',
    /** 浅紫色主题 → Element Plus 图标 */
    'light-purple': 'element-plus',
    /** 暗黑模式 → Element Plus 图标 */
    'dark': 'element-plus'
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛠️ 配置访问函数（开闭原则）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 获取主题对应的图标风格
 *
 * 开闭原则：业务代码调用此函数而非直接访问配置对象
 * 这样可以在不修改业务代码的情况下扩展功能（如添加日志、验证等）
 *
 * @param theme 主题类型
 * @returns 对应的图标风格类型
 *
 * @example
 * ```typescript
 * const iconStyle = getIconStyleForTheme('tech-blue') // 'element-plus'
 * ```
 */
export function getIconStyleForTheme(theme) {
    return THEME_ICON_BINDING[theme] || DEFAULT_VALUES.ICON_STYLE;
}
/**
 * 验证主题类型是否有效
 *
 * @param theme 待验证的主题字符串
 * @returns 是否为有效的主题类型
 *
 * @example
 * ```typescript
 * isValidTheme('tech-blue') // true
 * isValidTheme('unknown') // false
 * ```
 */
export function isValidTheme(theme) {
    return theme in THEME_ICON_BINDING;
}
/**
 * 验证图标风格是否已配置
 *
 * @param style 待验证的图标风格字符串
 * @returns 是否为已配置的图标风格
 *
 * @example
 * ```typescript
 * isValidIconStyle('element-plus') // true
 * isValidIconStyle('unknown') // false
 * ```
 */
export function isValidIconStyle(style) {
    return Object.values(THEME_ICON_BINDING).includes(style);
}
/**
 * 获取所有可用的主题列表
 *
 * @returns 主题类型数组
 */
export function getAvailableThemes() {
    return Object.keys(THEME_ICON_BINDING);
}
/**
 * 获取所有已使用的图标风格列表
 *
 * @returns 图标风格类型数组（去重）
 */
export function getUsedIconStyles() {
    return Array.from(new Set(Object.values(THEME_ICON_BINDING)));
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 配置统计信息（用于调试和监控）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 获取配置统计信息
 * 用于开发调试和系统监控
 */
export function getConfigStats() {
    return {
        totalThemes: Object.keys(THEME_ICON_BINDING).length,
        totalIconStyles: getUsedIconStyles().length,
        defaultTheme: DEFAULT_VALUES.THEME,
        defaultIconStyle: DEFAULT_VALUES.ICON_STYLE,
        storageKeys: Object.keys(STORAGE_KEYS).length
    };
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 开发辅助（仅在开发环境输出）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (import.meta.env.DEV) {
    console.log('🎨 主题图标配置已加载:', getConfigStats());
}
