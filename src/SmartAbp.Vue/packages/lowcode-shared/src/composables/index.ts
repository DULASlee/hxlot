/**
 * 🎨 Composables Module Entry
 * 
 * 可复用的 Vue Composables 集合
 * 
 * @module @smartabp/lowcode-shared/composables
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏭 API Composable 工厂
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  createApiComposable,
  createSimpleApiComposable,
  createBatchApiComposable,
  type ApiMethodConfig,
  type ApiMethodsConfig,
  type ApiComposable
} from './create-api-composable.js'
