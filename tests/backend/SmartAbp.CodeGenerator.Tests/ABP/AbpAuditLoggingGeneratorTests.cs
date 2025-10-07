using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.ABP;
using SmartAbp.CodeGenerator.Core.Templates;
using Xunit;

namespace SmartAbp.CodeGenerator.Tests.ABP
{
    /// <summary>
    /// AbpAuditLoggingGenerator单元测试
    /// </summary>
    public class AbpAuditLoggingGeneratorTests : SmartAbpCodeGeneratorTestBase
    {
        private readonly AbpAuditLoggingGenerator _generator;
        private readonly ITemplateService _templateService;

        public AbpAuditLoggingGeneratorTests()
        {
            _generator = GetRequiredService<AbpAuditLoggingGenerator>();
            _templateService = GetRequiredService<ITemplateService>();
            
            // Setup templates
            SetupTemplates();
        }

        private void SetupTemplates()
        {
            var fakeTemplateService = _templateService as FakeTemplateService;
            
            // AbpAuditEntity template
            fakeTemplateService?.AddTemplate("AbpAuditEntity", @"using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities;
using Volo.Abp.MultiTenancy;

namespace {{Namespace}}.Entities
{
    /// <summary>
    /// {{Description}}
    /// </summary>
    public class {{EntityName}} : Entity<Guid>{{AuditInterfaces}}{{TenantInterface}}
    {
{{CustomFields}}
        
        protected {{EntityName}}()
        {
        }
    }
}");

            // AbpAuditService template
            fakeTemplateService?.AddTemplate("AbpAuditService", @"using System;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Services;

namespace {{Namespace}}.Services
{
    /// <summary>
    /// {{Description}}
    /// </summary>
    public class {{EntityName}}AuditService : DomainService, ITransientDependency
    {
{{AuditMethods}}{{FilterMethods}}
    }
}");

            // AbpAuditConfiguration template
            fakeTemplateService?.AddTemplate("AbpAuditConfiguration", @"using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Auditing;

namespace {{Namespace}}.Configuration
{
    /// <summary>
    /// {{EntityName}} 审计日志配置
    /// </summary>
    public static class {{EntityName}}AuditingConfiguration
    {
        public static void Configure{{EntityName}}Auditing(this ServiceConfigurationContext context)
        {
{{AuditConfiguration}}{{SensitiveDataConfiguration}}{{PerformanceConfiguration}}
        }
    }
}");
        }

        [Fact]
        public async Task Should_Generate_Audit_Entity_With_All_Interfaces()
        {
            // Arrange
            var args = new AbpAuditLoggingGenerationArgs
            {
                Namespace = "MyApp.Auditing",
                EntityName = "UserAudit",
                Description = "User audit log entity",
                EnableCreationAudit = true,
                EnableModificationAudit = true,
                EnableDeletionAudit = true,
                EnableSoftDeleteAudit = true,
                IsMultiTenant = true
            };

            // Act
            var code = await _generator.GenerateEntityAsync(args);

            // Assert
            Assert.Contains("namespace MyApp.Auditing.Entities", code);
            Assert.Contains("class UserAudit", code);
            Assert.Contains("User audit log entity", code);
            Assert.Contains("ICreationAuditedObject", code);
            Assert.Contains("IModificationAuditedObject", code);
            Assert.Contains("IDeletionAuditedObject", code);
            Assert.Contains("IMultiTenant", code);
        }

        [Fact]
        public async Task Should_Generate_Audit_Entity_With_Custom_Fields()
        {
            // Arrange
            var args = new AbpAuditLoggingGenerationArgs
            {
                Namespace = "MyApp.Auditing",
                EntityName = "OrderAudit",
                CustomAuditFields = new List<CustomAuditField>
                {
                    new CustomAuditField
                    {
                        FieldName = "OrderNumber",
                        FieldType = "string",
                        Description = "订单号",
                        IsRequired = true,
                        MaxLength = 50
                    },
                    new CustomAuditField
                    {
                        FieldName = "TotalAmount",
                        FieldType = "decimal",
                        Description = "订单总额",
                        IsRequired = false
                    }
                }
            };

            // Act
            var code = await _generator.GenerateEntityAsync(args);

            // Assert
            Assert.Contains("public string OrderNumber { get; set; }", code);
            Assert.Contains("public decimal? TotalAmount { get; set; }", code);
            Assert.Contains("[Required]", code);
            Assert.Contains("[MaxLength(50)]", code);
            Assert.Contains("订单号", code);
        }

        [Fact]
        public async Task Should_Generate_Audit_Service_With_All_Methods()
        {
            // Arrange
            var args = new AbpAuditLoggingGenerationArgs
            {
                Namespace = "MyApp.Auditing",
                EntityName = "Product",
                EnableCreationAudit = true,
                EnableModificationAudit = true,
                EnableDeletionAudit = true,
                LogLevel = "Information"
            };

            // Act
            var code = await _generator.GenerateServiceAsync(args);

            // Assert
            Assert.Contains("namespace MyApp.Auditing.Services", code);
            Assert.Contains("class ProductAuditService", code);
            Assert.Contains("LogCreationAsync", code);
            Assert.Contains("LogModificationAsync", code);
            Assert.Contains("LogDeletionAsync", code);
        }

        [Fact]
        public async Task Should_Generate_Audit_Service_With_Sensitive_Data_Filter()
        {
            // Arrange
            var args = new AbpAuditLoggingGenerationArgs
            {
                Namespace = "MyApp.Auditing",
                EntityName = "Customer",
                EnableSensitiveDataFilter = true,
                SensitiveFields = new List<string> { "Password", "CreditCard", "SSN" }
            };

            // Act
            var code = await _generator.GenerateServiceAsync(args);

            // Assert
            Assert.Contains("FilterSensitiveData", code);
            Assert.Contains("Password", code);
            Assert.Contains("CreditCard", code);
            Assert.Contains("SSN", code);
            Assert.Contains("[FILTERED]", code);
        }

        [Fact]
        public async Task Should_Generate_Audit_Configuration()
        {
            // Arrange
            var args = new AbpAuditLoggingGenerationArgs
            {
                Namespace = "MyApp.Auditing",
                EntityName = "Employee",
                AuditScope = "Service",
                LogRetentionDays = 90,
                EnablePerformanceMonitoring = true,
                PerformanceThresholdMs = 500
            };

            // Act
            var code = await _generator.GenerateConfigurationAsync(args);

            // Assert
            Assert.Contains("namespace MyApp.Auditing.Configuration", code);
            Assert.Contains("EmployeeAuditingConfiguration", code);
            Assert.Contains("ConfigureEmployeeAuditing", code);
            Assert.Contains("LogRetentionDays = 90", code);
        }

        [Fact]
        public async Task Should_Generate_Configuration_Without_Performance_Monitoring()
        {
            // Arrange
            var args = new AbpAuditLoggingGenerationArgs
            {
                Namespace = "MyApp.Auditing",
                EntityName = "Invoice",
                EnablePerformanceMonitoring = false,
                EnableSensitiveDataFilter = false
            };

            // Act
            var code = await _generator.GenerateConfigurationAsync(args);

            // Assert
            Assert.Contains("InvoiceAuditingConfiguration", code);
            Assert.DoesNotContain("性能监控配置", code);
            Assert.DoesNotContain("敏感数据过滤配置", code);
        }
    }
}
