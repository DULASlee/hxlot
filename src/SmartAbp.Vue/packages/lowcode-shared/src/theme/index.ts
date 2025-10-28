/**
 * 🎨 Theme System Module Entry
 *
 * 主题管理系统入口
 *
 * @module @smartabp/lowcode-shared/theme
 */

export { ThemeManager, useTheme } from './ThemeManager'

export {
  // Types
  type ThemeMode,
  type DesignTokens,
  type ThemeConfig,
  // Tokens (必须导出，供主项目使用)
  lightTokens,
  darkTokens,
  presetThemes,
  applyTokensToCSS
} from './tokens'
