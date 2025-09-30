/**
 * 字符串工具函数
 */

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 首字母小写
 */
export function uncapitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toLowerCase() + str.slice(1)
}

/**
 * 驼峰命名转短横线命名
 */
export function kebabCase(str: string): string {
  if (!str) return ''
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 短横线命名转驼峰命名
 */
export function camelCase(str: string): string {
  if (!str) return ''
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase())
}

/**
 * 短横线命名转帕斯卡命名
 */
export function pascalCase(str: string): string {
  if (!str) return ''
  return capitalize(camelCase(str))
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 移除HTML标签
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 转义HTML特殊字符
 */
export function escapeHtml(html: string): string {
  if (!html) return ''
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  return html.replace(/[&<>"'/]/g, (char) => entityMap[char] || char)
}

/**
 * 反转义HTML特殊字符
 */
export function unescapeHtml(html: string): string {
  if (!html) return ''
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/'
  }
  return html.replace(/&[^;]+;/g, (entity) => entityMap[entity] || entity)
}

/**
 * 生成随机字符串
 */
export function randomString(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成UUID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 格式化模板字符串
 */
export function template(str: string, data: Record<string, unknown>): string {
  if (!str) return ''
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] || ''))
}

/**
 * 字符串哈希（简单哈希算法）
 */
export function hash(str: string): number {
  if (!str) return 0
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
