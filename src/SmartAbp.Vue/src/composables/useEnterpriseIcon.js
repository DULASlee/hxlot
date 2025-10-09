/**
 * 🏢 SmartAbp 企业级图标系统 Composable
 * 🎯 统一的图标使用和管理逻辑
 * ⚡ 响应式图标状态和性能优化
 * 🎨 企业级主题和样式管理
 */
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { iconManager, IconCategory } from '@/components/icons/IconManager';
/**
 * 🎯 企业级图标使用 Hook
 * @param options 图标配置选项
 * @returns 图标使用工具函数和响应式状态
 */
export function useEnterpriseIcon(options) {
    // 📊 响应式状态
    const isLoading = ref(false);
    const isLoaded = ref(false);
    const error = ref(null);
    const iconConfig = ref(null);
    // 🔧 获取图标管理器实例
    const manager = inject('iconManager', iconManager);
    // 🎯 图标组件计算属性
    const iconComponent = computed(() => {
        if (!iconConfig.value)
            return null;
        return iconConfig.value.component;
    });
    // 🎨 图标样式计算属性
    const iconStyles = computed(() => {
        const styles = {};
        // 设置尺寸
        if (typeof options.size === 'number') {
            styles.width = `${options.size}px`;
            styles.height = `${options.size}px`;
        }
        else {
            styles.width = `var(--enterprise-icon-size-${options.size || 'md'})`;
            styles.height = `var(--enterprise-icon-size-${options.size || 'md'})`;
        }
        // 设置颜色
        if (options.color) {
            if (['primary', 'success', 'warning', 'danger', 'info', 'text'].includes(options.color)) {
                styles.color = `var(--enterprise-icon-color-${options.color})`;
            }
            else {
                styles.color = options.color;
            }
        }
        return styles;
    });
    // 🎨 图标类名计算属性
    const iconClasses = computed(() => {
        const classes = ['enterprise-icon'];
        if (options.variant) {
            classes.push(`enterprise-icon--${options.variant}`);
        }
        if (options.animated) {
            classes.push('enterprise-icon--animated');
        }
        return classes;
    });
    // 📦 加载图标
    const loadIcon = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const config = manager.getIcon(options.name);
            if (!config) {
                throw new Error(`未找到图标: ${options.name}`);
            }
            iconConfig.value = config;
            // 预加载图标组件
            if (options.preload && typeof config.component === 'function') {
                const asyncComponent = config.component;
                await asyncComponent();
            }
            isLoaded.value = true;
            console.log(`✅ 图标加载成功: ${options.name}`);
        }
        catch (err) {
            error.value = err instanceof Error ? err : new Error('图标加载失败');
            console.error(`❌ 图标加载失败: ${options.name}`, err);
            // 尝试加载回退图标
            if (options.fallback) {
                try {
                    const fallbackConfig = manager.getIcon(options.fallback);
                    if (fallbackConfig) {
                        iconConfig.value = fallbackConfig;
                        isLoaded.value = true;
                        console.log(`🔄 使用回退图标: ${options.fallback}`);
                    }
                }
                catch {
                    console.error(`❌ 回退图标加载失败: ${options.fallback}`);
                }
            }
        }
        finally {
            isLoading.value = false;
        }
    };
    // 🔄 重新加载图标
    const reloadIcon = async () => {
        isLoaded.value = false;
        iconConfig.value = null;
        await loadIcon();
    };
    // 🧹 清理资源
    const cleanup = () => {
        isLoading.value = false;
        isLoaded.value = false;
        error.value = null;
        iconConfig.value = null;
    };
    // 🎯 生命周期钩子
    onMounted(() => {
        loadIcon();
    });
    onUnmounted(() => {
        cleanup();
    });
    return {
        // 状态
        isLoading: readonly(isLoading),
        isLoaded: readonly(isLoaded),
        error: readonly(error),
        iconConfig: readonly(iconConfig),
        // 计算属性
        iconComponent,
        iconStyles,
        iconClasses,
        // 方法
        loadIcon,
        reloadIcon,
        cleanup
    };
}
/**
 * 🔍 图标搜索 Hook
 * @returns 图标搜索工具函数和响应式状态
 */
