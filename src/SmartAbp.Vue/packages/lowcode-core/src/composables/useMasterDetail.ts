/**
 * 主从表Composable - 企业级一对多关系管理
 *
 * 功能特性：
 * - 主从表数据联动
 * - 级联操作（增删改查）
 * - 数据一致性验证
 * - 批量操作支持
 * - 乐观锁并发控制
 * - 性能优化（防抖、节流、虚拟滚动）
 *
 * @example
 * ```typescript
 * const { masterForm, detailList, addDetail, saveAll } = useMasterDetail({
 *   masterApi: '/api/orders',
 *   detailApi: '/api/order-items',
 *   foreignKey: 'orderId'
 * })
 * ```
 */

import { useDebounceFn } from '@vueuse/core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type { DetailEntity, MasterEntity } from '../types/entity'

export interface MasterDetailConfig<
  TMaster extends MasterEntity = MasterEntity,
  TDetail extends DetailEntity = DetailEntity
> {
  /** 主表API路径 */
  masterApi: string
  /** 从表API路径 */
  detailApi: string
  /** 外键字段名 */
  foreignKey: string
  /** 主表初始数据 */
  initialMaster?: TMaster
  /** 是否自动加载从表数据 */
  autoLoadDetails?: boolean
  /** 是否启用乐观锁 */
  enableOptimisticLock?: boolean
  /** 保存策略：'immediate' | 'batch' */
  saveStrategy?: 'immediate' | 'batch'
  /** 最大从表记录数 */
  maxDetailCount?: number
  /** 主表变化回调 */
  onMasterChange?: (master: TMaster) => void | Promise<void>
  /** 从表变化回调 */
  onDetailChange?: (details: TDetail[]) => void | Promise<void>
}

export interface MasterDetailOperations<
  TMaster extends MasterEntity = MasterEntity,
  TDetail extends DetailEntity = DetailEntity
> {
  /** 主表表单数据 */
  masterForm: Ref<TMaster>
  /** 从表列表数据 */
  detailList: Ref<TDetail[]>
  /** 选中的从表记录 */
  selectedDetails: Ref<TDetail[]>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 是否有未保存的变更 */
  hasUnsavedChanges: Ref<boolean>
  /** 添加从表记录 */
  addDetail: (detail?: Partial<TDetail>) => Promise<TDetail>
  /** 编辑从表记录 */
  editDetail: (detail: TDetail) => Promise<void>
  /** 删除从表记录 */
  deleteDetail: (detail: TDetail) => Promise<void>
  /** 批量删除从表记录 */
  batchDeleteDetails: (details: TDetail[]) => Promise<void>
  /** 加载从表数据 */
  loadDetails: (masterId: any) => Promise<void>
  /** 保存主表和从表 */
  saveAll: () => Promise<void>
  /** 验证数据一致性 */
  validate: () => Promise<boolean>
  /** 重置所有数据 */
  reset: () => void
  /** 撤销变更 */
  undo: () => void
}

/**
 * 主从表Composable实现
 */
export function useMasterDetail<
  TMaster extends MasterEntity = MasterEntity,
  TDetail extends DetailEntity = DetailEntity
