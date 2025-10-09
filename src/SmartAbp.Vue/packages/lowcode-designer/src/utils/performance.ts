/**
 * 性能优化工具集
 * 
 * 功能：
 * - 虚拟滚动
 * - 懒加载
 * - 智能吸附对齐
 * - 防抖节流
 */

// ==================== 虚拟滚动 ====================

export interface VirtualScrollOptions {
    itemHeight: number
    containerHeight: number
    buffer?: number
}

export interface VirtualScrollResult {
    startIndex: number
    endIndex: number
    offsetY: number
    visibleItems: number
}

/**
 * 计算虚拟滚动参数
 */
export function calculateVirtualScroll(
    scrollTop: number,
    totalItems: number,
    options: VirtualScrollOptions
): VirtualScrollResult {
    const { itemHeight, containerHeight, buffer = 3 } = options

    // 计算可见项数量
    const visibleItems = Math.ceil(containerHeight / itemHeight)

    // 计算开始索引（带缓冲区）
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)

    // 计算结束索引（带缓冲区）
    const endIndex = Math.min(totalItems, startIndex + visibleItems + buffer * 2)

    // 计算偏移量
    const offsetY = startIndex * itemHeight

    return {
        startIndex,
        endIndex,
        offsetY,
        visibleItems
    }
}

// ==================== 懒加载 ====================

export interface LazyLoadOptions {
    threshold?: number
    rootMargin?: string
}

/**
 * 创建懒加载观察器
 */
export function createLazyLoader(
    callback: (entry: IntersectionObserverEntry) => void,
    options: LazyLoadOptions = {}
): IntersectionObserver {
    const { threshold = 0.1, rootMargin = '50px' } = options

    return new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback(entry)
                }
            })
        },
        {
            threshold,
            rootMargin
        }
    )
}

// ==================== 智能吸附对齐 ====================

export interface SnapPoint {
    x: number
    y: number
    type: 'grid' | 'component' | 'guide'
}

export interface SnapOptions {
    gridSize?: number
    snapThreshold?: number
    enableGrid?: boolean
    enableComponents?: boolean
    enableGuides?: boolean
}

export interface SnapResult {
    x: number
    y: number
    snappedX: boolean
    snappedY: boolean
    snapLines: Array<{ x1: number; y1: number; x2: number; y2: number }>
}

/**
 * 计算吸附位置
 */
export function calculateSnap(
    x: number,
    y: number,
    snapPoints: SnapPoint[],
    options: SnapOptions = {}
): SnapResult {
    const {
        gridSize = 10,
        snapThreshold = 5,
        enableGrid = true,
        enableComponents = true,
        enableGuides = true
    } = options

    let snappedX = x
    let snappedY = y
    let hasSnappedX = false
    let hasSnappedY = false
    const snapLines: SnapResult['snapLines'] = []

    // 网格吸附
    if (enableGrid && gridSize > 0) {
        const gridX = Math.round(x / gridSize) * gridSize
        const gridY = Math.round(y / gridSize) * gridSize

        if (Math.abs(x - gridX) <= snapThreshold) {
            snappedX = gridX
            hasSnappedX = true
        }

        if (Math.abs(y - gridY) <= snapThreshold) {
            snappedY = gridY
            hasSnappedY = true
        }
    }

    // 组件和辅助线吸附
    if ((enableComponents || enableGuides) && !hasSnappedX) {
        const validPoints = snapPoints.filter(
            (p) =>
                (p.type === 'component' && enableComponents) ||
                (p.type === 'guide' && enableGuides)
        )

        // X轴吸附
        for (const point of validPoints) {
            if (Math.abs(x - point.x) <= snapThreshold) {
                snappedX = point.x
                hasSnappedX = true
                snapLines.push({
                    x1: point.x,
                    y1: 0,
                    x2: point.x,
                    y2: 10000
                })
                break
            }
        }
    }

    if ((enableComponents || enableGuides) && !hasSnappedY) {
        const validPoints = snapPoints.filter(
            (p) =>
                (p.type === 'component' && enableComponents) ||
                (p.type === 'guide' && enableGuides)
        )

        // Y轴吸附
        for (const point of validPoints) {
            if (Math.abs(y - point.y) <= snapThreshold) {
                snappedY = point.y
                hasSnappedY = true
                snapLines.push({
                    x1: 0,
                    y1: point.y,
                    x2: 10000,
                    y2: point.y
                })
                break
            }
        }
    }

    return {
        x: snappedX,
        y: snappedY,
        snappedX: hasSnappedX,
        snappedY: hasSnappedY,
        snapLines
    }
}

