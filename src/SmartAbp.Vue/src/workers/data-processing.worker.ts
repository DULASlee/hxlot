/**
 * SmartAbp Enterprise Data Processing Worker
 * Phoenix计划 Week 2 - Web Workers集成
 * 
 * 功能：
 * 1. 大数据排序（主线程解放）
 * 2. 复杂筛选逻辑
 * 3. 数据聚合计算
 * 4. 全文搜索
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface WorkerMessage {
  id: string
  type: 'sort' | 'filter' | 'search' | 'aggregate' | 'transform'
  payload: any
}

export interface WorkerResponse {
  id: string
  type: string
  result: any
  error?: string
  duration: number
}

interface SortPayload {
  data: any[]
  key: string
  order: 'asc' | 'desc'
}

interface FilterPayload {
  data: any[]
  conditions: Array<{
    key: string
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith'
    value: any
  }>
}

interface SearchPayload {
  data: any[]
  keyword: string
  fields: string[]
}

interface AggregatePayload {
  data: any[]
  groupBy: string
  aggregations: Array<{
    field: string
    function: 'sum' | 'avg' | 'min' | 'max' | 'count'
  }>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 工具函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 获取嵌套属性值
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj)
}

/**
 * 比较函数
 */
function compare(a: any, b: any, order: 'asc' | 'desc'): number {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1

  const result = a < b ? -1 : 1
  return order === 'asc' ? result : -result
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 数据处理函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 排序
 */
function sortData(payload: SortPayload): any[] {
  const { data, key, order } = payload

  return [...data].sort((a, b) => {
    const valueA = getNestedValue(a, key)
    const valueB = getNestedValue(b, key)
    return compare(valueA, valueB, order)
  })
}

/**
 * 筛选
 */
function filterData(payload: FilterPayload): any[] {
  const { data, conditions } = payload

  return data.filter(item => {
    return conditions.every(condition => {
      const value = getNestedValue(item, condition.key)
      const compareValue = condition.value

      switch (condition.operator) {
        case 'eq':
          return value === compareValue
        case 'ne':
          return value !== compareValue
        case 'gt':
          return value > compareValue
        case 'gte':
          return value >= compareValue
        case 'lt':
          return value < compareValue
        case 'lte':
          return value <= compareValue
        case 'contains':
          return String(value).toLowerCase().includes(String(compareValue).toLowerCase())
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(compareValue).toLowerCase())
        default:
          return true
      }
    })
  })
}

/**
 * 全文搜索
 */
function searchData(payload: SearchPayload): any[] {
  const { data, keyword, fields } = payload

  if (!keyword) return data

  const lowerKeyword = keyword.toLowerCase()

  return data.filter(item => {
    return fields.some(field => {
      const value = getNestedValue(item, field)
      return String(value).toLowerCase().includes(lowerKeyword)
    })
  })
}

/**
 * 数据聚合
 */
function aggregateData(payload: AggregatePayload): any[] {
  const { data, groupBy, aggregations } = payload

  // 分组
  const groups = new Map<any, any[]>()
  
  data.forEach(item => {
    const groupKey = getNestedValue(item, groupBy)
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(item)
  })

  // 聚合计算
  const results: any[] = []

  groups.forEach((items, groupKey) => {
    const result: any = { [groupBy]: groupKey }

    aggregations.forEach(agg => {
      const values = items.map(item => getNestedValue(item, agg.field)).filter(v => v != null)

      switch (agg.function) {
        case 'sum':
          result[`${agg.field}_sum`] = values.reduce((a, b) => a + b, 0)
          break
        case 'avg':
          result[`${agg.field}_avg`] = values.length > 0 
            ? values.reduce((a, b) => a + b, 0) / values.length 
            : 0
          break
        case 'min':
          result[`${agg.field}_min`] = values.length > 0 ? Math.min(...values) : null
          break
        case 'max':
          result[`${agg.field}_max`] = values.length > 0 ? Math.max(...values) : null
          break
        case 'count':
          result[`${agg.field}_count`] = values.length
          break
      }
    })

    results.push(result)
  })

  return results
}

/**
 * 数据转换（通用）
 */
function transformData(payload: { data: any[], transformer: string }): any[] {
  const { data, transformer } = payload

  try {
    // 使用Function构造器执行转换函数（安全性考虑：生产环境应限制）
    const transformFn = new Function('item', 'index', `return ${transformer}`)
    return data.map((item, index) => transformFn(item, index))
  } catch (error) {
    console.error('[Worker] Transform error:', error)
    return data
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Worker消息处理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data
  const startTime = performance.now()

  try {
    let result: any

    switch (type) {
      case 'sort':
        result = sortData(payload)
        break
      case 'filter':
        result = filterData(payload)
        break
      case 'search':
        result = searchData(payload)
        break
      case 'aggregate':
        result = aggregateData(payload)
        break
      case 'transform':
        result = transformData(payload)
        break
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }

    const duration = performance.now() - startTime

    const response: WorkerResponse = {
      id,
      type,
      result,
      duration
    }

    self.postMessage(response)

  } catch (error) {
    const duration = performance.now() - startTime

    const response: WorkerResponse = {
      id,
      type,
      result: null,
      error: error instanceof Error ? error.message : String(error),
      duration
    }

    self.postMessage(response)
  }
}

// 导出类型（供主线程使用）
export type {
  SortPayload,
  FilterPayload,
  SearchPayload,
  AggregatePayload
}
