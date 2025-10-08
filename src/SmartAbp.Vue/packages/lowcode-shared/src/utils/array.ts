/**
 * 数组工具函数
 */

/**
 * 去重
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * 根据属性去重
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set()
  return arr.filter((item) => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 分组
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const group = String(item[key])
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}

/**
 * 排序
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal === bVal) return 0

    const comparison = aVal < bVal ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * 分页
 */
export function paginate<T>(arr: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return arr.slice(start, end)
}

/**
 * 分块
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 数组扁平化
 */
export function flattenArray<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, val) => {
    return acc.concat(Array.isArray(val) ? flattenArray(val) : val)
  }, [])
}

/**
 * 数组深度扁平化
 */
export function flattenArrayDeep<T>(arr: unknown[]): T[] {
  return arr.reduce<T[]>((acc, val) => {
    return acc.concat(Array.isArray(val) ? flattenArrayDeep(val) : (val as T))
  }, [])
}

/**
 * 差集
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => !arr2.includes(item))
}

/**
 * 交集
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => arr2.includes(item))
}

/**
 * 并集
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2])
}

/**
 * 移动元素
 */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr]
  const [removed] = result.splice(from, 1)
  if (removed !== undefined) {
    result.splice(to, 0, removed)
  }
  return result
}

/**
 * 交换元素
 */
export function swap<T>(arr: T[], index1: number, index2: number): T[] {
  const result = [...arr]
  const temp1 = result[index1]
  const temp2 = result[index2]
  if (temp1 !== undefined && temp2 !== undefined) {
    result[index1] = temp2
    result[index2] = temp1
  }
  return result
}

/**
 * 随机打乱
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp1 = result[i]
    const temp2 = result[j]
    if (temp1 !== undefined && temp2 !== undefined) {
      result[i] = temp2
      result[j] = temp1
    }
  }
  return result
}

/**
 * 随机抽取
 */
export function sample<T>(arr: T[], count = 1): T[] {
  if (count >= arr.length) return shuffle(arr)

  const result: T[] = []
  const used = new Set<number>()

  while (result.length < count) {
    const index = Math.floor(Math.random() * arr.length)
    if (!used.has(index)) {
      used.add(index)
      const item = arr[index]
      if (item !== undefined) {
        result.push(item)
      }
    }
  }

  return result
}

/**
 * 求和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0)
}

/**
 * 平均值
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return sum(arr) / arr.length
}

/**
 * 最大值
 */
export function max(arr: number[]): number {
  return Math.max(...arr)
}

/**
 * 最小值
 */
export function min(arr: number[]): number {
  return Math.min(...arr)
}

/**
 * 范围生成
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * 填充
 */
export function fill<T>(length: number, value: T | ((index: number) => T)): T[] {
  return Array.from({ length }, (_, index) => (typeof value === 'function' ? (value as (index: number) => T)(index) : value))
}

/**
 * 紧凑数组（移除假值）
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[]
}
