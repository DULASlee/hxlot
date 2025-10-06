/**
 * 🔥 DDD领域事件代码生成器
 * 
 * 功能：
 * 1. 生成领域事件类
 * 2. 生成事件处理器
 * 3. 生成事件发布代码
 * 4. 集成EventBus
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

export interface DomainEventConfig {
  name: string
  namespace: string
  aggregateName: string
  properties: { name: string; type: string }[]
  handlers?: EventHandlerConfig[]
}

export interface EventHandlerConfig {
  name: string
  action: string
}

/**
 * DDD领域事件生成器
 */
export class DddDomainEventGenerator {
  private namespace: string

  constructor(namespace: string = 'SmartAbp') {
    this.namespace = namespace
  }

  /**
   * 生成领域事件类
   */
  generateDomainEvent(config: DomainEventConfig): string {
    logger.info('🚀 生成领域事件', { name: config.name })

    return `// 自动生成的领域事件
// 生成时间: ${new Date().toISOString()}

using System;
using Volo.Abp.Domain.Entities.Events;

namespace ${config.namespace}.Domain.Events
{
    /// <summary>
    /// ${config.name} 领域事件
    /// </summary>
    public class ${config.name}DomainEvent : DomainEventBase
    {
        /// <summary>
        /// 聚合根ID
        /// </summary>
        public Guid ${config.aggregateName}Id { get; set; }

${this.generateEventProperties(config.properties)}

        /// <summary>
        /// 构造函数
        /// </summary>
        public ${config.name}DomainEvent(Guid ${this.toLowerCamelCase(config.aggregateName)}Id${this.generateConstructorParams(config.properties)})
        {
            ${config.aggregateName}Id = ${this.toLowerCamelCase(config.aggregateName)}Id;
${this.generateConstructorAssignments(config.properties)}
        }
    }
}`
  }

  /**
   * 生成事件处理器
   */
  generateEventHandler(config: DomainEventConfig): string {
    logger.info('🚀 生成事件处理器', { name: config.name })

    return `// 自动生成的事件处理器
// 生成时间: ${new Date().toISOString()}

using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EventBus;
using Microsoft.Extensions.Logging;

namespace ${config.namespace}.Domain.EventHandlers
{
    /// <summary>
    /// ${config.name} 事件处理器
    /// </summary>
    public class ${config.name}EventHandler : 
        ILocalEventHandler<${config.name}DomainEvent>, 
        ITransientDependency
    {
        private readonly ILogger<${config.name}EventHandler> _logger;

        public ${config.name}EventHandler(ILogger<${config.name}EventHandler> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 处理事件
        /// </summary>
        public async Task HandleEventAsync(${config.name}DomainEvent eventData)
        {
            _logger.LogInformation($"处理${config.name}事件: {eventData.${config.aggregateName}Id}");

            // 验证事件数据
            if (eventData == null)
            {
                throw new ArgumentNullException(nameof(eventData));
            }

            _logger.LogDebug($"事件详情: {{@EventData}}", eventData);

            // 执行事件处理逻辑
            await ExecuteEventHandlersAsync(eventData);

            // 执行配置的处理动作
${this.generateHandlerActions(config.handlers || [])}

            _logger.LogInformation($"${config.name}事件处理完成");
        }

        private async Task ExecuteEventHandlersAsync(${config.name}DomainEvent eventData)
        {
            // 实现具体的事件处理逻辑
            // 示例：
            // - 更新关联实体
            // - 发送通知/消息
            // - 触发后续业务流程
            // - 更新缓存
            // - 同步到其他系统

            try
            {
                // 业务处理逻辑
                await ProcessBusinessLogicAsync(eventData);

                // 发布集成事件（如需要跨服务通信）
                // await _eventBus.PublishAsync(new ${config.name}IntegrationEvent(eventData));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"处理${config.name}事件失败: {{EventId}}", eventData.${config.aggregateName}Id);
                throw;
            }
        }

        private async Task ProcessBusinessLogicAsync(${config.name}DomainEvent eventData)
        {
            // 实现具体的业务逻辑处理
            await Task.CompletedTask;
        }
    }
}`
  }

  /**
   * 生成事件发布代码
   */
  generateEventPublisher(config: DomainEventConfig): string {
    return `// 在聚合根中发布事件
// 添加到 ${config.aggregateName}.cs

using Volo.Abp.Domain.Entities.Events;

// 在需要发布事件的方法中添加:
public void SomeBusinessMethod()
{
    // 业务逻辑...
    
    // 发布领域事件
    AddDistributedEvent(new ${config.name}DomainEvent(
        Id,
        // 其他事件属性...
    ));
}`
  }

