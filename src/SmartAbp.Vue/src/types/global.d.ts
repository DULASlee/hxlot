/**
 * 全局类型声明扩展
 * 用于支持浏览器非标准API和实验性功能
 */

declare global {
  /**
   * Performance API 扩展
   * Chrome/Edge 特有的memory属性
   */
  interface Performance {
    memory?: {
      /** 当前已使用的JS堆大小（字节） */
      usedJSHeapSize: number
      /** JS堆总大小（字节） */
      totalJSHeapSize: number
      /** JS堆大小限制（字节） */
      jsHeapSizeLimit: number
    }
  }

  /**
   * Window API 扩展
   * Chrome DevTools 特有功能
   */
  interface Window {
    /**
     * 手动触发垃圾回收
     * 仅在Chrome DevTools中启用 --expose-gc 标志时可用
     */
    gc?: () => void
  }
}

export {}