// ==================== 防抖节流 ====================

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return function (this: any, ...args: Parameters<T>) {
        const context = this

        if (timeout) {
            clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait)
    }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    let previous = 0

    return function (this: any, ...args: Parameters<T>) {
        const context = this
        const now = Date.now()

        if (!previous) previous = now

        const remaining = wait - (now - previous)

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            previous = now
            func.apply(context, args)
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now()
                timeout = null
                func.apply(context, args)
            }, remaining)
        }
    }
}

// ==================== 性能监控 ====================

export interface PerformanceMetrics {
    fps: number
    memory?: number
    renderTime: number
    updateTime: number
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
    private frameCount = 0
    private lastTime = performance.now()
    private fps = 60
    private rafId: number | null = null

    start() {
        const measure = () => {
            this.frameCount++
            const currentTime = performance.now()

            if (currentTime >= this.lastTime + 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
                this.frameCount = 0
                this.lastTime = currentTime
            }

            this.rafId = requestAnimationFrame(measure)
        }

        this.rafId = requestAnimationFrame(measure)
    }

    stop() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }

    getMetrics(): PerformanceMetrics {
        const memory = (performance as any).memory
            ? (performance as any).memory.usedJSHeapSize / 1048576
            : undefined

        return {
            fps: this.fps,
            memory,
            renderTime: 0, // 需要实际测量
            updateTime: 0 // 需要实际测量
        }
    }
}

// ==================== 图片懒加载 ====================

export interface ImageLazyLoadOptions {
    placeholder?: string
    errorImage?: string
    threshold?: number
    rootMargin?: string
}

/**
 * 图片懒加载
 */
export function lazyLoadImage(
    img: HTMLImageElement,
    src: string,
    options: ImageLazyLoadOptions = {}
): () => void {
    const {
        placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E',
        errorImage = placeholder,
        threshold = 0.1,
        rootMargin = '50px'
    } = options

    // 设置占位图
    img.src = placeholder

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target as HTMLImageElement

                    // 加载真实图片
                    const tempImg = new Image()
                    tempImg.onload = () => {
                        image.src = src
                        observer.unobserve(image)
                    }
                    tempImg.onerror = () => {
                        image.src = errorImage
                        observer.unobserve(image)
                    }
                    tempImg.src = src
                }
            })
        },
        {
            threshold,
            rootMargin
        }
    )

    observer.observe(img)

    // 返回清理函数
    return () => {
        observer.disconnect()
    }
}

// ==================== 批量更新优化 ====================

/**
 * 批量更新队列
 */
export class BatchUpdateQueue {
    private queue: Array<() => void> = []
    private rafId: number | null = null

    add(callback: () => void) {
        this.queue.push(callback)

        if (this.rafId === null) {
            this.rafId = requestAnimationFrame(() => {
                this.flush()
            })
        }
    }

    private flush() {
        const callbacks = [...this.queue]
        this.queue = []
        this.rafId = null

        callbacks.forEach((callback) => {
            try {
                callback()
            } catch (error) {
                console.error('批量更新错误:', error)
            }
        })
    }

    clear() {
        this.queue = []
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }
}

// ==================== 导出 ====================

export default {
    calculateVirtualScroll,
    createLazyLoader,
    calculateSnap,
    debounce,
    throttle,
    PerformanceMonitor,
    lazyLoadImage,
    BatchUpdateQueue
}