  /**
   * 生成仓储扩展方法
   */
  generateRepositoryExtension(entityName: string): string {
    logger.info('🚀 生成仓储扩展', { entityName })

    return `// 自动生成的仓储扩展方法
// 生成时间: ${new Date().toISOString()}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace ${this.namespace}.Domain.Repositories
{
    /// <summary>
    /// ${entityName} 仓储扩展接口
    /// </summary>
    public interface I${entityName}Repository : IRepository<${entityName}, Guid>
    {
        /// <summary>
        /// 根据名称查找
        /// </summary>
        Task<${entityName}> FindByNameAsync(string name);

        /// <summary>
        /// 获取分页列表
        /// </summary>
        Task<List<${entityName}>> GetPagedListAsync(
            int skipCount,
            int maxResultCount,
            string sorting = "CreationTime DESC",
            string filter = null
        );

        /// <summary>
        /// 获取总数
        /// </summary>
        Task<long> GetCountAsync(string filter = null);

        /// <summary>
        /// 检查名称是否存在
        /// </summary>
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);

        /// <summary>
        /// 批量插入
        /// </summary>
        Task BulkInsertAsync(IEnumerable<${entityName}> entities);

        /// <summary>
        /// 批量更新
        /// </summary>
        Task BulkUpdateAsync(IEnumerable<${entityName}> entities);

        /// <summary>
        /// 批量删除
        /// </summary>
        Task BulkDeleteAsync(IEnumerable<Guid> ids);
    }
}`
  }

  /**
   * 生成EF Core仓储实现
   */
  generateRepositoryImplementation(entityName: string): string {
    return `// 自动生成的EF Core仓储实现
// 生成时间: ${new Date().toISOString()}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using ${this.namespace}.EntityFrameworkCore;

namespace ${this.namespace}.EntityFrameworkCore.Repositories
{
    /// <summary>
    /// ${entityName} EF Core仓储实现
    /// </summary>
    public class ${entityName}Repository : 
        EfCoreRepository<SmartAbpDbContext, ${entityName}, Guid>, 
        I${entityName}Repository
    {
        public ${entityName}Repository(IDbContextProvider<SmartAbpDbContext> dbContextProvider) 
            : base(dbContextProvider)
        {
        }

        public async Task<${entityName}> FindByNameAsync(string name)
        {
            var dbSet = await GetDbSetAsync();
            return await dbSet.FirstOrDefaultAsync(x => x.Name == name);
        }

        public async Task<List<${entityName}>> GetPagedListAsync(
            int skipCount,
            int maxResultCount,
            string sorting = "CreationTime DESC",
            string filter = null)
        {
            var dbSet = await GetDbSetAsync();
            return await dbSet
                .WhereIf(!string.IsNullOrWhiteSpace(filter), x => x.Name.Contains(filter))
                .OrderBy(sorting)
                .Skip(skipCount)
                .Take(maxResultCount)
                .ToListAsync();
        }

        public async Task<long> GetCountAsync(string filter = null)
        {
            var dbSet = await GetDbSetAsync();
            return await dbSet
                .WhereIf(!string.IsNullOrWhiteSpace(filter), x => x.Name.Contains(filter))
                .LongCountAsync();
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null)
        {
            var dbSet = await GetDbSetAsync();
            return await dbSet
                .WhereIf(excludeId.HasValue, x => x.Id != excludeId.Value)
                .AnyAsync(x => x.Name == name);
        }

        public async Task BulkInsertAsync(IEnumerable<${entityName}> entities)
        {
            var dbContext = await GetDbContextAsync();
            await dbContext.Set<${entityName}>().AddRangeAsync(entities);
            await dbContext.SaveChangesAsync();
        }

        public async Task BulkUpdateAsync(IEnumerable<${entityName}> entities)
        {
            var dbContext = await GetDbContextAsync();
            dbContext.Set<${entityName}>().UpdateRange(entities);
            await dbContext.SaveChangesAsync();
        }

        public async Task BulkDeleteAsync(IEnumerable<Guid> ids)
        {
            var dbContext = await GetDbContextAsync();
            var entities = await dbContext.Set<${entityName}>()
                .Where(x => ids.Contains(x.Id))
                .ToListAsync();
            dbContext.Set<${entityName}>().RemoveRange(entities);
            await dbContext.SaveChangesAsync();
        }
    }
}`
  }

  /**
   * 生成事件属性
   */
  private generateEventProperties(properties: { name: string; type: string }[]): string {
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
   * 生成构造函数参数
   */
  private generateConstructorParams(properties: { name: string; type: string }[]): string {
    if (properties.length === 0) return ''
    return ', ' + properties.map(p => `${p.type} ${this.toLowerCamelCase(p.name)}`).join(', ')
  }

  /**
   * 生成构造函数赋值
   */
  private generateConstructorAssignments(properties: { name: string; type: string }[]): string {
    return properties
      .map(p => `            ${p.name} = ${this.toLowerCamelCase(p.name)};`)
      .join('\n')
  }

  /**
   * 生成处理器动作
   */
  private generateHandlerActions(handlers: EventHandlerConfig[]): string {
    if (handlers.length === 0) {
      return '            // 添加具体的业务逻辑'
    }
    return handlers
      .map(h => `            // ${h.name}\n            ${h.action}`)
      .join('\n\n')
  }

  /**
   * 转换为小驼峰
   */
  private toLowerCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1)
  }
}
