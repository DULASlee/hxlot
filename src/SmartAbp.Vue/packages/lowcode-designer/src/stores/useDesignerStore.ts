/**
 * 低代码设计器状态管理Store
 * 
 * 功能：
 * - 管理设计器全局状态
 * - 组件选择和操作
 * - 撤销/重做历史
 * - 项目管理
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CanvasComponent } from '@smartabp/lowcode-shared/types/designer'

export const useDesignerStore = defineStore('lowcode-designer', () => {
    // ==================== 状态 ====================

    // 当前项目信息
    const currentProject = ref({
        id: '',
        name: '未命名项目',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })

    // 画布组件列表
    const canvasComponents = ref<CanvasComponent[]>([])

    // 当前选中的组件
    const selectedComponentId = ref<string | null>(null)

    // 设计器模式
    const designerMode = ref<'design' | 'preview' | 'code'>('design')

    // 历史记录（撤销/重做）
    const history = ref<Array<{ components: CanvasComponent[]; timestamp: number }>>([])
    const historyIndex = ref(-1)
    const maxHistorySize = 50

    // 脏标记（是否有未保存的更改）
    const isDirty = ref(false)

    // 网格设置
    const gridSettings = ref({
        enabled: true,
        size: 10,
        visible: true
    })

    // 缩放设置
    const zoomLevel = ref(100) // 百分比

    // ==================== 计算属性 ====================

    // 当前选中的组件对象
    const selectedComponent = computed(() => {
        if (!selectedComponentId.value) return null
        return canvasComponents.value.find(c => c.id === selectedComponentId.value) || null
    })

    // 是否可以撤销
    const canUndo = computed(() => historyIndex.value > 0)

    // 是否可以重做
    const canRedo = computed(() => historyIndex.value < history.value.length - 1)

    // 组件数量
    const componentCount = computed(() => canvasComponents.value.length)

    // ==================== 方法 ====================

    // 添加组件
    const addComponent = (component: CanvasComponent) => {
        canvasComponents.value.push(component)
        saveHistory()
        isDirty.value = true
    }

    // 更新组件
    const updateComponent = (componentId: string, updates: Partial<CanvasComponent>) => {
        const index = canvasComponents.value.findIndex(c => c.id === componentId)
        if (index >= 0) {
            canvasComponents.value[index] = {
                ...canvasComponents.value[index],
                ...updates
            }
            saveHistory()
            isDirty.value = true
        }
    }

    // 删除组件
    const deleteComponent = (componentId: string) => {
        const index = canvasComponents.value.findIndex(c => c.id === componentId)
        if (index >= 0) {
            canvasComponents.value.splice(index, 1)
            if (selectedComponentId.value === componentId) {
                selectedComponentId.value = null
            }
            saveHistory()
            isDirty.value = true
        }
    }

    // 选择组件
    const selectComponent = (componentId: string | null) => {
        selectedComponentId.value = componentId
    }

    // 清空选择
    const clearSelection = () => {
        selectedComponentId.value = null
    }

    // 保存历史记录
    const saveHistory = () => {
        // 如果不在最新状态，删除后面的历史
        if (historyIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, historyIndex.value + 1)
        }

        // 添加新历史
        history.value.push({
            components: JSON.parse(JSON.stringify(canvasComponents.value)),
            timestamp: Date.now()
        })

        // 限制历史大小
        if (history.value.length > maxHistorySize) {
            history.value.shift()
        } else {
            historyIndex.value++
        }
    }

    // 撤销
    const undo = () => {
        if (canUndo.value) {
            historyIndex.value--
            canvasComponents.value = JSON.parse(
                JSON.stringify(history.value[historyIndex.value].components)
            )
            isDirty.value = true
        }
    }

    // 重做
    const redo = () => {
        if (canRedo.value) {
            historyIndex.value++
            canvasComponents.value = JSON.parse(
                JSON.stringify(history.value[historyIndex.value].components)
            )
            isDirty.value = true
        }
    }

    // 保存项目
    const saveProject = async () => {
        // TODO: 实现保存到服务器的逻辑
        console.log('保存项目:', currentProject.value)
        isDirty.value = false
        return Promise.resolve()
    }

    // 加载项目
    const loadProject = async (projectId: string) => {
        // TODO: 实现从服务器加载的逻辑
        console.log('加载项目:', projectId)
        return Promise.resolve()
    }

    // 新建项目
    const newProject = () => {
        currentProject.value = {
            id: `project_${Date.now()}`,
            name: '未命名项目',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        canvasComponents.value = []
        selectedComponentId.value = null
        history.value = []
        historyIndex.value = -1
        isDirty.value = false

        // 保存初始状态
        saveHistory()
    }

    // 切换设计器模式
    const setDesignerMode = (mode: 'design' | 'preview' | 'code') => {
        designerMode.value = mode
    }

    // 切换网格
    const toggleGrid = () => {
        gridSettings.value.enabled = !gridSettings.value.enabled
    }

    // 设置网格大小
    const setGridSize = (size: number) => {
        gridSettings.value.size = size
    }

    // 设置缩放级别
    const setZoomLevel = (level: number) => {
        zoomLevel.value = Math.max(10, Math.min(200, level))
    }

    // 重置缩放
    const resetZoom = () => {
        zoomLevel.value = 100
    }

    // 清空画布
    const clearCanvas = () => {
        canvasComponents.value = []
        selectedComponentId.value = null
        saveHistory()
        isDirty.value = true
    }

    // 初始化
    const initialize = () => {
        newProject()
    }

    return {
        // 状态
        currentProject,
        canvasComponents,
        selectedComponentId,
        designerMode,
        isDirty,
        gridSettings,
        zoomLevel,

        // 计算属性
        selectedComponent,
        canUndo,
        canRedo,
        componentCount,

        // 方法
        addComponent,
        updateComponent,
        deleteComponent,
        selectComponent,
        clearSelection,
        undo,
        redo,
        saveProject,
        loadProject,
        newProject,
        setDesignerMode,
        toggleGrid,
        setGridSize,
        setZoomLevel,
        resetZoom,
        clearCanvas,
        initialize
    }
})

