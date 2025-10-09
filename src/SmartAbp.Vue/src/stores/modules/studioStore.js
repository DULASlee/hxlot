import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
export const useStudioStore = defineStore('lowcode-studio', () => {
    // 全局工作区状态
    const currentWorkspace = ref(null);
    const menuCollapsed = ref(false);
    const activeModule = ref('modeling');
    const showPropertyPanel = ref(true);
    // 统一的加载状态管理
    const loadingStates = reactive({
        global: false,
        modules: {}
    });
    // 错误收集
    const errors = ref([]);
    // Actions
    function setLoading(module, state) {
        loadingStates.modules[module] = state;
    }
    function setGlobalLoading(state) {
        loadingStates.global = state;
    }
    function captureError(error) {
        errors.value.push({
            ...error,
            timestamp: new Date()
        });
    }
    function switchModule(module) {
        activeModule.value = module;
    }
    function toggleMenu() {
        menuCollapsed.value = !menuCollapsed.value;
    }
    function togglePropertyPanel() {
        showPropertyPanel.value = !showPropertyPanel.value;
    }
    return {
        // State
        currentWorkspace,
        menuCollapsed,
        activeModule,
        loadingStates,
        errors,
        showPropertyPanel,
        // Actions
        setLoading,
        setGlobalLoading,
        captureError,
        switchModule,
        toggleMenu,
        togglePropertyPanel,
    };
});
