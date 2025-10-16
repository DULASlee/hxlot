/**
 * 增强型AppService生成器 v2.0
 *
 * 功能特性：
 * - 完整的CRUD操作（增删改查）
 * - 批量操作（批量创建、批量删除、批量更新）
 * - 事务支持（UnitOfWork特性）
 * - 高级查询（过滤、排序、分页、搜索）
 * - 缓存集成（可选）
 * - 领域事件发布（可选）
 *
 * 生成代码质量目标：≥95分
 *
 * @author SmartAbp架构师团队
 * @version 2.0.0
 * @date 2025-10-16
 */

import type { UnifiedEntityDefinition, UnifiedEntityField } from '@smartabp/lowcode-shared'

/**
 * AppService生成器配置
 */
export interface AppServiceGenerationConfig {
    projectName: string
    namespace: string
    generateComments: boolean
    generateBatchOperations: boolean
    generateCaching: boolean
    generateDomainEvents: boolean
    generateAdvancedQueries: boolean
    generateEnums: boolean
    generateRelationshipHelpers: boolean
}

/**
 * 生成的AppService代码
 */
export interface GeneratedAppServiceCode {
    appServiceCode: string
    interfaceCode: string
    dtoCode: string
}

/**
 * C#类型映射表（与Entity生成器保持一致）
 */
const CSharpTypeMap: Record<string, string> = {
    'string': 'string',
    'int': 'int',
    'long': 'long',
    'decimal': 'decimal',
    'double': 'double',
    'float': 'float',
    'bool': 'bool',
    'DateTime': 'DateTime',
    'Guid': 'Guid',
    'byte[]': 'byte[]',
    'short': 'short',
    'byte': 'byte',
    'char': 'char',
    'object': 'object',
    'DateTimeOffset': 'DateTimeOffset',
    'TimeSpan': 'TimeSpan',
    'Uri': 'Uri',
    'Enum': 'int',
    'json': 'string',
    'xml': 'string',
    'array': 'List<object>',
    'dictionary': 'Dictionary<string, object>'
}

/**
 * 增强型AppService生成器
 */
export class EnhancedAppServiceGenerator {
    private config: AppServiceGenerationConfig

    constructor(config: AppServiceGenerationConfig) {
        this.config = config
    }

    /**
     * 生成完整的AppService代码（类+接口+DTO）
     */
    public generateAppService(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): GeneratedAppServiceCode {
        return {
            appServiceCode: this.generateAppServiceClass(entity, allEntities),
            interfaceCode: this.generateAppServiceInterface(entity),
            dtoCode: this.generateDtoClasses(entity)
        }
    }

    /**
     * 生成AppService类
     */
    private generateAppServiceClass(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): string {
        const timestamp = new Date().toISOString()
        const className = `${entity.name}AppService`
        const interfaceName = `I${entity.name}AppService`
        const entityName = entity.name
        const dtoName = `${entity.name}Dto`
        const createDtoName = `Create${entity.name}Dto`
        const updateDtoName = `Update${entity.name}Dto`
        const permissionPrefix = `${this.config.projectName}Permissions.${entityName}s`

        const usings = this.generateUsings(entity)
        const constructor = this.generateConstructor(entity)
        const crudMethods = this.generateCrudMethods(entity)
        const batchMethods = this.config.generateBatchOperations ? this.generateBatchMethods(entity) : ''
        const advancedQueries = this.config.generateAdvancedQueries ? this.generateAdvancedQueryMethods(entity) : ''
        const customMethods = this.generateCustomMethods(entity, allEntities)

        return `${usings}

namespace ${this.config.namespace}.${entityName}s
{
    /// <summary>
    /// ${entity.displayName || entityName}应用服务
    /// ${entity.description || ''}
    ///
    /// 生成时间: ${timestamp}
    /// 生成器版本: v2.0
    ///
    /// 功能特性:
    /// - CRUD操作
    ${this.config.generateBatchOperations ? '    /// - 批量操作' : ''}
    ${this.config.generateCaching ? '    /// - 缓存集成' : ''}
    ${this.config.generateDomainEvents ? '    /// - 领域事件' : ''}
    ${this.config.generateAdvancedQueries ? '    /// - 高级查询' : ''}
    /// </summary>
    public class ${className} : CrudAppService<
        ${entityName},
        ${dtoName},
        Guid,
        PagedAndSortedResultRequestDto,
        ${createDtoName},
        ${updateDtoName}
    >, ${interfaceName}
    {
        ${this.generatePermissionProperties(entity)}

${constructor}
${crudMethods}
${batchMethods}
${advancedQueries}
${customMethods}
    }
}`
    }

