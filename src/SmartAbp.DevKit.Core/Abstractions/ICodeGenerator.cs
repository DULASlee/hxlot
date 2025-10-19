using System.Threading;
using System.Threading.Tasks;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Abstractions;

/// <summary>
/// 代码生成器接口（所有生成器的基础接口）
/// </summary>
public interface ICodeGenerator
{
    /// <summary>
    /// 生成器名称（唯一标识）
    /// </summary>
    string Name { get; }

    /// <summary>
    /// 生成器描述
    /// </summary>
    string Description { get; }

    /// <summary>
    /// 支持的目标层级
    /// </summary>
    TargetLayer SupportedLayer { get; }

    /// <summary>
    /// 生成器优先级（用于排序执行）
    /// </summary>
    int Priority { get; }

    /// <summary>
    /// 是否启用（可动态禁用某些生成器）
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// 生成代码（核心方法）
    /// </summary>
    /// <param name="context">生成上下文（包含所有需要的元数据）</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>生成结果（包含生成的文件列表）</returns>
    Task<GenerationResult> GenerateAsync(
        GenerationContext context,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 验证生成前的配置是否正确
    /// </summary>
    /// <param name="context">生成上下文</param>
    /// <returns>验证结果</returns>
    Task<ValidationResult> ValidateAsync(GenerationContext context);

    /// <summary>
    /// 获取生成器依赖的其他生成器（用于依赖排序）
    /// </summary>
    /// <returns>依赖的生成器名称列表</returns>
    string[] GetDependencies();
}

/// <summary>
/// 目标层级枚举
/// </summary>
public enum TargetLayer
{
    /// <summary>
    /// Layer 1 - 基础CRUD层
    /// </summary>
    Layer1 = 1,

    /// <summary>
    /// Layer 2 - 高级功能层（高级筛选、批量操作等）
    /// </summary>
    Layer2 = 2,

    /// <summary>
    /// Layer 3 - 企业级层（审批流、数据权限、AI辅助等）
    /// </summary>
    Layer3 = 3,

    /// <summary>
    /// 微服务层（Aspire编排）
    /// </summary>
    Microservice = 10
}

/// <summary>
/// 生成结果
/// </summary>
public class GenerationResult
{
    /// <summary>
    /// 是否成功
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<GeneratedFile> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 警告消息列表
    /// </summary>
    public List<string> Warnings { get; set; } = new();

    /// <summary>
    /// 错误消息（如果失败）
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// 生成统计信息
    /// </summary>
    public GenerationStatistics Statistics { get; set; } = new();
}

/// <summary>
/// 生成的文件
/// </summary>
public class GeneratedFile
{
    /// <summary>
    /// 文件路径（相对路径）
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// 文件内容
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// 文件类型
    /// </summary>
    public FileType FileType { get; set; }

    /// <summary>
    /// 是否覆盖已存在的文件
    /// </summary>
    public bool OverwriteIfExists { get; set; } = false;
}

/// <summary>
/// 文件类型枚举
/// </summary>
public enum FileType
{
    CSharp,
    TypeScript,
    Vue,
    Json,
    Xml,
    Markdown,
    Other
}

/// <summary>
/// 生成统计信息
/// </summary>
public class GenerationStatistics
{
    /// <summary>
    /// 生成的文件数量
    /// </summary>
    public int FileCount { get; set; }

    /// <summary>
    /// 生成的代码行数
    /// </summary>
    public int LineCount { get; set; }

    /// <summary>
    /// 生成耗时（毫秒）
    /// </summary>
    public long DurationMs { get; set; }

    /// <summary>
    /// 内存占用（字节）
    /// </summary>
    public long MemoryUsageBytes { get; set; }
}

/// <summary>
/// 验证结果
/// </summary>
public class ValidationResult
{
    /// <summary>
    /// 是否有效
    /// </summary>
    public bool IsValid { get; set; } = true;

    /// <summary>
    /// 错误消息列表
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// 警告消息列表
    /// </summary>
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// 代码生成上下文（包含所有生成器需要的数据）
/// </summary>
public class GenerationContext
{
    /// <summary>
    /// 上下文唯一标识符
    /// </summary>
    public Guid ContextId { get; set; } = Guid.NewGuid();

    /// <summary>
    /// 低代码模块配置
    /// </summary>
    public required LowCodeConfig Config { get; set; }

    /// <summary>
    /// 输出路径（项目根目录）
    /// </summary>
    public string OutputPath { get; set; } = string.Empty;

    /// <summary>
    /// 目标层级
    /// </summary>
    public TargetLayer TargetLayer { get; set; }

    /// <summary>
    /// 生成模式（Create、Upgrade、ForceOverwrite、Preview）
    /// </summary>
    public GenerationMode GenerationMode { get; set; } = GenerationMode.Create;

    /// <summary>
    /// 生成选项
    /// </summary>
    public GenerationOptions Options { get; set; } = new();

    /// <summary>
    /// 共享数据（用于生成器间传递数据）
    /// </summary>
    public Dictionary<string, object> SharedData { get; set; } = new();

    /// <summary>
    /// 元数据（用于扩展）
    /// </summary>
    public Dictionary<string, object> Metadata { get; set; } = new();
}

/// <summary>
/// 代码生成选项
/// </summary>
public class GenerationOptions
{
    /// <summary>
    /// 是否覆盖已存在的文件
    /// </summary>
    public bool OverwriteExistingFiles { get; set; } = false;

    /// <summary>
    /// 是否使用增量生成（只生成变化的文件）
    /// </summary>
    public bool UseIncrementalGeneration { get; set; } = true;

    /// <summary>
    /// 是否使用并行生成
    /// </summary>
    public bool UseParallelGeneration { get; set; } = true;

    /// <summary>
    /// 最大并发数
    /// </summary>
    public int MaxConcurrency { get; set; } = 10;

    /// <summary>
    /// 是否生成详细日志
    /// </summary>
    public bool VerboseLogging { get; set; } = false;

    /// <summary>
    /// 是否执行代码格式化
    /// </summary>
    public bool FormatCode { get; set; } = true;

    /// <summary>
    /// 自定义模板路径（用于覆盖默认模板）
    /// </summary>
    public string? CustomTemplatePath { get; set; }

    /// <summary>
    /// 是否创建备份
    /// </summary>
    public bool CreateBackup { get; set; } = true;

    /// <summary>
    /// 是否预览模式（不写入文件）
    /// </summary>
    public bool PreviewMode { get; set; } = false;
}

/// <summary>
/// 生成模式枚举
/// </summary>
public enum GenerationMode
{
    /// <summary>
    /// 新建（首次生成）
    /// </summary>
    Create,

    /// <summary>
    /// 升级（更新现有代码）
    /// </summary>
    Upgrade,

    /// <summary>
    /// 强制覆盖
    /// </summary>
    ForceOverwrite,

    /// <summary>
    /// 预览（不写入文件）
    /// </summary>
    Preview
}


