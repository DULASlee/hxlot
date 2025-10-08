import type {
    BusinessRuleDto,
    BusinessRuleExecutionResultDto,
    BusinessRuleStatsDto,
    BusinessRuleValidationResultDto,
    CreateBusinessRuleDto,
    EntityDefinitionDto,
    EntityFieldDto,
    GetBusinessRulesInput,
    UpdateBusinessRuleDto,
} from '@smartabp/lowcode-api'
import { businessRuleApi } from '@smartabp/lowcode-api'
import { logger } from '@smartabp/lowcode-tools'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 业务规则引擎Store
 * 企业级状态管理，支持持久化、缓存、实时更新
 */
export const useBusinessRuleStore = defineStore('businessRule', () => {
    // ============================================================================
    // 状态定义
    // ============================================================================

    /** 业务规则列表 */
    const businessRules = ref<BusinessRuleDto[]>([])

    /** 选中的规则列表 */
    const selectedRules = ref<BusinessRuleDto[]>([])

    /** 统计信息 */
    const stats = ref<BusinessRuleStatsDto>({
        totalRules: 0,
        activeRules: 0,
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        todayExecutionCount: 0,
        errorRules: 0
    })

    /** 可用实体列表 */
    const availableEntities = ref<EntityDefinitionDto[]>([])

    /** 实体字段映射 */
    const entityFieldsMap = ref<Record<string, EntityFieldDto[]>>({})

    /** 执行日志 */
    const executionLog = ref<Array<{
        id: string
        timestamp: number
        ruleId: string
        ruleName: string
        success: boolean
        executionTime: number
        error?: string
    }>>([])

    /** 加载状态 */
    const loading = ref({
        list: false,
        create: false,
        update: false,
        delete: false,
        execute: false,
        validate: false,
        stats: false
    })

    /** 查询条件 */
    const queryInput = ref<GetBusinessRulesInput>({
        skipCount: 0,
        maxResultCount: 20,
        sorting: 'creationTime desc',
        searchKeyword: '',
        entityName: '',
        type: '',
        isActive: undefined,
        hasError: undefined
    })

    /** 分页信息 */
    const pagination = ref({
        total: 0,
        current: 1,
        pageSize: 20
    })

    // ============================================================================
    // 计算属性
    // ============================================================================

    /** 活跃规则列表 */
    const activeRules = computed(() =>
        businessRules.value.filter(rule => rule.isActive)
    )

    /** 错误规则列表 */
    const errorRules = computed(() =>
        businessRules.value.filter(rule => rule.hasError)
    )

    /** 规则类型统计 */
    const ruleTypeStats = computed(() => {
        const typeMap: Record<string, number> = {}
        businessRules.value.forEach((rule: BusinessRuleDto) => {
            typeMap[rule.type] = (typeMap[rule.type] || 0) + 1
        })
        return typeMap
    })

    /** 是否有选中规则 */
    const hasSelectedRules = computed(() => selectedRules.value.length > 0)

    /** 今日执行统计 */
    const todayStats = computed(() => {
        const today = new Date().toDateString()
        const todayLogs = executionLog.value.filter(log =>
            new Date(log.timestamp).toDateString() === today
        )
        return {
            count: todayLogs.length,
            successCount: todayLogs.filter(log => log.success).length,
            failureCount: todayLogs.filter(log => !log.success).length
        }
    })

    // ============================================================================
    // 持久化相关
    // ============================================================================

    const STORAGE_KEYS = {
        QUERY_INPUT: 'businessRule_queryInput',
        SELECTED_RULES: 'businessRule_selectedRules',
        EXECUTION_LOG: 'businessRule_executionLog'
    }

    /** 保存查询条件到本地存储 */
    const saveQueryInput = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.QUERY_INPUT, JSON.stringify(queryInput.value))
        } catch (error) {
            logger?.warn('Failed to save query input to localStorage', error)
        }
    }

    /** 从本地存储加载查询条件 */
    const loadQueryInput = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.QUERY_INPUT)
            if (saved) {
                queryInput.value = { ...queryInput.value, ...JSON.parse(saved) }
            }
        } catch (error) {
            logger?.warn('Failed to load query input from localStorage', error)
        }
    }

    /** 保存执行日志到本地存储 */
    const saveExecutionLog = () => {
        try {
            // 只保存最近1000条记录
            const logsToSave = executionLog.value.slice(0, 1000)
            localStorage.setItem(STORAGE_KEYS.EXECUTION_LOG, JSON.stringify(logsToSave))
        } catch (error) {
            logger?.warn('Failed to save execution log to localStorage', error)
        }
    }

    /** 从本地存储加载执行日志 */
    const loadExecutionLog = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.EXECUTION_LOG)
            if (saved) {
                executionLog.value = JSON.parse(saved)
            }
        } catch (error) {
            logger?.warn('Failed to load execution log from localStorage', error)
        }
    }

    // ============================================================================
    // API调用方法
    // ============================================================================

    /** 获取业务规则列表 */
    const fetchRuleList = async (refresh = false) => {
        if (refresh) {
            queryInput.value.skipCount = 0
            pagination.value.current = 1
        }

        loading.value.list = true

        try {
            logger?.info('Fetching business rules', queryInput.value)

            const response = await businessRuleApi.getList(queryInput.value)

            businessRules.value = response.items
            pagination.value.total = response.totalCount

            logger?.info('Business rules fetched successfully', {
                count: response.items.length,
                total: response.totalCount
            })

            // 保存查询条件
            saveQueryInput()

            return response
        } catch (error) {
            logger?.error('Failed to fetch business rules', error)
            ElMessage.error('获取业务规则列表失败')
            throw error
        } finally {
            loading.value.list = false
        }
    }

    /** 创建业务规则 */
    const createRule = async (input: CreateBusinessRuleDto): Promise<BusinessRuleDto> => {
        loading.value.create = true

        try {
            logger?.info('Creating business rule', input)

            const rule = await businessRuleApi.create(input)

            // 添加到列表头部
            businessRules.value.unshift(rule)
            pagination.value.total++

            // 刷新统计
            await fetchStats()

            ElMessage.success('业务规则创建成功')
            logger?.info('Business rule created successfully', rule)

            return rule
        } catch (error) {
            logger?.error('Failed to create business rule', error)
            ElMessage.error('创建业务规则失败')
            throw error
        } finally {
            loading.value.create = false
        }
    }

    /** 更新业务规则 */
    const updateRule = async (id: string, input: UpdateBusinessRuleDto): Promise<BusinessRuleDto> => {
        loading.value.update = true

        try {
            logger?.info('Updating business rule', { id, input })

            const updatedRule = await businessRuleApi.update(id, input)

            // 更新列表中的规则
            const index = businessRules.value.findIndex(rule => rule.id === id)
            if (index !== -1) {
                businessRules.value[index] = updatedRule
            }

            // 更新选中列表中的规则
            const selectedIndex = selectedRules.value.findIndex(rule => rule.id === id)
            if (selectedIndex !== -1) {
                selectedRules.value[selectedIndex] = updatedRule
            }

            ElMessage.success('业务规则更新成功')
            logger?.info('Business rule updated successfully', updatedRule)

            return updatedRule
        } catch (error) {
            logger?.error('Failed to update business rule', error)
            ElMessage.error('更新业务规则失败')
            throw error
        } finally {
            loading.value.update = false
        }
    }

    /** 删除业务规则 */
    const deleteRule = async (id: string) => {
        loading.value.delete = true

        try {
            logger?.info('Deleting business rule', { id })

            await businessRuleApi.delete(id)

            // 从列表中移除
            const index = businessRules.value.findIndex(rule => rule.id === id)
            if (index !== -1) {
                businessRules.value.splice(index, 1)
                pagination.value.total--
            }

            // 从选中列表中移除
            const selectedIndex = selectedRules.value.findIndex(rule => rule.id === id)
            if (selectedIndex !== -1) {
                selectedRules.value.splice(selectedIndex, 1)
            }

            // 刷新统计
            await fetchStats()

            ElMessage.success('业务规则删除成功')
            logger?.info('Business rule deleted successfully', { id })

        } catch (error) {
            logger?.error('Failed to delete business rule', error)
            ElMessage.error('删除业务规则失败')
            throw error
        } finally {
            loading.value.delete = false
        }
    }

    /** 执行业务规则 */
    const executeRules = async (ruleIds: string[], context: Record<string, any> = {}) => {
        loading.value.execute = true

        try {
            logger?.info('Executing business rules', { ruleIds, context })

            const results = await businessRuleApi.executeRules({ ruleIds, context })

            // 添加到执行日志
            results.forEach((result, index) => {
                const ruleId = ruleIds[index]
                if (!ruleId) return

                const rule = businessRules.value.find((r: BusinessRuleDto) => r.id === ruleId)
                if (rule) {
                    const logEntry = {
                        id: `${Date.now()}_${index}`,
                        timestamp: result.timestamp,
                        ruleId: ruleId,
                        ruleName: rule.name,
                        success: result.success,
                        executionTime: result.executionTime,
                        error: result.error
                    }

                    executionLog.value.unshift(logEntry)
                }
            })

            // 限制日志数量
            if (executionLog.value.length > 1000) {
                executionLog.value = executionLog.value.slice(0, 1000)
            }

            // 保存执行日志
            saveExecutionLog()

            // 刷新规则列表和统计
            await Promise.all([
                fetchRuleList(),
                fetchStats()
            ])

            const successCount = results.filter((r: BusinessRuleExecutionResultDto) => r.success).length
            ElMessage.success(`执行完成：${successCount}/${results.length} 个规则成功`)

            logger?.info('Business rules executed successfully', {
                total: results.length,
                success: successCount
            })

            return results
        } catch (error) {
            logger?.error('Failed to execute business rules', error)
            ElMessage.error('执行业务规则失败')
            throw error
        } finally {
            loading.value.execute = false
        }
    }

    /** 验证业务规则 */
    const validateRule = async (id: string): Promise<BusinessRuleValidationResultDto> => {
        loading.value.validate = true

        try {
            logger?.info('Validating business rule', { id })

            const result = await businessRuleApi.validateRule(id)

            // 更新规则的错误状态
            const rule = businessRules.value.find(r => r.id === id)
            if (rule) {
                rule.hasError = !result.isValid
            }

            if (result.isValid) {
                ElMessage.success('规则验证通过')
            } else {
                ElMessage.warning(`规则验证失败：${result.errors.join(', ')}`)
            }

            logger?.info('Business rule validated', result)

            return result
        } catch (error) {
            logger?.error('Failed to validate business rule', error)
            ElMessage.error('验证业务规则失败')
            throw error
        } finally {
            loading.value.validate = false
        }
    }

    /** 批量验证所有规则 */
    const validateAllRules = async () => {
        loading.value.validate = true

        try {
            logger?.info('Validating all business rules')

            const results = await businessRuleApi.validateAllRules()

            // 更新规则的错误状态
            results.forEach((result, index) => {
                const rule = businessRules.value[index]
                if (rule) {
                    rule.hasError = !result.isValid
                }
            })

            const invalidCount = results.filter((r: BusinessRuleValidationResultDto) => !r.isValid).length

            if (invalidCount === 0) {
                ElMessage.success('所有规则验证通过')
            } else {
                ElMessage.warning(`发现 ${invalidCount} 个无效规则`)
            }

            logger?.info('All business rules validated', {
                total: results.length,
                invalid: invalidCount
            })

            return results
        } catch (error) {
            logger?.error('Failed to validate all business rules', error)
            ElMessage.error('批量验证规则失败')
            throw error
        } finally {
            loading.value.validate = false
        }
    }

    /** 获取统计信息 */
    const fetchStats = async () => {
        loading.value.stats = true

        try {
            logger?.info('Fetching business rule stats')

            const newStats = await businessRuleApi.getStats()
            stats.value = newStats

            logger?.info('Business rule stats fetched', newStats)

            return newStats
        } catch (error) {
            logger?.error('Failed to fetch business rule stats', error)
            // 统计失败不显示错误消息，静默处理
            throw error
        } finally {
            loading.value.stats = false
        }
    }

    /** 获取可用实体列表 */
    const fetchAvailableEntities = async () => {
        try {
            logger?.info('Fetching available entities')

            const entities = await businessRuleApi.getAvailableEntities()
            availableEntities.value = entities

            logger?.info('Available entities fetched', { count: entities.length })

            return entities
        } catch (error) {
            logger?.error('Failed to fetch available entities', error)
            ElMessage.error('获取实体列表失败')
            throw error
        }
    }

    /** 获取实体字段列表 */
    const fetchEntityFields = async (entityName: string) => {
        try {
            logger?.info('Fetching entity fields', { entityName })

            const fields = await businessRuleApi.getEntityFields(entityName)
            entityFieldsMap.value[entityName] = fields

            logger?.info('Entity fields fetched', { entityName, count: fields.length })

            return fields
        } catch (error) {
            logger?.error('Failed to fetch entity fields', error)
            ElMessage.error('获取实体字段失败')
            throw error
        }
    }

    /** 复制规则 */
    const duplicateRule = async (id: string) => {
        try {
            logger?.info('Duplicating business rule', { id })

            const newRule = await businessRuleApi.duplicateRule(id)

            // 添加到列表头部
            businessRules.value.unshift(newRule)
            pagination.value.total++

            // 刷新统计
            await fetchStats()

            ElMessage.success('规则复制成功')
            logger?.info('Business rule duplicated successfully', newRule)

            return newRule
        } catch (error) {
            logger?.error('Failed to duplicate business rule', error)
            ElMessage.error('复制规则失败')
            throw error
        }
    }

    // ============================================================================
    // 状态管理方法
    // ============================================================================

    /** 设置选中规则 */
    const setSelectedRules = (rules: BusinessRuleDto[]) => {
        selectedRules.value = rules
    }

    /** 清空选中规则 */
    const clearSelectedRules = () => {
        selectedRules.value = []
    }

    /** 设置查询条件 */
    const setQueryInput = (input: Partial<GetBusinessRulesInput>) => {
        queryInput.value = { ...queryInput.value, ...input }
        saveQueryInput()
    }

    /** 重置查询条件 */
    const resetQueryInput = () => {
        queryInput.value = {
            skipCount: 0,
            maxResultCount: 20,
            sorting: 'creationTime desc',
            searchKeyword: '',
            entityName: '',
            type: '',
            isActive: undefined,
            hasError: undefined
        }
        saveQueryInput()
    }

    /** 清空执行日志 */
    const clearExecutionLog = () => {
        executionLog.value = []
        saveExecutionLog()
        ElMessage.success('执行日志已清空')
    }

    /** 刷新数据 */
    const refresh = async () => {
        await Promise.all([
            fetchRuleList(true),
            fetchStats(),
            fetchAvailableEntities()
        ])
    }

    /** 初始化Store */
    const initialize = async () => {
        // 加载持久化数据
        loadQueryInput()
        loadExecutionLog()

        // 获取初始数据
        await Promise.all([
            fetchRuleList(),
            fetchStats(),
            fetchAvailableEntities()
        ])

        logger?.info('BusinessRuleStore initialized')
    }

    // ============================================================================
    // 返回状态和方法
    // ============================================================================

    return {
        // 状态
        businessRules,
        selectedRules,
        stats,
        availableEntities,
        entityFieldsMap,
        executionLog,
        loading,
        queryInput,
        pagination,

        // 计算属性
        activeRules,
        errorRules,
        ruleTypeStats,
        hasSelectedRules,
        todayStats,

        // API方法
        fetchRuleList,
        createRule,
        updateRule,
        deleteRule,
        executeRules,
        validateRule,
        validateAllRules,
        fetchStats,
        fetchAvailableEntities,
        fetchEntityFields,
        duplicateRule,

        // 状态管理方法
        setSelectedRules,
        clearSelectedRules,
        setQueryInput,
        resetQueryInput,
        clearExecutionLog,
        refresh,
        initialize
    }
})
