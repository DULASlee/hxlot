import { http } from './http-client'

// ========== 类型定义 ==========

export interface CodeGenStatsDto {
  totalProjects: number
  monthlyGenerations: number
  savedHours: number
  qualityScore: number
  lastUpdated: string
}

export interface UserProfileDto {
  id: string
  userId: string
  industry: string | null
  companyName: string | null
  companySize: string | null
  lastUsedMode: string | null
  isFirstVisit: boolean
}

export interface UpdateUserProfileDto {
  industry?: string
  companyName?: string
  companySize?: string
  lastUsedMode?: string
}

export interface IndustryRecommendationDto {
  template: string
  name: string
  reason: string
  benefits: string
}

// ========== API客户端 ==========

/**
 * 代码生成统计API
 */
export const codeGenStatsApi = {
  /**
   * 获取当前用户的统计数据
   */
  async getMyStats(): Promise<CodeGenStatsDto> {
    return await http.get<CodeGenStatsDto>('/api/code-gen/stats/my')
  }
}

/**
 * 用户配置API
 */
export const userProfileApi = {
  /**
   * 获取当前用户配置
   */
  async getMyProfile(): Promise<UserProfileDto> {
    return await http.get<UserProfileDto>('/api/code-gen/user-profile/my')
  },
  
  /**
   * 更新当前用户配置
   */
  async updateMyProfile(input: UpdateUserProfileDto): Promise<UserProfileDto> {
    return await http.put<UserProfileDto>('/api/code-gen/user-profile/my', input)
  },
  
  /**
   * 获取行业推荐
   */
  async getRecommendation(): Promise<IndustryRecommendationDto | null> {
    return await http.get<IndustryRecommendationDto>('/api/code-gen/user-profile/recommendation')
  }
}

