/**
 * TypeScript设计令牌系统
 * Design Tokens System
 */

/**
 * 颜色令牌
 */
export interface ColorTokens {
  // 主色
  primary: string
  primaryHover: string
  primaryActive: string
  primaryDisabled: string

  // 成功色
  success: string
  successHover: string
  successActive: string

  // 警告色
  warning: string
  warningHover: string
  warningActive: string

  // 危险色
  danger: string
  dangerHover: string
  dangerActive: string

  // 信息色
  info: string
  infoHover: string
  infoActive: string

  // 文本色
  textPrimary: string
  textSecondary: string
  textPlaceholder: string
  textDisabled: string

  // 背景色
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgOverlay: string

  // 边框色
  borderPrimary: string
  borderSecondary: string
  borderActive: string

  // 特殊色
  link: string
  linkHover: string
  error: string
  white: string
  black: string
}

/**
 * 间距令牌
 */
export interface SpacingTokens {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

/**
 * 字体令牌
 */
export interface TypographyTokens {
  // 字体家族
  fontFamily: {
    base: string
    mono: string
  }

  // 字体大小
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }

  // 字重
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
  }

  // 行高
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

/**
 * 圆角令牌
 */
export interface BorderRadiusTokens {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  full: string
}

/**
 * 阴影令牌
 */
export interface ShadowTokens {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

/**
 * 过渡动画令牌
 */
export interface TransitionTokens {
  duration: {
    fast: string
    base: string
    slow: string
  }
  timing: {
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

/**
 * Z轴层级令牌
 */
export interface ZIndexTokens {
  dropdown: number
  sticky: number
  fixed: number
  modalBackdrop: number
  modal: number
  popover: number
  tooltip: number
}

/**
 * 完整的设计令牌
 */
export interface DesignTokens {
  colors: ColorTokens
  spacing: SpacingTokens
  typography: TypographyTokens
  borderRadius: BorderRadiusTokens
  shadows: ShadowTokens
  transitions: TransitionTokens
  zIndex: ZIndexTokens
}

/**
 * 默认主题令牌（亮色主题）
 */
export const lightTokens: DesignTokens = {
  colors: {
    // 主色
    primary: '#409EFF',
    primaryHover: '#66B1FF',
    primaryActive: '#337ECC',
    primaryDisabled: '#A0CFFF',

    // 成功色
    success: '#67C23A',
    successHover: '#85CE61',
    successActive: '#529B2E',

    // 警告色
    warning: '#E6A23C',
    warningHover: '#EEBC69',
    warningActive: '#B88230',

    // 危险色
    danger: '#F56C6C',
    dangerHover: '#F89898',
    dangerActive: '#C45656',

    // 信息色
    info: '#909399',
    infoHover: '#A6A9AD',
    infoActive: '#737577',

    // 文本色
    textPrimary: '#303133',
    textSecondary: '#606266',
    textPlaceholder: '#A8ABB2',
    textDisabled: '#C0C4CC',

    // 背景色
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F5F7FA',
    bgTertiary: '#EBEEF5',
    bgOverlay: 'rgba(0, 0, 0, 0.5)',

    // 边框色
    borderPrimary: '#DCDFE6',
    borderSecondary: '#E4E7ED',
    borderActive: '#409EFF',

    // 特殊色
    link: '#409EFF',
    linkHover: '#66B1FF',
    error: '#F56C6C',
    white: '#FFFFFF',
    black: '#000000'
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },

  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Menlo, Monaco, Consolas, "Courier New", monospace'
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },

  transitions: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms'
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
}

/**
 * 暗色主题令牌
 */
export const darkTokens: DesignTokens = {
  ...lightTokens,
  colors: {
    ...lightTokens.colors,
    
    // 文本色（暗色主题）
    textPrimary: '#E5EAF3',
    textSecondary: '#CFD3DC',
    textPlaceholder: '#A3A6AD',
    textDisabled: '#6C6E72',

    // 背景色（暗色主题）
    bgPrimary: '#1A1A1A',
    bgSecondary: '#2C2C2C',
    bgTertiary: '#3A3A3A',
    bgOverlay: 'rgba(0, 0, 0, 0.7)',

    // 边框色（暗色主题）
    borderPrimary: '#4C4D4F',
    borderSecondary: '#3A3A3C',
    borderActive: '#409EFF'
  }
}

/**
 * 主题类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 主题配置
 */
export interface ThemeConfig {
  mode: ThemeMode
  tokens: DesignTokens
}

/**
 * 预设主题
 */
export const presetThemes: Record<'light' | 'dark', ThemeConfig> = {
  light: {
    mode: 'light',
    tokens: lightTokens
  },
  dark: {
    mode: 'dark',
    tokens: darkTokens
  }
}
