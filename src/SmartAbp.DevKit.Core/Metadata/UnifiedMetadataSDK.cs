using System;
using System.Collections.Generic;
using System.Linq;
using SmartAbp.Domain.Entities.LowCode;

namespace SmartAbp.DevKit.Core.Metadata;

/// <summary>
/// 统一元数据SDK
/// Phase 2核心组件 - 提供统一的元数据访问接口
/// </summary>
public class UnifiedMetadataSDK
{
    private readonly List<LowCodeEntity> _entities = new();

    /// <summary>
    /// 获取实体元数据
    /// </summary>
    public LowCodeEntity? GetEntity(Guid entityId)
    {
        return _entities.FirstOrDefault(e => e.Id == entityId);
    }

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
    public LowCodeProperty? GetPrimaryKey(Guid entityId)
    {
        return GetProperties(entityId).FirstOrDefault(p => p.IsPrimaryKey);
    }

    /// <summary>
    /// 加载元数据（从数据库或其他来源）
    /// </summary>
    public void LoadMetadata(List<LowCodeEntity> entities)
    {
        _entities.Clear();
        _entities.AddRange(entities);
    }
}

