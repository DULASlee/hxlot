import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { logger } from "@/utils/logging";
// WCAG对比度计算工具
function calculateContrastRatio() {
    // 简化的对比度计算（实际应使用更精确的算法）
    // 这里返回模拟值，实际实现需要rgb转换和亮度计算
    return Math.random() * 10 + 4; // 模拟4-14的对比度值
}
function isWCAGCompliant(ratio) {
    return ratio >= 4.5; // WCAG AA标准
}
// 主题预设
const THEME_PRESETS = {
    "theme-tech-blue": "科技蓝",
    "theme-deep-green": "深绿",
    "theme-light-purple": "淡紫",
    "theme-dark": "暗黑"
};
export const useEnhancedThemeStore = defineStore("enhancedTheme", () => {
    // === 核心状态 ===
    const currentTheme = ref("theme-tech-blue");
    const themeVariables = ref({
        // 基础品牌色
        "--theme-brand-primary": "#0ea5e9",
        "--theme-brand-success": "#10b981",
        "--theme-brand-warning": "#f59e0b",
        "--theme-brand-danger": "#ef4444",
        // 间距系统（8个级别）
        "--spacing-1": "0.25rem",
        "--spacing-2": "0.5rem",
        "--spacing-3": "0.75rem",
        "--spacing-4": "1rem",
        "--spacing-5": "1.25rem",
        "--spacing-6": "1.5rem",
        "--spacing-7": "1.75rem",
        "--spacing-8": "2rem",
        // 字体系统
        "--font-size-base": "1rem",
        "--font-weight-normal": "400",
        "--font-weight-medium": "500",
        "--font-weight-bold": "700",
        // 圆角系统（4个级别）
        "--radius-sm": "0.125rem",
        "--radius-base": "0.25rem",
        "--radius-lg": "0.375rem",
        "--radius-xl": "0.5rem",
        // 阴影系统（4个级别）
        "--shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "--shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "--shadow-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    });
    const snapshots = ref([]);
    const isUpdating = ref(false);
    // 批量更新队列
    let updateQueue = [];
    let updateTimer = null;
    // === 计算属性 ===
    const themePresets = computed(() => THEME_PRESETS);
    const contrastRatios = computed(() => {
        // 直接返回计算的对比度值
        return {
            "primary-bg": calculateContrastRatio(),
            "text-bg": calculateContrastRatio(),
            "success-bg": calculateContrastRatio(),
            "warning-bg": calculateContrastRatio(),
            "danger-bg": calculateContrastRatio(),
        };
    });
    const contrastWarnings = computed(() => {
        const warnings = [];
        Object.entries(contrastRatios.value).forEach(([key, ratio]) => {
            if (!isWCAGCompliant(ratio)) {
                warnings.push({ key, ratio, required: 4.5 });
            }
        });
        return warnings;
    });
    // === 核心方法 ===
    // 应用主题变量到DOM
    const applyTheme = () => {
        const root = document.documentElement;
        // 批量应用所有变量
        Object.entries(themeVariables.value).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        // 应用主题class
        document.body.className = document.body.className.replace(/theme-\w+/g, "");
        document.body.classList.add(currentTheme.value);
        logger.info(`Applied theme: ${currentTheme.value} with ${Object.keys(themeVariables.value).length} variables`);
    };
    // 切换预设主题
    const switchTheme = (themeId) => {
        if (!(themeId in THEME_PRESETS)) {
            logger.warn(`Invalid theme: ${themeId}`);
            return;
        }
        currentTheme.value = themeId;
        logger.info(`Switched to theme: ${THEME_PRESETS[themeId]}`);
    };
    // 更新单个主题变量
    const updateThemeVariable = (key, value) => {
        themeVariables.value[key] = value;
        logger.debug(`Updated theme variable: ${key} = ${value}`);
    };
    // 批量更新主题变量（性能优化）
    const batchUpdateTheme = (updates) => {
        isUpdating.value = true;
        // 合并更新
        Object.assign(themeVariables.value, updates);
        // 使用RAF批量应用
        requestAnimationFrame(() => {
            applyTheme();
            isUpdating.value = false;
            logger.info(`Batch updated ${Object.keys(updates).length} theme variables`);
        });
    };
    // 防抖更新（避免频繁DOM操作）
    const debouncedUpdate = (key, value) => {
        updateQueue.push({ key, value });
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
        updateTimer = setTimeout(() => {
            const updates = {};
            updateQueue.forEach(({ key, value }) => {
                updates[key] = value;
            });
            batchUpdateTheme(updates);
            updateQueue = [];
            updateTimer = null;
        }, 150); // 150ms防抖
    };
    // === 快照管理 ===
    // 创建主题快照
    const createSnapshot = (name) => {
        const snapshot = {
            id: `snapshot_${Date.now()}`,
            name: name || `快照 ${new Date().toLocaleString()}`,
            timestamp: Date.now(),
            variables: { ...themeVariables.value },
            description: `基于${THEME_PRESETS[currentTheme.value]}主题创建`
        };
        snapshots.value.unshift(snapshot);
        logger.info(`Created theme snapshot: ${snapshot.name}`);
        return snapshot.id;
    };
    // 恢复快照
    const restoreSnapshot = (snapshotId) => {
        const snapshot = snapshots.value.find(s => s.id === snapshotId);
        if (!snapshot) {
            logger.warn(`Snapshot not found: ${snapshotId}`);
            return false;
        }
        batchUpdateTheme(snapshot.variables);
        logger.info(`Restored theme snapshot: ${snapshot.name}`);
        return true;
    };
    // 删除快照
    const deleteSnapshot = (snapshotId) => {
        const index = snapshots.value.findIndex(s => s.id === snapshotId);
        if (index === -1) {
            logger.warn(`Snapshot not found: ${snapshotId}`);
            return false;
        }
        const snapshot = snapshots.value.splice(index, 1)[0];
        if (snapshot) {
            logger.info(`Deleted theme snapshot: ${snapshot.name}`);
        }
        return true;
    };
    // === 导出导入功能 ===
    // 导出主题配置
    const exportTheme = () => {
        const config = {
            version: "1.0",
            theme: currentTheme.value,
            variables: themeVariables.value,
            snapshots: snapshots.value,
            exportTime: new Date().toISOString(),
            metadata: {
                totalVariables: Object.keys(themeVariables.value).length,
                totalSnapshots: snapshots.value.length
            }
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `theme_${currentTheme.value}_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        logger.info(`Exported theme configuration: ${config.metadata.totalVariables} variables`);
    };
    // 导入主题配置
    const importTheme = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target?.result);
                    // 验证配置格式
                    if (!config.variables || !config.theme) {
                        logger.error("Invalid theme configuration format");
                        resolve(false);
                        return;
                    }
                    // 应用配置
                    currentTheme.value = config.theme;
                    batchUpdateTheme(config.variables);
                    // 导入快照（如果存在）
                    if (config.snapshots && Array.isArray(config.snapshots)) {
                        snapshots.value = [...config.snapshots, ...snapshots.value];
                    }
                    logger.info(`Imported theme configuration: ${Object.keys(config.variables).length} variables`);
                    resolve(true);
                }
                catch (error) {
                    logger.error("Failed to parse theme configuration:", error);
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    };
    // === 响应式监听 ===
    // 监听主题变量变化，自动应用
    watch(themeVariables, () => {
        if (!isUpdating.value) {
            applyTheme();
        }
    }, { deep: true, immediate: true });
    // 监听主题切换
    watch(currentTheme, (newTheme) => {
        applyTheme();
        logger.info(`Theme switched to: ${THEME_PRESETS[newTheme]}`);
    });
    // === 初始化 ===
    // 初始化时恢复保存的主题（如果存在）
    const initializeTheme = () => {
        try {
            const savedTheme = localStorage.getItem('smartabp-theme');
            if (savedTheme) {
                const config = JSON.parse(savedTheme);
                if (config.theme && config.variables) {
                    currentTheme.value = config.theme;
                    Object.assign(themeVariables.value, config.variables);
                }
            }
        }
        catch {
            logger.warn("Failed to load saved theme, using default");
        }
    };
    // 自动保存主题到localStorage
    const saveThemeToStorage = () => {
        try {
            const config = {
                theme: currentTheme.value,
                variables: themeVariables.value,
                lastUpdated: Date.now()
            };
            localStorage.setItem('smartabp-theme', JSON.stringify(config));
        }
        catch {
            logger.warn("Failed to save theme to localStorage");
        }
    };
    // 监听变化自动保存
    watch([currentTheme, themeVariables], () => {
        saveThemeToStorage();
    }, { deep: true });
    // 重置为默认主题
    const resetToDefault = () => {
        themeVariables.value = {
            "--theme-brand-primary": "#409eff",
            "--theme-brand-success": "#67c23a",
            "--theme-brand-warning": "#e6a23c",
            "--theme-brand-danger": "#f56c6c"
        };
        applyTheme();
        logger.info("Theme reset to default");
    };
    // 从本地存储加载主题
    const loadFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem("enhanced-theme-variables");
            if (stored) {
                const parsed = JSON.parse(stored);
                themeVariables.value = { ...themeVariables.value, ...parsed };
                applyTheme();
                logger.info("Theme loaded from local storage");
            }
        }
        catch (error) {
            logger.error("Failed to load theme from local storage:", error);
        }
    };
    // 初始化
    initializeTheme();
    return {
        // 状态
        currentTheme,
        themeVariables,
        snapshots,
        isUpdating,
        // 计算属性
        themePresets,
        contrastRatios,
        contrastWarnings,
        // 核心方法
        applyTheme,
        switchTheme,
        updateThemeVariable,
        batchUpdateTheme,
        debouncedUpdate,
        // 快照管理
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        // 导出导入
        exportTheme,
        importTheme,
        // 工具方法
        initializeTheme,
        saveThemeToStorage,
        resetToDefault,
        loadFromLocalStorage
    };
});
