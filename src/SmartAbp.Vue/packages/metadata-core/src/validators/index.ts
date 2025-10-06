/**
 * @smartabp/metadata-core/validators
 * 
 * 统一元数据验证器
 * 基于Zod实现类型安全验证
 */

// 实体验证器
export {
    EntityMetadataSchema, getEntityMetadataErrors, safeValidateEntityMetadata, validateEntityMetadata, validateEntityMetadataAsync
} from './entity-validator'

// 模块验证器
export {
    ModuleMetadataSchema, getModuleMetadataErrors, safeValidateModuleMetadata, validateModuleMetadata, validateModuleMetadataAsync
} from './module-validator'

// Aspire验证器
export {
    AspireSolutionMetadataSchema, getAspireSolutionMetadataErrors, safeValidateAspireSolutionMetadata, validateAspireSolutionMetadata, validateAspireSolutionMetadataAsync
} from './aspire-validator'


