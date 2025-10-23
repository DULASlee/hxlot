/**
 * 🎨 色彩设计令牌系统
 * 
 * 基于Ant Design色彩体系
 * 支持暗黑模式
 * 100%类型安全
 */

/**
 * 品牌主色调（基于#1890FF）
 */
export const primaryColors = {
  50: '#E6F4FF',
  100: '#BAE0FF',
  200: '#91CAFF',
  300: '#69B1FF',
  400: '#4096FF',
  500: '#1890FF', // 主色
  600: '#0958D9',
  700: '#003EB3',
  800: '#002C8C',
  900: '#001D66',
} as const

/**
 * 功能色
 */
export const functionalColors = {
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
  info: '#1890FF',
} as const

/**
 * 中性色（支持暗黑模式）
 */
export const grayColors = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E8E8E8',
  300: '#D9D9D9',
  400: '#BFBFBF',
  500: '#8C8C8C',
  600: '#595959',
  700: '#434343',
  800: '#262626',
  900: '#141414',
} as const

/**
 * 语义化颜色（亮色模式）
 */
export const semanticColorsLight = {
  bg: {
    primary: grayColors[50],
    secondary: grayColors[100],
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.45)',
  },
  
  border: {
    base: grayColors[300],
    light: grayColors[200],
    hover: primaryColors[400],
    focus: primaryColors[500],
  },
  
  text: {
    primary: grayColors[900],
    secondary: grayColors[600],
    tertiary: grayColors[500],
    disabled: grayColors[400],
    inverse: '#FFFFFF',
  },
  
  shadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.18)',
  },
} as const

/**
 * 语义化颜色（暗色模式）
 */
export const semanticColorsDark = {
  bg: {
    primary: grayColors[900],
    secondary: grayColors[800],
    elevated: grayColors[800],
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
  
  border: {
    base: grayColors[700],
    light: grayColors[800],
    hover: primaryColors[400],
    focus: primaryColors[500],
  },
  
  text: {
    primary: grayColors[50],
    secondary: grayColors[400],
    tertiary: grayColors[500],
    disabled: grayColors[600],
    inverse: grayColors[900],
  },
  
  shadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.24)',
    md: '0 4px 8px rgba(0, 0, 0, 0.32)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.40)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.48)',
  },
} as const

/**
 * 生成CSS变量
 */
export function generateColorVariables(theme: 'light' | 'dark' = 'light'): string {
  const semanticColors = theme === 'light' ? semanticColorsLight : semanticColorsDark
  
  return `
    /* 品牌主色 */
    --color-primary-50: ${primaryColors[50]};
    --color-primary-100: ${primaryColors[100]};
    --color-primary-200: ${primaryColors[200]};
    --color-primary-300: ${primaryColors[300]};
    --color-primary-400: ${primaryColors[400]};
    --color-primary-500: ${primaryColors[500]};
    --color-primary-600: ${primaryColors[600]};
    --color-primary-700: ${primaryColors[700]};
    --color-primary-800: ${primaryColors[800]};
    --color-primary-900: ${primaryColors[900]};
    
    /* 功能色 */
    --color-success: ${functionalColors.success};
    --color-warning: ${functionalColors.warning};
    --color-error: ${functionalColors.error};
    --color-info: ${functionalColors.info};
    
    /* 中性色 */
    --color-gray-50: ${grayColors[50]};
    --color-gray-100: ${grayColors[100]};
    --color-gray-200: ${grayColors[200]};
    --color-gray-300: ${grayColors[300]};
    --color-gray-400: ${grayColors[400]};
    --color-gray-500: ${grayColors[500]};
    --color-gray-600: ${grayColors[600]};
    --color-gray-700: ${grayColors[700]};
    --color-gray-800: ${grayColors[800]};
    --color-gray-900: ${grayColors[900]};
    
    /* 背景色 */
    --color-bg-primary: ${semanticColors.bg.primary};
    --color-bg-secondary: ${semanticColors.bg.secondary};
    --color-bg-elevated: ${semanticColors.bg.elevated};
    --color-bg-overlay: ${semanticColors.bg.overlay};
    
    /* 边框色 */
    --color-border-base: ${semanticColors.border.base};
    --color-border-light: ${semanticColors.border.light};
    --color-border-hover: ${semanticColors.border.hover};
    --color-border-focus: ${semanticColors.border.focus};
    
    /* 文字颜色 */
    --color-text-primary: ${semanticColors.text.primary};
    --color-text-secondary: ${semanticColors.text.secondary};
    --color-text-tertiary: ${semanticColors.text.tertiary};
    --color-text-disabled: ${semanticColors.text.disabled};
    --color-text-inverse: ${semanticColors.text.inverse};
    
    /* 阴影 */
    --shadow-sm: ${semanticColors.shadow.sm};
    --shadow-md: ${semanticColors.shadow.md};
    --shadow-lg: ${semanticColors.shadow.lg};
    --shadow-xl: ${semanticColors.shadow.xl};
  `.trim()
}

/**
 * 导出所有颜色令牌
 */
export const colorTokens = {
  primary: primaryColors,
  functional: functionalColors,
  gray: grayColors,
  light: semanticColorsLight,
  dark: semanticColorsDark,
} as const

export type ColorTokens = typeof colorTokens

