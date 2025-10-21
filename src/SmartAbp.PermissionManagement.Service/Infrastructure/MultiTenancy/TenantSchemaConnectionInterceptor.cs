using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.PermissionManagement.Infrastructure.MultiTenancy;

/// <summary>
/// 租户Schema连接拦截器
/// 在打开数据库连接时自动设置PostgreSQL的search_path为当前租户的Schema
/// 实现Shared Database, Separate Schema多租户数据隔离策略
/// </summary>
public class TenantSchemaConnectionInterceptor : DbConnectionInterceptor
{
    private readonly ICurrentTenant _currentTenant;
    private readonly ITenantSchemaResolver _schemaResolver;
    private readonly ILogger<TenantSchemaConnectionInterceptor> _logger;

    public TenantSchemaConnectionInterceptor(
        ICurrentTenant currentTenant,
        ITenantSchemaResolver schemaResolver,
        ILogger<TenantSchemaConnectionInterceptor> logger)
    {
        _currentTenant = currentTenant;
        _schemaResolver = schemaResolver;
        _logger = logger;
    }

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        await SetSearchPathAsync(connection, cancellationToken);
        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }

    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        SetSearchPath(connection);
        base.ConnectionOpened(connection, eventData);
    }

    /// <summary>
    /// 设置PostgreSQL的search_path（异步）
    /// search_path定义了PostgreSQL查询时搜索表的Schema顺序
    /// </summary>
    private async Task SetSearchPathAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        var schemaName = _schemaResolver.GetSchemaName();

        // 设置search_path: 优先搜索租户Schema，其次是public（用于共享表如Tenants）
        var sql = $"SET search_path TO \"{schemaName}\", public;";

        _logger.LogDebug(
            "设置租户Schema - TenantId: {TenantId}, Schema: {SchemaName}",
            _currentTenant.Id,
            schemaName);

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    /// <summary>
    /// 设置PostgreSQL的search_path（同步）
    /// </summary>
    private void SetSearchPath(DbConnection connection)
    {
        var schemaName = _schemaResolver.GetSchemaName();
        var sql = $"SET search_path TO \"{schemaName}\", public;";

        _logger.LogDebug(
            "设置租户Schema - TenantId: {TenantId}, Schema: {SchemaName}",
            _currentTenant.Id,
            schemaName);

        using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.ExecuteNonQuery();
    }
}

