/**
 * @fileoverview Composables Index - 组合式API统一导出
 * @description 导出所有组合式API钩子函数
 * @version 1.0.0
 * @author SmartAbp Team
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 验证相关组合式API (Validation Composables)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
    DEFAULT_VALIDATION_OPTIONS, useValidation, type ValidationOptions, type ValidationState
} from './useValidation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 未来扩展 (Future Extensions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// export { useEntityModeling } from './useEntityModeling'
// export { useCodeGeneration } from './useCodeGeneration'
// export { useSchemaVersion } from './useSchemaVersion'