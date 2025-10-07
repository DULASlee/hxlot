using System.Text;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Core.Templates;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP模块代码生成器
    /// </summary>
    public class AbpModuleGenerator : ITransientDependency
    {
        private readonly ITemplateService _templateService;

        public AbpModuleGenerator(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        /// <summary>
        /// 生成ABP模块代码
        /// </summary>
        public async Task<string> GenerateAsync(AbpModuleGenerationArgs args)
        {
            var template = await _templateService.GetTemplateAsync("AbpModule");
            
            var dependencies = new StringBuilder();
            if (args.Dependencies != null && args.Dependencies.Count > 0)
            {
                foreach (var dep in args.Dependencies)
                {
                    dependencies.AppendLine($"    [DependsOn(typeof({dep}))]");
                }
            }

            var customConfig = string.IsNullOrEmpty(args.CustomConfiguration) 
                ? string.Empty 
                : args.CustomConfiguration;

            var result = template
                .Replace("{{Namespace}}", args.Namespace)
                .Replace("{{ModuleName}}", args.ModuleName)
                .Replace("{{Dependencies}}", dependencies.ToString())
                .Replace("{{CustomConfiguration}}", customConfig);

            return result;
        }
    }
}