    /**
     * 生成Using语句
     */
    private generateUsings(entity: UnifiedEntityDefinition): string {
        const baseUsings = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using ${this.config.namespace}.Permissions;`

        const optionalUsings: string[] = []

        if (this.config.generateCaching) {
            optionalUsings.push('using Microsoft.Extensions.Caching.Distributed;')
        }

        if (this.config.generateDomainEvents) {
            optionalUsings.push('using Volo.Abp.EventBus.Distributed;')
        }

        return optionalUsings.length > 0
            ? `${baseUsings}\n${optionalUsings.join('\n')}`
            : baseUsings
    }

    /**
     * 生成权限属性
     */
    private generatePermissionProperties(entity: UnifiedEntityDefinition): string {
        const permissionPrefix = `${this.config.projectName}Permissions.${entity.name}s`

        return `        protected override string GetPolicyName => "${permissionPrefix}.Default";
        protected override string GetListPolicyName => "${permissionPrefix}.Default";
        protected override string GetCreatePolicyName => "${permissionPrefix}.Create";
        protected override string GetUpdatePolicyName => "${permissionPrefix}.Update";
        protected override string GetDeletePolicyName => "${permissionPrefix}.Delete";`
    }

    /**
     * 生成构造函数
     */
    private generateConstructor(entity: UnifiedEntityDefinition): string {
        const entityName = entity.name
        const cacheParam = this.config.generateCaching
            ? ',\n            IDistributedCache cache'
            : ''
        const eventBusParam = this.config.generateDomainEvents
            ? ',\n            IDistributedEventBus eventBus'
            : ''

        const cacheField = this.config.generateCaching
            ? '\n        private readonly IDistributedCache _cache;'
            : ''
        const eventBusField = this.config.generateDomainEvents
            ? '\n        private readonly IDistributedEventBus _eventBus;'
            : ''

        const cacheAssign = this.config.generateCaching
            ? '\n            _cache = cache;'
            : ''
        const eventBusAssign = this.config.generateDomainEvents
            ? '\n            _eventBus = eventBus;'
            : ''

        return `${cacheField}${eventBusField}

        /// <summary>
        /// 构造函数
        /// </summary>
        public ${entityName}AppService(
            IRepository<${entityName}, Guid> repository${cacheParam}${eventBusParam}
        ) : base(repository)
        {${cacheAssign}${eventBusAssign}
        }`
    }

    /**
     * 生成CRUD方法（重写基类方法以添加增强功能）
     */
    private generateCrudMethods(entity: UnifiedEntityDefinition): string {
        const entityName = entity.name
        const dtoName = `${entityName}Dto`

        return `
        /// <summary>
        /// 获取单个${entity.displayName || entityName}
        /// </summary>
        public override async Task<${dtoName}> GetAsync(Guid id)
        {
            ${this.config.generateCaching ? this.generateCacheGetLogic(entity) : 'return await base.GetAsync(id);'}
        }

        /// <summary>
        /// 获取${entity.displayName || entityName}列表
        /// </summary>
        public override async Task<PagedResultDto<${dtoName}>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            // 基础查询
            var queryable = await Repository.GetQueryableAsync();

            // 应用排序
            queryable = ApplySorting(queryable, input);

            // 获取总数
            var totalCount = await AsyncExecuter.CountAsync(queryable);

            // 应用分页
            queryable = ApplyPaging(queryable, input);

            // 获取数据
            var entities = await AsyncExecuter.ToListAsync(queryable);

            // 映射到DTO
            var dtos = ObjectMapper.Map<List<${entityName}>, List<${dtoName}>>(entities);

            return new PagedResultDto<${dtoName}>(totalCount, dtos);
        }

        /// <summary>
        /// 创建${entity.displayName || entityName}
        /// </summary>
        [Authorize("${this.config.projectName}Permissions.${entityName}s.Create")]
        public override async Task<${dtoName}> CreateAsync(Create${entityName}Dto input)
        {
            var result = await base.CreateAsync(input);

            ${this.config.generateCaching ? `// 清除缓存\n            await InvalidateCacheAsync(result.Id);` : ''}
            ${this.config.generateDomainEvents ? `// 发布领域事件\n            await PublishEntityCreatedEventAsync(result);` : ''}

            return result;
        }

