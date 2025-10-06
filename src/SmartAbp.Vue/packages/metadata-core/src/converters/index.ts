/**
 * @smartabp/metadata-core/converters
 * 
 * 统一元数据格式转换器
 * 零代码侵入的旧格式迁移工具
 */

// ========================================
// Manifest转换器
// ========================================
export {
  convertManifestToModule,
  convertManifestsToModules,
  convertModuleToManifest,
  isValidManifest,
  getConversionSummary,
  type LegacyManifest,
  type LegacyRoute,
  type LegacyStore,
  type LegacyLifecycle,
  type ConvertOptions
} from './manifest-to-module'

// ========================================
// 实体转换器
// ========================================
export {
  convertLegacyEntityToMetadata,
  convertLegacyEntitiesToMetadata,
  convertMetadataToLegacyEntity,
  isValidLegacyEntity,
  getEntityConversionSummary,
  extractEntitiesFromLegacyModule,
  type LegacyEntityDefinition,
  type LegacyPropertyDefinition,
  type EntityConvertOptions
} from './legacy-entity-converter'

// ========================================
// Aspire转换器
// ========================================
export {
  convertBackendAspireToMetadata,
  convertBackendAspireSolutionsToMetadata,
  convertMetadataToBackendAspire,
  isValidBackendAspireDefinition,
  getAspireConversionSummary,
  extractMicroservicesByType,
  hasInfrastructure,
  type BackendAspireSolutionDefinition,
  type BackendMicroserviceDefinition,
  type AspireConvertOptions
} from './aspire-converter'

// ========================================
// 通用转换工具
// ========================================

/**
 * 自动检测并转换格式
 */
export function autoConvert(input: any): any {
  // 检测Manifest格式
  if (isValidManifest(input)) {
    return convertManifestToModule(input)
  }
  
  // 检测实体格式
  if (isValidLegacyEntity(input)) {
    return convertLegacyEntityToMetadata(input)
  }
  
  // 检测Aspire格式
  if (isValidBackendAspireDefinition(input)) {
    return convertBackendAspireToMetadata(input)
  }
  
  throw new Error('无法识别的格式，请手动指定转换器')
}

/**
 * 批量自动转换
 */
export function autoConvertBatch(inputs: any[]): any[] {
  return inputs.map(input => autoConvert(input))
}

// Re-export validators for convenience
import { isValidManifest } from './manifest-to-module'
import { isValidLegacyEntity } from './legacy-entity-converter'
import { isValidBackendAspireDefinition } from './aspire-converter'
import { convertManifestToModule } from './manifest-to-module'
import { convertLegacyEntityToMetadata } from './legacy-entity-converter'
import { convertBackendAspireToMetadata } from './aspire-converter'

