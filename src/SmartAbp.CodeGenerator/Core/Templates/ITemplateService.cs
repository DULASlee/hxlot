using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Core.Templates
{
    /// <summary>
    /// 模板服务接口 - 用于简单的模板读取和处理
    /// </summary>
    public interface ITemplateService
    {
        /// <summary>
        /// 获取模板内容
        /// </summary>
        /// <param name="templateName">模板名称</param>
        /// <returns>模板内容</returns>
        Task<string> GetTemplateAsync(string templateName);

        /// <summary>
        /// 获取所有模板名称
        /// </summary>
        Task<List<string>> GetAllTemplateNamesAsync();

        /// <summary>
        /// 检查模板是否存在
        /// </summary>
        Task<bool> TemplateExistsAsync(string templateName);
    }
}

