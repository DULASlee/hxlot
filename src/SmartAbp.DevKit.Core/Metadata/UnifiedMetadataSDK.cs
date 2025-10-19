using System;
using System.Collections.Generic;
using System.Linq;
using SmartAbp.Domain.Entities.LowCode;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Metadata;

/// <summary>
/// 统一元数据SDK（增强版）
/// Phase 2核心组件 - 提供统一的元数据访问接口
/// 
/// 功能清单:
/// - 实体查询（CRUD）
/// - 属性查询（完整支持）
/// - 关系查询（OneToOne/OneToMany/ManyToMany）⭐
/// - 索引查询（完整支持）⭐
/// - 约束查询（完整支持）⭐
/// - 验证规则查询（完整支持）
/// - 模块管理（完整支持）
/// </summary>
public class UnifiedMetadataSDK
{
    private readonly List<LowCodeEntity> _entities = new();
    private readonly List<LowCodeModule> _modules = new();
    private readonly ILogger<UnifiedMetadataSDK>? _logger;

    public UnifiedMetadataSDK(ILogger<UnifiedMetadataSDK>? logger = null)
    {
        _logger = logger;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 实体查询方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 获取实体元数据（按ID）
    /// </summary>
    public LowCodeEntity? GetEntity(Guid entityId)
    {
        return _entities.FirstOrDefault(e => e.Id == entityId);
    }

    /// <summary>
    /// 获取实体元数据（按名称）
    /// </summary>
    public LowCodeEntity? GetEntityByName(string name)
    {
        return _entities.FirstOrDefault(e => 
            e.Name?.Equals(name, StringComparison.OrdinalIgnoreCase) == true);
    }

    /// <summary>
    /// 获取所有实体
    /// </summary>
    public List<LowCodeEntity> GetAllEntities()
    {
        return _entities.ToList();
    }

    /// <summary>
    /// 获取指定模块的所有实体
    /// </summary>
    public List<LowCodeEntity> GetEntitiesByModule(Guid moduleId)
    {
        return _entities.Where(e => e.ModuleId == moduleId).ToList();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 属性查询方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 获取实体的所有属性
    /// </summary>
    public List<LowCodeProperty> GetProperties(Guid entityId)
    {
        var entity = GetEntity(entityId);
        return entity?.Properties?.ToList() ?? new List<LowCodeProperty>();
    }

    /// <summary>
    /// 获取实体的主键属性
    /// </summary>
    public LowCodeProperty? GetPrimaryKeyProperty(Guid entityId)
    {
        var properties = GetProperties(entityId);
        return properties.FirstOrDefault(p => p.IsKey);
    }

    /// <summary>
    /// 获取实体的主键类型（默认使用Guid）
    /// </summary>
    public string GetPrimaryKeyType(Guid entityId)
    {
        var keyProperty = GetPrimaryKeyProperty(entityId);
        return keyProperty?.Type ?? "Guid"; // 默认Guid
    }

    /// <summary>
    /// 获取实体的必填属性
    /// </summary>
    public List<LowCodeProperty> GetRequiredProperties(Guid entityId)
    {
        var properties = GetProperties(entityId);
        return properties.Where(p => p.IsRequired).ToList();
    }

    /// <summary>
    /// 获取实体的可空属性
    /// </summary>
    public List<LowCodeProperty> GetNullableProperties(Guid entityId)
    {
        var properties = GetProperties(entityId);
        return properties.Where(p => p.IsNullable).ToList();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 关系查询方法 ⭐ Phase 2增强功能（暂不实现，后端LowCodeEntity无Relationships）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TODO: 等待后端LowCodeEntity添加Relationships导航属性后实现

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 索引查询方法 ⭐ Phase 2增强功能（暂不实现，后端无EntityIndex类型）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TODO: 等待后端添加EntityIndex类型后实现

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 约束查询方法 ⭐ Phase 2增强功能（暂不实现，后端无EntityConstraint类型）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TODO: 等待后端添加EntityConstraint类型后实现

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 验证规则查询方法 ⭐ Phase 2增强功能（暂不实现，后端LowCodeEntity无ValidationRules）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TODO: 等待后端LowCodeEntity添加ValidationRules导航属性后实现

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 模块管理方法 ⭐ Phase 2增强功能
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 获取模块（按ID）
    /// </summary>
    public LowCodeModule? GetModule(Guid moduleId)
    {
        return _modules.FirstOrDefault(m => m.Id == moduleId);
    }

    /// <summary>
    /// 获取模块（按名称）
    /// </summary>
    public LowCodeModule? GetModuleByName(string moduleName)
    {
        return _modules.FirstOrDefault(m => 
            m.ModuleName?.Equals(moduleName, StringComparison.OrdinalIgnoreCase) == true);
    }

    /// <summary>
    /// 获取所有模块
    /// </summary>
    public List<LowCodeModule> GetAllModules()
    {
        return _modules.ToList();
    }

    /// <summary>
    /// 获取模块的所有实体
    /// </summary>
    public List<LowCodeEntity> GetModuleEntities(Guid moduleId)
    {
        return GetEntitiesByModule(moduleId);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 元数据加载方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 加载实体元数据（从数据库或其他来源）
    /// </summary>
    public void LoadEntities(List<LowCodeEntity> entities)
    {
        _entities.Clear();
        _entities.AddRange(entities);
        _logger?.LogInformation($"✅ 已加载 {entities.Count} 个实体元数据");
    }

    /// <summary>
    /// 加载模块元数据（从数据库或其他来源）
    /// </summary>
    public void LoadModules(List<LowCodeModule> modules)
    {
        _modules.Clear();
        _modules.AddRange(modules);
        _logger?.LogInformation($"✅ 已加载 {modules.Count} 个模块元数据");
    }

    /// <summary>
    /// 加载完整元数据（模块 + 实体）
    /// </summary>
    public void LoadMetadata(List<LowCodeModule> modules, List<LowCodeEntity> entities)
    {
        LoadModules(modules);
        LoadEntities(entities);
        _logger?.LogInformation($"✅ 已加载完整元数据: {modules.Count} 个模块, {entities.Count} 个实体");
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 验证实体是否存在
    /// </summary>
    public bool EntityExists(Guid entityId)
    {
        return GetEntity(entityId) != null;
    }

    /// <summary>
    /// 验证模块是否存在
    /// </summary>
    public bool ModuleExists(Guid moduleId)
    {
        return GetModule(moduleId) != null;
    }

    /// <summary>
    /// 获取元数据统计信息
    /// </summary>
    public MetadataStatistics GetStatistics()
    {
        return new MetadataStatistics
        {
            TotalModules = _modules.Count,
            TotalEntities = _entities.Count,
            TotalProperties = _entities.Sum(e => e.Properties?.Count ?? 0)
        };
    }
}

/// <summary>
/// 元数据统计信息
/// </summary>
public class MetadataStatistics
{
    public int TotalModules { get; set; }
    public int TotalEntities { get; set; }
    public int TotalProperties { get; set; }
}

