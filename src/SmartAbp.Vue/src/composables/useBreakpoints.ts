/**
 * Responsive Breakpoints Composable
 * Stage 5.3 TDD Implementation - Vue 3 Composition API
 */

import { ref, computed, onMounted, onUnmounted, readonly } from "vue"

interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

interface UseBreakpointsOptions {
  config?: Partial<BreakpointConfig>
  enableSSR?: boolean
}

export function useBreakpoints(options: UseBreakpointsOptions = {}) {
  const defaultConfig: BreakpointConfig = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  }

  const config = { ...defaultConfig, ...options.config }

  // State
  const windowWidth = ref(0)
  const windowHeight = ref(0)

  // Computed breakpoint checks
  const isXs = computed(() => windowWidth.value >= config.xs && windowWidth.value < config.sm)
  const isSm = computed(() => windowWidth.value >= config.sm && windowWidth.value < config.md)
  const isMd = computed(() => windowWidth.value >= config.md && windowWidth.value < config.lg)
  const isLg = computed(() => windowWidth.value >= config.lg && windowWidth.value < config.xl)
  const isXl = computed(() => windowWidth.value >= config.xl && windowWidth.value < config.xxl)
  const isXxl = computed(() => windowWidth.value >= config.xxl)

  // Convenient aliases
  const isMobile = computed(() => isXs.value || isSm.value)
  const isTablet = computed(() => isMd.value)
  const isDesktop = computed(() => isLg.value || isXl.value || isXxl.value)

  // Current breakpoint name
  const breakpoint = computed(() => {
    if (isXs.value) return "xs"
    if (isSm.value) return "sm"
    if (isMd.value) return "md"
    if (isLg.value) return "lg"
    if (isXl.value) return "xl"
    if (isXxl.value) return "xxl"
    return "unknown"
  })

  // Breakpoint utilities
  const isAbove = (breakpointName: keyof BreakpointConfig) => {
    return computed(() => windowWidth.value >= config[breakpointName])
  }

  const isBelow = (breakpointName: keyof BreakpointConfig) => {
    return computed(() => windowWidth.value < config[breakpointName])
  }

  const isBetween = (min: keyof BreakpointConfig, max: keyof BreakpointConfig) => {
    return computed(() => windowWidth.value >= config[min] && windowWidth.value < config[max])
  }

  // Update dimensions
  const updateDimensions = () => {
    if (typeof window !== "undefined") {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }
  }

  // Event handler
  const handleResize = () => {
    updateDimensions()
  }

  // Lifecycle
  onMounted(() => {
    if (!options.enableSSR && typeof window !== "undefined") {
      updateDimensions()
      window.addEventListener("resize", handleResize, { passive: true })
    }
  })

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize)
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
    config: readonly(config),
  }
}

export type UseBreakpoints = ReturnType<typeof useBreakpoints>
