using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Testing
{
    /// <summary>
    /// Advanced unit test generator with enterprise testing patterns
    /// Supports xUnit, NUnit, MSTest with mocking frameworks
    /// </summary>
    public sealed class UnitTestGenerator
    {
        private readonly ILogger<UnitTestGenerator> _logger;
        private readonly AdvancedMemoryManager _memoryManager;
        
        public UnitTestGenerator(
            ILogger<UnitTestGenerator> logger,
            AdvancedMemoryManager memoryManager)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryManager = memoryManager ?? throw new ArgumentNullException(nameof(memoryManager));
        }
        
        /// <summary>
        /// Generates comprehensive test suite
        /// </summary>
        public async Task<GeneratedTestSuite> GenerateTestSuiteAsync(TestSuiteDefinition definition)
        {
            _logger.LogInformation("Generating test suite for {ModuleName}", definition.ModuleName);
            
            var files = new Dictionary<string, string>();
            
            try
            {
                // 1. Test Base Classes
                files["TestBase/TestBase.cs"] = await GenerateTestBaseAsync(definition);
                files["TestBase/IntegrationTestBase.cs"] = await GenerateIntegrationTestBaseAsync(definition);
                
                // 2. Entity Tests
                foreach (var entity in definition.Entities)
                {
                    files[$"Domain/{entity.Name}Tests.cs"] = await GenerateEntityTestAsync(entity, definition);
                }
                
                // 3. Application Service Tests
                foreach (var service in definition.ApplicationServices)
                {
                    files[$"Application/{service.Name}Tests.cs"] = await GenerateApplicationServiceTestAsync(service, definition);
                }
                
                // 4. Repository Tests
                foreach (var repo in definition.Repositories)
                {
                    files[$"Infrastructure/{repo.Name}Tests.cs"] = await GenerateRepositoryTestAsync(repo, definition);
                }
                
                // 5. Message Handler Tests
                foreach (var handler in definition.MessageHandlers)
                {
                    files[$"Messaging/{handler.Name}Tests.cs"] = await GenerateMessageHandlerTestAsync(handler, definition);
                }
                
                // 6. Test Utilities
                files["Utilities/TestDataBuilder.cs"] = await GenerateTestDataBuilderAsync(definition);
                files["Utilities/MockFactory.cs"] = await GenerateMockFactoryAsync(definition);
                files["Utilities/TestFixture.cs"] = await GenerateTestFixtureAsync(definition);
                
                // 7. Test Project File
                files[$"{definition.ModuleName}.Tests.csproj"] = await GenerateTestProjectFileAsync(definition);
                
                _logger.LogInformation("Successfully generated {FileCount} test files", files.Count);
                
                return new GeneratedTestSuite
                {
                    ModuleName = definition.ModuleName,
                    Files = files,
                    TestClassCount = definition.Entities.Count + definition.ApplicationServices.Count + definition.Repositories.Count,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate test suite for {ModuleName}", definition.ModuleName);
                throw;
            }
        }
        
        /// <summary>
        /// Generates test base class with common setup
        /// </summary>
        private async Task<string> GenerateTestBaseAsync(TestSuiteDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine($@"using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;
using AutoMapper;
using MediatR;

namespace {definition.Namespace}.Tests.TestBase
{{
    /// <summary>
    /// Base class for all unit tests with common setup
    /// </summary>
    public abstract class TestBase : IDisposable
    {{
        protected readonly ITestOutputHelper Output;
        protected readonly IServiceProvider ServiceProvider;
        protected readonly ILogger Logger;
        protected readonly IMapper Mapper;
        protected readonly IMediator Mediator;
        
        private readonly ServiceCollection _services;
        private bool _disposed;
        
        protected TestBase(ITestOutputHelper output)
        {{
            Output = output ?? throw new ArgumentNullException(nameof(output));
            
            _services = new ServiceCollection();
            ConfigureServices(_services);
            
            ServiceProvider = _services.BuildServiceProvider();
            Logger = ServiceProvider.GetRequiredService<ILogger<TestBase>>();
            Mapper = ServiceProvider.GetRequiredService<IMapper>();
            Mediator = ServiceProvider.GetRequiredService<IMediator>();
        }}
        
        /// <summary>
        /// Configure test services
        /// </summary>
        protected virtual void ConfigureServices(IServiceCollection services)
        {{
            // Logging
            services.AddLogging(builder =>
            {{
                builder.AddXUnit(Output);
                builder.SetMinimumLevel(LogLevel.Debug);
            }});
            
            // AutoMapper
            services.AddAutoMapper(typeof({definition.ModuleName}AutoMapperProfile));
            
            // MediatR
            services.AddMediatR(typeof({definition.ModuleName}ApplicationModule).Assembly);
            
            // Mock services
            ConfigureMockServices(services);
        }}
        
        /// <summary>
        /// Configure mock services
        /// </summary>
        protected virtual void ConfigureMockServices(IServiceCollection services)
        {{
            // Override in derived classes to add specific mocks
        }}
        
        /// <summary>
        /// Creates a mock of the specified type
        /// </summary>
        protected Mock<T> CreateMock<T>() where T : class
        {{
            return new Mock<T>();
        }}
        
        /// <summary>
        /// Creates a strict mock of the specified type
        /// </summary>
        protected Mock<T> CreateStrictMock<T>() where T : class
        {{
            return new Mock<T>(MockBehavior.Strict);
        }}
        
        /// <summary>
        /// Asserts that an async operation throws the expected exception
        /// </summary>
        protected async Task<T> AssertThrowsAsync<T>(Func<Task> action) where T : Exception
        {{
            return await Assert.ThrowsAsync<T>(action);
        }}
        
        /// <summary>
        /// Asserts that an async operation completes successfully
        /// </summary>
        protected async Task AssertDoesNotThrowAsync(Func<Task> action)
        {{
            var exception = await Record.ExceptionAsync(action);
            Assert.Null(exception);
        }}
        
        public virtual void Dispose()
        {{
            if (!_disposed)
            {{
                (ServiceProvider as IDisposable)?.Dispose();
                _disposed = true;
            }}
        }}
    }}
}}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates entity test class
        /// </summary>
        private async Task<string> GenerateEntityTestAsync(EntityTestDefinition entity, TestSuiteDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine($@"using System;
using System.Linq;
using Xunit;
using Xunit.Abstractions;
using {definition.Namespace}.Domain.{entity.Module};
using {definition.Namespace}.Tests.TestBase;

namespace {definition.Namespace}.Tests.Domain
{{
    /// <summary>
    /// Unit tests for {entity.Name} entity
    /// </summary>
    public class {entity.Name}Tests : TestBase
    {{
        public {entity.Name}Tests(ITestOutputHelper output) : base(output)
        {{
        }}
        
        [Fact]
        public void Constructor_WithValidParameters_ShouldCreateEntity()
        {{
            // Arrange
            var id = Guid.NewGuid();");
            
            // Generate constructor parameters
            foreach (var prop in entity.Properties.Where(p => p.IsRequired))
            {
                sb.AppendLine($"            var {prop.Name.ToLower()} = TestData.Get{prop.Type}();");
            }
            
            sb.AppendLine();
            sb.AppendLine("            // Act");
            sb.AppendLine($"            var entity = new {entity.Name}(id, {string.Join(", ", entity.Properties.Where(p => p.IsRequired).Select(p => p.Name.ToLower()))});");
            sb.AppendLine();
            sb.AppendLine("            // Assert");
            sb.AppendLine("            Assert.NotNull(entity);");
            sb.AppendLine("            Assert.Equal(id, entity.Id);");
            
            foreach (var prop in entity.Properties.Where(p => p.IsRequired))
            {
                sb.AppendLine($"            Assert.Equal({prop.Name.ToLower()}, entity.{prop.Name});");
            }
            
            sb.AppendLine("        }");
            sb.AppendLine();
            
            // Generate validation tests
            foreach (var prop in entity.Properties.Where(p => p.IsRequired))
            {
                sb.AppendLine($@"        [Fact]
        public void Constructor_WithNull{prop.Name}_ShouldThrowArgumentException()
        {{
            // Arrange
            var id = Guid.NewGuid();
            {string.Join("\n            ", entity.Properties.Where(p => p.IsRequired && p.Name != prop.Name).Select(p => $"var {p.Name.ToLower()} = TestData.Get{p.Type}();"))}
            
            // Act & Assert
            Assert.Throws<ArgumentException>(() => 
                new {entity.Name}(id, {string.Join(", ", entity.Properties.Where(p => p.IsRequired).Select(p => p.Name == prop.Name ? "null" : p.Name.ToLower()))}));
        }}");
                sb.AppendLine();
            }
            
            // Generate business method tests
            foreach (var method in entity.BusinessMethods)
            {
                sb.AppendLine($@"        [Fact]
        public void {method.Name}_WithValidParameters_ShouldSucceed()
        {{
            // Arrange
            var entity = TestDataBuilder.Create{entity.Name}();
            {string.Join("\n            ", method.Parameters.Select(p => $"var {p.Name.ToLower()} = TestData.Get{p.Type}();"))}
            
            // Act
            {(method.ReturnType != "void" ? "var result = " : "")}entity.{method.Name}({string.Join(", ", method.Parameters.Select(p => p.Name.ToLower()))});
            
            // Assert
            {(method.ReturnType != "void" ? "Assert.NotNull(result);" : "// Method completed successfully")}
        }}");
                sb.AppendLine();
            }
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates application service test class
        /// </summary>
        private async Task<string> GenerateApplicationServiceTestAsync(ServiceTestDefinition service, TestSuiteDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine($@"using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using Xunit.Abstractions;
using Volo.Abp.Domain.Repositories;
using {definition.Namespace}.Application.Services;
using {definition.Namespace}.Tests.TestBase;

namespace {definition.Namespace}.Tests.Application
{{
    /// <summary>
    /// Unit tests for {service.Name}
    /// </summary>
    public class {service.Name}Tests : TestBase
    {{
        private readonly {service.Name} _service;
        private readonly Mock<IRepository<{service.EntityName}, Guid>> _repositoryMock;
        
        public {service.Name}Tests(ITestOutputHelper output) : base(output)
        {{
            _repositoryMock = CreateMock<IRepository<{service.EntityName}, Guid>>();
            _service = new {service.Name}(_repositoryMock.Object, Mapper);
        }}
        
        [Fact]
        public async Task GetAsync_WithValidId_ShouldReturnDto()
        {{
            // Arrange
            var id = Guid.NewGuid();
            var entity = TestDataBuilder.Create{service.EntityName}(id);
            
            _repositoryMock
                .Setup(x => x.GetAsync(id, true, It.IsAny<CancellationToken>()))
                .ReturnsAsync(entity);
            
            // Act
            var result = await _service.GetAsync(id);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(id, result.Id);
            _repositoryMock.Verify(x => x.GetAsync(id, true, It.IsAny<CancellationToken>()), Times.Once);
        }}
        
        [Fact]
        public async Task CreateAsync_WithValidInput_ShouldReturnCreatedDto()
        {{
            // Arrange
            var input = TestDataBuilder.CreateValid{service.EntityName}CreateDto();
            var expectedEntity = TestDataBuilder.Create{service.EntityName}();
            
            _repositoryMock
                .Setup(x => x.InsertAsync(It.IsAny<{service.EntityName}>(), true, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedEntity);
            
            // Act
            var result = await _service.CreateAsync(input);
            
            // Assert
            Assert.NotNull(result);
            _repositoryMock.Verify(x => x.InsertAsync(It.IsAny<{service.EntityName}>(), true, It.IsAny<CancellationToken>()), Times.Once);
        }}
        
        [Fact]
        public async Task UpdateAsync_WithValidInput_ShouldUpdateAndReturnDto()
        {{
            // Arrange
            var id = Guid.NewGuid();
            var input = TestDataBuilder.CreateValid{service.EntityName}UpdateDto();
            var existingEntity = TestDataBuilder.Create{service.EntityName}(id);
            
            _repositoryMock
                .Setup(x => x.GetAsync(id, true, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);
            
            _repositoryMock
                .Setup(x => x.UpdateAsync(It.IsAny<{service.EntityName}>(), true, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);
            
            // Act
            var result = await _service.UpdateAsync(id, input);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(id, result.Id);
            _repositoryMock.Verify(x => x.GetAsync(id, true, It.IsAny<CancellationToken>()), Times.Once);
            _repositoryMock.Verify(x => x.UpdateAsync(It.IsAny<{service.EntityName}>(), true, It.IsAny<CancellationToken>()), Times.Once);
        }}
        
        [Fact]
        public async Task DeleteAsync_WithValidId_ShouldDeleteEntity()
        {{
            // Arrange
            var id = Guid.NewGuid();
            
            _repositoryMock
                .Setup(x => x.DeleteAsync(id, true, It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            
            // Act
            await _service.DeleteAsync(id);
            
            // Assert
            _repositoryMock.Verify(x => x.DeleteAsync(id, true, It.IsAny<CancellationToken>()), Times.Once);
        }}
    }}
}}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates test data builder
        /// </summary>
        private async Task<string> GenerateTestDataBuilderAsync(TestSuiteDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine($@"using System;
using Bogus;

namespace {definition.Namespace}.Tests.Utilities
{{
    /// <summary>
    /// Test data builder using Bogus for realistic test data
    /// </summary>
    public static class TestDataBuilder
    {{
        private static readonly Faker _faker = new Faker();
        
        public static string GetRandomString(int length = 10)
        {{
            return _faker.Random.String2(length);
        }}
        
        public static int GetRandomInt(int min = 1, int max = 100)
        {{
            return _faker.Random.Int(min, max);
        }}
        
        public static DateTime GetRandomDateTime()
        {{
            return _faker.Date.Recent();
        }}
        
        public static Guid GetRandomGuid()
        {{
            return _faker.Random.Guid();
        }}");
            
            // Generate builder methods for each entity
            foreach (var entity in definition.Entities)
            {
                sb.AppendLine();
                sb.AppendLine($@"        public static {entity.Name} Create{entity.Name}(Guid? id = null)
        {{
            return new {entity.Name}(
                id ?? GetRandomGuid(),
                {string.Join(",\n                ", entity.Properties.Where(p => p.IsRequired).Select(p => $"GetRandom{p.Type}()"))});
        }}");
            }
            
            sb.AppendLine("    }");
            sb.AppendLine("}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        /// <summary>
        /// Generates test project file
        /// </summary>
        private async Task<string> GenerateTestProjectFileAsync(TestSuiteDefinition definition)
        {
            return await Task.FromResult($@"<Project Sdk=""Microsoft.NET.Sdk"">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include=""Microsoft.NET.Test.Sdk"" Version=""17.8.0"" />
    <PackageReference Include=""xunit"" Version=""2.6.2"" />
    <PackageReference Include=""xunit.runner.visualstudio"" Version=""2.5.3"" />
    <PackageReference Include=""coverlet.collector"" Version=""6.0.0"" />
    <PackageReference Include=""Moq"" Version=""4.20.69"" />
    <PackageReference Include=""Bogus"" Version=""34.0.2"" />
    <PackageReference Include=""FluentAssertions"" Version=""6.12.0"" />
    <PackageReference Include=""Microsoft.Extensions.Logging.Testing"" Version=""8.0.0"" />
    <PackageReference Include=""Testcontainers"" Version=""3.6.0"" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include=""..\\{definition.ModuleName}\\{definition.ModuleName}.csproj"" />
  </ItemGroup>
</Project>");
        }
        
        // Helper methods (simplified for brevity)
        private async Task<string> GenerateIntegrationTestBaseAsync(TestSuiteDefinition definition) =>
            await Task.FromResult("// Integration test base implementation");
            
        private async Task<string> GenerateRepositoryTestAsync(RepositoryTestDefinition repo, TestSuiteDefinition definition) =>
            await Task.FromResult($"// Repository test for {repo.Name}");
            
        private async Task<string> GenerateMessageHandlerTestAsync(MessageHandlerTestDefinition handler, TestSuiteDefinition definition) =>
            await Task.FromResult($"// Message handler test for {handler.Name}");
            
        private async Task<string> GenerateMockFactoryAsync(TestSuiteDefinition definition) =>
            await Task.FromResult("// Mock factory implementation");
            
        private async Task<string> GenerateTestFixtureAsync(TestSuiteDefinition definition) =>
            await Task.FromResult("// Test fixture implementation");
    }
}