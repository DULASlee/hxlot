/**
 * 低代码模块API封装
 * 提供前端友好的API接口
 */
import { ModuleService } from '@/api/generated/services/ModuleService'
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto } from '@/api/generated'

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
      undefined, // filter
      undefined, // status
      true, // isActive: 只获取活跃模块
      'lastModificationTime desc', // sorting: 按最后修改时间倒序
      0, // skipCount
      count // maxResultCount
    )

    return (result.items as SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto[]) ?? []
  } catch (error) {
    console.error('获取最近访问模块失败:', error)
    return []
  }
}

/**
 * 获取用户选择统计数据
 * TODO: 等待后端实现真实API，当前返回模拟数据
 */
export const getUserChoiceStats = async (): Promise<UserChoiceStatsDto | null> => {
  try {
    // TODO: 替换为真实API调用
    // const result = await ModuleService.getUserChoiceStats()

    // 模拟数据（用于开发阶段）
    const mockData: UserChoiceStatsDto = {
      totalModules: 12,
      activeModules: 8,
      todayNewModules: 2,
      layer1Percentage: 35,
      layer2Percentage: 45,
      layer3Percentage: 20
    }

    return mockData
  } catch (error) {
    console.error('获取用户选择统计失败:', error)
    return null
  }
}

/**
 * 获取模块详情
 */
export const getModuleById = (id: string) => {
  return ModuleService.getApiLowcodeModules1(id)
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
    params?.filter,
    params?.status,
    params?.isActive,
    params?.sorting,
    params?.skipCount,
    params?.maxResultCount
  )
}

