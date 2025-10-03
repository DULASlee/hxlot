/**
 * 🔥 DDD领域模型代码生成器
 * 
 * 功能：
 * 1. 生成聚合根（Aggregate Root）
 * 2. 生成实体（Entity）
 * 3. 生成值对象（Value Object）
 * 4. 生成领域服务（Domain Service）
 * 5. 生成仓储接口（Repository）
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

export interface DddEntityConfig {
  name: string
  namespace: string
  isAggregateRoot: boolean
  properties: PropertyConfig[]
  methods?: MethodConfig[]
}

export interface PropertyConfig {
  name: string
  type: string
  isRequired: boolean
  isValueObject?: boolean
}

export interface MethodConfig {
  name: string
  returnType: string
  parameters: { name: string; type: string }[]
}

/**
 * DDD代码生成器
 */
export class DddCodeGenerator {
  private namespace: string

  constructor(namespace: string = 'SmartAbp') {
    this.namespace = namespace
  }

  /**
   * 生成聚合根
   */
  generateAggregateRoot(config: DddEntityConfig): string {
    logger.info('🚀 生成聚合根', { name: config.name })

    return `// 自动生成的聚合根
// 生成时间: ${new Date().toISOString()}

using System;
using Volo.Abp.Domain.Entities;

namespace ${config.namespace}.Domain.Entities
{
    /// <summary>
    /// ${config.name} 聚合根
    /// </summary>
    public class ${config.name} : AggregateRoot<Guid>
    {
${this.generateProperties(config.properties)}

        /// <summary>
        /// 构造函数
        /// </summary>
        public ${config.name}(Guid id) : base(id)
        {
        }

${this.generateMethods(config.methods || [])}
    }
}`
  }

  /**
   * 生成实体
   */
  generateEntity(config: DddEntityConfig): string {
    logger.info('🚀 生成实体', { name: config.name })

    return `// 自动生成的实体
// 生成时间: ${new Date().toISOString()}

using System;
using Volo.Abp.Domain.Entities;

namespace ${config.namespace}.Domain.Entities
{
    /// <summary>
    /// ${config.name} 实体
    /// </summary>
    public class ${config.name} : Entity<Guid>
    {
${this.generateProperties(config.properties)}

        /// <summary>
        /// 构造函数
        /// </summary>
        public ${config.name}(Guid id) : base(id)
        {
        }
    }
}`
  }

  /**
   * 生成值对象
   */
  generateValueObject(config: DddEntityConfig): string {
    logger.info('🚀 生成值对象', { name: config.name })

    return `// 自动生成的值对象
// 生成时间: ${new Date().toISOString()}

using System;
using Volo.Abp.Domain.Values;

namespace ${config.namespace}.Domain.ValueObjects
{
    /// <summary>
    /// ${config.name} 值对象
    /// </summary>
    public class ${config.name} : ValueObject
    {
${this.generateProperties(config.properties)}

        /// <summary>
        /// 构造函数
        /// </summary>
        public ${config.name}(${this.generateConstructorParams(config.properties)})
        {
${this.generateConstructorAssignments(config.properties)}
        }

        protected override IEnumerable<object> GetAtomicValues()
        {
${this.generateAtomicValues(config.properties)}
        }
    }
}`
  }

  /**
   * 生成仓储接口
   */
  generateRepository(config: DddEntityConfig): string {
    logger.info('🚀 生成仓储接口', { name: config.name })

    return `// 自动生成的仓储接口
// 生成时间: ${new Date().toISOString()}

using System;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace ${config.namespace}.Domain.Repositories
{
    /// <summary>
    /// ${config.name} 仓储接口
    /// </summary>
    public interface I${config.name}Repository : IRepository<${config.name}, Guid>
    {
        /// <summary>
        /// 根据名称查找
        /// </summary>
        Task<${config.name}> FindByNameAsync(string name);

        /// <summary>
        /// 检查名称是否存在
        /// </summary>
        Task<bool> IsNameExistsAsync(string name);
    }
}`
  }

  /**
   * 生成属性
   */
  private generateProperties(properties: PropertyConfig[]): string {
    return properties
      .map(
        p => `        /// <summary>
        /// ${p.name}
        /// </summary>
        public ${p.type} ${p.name} { get; set; }`
      )
      .join('\n\n')
  }

  /**
   * 生成方法
   */
  private generateMethods(methods: MethodConfig[]): string {
    return methods
      .map(
        m => `        /// <summary>
        /// ${m.name}
        /// </summary>
        public ${m.returnType} ${m.name}(${this.generateMethodParams(m.parameters)})
        {
            // TODO: 实现业务逻辑
            throw new NotImplementedException();
        }`
      )
      .join('\n\n')
  }

  /**
   * 生成方法参数
   */
  private generateMethodParams(parameters: { name: string; type: string }[]): string {
    return parameters.map(p => `${p.type} ${p.name}`).join(', ')
  }

  /**
   * 生成构造函数参数
   */
  private generateConstructorParams(properties: PropertyConfig[]): string {
    return properties.map(p => `${p.type} ${this.toLowerCamelCase(p.name)}`).join(', ')
  }

  /**
   * 生成构造函数赋值
   */
  private generateConstructorAssignments(properties: PropertyConfig[]): string {
    return properties
      .map(p => `            ${p.name} = ${this.toLowerCamelCase(p.name)};`)
      .join('\n')
  }

  /**
   * 生成原子值
   */
  private generateAtomicValues(properties: PropertyConfig[]): string {
    return properties.map(p => `            yield return ${p.name};`).join('\n')
  }

  /**
   * 转换为小驼峰
   */
  private toLowerCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1)
  }
}
