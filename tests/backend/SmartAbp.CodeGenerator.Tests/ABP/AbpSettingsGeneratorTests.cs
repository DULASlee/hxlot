using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.ABP;
using SmartAbp.CodeGenerator.Core.Templates;
using Xunit;

namespace SmartAbp.CodeGenerator.Tests.ABP
{
    /// <summary>
    /// AbpSettingsGenerator单元测试
    /// </summary>
    public class AbpSettingsGeneratorTests : SmartAbpCodeGeneratorTestBase
    {
        private readonly AbpSettingsGenerator _generator;
        private readonly ITemplateService _templateService;

        public AbpSettingsGeneratorTests()
        {
            _generator = GetRequiredService<AbpSettingsGenerator>();
            _templateService = GetRequiredService<ITemplateService>();
            
            // Setup templates
            SetupTemplates();
        }

        private void SetupTemplates()
        {
            var fakeTemplateService = _templateService as FakeTemplateService;
            
            fakeTemplateService?.AddTemplate("AbpSettingsProvider", @"{{UsingStatements}}
namespace {{Namespace}}.Settings
{
    public class {{SettingsGroupName}}SettingDefinitionProvider : SettingDefinitionProvider
    {
        public override void Define(ISettingDefinitionContext context)
        {
{{SettingsDefinitions}}
        }
    }
    
    public static class {{SettingsGroupName}}Settings
    {
{{SettingsProperties}}
    }
}");

            fakeTemplateService?.AddTemplate("AbpSettingsService", @"namespace {{Namespace}}.Services
{
    public class {{SettingsGroupName}}SettingsService : DomainService, ITransientDependency
    {
{{SettingsMethods}}
    }
}");

            fakeTemplateService?.AddTemplate("AbpSettingsVueUI", @"<template>
  <div class=""{{SettingsGroupName.ToLower()}}-settings"">
{{SettingsControls}}
  </div>
</template>

<script setup lang=""ts"">
const settingsForm = reactive({
{{SettingsData}}
})
</script>");
        }

        [Fact]
        public async Task Should_Generate_Settings_Provider_With_Multiple_Settings()
        {
            // Arrange
            var args = new AbpSettingsGenerationArgs
            {
                Namespace = "MyApp.Configuration",
                SettingsGroupName = "Email",
                Description = "Email configuration settings",
                IsMultiTenant = true,
                EnableChangeEvents = true,
                Settings = new List<SettingDefinition>
                {
                    new SettingDefinition
                    {
                        Name = "SmtpHost",
                        DisplayName = "SMTP Host",
                        Description = "SMTP server hostname",
                        ValueType = "String",
                        DefaultValue = "localhost",
                        IsRequired = true,
                        Scopes = new List<string> { "Global", "Tenant" }
                    },
                    new SettingDefinition
                    {
                        Name = "SmtpPort",
                        DisplayName = "SMTP Port",
                        ValueType = "Int",
                        DefaultValue = "587",
                        Scopes = new List<string> { "Global", "Tenant" }
                    }
                }
            };

            // Act
            var code = await _generator.GenerateSettingsProviderAsync(args);

            // Assert
            Assert.Contains("namespace MyApp.Configuration.Settings", code);
            Assert.Contains("EmailSettingDefinitionProvider", code);
            Assert.Contains("Email.SmtpHost", code);
            Assert.Contains("Email.SmtpPort", code);
            Assert.Contains("SmtpHost = \"Email.SmtpHost\"", code);
            Assert.Contains("SmtpPort = \"Email.SmtpPort\"", code);
        }

        [Fact]
        public async Task Should_Generate_Settings_Service_With_Type_Conversion()
        {
            // Arrange
            var args = new AbpSettingsGenerationArgs
            {
                Namespace = "MyApp.Configuration",
                SettingsGroupName = "System",
                Settings = new List<SettingDefinition>
                {
                    new SettingDefinition
                    {
                        Name = "MaintenanceMode",
                        DisplayName = "Maintenance Mode",
                        ValueType = "Bool",
                        DefaultValue = "false"
                    },
                    new SettingDefinition
                    {
                        Name = "MaxFileSize",
                        DisplayName = "Max File Size",
                        ValueType = "Int",
                        DefaultValue = "10485760"
                    }
                }
            };

            // Act
            var code = await _generator.GenerateSettingsServiceAsync(args);

            // Assert
            Assert.Contains("GetMaintenanceModeAsync", code);
            Assert.Contains("SetMaintenanceModeAsync", code);
            Assert.Contains("Task<bool>", code);
            Assert.Contains("Task<int>", code);
            Assert.Contains("bool.TryParse", code);
            Assert.Contains("int.TryParse", code);
        }

        [Fact]
        public async Task Should_Generate_Vue_UI_With_Different_Control_Types()
        {
            // Arrange
            var args = new AbpSettingsGenerationArgs
            {
                SettingsGroupName = "Notification",
                GenerateManagementUI = true,
                UIFramework = "Vue",
                Settings = new List<SettingDefinition>
                {
                    new SettingDefinition
                    {
                        Name = "EmailEnabled",
                        DisplayName = "Enable Email",
                        UIControlType = "CheckBox",
                        ValueType = "Bool"
                    },
                    new SettingDefinition
                    {
                        Name = "Priority",
                        DisplayName = "Priority",
                        UIControlType = "Select",
                        ValueType = "Enum",
                        EnumOptions = new List<EnumOption>
                        {
                            new EnumOption { Value = "Low", Label = "Low Priority" },
                            new EnumOption { Value = "High", Label = "High Priority" }
                        }
                    },
                    new SettingDefinition
                    {
                        Name = "RetryCount",
                        DisplayName = "Retry Count",
                        UIControlType = "Number",
                        ValueType = "Int"
                    }
                }
            };

            // Act
            var code = await _generator.GenerateVueUIAsync(args);

            // Assert
            Assert.Contains("el-checkbox", code);
            Assert.Contains("el-select", code);
            Assert.Contains("el-input-number", code);
            Assert.Contains("Low Priority", code);
            Assert.Contains("High Priority", code);
            Assert.Contains("emailenabled: false", code);
            Assert.Contains("retrycount: 0", code);
        }

        [Fact]
        public async Task Should_Generate_Settings_With_Validation_Rules()
        {
            // Arrange
            var args = new AbpSettingsGenerationArgs
            {
                Namespace = "MyApp.Configuration",
                SettingsGroupName = "Security",
                Settings = new List<SettingDefinition>
                {
                    new SettingDefinition
                    {
                        Name = "PasswordPolicy",
                        DisplayName = "Password Policy",
                        IsRequired = true,
                        ValidationRules = new List<SettingValidationRule>
                        {
                            new SettingValidationRule
                            {
                                RuleType = "MinLength",
                                RuleValue = "8",
                                ErrorMessage = "Password must be at least 8 characters"
                            },
                            new SettingValidationRule
                            {
                                RuleType = "Regex",
                                RuleValue = @"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$",
                                ErrorMessage = "Password must contain letters and numbers"
                            }
                        }
                    }
                }
            };

            // Act
            var providerCode = await _generator.GenerateSettingsProviderAsync(args);

            // Assert
            Assert.Contains("Security.PasswordPolicy", providerCode);
            Assert.Contains("WithProperty", providerCode);
        }

        [Fact]
        public async Task Should_Not_Generate_UI_When_Disabled()
        {
            // Arrange
            var args = new AbpSettingsGenerationArgs
            {
                SettingsGroupName = "Test",
                GenerateManagementUI = false,
                Settings = new List<SettingDefinition>
                {
                    new SettingDefinition { Name = "TestSetting", DisplayName = "Test" }
                }
            };

            // Act
            var uiCode = await _generator.GenerateVueUIAsync(args);

            // Assert
            Assert.Equal(string.Empty, uiCode);
        }
    }
}
