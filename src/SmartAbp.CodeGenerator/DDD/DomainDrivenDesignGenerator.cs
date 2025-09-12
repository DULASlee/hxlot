using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.DDD
{
    /// <summary>
    /// Advanced Domain-Driven Design code generator
    /// </summary>
    public sealed class DomainDrivenDesignGenerator
    {
        private readonly ILogger<DomainDrivenDesignGenerator> _logger;
        private readonly AdvancedMemoryManager _memoryManager;

        public DomainDrivenDesignGenerator(
            ILogger<DomainDrivenDesignGenerator> logger,
            AdvancedMemoryManager memoryManager)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryManager = memoryManager ?? throw new ArgumentNullException(nameof(memoryManager));
        }

        /// <summary>
        /// Generates complete DDD domain layer
        /// </summary>
        public async Task<GeneratedDddSolution> GenerateCompleteDomainAsync(DddDefinition definition)
        {
            _logger.LogInformation("Generating DDD domain layer for {ModuleName}", definition.ModuleName);

            var files = new Dictionary<string, string>();
            var startTime = DateTime.UtcNow;

            try
            {
                // Generate Aggregates
                foreach (var aggregate in definition.Aggregates ?? Enumerable.Empty<AggregateDefinition>())
                {
                    files[$"Aggregates/{aggregate.Name}.cs"] = await GenerateAggregateRootAsync(aggregate, definition);
                    
                    foreach (var entity in aggregate.ChildEntities ?? Enumerable.Empty<EntityDefinition>())
                    {
                        files[$"Entities/{entity.Name}.cs"] = await GenerateEntityAsync(entity, definition);
                    }
                }

                // Generate Value Objects
                foreach (var vo in definition.ValueObjects ?? Enumerable.Empty<ValueObjectDefinition>())
                {
                    files[$"ValueObjects/{vo.Name}.cs"] = await GenerateValueObjectAsync(vo, definition);
                }

                // Generate Domain Events
                foreach (var evt in definition.DomainEvents ?? Enumerable.Empty<DomainEventDefinition>())
                {
                    files[$"Events/{evt.Name}.cs"] = await GenerateDomainEventAsync(evt, definition);
                }

                // Generate Repositories
                foreach (var repo in definition.Repositories ?? Enumerable.Empty<RepositoryDefinition>())
                {
                    files[$"Repositories/I{repo.Name}.cs"] = await GenerateRepositoryInterfaceAsync(repo, definition);
                }

                // Generate Domain Services
                foreach (var service in definition.DomainServices ?? Enumerable.Empty<DomainServiceDefinition>())
                {
                    files[$"Services/I{service.Name}.cs"] = await GenerateDomainServiceInterfaceAsync(service, definition);
                    files[$"Services/{service.Name}.cs"] = await GenerateDomainServiceAsync(service, definition);
                }

                var generationTime = DateTime.UtcNow - startTime;

                return new GeneratedDddSolution
                {
                    ModuleName = definition.ModuleName,
                    Files = files,
                    AggregateCount = definition.Aggregates?.Count ?? 0,
                    ValueObjectCount = definition.ValueObjects?.Count ?? 0,
                    DomainEventCount = definition.DomainEvents?.Count ?? 0,
                    RepositoryCount = definition.Repositories?.Count ?? 0,
                    DomainServiceCount = definition.DomainServices?.Count ?? 0,
                    GeneratedAt = DateTime.UtcNow,
                    GenerationTime = generationTime,
                    TotalLinesOfCode = files.Values.Sum(code => code.Split('\n').Length)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate DDD domain layer");
                throw;
            }
        }

        private async Task<string> GenerateAggregateRootAsync(AggregateDefinition aggregate, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;
using JetBrains.Annotations;

namespace {definition.Namespace}.Domain.Aggregates
{{
    /// <summary>
    /// {aggregate.Description ?? $"Aggregate root for {aggregate.Name}"}
    /// </summary>
    public sealed class {aggregate.Name} : FullAuditedAggregateRoot<{aggregate.KeyType}>, IMultiTenant
    {{");

            // Properties
            foreach (var prop in aggregate.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                sb.AppendLine($@"        /// <summary>
        /// {prop.Description ?? prop.Name}
        /// </summary>
        [PublicAPI]
        public virtual {prop.Type} {prop.Name} {{ get; protected set; }}");
            }

            sb.AppendLine($@"
        /// <summary>
        /// Tenant ID for multi-tenancy
        /// </summary>
        public virtual Guid? TenantId {{ get; protected set; }}

        /// <summary>
        /// Protected constructor for EF Core
        /// </summary>
        protected {aggregate.Name}() {{ }}

        /// <summary>
        /// Creates a new {aggregate.Name}
        /// </summary>
        public {aggregate.Name}({string.Join(", ", (aggregate.Properties ?? Enumerable.Empty<PropertyDefinition>()).Where(p => p.IsRequired).Select(p => $"{p.Type} {p.Name.ToLowerInvariant()}"))})
        {{");

            foreach (var prop in (aggregate.Properties ?? Enumerable.Empty<PropertyDefinition>()).Where(p => p.IsRequired))
            {
                sb.AppendLine($"            {prop.Name} = {prop.Name.ToLowerInvariant()};");
            }

            sb.AppendLine(@"        }
    }
}");

            return await Task.FromResult(sb.ToString());
        }

        private async Task<string> GenerateEntityAsync(EntityDefinition entity, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System;
using Volo.Abp.Domain.Entities;
using JetBrains.Annotations;

namespace {definition.Namespace}.Domain.Entities
{{
    /// <summary>
    /// {entity.Description ?? $"Entity {entity.Name}"}
    /// </summary>
    public sealed class {entity.Name} : Entity<{entity.KeyType}>
    {{");

            foreach (var prop in entity.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                sb.AppendLine($@"        [PublicAPI]
        public virtual {prop.Type} {prop.Name} {{ get; protected set; }}");
            }

            sb.AppendLine($@"
        protected {entity.Name}() {{ }}
    }}
}}");

            return await Task.FromResult(sb.ToString());
        }

        private async Task<string> GenerateValueObjectAsync(ValueObjectDefinition valueObject, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Values;

namespace {definition.Namespace}.Domain.ValueObjects
{{
    public sealed class {valueObject.Name} : ValueObject
    {{");

            foreach (var prop in valueObject.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                sb.AppendLine($"        public {prop.Type} {prop.Name} {{ get; }}");
            }

            sb.AppendLine($@"
        public {valueObject.Name}({string.Join(", ", (valueObject.Properties ?? Enumerable.Empty<PropertyDefinition>()).Select(p => $"{p.Type} {p.Name.ToLowerInvariant()}"))})
        {{");

            foreach (var prop in valueObject.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                sb.AppendLine($"            {prop.Name} = {prop.Name.ToLowerInvariant()};");
            }

            sb.AppendLine($@"        }}

        protected override IEnumerable<object> GetAtomicValues()
        {{");

            foreach (var prop in valueObject.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                sb.AppendLine($"            yield return {prop.Name};");
            }

            sb.AppendLine(@"        }
    }
}");

            return await Task.FromResult(sb.ToString());
        }

        private async Task<string> GenerateDomainEventAsync(DomainEventDefinition domainEvent, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System;
using Volo.Abp.Domain.Entities.Events;

namespace {definition.Namespace}.Domain.Events
{{
    public sealed class {domainEvent.Name} : DomainEvent
    {{");

            foreach (var prop in domainEvent.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                sb.AppendLine($"        public {prop.Type} {prop.Name} {{ get; set; }}");
            }

            sb.AppendLine(@"    }
}");

            return await Task.FromResult(sb.ToString());
        }

        private async Task<string> GenerateRepositoryInterfaceAsync(RepositoryDefinition repository, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace {definition.Namespace}.Domain.Repositories
{{
    public interface I{repository.Name} : IRepository<{repository.AggregateType}, {repository.KeyType}>
    {{");

            foreach (var method in repository.CustomMethods ?? Enumerable.Empty<RepositoryMethodDefinition>())
            {
                var parameters = method.Parameters?.Select(p => $"{p.Type} {p.Name}") ?? Enumerable.Empty<string>();
                sb.AppendLine($"        Task<{method.ReturnType}> {method.Name}({string.Join(", ", parameters)});");
            }

            sb.AppendLine(@"    }
}");

            return await Task.FromResult(sb.ToString());
        }

        private async Task<string> GenerateDomainServiceInterfaceAsync(DomainServiceDefinition service, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System.Threading.Tasks;
using Volo.Abp.Domain.Services;

namespace {definition.Namespace}.Domain.Services
{{
    public interface I{service.Name} : IDomainService
    {{");

            foreach (var method in service.Methods ?? Enumerable.Empty<DomainMethodDefinition>())
            {
                var parameters = method.Parameters?.Select(p => $"{p.Type} {p.Name}") ?? Enumerable.Empty<string>();
                sb.AppendLine($"        {method.ReturnType} {method.Name}({string.Join(", ", parameters)});");
            }

            sb.AppendLine(@"    }
}");

            return await Task.FromResult(sb.ToString());
        }

        private async Task<string> GenerateDomainServiceAsync(DomainServiceDefinition service, DddDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;

            sb.AppendLine($@"using System;
using System.Threading.Tasks;
using Volo.Abp.Domain.Services;

namespace {definition.Namespace}.Domain.Services
{{
    public sealed class {service.Name} : DomainService, I{service.Name}
    {{");

            foreach (var method in service.Methods ?? Enumerable.Empty<DomainMethodDefinition>())
            {
                var parameters = method.Parameters?.Select(p => $"{p.Type} {p.Name}") ?? Enumerable.Empty<string>();
                sb.AppendLine($@"        public {method.ReturnType} {method.Name}({string.Join(", ", parameters)})
        {{
            throw new NotImplementedException();
        }}");
            }

            sb.AppendLine(@"    }
}");

            return await Task.FromResult(sb.ToString());
        }
    }
}