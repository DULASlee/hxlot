/**
 * SmartAbp Low-Code Core - Main Export
 * 
 * Centralized export for all core low-code functionality
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

// Export components
export * from './components'

// Export selected types for consumers
export type { TabConfig } from './stores/entityModeling'

// Backward-compatible type exports for consumers expecting these from root
export type {
  BarcodeScannerField, CalculatedFieldConfig, CascadeConfig, DeviceParameterField, DictionaryField, DynamicFieldConfig, FormCreateConfig,
  FormCreateRule, LinkageAction, LinkageActionType, LinkageCondition, LinkageConditionType, LinkageRule, MaterialField, ProductionLineField, QualityInspectionField, SensorDataField, SmartFieldType,
  SmartFormItem, WorkOrderField
} from './components/SmartFormBuilder'

// Note: utilities/composables/services are internal; re-exports removed to avoid path index issues

// Export runtime
export * from './runtime'

/**
 * Core low-code platform initialization
 */
export function initializeLowCodeCore(): void {
  console.log('[SmartAbp] Low-Code Core initialized')
}

// Default export for plugin usage
export default {
  initializeLowCodeCore
}