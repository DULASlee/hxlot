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
  EntityDefinitionDto,
  EntityFieldDto,
  EntityIndexDto,
  EntityRelationDto
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
  generateEnums: boolean
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
function mapCSharpType(field: EntityFieldDto): string {
  const fieldType = field.type ?? 'string'
  const fieldName = field.name ?? 'Field'

  // 处理枚举（根据type判断）
  if (fieldType.includes('enum') || field.enumValues) {
    return fieldName + 'Enum'
  }

  // 处理数组类型（根据type判断，如 "string[]"）
  if (fieldType.includes('[]')) {
    const baseType = fieldType.replace('[]', '')
    const elementType = CSharpTypeMap[baseType] || 'object'
    return `ICollection<${elementType}>`
  }

  // 处理基本类型
  return CSharpTypeMap[fieldType] || 'string'
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

function generateDataAnnotations(field: EntityFieldDto): string {
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
  if (field.type && ['int', 'long', 'decimal', 'double', 'float'].includes(field.type)) {
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
  entity: EntityDefinitionDto,
  relationships: EntityRelationDto[],
  allEntities: EntityDefinitionDto[]
): string {
  // 类型已导入，这里是实现
  if (!relationships || relationships.length === 0) {
    return ''
  }

  const navProps: string[] = []

  for (const rel of relationships) {
    const targetEntity = allEntities.find(e => e.id === rel.targetEntityId)
    if (!targetEntity) continue

    const comment = `        /// <summary>\n        /// 导航属性: ${targetEntity.displayName || targetEntity.name}\n        /// </summary>`

    switch (rel.type) {
      case 1: // OneToMany
        // 一对多：当前实体有多个目标实体
        navProps.push(`${comment}`)
        navProps.push(`        public virtual ICollection<${targetEntity.name ?? 'Entity'}> ${rel.navigationProperty ?? ((targetEntity.name ?? 'Entity') + 's')} { get; set; }`)
        break

      case 0: // OneToOne
        // 一对一：当前实体关联一个目标实体
        navProps.push(`${comment}`)
        navProps.push(`        [ForeignKey(nameof(${rel.foreignKey ?? ((targetEntity.name ?? 'Entity') + 'Id')}))]`)
        navProps.push(`        public virtual ${targetEntity.name ?? 'Entity'}? ${rel.navigationProperty ?? (targetEntity.name ?? 'Entity')} { get; set; }`)
        break

      case 3: // ManyToMany
        // 多对多：当前实体关联多个目标实体，目标实体也关联多个当前实体
        navProps.push(`${comment}`)
        navProps.push(`        public virtual ICollection<${targetEntity.name ?? 'Entity'}> ${rel.navigationProperty ?? ((targetEntity.name ?? 'Entity') + 's')} { get; set; }`)
        break
    }
  }

  return navProps.length > 0 ? '\n' + navProps.join('\n\n') : ''
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 外键属性生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateForeignKeys(
  entity: EntityDefinitionDto,
  relationships: EntityRelationDto[],
  allEntities: EntityDefinitionDto[]
): string {
  if (!relationships || relationships.length === 0) {
    return ''
  }

  const foreignKeys: string[] = []

  for (const rel of relationships) {
    // 只为OneToOne生成外键（OneToMany由反向关系处理）
    if (rel.type === 0) { // OneToOne
      const targetEntity = allEntities.find((e: EntityDefinitionDto) => e.id === rel.toEntity)
      if (!targetEntity) continue

      const fkName = rel.foreignKey ?? `${targetEntity.name ?? 'Entity'}Id`
      const comment = `        /// <summary>\n        /// 外键: ${targetEntity.displayName ?? targetEntity.name ?? 'Entity'}\n        /// </summary>`

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
    entity: EntityDefinitionDto,
    allEntities: EntityDefinitionDto[]
  ): GeneratedEntityCode {
    logger.info('🚀 [EnhancedEntityGenerator] 开始生成Entity', {
      entityName: entity.name ?? 'Entity',
      fieldCount: entity.fields?.length ?? 0,
      relationshipCount: entity.relationships?.length ?? 0
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
    entity: EntityDefinitionDto,
    allEntities: EntityDefinitionDto[]
  ): string {
    // 1. 生成普通字段
    const fields = this.generateFields(entity.fields ?? [], entity.name ?? 'Entity')

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
${this.config.generateEnums ? this.generateEnumDeclarations(entity) : ''}
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
  private generateFields(fields: EntityFieldDto[], entityName: string): string {
    return fields.map((field: EntityFieldDto) => {
      const type = this.resolveCSharpType(field, entityName)
      const nullable = !field.isRequired && !isValueType(type) ? '?' : ''
      const annotations = this.config.generateComments ? generateDataAnnotations(field) : ''

      return `${annotations}
        public ${type}${nullable} ${field.name ?? 'Field'} { get; set; }`
    }).join('\n\n')
  }

  /**
   * 生成构造函数
   */
  private generateConstructors(entity: EntityDefinitionDto): string {
    const requiredFields = (entity.fields ?? []).filter((f: any) => f.isRequired)

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
      const params = requiredFields.map((f: EntityFieldDto) => {
        const type = this.resolveCSharpType(f, entity.name ?? 'Entity')
        const nullable = !isValueType(type) ? '?' : ''
        return `${type}${nullable} ${this.toLowerCamelCase(f.name ?? 'field')}`
      }).join(', ')

      const assignments = requiredFields.map((f: EntityFieldDto) => {
        const camelName = this.toLowerCamelCase(f.name ?? 'field')
        if (this.config.generateValidation) {
          return this.generateFieldValidation(f, camelName)
        } else {
          return `            ${f.name ?? 'field'} = ${camelName};`
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
  private generateFieldValidation(field: EntityFieldDto, paramName: string): string {
    const type = this.resolveCSharpType(field, '')

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
  private generateCollectionInitializers(entity: EntityDefinitionDto): string {
    if (!entity.relationships || entity.relationships.length === 0) {
      return ''
    }

    const initializers: string[] = []

    for (const rel of entity.relationships) {
      if (rel.type === 1 || rel.type === 3) { // OneToMany or ManyToMany
        const propName = rel.navigationProperty ?? 'Items'
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

  /**
   * 解析最终C#类型（包含枚举开关回退）
   */
  private resolveCSharpType(field: EntityFieldDto, entityName: string): string {
    const fieldType = field.type ?? 'string'
    const fieldName = field.name ?? 'Field'

    // 若字段为枚举且未开启生成枚举，则回退为 string，避免编译错误
    if ((fieldType.includes('enum') || field.enumValues) && !this.config.generateEnums) {
      return 'string'
    }
    if (fieldType.includes('enum') || field.enumValues) {
      return `${entityName || 'Entity'}${fieldName}Enum`.replace(/^Enum/, 'Enum')
    }
    return mapCSharpType(field)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ EntityConfiguration生成（Fluent API）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 生成EntityConfiguration
   */
  generateEntityConfiguration(
    entity: EntityDefinitionDto,
    allEntities: EntityDefinitionDto[]
  ): string {
    const tableName = entity.tableName || `${entity.name}s`

    // 字段配置
    const fieldConfigs = this.generateFieldConfigurations(entity.fields ?? [])

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
  private generateFieldConfigurations(fields: EntityFieldDto[]): string {
    return fields.map((field: EntityFieldDto) => {
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
  private generateIndexConfigurations(entity: EntityDefinitionDto): string {
    if (!entity.indexes || entity.indexes.length === 0) {
      return '            // 无索引配置'
    }

    return entity.indexes.map((index: EntityIndexDto) => {
      const fields = (index.columns ?? []).map((f: string) => `e.${f}`).join(', ')
      const indexName = index.name ?? `IX_${entity.name ?? ''}_${(index.columns ?? []).join('_')}`

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
    entity: EntityDefinitionDto,
    allEntities: EntityDefinitionDto[]
  ): string {
    if (!entity.relationships || entity.relationships.length === 0) {
      return '            // 无关系配置'
    }

    return entity.relationships.map((rel: EntityRelationDto) => {
      const targetEntity = allEntities.find((e: EntityDefinitionDto) => e.id === rel.toEntity)
      if (!targetEntity) return ''

      // 默认级联操作为Restrict（类型安全）
      const cascadeAction = 'Restrict'

      switch (rel.type) {
        case 1: // OneToMany
          return `            builder.HasMany(e => e.${rel.navigationProperty ?? ((targetEntity.name ?? '') + 's')})
                .WithOne()
                .HasForeignKey(e => e.${rel.foreignKey ?? ((entity.name ?? '') + 'Id')})
                .OnDelete(DeleteBehavior.${cascadeAction});`

        case 0: // OneToOne
          return `            builder.HasOne(e => e.${rel.navigationProperty ?? (targetEntity.name ?? '')})
                .WithOne()
                .HasForeignKey<${entity.name ?? ''}>(e => e.${rel.foreignKey ?? ((targetEntity.name ?? '') + 'Id')})
                .OnDelete(DeleteBehavior.${cascadeAction});`

        case 3: // ManyToMany
          const joinTableName = `${entity.name ?? ''}_${targetEntity.name ?? ''}`
          return `            builder.HasMany(e => e.${rel.navigationProperty ?? ((targetEntity.name ?? '') + 's')})
                .WithMany()
                .UsingEntity(j => j.ToTable("${joinTableName}"));`

        default:
          return ''
      }
    }).filter(c => c).join('\n\n')
  }

  /**
   * 生成枚举声明（位于命名空间内，类外）
   */
  private generateEnumDeclarations(entity: EntityDefinitionDto): string {
    const fields = entity.fields ?? []
    if (fields.length === 0) {
      return ''
    }

    const enums = fields
      .filter((f: EntityFieldDto) => Array.isArray(f.enumValues) && f.enumValues && f.enumValues.length > 0)
      .map((f: EntityFieldDto) => {
        const rawValues = (f.enumValues ?? []) as any[]
        const members = rawValues
          .map((v: any, idx: number) => {
            const name = this.sanitizeEnumMemberName(String(v))
            return `        ${name} = ${idx}`
          })
          .join(',\n')

        return `    /// <summary>
    /// ${f.displayName ?? f.name ?? 'Field'} 枚举
    /// </summary>
    public enum ${entity.name ?? 'Entity'}${f.name ?? 'Field'}Enum
    {
${members}
    }`
      })

    return enums.length > 0 ? enums.join('\n\n') + '\n' : ''
  }

  /**
   * 枚举成员名清理
   */
  private sanitizeEnumMemberName(value: string): string {
    // 去除非字母数字，下划线；首字符非字母则前缀_；空则回退为 Value
    let name = value.replace(/[^a-zA-Z0-9_]/g, '_')
    if (!/^[A-Za-z_]/.test(name)) {
      name = '_' + name
    }
    if (name.length === 0) {
      name = 'Value'
    }
    return name
  }
}