        /// <summary>
        /// 更新${entity.displayName || entityName}
        /// </summary>
        [Authorize("${this.config.projectName}Permissions.${entityName}s.Update")]
        public override async Task<${dtoName}> UpdateAsync(Guid id, Update${entityName}Dto input)
        {
            var result = await base.UpdateAsync(id, input);

            ${this.config.generateCaching ? `// 清除缓存\n            await InvalidateCacheAsync(id);` : ''}
            ${this.config.generateDomainEvents ? `// 发布领域事件\n            await PublishEntityUpdatedEventAsync(result);` : ''}

            return result;
        }

        /// <summary>
        /// 删除${entity.displayName || entityName}
        /// </summary>
        [Authorize("${this.config.projectName}Permissions.${entityName}s.Delete")]
        public override async Task DeleteAsync(Guid id)
        {
            await base.DeleteAsync(id);

            ${this.config.generateCaching ? `// 清除缓存\n            await InvalidateCacheAsync(id);` : ''}
            ${this.config.generateDomainEvents ? `// 发布领域事件\n            await PublishEntityDeletedEventAsync(id);` : ''}
        }`
    }

    /**
     * 生成批量操作方法
     */
    private generateBatchMethods(entity: UnifiedEntityDefinition): string {
        const entityName = entity.name
        const dtoName = `${entityName}Dto`
        const createDtoName = `Create${entityName}Dto`

        return `
        /// <summary>
        /// 批量创建${entity.displayName || entityName}
        /// </summary>
        [Authorize("${this.config.projectName}Permissions.${entityName}s.Create")]
        [UnitOfWork]
        public virtual async Task<List<${dtoName}>> BatchCreateAsync(List<${createDtoName}> inputs)
        {
            var entities = inputs.Select(input => ObjectMapper.Map<${createDtoName}, ${entityName}>(input)).ToList();

            await Repository.InsertManyAsync(entities, autoSave: true);

            var dtos = ObjectMapper.Map<List<${entityName}>, List<${dtoName}>>(entities);

            ${this.config.generateCaching ? `// 清除缓存\n            await InvalidateAllCacheAsync();` : ''}

            return dtos;
        }

        /// <summary>
        /// 批量删除${entity.displayName || entityName}
        /// </summary>
        [Authorize("${this.config.projectName}Permissions.${entityName}s.Delete")]
        [UnitOfWork]
        public virtual async Task BatchDeleteAsync(List<Guid> ids)
        {
            await Repository.DeleteManyAsync(ids, autoSave: true);

            ${this.config.generateCaching ? `// 清除缓存\n            await InvalidateAllCacheAsync();` : ''}
        }

