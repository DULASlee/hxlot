/**
 * 📏 间距设计令牌系统
 * 
 * 基于8px栅格系统
 * 提供一致的间距体系
 */

/**
 * 间距令牌（8px基础栅格）
 */
export const spacingTokens = {
  0: '0',
  1: '4px',   // 0.5x
  2: '8px',   // 1x (基础单位)
  3: '12px',  // 1.5x
  4: '16px',  // 2x
  5: '20px',  // 2.5x
  6: '24px',  // 3x
  8: '32px',  // 4x
  10: '40px', // 5x
  12: '48px', // 6x
  16: '64px', // 8x
  20: '80px', // 10x
  24: '96px', // 12x
} as const

/**
 * 圆角令牌
 */
export const borderRadiusTokens = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

/**
 * 边框宽度令牌
 */
export const borderWidthTokens = {
  none: '0',
  thin: '1px',
  base: '1px',
  thick: '2px',
} as const

/**
 * 字体大小令牌
 */
export const fontSizeTokens = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
} as const

/**
 * 字重令牌
 */
export const fontWeightTokens = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

/**
 * 行高令牌
 */
export const lineHeightTokens = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
} as const

/**
 * 生成CSS变量
 */
export function generateSpacingVariables(): string {
  return `
    /* 间距 */
    --spacing-0: ${spacingTokens[0]};
    --spacing-1: ${spacingTokens[1]};
    --spacing-2: ${spacingTokens[2]};
    --spacing-3: ${spacingTokens[3]};
    --spacing-4: ${spacingTokens[4]};
    --spacing-5: ${spacingTokens[5]};
    --spacing-6: ${spacingTokens[6]};
    --spacing-8: ${spacingTokens[8]};
    --spacing-10: ${spacingTokens[10]};
    --spacing-12: ${spacingTokens[12]};
    --spacing-16: ${spacingTokens[16]};
    --spacing-20: ${spacingTokens[20]};
    --spacing-24: ${spacingTokens[24]};
    
    /* 圆角 */
    --border-radius-none: ${borderRadiusTokens.none};
    --border-radius-sm: ${borderRadiusTokens.sm};
    --border-radius-md: ${borderRadiusTokens.md};
    --border-radius-lg: ${borderRadiusTokens.lg};
    --border-radius-xl: ${borderRadiusTokens.xl};
    --border-radius-full: ${borderRadiusTokens.full};
    
    /* 边框宽度 */
    --border-width-none: ${borderWidthTokens.none};
    --border-width-thin: ${borderWidthTokens.thin};
    --border-width-base: ${borderWidthTokens.base};
    --border-width-thick: ${borderWidthTokens.thick};
    
    /* 字体大小 */
    --font-size-xs: ${fontSizeTokens.xs};
    --font-size-sm: ${fontSizeTokens.sm};
    --font-size-base: ${fontSizeTokens.base};
    --font-size-lg: ${fontSizeTokens.lg};
    --font-size-xl: ${fontSizeTokens.xl};
    --font-size-2xl: ${fontSizeTokens['2xl']};
    --font-size-3xl: ${fontSizeTokens['3xl']};
    --font-size-4xl: ${fontSizeTokens['4xl']};
    --font-size-5xl: ${fontSizeTokens['5xl']};
    
    /* 字重 */
    --font-weight-light: ${fontWeightTokens.light};
    --font-weight-normal: ${fontWeightTokens.normal};
    --font-weight-medium: ${fontWeightTokens.medium};
    --font-weight-semibold: ${fontWeightTokens.semibold};
    --font-weight-bold: ${fontWeightTokens.bold};
    
    /* 行高 */
    --line-height-tight: ${lineHeightTokens.tight};
    --line-height-normal: ${lineHeightTokens.normal};
    --line-height-relaxed: ${lineHeightTokens.relaxed};
    --line-height-loose: ${lineHeightTokens.loose};
  `.trim()
}

/**
 * 导出所有间距令牌
 */
export const layoutTokens = {
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  borderWidth: borderWidthTokens,
  fontSize: fontSizeTokens,
  fontWeight: fontWeightTokens,
  lineHeight: lineHeightTokens,
} as const

export type LayoutTokens = typeof layoutTokens

