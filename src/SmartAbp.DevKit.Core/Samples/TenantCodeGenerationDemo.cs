using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Samples;

/// <summary>
/// 租户管理代码生成演示
/// 验证P0/P1/P2生成器的完整功能
/// </summary>
public class TenantCodeGenerationDemo
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TenantCodeGenerationDemo> _logger;

    public TenantCodeGenerationDemo(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
        _logger = serviceProvider.GetRequiredService<ILogger<TenantCodeGenerationDemo>>();
    }

    /// <summary>
    /// 执行完整的租户管理代码生成
    /// </summary>
    public async Task<CodeGenerationResult> ExecuteAsync()
    {
        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        _logger.LogInformation("🚀 开始租户管理代码生成验证");
        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        var result = new CodeGenerationResult
        {
            StartTime = DateTime.Now
        };

        try
        {
            // 1. 创建租户元数据
            _logger.LogInformation("📋 步骤1: 创建租户元数据...");
            var tenantMetadata = TenantMetadataSample.Create();
            var tenantTypeEnum = TenantMetadataSample.CreateTenantTypeEnum();
            var tenantStatusEnum = TenantMetadataSample.CreateTenantStatusEnum();
            _logger.LogInformation("✅ 元数据创建完成");
            _logger.LogInformation($"   • 实体: {tenantMetadata.Name}");
            _logger.LogInformation($"   • 属性数: {tenantMetadata.Properties.Count}");
            _logger.LogInformation($"   • 字段分组: {((System.Collections.Generic.List<Generator.EnhancedGenerators.FieldGroup>)tenantMetadata.ExtensionData["FieldGroups"]).Count}");

            // 2. 准备生成输入
            _logger.LogInformation("");
            _logger.LogInformation("⚙️  步骤2: 准备生成输入...");
            var outputPath = Path.Combine(Directory.GetCurrentDirectory(), "output", "tenant-demo");
            
            var input = new GenerationInput
            {
                EntityId = Guid.NewGuid(),
                Options = new GenerationOptions
                {
                    OutputBasePath = outputPath,
                    NamespacePrefix = "SmartAbp",
                    GenerateDomain = true,
                    GenerateApplication = true,
                    GenerateFrontend = true
                },
                EntityMetadata = tenantMetadata
            };
            
            _logger.LogInformation($"✅ 输出路径: {outputPath}");

            // 3. 获取代码生成器
            _logger.LogInformation("");
            _logger.LogInformation("🔧 步骤3: 获取代码生成器...");
            var codeGenerator = _serviceProvider.GetRequiredService<ICodeGenerator>();
            _logger.LogInformation("✅ 代码生成器已就绪");

            // 4. 执行代码生成
            _logger.LogInformation("");
            _logger.LogInformation("🎨 步骤4: 执行代码生成...");
            _logger.LogInformation("   正在调用9个增强生成器（P0+P1+P2）...");
            
            var generationResult = await codeGenerator.GenerateAsync(input);
            
            _logger.LogInformation("");
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            _logger.LogInformation("📊 代码生成结果统计");
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            
            if (generationResult.GeneratedFiles != null && generationResult.GeneratedFiles.Count > 0)
            {
                result.Success = true;
                result.GeneratedFilesCount = generationResult.GeneratedFiles.Count;
                result.GeneratedFiles = new System.Collections.Generic.List<string>(generationResult.GeneratedFiles.Keys);
                
                _logger.LogInformation($"✅ 生成成功！共生成 {result.GeneratedFilesCount} 个文件:");
                _logger.LogInformation("");
                
                // 按类别分组显示
                var backendFiles = new System.Collections.Generic.List<string>();
                var frontendFiles = new System.Collections.Generic.List<string>();
                
                foreach (var file in result.GeneratedFiles)
                {
                    if (file.Contains("/frontend/") || file.Contains("\\frontend\\"))
                    {
                        frontendFiles.Add(file);
                    }
                    else
                    {
                        backendFiles.Add(file);
                    }
                }
                
                if (backendFiles.Count > 0)
                {
                    _logger.LogInformation($"📦 后端文件 ({backendFiles.Count}个):");
                    foreach (var file in backendFiles)
                    {
                        var fileName = Path.GetFileName(file);
                        _logger.LogInformation($"   • {fileName}");
                    }
                    _logger.LogInformation("");
                }
                
                if (frontendFiles.Count > 0)
                {
                    _logger.LogInformation($"🎨 前端文件 ({frontendFiles.Count}个):");
                    foreach (var file in frontendFiles)
                    {
                        var fileName = Path.GetFileName(file);
                        _logger.LogInformation($"   • {fileName}");
                    }
                }
            }
            else
            {
                result.Success = false;
                result.ErrorMessage = "未生成任何文件";
                _logger.LogWarning("⚠️  未生成任何文件");
            }
            
            if (generationResult.Errors != null && generationResult.Errors.Count > 0)
            {
                result.Errors = generationResult.Errors;
                _logger.LogWarning("");
                _logger.LogWarning($"⚠️  发现 {generationResult.Errors.Count} 个错误:");
                foreach (var error in generationResult.Errors)
                {
                    _logger.LogWarning($"   • {error}");
                }
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.ErrorMessage = ex.Message;
            result.Exception = ex;
            
            _logger.LogError(ex, "❌ 代码生成失败");
        }
        finally
        {
            result.EndTime = DateTime.Now;
            result.Duration = result.EndTime - result.StartTime;
            
            _logger.LogInformation("");
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            _logger.LogInformation($"⏱️  总耗时: {result.Duration.TotalSeconds:F2}秒");
            _logger.LogInformation($"📊 最终状态: {(result.Success ? "✅ 成功" : "❌ 失败")}");
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }

        return result;
    }
}

/// <summary>
/// 代码生成结果
/// </summary>
public class CodeGenerationResult
{
    public bool Success { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public TimeSpan Duration { get; set; }
    public int GeneratedFilesCount { get; set; }
    public System.Collections.Generic.List<string> GeneratedFiles { get; set; } = new();
    public System.Collections.Generic.List<string> Errors { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public Exception? Exception { get; set; }
}

