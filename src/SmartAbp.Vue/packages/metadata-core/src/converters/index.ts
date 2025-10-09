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
    convertManifestsToModules, convertManifestToModule, convertModuleToManifest, getConversionSummary, isValidManifest, type ConvertOptions, type LegacyLifecycle, type LegacyManifest,
    type LegacyRoute,
    type LegacyStore
} from './manifest-to-module.js'

// ========================================
// 实体转换器
// ========================================
export {
    convertLegacyEntitiesToMetadata, convertLegacyEntityToMetadata, convertMetadataToLegacyEntity, extractEntitiesFromLegacyModule, getEntityConversionSummary, isValidLegacyEntity, type EntityConvertOptions, type LegacyEntityDefinition,
    type LegacyPropertyDefinition
} from './legacy-entity-converter.js'

// ========================================
// Aspire转换器
// ========================================
export {
    convertBackendAspireSolutionsToMetadata, convertBackendAspireToMetadata, convertMetadataToBackendAspire, extractMicroservicesByType, getAspireConversionSummary, hasInfrastructure, isValidBackendAspireDefinition, type AspireConvertOptions, type BackendAspireSolutionDefinition,
    type BackendMicroserviceDefinition
} from './aspire-converter.js'

// ========================================
// 后端DTO转换器
// ========================================
export {
    getBackendConversionStats, toEntityMetadataDto, toEntityMetadataDtoBatch, toMenuConfigDto, toModuleMetadataDto, toModuleMetadataDtoBatch, toNavigationPropertyMetadataDto, toPropertyMetadataDto, toRouteMetadataDto,
    toStoreMetadataDto, type AttributeDto, type AuditFieldDto, type ConfigurationDto, type ConstraintDto, type ConvertToBackendOptions, type EntityMetadataDto, type FeatureDto, type IndexDto, type LocalizationDto, type MenuConfigDto, type ModuleMetadataDto, type NavigationPropertyMetadataDto, type PropertyMetadataDto, type RouteMetadataDto,
    type StoreMetadataDto, type ValidationRuleDto
} from './backend-dto-converter.js'

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
import { convertBackendAspireToMetadata, isValidBackendAspireDefinition } from './aspire-converter.js'
import { convertLegacyEntityToMetadata, isValidLegacyEntity } from './legacy-entity-converter.js'
import { convertManifestToModule, isValidManifest } from './manifest-to-module.js'

