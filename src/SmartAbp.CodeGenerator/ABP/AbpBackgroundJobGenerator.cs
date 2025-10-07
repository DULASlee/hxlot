using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Core.Templates;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP后台作业代码生成器
    /// </summary>
    public class AbpBackgroundJobGenerator : ITransientDependency
    {
        private readonly ITemplateService _templateService;

        public AbpBackgroundJobGenerator(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        /// <summary>
        /// 生成ABP后台作业代码
        /// </summary>
        public async Task<string> GenerateAsync(AbpBackgroundJobGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpBackgroundJob");
            
            // 生成服务依赖字段
            var dependencies = BuildDependencies(args);
            
            // 生成构造函数参数
            var constructorParams = BuildConstructorParameters(args);
            
            // 生成构造函数赋值
            var constructorAssignments = BuildConstructorAssignments(args);
            
            // 生成Execute方法实现
            var executeCode = BuildExecuteCode(args);
            
            // 生成作业特性配置
            var jobAttributes = BuildJobAttributes(args);

            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{JobName}}", args.JobName)
                .Replace("{{Description}}", args.Description ?? $"{args.JobName} Background Job")
                .Replace("{{JobAttributes}}", jobAttributes)
                .Replace("{{Dependencies}}", dependencies)
                .Replace("{{ConstructorParams}}", constructorParams)
                .Replace("{{ConstructorAssignments}}", constructorAssignments)
                .Replace("{{ExecuteCode}}", executeCode)
                .Replace("{{ArgsType}}", args.ArgsType ?? "object");

            return result;
        }

        private string BuildDependencies(AbpBackgroundJobGenerationArgs args)
        {
            if (args.ServiceDependencies == null || !args.ServiceDependencies.Any())
            {
                return string.Empty;
            }

            var builder = new StringBuilder();
            foreach (var dep in args.ServiceDependencies)
            {
                var readonlyKeyword = dep.IsReadonly ? "readonly " : "";
                builder.AppendLine($"        private {readonlyKeyword}{dep.InterfaceType} {dep.FieldName};");
            }

            return builder.ToString();
        }

        private string BuildConstructorParameters(AbpBackgroundJobGenerationArgs args)
        {
            if (args.ServiceDependencies == null || !args.ServiceDependencies.Any())
            {
                return string.Empty;
            }

            var parameters = args.ServiceDependencies
                .Select(dep => $"{dep.InterfaceType} {ToCamelCase(dep.FieldName)}")
                .ToList();

            return parameters.Any() ? ",\n            " + string.Join(",\n            ", parameters) : string.Empty;
        }

        private string BuildConstructorAssignments(AbpBackgroundJobGenerationArgs args)
        {
            if (args.ServiceDependencies == null || !args.ServiceDependencies.Any())
            {
                return string.Empty;
            }

            var builder = new StringBuilder();
            foreach (var dep in args.ServiceDependencies)
            {
                builder.AppendLine($"            {dep.FieldName} = {ToCamelCase(dep.FieldName)};");
            }

            return builder.ToString();
        }

        private string BuildExecuteCode(AbpBackgroundJobGenerationArgs args)
        {
            if (!string.IsNullOrEmpty(args.CustomExecuteCode))
            {
                return args.CustomExecuteCode;
            }

            // 根据作业类型生成默认实现
            return args.JobType switch
            {
                "DataSync" => GenerateDataSyncCode(args),
                "ReportGeneration" => GenerateReportCode(args),
                "EmailSending" => GenerateEmailCode(args),
                "ScheduledTask" => GenerateScheduledTaskCode(args),
                _ => GenerateDefaultCode(args)
            };
        }

        private string BuildJobAttributes(AbpBackgroundJobGenerationArgs args)
        {
            var builder = new StringBuilder();
            
            // 添加BackgroundJob特性
            var attributeParams = new List<string>();
            
            if (args.EnableRetry)
            {
                attributeParams.Add($"MaxTryCount = {args.MaxRetryCount}");
            }
            
            if (!string.IsNullOrEmpty(args.Priority))
            {
                attributeParams.Add($"Priority = BackgroundJobPriority.{args.Priority}");
            }
            
            if (args.EnableDistributedLock)
            {
                attributeParams.Add("IsDistributedLock = true");
            }

            if (attributeParams.Any())
            {
                builder.AppendLine($"    [BackgroundJob({string.Join(", ", attributeParams)})]");
            }
            else
            {
                builder.AppendLine("    [BackgroundJob]");
            }

            return builder.ToString();
        }

        private string GenerateDataSyncCode(AbpBackgroundJobGenerationArgs args)
        {
            return @"            Logger.LogInformation(""Starting data synchronization job..."");
            
            // TODO: Implement data synchronization logic
            
            Logger.LogInformation(""Data synchronization completed successfully."");";
        }

        private string GenerateReportCode(AbpBackgroundJobGenerationArgs args)
        {
            return @"            Logger.LogInformation(""Starting report generation..."");
            
            // TODO: Implement report generation logic
            
            Logger.LogInformation(""Report generated successfully."");";
        }

        private string GenerateEmailCode(AbpBackgroundJobGenerationArgs args)
        {
            return @"            Logger.LogInformation(""Sending email..."");
            
            // TODO: Implement email sending logic
            
            Logger.LogInformation(""Email sent successfully."");";
        }

        private string GenerateScheduledTaskCode(AbpBackgroundJobGenerationArgs args)
        {
            return @"            Logger.LogInformation(""Executing scheduled task..."");
            
            // TODO: Implement scheduled task logic
            
            Logger.LogInformation(""Scheduled task completed successfully."");";
        }

        private string GenerateDefaultCode(AbpBackgroundJobGenerationArgs args)
        {
            return @"            Logger.LogInformation(""Executing background job: "" + args);
            
            // TODO: Implement job logic
            
            Logger.LogInformation(""Background job completed successfully."");";
        }

        private string ToCamelCase(string input)
        {
            if (string.IsNullOrEmpty(input) || input.Length < 2)
            {
                return input;
            }

            if (input.StartsWith("_"))
            {
                return char.ToLowerInvariant(input[1]) + input.Substring(2);
            }

            return char.ToLowerInvariant(input[0]) + input.Substring(1);
        }
    }
}

