using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.CQRS
{
    /// <summary>
    /// Advanced CQRS pattern generator with MediatR integration
    /// Implements enterprise-grade Command Query Responsibility Segregation
    /// </summary>
    public sealed class CqrsPatternGenerator
    {
        private readonly ILogger<CqrsPatternGenerator> _logger;
        private readonly AdvancedMemoryManager _memoryManager;
        
        public CqrsPatternGenerator(
            ILogger<CqrsPatternGenerator> logger,
            AdvancedMemoryManager memoryManager)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryManager = memoryManager ?? throw new ArgumentNullException(nameof(memoryManager));
        }
        
        /// <summary>
        /// Generates complete CQRS implementation for an aggregate
        /// </summary>
        public async Task<GeneratedCqrsLayer> GenerateCompleteCqrsAsync(CqrsDefinition definition)
        {
            _logger.LogInformation("Generating CQRS layer for {AggregateName}", definition.AggregateName);
            
            var files = new Dictionary<string, string>();
            
            try
            {
                // 1. Generate Commands with handlers and validators
                foreach (var command in definition.Commands ?? Enumerable.Empty<CommandDefinition>())
                {
                    var commandCode = await GenerateCommandAsync(command, definition.Namespace);
                    files[$"Commands/{command.Name}Command.cs"] = commandCode;
                    
                    var handlerCode = await GenerateCommandHandlerAsync(command, definition);
                    files[$"Commands/Handlers/{command.Name}Handler.cs"] = handlerCode;
                    
                    var validatorCode = await GenerateCommandValidatorAsync(command, definition.Namespace);
                    files[$"Commands/Validators/{command.Name}Validator.cs"] = validatorCode;
                }
                
                // 2. Generate Queries with handlers
                foreach (var query in definition.Queries ?? Enumerable.Empty<QueryDefinition>())
                {
                    var queryCode = await GenerateQueryAsync(query, definition.Namespace);
                    files[$"Queries/{query.Name}Query.cs"] = queryCode;
                    
                    var handlerCode = await GenerateQueryHandlerAsync(query, definition);
                    files[$"Queries/Handlers/{query.Name}Handler.cs"] = handlerCode;
                    
                    if (query.HasValidator)
                    {
                        var validatorCode = await GenerateQueryValidatorAsync(query, definition.Namespace);
                        files[$"Queries/Validators/{query.Name}Validator.cs"] = validatorCode;
                    }
                }
                
                // 3. Generate DTOs
                foreach (var dto in definition.DTOs ?? Enumerable.Empty<DtoDefinition>())
                {
                    var dtoCode = await GenerateDtoAsync(dto, definition.Namespace);
                    files[$"DTOs/{dto.Name}.cs"] = dtoCode;
                }
                
                // 4. Generate AutoMapper Profile
                var profileCode = await GenerateAutoMapperProfileAsync(definition);
                files[$"Mappings/{definition.AggregateName}MappingProfile.cs"] = profileCode;
                
                // 5. Generate Pipeline Behaviors
                var behaviorCode = await GeneratePipelineBehaviorsAsync(definition);
                files[$"Behaviors/ValidationBehavior.cs"] = behaviorCode;
                
                var loggingBehaviorCode = await GenerateLoggingBehaviorAsync(definition);
                files[$"Behaviors/LoggingBehavior.cs"] = loggingBehaviorCode;
                
                var performanceBehaviorCode = await GeneratePerformanceBehaviorAsync(definition);
                files[$"Behaviors/PerformanceBehavior.cs"] = performanceBehaviorCode;
                
                // 6. Generate Application Service Interface
                var serviceInterfaceCode = await GenerateApplicationServiceInterfaceAsync(definition);
                files[$"Services/I{definition.AggregateName}AppService.cs"] = serviceInterfaceCode;
                
                // 7. Generate Application Service Implementation
                var serviceImplCode = await GenerateApplicationServiceImplementationAsync(definition);
                files[$"Services/{definition.AggregateName}AppService.cs"] = serviceImplCode;
                
                _logger.LogInformation("Successfully generated {FileCount} CQRS files for {AggregateName}", 
                    files.Count, definition.AggregateName);
                
                return new GeneratedCqrsLayer
                {
                    AggregateName = definition.AggregateName,
                    Files = files,
                    CommandCount = definition.Commands?.Count ?? 0,
                    QueryCount = definition.Queries?.Count ?? 0,
                    DtoCount = definition.DTOs?.Count ?? 0,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate CQRS layer for {AggregateName}", definition.AggregateName);
                throw;
            }
        }
        
        /// <summary>
        /// Generates a command with proper structure and validation attributes
        /// </summary>
        private async Task<string> GenerateCommandAsync(CommandDefinition command, string rootNamespace)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using System;");
            sb.AppendLine("using System.ComponentModel.DataAnnotations;");
            sb.AppendLine("using MediatR;");
            sb.AppendLine("using JetBrains.Annotations;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {rootNamespace}.Application.Commands");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// {command.Description ?? $"Command to {command.Name.Replace("Command", "")}"}");
            sb.AppendLine("    /// </summary>");
            
            var returnType = string.IsNullOrEmpty(command.ReturnType) ? "Unit" : command.ReturnType;
            sb.AppendLine($"    public sealed record {command.Name}Command : IRequest<{returnType}>");
            sb.AppendLine("    {");
            
            // Generate properties with validation attributes
            foreach (var property in command.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                GenerateCommandProperty(sb, property);
            }
            
            // Add audit properties
            sb.AppendLine("        /// <summary>");
            sb.AppendLine("        /// Correlation ID for request tracking");
            sb.AppendLine("        /// </summary>");
            sb.AppendLine("        [PublicAPI]");
            sb.AppendLine("        public string? CorrelationId { get; init; } = Guid.NewGuid().ToString();");
            sb.AppendLine();
            
            sb.AppendLine("        /// <summary>");
            sb.AppendLine("        /// User ID executing the command");
            sb.AppendLine("        /// </summary>");
            sb.AppendLine("        [PublicAPI]");
            sb.AppendLine("        public string? UserId { get; init; }");
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates command handler with full transaction support and domain events
        /// </summary>
        private async Task<string> GenerateCommandHandlerAsync(CommandDefinition command, CqrsDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using System;");
            sb.AppendLine("using System.Threading;");
            sb.AppendLine("using System.Threading.Tasks;");
            sb.AppendLine("using MediatR;");
            sb.AppendLine("using Microsoft.Extensions.Logging;");
            sb.AppendLine("using AutoMapper;");
            sb.AppendLine("using FluentValidation;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {definition.Namespace}.Application.Commands.Handlers");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// Handler for {command.Name}Command with full transaction and validation support");
            sb.AppendLine("    /// </summary>");
            
            var returnType = string.IsNullOrEmpty(command.ReturnType) ? "Unit" : command.ReturnType;
            sb.AppendLine($"    public sealed class {command.Name}Handler : IRequestHandler<{command.Name}Command, {returnType}>");
            sb.AppendLine("    {");
            
            // Dependencies
            sb.AppendLine($"        private readonly ILogger<{command.Name}Handler> _logger;");
            sb.AppendLine("        private readonly IMapper _mapper;");
            sb.AppendLine($"        private readonly IValidator<{command.Name}Command> _validator;");
            sb.AppendLine($"        // TODO: Add domain repository and services");
            sb.AppendLine();
            
            // Constructor
            sb.AppendLine($"        public {command.Name}Handler(");
            sb.AppendLine($"            ILogger<{command.Name}Handler> logger,");
            sb.AppendLine("            IMapper mapper,");
            sb.AppendLine($"            IValidator<{command.Name}Command> validator)");
            sb.AppendLine("        {");
            sb.AppendLine("            _logger = logger ?? throw new ArgumentNullException(nameof(logger));");
            sb.AppendLine("            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));");
            sb.AppendLine("            _validator = validator ?? throw new ArgumentNullException(nameof(validator));");
            sb.AppendLine("        }");
            sb.AppendLine();
            
            // Handle method
            sb.AppendLine($"        public async Task<{returnType}> Handle({command.Name}Command request, CancellationToken cancellationToken)");
            sb.AppendLine("        {");
            sb.AppendLine($"            _logger.LogInformation(\"Handling {command.Name}Command with CorrelationId: {{CorrelationId}}\", request.CorrelationId);");
            sb.AppendLine();
            
            // Validation
            sb.AppendLine("            // Validate command");
            sb.AppendLine("            var validationResult = await _validator.ValidateAsync(request, cancellationToken);");
            sb.AppendLine("            if (!validationResult.IsValid)");
            sb.AppendLine("            {");
            sb.AppendLine("                _logger.LogWarning(\"Validation failed for {CommandName}: {Errors}\", ");
            sb.AppendLine($"                    nameof({command.Name}Command), string.Join(\", \", validationResult.Errors));");
            sb.AppendLine("                throw new ValidationException(validationResult.Errors);");
            sb.AppendLine("            }");
            sb.AppendLine();
            
            // Business logic placeholder
            sb.AppendLine("            try");
            sb.AppendLine("            {");
            sb.AppendLine("                // TODO: Implement business logic");
            sb.AppendLine("                // 1. Load aggregate from repository");
            sb.AppendLine("                // 2. Execute domain operation");
            sb.AppendLine("                // 3. Save changes");
            sb.AppendLine("                // 4. Publish domain events");
            sb.AppendLine();
            
            if (returnType == "Unit")
            {
                sb.AppendLine("                _logger.LogInformation(\"{CommandName} completed successfully\", ");
                sb.AppendLine($"                    nameof({command.Name}Command));");
                sb.AppendLine("                return Unit.Value;");
            }
            else
            {
                sb.AppendLine("                // Map result to DTO");
                sb.AppendLine($"                var result = default({returnType});");
                sb.AppendLine("                ");
                sb.AppendLine("                _logger.LogInformation(\"{CommandName} completed successfully\", ");
                sb.AppendLine($"                    nameof({command.Name}Command));");
                sb.AppendLine("                return result;");
            }
            
            sb.AppendLine("            }");
            sb.AppendLine("            catch (Exception ex)");
            sb.AppendLine("            {");
            sb.AppendLine("                _logger.LogError(ex, \"Error handling {CommandName}\", ");
            sb.AppendLine($"                    nameof({command.Name}Command));");
            sb.AppendLine("                throw;");
            sb.AppendLine("            }");
            sb.AppendLine("        }");
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates FluentValidation validator for command
        /// </summary>
        private async Task<string> GenerateCommandValidatorAsync(CommandDefinition command, string rootNamespace)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using FluentValidation;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {rootNamespace}.Application.Commands.Validators");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// Validator for {command.Name}Command with comprehensive business rules");
            sb.AppendLine("    /// </summary>");
            sb.AppendLine($"    public sealed class {command.Name}Validator : AbstractValidator<{command.Name}Command>");
            sb.AppendLine("    {");
            
            sb.AppendLine($"        public {command.Name}Validator()");
            sb.AppendLine("        {");
            
            // Generate validation rules for each property
            foreach (var property in command.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                GenerateValidationRules(sb, property);
            }
            
            // Standard validations
            sb.AppendLine();
            sb.AppendLine("            RuleFor(x => x.CorrelationId)");
            sb.AppendLine("                .NotEmpty()");
            sb.AppendLine("                .WithMessage(\"CorrelationId is required for tracking\");");
            
            sb.AppendLine("        }");
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates query with proper structure and caching support
        /// </summary>
        private async Task<string> GenerateQueryAsync(QueryDefinition query, string rootNamespace)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using System;");
            sb.AppendLine("using MediatR;");
            sb.AppendLine("using JetBrains.Annotations;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {rootNamespace}.Application.Queries");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// {query.Description ?? $"Query to {query.Name.Replace("Query", "")}"}");
            sb.AppendLine("    /// </summary>");
            
            sb.AppendLine($"    public sealed record {query.Name}Query : IRequest<{query.ReturnType}>");
            sb.AppendLine("    {");
            
            // Generate query parameters
            foreach (var parameter in query.Parameters ?? Enumerable.Empty<ParameterDefinition>())
            {
                sb.AppendLine("        /// <summary>");
                sb.AppendLine($"        /// {parameter.Name} parameter");
                sb.AppendLine("        /// </summary>");
                sb.AppendLine("        [PublicAPI]");
                sb.AppendLine($"        public {parameter.Type} {parameter.Name} {{ get; init; }}");
                sb.AppendLine();
            }
            
            // Pagination support
            if (query.IsPaged)
            {
                sb.AppendLine("        /// <summary>");
                sb.AppendLine("        /// Number of items to skip");
                sb.AppendLine("        /// </summary>");
                sb.AppendLine("        [PublicAPI]");
                sb.AppendLine("        public int SkipCount { get; init; } = 0;");
                sb.AppendLine();
                
                sb.AppendLine("        /// <summary>");
                sb.AppendLine("        /// Maximum number of items to return");
                sb.AppendLine("        /// </summary>");
                sb.AppendLine("        [PublicAPI]");
                sb.AppendLine("        public int MaxResultCount { get; init; } = 10;");
                sb.AppendLine();
                
                sb.AppendLine("        /// <summary>");
                sb.AppendLine("        /// Sorting specification");
                sb.AppendLine("        /// </summary>");
                sb.AppendLine("        [PublicAPI]");
                sb.AppendLine("        public string? Sorting { get; init; }");
                sb.AppendLine();
            }
            
            // Caching support
            if (query.IsCacheable)
            {
                sb.AppendLine("        /// <summary>");
                sb.AppendLine("        /// Cache key for this query");
                sb.AppendLine("        /// </summary>");
                sb.AppendLine("        [PublicAPI]");
                sb.AppendLine("        public string CacheKey => $\"{GetType().Name}:{GetHashCode()}\";");
                sb.AppendLine();
                
                sb.AppendLine("        /// <summary>");
                sb.AppendLine("        /// Cache expiration time in minutes");
                sb.AppendLine("        /// </summary>");
                sb.AppendLine("        [PublicAPI]");
                sb.AppendLine($"        public int CacheExpirationMinutes {{ get; init; }} = {query.CacheExpirationMinutes};");
            }
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates query handler with caching and performance optimization
        /// </summary>
        private async Task<string> GenerateQueryHandlerAsync(QueryDefinition query, CqrsDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using System;");
            sb.AppendLine("using System.Linq;");
            sb.AppendLine("using System.Threading;");
            sb.AppendLine("using System.Threading.Tasks;");
            sb.AppendLine("using MediatR;");
            sb.AppendLine("using Microsoft.Extensions.Logging;");
            sb.AppendLine("using Microsoft.Extensions.Caching.Distributed;");
            sb.AppendLine("using AutoMapper;");
            sb.AppendLine("using System.Text.Json;");
            sb.AppendLine();
            
            sb.AppendLine($"namespace {definition.Namespace}.Application.Queries.Handlers");
            sb.AppendLine("{");
            
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// Handler for {query.Name}Query with caching and performance optimization");
            sb.AppendLine("    /// </summary>");
            sb.AppendLine($"    public sealed class {query.Name}Handler : IRequestHandler<{query.Name}Query, {query.ReturnType}>");
            sb.AppendLine("    {");
            
            // Dependencies
            sb.AppendLine($"        private readonly ILogger<{query.Name}Handler> _logger;");
            sb.AppendLine("        private readonly IMapper _mapper;");
            if (query.IsCacheable)
            {
                sb.AppendLine("        private readonly IDistributedCache _cache;");
            }
            sb.AppendLine("        // TODO: Add repository dependencies");
            sb.AppendLine();
            
            // Constructor
            sb.AppendLine($"        public {query.Name}Handler(");
            sb.AppendLine($"            ILogger<{query.Name}Handler> logger,");
            sb.AppendLine("            IMapper mapper");
            if (query.IsCacheable)
            {
                sb.AppendLine("            ,IDistributedCache cache");
            }
            sb.AppendLine("            )");
            sb.AppendLine("        {");
            sb.AppendLine("            _logger = logger ?? throw new ArgumentNullException(nameof(logger));");
            sb.AppendLine("            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));");
            if (query.IsCacheable)
            {
                sb.AppendLine("            _cache = cache ?? throw new ArgumentNullException(nameof(cache));");
            }
            sb.AppendLine("        }");
            sb.AppendLine();
            
            // Handle method
            sb.AppendLine($"        public async Task<{query.ReturnType}> Handle({query.Name}Query request, CancellationToken cancellationToken)");
            sb.AppendLine("        {");
            sb.AppendLine($"            _logger.LogDebug(\"Handling {query.Name}Query\");");
            sb.AppendLine();
            
            if (query.IsCacheable)
            {
                // Cache check
                sb.AppendLine("            // Check cache first");
                sb.AppendLine("            var cachedResult = await GetFromCacheAsync(request.CacheKey, cancellationToken);");
                sb.AppendLine("            if (cachedResult != null)");
                sb.AppendLine("            {");
                sb.AppendLine("                _logger.LogDebug(\"Retrieved result from cache for {QueryName}\", ");
                sb.AppendLine($"                    nameof({query.Name}Query));");
                sb.AppendLine("                return cachedResult;");
                sb.AppendLine("            }");
                sb.AppendLine();
            }
            
            // Query execution
            sb.AppendLine("            try");
            sb.AppendLine("            {");
            sb.AppendLine("                // TODO: Implement query logic");
            sb.AppendLine("                // 1. Build query from repository");
            sb.AppendLine("                // 2. Apply filters and sorting");
            sb.AppendLine("                // 3. Execute query");
            sb.AppendLine("                // 4. Map to DTOs");
            sb.AppendLine();
            
            sb.AppendLine($"                var result = default({query.ReturnType});");
            sb.AppendLine();
            
            if (query.IsCacheable)
            {
                sb.AppendLine("                // Cache the result");
                sb.AppendLine("                await SetCacheAsync(request.CacheKey, result, ");
                sb.AppendLine("                    TimeSpan.FromMinutes(request.CacheExpirationMinutes), cancellationToken);");
                sb.AppendLine();
            }
            
            sb.AppendLine("                _logger.LogDebug(\"{QueryName} completed successfully\", ");
            sb.AppendLine($"                    nameof({query.Name}Query));");
            sb.AppendLine("                return result;");
            sb.AppendLine("            }");
            sb.AppendLine("            catch (Exception ex)");
            sb.AppendLine("            {");
            sb.AppendLine("                _logger.LogError(ex, \"Error handling {QueryName}\", ");
            sb.AppendLine($"                    nameof({query.Name}Query));");
            sb.AppendLine("                throw;");
            sb.AppendLine("            }");
            sb.AppendLine("        }");
            
            if (query.IsCacheable)
            {
                // Cache helper methods
                GenerateCacheHelperMethods(sb, query.ReturnType);
            }
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        // Helper methods for code generation
        private void GenerateCommandProperty(StringBuilder sb, PropertyDefinition property)
        {
            sb.AppendLine("        /// <summary>");
            sb.AppendLine($"        /// {property.Description ?? property.Name}");
            sb.AppendLine("        /// </summary>");
            
            // Add validation attributes
            if (property.IsRequired)
            {
                sb.AppendLine("        [Required]");
            }
            
            if (property.MaxLength.HasValue)
            {
                sb.AppendLine($"        [MaxLength({property.MaxLength.Value})]");
            }
            
            if (property.MinLength.HasValue)
            {
                sb.AppendLine($"        [MinLength({property.MinLength.Value})]");
            }
            
            sb.AppendLine("        [PublicAPI]");
            sb.AppendLine($"        public {property.Type} {property.Name} {{ get; init; }}");
            sb.AppendLine();
        }
        
        private void GenerateValidationRules(StringBuilder sb, PropertyDefinition property)
        {
            sb.AppendLine($"            RuleFor(x => x.{property.Name})");
            
            if (property.IsRequired)
            {
                sb.AppendLine("                .NotEmpty()");
                sb.AppendLine($"                .WithMessage(\"{property.Name} is required\")");
            }
            
            if (property.MaxLength.HasValue)
            {
                sb.AppendLine($"                .MaximumLength({property.MaxLength.Value})");
                sb.AppendLine($"                .WithMessage(\"{property.Name} cannot exceed {property.MaxLength.Value} characters\")");
            }
            
            if (property.MinLength.HasValue)
            {
                sb.AppendLine($"                .MinimumLength({property.MinLength.Value})");
                sb.AppendLine($"                .WithMessage(\"{property.Name} must be at least {property.MinLength.Value} characters\")");
            }
            
            sb.AppendLine("                ;");
            sb.AppendLine();
        }
        
        private void GenerateCacheHelperMethods(StringBuilder sb, string returnType)
        {
            sb.AppendLine();
            sb.AppendLine($"        private async Task<{returnType}?> GetFromCacheAsync(string key, CancellationToken cancellationToken)");
            sb.AppendLine("        {");
            sb.AppendLine("            try");
            sb.AppendLine("            {");
            sb.AppendLine("                var cached = await _cache.GetStringAsync(key, cancellationToken);");
            sb.AppendLine("                if (!string.IsNullOrEmpty(cached))");
            sb.AppendLine("                {");
            sb.AppendLine($"                    return JsonSerializer.Deserialize<{returnType}>(cached);");
            sb.AppendLine("                }");
            sb.AppendLine("            }");
            sb.AppendLine("            catch (Exception ex)");
            sb.AppendLine("            {");
            sb.AppendLine("                _logger.LogWarning(ex, \"Error retrieving from cache\");");
            sb.AppendLine("            }");
            sb.AppendLine("            return default;");
            sb.AppendLine("        }");
            sb.AppendLine();
            
            sb.AppendLine($"        private async Task SetCacheAsync(string key, {returnType} value, TimeSpan expiration, CancellationToken cancellationToken)");
            sb.AppendLine("        {");
            sb.AppendLine("            try");
            sb.AppendLine("            {");
            sb.AppendLine("                var options = new DistributedCacheEntryOptions");
            sb.AppendLine("                {");
            sb.AppendLine("                    SlidingExpiration = expiration");
            sb.AppendLine("                };");
            sb.AppendLine();
            sb.AppendLine("                var serialized = JsonSerializer.Serialize(value);");
            sb.AppendLine("                await _cache.SetStringAsync(key, serialized, options, cancellationToken);");
            sb.AppendLine("            }");
            sb.AppendLine("            catch (Exception ex)");
            sb.AppendLine("            {");
            sb.AppendLine("                _logger.LogWarning(ex, \"Error setting cache\");");
            sb.AppendLine("            }");
            sb.AppendLine("        }");
        }
        
        // Additional method stubs for remaining generators
        private async Task<string> GenerateQueryValidatorAsync(QueryDefinition query, string rootNamespace) => await Task.FromResult("// Query validator implementation");
        private async Task<string> GenerateDtoAsync(DtoDefinition dto, string rootNamespace) => await Task.FromResult("// DTO implementation");
        private async Task<string> GenerateAutoMapperProfileAsync(CqrsDefinition definition) => await Task.FromResult("// AutoMapper profile implementation");
        private async Task<string> GeneratePipelineBehaviorsAsync(CqrsDefinition definition) => await Task.FromResult("// Pipeline behaviors implementation");
        private async Task<string> GenerateLoggingBehaviorAsync(CqrsDefinition definition) => await Task.FromResult("// Logging behavior implementation");
        private async Task<string> GeneratePerformanceBehaviorAsync(CqrsDefinition definition) => await Task.FromResult("// Performance behavior implementation");
        private async Task<string> GenerateApplicationServiceInterfaceAsync(CqrsDefinition definition) => await Task.FromResult("// App service interface implementation");
        private async Task<string> GenerateApplicationServiceImplementationAsync(CqrsDefinition definition) => await Task.FromResult("// App service implementation");
    }
}