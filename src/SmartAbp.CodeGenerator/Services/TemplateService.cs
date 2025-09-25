using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.DependencyInjection;
using System.Reflection;
using System.Linq;
using SmartAbp.CodeGenerator.Core.Templates;
using SmartAbp.CodeGenerator.Dto;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 🔥 SmartAbp模板服务 - 基于务实模板系统的企业级实现
    /// 修复了自检发现的致命缺陷：硬编码路径、简陋变量替换、null值处理
    /// </summary>
    [Authorize("SmartAbp.Templates")]
    public class TemplateService : ApplicationService
    {
        private readonly ILogger<TemplateService> _logger;
        private readonly PragmaticTemplateService _pragmaticTemplateService;
        
        // 保持向后兼容的旧属性（已废弃）
        [Obsolete("请使用新的模板服务，此属性将在下个版本移除")]
        private readonly string _templateRoot;

        public TemplateService(
            ILogger<TemplateService> logger,
            PragmaticTemplateService pragmaticTemplateService)
        {
            _logger = logger;
            _pragmaticTemplateService = pragmaticTemplateService;
            
            // 为了向后兼容保留，但不再使用
            _templateRoot = ""; 
        }

        /// <summary>
        /// 读取并处理模板 - 新版本使用务实模板系统
        /// </summary>
        /// <param name="templateRelativePath">模板相对路径</param>
        /// <param name="parameters">模板参数</param>
        /// <returns>处理后的模板内容</returns>
        public async Task<string> ReadAndProcessTemplateAsync(string templateRelativePath, object parameters)
        {
            try
            {
                _logger.LogInformation("开始处理模板 (新版): {TemplatePath}", templateRelativePath);

                // 将参数对象转换为元数据格式
                var metadata = ConvertParametersToMetadata(parameters);
                EntityModelDto? entity = null;

                // 如果参数包含实体信息，提取实体数据
                if (HasEntityData(parameters))
                {
                    entity = ExtractEntityFromParameters(parameters);
                }

                // 使用新的务实模板服务
                var result = await _pragmaticTemplateService.RenderTemplateAsync(
                    templateRelativePath, metadata, entity);

                if (!result.IsSuccess)
                {
                    _logger.LogError("模板渲染失败: {Error}", result.ErrorMessage);
                    throw new InvalidOperationException($"模板渲染失败: {result.ErrorMessage}");
                }

                _logger.LogInformation("模板处理完成 (新版): {TemplatePath}", templateRelativePath);
                return result.RenderedContent!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "模板处理失败: {TemplatePath}", templateRelativePath);
                
                // 对于向后兼容，如果新版本失败，尝试旧版本处理（临时）
                _logger.LogWarning("尝试使用旧版本模板处理方式...");
                return await ReadAndProcessTemplateLegacyAsync(templateRelativePath, parameters);
            }
        }

        /// <summary>
        /// 旧版本模板处理方法（向后兼容，将逐步废弃）
        /// </summary>
        [Obsolete("此方法仅用于向后兼容，请使用新的模板处理方式")]
        private async Task<string> ReadAndProcessTemplateLegacyAsync(string templateRelativePath, object parameters)
        {
            try
            {
                var templateRoot = FindTemplateRootLegacy();
                var templatePath = Path.Combine(templateRoot, templateRelativePath);
                
                if (!File.Exists(templatePath))
                {
                    _logger.LogError("Template file not found (legacy): {TemplatePath}", templatePath);
                    throw new FileNotFoundException("Template file not found.", templatePath);
                }

                var templateContent = await File.ReadAllTextAsync(templatePath);
                return ProcessTemplateLegacy(templateContent, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "旧版本模板处理也失败: {TemplatePath}", templateRelativePath);
                throw;
            }
        }

        /// <summary>
        /// 将参数对象转换为ModuleMetadataDto
        /// </summary>
        private ModuleMetadataDto ConvertParametersToMetadata(object parameters)
        {
            var metadata = new ModuleMetadataDto();

            try
            {
                var paramType = parameters.GetType();
                
                // 使用反射提取常见的模块信息
                var nameProperty = paramType.GetProperty("ModuleName") ?? 
                                  paramType.GetProperty("Name") ?? 
                                  paramType.GetProperty("EntityName");
                if (nameProperty != null)
                {
                    metadata.Name = nameProperty.GetValue(parameters)?.ToString() ?? "DefaultModule";
                }

                var namespaceProperty = paramType.GetProperty("Namespace") ?? 
                                       paramType.GetProperty("ModuleNamespace");
                if (namespaceProperty != null)
                {
                    metadata.Namespace = namespaceProperty.GetValue(parameters)?.ToString() ?? "SmartAbp";
                }

                var descriptionProperty = paramType.GetProperty("Description") ?? 
                                         paramType.GetProperty("ModuleDescription");
                if (descriptionProperty != null)
                {
                    metadata.Description = descriptionProperty.GetValue(parameters)?.ToString();
                }

                // 如果没有找到任何属性，使用默认值
                if (string.IsNullOrEmpty(metadata.Name))
                {
                    metadata.Name = "DefaultModule";
                }
                if (string.IsNullOrEmpty(metadata.Namespace))
                {
                    metadata.Namespace = "SmartAbp";
                }

                return metadata;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "参数转换失败，使用默认元数据");
                return new ModuleMetadataDto 
                { 
                    Name = "DefaultModule", 
                    Namespace = "SmartAbp" 
                };
            }
        }

        /// <summary>
        /// 检查参数是否包含实体数据
        /// </summary>
        private bool HasEntityData(object parameters)
        {
            var paramType = parameters.GetType();
            return paramType.GetProperty("EntityName") != null ||
                   paramType.GetProperty("Entity") != null ||
                   paramType.GetProperty("Properties") != null;
        }

        /// <summary>
        /// 从参数中提取实体数据
        /// </summary>
        private EntityModelDto? ExtractEntityFromParameters(object parameters)
        {
            try
            {
                var entity = new EntityModelDto();
                var paramType = parameters.GetType();

                var entityNameProperty = paramType.GetProperty("EntityName") ?? paramType.GetProperty("Name");
                if (entityNameProperty != null)
                {
                    entity.Name = entityNameProperty.GetValue(parameters)?.ToString() ?? "DefaultEntity";
                }

                // TODO: 可以进一步提取更多实体信息，如Properties等

                return string.IsNullOrEmpty(entity.Name) ? null : entity;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "实体数据提取失败");
                return null;
            }
        }

        /// <summary>
        /// 获取可用模板列表
        /// </summary>
        public List<string> GetAvailableTemplates()
        {
            try
            {
                return _pragmaticTemplateService.GetAvailableTemplates();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取模板列表失败");
                return new List<string>();
            }
        }

        /// <summary>
        /// 验证模板服务配置
        /// </summary>
        public async Task<string> ValidateConfigurationAsync()
        {
            try
            {
                var result = await _pragmaticTemplateService.ValidateConfigurationAsync();
                return result.GetValidationSummary();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "模板服务配置验证失败");
                return $"配置验证失败: {ex.Message}";
            }
        }

        #region 旧版本兼容方法（将废弃）

        [Obsolete("旧版本方法，仅用于兼容性")]
        private string ProcessTemplateLegacy(string template, object parameters)
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

        [Obsolete("旧版本方法，仅用于兼容性")]
        private string FindTemplateRootLegacy()
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

        #endregion
    }
}
