namespace SmartAbp.CodeGenerator.Core.Incremental;

/// <summary>
/// 生成文件信息
/// </summary>
public class GeneratedFileInfo
{
    /// <summary>
    /// 相对路径
    /// </summary>
    public required string RelativePath { get; set; }

    /// <summary>
    /// 绝对路径
    /// </summary>
    public required string AbsolutePath { get; set; }

    /// <summary>
    /// 文件内容
    /// </summary>
    public string? Content { get; set; }

    /// <summary>
    /// 文件大小（字节）
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 文件类型
    /// </summary>
    public GeneratedFileType Type { get; set; }
}

/// <summary>
/// 生成错误信息
/// </summary>
public class GenerationError
{
    /// <summary>
    /// 错误类型
    /// </summary>
    public GenerationErrorType Type { get; set; }

    /// <summary>
    /// 错误消息
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// 错误详情
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// 源文件路径
    /// </summary>
    public string? SourceFile { get; set; }

    /// <summary>
    /// 行号
    /// </summary>
    public int? LineNumber { get; set; }

    /// <summary>
    /// 列号
    /// </summary>
    public int? ColumnNumber { get; set; }

    /// <summary>
    /// 错误代码
    /// </summary>
    public string? ErrorCode { get; set; }

    /// <summary>
    /// 发生时间
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// 生成文件类型
/// </summary>
public enum GeneratedFileType
{
    /// <summary>
    /// 源代码文件
    /// </summary>
    Source,

    /// <summary>
    /// 配置文件
    /// </summary>
    Configuration,

    /// <summary>
    /// 测试文件
    /// </summary>
    Test,

    /// <summary>
    /// 文档文件
    /// </summary>
    Documentation,

    /// <summary>
    /// 脚本文件
    /// </summary>
    Script,

    /// <summary>
    /// 资源文件
    /// </summary>
    Resource
}

/// <summary>
/// 生成错误类型
/// </summary>
public enum GenerationErrorType
{
    /// <summary>
    /// 系统错误
    /// </summary>
    SystemError,

    /// <summary>
    /// 验证错误
    /// </summary>
    ValidationError,

    /// <summary>
    /// 模板错误
    /// </summary>
    TemplateError,

    /// <summary>
    /// 配置错误
    /// </summary>
    ConfigurationError,

    /// <summary>
    /// 输入错误
    /// </summary>
    InputError,

    /// <summary>
    /// 输出错误
    /// </summary>
    OutputError,

    /// <summary>
    /// 编译错误
    /// </summary>
    CompilationError,

    /// <summary>
    /// 网络错误
    /// </summary>
    NetworkError,

    /// <summary>
    /// 权限错误
    /// </summary>
    PermissionError,

    /// <summary>
    /// 磁盘空间错误
    /// </summary>
    DiskSpaceError
}
