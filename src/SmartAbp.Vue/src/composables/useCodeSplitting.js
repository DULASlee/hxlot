/**
 * 代码分割优化 Composable
 * 提供动态导入、路由懒加载、组件预加载等功能
 */
import { ref } from 'vue';
/**
 * 动态组件加载器
 */
export function useDynamicImport() {
    // 加载状态缓存
    const loadStates = ref(new Map());
    /**
     * 动态加载组件
     */
    const loadComponent = async (importFn, key) => {
        // 检查缓存
        const cached = loadStates.value.get(key);
        if (cached?.component) {
            return cached.component;
        }
        // 设置加载状态
        loadStates.value.set(key, {
            loading: true,
            error: null,
            component: null
        });
        try {
            const module = await importFn();
            const component = module.default;
            // 更新状态
            loadStates.value.set(key, {
                loading: false,
                error: null,
                component
            });
            return component;
        }
        catch (error) {
            // 更新错误状态
            loadStates.value.set(key, {
                loading: false,
                error: error,
                component: null
            });
            throw error;
        }
    };
    /**
     * 获取加载状态
     */
    const getLoadState = (key) => {
        return loadStates.value.get(key) || null;
    };
    /**
     * 清除缓存
     */
    const clearCache = (key) => {
        if (key) {
            loadStates.value.delete(key);
        }
        else {
            loadStates.value.clear();
        }
    };
    return {
        loadComponent,
        getLoadState,
        clearCache
    };
}
/**
 * 路由懒加载优化
 */
export function useRouteLazyLoad() {
    /**
     * 创建懒加载路由配置
     */
    const createLazyRoute = (path, componentPath, options = {}) => {
        const { chunkName, preload = false, priority = 'low' } = options;
        return {
            path,
            component: () => {
                // Vite动态导入（自动代码分割）
                const importPromise = import(/* @vite-ignore */ componentPath);
                // 如果需要预加载
                if (preload) {
                    preloadComponent(componentPath, priority);
                }
                return importPromise;
            },
            meta: {
                title: chunkName || path,
                chunkName,
                preload,
                priority
            }
        };
    };
    /**
     * 预加载组件
     */
    const preloadComponent = (componentPath, priority = 'low') => {
        // 使用link标签预加载
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'script';
        link.href = componentPath;
        // 设置优先级
        if (priority === 'high') {
            link.rel = 'preload';
        }
        document.head.appendChild(link);
    };
    /**
     * 批量预加载路由
     */
    const preloadRoutes = (routes) => {
        routes.forEach(route => {
            if (route.meta?.preload && typeof route.component === 'function') {
                // 延迟预加载，避免阻塞主线程
                setTimeout(() => {
                    route.component;
                }, 0);
            }
        });
    };
    return {
        createLazyRoute,
        preloadComponent,
        preloadRoutes
    };
}
/**
 * 基于交互的预加载
 */
export function useInteractionPreload() {
    const preloadedComponents = ref(new Set());
    /**
     * 鼠标悬停预加载
     */
    const onHoverPreload = (el, componentPath) => {
        let timeoutId = null;
        const handleMouseEnter = () => {
            // 延迟300ms预加载，避免用户快速滑过
            timeoutId = window.setTimeout(() => {
                if (!preloadedComponents.value.has(componentPath)) {
                    import(/* @vite-ignore */ componentPath).then(() => {
                        preloadedComponents.value.add(componentPath);
                    }).catch(err => {
                        console.warn('Preload failed:', err);
                    });
                }
            }, 300);
        };
        const handleMouseLeave = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
        // 返回清理函数
        return () => {
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    };
    /**
     * 视口内预加载
     */
    const onViewportPreload = (el, componentPath, options) => {
        if (!('IntersectionObserver' in window)) {
            return () => {
                // Cleanup function
            };
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !preloadedComponents.value.has(componentPath)) {
                    import(/* @vite-ignore */ componentPath).then(() => {
                        preloadedComponents.value.add(componentPath);
                        observer.unobserve(el);
                    }).catch(err => {
                        console.warn('Preload failed:', err);
                    });
                }
            });
        }, {
            rootMargin: '50px',
            ...options
        });
        observer.observe(el);
        // 返回清理函数
        return () => {
            observer.unobserve(el);
            observer.disconnect();
        };
    };
    /**
     * 空闲时预加载
     */
    const onIdlePreload = (componentPaths) => {
        if (!('requestIdleCallback' in window)) {
            // 降级到setTimeout
            setTimeout(() => {
                componentPaths.forEach(path => {
                    if (!preloadedComponents.value.has(path)) {
                        import(/* @vite-ignore */ path).then(() => {
                            preloadedComponents.value.add(path);
                        }).catch(err => {
                            console.warn('Preload failed:', err);
                        });
                    }
                });
            }, 1000);
            return;
        }
        window.requestIdleCallback(() => {
            componentPaths.forEach(path => {
                if (!preloadedComponents.value.has(path)) {
                    import(/* @vite-ignore */ path).then(() => {
                        preloadedComponents.value.add(path);
                    }).catch(err => {
                        console.warn('Preload failed:', err);
                    });
                }
            });
        });
    };
    return {
        onHoverPreload,
        onViewportPreload,
        onIdlePreload,
        preloadedComponents
    };
}
/**
 * 代码分割统计
 */
export function useChunkStats() {
    const chunkSizes = ref(new Map());
    const loadTimes = ref(new Map());
    /**
     * 记录chunk大小
     */
    const recordChunkSize = (chunkName, size) => {
        chunkSizes.value.set(chunkName, size);
    };
    /**
     * 记录加载时间
     */
    const recordLoadTime = (chunkName, time) => {
        loadTimes.value.set(chunkName, time);
    };
    /**
     * 获取统计信息
     */
    const getStats = () => {
        return {
            totalChunks: chunkSizes.value.size,
            totalSize: Array.from(chunkSizes.value.values()).reduce((sum, size) => sum + size, 0),
            avgLoadTime: Array.from(loadTimes.value.values()).reduce((sum, time) => sum + time, 0) / loadTimes.value.size || 0,
            chunks: Array.from(chunkSizes.value.entries()).map(([name, size]) => ({
                name,
                size,
                loadTime: loadTimes.value.get(name) || 0
            }))
        };
    };
    return {
        recordChunkSize,
        recordLoadTime,
        getStats,
        chunkSizes,
        loadTimes
    };
}
