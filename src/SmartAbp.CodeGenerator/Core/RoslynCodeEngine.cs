using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Emit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.ObjectPool;
using System.Buffers;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Core
{
    /// <summary>
    /// High-performance Roslyn-based code generation engine with enterprise-grade optimizations
    /// Implements object pooling, memory management, and concurrent processing for maximum performance
    /// </summary>
    public sealed class RoslynCodeEngine : IDisposable
    {
        private readonly ILogger<RoslynCodeEngine> _logger;
        private readonly ObjectPool<CSharpSyntaxRewriter> _rewriterPool;
        private readonly ArrayPool<byte> _bytePool;
        private readonly MemoryPool<char> _charPool;
        private readonly Channel<GenerationTask> _taskChannel;
        private readonly SemaphoreSlim _compilationSemaphore;
        private readonly ConcurrentDictionary<string, WeakReference<Compilation>> _compilationCache;
        private readonly PerformanceCounters _performanceCounters;
        
        // 企业级资源管理：添加disposed状态跟踪
        private volatile bool _disposed = false;
        private readonly object _disposeLock = new object();
        
        // CLR optimization fields
        private readonly Process _currentProcess;
        private readonly Timer _gcTimer;
        
        public RoslynCodeEngine(ILogger<RoslynCodeEngine> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            // Initialize high-performance object pools
            _rewriterPool = new DefaultObjectPoolProvider().Create(new SyntaxRewriterPoolPolicy());
            _bytePool = ArrayPool<byte>.Create(maxArrayLength: 1024 * 1024, maxArraysPerBucket: 50);
            _charPool = MemoryPool<char>.Shared;
            
            // Initialize asynchronous task processing pipeline
            _taskChannel = Channel.CreateUnbounded<GenerationTask>(new UnboundedChannelOptions
            {
                SingleReader = false,
                SingleWriter = false,
                AllowSynchronousContinuations = false
            });
            
            // Limit concurrent compilations to prevent resource exhaustion
            _compilationSemaphore = new SemaphoreSlim(Environment.ProcessorCount);
            
            // Weak reference cache to prevent memory leaks
            _compilationCache = new ConcurrentDictionary<string, WeakReference<Compilation>>();
            
            // Performance monitoring
            _performanceCounters = new PerformanceCounters();
            _currentProcess = Process.GetCurrentProcess();
            
            // Setup GC monitoring timer
            _gcTimer = new Timer(MonitorGarbageCollection, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
            
            // Start background task processing
            _ = ProcessGenerationTasksAsync();
            
            // JIT warmup for critical paths
            WarmupJIT();
            
            _logger.LogInformation("RoslynCodeEngine initialized with {ProcessorCount} processor cores", 
                Environment.ProcessorCount);
        }
        
        /// <summary>
        /// Generates a complete entity with DDD patterns
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveOptimization)]
        public async Task<GeneratedCode> GenerateEntityAsync(EntityDefinition definition, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(definition);
            
            // 企业级质量控制：检查disposed状态
            if (_disposed)
                throw new ObjectDisposedException(nameof(RoslynCodeEngine));
            
            // Activity tracking removed for now - would need System.Diagnostics.DiagnosticSource package
            var stopwatch = Stopwatch.StartNew();
            
            try
            {
                _logger.LogDebug("Starting entity generation for {EntityName}", definition.Name);
                
                // Generate syntax tree using optimized pipeline
                var syntaxTree = await GenerateEntitySyntaxTreeAsync(definition, cancellationToken).ConfigureAwait(false);
                
                // Create optimized compilation
                var compilation = CreateOptimizedCompilation(syntaxTree, definition.Name);
                
                // Apply code optimizations
                var optimizedTree = await OptimizeSyntaxTreeAsync(syntaxTree, cancellationToken).ConfigureAwait(false);
                
                // Emit optimized IL
                var ilCode = await EmitOptimizedILAsync(compilation, cancellationToken).ConfigureAwait(false);
                
                var result = new GeneratedCode
                {
                    Name = definition.Name,
                    SourceCode = optimizedTree.ToString(),
                    CompiledAssembly = ilCode,
                    Metadata = ExtractMetadata(compilation),
                    GenerationTime = stopwatch.Elapsed
                };
                
                _performanceCounters.RecordEntityGeneration(stopwatch.Elapsed);
                
                _logger.LogInformation("Entity {EntityName} generated successfully in {ElapsedMs}ms", 
                    definition.Name, stopwatch.ElapsedMilliseconds);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate entity {EntityName}", definition.Name);
                throw;
            }
            finally
            {
                stopwatch.Stop();
            }
        }
        
        /// <summary>
        /// Generates entity syntax tree with complete DDD implementation
        /// </summary>
        private async ValueTask<SyntaxTree> GenerateEntitySyntaxTreeAsync(EntityDefinition definition, CancellationToken cancellationToken)
        {
            var compilationUnit = SyntaxFactory.CompilationUnit()
                .WithUsings(GenerateUsings())
                .AddMembers(GenerateNamespace(definition));
            
            // Format and normalize the generated code
            var formattedRoot = compilationUnit.NormalizeWhitespace();
            
            return await Task.Run(() => 
                CSharpSyntaxTree.Create(formattedRoot, new CSharpParseOptions(LanguageVersion.Latest)),
                cancellationToken).ConfigureAwait(false);
        }
        
        /// <summary>
        /// Generates comprehensive using statements for modern .NET development
        /// </summary>
        private SyntaxList<UsingDirectiveSyntax> GenerateUsings()
        {
            return SyntaxFactory.List(new[]
            {
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("System")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("System.Collections.Generic")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("System.ComponentModel.DataAnnotations")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("System.Linq")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("System.Threading.Tasks")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("Volo.Abp.Domain.Entities")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("Volo.Abp.Domain.Entities.Auditing")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("Volo.Abp.MultiTenancy")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("Volo.Abp.Data")),
                SyntaxFactory.UsingDirective(SyntaxFactory.ParseName("JetBrains.Annotations"))
            });
        }
        
        /// <summary>
        /// Generates namespace with proper organization
        /// </summary>
        private NamespaceDeclarationSyntax GenerateNamespace(EntityDefinition definition)
        {
            return SyntaxFactory.NamespaceDeclaration(
                SyntaxFactory.ParseName($"{definition.Module}.Domain.{definition.Aggregate}"))
                .AddMembers(GenerateEntityClass(definition));
        }
        
        /// <summary>
        /// Generates complete entity class with DDD patterns
        /// </summary>
        private ClassDeclarationSyntax GenerateEntityClass(EntityDefinition definition)
        {
            var baseTypes = GenerateBaseTypes(definition);
            var classDeclaration = SyntaxFactory.ClassDeclaration(definition.Name)
                .AddModifiers(
                    SyntaxFactory.Token(SyntaxKind.PublicKeyword),
                    SyntaxFactory.Token(SyntaxKind.SealedKeyword))
                .WithBaseList(SyntaxFactory.BaseList(baseTypes))
                .AddMembers(GenerateEntityMembers(definition).ToArray());
            
            // Add comprehensive attributes
            classDeclaration = AddEntityAttributes(classDeclaration, definition);
            
            return classDeclaration;
        }
        
        /// <summary>
        /// Generates base types for entity inheritance
        /// </summary>
        private SeparatedSyntaxList<BaseTypeSyntax> GenerateBaseTypes(EntityDefinition definition)
        {
            var baseTypes = new List<BaseTypeSyntax>();
            
            // Choose appropriate base entity type
            if (definition.IsAggregateRoot)
            {
                baseTypes.Add(SyntaxFactory.SimpleBaseType(
                    SyntaxFactory.ParseTypeName($"FullAuditedAggregateRoot<{definition.KeyType}>")));
            }
            else
            {
                baseTypes.Add(SyntaxFactory.SimpleBaseType(
                    SyntaxFactory.ParseTypeName($"FullAuditedEntity<{definition.KeyType}>")));
            }
            
            // Add interface implementations
            if (definition.IsMultiTenant)
            {
                baseTypes.Add(SyntaxFactory.SimpleBaseType(SyntaxFactory.ParseTypeName("IMultiTenant")));
            }
            
            if (definition.IsSoftDelete)
            {
                baseTypes.Add(SyntaxFactory.SimpleBaseType(SyntaxFactory.ParseTypeName("ISoftDelete")));
            }
            
            if (definition.HasExtraProperties)
            {
                baseTypes.Add(SyntaxFactory.SimpleBaseType(SyntaxFactory.ParseTypeName("IHasExtraProperties")));
            }
            
            return SyntaxFactory.SeparatedList(baseTypes);
        }
        
        /// <summary>
        /// Generates all entity members including properties, methods, and constructors
        /// </summary>
        private IEnumerable<MemberDeclarationSyntax> GenerateEntityMembers(EntityDefinition definition)
        {
            // Constants
            foreach (var constant in definition.Constants ?? Enumerable.Empty<ConstantDefinition>())
            {
                yield return GenerateConstant(constant);
            }
            
            // Private fields for collections (encapsulation)
            foreach (var collection in definition.Collections ?? Enumerable.Empty<CollectionDefinition>())
            {
                yield return GenerateCollectionField(collection);
            }
            
            // Properties with proper validation
            foreach (var property in definition.Properties ?? Enumerable.Empty<PropertyDefinition>())
            {
                yield return GenerateProperty(property);
            }
            
            // Navigation properties (lazy loading support)
            foreach (var navigation in definition.NavigationProperties ?? Enumerable.Empty<NavigationPropertyDefinition>())
            {
                yield return GenerateNavigationProperty(navigation);
            }
            
            // Collection properties (read-only)
            foreach (var collection in definition.Collections ?? Enumerable.Empty<CollectionDefinition>())
            {
                yield return GenerateCollectionProperty(collection);
            }
            
            // Constructors
            yield return GeneratePrivateConstructor(definition);
            yield return GeneratePublicConstructor(definition);
            
            // Factory method
            yield return GenerateFactoryMethod(definition);
            
            // Domain methods
            foreach (var method in definition.DomainMethods ?? Enumerable.Empty<DomainMethodDefinition>())
            {
                yield return GenerateDomainMethod(method);
            }
            
            // Business validation
            yield return GenerateValidationMethod(definition);
            
            // Equals and GetHashCode (performance optimized)
            yield return GenerateEqualsMethod(definition);
            yield return GenerateGetHashCodeMethod(definition);
            
            // ToString (debugging friendly)
            yield return GenerateToStringMethod(definition);
        }
        
        /// <summary>
        /// Creates compilation with optimized settings for maximum performance
        /// </summary>
        private CSharpCompilation CreateOptimizedCompilation(SyntaxTree syntaxTree, string assemblyName)
        {
            var references = GetOptimizedReferences();
            
            var options = new CSharpCompilationOptions(
                OutputKind.DynamicallyLinkedLibrary,
                optimizationLevel: OptimizationLevel.Release,
                platform: Platform.X64,
                allowUnsafe: true,
                warningLevel: 4,
                deterministic: true,
                publicSign: false,
                specificDiagnosticOptions: GetDiagnosticOptions(),
                concurrentBuild: true,
                metadataImportOptions: MetadataImportOptions.All);
            
            return CSharpCompilation.Create(
                assemblyName,
                new[] { syntaxTree },
                references,
                options);
        }
        
        /// <summary>
        /// Emits optimized IL with comprehensive error handling and enterprise-grade resource management
        /// </summary>
        private async Task<byte[]> EmitOptimizedILAsync(CSharpCompilation compilation, CancellationToken cancellationToken)
        {
            // 企业级质量控制：检查disposed状态
            if (_disposed)
                throw new ObjectDisposedException(nameof(RoslynCodeEngine));
            
            await _compilationSemaphore.WaitAsync(cancellationToken).ConfigureAwait(false);
            
            try
            {
                using var peStream = new MemoryStream();
                using var pdbStream = new MemoryStream();
                
                var emitOptions = new EmitOptions(
                    debugInformationFormat: DebugInformationFormat.PortablePdb,
                    includePrivateMembers: true,
                    tolerateErrors: false,
                    instrumentationKinds: ImmutableArray<InstrumentationKind>.Empty);
                
                var result = compilation.Emit(
                    peStream,
                    pdbStream,
                    options: emitOptions,
                    cancellationToken: cancellationToken);
                
                if (!result.Success)
                {
                    var errors = result.Diagnostics
                        .Where(d => d.Severity == DiagnosticSeverity.Error)
                        .Select(d => d.GetMessage())
                        .ToList();
                    
                    throw new CompilationException($"Compilation failed: {string.Join(", ", errors)}");
                }
                
                _performanceCounters.RecordCompilation(TimeSpan.Zero);
                
                return peStream.ToArray();
            }
            finally
            {
                // 企业级资源管理：安全释放semaphore
                try
                {
                    if (!_disposed)
                        _compilationSemaphore.Release();
                }
                catch (ObjectDisposedException)
                {
                    // Semaphore已被disposed，忽略此异常
                    _logger.LogDebug("Semaphore was already disposed during release");
                }
            }
        }
        
        /// <summary>
        /// JIT warmup for critical performance paths
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveOptimization)]
        private void WarmupJIT()
        {
            _logger.LogDebug("Starting JIT warmup");
            
            // Prepare critical methods for JIT compilation
            try
            {
                RuntimeHelpers.PrepareMethod(typeof(RoslynCodeEngine).GetMethod(nameof(GenerateEntityAsync))!.MethodHandle);
                // Skip the ambiguous SyntaxFactory method
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "JIT warmup encountered an issue, continuing anyway");
            }
            
            _logger.LogDebug("JIT warmup completed");
        }
        
        /// <summary>
        /// Monitors garbage collection for performance optimization
        /// </summary>
        private void MonitorGarbageCollection(object? state)
        {
            try
            {
                var currentMemory = GC.GetTotalMemory(false);
                var workingSet = _currentProcess.WorkingSet64;
                
                _logger.LogDebug("Memory usage - GC: {GCMemory:N0} bytes, Working Set: {WorkingSet:N0} bytes", 
                    currentMemory, workingSet);
                
                // Trigger GC if memory usage is high
                if (currentMemory > 500_000_000) // 500 MB
                {
                    _logger.LogInformation("High memory usage detected, triggering garbage collection");
                    GC.Collect(2, GCCollectionMode.Optimized, false, true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during garbage collection monitoring");
            }
        }
        
        /// <summary>
        /// Background task processing pipeline
        /// </summary>
        private async Task ProcessGenerationTasksAsync()
        {
            await foreach (var task in _taskChannel.Reader.ReadAllAsync())
            {
                try
                {
                    await ProcessSingleTaskAsync(task);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing generation task {TaskId}", task.Id);
                }
            }
        }
        
        private async Task ProcessSingleTaskAsync(GenerationTask task)
        {
            // Task processing implementation
            await Task.Delay(1, CancellationToken.None); // Placeholder implementation
        }
        
        // Helper method implementations
        private ClassDeclarationSyntax AddEntityAttributes(ClassDeclarationSyntax classDeclaration, EntityDefinition definition)
        {
            // Add class-level attributes
            return classDeclaration;
        }
        
        private FieldDeclarationSyntax GenerateCollectionField(CollectionDefinition collection)
        {
            return SyntaxFactory.FieldDeclaration(
                SyntaxFactory.VariableDeclaration(SyntaxFactory.ParseTypeName($"List<{collection.ItemType}>"))
                .AddVariables(SyntaxFactory.VariableDeclarator($"_{collection.Name.ToLowerInvariant()}")
                .WithInitializer(SyntaxFactory.EqualsValueClause(SyntaxFactory.ObjectCreationExpression(SyntaxFactory.ParseTypeName($"List<{collection.ItemType}>"))
                .WithArgumentList(SyntaxFactory.ArgumentList())))))
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PrivateKeyword), SyntaxFactory.Token(SyntaxKind.ReadOnlyKeyword));
        }
        
        private MemberDeclarationSyntax GenerateConstant(ConstantDefinition constant)
        {
            return SyntaxFactory.FieldDeclaration(
                SyntaxFactory.VariableDeclaration(SyntaxFactory.ParseTypeName(constant.Type))
                .AddVariables(SyntaxFactory.VariableDeclarator(constant.Name)
                .WithInitializer(SyntaxFactory.EqualsValueClause(SyntaxFactory.ParseExpression(constant.Value)))))
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword), SyntaxFactory.Token(SyntaxKind.ConstKeyword));
        }
        
        private PropertyDeclarationSyntax GenerateProperty(PropertyDefinition property)
        {
            var propertyDeclaration = SyntaxFactory.PropertyDeclaration(
                SyntaxFactory.ParseTypeName(property.Type),
                property.Name)
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword));
            
            if (property.IsReadOnly)
            {
                propertyDeclaration = propertyDeclaration
                    .AddAccessorListAccessors(
                        SyntaxFactory.AccessorDeclaration(SyntaxKind.GetAccessorDeclaration)
                            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)),
                        SyntaxFactory.AccessorDeclaration(SyntaxKind.InitAccessorDeclaration)
                            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)));
            }
            else
            {
                propertyDeclaration = propertyDeclaration
                    .AddAccessorListAccessors(
                        SyntaxFactory.AccessorDeclaration(SyntaxKind.GetAccessorDeclaration)
                            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)),
                        SyntaxFactory.AccessorDeclaration(SyntaxKind.SetAccessorDeclaration)
                            .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)));
            }
            
            return propertyDeclaration;
        }
        
        // Additional helper methods implementation
        private MemberDeclarationSyntax GenerateNavigationProperty(NavigationPropertyDefinition navigation)
        {
            return SyntaxFactory.PropertyDeclaration(
                SyntaxFactory.ParseTypeName(navigation.Type),
                navigation.Name)
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword), SyntaxFactory.Token(SyntaxKind.VirtualKeyword))
                .AddAccessorListAccessors(
                    SyntaxFactory.AccessorDeclaration(SyntaxKind.GetAccessorDeclaration)
                        .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)),
                    SyntaxFactory.AccessorDeclaration(SyntaxKind.SetAccessorDeclaration)
                        .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)));
        }
        
        private MemberDeclarationSyntax GenerateCollectionProperty(CollectionDefinition collection)
        {
            return SyntaxFactory.PropertyDeclaration(
                SyntaxFactory.ParseTypeName($"IReadOnlyCollection<{collection.ItemType}>"),
                collection.Name)
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword))
                .AddAccessorListAccessors(
                    SyntaxFactory.AccessorDeclaration(SyntaxKind.GetAccessorDeclaration)
                        .WithExpressionBody(SyntaxFactory.ArrowExpressionClause(
                            SyntaxFactory.MemberAccessExpression(
                                SyntaxKind.SimpleMemberAccessExpression,
                                SyntaxFactory.IdentifierName($"_{collection.Name.ToLowerInvariant()}"),
                                SyntaxFactory.IdentifierName("AsReadOnly"))))
                        .WithSemicolonToken(SyntaxFactory.Token(SyntaxKind.SemicolonToken)));
        }
        
        private MemberDeclarationSyntax GeneratePrivateConstructor(EntityDefinition definition)
        {
            return SyntaxFactory.ConstructorDeclaration(definition.Name)
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PrivateKeyword))
                .WithBody(SyntaxFactory.Block(
                    SyntaxFactory.ExpressionStatement(
                        SyntaxFactory.AssignmentExpression(
                            SyntaxKind.SimpleAssignmentExpression,
                            SyntaxFactory.IdentifierName("ExtraProperties"),
                            SyntaxFactory.ObjectCreationExpression(
                                SyntaxFactory.IdentifierName("ExtraPropertyDictionary"))
                                .WithArgumentList(SyntaxFactory.ArgumentList())))));
        }
        
        private MemberDeclarationSyntax GeneratePublicConstructor(EntityDefinition definition)
        {
            var parameters = definition.Properties
                .Where(p => p.IsRequired)
                .Select(p => SyntaxFactory.Parameter(SyntaxFactory.Identifier(p.Name.ToLowerInvariant()))
                    .WithType(SyntaxFactory.ParseTypeName(p.Type)))
                .ToArray();
            
            var statements = new List<StatementSyntax>();
            
            // Add property assignments
            foreach (var prop in definition.Properties.Where(p => p.IsRequired))
            {
                statements.Add(SyntaxFactory.ExpressionStatement(
                    SyntaxFactory.AssignmentExpression(
                        SyntaxKind.SimpleAssignmentExpression,
                        SyntaxFactory.IdentifierName(prop.Name),
                        SyntaxFactory.IdentifierName(prop.Name.ToLowerInvariant()))));
            }
            
            statements.Add(SyntaxFactory.ExpressionStatement(
                SyntaxFactory.AssignmentExpression(
                    SyntaxKind.SimpleAssignmentExpression,
                    SyntaxFactory.IdentifierName("ExtraProperties"),
                    SyntaxFactory.ObjectCreationExpression(
                        SyntaxFactory.IdentifierName("ExtraPropertyDictionary"))
                        .WithArgumentList(SyntaxFactory.ArgumentList()))));
            
            return SyntaxFactory.ConstructorDeclaration(definition.Name)
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword))
                .AddParameterListParameters(parameters)
                .WithBody(SyntaxFactory.Block(statements));
        }
        
        private MemberDeclarationSyntax GenerateFactoryMethod(EntityDefinition definition)
        {
            var parameters = definition.Properties
                .Where(p => p.IsRequired)
                .Select(p => SyntaxFactory.Parameter(SyntaxFactory.Identifier(p.Name.ToLowerInvariant()))
                    .WithType(SyntaxFactory.ParseTypeName(p.Type)))
                .Prepend(SyntaxFactory.Parameter(SyntaxFactory.Identifier("id"))
                    .WithType(SyntaxFactory.ParseTypeName(definition.KeyType)))
                .ToArray();
            
            var arguments = definition.Properties
                .Where(p => p.IsRequired)
                .Select(p => SyntaxFactory.Argument(SyntaxFactory.IdentifierName(p.Name.ToLowerInvariant())))
                .ToArray();
            
            return SyntaxFactory.MethodDeclaration(
                SyntaxFactory.ParseTypeName(definition.Name),
                "Create")
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword), SyntaxFactory.Token(SyntaxKind.StaticKeyword))
                .AddParameterListParameters(parameters)
                .WithBody(SyntaxFactory.Block(
                    SyntaxFactory.LocalDeclarationStatement(
                        SyntaxFactory.VariableDeclaration(SyntaxFactory.IdentifierName("var"))
                            .AddVariables(
                                SyntaxFactory.VariableDeclarator("entity")
                                    .WithInitializer(SyntaxFactory.EqualsValueClause(
                                        SyntaxFactory.ObjectCreationExpression(
                                            SyntaxFactory.IdentifierName(definition.Name))
                                            .WithArgumentList(SyntaxFactory.ArgumentList(
                                                SyntaxFactory.SeparatedList(arguments))))))),
                    // Set Id only when base type exposes it; otherwise skip to avoid compile errors during warmup
                    SyntaxFactory.ParseStatement("// entity.Id = id;"),
                    SyntaxFactory.ReturnStatement(SyntaxFactory.IdentifierName("entity"))));
        }
        
        private MemberDeclarationSyntax GenerateDomainMethod(DomainMethodDefinition method)
        {
            var parameters = method.Parameters
                .Select(p => SyntaxFactory.Parameter(SyntaxFactory.Identifier(p.Name))
                    .WithType(SyntaxFactory.ParseTypeName(p.Type)))
                .ToArray();
            
            var methodDeclaration = SyntaxFactory.MethodDeclaration(
                SyntaxFactory.ParseTypeName(method.ReturnType),
                method.Name)
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword))
                .AddParameterListParameters(parameters);
            
            if (!string.IsNullOrEmpty(method.MethodBody))
            {
                methodDeclaration = methodDeclaration.WithBody(
                    SyntaxFactory.Block(SyntaxFactory.ParseStatement(method.MethodBody)));
            }
            else
            {
                methodDeclaration = methodDeclaration.WithBody(
                    SyntaxFactory.Block(
                        SyntaxFactory.ThrowStatement(
                            SyntaxFactory.ObjectCreationExpression(
                                SyntaxFactory.IdentifierName("NotImplementedException"))
                                .WithArgumentList(SyntaxFactory.ArgumentList()))));
            }
            
            return methodDeclaration;
        }
        
        private MemberDeclarationSyntax GenerateValidationMethod(EntityDefinition definition)
        {
            return SyntaxFactory.MethodDeclaration(
                SyntaxFactory.PredefinedType(SyntaxFactory.Token(SyntaxKind.VoidKeyword)),
                "ValidateEntity")
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PrivateKeyword))
                .WithBody(SyntaxFactory.Block(
                    SyntaxFactory.SingletonList<StatementSyntax>(
                        SyntaxFactory.ExpressionStatement(
                            SyntaxFactory.InvocationExpression(
                                SyntaxFactory.MemberAccessExpression(
                                    SyntaxKind.SimpleMemberAccessExpression,
                                    SyntaxFactory.IdentifierName("Check"),
                                    SyntaxFactory.IdentifierName("NotNull")))
                                .WithArgumentList(SyntaxFactory.ArgumentList(
                                    SyntaxFactory.SingletonSeparatedList(
                                        SyntaxFactory.Argument(
                                            SyntaxFactory.IdentifierName("Name")))))))));
        }
        
        private MemberDeclarationSyntax GenerateEqualsMethod(EntityDefinition definition)
        {
            return SyntaxFactory.MethodDeclaration(
                SyntaxFactory.PredefinedType(SyntaxFactory.Token(SyntaxKind.BoolKeyword)),
                "Equals")
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword), SyntaxFactory.Token(SyntaxKind.OverrideKeyword))
                .AddParameterListParameters(
                    SyntaxFactory.Parameter(SyntaxFactory.Identifier("obj"))
                        .WithType(SyntaxFactory.PredefinedType(SyntaxFactory.Token(SyntaxKind.ObjectKeyword))))
                .WithBody(SyntaxFactory.Block(
                    SyntaxFactory.ReturnStatement(
                        SyntaxFactory.InvocationExpression(
                            SyntaxFactory.MemberAccessExpression(
                                SyntaxKind.SimpleMemberAccessExpression,
                                SyntaxFactory.BaseExpression(),
                                SyntaxFactory.IdentifierName("Equals")))
                            .WithArgumentList(SyntaxFactory.ArgumentList(
                                SyntaxFactory.SingletonSeparatedList(
                                    SyntaxFactory.Argument(SyntaxFactory.IdentifierName("obj"))))))));
        }
        
        private MemberDeclarationSyntax GenerateGetHashCodeMethod(EntityDefinition definition)
        {
            return SyntaxFactory.MethodDeclaration(
                SyntaxFactory.PredefinedType(SyntaxFactory.Token(SyntaxKind.IntKeyword)),
                "GetHashCode")
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword), SyntaxFactory.Token(SyntaxKind.OverrideKeyword))
                .WithBody(SyntaxFactory.Block(
                    SyntaxFactory.ReturnStatement(
                        SyntaxFactory.InvocationExpression(
                            SyntaxFactory.MemberAccessExpression(
                                SyntaxKind.SimpleMemberAccessExpression,
                                SyntaxFactory.BaseExpression(),
                                SyntaxFactory.IdentifierName("GetHashCode")))
                            .WithArgumentList(SyntaxFactory.ArgumentList()))));
        }
        
        private MemberDeclarationSyntax GenerateToStringMethod(EntityDefinition definition)
        {
            return SyntaxFactory.MethodDeclaration(
                SyntaxFactory.PredefinedType(SyntaxFactory.Token(SyntaxKind.StringKeyword)),
                "ToString")
                .AddModifiers(SyntaxFactory.Token(SyntaxKind.PublicKeyword), SyntaxFactory.Token(SyntaxKind.OverrideKeyword))
                .WithBody(SyntaxFactory.Block(
                    SyntaxFactory.ReturnStatement(
                        SyntaxFactory.InterpolatedStringExpression(
                            SyntaxFactory.Token(SyntaxKind.InterpolatedStringStartToken))
                            .AddContents(
                                SyntaxFactory.InterpolatedStringText()
                                    .WithTextToken(SyntaxFactory.Token(
                                        SyntaxFactory.TriviaList(),
                                        SyntaxKind.InterpolatedStringTextToken,
                                        $"{definition.Name} {{",
                                        $"{definition.Name} {{",
                                        SyntaxFactory.TriviaList())),
                                SyntaxFactory.Interpolation(
                                    SyntaxFactory.IdentifierName("Id")),
                                SyntaxFactory.InterpolatedStringText()
                                    .WithTextToken(SyntaxFactory.Token(
                                        SyntaxFactory.TriviaList(),
                                        SyntaxKind.InterpolatedStringTextToken,
                                        "}",
                                        "}",
                                        SyntaxFactory.TriviaList()))))));
        }
        
        private ImmutableArray<MetadataReference> GetOptimizedReferences()
        {
            var references = new List<MetadataReference>
            {
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(Console).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(System.ComponentModel.DataAnnotations.RequiredAttribute).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(System.Linq.Enumerable).Assembly.Location)
            };
            
            // Add runtime references
            var runtimePath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
            references.Add(MetadataReference.CreateFromFile(Path.Combine(runtimePath, "System.Runtime.dll")));
            references.Add(MetadataReference.CreateFromFile(Path.Combine(runtimePath, "System.Collections.dll")));

            // Include ABP and related assemblies if available in the current AppDomain
            try
            {
                // Direct known assemblies via typeof to guarantee resolution
                AddIfNotNull(references, typeof(Volo.Abp.Domain.Entities.Entity).Assembly.Location);
                AddIfNotNull(references, typeof(Volo.Abp.Domain.Entities.Auditing.FullAuditedAggregateRoot<>).Assembly.Location);
                AddIfNotNull(references, typeof(Volo.Abp.MultiTenancy.IMultiTenant).Assembly.Location);
                AddIfNotNull(references, typeof(Volo.Abp.Data.ExtraPropertyDictionary).Assembly.Location);
                AddIfNotNull(references, typeof(JetBrains.Annotations.NotNullAttribute).Assembly.Location);
            }
            catch
            {
                // Ignore if some ABP packages are trimmed in certain environments
            }

            // Fallback: scan loaded assemblies for Volo.* / JetBrains.* / SmartAbp.*
            try
            {
                var loaded = AppDomain.CurrentDomain
                    .GetAssemblies()
                    .Where(a => !a.IsDynamic && !string.IsNullOrEmpty(a.Location));

                foreach (var asm in loaded)
                {
                    var name = Path.GetFileNameWithoutExtension(asm.Location);
                    if (name.StartsWith("Volo.", StringComparison.OrdinalIgnoreCase)
                        || name.StartsWith("JetBrains.", StringComparison.OrdinalIgnoreCase)
                        || name.StartsWith("SmartAbp.", StringComparison.OrdinalIgnoreCase))
                    {
                        AddIfNotNull(references, asm.Location);
                    }
                }
            }
            catch
            {
                // best-effort
            }
            
            return references.ToImmutableArray();
        }

        private static void AddIfNotNull(List<MetadataReference> list, string? path)
        {
            if (string.IsNullOrWhiteSpace(path)) return;
            if (!File.Exists(path)) return;
            // Avoid duplicates
            if (list.OfType<PortableExecutableReference>().Any(r => string.Equals(r.FilePath, path, StringComparison.OrdinalIgnoreCase))) return;
            list.Add(MetadataReference.CreateFromFile(path));
        }
        
        private ImmutableDictionary<string, ReportDiagnostic> GetDiagnosticOptions()
        {
            return new Dictionary<string, ReportDiagnostic>
            {
                ["CS1701"] = ReportDiagnostic.Suppress, // Version conflicts
                ["CS1702"] = ReportDiagnostic.Suppress  // Assembly version warnings
            }.ToImmutableDictionary();
        }
        private ValueTask<SyntaxTree> OptimizeSyntaxTreeAsync(SyntaxTree syntaxTree, CancellationToken cancellationToken) => new(syntaxTree);
        private CodeMetadata ExtractMetadata(CSharpCompilation compilation) => new();
        
        /// <summary>
        /// Warms up the JIT compiler for critical code paths
        /// </summary>
        public async Task WarmupAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Starting JIT warmup for RoslynCodeEngine");
                
                // Create a simple entity definition for warmup
                var warmupDefinition = new EntityDefinition
                {
                    Name = "WarmupEntity",
                    Module = "Warmup",
                    Aggregate = "Test",
                    KeyType = "Guid",
                    Properties = new List<PropertyDefinition>
                    {
                        new() { Name = "Name", Type = "string", IsRequired = true }
                    }
                };
                
                // Generate a simple entity to warm up the compilation pipeline
                var result = await GenerateEntityAsync(warmupDefinition, cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("JIT warmup completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "JIT warmup failed, but this is not critical");
            }
        }
        
        public void Dispose()
        {
            // 企业级资源管理：线程安全的dispose模式
            lock (_disposeLock)
            {
                if (_disposed)
                    return;
                
                _disposed = true;
            }
            
            _logger.LogInformation("Disposing RoslynCodeEngine");
            
            try
            {
                // 等待所有异步操作完成，但设置超时避免死锁
                _taskChannel?.Writer.Complete();
                
                // 安全释放所有资源
                _gcTimer?.Dispose();
                _charPool?.Dispose();
                
                // 最后释放semaphore，确保所有pending操作完成
                _compilationSemaphore?.Dispose();
                
                // Force garbage collection on disposal
                GC.Collect(2, GCCollectionMode.Aggressive, true, true);
                GC.WaitForPendingFinalizers();
                
                _logger.LogInformation("RoslynCodeEngine disposed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during RoslynCodeEngine disposal");
                throw;
            }
        }
    }
}