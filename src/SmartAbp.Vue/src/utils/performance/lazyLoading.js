// SmartAbp Enterprise Lazy Loading Performance Optimization
import { ref, onMounted, onBeforeUnmount } from 'vue';
/**
 * 懒加载实现
 */
export function useLazyLoad(callback, options = {}) {
    const { rootMargin = '50px', threshold = 0.1, once = true, delay = 0 } = options;
    const target = ref(null);
    const isVisible = ref(false);
    const hasLoaded = ref(false);
    let observer = null;
    let delayTimer = null;
    const load = async () => {
        if (hasLoaded.value && once)
            return;
        hasLoaded.value = true;
        try {
            await callback();
        }
        catch (error) {
            console.error('[LazyLoad] Load failed:', error);
            hasLoaded.value = false; // 允许重试
        }
    };
    const handleIntersection = (entries) => {
        entries.forEach(entry => {
            isVisible.value = entry.isIntersecting;
            if (entry.isIntersecting) {
                if (delay > 0) {
                    delayTimer = window.setTimeout(load, delay);
                }
                else {
                    load();
                }
                if (once && observer) {
                    observer.unobserve(entry.target);
                }
            }
            else if (delayTimer) {
                clearTimeout(delayTimer);
                delayTimer = null;
            }
        });
    };
    onMounted(() => {
        if (target.value && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(handleIntersection, {
                rootMargin,
                threshold
            });
            observer.observe(target.value);
        }
    });
    onBeforeUnmount(() => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (delayTimer) {
            clearTimeout(delayTimer);
        }
    });
    return {
        target,
        isVisible,
        hasLoaded,
        load
    };
}
export function useLazyImage(src, options = {}) {
    const { placeholder = '', errorImage = '', optimizeQuality = true, responsiveSizes = {}, ...lazyOptions } = options;
    const currentSrc = ref(placeholder);
    const isLoading = ref(false);
    const hasError = ref(false);
    const loadImage = async () => {
        if (isLoading.value)
            return;
        isLoading.value = true;
        hasError.value = false;
        try {
            // 根据屏幕大小选择合适的图片
            let targetSrc = src;
            if (Object.keys(responsiveSizes).length > 0) {
                const screenWidth = window.innerWidth;
                for (const [breakpoint, imgSrc] of Object.entries(responsiveSizes)) {
                    if (screenWidth <= parseInt(breakpoint)) {
                        targetSrc = imgSrc;
                        break;
                    }
                }
            }
            // 预加载图片
            const img = new Image();
            // 图片质量优化
            if (optimizeQuality) {
                img.loading = 'lazy';
                img.decoding = 'async';
            }
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = targetSrc;
            });
            currentSrc.value = targetSrc;
        }
        catch (error) {
            console.error('[LazyImage] Load failed:', error);
            hasError.value = true;
            if (errorImage) {
                currentSrc.value = errorImage;
            }
        }
        finally {
            isLoading.value = false;
        }
    };
    const { target, isVisible, hasLoaded } = useLazyLoad(loadImage, lazyOptions);
    return {
        target,
        currentSrc,
        isVisible,
        isLoading,
        hasError,
        hasLoaded,
        reload: loadImage
    };
}
/**
 * 组件懒加载Hook
 */
export function useLazyComponent(loader, options = {}) {
    const component = ref(null);
    const isLoading = ref(false);
    const hasError = ref(false);
    const error = ref(null);
    const loadComponent = async () => {
        if (isLoading.value || component.value)
            return;
        isLoading.value = true;
        hasError.value = false;
        error.value = null;
        try {
            const loaded = await loader();
            component.value = loaded;
        }
        catch (err) {
            console.error('[LazyComponent] Load failed:', err);
            hasError.value = true;
            error.value = err;
        }
        finally {
            isLoading.value = false;
        }
    };
    const { target, isVisible, hasLoaded } = useLazyLoad(loadComponent, options);
    return {
        target,
        component,
        isVisible,
        isLoading,
        hasError,
        error,
        hasLoaded,
        retry: loadComponent
    };
}
export function useInfiniteScroll(loader, // 返回是否还有更多数据
options = {}) {
    const { distance = 100, immediate = true, disabled = false } = options;
    const target = ref(null);
    const isLoading = ref(false);
    const isFinished = ref(false);
    const hasError = ref(false);
    const load = async () => {
        if (isLoading.value || isFinished.value || disabled)
            return;
        isLoading.value = true;
        hasError.value = false;
        try {
            const hasMore = await loader();
            if (!hasMore) {
                isFinished.value = true;
            }
        }
        catch (error) {
            console.error('[InfiniteScroll] Load failed:', error);
            hasError.value = true;
        }
        finally {
            isLoading.value = false;
        }
    };
    const checkAndLoad = () => {
        if (!target.value)
            return;
        const { scrollTop, scrollHeight, clientHeight } = target.value;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceToBottom <= distance) {
            load();
        }
    };
    let throttleTimer = null;
    const handleScroll = () => {
        if (throttleTimer)
            return;
        throttleTimer = window.setTimeout(() => {
            checkAndLoad();
            throttleTimer = null;
        }, 100); // 节流100ms
    };
    onMounted(() => {
        if (target.value) {
            target.value.addEventListener('scroll', handleScroll, { passive: true });
            if (immediate) {
                load();
            }
        }
    });
    onBeforeUnmount(() => {
        if (target.value) {
            target.value.removeEventListener('scroll', handleScroll);
        }
        if (throttleTimer) {
            clearTimeout(throttleTimer);
        }
    });
    return {
        target,
        isLoading,
        isFinished,
        hasError,
        load: () => load(),
        reset: () => {
            isFinished.value = false;
            hasError.value = false;
        }
    };
}
