/**
 * 🔧 Utilities Module Entry
 * 
 * 工具函数集合入口
 * 
 * @module @smartabp/lowcode-shared/utils
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔤 字符串工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  camelCase,
  pascalCase,
  kebabCase,
  capitalize,
  uncapitalize,
  truncate,
  escapeHtml,
  unescapeHtml,
  stripHtml,
} from './string.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 数组工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  chunk,
  compact,
  difference,
  groupBy,
  intersection,
  shuffle,
  unique,
  uniqueBy,
  range,
  sum,
  average,
  max,
  min,
  sortBy,
} from './array.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 对象工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  deepClone,
  deepMerge,
  pick,
  omit,
  get,
  set,
  has,
  isEqual,
  flatten as flattenObject,
  unflatten,
} from './object.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 Schema转换工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { SchemaConverter } from './schema-converter.js'
