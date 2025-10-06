import { http } from './http-client'

// ========== 类型定义 ==========

export interface GenerationHistoryDto {
  id: string
  userId: string
  mode: string
  templateName: string | null
  projectName: string
  entityCount: number
  generatedFileCount: number
  generationDuration: number
  status: string
  errorMessage: string | null
  creationTime: string
}

export interface CreateGenerationHistoryDto {
  mode: string
  templateName?: string
  projectName: string
  entityCount: number
  generatedFileCount: number
  generationDuration: number
  status: string
  errorMessage?: string
  metadata?: string
}

// ========== API客户端 ==========

/**
 * 生成历史API
 */
export const generationHistoryApi = {
  /**
   * 获取最近的项目列表
   */
  async getRecentProjects(limit: number = 5): Promise<GenerationHistoryDto[]> {
    return await http.get<GenerationHistoryDto[]>(`/api/code-gen/generation-history/recent?limit=${limit}`)
  },
  
  /**
   * 获取所有项目列表（分页）
   */
  async getAllProjects(skipCount: number = 0, maxResultCount: number = 20): Promise<GenerationHistoryDto[]> {
    return await http.get<GenerationHistoryDto[]>(
      `/api/code-gen/generation-history/all?skipCount=${skipCount}&maxResultCount=${maxResultCount}`
    )
  },
  
  /**
   * 创建生成历史记录
   */
  async createHistory(input: CreateGenerationHistoryDto): Promise<GenerationHistoryDto> {
    return await http.post<GenerationHistoryDto>('/api/code-gen/generation-history', input)
  },
  
  /**
   * 删除项目历史
   */
  async deleteProject(id: string): Promise<void> {
    return await http.delete(`/api/code-gen/generation-history/${id}`)
  }
}

