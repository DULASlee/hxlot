/**
 * 🔥 CQRS模式代码生成器
 * 
 * 功能：
 * 1. 生成Command命令
 * 2. 生成Query查询
 * 3. 生成Handler处理器
 * 4. 集成MediatR
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

export interface CqrsCommandConfig {
  name: string
  namespace: string
  properties: { name: string; type: string }[]
  returnType: string
}

export interface CqrsQueryConfig {
  name: string
  namespace: string
  parameters: { name: string; type: string }[]
  returnType: string
}

/**
 * CQRS代码生成器
 */
export class CqrsCodeGenerator {
  private namespace: string

  constructor(namespace: string = 'SmartAbp') {
    this.namespace = namespace
  }

  /**
   * 生成Command命令
   */
  generateCommand(config: CqrsCommandConfig): string {
    logger.info('🚀 生成CQRS Command', { name: config.name })

    return `// 自动生成的CQRS Command
// 生成时间: ${new Date().toISOString()}

using System;
using MediatR;

namespace ${config.namespace}.Application.Commands
{
    /// <summary>
    /// ${config.name} 命令
    /// </summary>
    public class ${config.name}Command : IRequest<${config.returnType}>
    {
${this.generateProperties(config.properties)}
    }
}`
  }

  /**
   * 生成Command Handler
   */
  generateCommandHandler(config: CqrsCommandConfig): string {
    return `// 自动生成的Command Handler
// 生成时间: ${new Date().toISOString()}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using Volo.Abp.Domain.Repositories;

namespace ${config.namespace}.Application.CommandHandlers
{
    /// <summary>
    /// ${config.name} 命令处理器
    /// </summary>
    public class ${config.name}Handler : IRequestHandler<${config.name}Command, ${config.returnType}>
    {
        private readonly ILogger<${config.name}Handler> _logger;

        public ${config.name}Handler(ILogger<${config.name}Handler> logger)
        {
            _logger = logger;
        }

        public async Task<${config.returnType}> Handle(
            ${config.name}Command request, 
            CancellationToken cancellationToken)
        {
            _logger.LogInformation($"处理${config.name}命令");

            // TODO: 实现命令处理逻辑
            
            await Task.CompletedTask;
            return default;
        }
    }
}`
  }

  /**
   * 生成Query查询
   */
  generateQuery(config: CqrsQueryConfig): string {
    logger.info('🚀 生成CQRS Query', { name: config.name })

    return `// 自动生成的CQRS Query
// 生成时间: ${new Date().toISOString()}

using System;
using MediatR;

namespace ${config.namespace}.Application.Queries
{
    /// <summary>
    /// ${config.name} 查询
    /// </summary>
    public class ${config.name}Query : IRequest<${config.returnType}>
    {
${this.generateProperties(config.parameters)}
    }
}`
  }

  /**
   * 生成Query Handler
   */
  generateQueryHandler(config: CqrsQueryConfig): string {
    return `// 自动生成的Query Handler
// 生成时间: ${new Date().toISOString()}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ${config.namespace}.Application.QueryHandlers
{
    /// <summary>
    /// ${config.name} 查询处理器
    /// </summary>
    public class ${config.name}Handler : IRequestHandler<${config.name}Query, ${config.returnType}>
    {
        private readonly ILogger<${config.name}Handler> _logger;

        public ${config.name}Handler(ILogger<${config.name}Handler> logger)
        {
            _logger = logger;
        }

        public async Task<${config.returnType}> Handle(
            ${config.name}Query request, 
            CancellationToken cancellationToken)
        {
            _logger.LogInformation($"处理${config.name}查询");

            // TODO: 实现查询逻辑
            
            await Task.CompletedTask;
            return default;
        }
    }
}`
  }

  /**
   * 生成属性
   */
  private generateProperties(properties: { name: string; type: string }[]): string {
    return properties
      .map(
        p => `        /// <summary>
        /// ${p.name}
        /// </summary>
        public ${p.type} ${p.name} { get; set; }`
      )
      .join('\n\n')
  }
}
