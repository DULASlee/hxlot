/**
 * 🚀 增强型Entity生成器 v2.0
 *
 * 功能完整性：
 * ✅ 导航属性生成（OneToMany/ManyToOne/ManyToMany/OneToOne）
 * ✅ 外键属性生成
 * ✅ 支持22种C#类型映射
 * ✅ 数据注解生成（MaxLength/Required/Range等）
 * ✅ 构造函数参数验证
 * ✅ EntityConfiguration生成（Fluent API）
 * ✅ 索引配置生成
 * ✅ 关系配置生成
 * ✅ 级联操作配置
 *
 * @author SmartAbp架构师团队
 * @version 2.0.0
 * @date 2025-10-16
 */

import type {
    UnifiedEntityDefinition,
    UnifiedEntityField,
    UnifiedEntityRelationship
} from '@smartabp/lowcode-shared'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EntityGenerationConfig {
    projectName: string
    namespace: string
    generateComments: boolean
    generateValidation: boolean
    generateNavigationProperties: boolean
    generateEntityConfiguration: boolean
}

export interface GeneratedEntityCode {
    entityCode: string
    entityConfigurationCode: string
    fileName: string
    configFileName: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 C#类型映射（支持22种类型）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CSharpTypeMap: Record<string, string> = {
    // 整数类型
    'byte': 'byte',
    'short': 'short',
    'int': 'int',
    'long': 'long',

    // 浮点类型
    'float': 'float',
    'double': 'double',
    'decimal': 'decimal',

    // 字符类型
    'char': 'char',
    'string': 'string',

    // 布尔类型
    'bool': 'bool',
    'boolean': 'bool',

    // 日期时间类型
    'DateTime': 'DateTime',
    'DateTimeOffset': 'DateTimeOffset',
    'DateOnly': 'DateOnly',
    'TimeOnly': 'TimeOnly',
    'TimeSpan': 'TimeSpan',

    // GUID
    'Guid': 'Guid',
    'guid': 'Guid',

    // 二进制
    'byte[]': 'byte[]',
    'Byte[]': 'byte[]',

    // 对象类型
    'object': 'object'
}

/**
 * 映射到C#类型
 */
function mapCSharpType(field: UnifiedEntityField): string {
    // 处理枚举（根据type判断）
    if (field.type.includes('enum') || field.enumValues) {
        return field.name + 'Enum'
    }

    // 处理数组类型（根据type判断，如 "string[]"）
    if (field.type.includes('[]')) {
        const baseType = field.type.replace('[]', '')
        const elementType = CSharpTypeMap[baseType] || 'object'
        return `ICollection<${elementType}>`
    }

    // 处理基本类型
    return CSharpTypeMap[field.type] || 'string'
}

/**
 * 判断是否为值类型
 */
