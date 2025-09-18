using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using System.Reflection;
using System.Linq;

namespace SmartAbp.CodeGenerator.Services
{
    public class TemplateService : ITransientDependency
    {
        private readonly ILogger<TemplateService> _logger;
        private readonly string _templateRoot;

        public TemplateService(ILogger<TemplateService> logger)
        {
            _logger = logger;
            _templateRoot = FindTemplateRoot();
        }

        public async Task<string> ReadAndProcessTemplateAsync(string templateRelativePath, object parameters)
        {
            var templatePath = Path.Combine(_templateRoot, templateRelativePath);
            if (!File.Exists(templatePath))
            {
                _logger.LogError("Template file not found: {TemplatePath}", templatePath);
                throw new FileNotFoundException("Template file not found.", templatePath);
            }

            var templateContent = await File.ReadAllTextAsync(templatePath);
            return ProcessTemplate(templateContent, parameters);
        }

        private string ProcessTemplate(string template, object parameters)
        {
            // Simple regex-based replacement
            return Regex.Replace(template, @"\{\{([^{}]+)\}\}", match =>
            {
                var key = match.Groups[1].Value.Trim();
                var prop = parameters.GetType().GetProperty(key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (prop != null)
                {
                    return prop.GetValue(parameters)?.ToString() ?? "";
                }
                _logger.LogWarning("Template placeholder '{{{{ {Placeholder} }}}}' not found in parameters.", key);
                return match.Value; // Return original placeholder if not found
            });
        }

        private string FindTemplateRoot()
        {
            var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (currentDir != null)
            {
                var templateDir = Path.Combine(currentDir.FullName, "templates");
                if (Directory.Exists(templateDir))
                {
                    return templateDir;
                }
                currentDir = currentDir.Parent;
            }
            throw new DirectoryNotFoundException("Could not find the 'templates' directory in the solution path.");
        }
    }
}
