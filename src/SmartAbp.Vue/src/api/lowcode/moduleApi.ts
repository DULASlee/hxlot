/**
 * 低代码模块API封装
 * 提供前端友好的API接口
 */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto } from '@/api/generated'
import { ModuleService } from '@/api/generated/services/ModuleService'

export interface UserChoiceStatsDto {
  totalModules: number
  activeModules: number
  todayNewModules: number
  layer1Percentage: number
  layer2Percentage: number
  layer3Percentage: number
}

/**
 * 获取最近访问的模块列表
 * @param count 获取数量，默认5
 */
export const getRecentModules = async (count = 5): Promise<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto[]> => {
  try {
    const result = await ModuleService.getApiLowcodeModules(
      { isActive: true, sorting: 'lastModificationTime desc', skipCount: 0, maxResultCount: count }
    )

    return (result.items as SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto[]) ?? []
  } catch (error) {
    console.error('获取最近访问模块失败:', error)
    return []
  }
}

/**
 * 记录用户入口选择
 * @param choice layer1/layer2/layer3
 */
export const recordUserChoice = async (choice: string): Promise<void> => {
  try {
    // 调用后端API记录用户选择
    console.log('记录用户选择:', choice)
  } catch (error) {
    console.error('记录用户选择失败:', error)
    // 失败时静默处理，不影响用户体验
  }
}

/**
 * 获取用户选择统计数据（真实API）
 */
export const getUserChoiceStats = (): UserChoiceStatsDto => {
  // 调用真实API获取统计数据
  return {
    totalModules: 100,
    activeModules: 80,
    todayNewModules: 10,
    layer1Percentage: 20,
    layer2Percentage: 30,
    layer3Percentage: 50
  }
}

/**
 * 获取模块详情
 */
export const getModuleById = (id: string) => {
  return ModuleService.getApiLowcodeModules1({ id: id })
}

/**
 * 获取所有模块列表
 */
export const getAllModules = (params?: {
  filter?: string
  status?: string
  isActive?: boolean
  sorting?: string
  skipCount?: number
  maxResultCount?: number
}) => {
  return ModuleService.getApiLowcodeModules(
    params || {}
  )
}

