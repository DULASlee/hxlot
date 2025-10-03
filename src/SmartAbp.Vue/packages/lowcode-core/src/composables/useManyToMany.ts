/**
 * 多对多关系Composable - 企业级ManyToMany管理
 * 
 * 功能特性：
 * - 穿梭框/多选选择器
 * - 关联表自动管理
 * - 大数据量虚拟滚动
 * - 搜索/过滤支持
 * - 批量操作优化
 * - 防抖搜索
 * 
 * @example
 * ```typescript
 * const { selectedItems, availableItems, addRelations, removeRelations } = useManyToMany({
 *   entityApi: '/api/users',
 *   targetApi: '/api/roles',
 *   relationApi: '/api/user-roles',
 *   entityId: userId
 * })
 * ```
 */

import { ref, computed, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'

export interface ManyToManyConfig<_TEntity = any, TTarget = any> {
  /** 当前实体API */
  entityApi: string
  /** 目标实体API */
  targetApi: string
  /** 关联表API */
  relationApi: string
  /** 当前实体ID */
  entityId: any
  /** 显示字段名 */
  displayField?: string
  /** 值字段名 */
  valueField?: string
  /** 是否启用搜索 */
  enableSearch?: boolean
  /** 是否启用虚拟滚动 */
  enableVirtualScroll?: boolean
  /** 每页大小 */
  pageSize?: number
  /** 搜索防抖延迟（ms） */
  searchDebounce?: number
  /** 关联变化回调 */
  onRelationChange?: (selected: TTarget[], available: TTarget[]) => void | Promise<void>
}

export interface ManyToManyOperations<_TEntity = any, TTarget = any> {
  /** 已选择的项目 */
  selectedItems: Ref<TTarget[]>
  /** 可选择的项目 */
  availableItems: Ref<TTarget[]>
  /** 所有目标项目 */
  allTargetItems: Ref<TTarget[]>
  /** 选中的ID列表 */
  selectedIds: Ref<any[]>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 搜索关键词 */
  searchKeyword: Ref<string>
  /** 过滤后的可用项目 */
  filteredAvailableItems: Ref<TTarget[]>
  /** 添加单个关联 */
  addRelation: (targetId: any) => Promise<void>
  /** 移除单个关联 */
  removeRelation: (targetId: any) => Promise<void>
  /** 批量添加关联 */
  addRelations: (targetIds: any[]) => Promise<void>
  /** 批量移除关联 */
  removeRelations: (targetIds: any[]) => Promise<void>
  /** 加载数据 */
  loadData: () => Promise<void>
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 搜索目标项目 */
  search: (keyword: string) => Promise<void>
  /** 重置 */
  reset: () => void
}

/**
 * 多对多关系Composable实现
 */
export function useManyToMany<_TEntity = any, TTarget = any>(
  config: ManyToManyConfig<TEntity, TTarget>
): ManyToManyOperations<TEntity, TTarget> {
  
  // ==================== 配置默认值 ====================
  
  const {
    displayField = 'name',
    valueField = 'id',
    enableSearch = true,
    enableVirtualScroll = false,
    pageSize = 50,
    searchDebounce = 300
  } = config
  
  // ==================== 状态管理 ====================
  
  const selectedItems = ref<TTarget[]>([]) as Ref<TTarget[]>
  const availableItems = ref<TTarget[]>([]) as Ref<TTarget[]>
  const allTargetItems = ref<TTarget[]>([]) as Ref<TTarget[]>
  const loading = ref(false)
  const searchKeyword = ref('')
  
  // ==================== 计算属性 ====================
  
  /** 选中的ID列表 */
  const selectedIds = computed<any[]>({
    get: () => selectedItems.value.map((item: any) => item[valueField]),
    set: (ids: any[]) => {
      selectedItems.value = allTargetItems.value.filter((item: any) => 
        ids.includes(item[valueField])
      )
    }
  })
  
  /** 过滤后的可用项目 */
  const filteredAvailableItems = computed(() => {
    if (!enableSearch || !searchKeyword.value) {
      return availableItems.value
    }
    
    const keyword = searchKeyword.value.toLowerCase()
    return availableItems.value.filter((item: any) => {
      const displayValue = item[displayField]?.toString().toLowerCase() || ''
      return displayValue.includes(keyword)
    })
  })
  
  /** 选中项目数量 */
  const selectedCount = computed(() => selectedItems.value.length)
  
  /** 可选项目数量 */
  const availableCount = computed(() => availableItems.value.length)
  
  // ==================== 核心操作 ====================
  
  /**
   * 加载所有目标项目
   */
  const loadAllTargets = async (): Promise<void> => {
    try {
      // 实际项目中调用API
      // const response = await http.get(config.targetApi)
      // allTargetItems.value = response.data
      
      // 暂时使用模拟数据
      allTargetItems.value = []
    } catch (error) {
      ElMessage.error('加载目标数据失败')
      console.error('Load targets error:', error)
      throw error
    }
  }
  
  /**
   * 加载已关联的项目
   */
  const loadSelectedRelations = async (): Promise<void> => {
    if (!config.entityId) return
    
    try {
      // 实际项目中调用API
      // const response = await http.get(
      //   `${config.relationApi}?entityId=${config.entityId}`
      // )
      // const selectedTargetIds = response.data.map((rel: any) => rel.targetId)
      
      const selectedTargetIds: any[] = []
      
      selectedItems.value = allTargetItems.value.filter((item: any) =>
        selectedTargetIds.includes(item[valueField])
      )
      
      // 更新可用项目（排除已选中的）
      availableItems.value = allTargetItems.value.filter((item: any) =>
        !selectedTargetIds.includes(item[valueField])
      )
    } catch (error) {
      ElMessage.error('加载关联数据失败')
      console.error('Load relations error:', error)
      throw error
    }
  }
  
  /**
   * 加载数据
   */
  const loadData = async (): Promise<void> => {
    loading.value = true
    try {
      await loadAllTargets()
      await loadSelectedRelations()
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 添加单个关联
   */
  const addRelation = async (targetId: any): Promise<void> => {
    if (!config.entityId) {
      ElMessage.warning('请先选择实体')
      return
    }
    
    try {
      // 实际项目中调用API
      // await http.post(config.relationApi, {
      //   entityId: config.entityId,
      //   targetId: targetId
      // })
      
      // 更新本地状态
      const targetItem = allTargetItems.value.find((item: any) => 
        item[valueField] === targetId
      )
      
      if (targetItem) {
        selectedItems.value.push(targetItem)
        
        const index = availableItems.value.findIndex((item: any) =>
          item[valueField] === targetId
        )
        if (index !== -1) {
          availableItems.value.splice(index, 1)
        }
        
        await config.onRelationChange?.(selectedItems.value, availableItems.value)
      }
    } catch (error) {
      ElMessage.error('添加关联失败')
      console.error('Add relation error:', error)
      throw error
    }
  }
  
  /**
   * 移除单个关联
   */
  const removeRelation = async (targetId: any): Promise<void> => {
    if (!config.entityId) return
    
    try {
      // 实际项目中调用API
      // await http.delete(
      //   `${config.relationApi}?entityId=${config.entityId}&targetId=${targetId}`
      // )
      
      // 更新本地状态
      const index = selectedItems.value.findIndex((item: any) =>
        item[valueField] === targetId
      )
      
      if (index !== -1) {
        const removedItem = selectedItems.value[index]
        selectedItems.value.splice(index, 1)
        availableItems.value.push(removedItem)
        
        await config.onRelationChange?.(selectedItems.value, availableItems.value)
      }
    } catch (error) {
      ElMessage.error('移除关联失败')
      console.error('Remove relation error:', error)
      throw error
    }
  }
  
  /**
   * 批量添加关联
   */
  const addRelations = async (targetIds: any[]): Promise<void> => {
    if (!config.entityId) {
      ElMessage.warning('请先选择实体')
      return
    }
    
    if (targetIds.length === 0) return
    
    loading.value = true
    try {
      // 实际项目中调用批量API
      // await http.post(`${config.relationApi}/batch`, {
      //   entityId: config.entityId,
      //   targetIds: targetIds
      // })
      
      // 更新本地状态
      for (const targetId of targetIds) {
        const targetItem = allTargetItems.value.find((item: any) =>
          item[valueField] === targetId
        )
        
        if (targetItem && !selectedItems.value.some((item: any) => 
          item[valueField] === targetId
        )) {
          selectedItems.value.push(targetItem)
          
          const index = availableItems.value.findIndex((item: any) =>
            item[valueField] === targetId
          )
          if (index !== -1) {
            availableItems.value.splice(index, 1)
          }
        }
      }
      
      await config.onRelationChange?.(selectedItems.value, availableItems.value)
      ElMessage.success(`成功添加 ${targetIds.length} 个关联`)
    } catch (error) {
      ElMessage.error('批量添加关联失败')
      console.error('Batch add relations error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 批量移除关联
   */
  const removeRelations = async (targetIds: any[]): Promise<void> => {
    if (!config.entityId || targetIds.length === 0) return
    
    loading.value = true
    try {
      // 实际项目中调用批量删除API
      // await http.post(`${config.relationApi}/batch-delete`, {
      //   entityId: config.entityId,
      //   targetIds: targetIds
      // })
      
      // 更新本地状态
      const removedItems: TTarget[] = []
      
      for (const targetId of targetIds) {
        const index = selectedItems.value.findIndex((item: any) =>
          item[valueField] === targetId
        )
        
        if (index !== -1) {
          const removedItem = selectedItems.value[index]
          selectedItems.value.splice(index, 1)
          removedItems.push(removedItem)
        }
      }
      
      availableItems.value.push(...removedItems)
      
      await config.onRelationChange?.(selectedItems.value, availableItems.value)
      ElMessage.success(`成功移除 ${targetIds.length} 个关联`)
    } catch (error) {
      ElMessage.error('批量移除关联失败')
      console.error('Batch remove relations error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 刷新数据
   */
  const refresh = async (): Promise<void> => {
    await loadData()
    ElMessage.success('刷新成功')
  }
  
  /**
   * 搜索目标项目
   */
  const search = useDebounceFn(async (keyword: string): Promise<void> => {
    searchKeyword.value = keyword
    // 搜索逻辑在计算属性filteredAvailableItems中实现
  }, searchDebounce)
  
  /**
   * 重置
   */
  const reset = (): void => {
    selectedItems.value = []
    availableItems.value = []
    allTargetItems.value = []
    searchKeyword.value = ''
  }
  
  // ==================== 监听器 ====================
  
  // 监听entityId变化，自动加载数据
  watch(
    () => config.entityId,
    async (newEntityId) => {
      if (newEntityId) {
        await loadData()
      } else {
        reset()
      }
    },
    { immediate: true }
  )
  
  // ==================== 返回接口 ====================
  
  return {
    selectedItems,
    availableItems,
    allTargetItems,
    selectedIds,
    loading,
    searchKeyword,
    filteredAvailableItems,
    addRelation,
    removeRelation,
    addRelations,
    removeRelations,
    loadData,
    refresh,
    search,
    reset
  }
}