export function useIconSearch() {
    // 📊 响应式状态
    const isSearching = ref(false);
    const searchResults = ref([]);
    const totalResults = ref(0);
    // 🔧 获取图标管理器实例
    const manager = inject('iconManager', iconManager);
    // 🔍 搜索图标
    const searchIcons = async (options) => {
        isSearching.value = true;
        try {
            let results = manager.searchIcons(options.query);
            // 按分类筛选
            if (options.category) {
                results = results.filter(icon => icon.category === options.category);
            }
            // 只搜索企业级图标
            if (options.enterpriseOnly) {
                results = results.filter(icon => icon.enterprise);
            }
            // 限制结果数量
            if (options.limit && options.limit > 0) {
                results = results.slice(0, options.limit);
            }
            searchResults.value = results;
            totalResults.value = results.length;
            console.log(`🔍 图标搜索完成: ${results.length} 个结果`);
        }
        catch (error) {
            console.error('❌ 图标搜索失败:', error);
            searchResults.value = [];
            totalResults.value = 0;
        }
        finally {
            isSearching.value = false;
        }
    };
    // 🧹 清空搜索结果
    const clearSearch = () => {
        searchResults.value = [];
        totalResults.value = 0;
    };
    // 📋 获取分类图标
    const getIconsByCategory = (category) => {
        return manager.getIconsByCategory(category);
    };
    // 📋 获取所有图标
    const getAllIcons = () => {
        return Array.from(manager.getAllIcons().values());
    };
    return {
        // 状态
        isSearching: readonly(isSearching),
        searchResults: readonly(searchResults),
        totalResults: readonly(totalResults),
        // 方法
        searchIcons,
        clearSearch,
        getIconsByCategory,
        getAllIcons
    };
}
/**
 * 🎨 图标主题管理 Hook
 * @returns 主题管理工具函数和响应式状态
 */
export function useIconTheme() {
    // 📊 响应式状态
    const currentTheme = ref(iconManager.getCurrentTheme());
    const isUpdating = ref(false);
    // 🔧 获取图标管理器实例
    const manager = inject('iconManager', iconManager);
    // 🎨 更新主题
    const updateTheme = async (theme) => {
        isUpdating.value = true;
        try {
            manager.setTheme(theme);
            currentTheme.value = manager.getCurrentTheme();
            console.log(`🎨 图标主题已更新: ${theme.name || 'custom'}`);
        }
        catch (error) {
            console.error('❌ 图标主题更新失败:', error);
        }
        finally {
            isUpdating.value = false;
        }
    };
    // 🔄 重置为默认主题
    const resetTheme = () => {
        updateTheme({
            name: 'enterprise',
            colors: {
                primary: '#409EFF',
                success: '#67C23A',
                warning: '#E6A23C',
                danger: '#F56C6C',
                info: '#909399',
                text: '#303133'
            }
        });
    };
    // 🌓 切换暗色主题
    const toggleDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            // 切换到亮色主题
            updateTheme({
                name: 'enterprise-light',
                colors: {
                    primary: '#409EFF',
                    success: '#67C23A',
                    warning: '#E6A23C',
                    danger: '#F56C6C',
                    info: '#909399',
                    text: '#303133'
                }
            });
        }
        else {
            // 切换到暗色主题
            updateTheme({
                name: 'enterprise-dark',
                colors: {
                    primary: '#529de6',
                    success: '#7cd95a',
                    warning: '#e8b563',
                    danger: '#f78989',
                    info: '#a6a9ad',
                    text: '#e4e7ed'
                }
            });
        }
    };
    return {
        // 状态
        currentTheme: readonly(currentTheme),
        isUpdating: readonly(isUpdating),
        // 方法
        updateTheme,
        resetTheme,
        toggleDarkMode
    };
}
/**
 * 📊 图标使用统计 Hook
 * @returns 统计数据工具函数和响应式状态
 */
export function useIconStats() {
    // 📊 响应式状态
    const stats = ref({
        totalIcons: 0,
        loadedIcons: 0,
        categoryStats: {},
        mostUsedIcons: []
    });
    const isLoading = ref(false);
    // 🔧 获取图标管理器实例
    const manager = inject('iconManager', iconManager);
    // 📊 更新统计数据
    const updateStats = async () => {
        isLoading.value = true;
        try {
            const managerStats = manager.getUsageStats();
            stats.value = {
                totalIcons: managerStats.totalIcons,
                loadedIcons: managerStats.loadedIcons,
                categoryStats: managerStats.categoryStats,
                mostUsedIcons: [] // TODO: 实现使用频率统计
            };
            console.log('📊 图标统计数据已更新');
        }
        catch (error) {
            console.error('❌ 图标统计数据更新失败:', error);
        }
        finally {
            isLoading.value = false;
        }
    };
    // 🧹 清理统计数据
    const clearStats = () => {
        manager.cleanup();
        updateStats();
    };
    // 🎯 生命周期钩子
    onMounted(() => {
        updateStats();
    });
    return {
        // 状态
        stats: readonly(stats),
        isLoading: readonly(isLoading),
        // 方法
        updateStats,
        clearStats
    };
}
// 🔧 工具函数
export function readonly(ref) {
    return computed(() => ref.value);
}
// 📝 使用说明
/*
🏢 企业级图标系统 Composable 使用指南:

1. 🎯 基本图标使用:
   const { iconComponent, iconStyles, isLoaded } = useEnterpriseIcon({
     name: 'dashboard',
     size: 'lg',
     color: 'primary',
     animated: true
   })

2. 🔍 图标搜索:
   const { searchIcons, searchResults } = useIconSearch()
   await searchIcons({ query: '用户', category: IconCategory.USER })

3. 🎨 主题管理:
   const { updateTheme, toggleDarkMode } = useIconTheme()
   updateTheme({ colors: { primary: '#ff6b6b' } })

4. 📊 使用统计:
   const { stats, updateStats } = useIconStats()
   console.log(`总图标数: ${stats.value.totalIcons}`)
*/
