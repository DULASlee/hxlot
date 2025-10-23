/**
 * 🎬 动效设计令牌系统
 * 
 * 提供一致的动画和过渡效果
 * 基于Material Design动效规范
 */

/**
 * 动画时长令牌
 */
export const durationTokens = {
  instant: '50ms',
  fast: '150ms',
  base: '250ms',
  slow: '350ms',
  slower: '500ms',
} as const

/**
 * 缓动函数令牌（基于Material Design）
 */
export const easingTokens = {
  // 标准缓动
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 进入动画（从外部进入视图）
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  
  // 离开动画（离开视图）
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  
  // 进入并离开（完整动画）
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  
  // 弹性动画
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
} as const

/**
 * Z轴层级令牌
 */
export const zIndexTokens = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const

/**
 * 常用动画组合
 */
export const animationPresets = {
  // 淡入淡出
  fadeIn: {
    duration: durationTokens.base,
    easing: easingTokens.easeOut,
    keyframes: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  
  fadeOut: {
    duration: durationTokens.base,
    easing: easingTokens.easeIn,
    keyframes: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  },
  
  // 滑动
  slideDown: {
    duration: durationTokens.base,
    easing: easingTokens.easeOut,
    keyframes: {
      from: { transform: 'translateY(-8px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  },
  
  slideUp: {
    duration: durationTokens.base,
    easing: easingTokens.easeIn,
    keyframes: {
      from: { transform: 'translateY(0)', opacity: 1 },
      to: { transform: 'translateY(-8px)', opacity: 0 },
    },
  },
  
  // 缩放
  zoomIn: {
    duration: durationTokens.base,
    easing: easingTokens.easeOut,
    keyframes: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
  },
  
  zoomOut: {
    duration: durationTokens.base,
    easing: easingTokens.easeIn,
    keyframes: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.95)', opacity: 0 },
    },
  },
} as const

/**
 * 生成CSS变量
 */
export function generateMotionVariables(): string {
  return `
    /* 动画时长 */
    --duration-instant: ${durationTokens.instant};
    --duration-fast: ${durationTokens.fast};
    --duration-base: ${durationTokens.base};
    --duration-slow: ${durationTokens.slow};
    --duration-slower: ${durationTokens.slower};
    
    /* 缓动函数 */
    --ease: ${easingTokens.ease};
    --ease-in: ${easingTokens.easeIn};
    --ease-out: ${easingTokens.easeOut};
    --ease-in-out: ${easingTokens.easeInOut};
    --ease-in-quad: ${easingTokens.easeInQuad};
    --ease-out-quad: ${easingTokens.easeOutQuad};
    --ease-in-out-quad: ${easingTokens.easeInOutQuad};
    --ease-out-back: ${easingTokens.easeOutBack};
    --ease-in-back: ${easingTokens.easeInBack};
    
    /* Z轴层级 */
    --z-index-hide: ${zIndexTokens.hide};
    --z-index-base: ${zIndexTokens.base};
    --z-index-dropdown: ${zIndexTokens.dropdown};
    --z-index-sticky: ${zIndexTokens.sticky};
    --z-index-fixed: ${zIndexTokens.fixed};
    --z-index-modal-backdrop: ${zIndexTokens.modalBackdrop};
    --z-index-modal: ${zIndexTokens.modal};
    --z-index-popover: ${zIndexTokens.popover};
    --z-index-tooltip: ${zIndexTokens.tooltip};
    --z-index-notification: ${zIndexTokens.notification};
  `.trim()
}

/**
 * 导出所有动效令牌
 */
export const motionTokens = {
  duration: durationTokens,
  easing: easingTokens,
  zIndex: zIndexTokens,
  animations: animationPresets,
} as const

export type MotionTokens = typeof motionTokens

