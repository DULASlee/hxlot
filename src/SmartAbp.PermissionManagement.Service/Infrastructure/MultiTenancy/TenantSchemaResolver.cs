using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.PermissionManagement.Infrastructure.MultiTenancy;

/// <summary>
/// 租户Schema解析器
/// 为每个租户生成独立的PostgreSQL Schema名称
/// 策略：Shared Database, Separate Schema
/// </summary>
public class TenantSchemaResolver : ITenantSchemaResolver, ITransientDependency
{
    private readonly ICurrentTenant _currentTenant;
    private readonly ILogger<TenantSchemaResolver> _logger;

    public TenantSchemaResolver(
        ICurrentTenant currentTenant,
        ILogger<TenantSchemaResolver> logger)
    {
        _currentTenant = currentTenant;
        _logger = logger;
    }

    /// <summary>
    /// 获取当前租户的Schema名称
    /// Host租户: "public" (默认Schema)
    /// 普通租户: "tenant_{tenantId}"
    /// </summary>
    public string GetSchemaName()
    {
        if (!_currentTenant.IsAvailable)
        {
            // Host租户使用默认public schema
            _logger.LogDebug("当前为Host租户，使用默认Schema: public");
            return "public";
        }

        var tenantId = _currentTenant.Id!.Value;
        var schemaName = $"tenant_{tenantId:N}"; // N格式：32位小写无分隔符
        
        _logger.LogDebug("当前租户ID: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
        
        return schemaName;
    }

    /// <summary>
    /// 根据租户ID获取Schema名称（用于管理操作）
    /// </summary>
    public string GetSchemaName(Guid tenantId)
    {
        return $"tenant_{tenantId:N}";
    }

    /// <summary>
    /// 验证Schema名称是否合法（PostgreSQL命名规则）
    /// </summary>
    public bool IsValidSchemaName(string schemaName)
    {
        if (string.IsNullOrWhiteSpace(schemaName))
            return false;

        // PostgreSQL Schema名称规则：
        // 1. 不超过63个字符
        // 2. 只包含字母、数字、下划线
        // 3. 必须以字母或下划线开头
        if (schemaName.Length > 63)
            return false;

        if (!char.IsLetter(schemaName[0]) && schemaName[0] != '_')
            return false;

        foreach (var c in schemaName)
        {
            if (!char.IsLetterOrDigit(c) && c != '_')
                return false;
        }

        return true;
    }
}

/// <summary>
/// 租户Schema解析器接口
/// </summary>
public interface ITenantSchemaResolver
{
    /// <summary>
    /// 获取当前租户的Schema名称
    /// </summary>
    string GetSchemaName();

    /// <summary>
    /// 根据租户ID获取Schema名称
    /// </summary>
    string GetSchemaName(Guid tenantId);

    /// <summary>
    /// 验证Schema名称是否合法
    /// </summary>
    bool IsValidSchemaName(string schemaName);
}

