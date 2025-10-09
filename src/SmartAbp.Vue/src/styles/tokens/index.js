/**
 * Design Tokens - 设计令牌系统
 * 统一的设计变量管理
 */
import { lightColors, darkColors } from './colors';
/**
 * 间距令牌值
 */
export const spacing = {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
    40: '10rem', // 160px
    48: '12rem', // 192px
    64: '16rem' // 256px
};
/**
 * 字体令牌值
 */
export const typography = {
    fontFamily: {
        base: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
        mono: `"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace`
    },
    fontSize: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem' // 36px
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
        relaxed: 1.75,
        loose: 2
    }
};
/**
 * 圆角令牌值
 */
export const borderRadius = {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px'
};
/**
 * 阴影令牌值
 */
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};
/**
 * 过渡令牌值
 */
export const transitions = {
    duration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms'
    },
    timing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
    }
};
/**
 * 层级令牌值
 */
export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 2000,
    popover: 2010,
    tooltip: 2020
};
/**
 * 浅色主题令牌
 */
export const lightTokens = {
    colors: lightColors,
    spacing,
    typography,
    borderRadius,
    shadows,
    transitions,
    zIndex
};
/**
 * 深色主题令牌
 */
export const darkTokens = {
    colors: darkColors,
    spacing,
    typography,
    borderRadius,
    shadows,
    transitions,
    zIndex
};
