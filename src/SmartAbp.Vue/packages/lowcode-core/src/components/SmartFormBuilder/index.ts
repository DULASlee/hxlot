/**
 * SmartFormBuilder 2.0 - 企业级表单构建器
 * 
 * @description
 * 基于form-create v3的企业级表单解决方案，专为SmartAbp低代码平台设计
 * 
 * 核心特性：
 * - ✅ 30+标准字段类型 + 10+MES/IoT自定义字段
 * - ✅ 拖拽式可视化设计器
 * - ✅ 完整的验证规则转换
 * - ✅ 动态表单与联动
 * - ✅ 实时预览与代码导出
 * 
 * @example
 * ```vue
 * <template>
 *   <SmartFormBuilder
 *     :schema="formSchema"
 *     v-model="formData"
 *     @submit="handleSubmit"
 *   />
 * </template>
 * ```
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 核心组件导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { default as SmartFormBuilder } from './SmartFormBuilder.vue'
export { default as SmartFormDesigner } from './SmartFormDesigner.vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 适配器导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { FormSchemaAdapter } from './adapters/FormSchemaAdapter'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆕 联动引擎导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { FormLinkageEngine } from './engine/FormLinkageEngine'
export { LinkageRuleBuilder, LinkageRuleValidator, LINKAGE_TEMPLATES } from './types/linkage-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  FormCreateRule,
  FormCreateConfig
} from './types/form-create-types'

export type {
  SmartFieldType,
  SmartFormItem,
  DeviceParameterField,
  QualityInspectionField,
  WorkOrderField,
  BarcodeScannerField,
  SensorDataField,
  ProductionLineField,
  MaterialField,
  DictionaryField
} from './types/smart-form-types'

// Note: FormSchema types are exported from the adapter
export type * from './types/FormSchema'

// 🆕 联动引擎类型定义
export type {
  LinkageRule,
  LinkageCondition,
  LinkageAction,
  LinkageConditionType,
  LinkageActionType,
  CascadeConfig,
  DynamicFieldConfig,
  CalculatedFieldConfig
} from './types/linkage-types'

