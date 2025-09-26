using System;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Events
{
    /// <summary>
    /// 🔥 SmartAbp代码生成事件定义 - ABP事件驱动架构
    /// 解耦代码生成流程，支持插件化扩展
    /// </summary>

    /// <summary>
    /// 模块生成请求事件 - 触发整个代码生成流程
    /// </summary>
    public class ModuleGenerationRequestedEvent
    {
        public ModuleMetadataDto ModuleMetadata { get; set; }
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public string RequestedBy { get; set; } = string.Empty;
        public string GenerationId { get; set; } = Guid.NewGuid().ToString();
        public GenerationOptions Options { get; set; } = new();

        public ModuleGenerationRequestedEvent(ModuleMetadataDto moduleMetadata, string requestedBy = "System")
        {
            ModuleMetadata = moduleMetadata;
            RequestedBy = requestedBy;
        }
    }

    /// <summary>
    /// 后端代码生成完成事件
    /// </summary>
    public class BackendGenerationCompletedEvent
    {
        public string GenerationId { get; set; }
        public ModuleMetadataDto ModuleMetadata { get; set; }
        public List<string> GeneratedFiles { get; set; } = new();
        public TimeSpan GenerationTime { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }

        public BackendGenerationCompletedEvent(string generationId, ModuleMetadataDto moduleMetadata)
        {
            GenerationId = generationId;
            ModuleMetadata = moduleMetadata;
        }
    }

    /// <summary>
    /// 前端代码生成完成事件
    /// </summary>
    public class FrontendGenerationCompletedEvent
    {
        public string GenerationId { get; set; }
        public ModuleMetadataDto ModuleMetadata { get; set; }
        public List<string> GeneratedFiles { get; set; } = new();
        public TimeSpan GenerationTime { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }

        public FrontendGenerationCompletedEvent(string generationId, ModuleMetadataDto moduleMetadata)
        {
            GenerationId = generationId;
            ModuleMetadata = moduleMetadata;
        }
    }

    /// <summary>
    /// 完整模块生成完成事件
    /// </summary>
    public class ModuleGenerationCompletedEvent
    {
        public string GenerationId { get; set; }
        public GeneratedModuleDto GeneratedModule { get; set; }
        public TimeSpan TotalGenerationTime { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        public GenerationStatistics Statistics { get; set; } = new();

        public ModuleGenerationCompletedEvent(string generationId, GeneratedModuleDto generatedModule)
        {
            GenerationId = generationId;
            GeneratedModule = generatedModule;
        }
    }

    /// <summary>
    /// 代码生成失败事件
    /// </summary>
    public class CodeGenerationFailedEvent
    {
        public string GenerationId { get; set; }
        public ModuleMetadataDto ModuleMetadata { get; set; }
        public string Stage { get; set; } // Backend, Frontend, Integration
        public Exception Exception { get; set; }
        public DateTime FailedAt { get; set; } = DateTime.UtcNow;

        public CodeGenerationFailedEvent(string generationId, ModuleMetadataDto moduleMetadata, string stage, Exception exception)
        {
            GenerationId = generationId;
            ModuleMetadata = moduleMetadata;
            Stage = stage;
            Exception = exception;
        }
    }

    /// <summary>
    /// 代码质量检查事件
    /// </summary>
    public class CodeQualityCheckRequestedEvent
    {
        public string GenerationId { get; set; }
        public Dictionary<string, string> FilesToCheck { get; set; } = new();
        public string QualityStandard { get; set; } = "Enterprise"; // Enterprise, Standard, Basic
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        public CodeQualityCheckRequestedEvent(string generationId, Dictionary<string, string> filesToCheck)
        {
            GenerationId = generationId;
            FilesToCheck = filesToCheck;
        }
    }

    /// <summary>
    /// 代码质量检查完成事件
    /// </summary>
    public class CodeQualityCheckCompletedEvent
    {
        public string GenerationId { get; set; }
        public bool Passed { get; set; }
        public List<QualityIssue> Issues { get; set; } = new();
        public double QualityScore { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        public CodeQualityCheckCompletedEvent(string generationId, bool passed, double qualityScore)
        {
            GenerationId = generationId;
            Passed = passed;
            QualityScore = qualityScore;
        }
    }

    // 支持类型定义
    public class GenerationOptions
    {
        public bool GenerateTests { get; set; } = false;
        public bool GenerateFrontend { get; set; } = true;
        public bool GenerateDocumentation { get; set; } = false;
        public bool RunQualityChecks { get; set; } = true;
        public string ArchitecturePattern { get; set; } = "Crud";
        public List<string> CustomGenerators { get; set; } = new();
    }

    public class GenerationStatistics
    {
        public int TotalFiles { get; set; }
        public int TotalLines { get; set; }
        public int BackendFiles { get; set; }
        public int FrontendFiles { get; set; }
        public int TestFiles { get; set; }
        public TimeSpan BackendGenerationTime { get; set; }
        public TimeSpan FrontendGenerationTime { get; set; }
        public double QualityScore { get; set; }
    }

    public class QualityIssue
    {
        public string Severity { get; set; } = "Warning"; // Error, Warning, Info
        public string Message { get; set; } = string.Empty;
        public string File { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string RuleId { get; set; } = string.Empty;
    }
}
