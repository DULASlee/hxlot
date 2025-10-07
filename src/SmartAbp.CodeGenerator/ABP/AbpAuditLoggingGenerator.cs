using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Core.Templates;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP审计日志代码生成器
    /// </summary>
    public class AbpAuditLoggingGenerator : ITransientDependency
    {
        private readonly ITemplateService _templateService;

        public AbpAuditLoggingGenerator(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        /// <summary>
        /// 生成审计日志实体代码
        /// </summary>
        public async Task<string> GenerateEntityAsync(AbpAuditLoggingGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpAuditEntity");
            
            var customFields = BuildCustomAuditFields(args);
            var auditInterfaces = BuildAuditInterfaces(args);
            var tenantInterface = args.IsMultiTenant ? ", IMultiTenant" : "";
            
            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{EntityName}}", args.EntityName)
                .Replace("{{Description}}", args.Description ?? $"{args.EntityName} Audit Entity")
                .Replace("{{AuditInterfaces}}", auditInterfaces)
                .Replace("{{TenantInterface}}", tenantInterface)
                .Replace("{{CustomFields}}", customFields);

            return result;
        }

        /// <summary>
        /// 生成审计日志服务代码
        /// </summary>
        public async Task<string> GenerateServiceAsync(AbpAuditLoggingGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpAuditService");
            
            var auditMethods = BuildAuditMethods(args);
            var storageProvider = BuildStorageProvider(args);
            var filterMethods = BuildFilterMethods(args);
            
            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{EntityName}}", args.EntityName)
                .Replace("{{Description}}", args.Description ?? $"{args.EntityName} Audit Service")
                .Replace("{{AuditMethods}}", auditMethods)
                .Replace("{{StorageProvider}}", storageProvider)
                .Replace("{{FilterMethods}}", filterMethods)
                .Replace("{{LogLevel}}", args.LogLevel);

            return result;
        }

        /// <summary>
        /// 生成审计日志配置代码
        /// </summary>
        public async Task<string> GenerateConfigurationAsync(AbpAuditLoggingGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpAuditConfiguration");
            
            var auditConfiguration = BuildAuditConfiguration(args);
            var sensitiveDataConfiguration = BuildSensitiveDataConfiguration(args);
            var performanceConfiguration = BuildPerformanceConfiguration(args);
            
            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{EntityName}}", args.EntityName)
                .Replace("{{AuditConfiguration}}", auditConfiguration)
                .Replace("{{SensitiveDataConfiguration}}", sensitiveDataConfiguration)
                .Replace("{{PerformanceConfiguration}}", performanceConfiguration)
                .Replace("{{LogRetentionDays}}", args.LogRetentionDays.ToString())
                .Replace("{{AuditScope}}", args.AuditScope);

            return result;
        }

        private string BuildCustomAuditFields(AbpAuditLoggingGenerationArgs args)
        {
            if (args.CustomAuditFields == null || !args.CustomAuditFields.Any())
            {
                return string.Empty;
            }

            var builder = new StringBuilder();
            foreach (var field in args.CustomAuditFields)
            {
                var nullableSymbol = field.IsRequired ? "" : "?";
                var maxLengthAttribute = field.MaxLength.HasValue ? 
                    $"\n        [MaxLength({field.MaxLength})]" : "";
                
                var requiredAttribute = field.IsRequired ? 
                    $"\n        [Required]" : "";

                builder.AppendLine($@"
        /// <summary>
        /// {field.Description ?? field.FieldName}
        /// </summary>{requiredAttribute}{maxLengthAttribute}
        public {field.FieldType}{nullableSymbol} {field.FieldName} {{ get; set; }}");
            }

            return builder.ToString();
        }

        private string BuildAuditInterfaces(AbpAuditLoggingGenerationArgs args)
        {
            var interfaces = new StringBuilder();
            
            if (args.EnableCreationAudit)
            {
                interfaces.Append("ICreationAuditedObject");
            }
            
            if (args.EnableModificationAudit)
            {
                if (interfaces.Length > 0) interfaces.Append(", ");
                interfaces.Append("IModificationAuditedObject");
            }
            
            if (args.EnableDeletionAudit && args.EnableSoftDeleteAudit)
            {
                if (interfaces.Length > 0) interfaces.Append(", ");
                interfaces.Append("IDeletionAuditedObject");
            }
            else if (args.EnableSoftDeleteAudit)
            {
                if (interfaces.Length > 0) interfaces.Append(", ");
                interfaces.Append("ISoftDelete");
            }

            return interfaces.ToString();
        }

        private string BuildAuditMethods(AbpAuditLoggingGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            // 创建审计方法
            if (args.EnableCreationAudit)
            {
                builder.AppendLine(@"        
        /// <summary>
        /// 记录创建审计日志
        /// </summary>
        public virtual async Task LogCreationAsync(object entity, string operationName = null)
        {
            var auditLog = new AuditLogInfo
            {
                ApplicationName = ApplicationName,
                UserId = CurrentUser.Id,
                UserName = CurrentUser.UserName,
                TenantId = CurrentTenant.Id,
                ExecutionTime = Clock.Now,
                ExecutionDuration = 0,
                HttpMethod = HttpContext?.Request?.Method,
                Url = HttpContext?.Request?.GetDisplayUrl(),
                Comments = $""Created {entity.GetType().Name}: {operationName ?? ""N/A""}""
            };

            await AuditingStore.SaveAsync(auditLog);
        }");
            }

            // 修改审计方法
            if (args.EnableModificationAudit)
            {
                builder.AppendLine(@"        
        /// <summary>
        /// 记录修改审计日志
        /// </summary>
        public virtual async Task LogModificationAsync(object entity, object originalEntity = null, string operationName = null)
        {
            var changes = CompareEntities(originalEntity, entity);
            
            var auditLog = new AuditLogInfo
            {
                ApplicationName = ApplicationName,
                UserId = CurrentUser.Id,
                UserName = CurrentUser.UserName,
                TenantId = CurrentTenant.Id,
                ExecutionTime = Clock.Now,
                ExecutionDuration = 0,
                HttpMethod = HttpContext?.Request?.Method,
                Url = HttpContext?.Request?.GetDisplayUrl(),
                Comments = $""Modified {entity.GetType().Name}: {operationName ?? ""N/A""}"",
                EntityChanges = changes
            };

            await AuditingStore.SaveAsync(auditLog);
        }");
            }

            // 删除审计方法
            if (args.EnableDeletionAudit)
            {
                builder.AppendLine(@"        
        /// <summary>
        /// 记录删除审计日志
        /// </summary>
        public virtual async Task LogDeletionAsync(object entity, string operationName = null)
        {
            var auditLog = new AuditLogInfo
            {
                ApplicationName = ApplicationName,
                UserId = CurrentUser.Id,
                UserName = CurrentUser.UserName,
                TenantId = CurrentTenant.Id,
                ExecutionTime = Clock.Now,
                ExecutionDuration = 0,
                HttpMethod = HttpContext?.Request?.Method,
                Url = HttpContext?.Request?.GetDisplayUrl(),
                Comments = $""Deleted {entity.GetType().Name}: {operationName ?? ""N/A""}""
            };

            await AuditingStore.SaveAsync(auditLog);
        }");
            }

            return builder.ToString();
        }

        private string BuildStorageProvider(AbpAuditLoggingGenerationArgs args)
        {
            return args.LogStorageProvider switch
            {
                "Database" => "DatabaseAuditingStore",
                "File" => "FileAuditingStore", 
                "EventBus" => "EventBusAuditingStore",
                _ => "DatabaseAuditingStore"
            };
        }

        private string BuildFilterMethods(AbpAuditLoggingGenerationArgs args)
        {
            if (!args.EnableSensitiveDataFilter || args.SensitiveFields == null || !args.SensitiveFields.Any())
            {
                return string.Empty;
            }

            var sensitiveFieldsList = string.Join(", ", args.SensitiveFields.Select(f => $"\"{f}\""));
            
            return $@"
        /// <summary>
        /// 过滤敏感数据
        /// </summary>
        private void FilterSensitiveData(EntityChangeInfo entityChange)
        {{
            var sensitiveFields = new[] {{ {sensitiveFieldsList} }};
            
            foreach (var propertyChange in entityChange.PropertyChanges)
            {{
                if (sensitiveFields.Contains(propertyChange.PropertyName, StringComparer.OrdinalIgnoreCase))
                {{
                    propertyChange.OriginalValue = ""[FILTERED]"";
                    propertyChange.NewValue = ""[FILTERED]"";
                }}
            }}
        }}";
        }

        private string BuildAuditConfiguration(AbpAuditLoggingGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            builder.AppendLine($@"            // 启用审计日志
            options.IsEnabled = true;
            options.HideErrors = false;
            options.IsEnabledForAnonymousUsers = false;
            
            // 审计范围配置
            options.EntityHistorySelectors.AddAllEntities();");

            if (args.AuditScope != "All")
            {
                builder.AppendLine($@"            
            // 特定审计范围: {args.AuditScope}
            options.Contributors.Add(new AspNetCoreAuditLogContributor());");
            }

            return builder.ToString();
        }

        private string BuildSensitiveDataConfiguration(AbpAuditLoggingGenerationArgs args)
        {
            if (!args.EnableSensitiveDataFilter)
            {
                return string.Empty;
            }

            return @"            
            // 敏感数据过滤配置
            options.IgnoredTypes.AddIfNotContains(typeof(IdentityUser));
            options.IgnoredTypes.AddIfNotContains(typeof(IdentityRole));";
        }

        private string BuildPerformanceConfiguration(AbpAuditLoggingGenerationArgs args)
        {
            if (!args.EnablePerformanceMonitoring)
            {
                return string.Empty;
            }

            return $@"            
            // 性能监控配置
            options.AlwaysLogOnException = true;
            Configure<AbpAuditingOptions>(auditingOptions =>
            {{
                auditingOptions.ApplicationName = ""{args.EntityName}App"";
                // 性能阈值: {args.PerformanceThresholdMs}ms
            }});";
        }
    }
}
