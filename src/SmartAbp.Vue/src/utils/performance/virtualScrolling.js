// SmartAbp Enterprise Virtual Scrolling Performance Optimization
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
/**
 * 虚拟滚动实现
 */
export function useVirtualScroll(data, options) {
    const { itemHeight, containerHeight, bufferSize = 5, throttleDelay = 16 } = options;
    // 响应式状态
    const scrollContainer = ref(null);
    const scrollTop = ref(0);
    const startIndex = ref(0);
    const endIndex = ref(0);
    // 计算属性
    const totalHeight = computed(() => data.value.length * itemHeight);
    const visibleItemCount = computed(() => Math.ceil(containerHeight / itemHeight));
    const visibleItems = computed(() => {
        const start = Math.max(0, startIndex.value - bufferSize);
        const end = Math.min(data.value.length, endIndex.value + bufferSize);
        return data.value.slice(start, end).map((item, index) => ({
            ...item,
            _virtualIndex: start + index,
            _transform: `translateY(${(start + index) * itemHeight}px)`
        }));
    });
    // 节流函数
    let throttleTimer = null;
    const throttle = (fn, delay) => {
        return (..._args) => {
            if (throttleTimer)
                return;
            throttleTimer = window.setTimeout(() => {
                fn.apply(null, _args);
                throttleTimer = null;
            }, delay);
        };
    };
    // 更新可见区域
    const updateVisibleRange = () => {
        const scrollValue = scrollTop.value;
        const start = Math.floor(scrollValue / itemHeight);
        const end = Math.min(data.value.length, start + visibleItemCount.value);
        startIndex.value = start;
        endIndex.value = end;
    };
    // 节流的滚动处理
    const handleScroll = throttle(() => {
        if (!scrollContainer.value)
            return;
        scrollTop.value = scrollContainer.value.scrollTop;
        updateVisibleRange();
    }, throttleDelay);
    // 滚动到指定索引
    const scrollToIndex = (_index) => {
        if (!scrollContainer.value)
            return;
        const targetScrollTop = _index * itemHeight;
        scrollContainer.value.scrollTop = targetScrollTop;
        scrollTop.value = targetScrollTop;
        updateVisibleRange();
    };
    // 更新数据源
    const updateData = (_newData) => {
        data.value = _newData;
        updateVisibleRange();
    };
    // 生命周期
    onMounted(() => {
        if (scrollContainer.value) {
            scrollContainer.value.addEventListener('scroll', handleScroll, {
                passive: true
            });
        }
        updateVisibleRange();
    });
    onBeforeUnmount(() => {
        if (scrollContainer.value) {
            scrollContainer.value.removeEventListener('scroll', handleScroll);
        }
        if (throttleTimer) {
            clearTimeout(throttleTimer);
        }
    });
    return {
        visibleItems,
        scrollContainer,
        scrollTop,
        totalHeight,
        startIndex,
        endIndex,
        scrollToIndex,
        updateData
    };
}
/**
 * 虚拟表格Hook
 */
export function useVirtualTable(data, options) {
    const virtualScroll = useVirtualScroll(data, options);
    const { columns, showIndex = false, indexTitle = '#' } = options;
    // 扩展列配置
    const enhancedColumns = computed(() => {
        const cols = [...columns];
        if (showIndex) {
            cols.unshift({
                key: '_index',
                title: indexTitle,
                width: 60,
                align: 'center',
                render: (_, __, index) => index + 1
            });
        }
        return cols;
    });
    return {
        ...virtualScroll,
        columns: enhancedColumns
    };
}
/**
 * 性能监控Hook
 */
export function usePerformanceMonitor() {
    const renderTimes = ref([]);
    const averageRenderTime = computed(() => {
        if (renderTimes.value.length === 0)
            return 0;
        const sum = renderTimes.value.reduce((a, b) => a + b, 0);
        return sum / renderTimes.value.length;
    });
    const recordRenderTime = (startTime) => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        renderTimes.value.push(renderTime);
        // 只保留最近100次记录
        if (renderTimes.value.length > 100) {
            renderTimes.value.shift();
        }
        // 性能警告
        if (renderTime > 50) {
            console.warn(`[Performance Warning] Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
    };
    const startRenderTimer = () => performance.now();
    return {
        renderTimes,
        averageRenderTime,
        recordRenderTime,
        startRenderTimer
    };
}
