namespace SmartAbp.DevKit.Abstractions.Metadata;

/// <summary>
/// 元数据提供者接口，用于获取低代码引擎的元数据信息
/// </summary>
public interface IMetadataProvider
{
    /// <summary>
    /// 获取实体元数据
    /// </summary>
    /// <param name="entityId">实体ID</param>
    /// <returns>实体元数据</returns>
    Task<EntityMetadata> GetEntityMetadataAsync(Guid entityId);

    /// <summary>
    /// 获取模块元数据
    /// </summary>
    /// <param name="moduleId">模块ID</param>
    /// <returns>模块元数据</returns>
    Task<ModuleMetadata> GetModuleMetadataAsync(Guid moduleId);

    /// <summary>
    /// 获取模块下的所有实体
    /// </summary>
    /// <param name="moduleId">模块ID</param>
    /// <returns>实体列表</returns>
    Task<List<EntityMetadata>> GetAllEntitiesAsync(Guid moduleId);
}

/// <summary>
/// 实体元数据（增强扩展数据支持）
/// </summary>
public class EntityMetadata
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public List<PropertyMetadata> Properties { get; set; } = new();

    /// <summary>
    /// 扩展数据，用于存储业务特定的完整信息
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}

/// <summary>
/// 属性元数据（增强扩展数据支持）
/// </summary>
public class PropertyMetadata
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public bool IsNullable { get; set; }

    /// <summary>
    /// 扩展数据，用于存储业务特定的完整属性信息
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}

/// <summary>
/// 模块元数据（增强扩展数据支持）
/// </summary>
public class ModuleMetadata
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string OutputPath { get; set; } = string.Empty;

    /// <summary>
    /// 扩展数据，用于存储业务特定的完整模块信息
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}
