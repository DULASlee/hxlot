/**
 * 对象工具函数
 */

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 获取嵌套属性值
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return defaultValue
    }
  }

  return result as T
}

/**
 * 设置嵌套属性值
 */
export function set(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const keys = path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return obj

  let current: Record<string, unknown> = obj

  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[lastKey] = value
  return obj
}

/**
 * 删除嵌套属性
 */
export function unset(obj: Record<string, unknown>, path: string): boolean {
  const keys = path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return false

  let current: Record<string, unknown> = obj

  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      return false
    }
    current = current[key] as Record<string, unknown>
  }

  return delete current[lastKey]
}

/**
 * 检查对象是否有指定路径的属性
 */
export function has(obj: Record<string, unknown>, path: string): boolean {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return false
    }
  }

  return true
}

/**
 * 省略对象中的指定键
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

/**
 * 提取对象中的指定键
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 判断两个对象是否相等（深度比较）
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b
  }

  if (a.constructor !== b.constructor) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    return keysA.every((key) => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  }

  return false
}

/**
 * 扁平化对象
 */
export function flatten(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (isObject(value)) {
        flatten(value, newKey, result)
      } else {
        result[newKey] = value
      }
    }
  }

  return result
}

/**
 * 反扁平化对象
 */
export function unflatten(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      set(result, key, obj[key])
    }
  }

  return result
}
