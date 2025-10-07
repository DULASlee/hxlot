using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Templates
{
    /// <summary>
    /// 基于文件的模板服务实现
    /// </summary>
    public class FileBasedTemplateService : ITemplateService, ITransientDependency
    {
        private readonly ILogger<FileBasedTemplateService> _logger;
        private readonly string _templateRoot;

        public FileBasedTemplateService(ILogger<FileBasedTemplateService> logger)
        {
            _logger = logger;
            
            // 获取模板根目录
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            _templateRoot = Path.Combine(baseDir, "templates");
            
            // 如果templates目录不存在，尝试从源代码位置查找
            if (!Directory.Exists(_templateRoot))
            {
                var projectRoot = FindProjectRoot(baseDir);
                if (projectRoot != null)
                {
                    _templateRoot = Path.Combine(projectRoot, "src", "SmartAbp.CodeGenerator", "templates");
                }
            }
            
            _logger.LogInformation("模板根目录: {TemplateRoot}", _templateRoot);
        }

        public async Task<string> GetTemplateAsync(string templateName)
        {
            try
            {
                // 支持多种扩展名
                var extensions = new[] { ".tpl", ".template", ".txt", "" };
                
                foreach (var ext in extensions)
                {
                    var fileName = templateName.EndsWith(ext) ? templateName : templateName + ext;
                    var filePath = Path.Combine(_templateRoot, fileName);
                    
                    if (File.Exists(filePath))
                    {
                        _logger.LogDebug("读取模板文件: {FilePath}", filePath);
                        return await File.ReadAllTextAsync(filePath, Encoding.UTF8);
                    }
                }
                
                throw new FileNotFoundException($"模板文件未找到: {templateName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "读取模板失败: {TemplateName}", templateName);
                throw;
            }
        }

        public async Task<List<string>> GetAllTemplateNamesAsync()
        {
            try
            {
                if (!Directory.Exists(_templateRoot))
                {
                    return new List<string>();
                }

                var files = Directory.GetFiles(_templateRoot, "*.*", SearchOption.AllDirectories);
                var templateNames = files
                    .Select(f => Path.GetRelativePath(_templateRoot, f))
                    .Where(f => f.EndsWith(".tpl") || f.EndsWith(".template") || f.EndsWith(".txt"))
                    .ToList();

                return await Task.FromResult(templateNames);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取模板列表失败");
                return new List<string>();
            }
        }

        public async Task<bool> TemplateExistsAsync(string templateName)
        {
            try
            {
                var extensions = new[] { ".tpl", ".template", ".txt", "" };
                
                foreach (var ext in extensions)
                {
                    var fileName = templateName.EndsWith(ext) ? templateName : templateName + ext;
                    var filePath = Path.Combine(_templateRoot, fileName);
                    
                    if (File.Exists(filePath))
                    {
                        return await Task.FromResult(true);
                    }
                }
                
                return await Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "检查模板存在性失败: {TemplateName}", templateName);
                return false;
            }
        }

        private string? FindProjectRoot(string startPath)
        {
            var directory = new DirectoryInfo(startPath);
            
            while (directory != null)
            {
                // 查找.sln文件或src目录
                if (directory.GetFiles("*.sln").Any() || 
                    directory.GetDirectories("src").Any())
                {
                    return directory.FullName;
                }
                
                directory = directory.Parent;
            }
            
            return null;
        }
    }
}

