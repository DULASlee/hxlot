import { type Ref } from 'vue';
/**
 * 企业级虚拟滚动Hook
 * 用于优化大量数据列表的渲染性能
 */
export interface VirtualScrollOptions {
    /** 每项高度（像素） */
    itemHeight: number;
    /** 容器高度（像素） */
    containerHeight: number;
    /** 预渲染缓冲区大小 */
    bufferSize?: number;
    /** 滚动节流延迟（毫秒） */
    throttleDelay?: number;
}
export interface VirtualScrollReturn<T> {
    /** 可见区域数据 */
    visibleItems: Ref<T[]>;
    /** 滚动容器引用 */
    scrollContainer: Ref<HTMLElement | null>;
    /** 滚动偏移量 */
    scrollTop: Ref<number>;
    /** 总高度（用于滚动条） */
    totalHeight: Ref<number>;
    /** 可见区域起始索引 */
    startIndex: Ref<number>;
    /** 可见区域结束索引 */
    endIndex: Ref<number>;
    /** 滚动到指定索引 */
    scrollToIndex: (_index: number) => void;
    /** 更新数据源 */
    updateData: (_newData: T[]) => void;
}
/**
 * 虚拟滚动实现
 */
export declare function useVirtualScroll<T>(data: Ref<T[]>, options: VirtualScrollOptions): VirtualScrollReturn<T>;
/**
 * 企业级表格虚拟滚动组件
 */
export interface VirtualTableOptions<T> {
    data: T[];
    itemHeight: number;
    containerHeight: number;
    showIndex?: boolean;
    indexTitle?: string;
    columns: Array<{
        key: string;
        title: string;
        width?: number;
        align?: 'left' | 'center' | 'right';
        render?: (_value: any, _record: T, _index: number) => any;
    }>;
}
/**
 * 虚拟表格Hook
 */
export declare function useVirtualTable<T extends Record<string, any>>(data: Ref<T[]>, options: VirtualTableOptions<T>): {
    columns: import("vue").ComputedRef<{
        key: string;
        title: string;
        width?: number;
        align?: "left" | "center" | "right";
        render?: ((_value: any, _record: T, _index: number) => any) | undefined;
    }[]>;
    /** 可见区域数据 */
    visibleItems: Ref<T[], T[]>;
    /** 滚动容器引用 */
    scrollContainer: Ref<HTMLElement | null>;
    /** 滚动偏移量 */
    scrollTop: Ref<number>;
    /** 总高度（用于滚动条） */
    totalHeight: Ref<number>;
    /** 可见区域起始索引 */
    startIndex: Ref<number>;
    /** 可见区域结束索引 */
    endIndex: Ref<number>;
    /** 滚动到指定索引 */
    scrollToIndex: (_index: number) => void;
    /** 更新数据源 */
    updateData: (_newData: T[]) => void;
};
/**
 * 性能监控Hook
 */
export declare function usePerformanceMonitor(): {
    renderTimes: Ref<number[], number[]>;
    averageRenderTime: import("vue").ComputedRef<number>;
    recordRenderTime: (startTime: number) => void;
    startRenderTimer: () => number;
};
//# sourceMappingURL=virtualScrolling.d.ts.map
