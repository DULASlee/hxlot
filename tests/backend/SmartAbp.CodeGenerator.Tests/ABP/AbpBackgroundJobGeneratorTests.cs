using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.ABP;
using SmartAbp.CodeGenerator.Core.Templates;
using Xunit;

namespace SmartAbp.CodeGenerator.Tests.ABP
{
    /// <summary>
    /// AbpBackgroundJobGenerator单元测试
    /// </summary>
    public class AbpBackgroundJobGeneratorTests : SmartAbpCodeGeneratorTestBase
    {
        private readonly AbpBackgroundJobGenerator _generator;
        private readonly ITemplateService _templateService;

        public AbpBackgroundJobGeneratorTests()
        {
            _generator = GetRequiredService<AbpBackgroundJobGenerator>();
            _templateService = GetRequiredService<ITemplateService>();
            
            // Setup template
            var fakeTemplateService = _templateService as FakeTemplateService;
            fakeTemplateService?.AddTemplate("AbpBackgroundJob", @"using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;

namespace {{Namespace}}
{
    /// <summary>
    /// {{Description}}
    /// </summary>
{{JobAttributes}}
    public class {{JobName}} : AsyncBackgroundJob<{{ArgsType}}>, ITransientDependency
    {
{{Dependencies}}
        public {{JobName}}(ILogger<{{JobName}}> logger{{ConstructorParams}})
            : base(logger)
        {
{{ConstructorAssignments}}
        }

        public override async Task ExecuteAsync({{ArgsType}} args)
        {
{{ExecuteCode}}

            await Task.CompletedTask;
        }
    }
}");
        }

        [Fact]
        public async Task Should_Generate_DataSync_Job()
        {
            // Arrange
            var args = new AbpBackgroundJobGenerationArgs
            {
                Namespace = "MyApp.Jobs",
                JobName = "DataSyncJob",
                Description = "Data synchronization background job",
                JobType = "DataSync",
                EnableRetry = true,
                MaxRetryCount = 5,
                Priority = "High"
            };

            // Act
            var code = await _generator.GenerateAsync(args);

            // Assert
            Assert.Contains("namespace MyApp.Jobs", code);
            Assert.Contains("class DataSyncJob", code);
            Assert.Contains("AsyncBackgroundJob<object>", code);
            Assert.Contains("[BackgroundJob(MaxTryCount = 5, Priority = BackgroundJobPriority.High)]", code);
            Assert.Contains("data synchronization", code);
        }

        [Fact]
        public async Task Should_Generate_Job_With_Service_Dependencies()
        {
            // Arrange
            var args = new AbpBackgroundJobGenerationArgs
            {
                Namespace = "MyApp.Jobs",
                JobName = "ReportGenerationJob",
                JobType = "ReportGeneration",
                ServiceDependencies = new List<ServiceDependency>
                {
                    new ServiceDependency 
                    { 
                        InterfaceType = "IReportService", 
                        FieldName = "_reportService", 
                        IsReadonly = true 
                    },
                    new ServiceDependency 
                    { 
                        InterfaceType = "IEmailSender", 
                        FieldName = "_emailSender", 
                        IsReadonly = true 
                    }
                }
            };

            // Act
            var code = await _generator.GenerateAsync(args);

            // Assert
            Assert.Contains("private readonly IReportService _reportService;", code);
            Assert.Contains("private readonly IEmailSender _emailSender;", code);
            Assert.Contains("IReportService reportService", code);
            Assert.Contains("IEmailSender emailSender", code);
            Assert.Contains("_reportService = reportService;", code);
            Assert.Contains("_emailSender = emailSender;", code);
        }

        [Fact]
        public async Task Should_Generate_Job_With_Custom_Execute_Code()
        {
            // Arrange
            var customCode = @"            Logger.LogInformation(""Custom job execution"");
            var result = await ProcessDataAsync(args);
            Logger.LogInformation($""Processed {result} records"");";

            var args = new AbpBackgroundJobGenerationArgs
            {
                Namespace = "MyApp.Jobs",
                JobName = "CustomJob",
                JobType = "Custom",
                CustomExecuteCode = customCode
            };

            // Act
            var code = await _generator.GenerateAsync(args);

            // Assert
            Assert.Contains("Custom job execution", code);
            Assert.Contains("ProcessDataAsync", code);
            Assert.Contains("Processed {result} records", code);
        }

        [Fact]
        public async Task Should_Generate_Job_With_Distributed_Lock()
        {
            // Arrange
            var args = new AbpBackgroundJobGenerationArgs
            {
                Namespace = "MyApp.Jobs",
                JobName = "CriticalJob",
                JobType = "Custom",
                EnableDistributedLock = true,
                MaxRetryCount = 1
            };

            // Act
            var code = await _generator.GenerateAsync(args);

            // Assert
            Assert.Contains("[BackgroundJob(MaxTryCount = 1, IsDistributedLock = true)]", code);
        }
    }
}

