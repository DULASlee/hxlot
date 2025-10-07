using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.CodeGenerator.Core.Templates;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// 用于测试的模拟模板服务
    /// </summary>
    public class FakeTemplateService : ITemplateService
    {
        private readonly Dictionary<string, string> _templates = new();

        public void AddTemplate(string name, string content)
        {
            _templates[name] = content;
        }

        public Task<string> GetTemplateAsync(string templateName)
        {
            if (_templates.TryGetValue(templateName, out var content))
            {
                return Task.FromResult(content);
            }
            
            throw new System.IO.FileNotFoundException($"Template '{templateName}' not found.");
        }

        public Task<List<string>> GetAllTemplateNamesAsync()
        {
            return Task.FromResult(new List<string>(_templates.Keys));
        }

        public Task<bool> TemplateExistsAsync(string templateName)
        {
            return Task.FromResult(_templates.ContainsKey(templateName));
        }
    }
}

