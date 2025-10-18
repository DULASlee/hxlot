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
  camelCase, capitalize, escapeHtml, kebabCase, pascalCase, stripHtml, truncate, uncapitalize, unescapeHtml
} from './string.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 数组工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  average, chunk,
  compact,
  difference,
  groupBy,
  intersection, max,
  min, range, shuffle, sortBy, sum, unique,
  uniqueBy
} from './array.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 对象工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  deepClone,
  deepMerge, flatten as flattenObject, get, has,
  isEqual, omit, pick, set, unflatten
} from './object.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 Schema转换工具
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟡 Phase 3B: SchemaConverter已废弃，不再导出
// export { SchemaConverter } from './schema-converter.js'
