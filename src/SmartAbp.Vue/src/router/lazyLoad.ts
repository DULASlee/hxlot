/**
 * 路由懒加载优化工具
 * 提供智能的组件懒加载和预加载功能
 */

import type { Component } from 'vue'

/**
 * 懒加载视图组件
 */
export const lazyLoadView = (componentPath: string): (() => Promise<Component>) => {
  return () => import(/* @vite-ignore */ componentPath)
}

/**
 * 懒加载视图组件（带分包名称）
 * @param componentPath 组件路径
 * @param _chunkName 分包名称（预留参数，Vite使用[request]自动生成）
 */
export const lazyLoadViewWithChunk = (
  componentPath: string,
  _chunkName: string
): (() => Promise<Component>) => {
  return () => import(
    /* webpackChunkName: "[request]" */
    /* @vite-ignore */
    componentPath
  )
}

/**
 * 预加载关键路由组件
 * @param routes 路由路径数组
 */
export const preloadRoutes = (routes: string[]): void => {
  routes.forEach(route => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  })
}

/**
 * 按优先级预加载
 * @param high 高优先级路由
 * @param normal 普通优先级路由
 */
export const preloadByPriority = (
  high: string[] = [],
  normal: string[] = []
): void => {
  // 立即预加载高优先级
  high.forEach(route => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = route
    document.head.appendChild(link)
  })

  // 延迟预加载普通优先级
  requestIdleCallback(() => {
    normal.forEach(route => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = route
      document.head.appendChild(link)
    })
  }, { timeout: 2000 })
}

/**
 * 智能预加载器
 * 根据用户行为预测并预加载可能访问的路由
 */
export class SmartPreloader {
  private preloadedRoutes: Set<string> = new Set()
  private hoverTimer: number | null = null

  /**
   * 预加载路由
   */
  preload(route: string): void {
    if (this.preloadedRoutes.has(route)) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
    
    this.preloadedRoutes.add(route)
  }

  /**
   * 鼠标悬停时预加载
   */
  preloadOnHover(route: string, delay: number = 300): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer)
    }

    this.hoverTimer = window.setTimeout(() => {
      this.preload(route)
    }, delay)
  }

  /**
   * 取消预加载
   */
  cancelPreload(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer)
      this.hoverTimer = null
    }
  }

  /**
   * 批量预加载
   */
  preloadBatch(routes: string[]): void {
    routes.forEach(route => this.preload(route))
  }

  /**
   * 清除预加载缓存
   */
  clear(): void {
    this.preloadedRoutes.clear()
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer)
      this.hoverTimer = null
    }
  }
}

// 导出单例
export const smartPreloader = new SmartPreloader()

/**
 * requestIdleCallback 的 polyfill
 */
const requestIdleCallback = 
  window.requestIdleCallback ||
  function (handler: IdleRequestCallback, options?: { timeout?: number }): number {
    const startTime = Date.now()
    return window.setTimeout(() => {
      handler({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50.0 - (Date.now() - startTime))
      })
    }, options?.timeout || 1)
  }

/**
 * 路由加载性能监控
 */
export class RouteLoadMonitor {
  private loadTimes: Map<string, number> = new Map()

  /**
   * 记录路由加载时间
   */
  record(route: string, duration: number): void {
    this.loadTimes.set(route, duration)
  }

  /**
   * 获取路由加载时间
   */
  getLoadTime(route: string): number | undefined {
    return this.loadTimes.get(route)
  }

  /**
   * 获取平均加载时间
   */
  getAverageLoadTime(): number {
    const times = Array.from(this.loadTimes.values())
    if (times.length === 0) return 0
    return times.reduce((a, b) => a + b, 0) / times.length
  }

  /**
   * 获取最慢的路由
   */
  getSlowestRoutes(count: number = 5): Array<{ route: string; duration: number }> {
    return Array.from(this.loadTimes.entries())
      .map(([route, duration]) => ({ route, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count)
  }

  /**
   * 清除记录
   */
  clear(): void {
    this.loadTimes.clear()
  }
}

// 导出单例
export const routeLoadMonitor = new RouteLoadMonitor()
