using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Core.Templates;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP设置管理代码生成器
    /// </summary>
    public class AbpSettingsGenerator : ITransientDependency
    {
        private readonly ITemplateService _templateService;

        public AbpSettingsGenerator(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        /// <summary>
        /// 生成设置定义提供者代码
        /// </summary>
        public async Task<string> GenerateSettingsProviderAsync(AbpSettingsGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpSettingsProvider");
            
            var settingsDefinitions = BuildSettingsDefinitions(args);
            var usingStatements = BuildUsingStatements(args);
            
            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{SettingsGroupName}}", args.SettingsGroupName)
                .Replace("{{Description}}", args.Description ?? $"{args.SettingsGroupName} Settings")
                .Replace("{{UsingStatements}}", usingStatements)
                .Replace("{{SettingsDefinitions}}", settingsDefinitions);

            return result;
        }

        /// <summary>
        /// 生成设置管理服务代码
        /// </summary>
        public async Task<string> GenerateSettingsServiceAsync(AbpSettingsGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpSettingsService");
            
            var settingsMethods = BuildSettingsMethods(args);
            var settingsProperties = BuildSettingsProperties(args);
            
            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{SettingsGroupName}}", args.SettingsGroupName)
                .Replace("{{Description}}", args.Description ?? $"{args.SettingsGroupName} Settings Service")
                .Replace("{{SettingsMethods}}", settingsMethods)
                .Replace("{{SettingsProperties}}", settingsProperties)
                .Replace("{{CacheExpirationMinutes}}", args.CacheExpirationMinutes.ToString());

            return result;
        }

        /// <summary>
        /// 生成Vue设置管理界面
        /// </summary>
        public async Task<string> GenerateVueUIAsync(AbpSettingsGenerationArgs args)
        {
            if (!args.GenerateManagementUI || args.UIFramework != "Vue")
            {
                return string.Empty;
            }

            var template = await _templateService.GetTemplateAsync("AbpSettingsVueUI");
            
            var settingsControls = BuildVueSettingsControls(args);
            var settingsValidation = BuildVueSettingsValidation(args);
            var settingsData = BuildVueSettingsData(args);
            
            var result = template
                .Replace("{{SettingsGroupName}}", args.SettingsGroupName)
                .Replace("{{Description}}", args.Description ?? $"{args.SettingsGroupName} Settings")
                .Replace("{{SettingsControls}}", settingsControls)
                .Replace("{{SettingsValidation}}", settingsValidation)
                .Replace("{{SettingsData}}", settingsData);

            return result;
        }

        private string BuildUsingStatements(AbpSettingsGenerationArgs args)
        {
            var usings = new StringBuilder();
            usings.AppendLine("using Volo.Abp.Settings;");
            usings.AppendLine("using Volo.Abp.Localization;");
            
            if (args.IsMultiTenant)
            {
                usings.AppendLine("using Volo.Abp.MultiTenancy;");
            }
            
            if (args.EnableChangeEvents)
            {
                usings.AppendLine("using Volo.Abp.EventBus.Local;");
            }

            return usings.ToString();
        }

        private string BuildSettingsDefinitions(AbpSettingsGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            foreach (var setting in args.Settings)
            {
                builder.AppendLine($@"
                context.Add(
                    new SettingDefinition(
                        ""{args.SettingsGroupName}.{setting.Name}"",
                        ""{setting.DefaultValue ?? ""}"",
                        L(""{setting.DisplayName}""),
                        L(""{setting.Description ?? setting.DisplayName}""),
                        isInherited: {setting.IsInherited.ToString().ToLower()},
                        isEncrypted: {setting.IsSensitive.ToString().ToLower()}
                    ){BuildSettingScopes(setting)}{BuildSettingProperties(setting)}
                );");
            }

            return builder.ToString();
        }

        private string BuildSettingScopes(SettingDefinition setting)
        {
            if (!setting.Scopes.Any())
            {
                return string.Empty;
            }

            var scopes = string.Join(" | ", setting.Scopes.Select(s => $"SettingScopes.{s}"));
            return $".WithScopes({scopes})";
        }

        private string BuildSettingProperties(SettingDefinition setting)
        {
            var properties = new StringBuilder();
            
            if (setting.ValidationRules?.Any() == true)
            {
                foreach (var rule in setting.ValidationRules)
                {
                    properties.AppendLine($@"
                        .WithProperty(""{rule.RuleType}"", ""{rule.RuleValue}"")");
                }
            }

            return properties.ToString();
        }

        private string BuildSettingsMethods(AbpSettingsGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            foreach (var setting in args.Settings)
            {
                var methodName = $"Get{setting.Name}Async";
                var returnType = GetCSharpType(setting.ValueType);
                var settingName = $"{args.SettingsGroupName}.{setting.Name}";
                
                builder.AppendLine($@"
        /// <summary>
        /// 获取{setting.DisplayName}
        /// </summary>
        public virtual async Task<{returnType}> {methodName}(Guid? tenantId = null, Guid? userId = null)
        {{
            var value = await SettingProvider.GetOrNullAsync(""{settingName}"", GlobalSettingValueProvider.ProviderName, tenantId?.ToString());
            
            if (string.IsNullOrEmpty(value))
            {{
                return {GetDefaultValue(setting)};
            }}

            return {GetConvertExpression(returnType, "value")};
        }}

        /// <summary>
        /// 设置{setting.DisplayName}
        /// </summary>
        public virtual async Task Set{setting.Name}Async({returnType} value, Guid? tenantId = null, Guid? userId = null)
        {{
            await SettingManager.SetAsync(""{settingName}"", value?.ToString() ?? string.Empty, GlobalSettingValueProvider.ProviderName, tenantId?.ToString());
            
            {(args.EnableChangeEvents ? $@"await LocalEventBus.PublishAsync(new SettingChangeEventData(""{settingName}"", value?.ToString(), tenantId, userId));" : "")}
        }}");
            }

            return builder.ToString();
        }

        private string BuildSettingsProperties(AbpSettingsGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            foreach (var setting in args.Settings)
            {
                builder.AppendLine($@"        
        /// <summary>
        /// {setting.DisplayName}设置名称
        /// </summary>
        public const string {setting.Name} = ""{args.SettingsGroupName}.{setting.Name}"";");
            }

            return builder.ToString();
        }

        private string BuildVueSettingsControls(AbpSettingsGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            foreach (var setting in args.Settings)
            {
                var controlHtml = setting.UIControlType switch
                {
                    "CheckBox" => $@"
          <el-checkbox 
            v-model=""settingsForm.{setting.Name.ToLower()}"" 
            :label=""$t('{setting.DisplayName}')"">
          </el-checkbox>",
                    "Select" => BuildSelectControl(setting),
                    "Number" => $@"
          <el-input-number 
            v-model=""settingsForm.{setting.Name.ToLower()}"" 
            :placeholder=""$t('{setting.DisplayName}')"">
          </el-input-number>",
                    _ => $@"
          <el-input 
            v-model=""settingsForm.{setting.Name.ToLower()}"" 
            :placeholder=""$t('{setting.DisplayName}')"" 
            {(setting.IsSensitive ? @"type=""password"" show-password" : "")}>
          </el-input>"
                };

                builder.AppendLine($@"
        <el-form-item label=""{setting.DisplayName}"" prop=""{setting.Name.ToLower()}"">
          {controlHtml}
        </el-form-item>");
            }

            return builder.ToString();
        }

        private string BuildSelectControl(SettingDefinition setting)
        {
            if (setting.EnumOptions == null || !setting.EnumOptions.Any())
            {
                return $@"<el-input v-model=""settingsForm.{setting.Name.ToLower()}"" />";
            }

            var options = string.Join("\n            ", setting.EnumOptions.Select(opt => 
                $@"<el-option label=""{opt.Label}"" value=""{opt.Value}"" />"));

            return $@"
          <el-select v-model=""settingsForm.{setting.Name.ToLower()}"" placeholder=""请选择{setting.DisplayName}"">
            {options}
          </el-select>";
        }

        private string BuildVueSettingsValidation(AbpSettingsGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            foreach (var setting in args.Settings)
            {
                if (setting.ValidationRules?.Any() != true && !setting.IsRequired) continue;

                var rules = new StringBuilder();
                rules.Append("[");

                if (setting.IsRequired)
                {
                    rules.Append("{ required: true, message: '请输入" + setting.DisplayName + "', trigger: 'blur' }");
                }

                if (setting.ValidationRules?.Any() == true)
                {
                    foreach (var rule in setting.ValidationRules)
                    {
                        if (rules.Length > 1) rules.Append(", ");
                        
                        rules.Append(rule.RuleType switch
                        {
                            "MinLength" => $"{{ min: {rule.RuleValue}, message: '最少{rule.RuleValue}个字符', trigger: 'blur' }}",
                            "MaxLength" => $"{{ max: {rule.RuleValue}, message: '最多{rule.RuleValue}个字符', trigger: 'blur' }}",
                            "Regex" => $"{{ pattern: /{rule.RuleValue}/, message: '{rule.ErrorMessage ?? "格式不正确"}', trigger: 'blur' }}",
                            _ => $"{{ validator: custom{setting.Name}Validator, trigger: 'blur' }}"
                        });
                    }
                }

                rules.Append("]");
                
                builder.AppendLine($"        {setting.Name.ToLower()}: {rules},");
            }

            return builder.ToString();
        }

        private string BuildVueSettingsData(AbpSettingsGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            foreach (var setting in args.Settings)
            {
                var defaultValue = setting.ValueType switch
                {
                    "Bool" => setting.DefaultValue?.ToLower() ?? "false",
                    "Int" or "Decimal" => setting.DefaultValue ?? "0",
                    _ => $"'{setting.DefaultValue ?? ""}'"
                };
                
                builder.AppendLine($"        {setting.Name.ToLower()}: {defaultValue},");
            }

            return builder.ToString();
        }

        private string GetCSharpType(string valueType)
        {
            return valueType switch
            {
                "Int" => "int",
                "Bool" => "bool",
                "Decimal" => "decimal",
                "String" => "string",
                _ => "string"
            };
        }

        private string GetDefaultValue(SettingDefinition setting)
        {
            if (!string.IsNullOrEmpty(setting.DefaultValue))
            {
                return setting.ValueType switch
                {
                    "Bool" => setting.DefaultValue.ToLower(),
                    "Int" or "Decimal" => setting.DefaultValue,
                    _ => $"\"{setting.DefaultValue}\""
                };
            }

            return setting.ValueType switch
            {
                "Bool" => "false",
                "Int" or "Decimal" => "0",
                _ => "string.Empty"
            };
        }

        private string GetConvertExpression(string returnType, string valueVariable)
        {
            return returnType switch
            {
                "int" => $"int.TryParse({valueVariable}, out var intValue) ? intValue : 0",
                "bool" => $"bool.TryParse({valueVariable}, out var boolValue) && boolValue",
                "decimal" => $"decimal.TryParse({valueVariable}, out var decimalValue) ? decimalValue : 0m",
                _ => valueVariable
            };
        }
    }
}
