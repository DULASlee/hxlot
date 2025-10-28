import { codeGenerationApi } from '@/api/code-generation-api'
import type {
    CodeGenerationResultDto,
    CodeGenerationTaskDto,
    MESGeneratorConfigDto,
    UniAppGeneratorConfigDto
} from '@/types/code-generation.types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCodeGenerationStore = defineStore('codeGeneration', () => {
    const tasks = ref<CodeGenerationTaskDto[]>([])
    const currentTask = ref<CodeGenerationTaskDto | null>(null)
    const loading = ref(false)

    /**
     * 获取任务列表
     */
    async function fetchTasks() {
        loading.value = true
        try {
            const result = await codeGenerationApi.getList({
                skipCount: 0,
                maxResultCount: 100
            })
            tasks.value = result.items as CodeGenerationTaskDto[]
        } finally {
            loading.value = false
        }
    }

    /**
     * 生成MES大屏
     */
    async function generateMESDashboard(config: MESGeneratorConfigDto): Promise<CodeGenerationResultDto> {
        loading.value = true
        try {
            const result = await codeGenerationApi.generateMESDashboard(config)
            await fetchTasks() // 刷新任务列表
            return result
        } finally {
            loading.value = false
        }
    }

    /**
     * 生成UniApp移动应用
     */
    async function generateUniApp(config: UniAppGeneratorConfigDto): Promise<CodeGenerationResultDto> {
        loading.value = true
        try {
            const result = await codeGenerationApi.generateUniApp(config)
            await fetchTasks() // 刷新任务列表
            return result
        } finally {
            loading.value = false
        }
    }

    return {
        tasks,
        currentTask,
        loading,
        fetchTasks,
        generateMESDashboard,
        generateUniApp
    }
})