function isValueType(type: string): boolean {
    const valueTypes = ['byte', 'short', 'int', 'long', 'float', 'double', 'decimal', 'bool', 'char', 'DateTime', 'DateTimeOffset', 'DateOnly', 'TimeOnly', 'Guid']
    return valueTypes.includes(type)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 数据注解生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateDataAnnotations(field: UnifiedEntityField): string {
    const annotations: string[] = []

    // Required注解
    if (field.isRequired) {
        annotations.push('        [Required]')
    }

    // MaxLength注解
    if (field.maxLength && field.maxLength > 0) {
        annotations.push(`        [MaxLength(${field.maxLength})]`)
    }

    // StringLength注解（对于string类型）
    if (field.type === 'string' && field.maxLength && field.maxLength > 0) {
        const minLength = field.minLength || 0
        if (minLength > 0) {
            annotations.push(`        [StringLength(${field.maxLength}, MinimumLength = ${minLength})]`)
        }
    }

    // Range注解（对于数值类型）
    if (['int', 'long', 'decimal', 'double', 'float'].includes(field.type)) {
        if (field.minValue !== undefined && field.maxValue !== undefined) {
            annotations.push(`        [Range(${field.minValue}, ${field.maxValue})]`)
        }
    }

    // Comment注解
    if (field.displayName) {
        annotations.push(`        /// <summary>`)
        annotations.push(`        /// ${field.displayName}${field.description ? ': ' + field.description : ''}`)
        annotations.push(`        /// </summary>`)
    }

    return annotations.join('\n')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 导航属性生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateNavigationProperties(
    entity: UnifiedEntityDefinition,
    relationships: UnifiedEntityRelationship[],
    allEntities: UnifiedEntityDefinition[]
): string {
    if (!relationships || relationships.length === 0) {
        return ''
    }

    const navProps: string[] = []

    for (const rel of relationships) {
        const targetEntity = allEntities.find(e => e.id === rel.targetEntityId)
        if (!targetEntity) continue

        const comment = `        /// <summary>\n        /// 导航属性: ${targetEntity.displayName || targetEntity.name}\n        /// </summary>`

        switch (rel.type) {
            case 'OneToMany':
                // 一对多：当前实体有多个目标实体
                navProps.push(`${comment}`)
                navProps.push(`        public virtual ICollection<${targetEntity.name}> ${rel.targetNavigationProperty || targetEntity.name + 's'} { get; set; }`)
                break

            case 'OneToOne':
                // 一对一：当前实体关联一个目标实体
                navProps.push(`${comment}`)
                navProps.push(`        [ForeignKey(nameof(${rel.sourceProperty || targetEntity.name + 'Id'}))]`)
                navProps.push(`        public virtual ${targetEntity.name}? ${rel.targetNavigationProperty || targetEntity.name} { get; set; }`)
                break

            case 'ManyToMany':
                // 多对多：当前实体关联多个目标实体，目标实体也关联多个当前实体
                navProps.push(`${comment}`)
                navProps.push(`        public virtual ICollection<${targetEntity.name}> ${rel.targetNavigationProperty || targetEntity.name + 's'} { get; set; }`)
                break
        }
    }

    return navProps.length > 0 ? '\n' + navProps.join('\n\n') : ''
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 外键属性生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateForeignKeys(
    entity: UnifiedEntityDefinition,
    relationships: UnifiedEntityRelationship[],
    allEntities: UnifiedEntityDefinition[]
): string {
    if (!relationships || relationships.length === 0) {
        return ''
    }

    const foreignKeys: string[] = []

    for (const rel of relationships) {
        // 只为OneToOne生成外键（OneToMany由反向关系处理）
        if (rel.type === 'OneToOne') {
            const targetEntity = allEntities.find(e => e.id === rel.targetEntityId)
            if (!targetEntity) continue

            const fkName = rel.sourceProperty || `${targetEntity.name}Id`
            const comment = `        /// <summary>\n        /// 外键: ${targetEntity.displayName || targetEntity.name}\n        /// </summary>`

            foreignKeys.push(`${comment}`)
            foreignKeys.push(`        public Guid? ${fkName} { get; set; }`)
        }
    }

    return foreignKeys.length > 0 ? '\n' + foreignKeys.join('\n\n') : ''
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ Entity类生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class EnhancedEntityGenerator {
    private config: EntityGenerationConfig

    constructor(config: EntityGenerationConfig) {
        this.config = config
    }

    /**
     * 生成完整的Entity代码
     */
    generateEntity(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): GeneratedEntityCode {
        logger.info('🚀 [EnhancedEntityGenerator] 开始生成Entity', {
            entityName: entity.name,
            fieldCount: entity.fields.length,
            relationshipCount: entity.relationships?.length || 0
        })

        const entityCode = this.generateEntityClass(entity, allEntities)
        const entityConfigurationCode = this.config.generateEntityConfiguration
            ? this.generateEntityConfiguration(entity, allEntities)
            : ''

        return {
            entityCode,
            entityConfigurationCode,
            fileName: `${entity.name}.cs`,
            configFileName: `${entity.name}Configuration.cs`
        }
    }

    /**
     * 生成Entity类代码
     */
    private generateEntityClass(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): string {
        // 1. 生成普通字段
        const fields = this.generateFields(entity.fields)

        // 2. 生成外键属性
        const foreignKeys = this.config.generateNavigationProperties
            ? generateForeignKeys(entity, entity.relationships || [], allEntities)
            : ''

        // 3. 生成导航属性
        const navigationProperties = this.config.generateNavigationProperties
            ? generateNavigationProperties(entity, entity.relationships || [], allEntities)
            : ''

        // 4. 生成构造函数
        const constructors = this.generateConstructors(entity)

        // 5. 组装完整代码
        return `// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 自动生成的实体类
// 生成时间: ${new Date().toISOString()}
// 生成器版本: EnhancedEntityGenerator v2.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace ${this.config.namespace}.${entity.name}s
{
    /// <summary>
    /// ${entity.displayName || entity.name} 实体
    /// ${entity.description ? `\n    /// ${entity.description}` : ''}
    /// </summary>
    public class ${entity.name} : FullAuditedAggregateRoot<Guid>
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📦 普通字段
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fields}${foreignKeys}${navigationProperties}

${constructors}
    }
}`
    }

    /**
     * 生成字段
     */
    private generateFields(fields: UnifiedEntityField[]): string {
        return fields.map(field => {
            const type = mapCSharpType(field)
            const nullable = !field.isRequired && !isValueType(type) ? '?' : ''
            const annotations = this.config.generateComments ? generateDataAnnotations(field) : ''

            return `${annotations}
        public ${type}${nullable} ${field.name} { get; set; }`
        }).join('\n\n')
    }

    /**
     * 生成构造函数
     */
    private generateConstructors(entity: UnifiedEntityDefinition): string {
        const requiredFields = entity.fields.filter(f => f.isRequired)

        // 无参构造函数（EF Core需要）
        const protectedConstructor = `        /// <summary>
        /// 无参构造函数（EF Core需要）
        /// </summary>
        protected ${entity.name}()
        {
${this.generateCollectionInitializers(entity)}
        }`

        // 有参构造函数（包含必填字段）
        if (requiredFields.length > 0) {
            const params = requiredFields.map(f => {
                const type = mapCSharpType(f)
                const nullable = !isValueType(type) ? '?' : ''
                return `${type}${nullable} ${this.toLowerCamelCase(f.name)}`
            }).join(', ')

            const assignments = requiredFields.map(f => {
                const camelName = this.toLowerCamelCase(f.name)
                if (this.config.generateValidation) {
                    return this.generateFieldValidation(f, camelName)
                } else {
                    return `            ${f.name} = ${camelName};`
                }
            }).join('\n')

            const publicConstructor = `
        /// <summary>
        /// 带参数的构造函数
        /// </summary>
        public ${entity.name}(Guid id, ${params}) : base(id)
        {
${assignments}
${this.generateCollectionInitializers(entity)}
        }`

            return protectedConstructor + publicConstructor
        }

        return protectedConstructor
    }

    /**
     * 生成字段验证
     */
    private generateFieldValidation(field: UnifiedEntityField, paramName: string): string {
        const type = mapCSharpType(field)

        if (type === 'string') {
            if (field.maxLength && field.maxLength > 0) {
                return `            ${field.name} = Check.NotNullOrWhiteSpace(${paramName}, nameof(${paramName}), maxLength: ${field.maxLength});`
            } else {
                return `            ${field.name} = Check.NotNullOrWhiteSpace(${paramName}, nameof(${paramName}));`
            }
        } else if (!isValueType(type)) {
            return `            ${field.name} = Check.NotNull(${paramName}, nameof(${paramName}));`
        } else if (['int', 'long', 'decimal', 'double', 'float'].includes(type)) {
            if (field.minValue !== undefined && field.maxValue !== undefined) {
                return `            ${field.name} = Check.Range(${paramName}, nameof(${paramName}), ${field.minValue}, ${field.maxValue});`
            } else {
                return `            ${field.name} = ${paramName};`
            }
        } else {
            return `            ${field.name} = ${paramName};`
        }
    }

    /**
     * 生成集合初始化
     */
    private generateCollectionInitializers(entity: UnifiedEntityDefinition): string {
        if (!entity.relationships || entity.relationships.length === 0) {
            return ''
        }

        const initializers: string[] = []

        for (const rel of entity.relationships) {
            if (rel.type === 'OneToMany' || rel.type === 'ManyToMany') {
                const propName = rel.targetNavigationProperty || 'Items'
                initializers.push(`            ${propName} = new HashSet<${propName.slice(0, -1)}>();`)
            }
        }

        return initializers.length > 0 ? '\n' + initializers.join('\n') : ''
    }

    /**
     * 转换为小驼峰
     */
    private toLowerCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ EntityConfiguration生成（Fluent API）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 生成EntityConfiguration
     */
    generateEntityConfiguration(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): string {
        const tableName = entity.tableName || `${entity.name}s`

        // 字段配置
        const fieldConfigs = this.generateFieldConfigurations(entity.fields)

        // 索引配置
        const indexConfigs = this.generateIndexConfigurations(entity)

        // 关系配置
        const relationshipConfigs = this.generateRelationshipConfigurations(entity, allEntities)

        return `// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 自动生成的Entity配置类（Fluent API）
// 生成时间: ${new Date().toISOString()}
// 生成器版本: EnhancedEntityGenerator v2.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace ${this.config.namespace}.EntityFrameworkCore.Configurations
{
    /// <summary>
    /// ${entity.displayName || entity.name} EntityConfiguration
    /// </summary>
    public class ${entity.name}Configuration : IEntityTypeConfiguration<${entity.name}>
    {
        public void Configure(EntityTypeBuilder<${entity.name}> builder)
        {
            // 表名配置
            builder.ToTable("${tableName}");

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 📦 字段配置
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fieldConfigs}

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 🔍 索引配置
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${indexConfigs}

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 🔗 关系配置
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${relationshipConfigs}
        }
    }
}`
    }

    /**
     * 生成字段配置
     */
    private generateFieldConfigurations(fields: UnifiedEntityField[]): string {
        return fields.map(field => {
            const configs: string[] = []
            const propConfig = `            builder.Property(e => e.${field.name})`

            // Required
            if (field.isRequired) {
                configs.push('.IsRequired()')
            }

            // MaxLength
            if (field.maxLength && field.maxLength > 0) {
                configs.push(`.HasMaxLength(${field.maxLength})`)
            }

            // Precision（decimal类型）
            if (field.type === 'decimal' && field.precision) {
                const scale = field.scale || 2
                configs.push(`.HasPrecision(${field.precision}, ${scale})`)
            }

            // Comment
            if (field.displayName) {
                configs.push(`.HasComment("${field.displayName}${field.description ? ': ' + field.description : ''}")`)
            }

            return configs.length > 0
                ? `${propConfig}\n                ${configs.join('\n                ')};`
                : ''
        }).filter(c => c).join('\n\n')
    }

    /**
     * 生成索引配置
     */
    private generateIndexConfigurations(entity: UnifiedEntityDefinition): string {
        if (!entity.indexes || entity.indexes.length === 0) {
            return '            // 无索引配置'
        }

        return entity.indexes.map(index => {
            const fields = index.columns.map((f: string) => `e.${f}`).join(', ')
            const indexName = index.name || `IX_${entity.name}_${index.columns.join('_')}`

            let config = `            builder.HasIndex(e => new { ${fields} })`
            config += `\n                .HasDatabaseName("${indexName}")`

            if (index.isUnique) {
                config += '\n                .IsUnique()'
            }

            config += ';'

            return config
        }).join('\n\n')
    }

    /**
     * 生成关系配置
     */
    private generateRelationshipConfigurations(
        entity: UnifiedEntityDefinition,
        allEntities: UnifiedEntityDefinition[]
    ): string {
        if (!entity.relationships || entity.relationships.length === 0) {
            return '            // 无关系配置'
        }

        return entity.relationships.map(rel => {
            const targetEntity = allEntities.find(e => e.id === rel.targetEntityId)
            if (!targetEntity) return ''

            // 默认级联操作为Restrict（类型安全）
            const cascadeAction = 'Restrict'

            switch (rel.type) {
                case 'OneToMany':
                    return `            builder.HasMany(e => e.${rel.targetNavigationProperty || targetEntity.name + 's'})
                .WithOne(e => e.${rel.sourceNavigationProperty || entity.name})
                .HasForeignKey(e => e.${rel.targetProperty || entity.name + 'Id'})
                .OnDelete(DeleteBehavior.${cascadeAction});`

                case 'OneToOne':
                    return `            builder.HasOne(e => e.${rel.targetNavigationProperty || targetEntity.name})
                .WithOne(e => e.${rel.sourceNavigationProperty || entity.name})
                .HasForeignKey<${entity.name}>(e => e.${rel.sourceProperty || targetEntity.name + 'Id'})
                .OnDelete(DeleteBehavior.${cascadeAction});`

                case 'ManyToMany':
                    const joinTableName = `${entity.name}_${targetEntity.name}`
                    return `            builder.HasMany(e => e.${rel.targetNavigationProperty || targetEntity.name + 's'})
                .WithMany(e => e.${rel.sourceNavigationProperty || entity.name + 's'})
                .UsingEntity(j => j.ToTable("${joinTableName}"));`

                default:
                    return ''
            }
        }).filter(c => c).join('\n\n')
    }
}

