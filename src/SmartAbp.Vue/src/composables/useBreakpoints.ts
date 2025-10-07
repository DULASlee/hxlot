/**
 * Responsive Breakpoints Composable
 * Stage 5.3 TDD Implementation - Vue 3 Composition API
 */
import { ref, computed, onMounted, onUnmounted, readonly, type Ref, type ComputedRef } from 'vue'

/**
 * 响应式断点配置
 */
export interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

/**
 * Breakpoints选项
 */
export interface BreakpointsOptions {
  /** 自定义断点配置 */
  config?: Partial<BreakpointConfig>
  /** 是否启用SSR支持 */
  enableSSR?: boolean
}

/**
 * 断点名称类型
 */
export type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'unknown'

/**
 * useBreakpoints返回值接口
 */
export interface UseBreakpointsReturn {
  // State
  windowWidth: Readonly<Ref<number>>
  windowHeight: Readonly<Ref<number>>
  
  // Breakpoint checks
  isXs: ComputedRef<boolean>
  isSm: ComputedRef<boolean>
  isMd: ComputedRef<boolean>
  isLg: ComputedRef<boolean>
  isXl: ComputedRef<boolean>
  isXxl: ComputedRef<boolean>
  
  // Convenient aliases
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  
  // Current breakpoint
  breakpoint: ComputedRef<BreakpointName>
  
  // Utilities
  isAbove: (breakpointName: keyof BreakpointConfig) => ComputedRef<boolean>
  isBelow: (breakpointName: keyof BreakpointConfig) => ComputedRef<boolean>
  isBetween: (min: keyof BreakpointConfig, max: keyof BreakpointConfig) => ComputedRef<boolean>
  
  // Config
  config: Readonly<BreakpointConfig>
}

/**
 * 响应式断点Composable
 * @param options 配置选项
 */
export function useBreakpoints(options: BreakpointsOptions = {}): UseBreakpointsReturn {
  const defaultConfig: BreakpointConfig = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600
  }

  const config: BreakpointConfig = { ...defaultConfig, ...options.config }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const windowWidth: Ref<number> = ref(0)
  const windowHeight: Ref<number> = ref(0)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Computed breakpoint checks
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isXs: ComputedRef<boolean> = computed(
    () => windowWidth.value >= config.xs && windowWidth.value < config.sm
  )
  const isSm: ComputedRef<boolean> = computed(
    () => windowWidth.value >= config.sm && windowWidth.value < config.md
  )
  const isMd: ComputedRef<boolean> = computed(
    () => windowWidth.value >= config.md && windowWidth.value < config.lg
  )
  const isLg: ComputedRef<boolean> = computed(
    () => windowWidth.value >= config.lg && windowWidth.value < config.xl
  )
  const isXl: ComputedRef<boolean> = computed(
    () => windowWidth.value >= config.xl && windowWidth.value < config.xxl
  )
  const isXxl: ComputedRef<boolean> = computed(() => windowWidth.value >= config.xxl)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Convenient aliases
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isMobile: ComputedRef<boolean> = computed(() => isXs.value || isSm.value)
  const isTablet: ComputedRef<boolean> = computed(() => isMd.value)
  const isDesktop: ComputedRef<boolean> = computed(
    () => isLg.value || isXl.value || isXxl.value
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Current breakpoint name
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const breakpoint: ComputedRef<BreakpointName> = computed(() => {
    if (isXs.value) return 'xs'
    if (isSm.value) return 'sm'
    if (isMd.value) return 'md'
    if (isLg.value) return 'lg'
    if (isXl.value) return 'xl'
    if (isXxl.value) return 'xxl'
    return 'unknown'
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Breakpoint utilities
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isAbove = (breakpointName: keyof BreakpointConfig): ComputedRef<boolean> => {
    return computed(() => windowWidth.value >= config[breakpointName])
  }

  const isBelow = (breakpointName: keyof BreakpointConfig): ComputedRef<boolean> => {
    return computed(() => windowWidth.value < config[breakpointName])
  }

  const isBetween = (
    min: keyof BreakpointConfig,
    max: keyof BreakpointConfig
  ): ComputedRef<boolean> => {
    return computed(() => windowWidth.value >= config[min] && windowWidth.value < config[max])
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Update dimensions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const updateDimensions = (): void => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Event handler
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const handleResize = (): void => {
    updateDimensions()
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Lifecycle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  onMounted(() => {
    if (!options.enableSSR && typeof window !== 'undefined') {
      updateDimensions()
      window.addEventListener('resize', handleResize, { passive: true })
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    // State
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),

    // Breakpoint checks
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,

    // Convenient aliases
    isMobile,
    isTablet,
    isDesktop,

    // Current breakpoint
    breakpoint,

    // Utilities
    isAbove,
    isBelow,
    isBetween,

    // Config
    config: readonly(config) as Readonly<BreakpointConfig>
  }
}