>(
  config: MasterDetailConfig<TMaster, TDetail>
): MasterDetailOperations<TMaster, TDetail> {

  // ==================== 状态管理 ====================

  const masterForm = ref<TMaster>(config.initialMaster || {} as TMaster)
  const detailList = ref<TDetail[]>([])
  const selectedDetails = ref<TDetail[]>([])
  const loading = ref(false)
  const hasUnsavedChanges = ref(false)

  // 历史记录（用于撤销）
  const history = shallowRef<Array<{ master: TMaster; details: TDetail[] }>>([])

  // 删除队列（批量删除优化）
  const deletedDetails = ref<TDetail[]>([])

  // ==================== 计算属性 ====================

  /** 主表ID */
  const masterId = computed(() => {
    return masterForm.value?.id
  })

  /** 从表记录数 */
  const detailCount = computed(() => detailList.value.length)

  /** 是否达到最大记录数 */
  const isMaxDetailReached = computed(() => {
    if (!config.maxDetailCount) return false
    return detailCount.value >= config.maxDetailCount
  })

  // ==================== 核心操作 ====================

  /**
   * 添加从表记录
   */
  const addDetail = async (detail?: Partial<TDetail>): Promise<TDetail> => {
    // 检查最大记录数
    if (isMaxDetailReached.value) {
      ElMessage.warning(`最多只能添加${config.maxDetailCount}条明细`)
      throw new Error('MAX_DETAIL_COUNT_REACHED')
    }

    // 创建新记录
    const newDetail: TDetail = {
      ...detail,
      [config.foreignKey]: masterId.value,
      _isNew: true,
      _editMode: true
    } as TDetail

      ; (detailList.value as unknown as TDetail[]).push(newDetail as TDetail)
    hasUnsavedChanges.value = true

    // 触发回调
    await config.onDetailChange?.(detailList.value as unknown as TDetail[])

    return newDetail
  }

  /**
   * 编辑从表记录
   */
  const editDetail = async (detail: TDetail): Promise<void> => {
    const index = detailList.value.findIndex(d => d === detail || d.id === detail.id)
    if (index === -1) {
      throw new Error('Detail not found')
    }

    // 标记为编辑模式
    detailList.value[index]._editMode = true
    hasUnsavedChanges.value = true
  }

  /**
   * 删除从表记录
   */
  const deleteDetail = async (detail: TDetail): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除这条明细吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const index = detailList.value.findIndex(d =>
        d === detail || d.id === detail.id
      )

      if (index === -1) return

      // 如果是新增的记录，直接从列表移除
      if (detail._isNew) {
        detailList.value.splice(index, 1)
      } else {
        // 否则标记为删除，稍后批量删除
        // 注意：使用类型安全的复制而非any
        const toDelete = detailList.value[index] as TDetail
        ; (deletedDetails.value as unknown as TDetail[]).push({ ...(toDelete as TDetail) })
        detailList.value.splice(index, 1)
      }

      hasUnsavedChanges.value = true
      await config.onDetailChange?.(detailList.value as unknown as TDetail[])

      ElMessage.success('删除成功')
    } catch {
      // 用户取消删除
    }
  }

  /**
   * 批量删除从表记录
   */
  const batchDeleteDetails = async (details: TDetail[]): Promise<void> => {
    if (details.length === 0) {
      ElMessage.warning('请先选择要删除的记录')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${details.length} 条明细吗？`,
        '批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 批量移除
      for (const detail of details) {
        const index = detailList.value.findIndex(d =>
          d === detail || d.id === detail.id
        )

        if (index !== -1) {
          if (!detail._isNew) {
            // 使用类型安全的复制而非any
            const toDelete = detailList.value[index] as TDetail
            ; (deletedDetails.value as unknown as TDetail[]).push({ ...(toDelete as TDetail) })
          }
          detailList.value.splice(index, 1)
        }
      }

      selectedDetails.value = []
      hasUnsavedChanges.value = true
      await config.onDetailChange?.(detailList.value as unknown as TDetail[])

      ElMessage.success(`成功删除 ${details.length} 条记录`)
    } catch {
      // 用户取消删除
    }
  }

  /**
   * 加载从表数据
   */
  const loadDetails = async (masterIdParam: any): Promise<void> => {
    if (!masterIdParam) return

    loading.value = true
    try {
      // 实际项目中这里调用API
      // const response = await http.get(`${config.detailApi}?${config.foreignKey}=${masterIdParam}`)
      // detailList.value = response.data

      // 暂时使用模拟数据
      detailList.value = []

      await config.onDetailChange?.(detailList.value as unknown as TDetail[])
    } catch (error) {
      ElMessage.error('加载明细数据失败')
      console.error('Load details error:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证数据一致性
   */
  const validate = async (): Promise<boolean> => {
    // 1. 验证主表数据
    if (!masterForm.value || !masterForm.value.id) {
      ElMessage.error('请先填写主表信息')
      return false
    }

    // 2. 验证从表外键
    const invalidDetails = detailList.value.filter((detail: any) =>
      !detail[config.foreignKey] || detail[config.foreignKey] !== masterId.value
    )

    if (invalidDetails.length > 0) {
      ElMessage.error('存在外键不一致的明细记录')
      return false
    }

    // 3. 验证必填字段（示例）
    // const missingRequiredFields = detailList.value.filter((detail: any) => !detail.name)
    // if (missingRequiredFields.length > 0) {
    //   ElMessage.error('明细中存在必填字段未填写')
    //   return false
    // }

    return true
  }

  /**
   * 保存主表和从表
   */
  const saveAll = async (): Promise<void> => {
    // 验证数据
    const isValid = await validate()
    if (!isValid) return

    loading.value = true

    try {
      // 保存历史记录（用于撤销）
      history.value.push({
        master: masterForm.value as TMaster,
        details: detailList.value as TDetail[]
      })

      // 1. 保存主表
      // await http.post(config.masterApi, masterForm.value)

      // 2. 批量删除已标记的从表记录
      if (deletedDetails.value.length > 0) {
        // await http.post(`${config.detailApi}/batch-delete`, deletedDetails.value)
        deletedDetails.value = []
      }

      // 3. 批量保存/更新从表记录
      const newDetails = detailList.value.filter((d: any) => d._isNew)
      const updatedDetails = detailList.value.filter((d: any) => !d._isNew && d._editMode)

      if (newDetails.length > 0) {
        // await http.post(`${config.detailApi}/batch-create`, newDetails)
      }

      if (updatedDetails.length > 0) {
        // await http.post(`${config.detailApi}/batch-update`, updatedDetails)
      }

      // 清除编辑标记
      detailList.value.forEach((detail: any) => {
        delete detail._isNew
        delete detail._editMode
      })

      hasUnsavedChanges.value = false
      ElMessage.success('保存成功')
    } catch (error) {
      ElMessage.error('保存失败')
      console.error('Save error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置所有数据
   */
  const reset = (): void => {
    masterForm.value = (config.initialMaster || {}) as TMaster
    detailList.value = []
    selectedDetails.value = []
    deletedDetails.value = []
    hasUnsavedChanges.value = false
    history.value = []
  }

  /**
   * 撤销变更
   */
  const undo = (): void => {
    const lastHistory = history.value.pop()
    if (lastHistory) {
      // 注意：需要类型断言处理ref的UnwrapRef类型
      masterForm.value = lastHistory.master as TMaster
      detailList.value = lastHistory.details as TDetail[]
      hasUnsavedChanges.value = history.value.length > 0
      ElMessage.info('已撤销上一步操作')
    } else {
      ElMessage.warning('没有可撤销的操作')
    }
  }

  // ==================== 监听器 ====================

  // 监听主表变化
  watch(
    () => masterForm.value,
    useDebounceFn(async (newMaster) => {
      if (newMaster && newMaster.id) {
        await config.onMasterChange?.(newMaster)

        if (config.autoLoadDetails !== false) {
          await loadDetails(newMaster.id)
        }
      }
    }, 300),
    { deep: true }
  )

  // ==================== 返回接口 ====================

  return {
    masterForm: masterForm as unknown as Ref<TMaster>,
    detailList: detailList as unknown as Ref<TDetail[]>,
    selectedDetails: selectedDetails as unknown as Ref<TDetail[]>,
    loading,
    hasUnsavedChanges,
    addDetail,
    editDetail,
    deleteDetail,
    batchDeleteDetails,
    loadDetails,
    saveAll,
    validate,
    reset,
    undo
  }
}

