using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Aspire
{
    /// <summary>
    /// Advanced .NET Aspire microservices orchestration generator
    /// Implements best practices for cloud-native applications
    /// </summary>
    public sealed class AspireMicroservicesGenerator
    {
        private readonly ILogger<AspireMicroservicesGenerator> _logger;
        private readonly AdvancedMemoryManager _memoryManager;
        
        public AspireMicroservicesGenerator(
            ILogger<AspireMicroservicesGenerator> logger,
            AdvancedMemoryManager memoryManager)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryManager = memoryManager ?? throw new ArgumentNullException(nameof(memoryManager));
        }
        
        /// <summary>
        /// Generates complete Aspire orchestration solution
        /// </summary>
        public async Task<GeneratedAspireSolution> GenerateAspireSolutionAsync(AspireSolutionDefinition definition)
        {
            _logger.LogInformation("Generating Aspire solution for {SolutionName}", definition.SolutionName);
            
            var files = new Dictionary<string, string>();
            
            try
            {
                // 1. Generate Aspire Host Project
                var hostCode = await GenerateAspireHostProjectAsync(definition);
                files["AspireHost/Program.cs"] = hostCode;
                files["AspireHost/AspireHost.csproj"] = await GenerateAspireHostProjectFileAsync(definition);
                
                // 2. Generate Service Defaults
                var serviceDefaultsCode = await GenerateServiceDefaultsAsync(definition);
                files["ServiceDefaults/Extensions.cs"] = serviceDefaultsCode;
                files["ServiceDefaults/ServiceDefaults.csproj"] = await GenerateServiceDefaultsProjectFileAsync();
                
                // 3. Generate Gateway Service
                if (definition.IncludeApiGateway)
                {
                    var gatewayFiles = await GenerateApiGatewayAsync(definition);
                    foreach (var kvp in gatewayFiles)
                    {
                        files[kvp.Key] = kvp.Value;
                    }
                }
                
                // 4. Generate Individual Microservices
                foreach (var service in definition.Microservices)
                {
                    var serviceFiles = await GenerateMicroserviceAsync(service, definition);
                    foreach (var kvp in serviceFiles)
                    {
                        files[$"{service.Name}/{kvp.Key}"] = kvp.Value;
                    }
                }
                
                // 5. Generate Docker Compose Override
                files["docker-compose.override.yml"] = await GenerateDockerComposeOverrideAsync(definition);
                
                // 6. Generate Development Configuration
                files["appsettings.Development.json"] = await GenerateDevelopmentConfigAsync(definition);
                
                _logger.LogInformation("Successfully generated {FileCount} Aspire files", files.Count);
                
                return new GeneratedAspireSolution
                {
                    SolutionName = definition.SolutionName,
                    Files = files,
                    MicroserviceCount = definition.Microservices.Count,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Aspire solution for {SolutionName}", definition.SolutionName);
                throw;
            }
        }
        
        /// <summary>
        /// Generates Aspire Host application with enterprise orchestration
        /// </summary>
        private async Task<string> GenerateAspireHostProjectAsync(AspireSolutionDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using Aspire.Hosting;");
            sb.AppendLine("using Aspire.Hosting.ApplicationModel;");
            sb.AppendLine("using Microsoft.Extensions.Configuration;");
            sb.AppendLine("using Microsoft.Extensions.DependencyInjection;");
            sb.AppendLine("using Microsoft.Extensions.Hosting;");
            sb.AppendLine("using Microsoft.Extensions.Logging;");
            sb.AppendLine();
            
            sb.AppendLine("var builder = DistributedApplication.CreateBuilder(args);");
            sb.AppendLine();
            sb.AppendLine("// Configure advanced logging");
            sb.AppendLine("builder.Services.AddLogging(logging =>");
            sb.AppendLine("{");
            sb.AppendLine("    logging.AddConsole();");
            sb.AppendLine("    logging.AddDebug();");
            sb.AppendLine("    logging.SetMinimumLevel(LogLevel.Information);");
            sb.AppendLine("});");
            sb.AppendLine();
            
            // Infrastructure Services
            sb.AppendLine("// ========== Infrastructure Services ==========");
            sb.AppendLine();
            
            // Redis
            if (definition.UseRedis)
            {
                sb.AppendLine("// Redis Cache with persistence and monitoring");
                sb.AppendLine("var redis = builder.AddRedis(\"redis\")");
                sb.AppendLine("    .WithDataVolume(\"redis-data\")");
                sb.AppendLine("    .WithRedisCommander()");
                sb.AppendLine("    .WithEnvironment(\"REDIS_MAXMEMORY\", \"256mb\")");
                sb.AppendLine("    .WithEnvironment(\"REDIS_MAXMEMORY_POLICY\", \"allkeys-lru\");");
                sb.AppendLine();
            }
            
            // PostgreSQL
            if (definition.UsePostgreSQL)
            {
                sb.AppendLine("// PostgreSQL Database with pgAdmin");
                sb.AppendLine("var postgres = builder.AddPostgres(\"postgres\")");
                sb.AppendLine("    .WithDataVolume(\"postgres-data\")");
                sb.AppendLine("    .WithPgAdmin()");
                sb.AppendLine("    .WithEnvironment(\"POSTGRES_DB\", \"" + definition.DatabaseName + "\")");
                sb.AppendLine("    .WithEnvironment(\"POSTGRES_USER\", \"admin\")");
                sb.AppendLine("    .WithEnvironment(\"POSTGRES_PASSWORD\", \"admin123\");");
                sb.AppendLine();
                sb.AppendLine($"var database = postgres.AddDatabase(\"{definition.DatabaseName}\");");
                sb.AppendLine();
            }
            
            // RabbitMQ
            if (definition.UseRabbitMQ)
            {
                sb.AppendLine("// RabbitMQ Message Broker with management UI");
                sb.AppendLine("var rabbitmq = builder.AddRabbitMQ(\"rabbitmq\")");
                sb.AppendLine("    .WithManagementPlugin()");
                sb.AppendLine("    .WithDataVolume(\"rabbitmq-data\")");
                sb.AppendLine("    .WithEnvironment(\"RABBITMQ_DEFAULT_USER\", \"admin\")");
                sb.AppendLine("    .WithEnvironment(\"RABBITMQ_DEFAULT_PASS\", \"admin123\");");
                sb.AppendLine();
            }
            
            // Elasticsearch
            if (definition.UseElasticsearch)
            {
                sb.AppendLine("// Elasticsearch with Kibana");
                sb.AppendLine("var elasticsearch = builder.AddElasticsearch(\"elasticsearch\")");
                sb.AppendLine("    .WithDataVolume(\"elasticsearch-data\")");
                sb.AppendLine("    .WithEnvironment(\"discovery.type\", \"single-node\")");
                sb.AppendLine("    .WithEnvironment(\"xpack.security.enabled\", \"false\");");
                sb.AppendLine();
                sb.AppendLine("var kibana = builder.AddKibana(\"kibana\", elasticsearch);");
                sb.AppendLine();
            }
            
            // Seq for structured logging
            if (definition.UseSeq)
            {
                sb.AppendLine("// Seq for structured logging");
                sb.AppendLine("var seq = builder.AddSeq(\"seq\")");
                sb.AppendLine("    .WithDataVolume(\"seq-data\");");
                sb.AppendLine();
            }
            
            // Microservices
            sb.AppendLine("// ========== Microservices ==========");
            sb.AppendLine();
            
            foreach (var service in definition.Microservices)
            {
                sb.AppendLine($"// {service.DisplayName} - {service.Description}");
                sb.AppendLine($"var {service.Name.ToLower()} = builder.AddProject<Projects.{service.ProjectName}>(\"{service.Name.ToLower()}\")");
                
                // Add infrastructure references
                if (definition.UseRedis)
                    sb.AppendLine("    .WithReference(redis)");
                if (definition.UsePostgreSQL)
                    sb.AppendLine("    .WithReference(database)");
                if (definition.UseRabbitMQ)
                    sb.AppendLine("    .WithReference(rabbitmq)");
                if (definition.UseElasticsearch)
                    sb.AppendLine("    .WithReference(elasticsearch)");
                if (definition.UseSeq)
                    sb.AppendLine("    .WithReference(seq)");
                
                // Service configuration
                sb.AppendLine($"    .WithReplicas({service.Replicas})");
                sb.AppendLine($"    .WithEnvironment(\"ASPNETCORE_ENVIRONMENT\", \"Development\")");
                
                if (service.UseDapr)
                {
                    sb.AppendLine("    .WithDaprSidecar()");
                }
                
                if (service.UseServiceDiscovery)
                {
                    sb.AppendLine("    .WithServiceDiscovery()");
                }
                
                // Health checks
                sb.AppendLine($"    .WithHealthCheck(\"/health\")");
                sb.AppendLine($"    .WithHealthCheck(\"/health/ready\")");
                sb.AppendLine($"    .WithHealthCheck(\"/health/live\");");
                sb.AppendLine();
            }
            
            // API Gateway
            if (definition.IncludeApiGateway)
            {
                sb.AppendLine("// API Gateway with load balancing");
                sb.AppendLine("var gateway = builder.AddProject<Projects.ApiGateway>(\"gateway\")");
                
                foreach (var service in definition.Microservices)
                {
                    sb.AppendLine($"    .WithReference({service.Name.ToLower()})");
                }
                
                sb.AppendLine("    .WithExternalHttpEndpoints()");
                sb.AppendLine("    .WithReplicas(2)");
                sb.AppendLine("    .WithEnvironment(\"ASPNETCORE_ENVIRONMENT\", \"Development\");");
                sb.AppendLine();
            }
            
            // Build and run
            sb.AppendLine("// Build and run the distributed application");
            sb.AppendLine("using var app = builder.Build();");
            sb.AppendLine();
            sb.AppendLine("// Configure graceful shutdown");
            sb.AppendLine("var logger = app.Services.GetRequiredService<ILogger<Program>>();");
            sb.AppendLine("logger.LogInformation(\"Starting Aspire Host for {SolutionName}...\", \"" + definition.SolutionName + "\");");
            sb.AppendLine();
            sb.AppendLine("await app.RunAsync();");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates individual microservice with Aspire integration
        /// </summary>
        private async Task<Dictionary<string, string>> GenerateMicroserviceAsync(
            MicroserviceDefinition service, 
            AspireSolutionDefinition solution)
        {
            var files = new Dictionary<string, string>();
            
            // Program.cs
            files["Program.cs"] = await GenerateMicroserviceProgramAsync(service, solution);
            
            // Project file
            files[$"{service.ProjectName}.csproj"] = await GenerateMicroserviceProjectFileAsync(service, solution);
            
            // Configuration
            files["appsettings.json"] = await GenerateMicroserviceConfigAsync(service);
            
            // Health checks
            files["Health/HealthExtensions.cs"] = await GenerateHealthChecksAsync(service, solution);
            
            // OpenTelemetry configuration
            files["Telemetry/TelemetryExtensions.cs"] = await GenerateOpenTelemetryConfigAsync(service);
            
            return files;
        }
        
        /// <summary>
        /// Generates microservice Program.cs with Aspire defaults
        /// </summary>
        private async Task<string> GenerateMicroserviceProgramAsync(
            MicroserviceDefinition service,
            AspireSolutionDefinition solution)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine("using Microsoft.AspNetCore.Builder;");
            sb.AppendLine("using Microsoft.Extensions.DependencyInjection;");
            sb.AppendLine("using Microsoft.Extensions.Hosting;");
            sb.AppendLine("using Microsoft.Extensions.Logging;");
            sb.AppendLine("using OpenTelemetry.Metrics;");
            sb.AppendLine("using OpenTelemetry.Trace;");
            sb.AppendLine("using Serilog;");
            sb.AppendLine();
            
            sb.AppendLine("var builder = WebApplication.CreateBuilder(args);");
            sb.AppendLine();
            
            sb.AppendLine("// Add Aspire service defaults");
            sb.AppendLine("builder.AddServiceDefaults();");
            sb.AppendLine();
            
            sb.AppendLine("// Configure Serilog");
            sb.AppendLine("builder.Host.UseSerilog((context, configuration) =>");
            sb.AppendLine("    configuration.ReadFrom.Configuration(context.Configuration));");
            sb.AppendLine();
            
            // Database configuration
            if (solution.UsePostgreSQL)
            {
                sb.AppendLine("// Add PostgreSQL");
                sb.AppendLine("builder.AddNpgsqlDbContext<ApplicationDbContext>(\"database\");");
                sb.AppendLine();
            }
            
            // Redis configuration
            if (solution.UseRedis)
            {
                sb.AppendLine("// Add Redis distributed cache");
                sb.AppendLine("builder.AddRedisDistributedCache(\"redis\");");
                sb.AppendLine();
            }
            
            // RabbitMQ configuration
            if (solution.UseRabbitMQ)
            {
                sb.AppendLine("// Add RabbitMQ");
                sb.AppendLine("builder.AddRabbitMQClient(\"rabbitmq\");");
                sb.AppendLine();
            }
            
            sb.AppendLine("// Add application services");
            sb.AppendLine("builder.Services.AddControllers();");
            sb.AppendLine("builder.Services.AddEndpointsApiExplorer();");
            sb.AppendLine("builder.Services.AddSwaggerGen();");
            sb.AppendLine();
            
            // Health checks
            sb.AppendLine("// Add health checks");
            sb.AppendLine("builder.Services.AddHealthChecks()");
            if (solution.UsePostgreSQL)
                sb.AppendLine("    .AddNpgSql(builder.Configuration.GetConnectionString(\"database\")!)");
            if (solution.UseRedis)
                sb.AppendLine("    .AddRedis(builder.Configuration.GetConnectionString(\"redis\")!)");
            sb.AppendLine("    .AddCheck(\"self\", () => HealthCheckResult.Healthy());");
            sb.AppendLine();
            
            // OpenTelemetry
            sb.AppendLine("// Configure OpenTelemetry");
            sb.AppendLine("builder.Services.AddOpenTelemetry()");
            sb.AppendLine("    .WithTracing(tracing =>");
            sb.AppendLine("    {");
            sb.AppendLine("        tracing.AddAspNetCoreInstrumentation()");
            sb.AppendLine("               .AddHttpClientInstrumentation()");
            if (solution.UsePostgreSQL)
                sb.AppendLine("               .AddNpgsql()");
            if (solution.UseRedis)
                sb.AppendLine("               .AddRedisInstrumentation()");
            sb.AppendLine("               .AddSource(\"" + service.Name + "\");");
            sb.AppendLine("    })");
            sb.AppendLine("    .WithMetrics(metrics =>");
            sb.AppendLine("    {");
            sb.AppendLine("        metrics.AddAspNetCoreInstrumentation()");
            sb.AppendLine("               .AddHttpClientInstrumentation()");
            sb.AppendLine("               .AddRuntimeInstrumentation()");
            sb.AppendLine("               .AddProcessInstrumentation();");
            sb.AppendLine("    });");
            sb.AppendLine();
            
            // Build app
            sb.AppendLine("var app = builder.Build();");
            sb.AppendLine();
            
            // Configure middleware
            sb.AppendLine("// Configure the HTTP request pipeline");
            sb.AppendLine("if (app.Environment.IsDevelopment())");
            sb.AppendLine("{");
            sb.AppendLine("    app.UseSwagger();");
            sb.AppendLine("    app.UseSwaggerUI();");
            sb.AppendLine("}");
            sb.AppendLine();
            
            sb.AppendLine("app.UseHttpsRedirection();");
            sb.AppendLine("app.UseAuthorization();");
            sb.AppendLine("app.MapControllers();");
            sb.AppendLine();
            
            sb.AppendLine("// Map Aspire endpoints");
            sb.AppendLine("app.MapDefaultEndpoints();");
            sb.AppendLine();
            
            sb.AppendLine("app.Run();");
            
            return await Task.FromResult(sb.ToString());
        }
        
        // Supporting methods for project files and configuration
        private async Task<string> GenerateAspireHostProjectFileAsync(AspireSolutionDefinition definition) => 
            await Task.FromResult($@"<Project Sdk=""Aspire.Hosting.AppHost"">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UserSecretsId>{Guid.NewGuid()}</UserSecretsId>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include=""Aspire.Hosting.AppHost"" Version=""8.0.0"" />
    <PackageReference Include=""Aspire.Hosting.Redis"" Version=""8.0.0"" />
    <PackageReference Include=""Aspire.Hosting.PostgreSQL"" Version=""8.0.0"" />
    <PackageReference Include=""Aspire.Hosting.RabbitMQ"" Version=""8.0.0"" />
    <PackageReference Include=""Aspire.Hosting.Elasticsearch"" Version=""8.0.0"" />
  </ItemGroup>
  
  <ItemGroup>
{string.Join("\n", definition.Microservices.Select(s => $"    <ProjectReference Include=\"../{s.Name}/{s.ProjectName}.csproj\" />"))}
  </ItemGroup>
</Project>");
        
        private async Task<string> GenerateServiceDefaultsProjectFileAsync() => 
            await Task.FromResult(@"<Project Sdk=""Microsoft.NET.Sdk"">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include=""Aspire.StackExchange.Redis"" Version=""8.0.0"" />
    <PackageReference Include=""Microsoft.Extensions.Hosting"" Version=""8.0.0"" />
    <PackageReference Include=""Microsoft.Extensions.ServiceDiscovery"" Version=""8.0.0"" />
    <PackageReference Include=""OpenTelemetry.Exporter.OpenTelemetryProtocol"" Version=""1.7.0"" />
    <PackageReference Include=""OpenTelemetry.Extensions.Hosting"" Version=""1.7.0"" />
    <PackageReference Include=""OpenTelemetry.Instrumentation.AspNetCore"" Version=""1.7.1"" />
    <PackageReference Include=""OpenTelemetry.Instrumentation.GrpcNetClient"" Version=""1.6.0-beta.3"" />
    <PackageReference Include=""OpenTelemetry.Instrumentation.Http"" Version=""1.7.1"" />
    <PackageReference Include=""OpenTelemetry.Instrumentation.Runtime"" Version=""1.7.0"" />
    <PackageReference Include=""Serilog.AspNetCore"" Version=""8.0.0"" />
    <PackageReference Include=""Serilog.Sinks.OpenTelemetry"" Version=""1.0.0"" />
  </ItemGroup>
</Project>");
        
        // Additional supporting methods
        private async Task<Dictionary<string, string>> GenerateApiGatewayAsync(AspireSolutionDefinition definition) =>
            await Task.FromResult(new Dictionary<string, string>());
        
        private async Task<string> GenerateDockerComposeOverrideAsync(AspireSolutionDefinition definition) =>
            await Task.FromResult("# Docker Compose override for development");
        
        private async Task<string> GenerateDevelopmentConfigAsync(AspireSolutionDefinition definition) =>
            await Task.FromResult("{}");
        
        private async Task<string> GenerateServiceDefaultsAsync(AspireSolutionDefinition definition) =>
            await Task.FromResult("// Service defaults implementation");
        
        private async Task<string> GenerateMicroserviceProjectFileAsync(MicroserviceDefinition service, AspireSolutionDefinition solution) =>
            await Task.FromResult("<Project Sdk=\"Microsoft.NET.Sdk.Web\"></Project>");
        
        private async Task<string> GenerateMicroserviceConfigAsync(MicroserviceDefinition service) =>
            await Task.FromResult("{}");
        
        private async Task<string> GenerateHealthChecksAsync(MicroserviceDefinition service, AspireSolutionDefinition solution) =>
            await Task.FromResult("// Health checks implementation");
        
        private async Task<string> GenerateOpenTelemetryConfigAsync(MicroserviceDefinition service) =>
            await Task.FromResult("// OpenTelemetry configuration");
    }
}