        /// <summary>
        /// 批量更新${entity.displayName || entityName}状态
        /// </summary>
        [Authorize("${this.config.projectName}Permissions.${entityName}s.Update")]
        [UnitOfWork]
        public virtual async Task BatchUpdateStatusAsync(List<Guid> ids, int status)
        {
            var entities = await Repository.GetListAsync(x => ids.Contains(x.Id));

            foreach (var entity in entities)
            {
                // 注意：这里假设实体有Status属性，实际生成时需要检查
                // entity.Status = status;
            }

            await Repository.UpdateManyAsync(entities, autoSave: true);

            ${this.config.generateCaching ? `// 清除缓存\n            await InvalidateAllCacheAsync();` : ''}
        }`
    }

    /**
     * 生成高级查询方法
     */
    private generateAdvancedQueryMethods(entity: UnifiedEntityDefinition): string {
        const entityName = entity.name
        const dtoName = `${entityName}Dto`
        const searchableFields = entity.fields.filter(f => f.searchable)

        const searchConditions = searchableFields.length > 0
            ? searchableFields.map(f => `                    .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), x => x.${f.name}.Contains(input.Filter))`).join('\n')
            : '                    // 无可搜索字段'

        return `
        /// <summary>
        /// 高级搜索${entity.displayName || entityName}
        /// </summary>
        public virtual async Task<PagedResultDto<${dtoName}>> SearchAsync(${entityName}SearchInputDto input)
        {
            var queryable = await Repository.GetQueryableAsync();

            // 应用搜索条件
            queryable = queryable
${searchConditions};

            // 应用排序
            queryable = ApplySorting(queryable, input);

            // 获取总数
            var totalCount = await AsyncExecuter.CountAsync(queryable);

            // 应用分页
            queryable = ApplyPaging(queryable, input);

            // 获取数据
            var entities = await AsyncExecuter.ToListAsync(queryable);

            // 映射到DTO
            var dtos = ObjectMapper.Map<List<${entityName}>, List<${dtoName}>>(entities);

            return new PagedResultDto<${dtoName}>(totalCount, dtos);
        }

        /// <summary>
        /// 获取${entity.displayName || entityName}统计信息
        /// </summary>
        public virtual async Task<${entityName}StatisticsDto> GetStatisticsAsync()
        {
            var queryable = await Repository.GetQueryableAsync();

            var totalCount = await AsyncExecuter.CountAsync(queryable);
            // 可以添加更多统计逻辑

            return new ${entityName}StatisticsDto
            {
                TotalCount = totalCount
            };
        }`
    }

    /**
     * 生成自定义方法（基于实体关系）
     */
    private generateCustomMethods(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): string {
        if (!this.config.generateRelationshipHelpers) {
            return '\n        // 无自定义方法'
        }

        if (!entity.relationships || entity.relationships.length === 0) {
            return '\n        // 无自定义方法'
        }

        const methods: string[] = []

        for (const rel of entity.relationships) {
            const targetEntity = allEntities.find(e => e.id === rel.targetEntityId)
            if (!targetEntity) continue

            // 为OneToMany关系生成获取子项方法
            if (rel.type === 'OneToMany') {
                methods.push(`
        /// <summary>
        /// 获取${entity.displayName || entity.name}的所有${targetEntity.displayName || targetEntity.name}
        /// </summary>
        public virtual async Task<List<${targetEntity.name}Dto>> Get${rel.targetNavigationProperty || targetEntity.name + 's'}Async(Guid ${entity.name.toLowerCase()}Id)
        {
            // 注意：这里需要注入相关的Repository或AppService
            // var items = await Repository.GetListAsync(x => x.${entity.name}Id == ${entity.name.toLowerCase()}Id);
            // return ObjectMapper.Map<List<${targetEntity.name}>, List<${targetEntity.name}Dto>>(items);
            throw new NotImplementedException("需要注入${targetEntity.name}Repository");
        }`)
            }
        }

        return methods.length > 0 ? methods.join('\n') : '\n        // 无自定义方法'
    }

    /**
     * 生成缓存获取逻辑
     */
    private generateCacheGetLogic(entity: UnifiedEntityDefinition): string {
        const entityName = entity.name
        const dtoName = `${entityName}Dto`

        return `var cacheKey = $"${entityName}:{{id}}";
            var cachedDto = await _cache.GetAsync<${dtoName}>(cacheKey);

            if (cachedDto != null)
            {
                return cachedDto;
            }

            var dto = await base.GetAsync(id);

            await _cache.SetAsync(cacheKey, dto, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
            });

            return dto;`
    }

    /**
     * 生成AppService接口
     */
    private generateAppServiceInterface(entity: UnifiedEntityDefinition): string {
        const entityName = entity.name
        const dtoName = `${entityName}Dto`
        const createDtoName = `Create${entityName}Dto`
        const updateDtoName = `Update${entityName}Dto`

        const batchMethods = this.config.generateBatchOperations ? `
        /// <summary>
        /// 批量创建
        /// </summary>
        Task<List<${dtoName}>> BatchCreateAsync(List<${createDtoName}> inputs);

        /// <summary>
        /// 批量删除
        /// </summary>
        Task BatchDeleteAsync(List<Guid> ids);

        /// <summary>
        /// 批量更新状态
        /// </summary>
        Task BatchUpdateStatusAsync(List<Guid> ids, int status);` : ''

        const advancedMethods = this.config.generateAdvancedQueries ? `
        /// <summary>
        /// 高级搜索
        /// </summary>
        Task<PagedResultDto<${dtoName}>> SearchAsync(${entityName}SearchInputDto input);

        /// <summary>
        /// 获取统计信息
        /// </summary>
        Task<${entityName}StatisticsDto> GetStatisticsAsync();` : ''

        return `using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace ${this.config.namespace}.${entityName}s
{
    /// <summary>
    /// ${entity.displayName || entityName}应用服务接口
    /// </summary>
    public interface I${entityName}AppService : ICrudAppService<
        ${dtoName},
        Guid,
        PagedAndSortedResultRequestDto,
        ${createDtoName},
        ${updateDtoName}>
    {${batchMethods}${advancedMethods}
    }
}`
    }

    /**
     * 生成DTO类
     */
    private generateDtoClasses(entity: UnifiedEntityDefinition): string {
        const timestamp = new Date().toISOString()
        const entityName = entity.name
        const dtoFields = this.generateDtoFields(entity.fields)
        const createDtoFields = this.generateCreateDtoFields(entity.fields)
        const updateDtoFields = this.generateUpdateDtoFields(entity.fields)

        const searchInputDto = this.config.generateAdvancedQueries ? `
    /// <summary>
    /// ${entity.displayName || entityName}搜索输入DTO
    /// </summary>
    public class ${entityName}SearchInputDto : PagedAndSortedResultRequestDto
    {
        /// <summary>
        /// 搜索关键词
        /// </summary>
        public string Filter { get; set; }

        // 可以添加更多搜索字段
    }

    /// <summary>
    /// ${entity.displayName || entityName}统计DTO
    /// </summary>
    public class ${entityName}StatisticsDto
    {
        /// <summary>
        /// 总数
        /// </summary>
        public int TotalCount { get; set; }

        // 可以添加更多统计字段
    }` : ''

        return `using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace ${this.config.namespace}.${entityName}s
{
    /// <summary>
    /// ${entity.displayName || entityName}DTO
    /// 生成时间: ${timestamp}
    /// </summary>
    public class ${entityName}Dto : FullAuditedEntityDto<Guid>
    {
${dtoFields}
    }

    /// <summary>
    /// 创建${entity.displayName || entityName}DTO
    /// </summary>
    public class Create${entityName}Dto
    {
${createDtoFields}
    }

    /// <summary>
    /// 更新${entity.displayName || entityName}DTO
    /// </summary>
    public class Update${entityName}Dto
    {
${updateDtoFields}
    }${searchInputDto}
}`
    }

    /**
     * 生成DTO字段
     */
    private generateDtoFields(fields: UnifiedEntityField[]): string {
        return fields.map(field => {
            const type = this.mapCSharpType(field, '')
            const nullable = !field.isRequired && !type.endsWith('?') ? '?' : ''
            const comment = field.description || field.displayName || field.name

            return `        /// <summary>
        /// ${comment}
        /// </summary>
        public ${type}${nullable} ${field.name} { get; set; }`
        }).join('\n\n')
    }

    /**
     * 生成CreateDTO字段（包含验证特性）
     */
    private generateCreateDtoFields(fields: UnifiedEntityField[]): string {
        return fields.map(field => {
            const type = this.mapCSharpType(field, '')
            const nullable = !field.isRequired && !type.endsWith('?') ? '?' : ''
            const comment = field.description || field.displayName || field.name

            const validations: string[] = []
            if (field.isRequired) {
                validations.push('        [Required(ErrorMessage = "必填项")]')
            }
            if (field.maxLength) {
                validations.push(`        [MaxLength(${field.maxLength}, ErrorMessage = "最大长度${field.maxLength}")]`)
            }
            if (field.minLength) {
                validations.push(`        [MinLength(${field.minLength}, ErrorMessage = "最小长度${field.minLength}")]`)
            }
            if (field.minValue !== undefined || field.maxValue !== undefined) {
                const min = field.minValue ?? 'int.MinValue'
                const max = field.maxValue ?? 'int.MaxValue'
                validations.push(`        [Range(${min}, ${max}, ErrorMessage = "值范围${min}-${max}")]`)
            }

            const validationStr = validations.length > 0 ? validations.join('\n') + '\n' : ''

            return `        /// <summary>
        /// ${comment}
        /// </summary>
${validationStr}        public ${type}${nullable} ${field.name} { get; set; }`
        }).join('\n\n')
    }

    /**
     * 生成UpdateDTO字段（与CreateDTO相同但可能有不同的验证规则）
     */
    private generateUpdateDtoFields(fields: UnifiedEntityField[]): string {
        // 通常Update DTO与Create DTO相同，这里简化处理
        return this.generateCreateDtoFields(fields)
    }

    /**
     * 映射C#类型
     */
    private mapCSharpType(field: UnifiedEntityField, entityName: string): string {
        // 处理枚举（若未开启生成则回退string，避免编译失败）
        if (field.type.includes('enum') || field.enumValues) {
            if (!this.config.generateEnums) {
                return 'string'
            }
            const prefix = entityName || ''
            return `${prefix}${field.name}Enum`
        }

        // 处理数组类型
        if (field.type.includes('[]')) {
            const baseType = field.type.replace('[]', '')
            const elementType = CSharpTypeMap[baseType] || 'object'
            return `List<${elementType}>`
        }

        // 处理基本类型
        return CSharpTypeMap[field.type] || 'string'
    }
}

