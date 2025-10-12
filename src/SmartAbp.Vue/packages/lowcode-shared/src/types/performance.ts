/**
 * Performance API 类型扩展
 * 
 * @description 扩展浏览器Performance API类型定义
 * @module @smartabp/lowcode-shared/types
 * @architecture 符合架构铁律一：统一类型系统
 */

/**
 * 内存使用信息接口
 */
export interface MemoryInfo {
  /** JS堆大小上限（字节） */
  jsHeapSizeLimit: number
  /** 已分配的JS堆大小（字节） */
  totalJSHeapSize: number
  /** 当前使用的JS堆大小（字节） */
  usedJSHeapSize: number
}

/**
 * 扩展Performance接口以支持memory属性
 * 注意：performance.memory 是Chrome私有API，不是标准API
 */
declare global {
  interface Performance {
    /**
     * 内存使用信息（Chrome私有API）
     * @see https://developer.chrome.com/docs/devtools/memory-problems/
     */
    memory?: MemoryInfo
  }
}

