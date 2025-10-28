import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '@/api/generated'
import type {
    CodeGenerationResultDto,
    CodeGenerationTaskDto,
    MESGeneratorConfigDto,
    UniAppGeneratorConfigDto
} from '@/types/code-generation.types'
import http from '@/utils/http'

// 定义通用分页请求参数类型
export interface PagedAndSortedResultRequestDto {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
}

// 类型别名
export type PagedResultDto<T> = Volo_Abp_Application_Dtos_PagedResultDto_1

/**
 * 代码生成API
 */
export const codeGenerationApi = {
    /**
     * 获取任务列表
     */
    getList(params: PagedAndSortedResultRequestDto) {
        return http.get<PagedResultDto<CodeGenerationTaskDto>>('/api/code-generation/tasks', { params })
    },

    /**
     * 获取单个任务
     */
    get(id: string) {
        return http.get<CodeGenerationTaskDto>(`/api/code-generation/tasks/${id}`)
    },

    /**
     * 生成MES大屏
     */
    generateMESDashboard(config: MESGeneratorConfigDto) {
        return http.post<CodeGenerationResultDto>('/api/code-generation/generate/mes-dashboard', config)
    },

    /**
     * 生成UniApp移动应用
     */
    generateUniApp(config: UniAppGeneratorConfigDto) {
        return http.post<CodeGenerationResultDto>('/api/code-generation/generate/uniapp', config)
    },

    /**
     * 删除任务
     */
    delete(id: string) {
        return http.delete(`/api/code-generation/tasks/${id}`)
    }
}

