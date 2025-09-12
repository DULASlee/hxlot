using System;
using System.Collections.Generic;
using JetBrains.Annotations;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Testing
{
    /// <summary>
    /// Definition for comprehensive test suite
    /// </summary>
    public sealed class TestSuiteDefinition
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<EntityTestDefinition> Entities { get; set; } = new List<EntityTestDefinition>();
        
        [PublicAPI]
        public IList<ServiceTestDefinition> ApplicationServices { get; set; } = new List<ServiceTestDefinition>();
        
        [PublicAPI]
        public IList<RepositoryTestDefinition> Repositories { get; set; } = new List<RepositoryTestDefinition>();
        
        [PublicAPI]
        public IList<MessageHandlerTestDefinition> MessageHandlers { get; set; } = new List<MessageHandlerTestDefinition>();
        
        [PublicAPI]
        public TestConfiguration Configuration { get; set; } = new();
    }
    
    /// <summary>
    /// Definition for entity tests
    /// </summary>
    public sealed class EntityTestDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Module { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public IList<BusinessMethodDefinition> BusinessMethods { get; set; } = new List<BusinessMethodDefinition>();
        
        [PublicAPI]
        public bool HasValidation { get; set; } = true;
        
        [PublicAPI]
        public bool HasDomainEvents { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for service tests
    /// </summary>
    public sealed class ServiceTestDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string EntityName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<ServiceMethodDefinition> Methods { get; set; } = new List<ServiceMethodDefinition>();
        
        [PublicAPI]
        public bool HasCrud { get; set; } = true;
        
        [PublicAPI]
        public bool HasAuthorization { get; set; } = true;
        
        [PublicAPI]
        public bool HasValidation { get; set; } = true;
        
        [PublicAPI]
        public bool HasCaching { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for repository tests
    /// </summary>
    public sealed class RepositoryTestDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string EntityName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<RepositoryMethodDefinition> CustomMethods { get; set; } = new List<RepositoryMethodDefinition>();
        
        [PublicAPI]
        public bool HasQueryMethods { get; set; } = true;
        
        [PublicAPI]
        public bool HasBulkOperations { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for message handler tests
    /// </summary>
    public sealed class MessageHandlerTestDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string MessageType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string HandlerType { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsAsync { get; set; } = true;
        
        [PublicAPI]
        public bool HasSideEffects { get; set; } = true;
    }
    
    /// <summary>
    /// Definition for business methods
    /// </summary>
    public sealed class BusinessMethodDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ReturnType { get; set; } = "void";
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        [PublicAPI]
        public bool CanThrowExceptions { get; set; } = false;
        
        [PublicAPI]
        public bool HasBusinessRules { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for service methods
    /// </summary>
    public sealed class ServiceMethodDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ReturnType { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        [PublicAPI]
        public bool IsAsync { get; set; } = true;
        
        [PublicAPI]
        public bool RequiresAuthorization { get; set; } = false;
        
        [PublicAPI]
        public bool HasValidation { get; set; } = false;
    }
    
    /// <summary>
    /// Test configuration
    /// </summary>
    public sealed class TestConfiguration
    {
        [PublicAPI]
        public TestFramework Framework { get; set; } = TestFramework.XUnit;
        
        [PublicAPI]
        public MockingFramework MockFramework { get; set; } = MockingFramework.Moq;
        
        [PublicAPI]
        public bool UseTestContainers { get; set; } = true;
        
        [PublicAPI]
        public bool UseInMemoryDatabase { get; set; } = true;
        
        [PublicAPI]
        public bool GenerateIntegrationTests { get; set; } = true;
        
        [PublicAPI]
        public bool GeneratePerformanceTests { get; set; } = false;
        
        [PublicAPI]
        public bool UseBogusForTestData { get; set; } = true;
        
        [PublicAPI]
        public bool EnableCodeCoverage { get; set; } = true;
    }
    
    /// <summary>
    /// Generated test suite result
    /// </summary>
    public sealed class GeneratedTestSuite
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int TestClassCount { get; set; }
        
        [PublicAPI]
        public int TestMethodCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
        
        [PublicAPI]
        public TestSuiteStatistics Statistics { get; set; } = new();
    }
    
    /// <summary>
    /// Statistics about generated test suite
    /// </summary>
    public sealed class TestSuiteStatistics
    {
        [PublicAPI]
        public int TotalUnitTests { get; set; }
        
        [PublicAPI]
        public int TotalIntegrationTests { get; set; }
        
        [PublicAPI]
        public int TotalMockObjects { get; set; }
        
        [PublicAPI]
        public int TotalTestDataBuilders { get; set; }
        
        [PublicAPI]
        public bool HasEntityTests { get; set; }
        
        [PublicAPI]
        public bool HasServiceTests { get; set; }
        
        [PublicAPI]
        public bool HasRepositoryTests { get; set; }
        
        [PublicAPI]
        public bool HasMessageHandlerTests { get; set; }
        
        [PublicAPI]
        public double EstimatedCodeCoverage { get; set; }
    }
    
    /// <summary>
    /// Test framework enumeration
    /// </summary>
    public enum TestFramework
    {
        XUnit,
        NUnit,
        MSTest
    }
    
    /// <summary>
    /// Mocking framework enumeration
    /// </summary>
    public enum MockingFramework
    {
        Moq,
        NSubstitute,
        FakeItEasy
    }
    
    /// <summary>
    /// Definition for repository method in tests
    /// </summary>
    public sealed class RepositoryMethodDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ReturnType { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
    }
    
    /// <summary>
    /// Test type enumeration
    /// </summary>
    public enum TestType
    {
        Unit,
        Integration,
        Functional,
        Performance,
        Load,
        Security
    }
    
    /// <summary>
    /// Test category enumeration
    /// </summary>
    public enum TestCategory
    {
        Domain,
        Application,
        Infrastructure,
        Presentation,
        CrossCutting
    }
}