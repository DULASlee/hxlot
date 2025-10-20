using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Services;

namespace SmartAbp.PermissionManagement.Infrastructure.MultiTenancy;

/// <summary>
/// 租户Schema管理服务
/// 负责创建、删除和管理租户的PostgreSQL Schema
/// </summary>
public class TenantSchemaManager : DomainService, ITenantSchemaManager
{
    private readonly ITenantSchemaResolver _schemaResolver;
    private readonly ILogger<TenantSchemaManager> _logger;

    public TenantSchemaManager(
        ITenantSchemaResolver schemaResolver,
        ILogger<TenantSchemaManager> logger)
    {
        _schemaResolver = schemaResolver;
        _logger = logger;
    }

    /// <summary>
    /// 为新租户创建独立的Schema
    /// </summary>
    /// <param name="tenantId">租户ID</param>
    /// <param name="connectionString">数据库连接字符串</param>
    public async Task CreateSchemaAsync(Guid tenantId, string connectionString)
    {
        var schemaName = _schemaResolver.GetSchemaName(tenantId);

        if (!_schemaResolver.IsValidSchemaName(schemaName))
        {
            throw new InvalidOperationException($"无效的Schema名称: {schemaName}");
        }

        _logger.LogInformation("开始创建租户Schema - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);

        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            // 1. 创建Schema
            await using (var command = new NpgsqlCommand($@"
                CREATE SCHEMA IF NOT EXISTS ""{schemaName}"";
            ", connection))
            {
                await command.ExecuteNonQueryAsync();
                _logger.LogDebug("Schema创建成功: {SchemaName}", schemaName);
            }

            // 2. 授予权限（假设有应用角色app_user）
            await using (var command = new NpgsqlCommand($@"
                GRANT USAGE ON SCHEMA ""{schemaName}"" TO postgres;
                GRANT CREATE ON SCHEMA ""{schemaName}"" TO postgres;
            ", connection))
            {
                await command.ExecuteNonQueryAsync();
                _logger.LogDebug("Schema权限授予成功: {SchemaName}", schemaName);
            }

            _logger.LogInformation("租户Schema创建完成 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "创建租户Schema失败 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
            throw;
        }
    }

    /// <summary>
    /// 删除租户的Schema（谨慎操作！）
    /// </summary>
    /// <param name="tenantId">租户ID</param>
    /// <param name="connectionString">数据库连接字符串</param>
    public async Task DeleteSchemaAsync(Guid tenantId, string connectionString)
    {
        var schemaName = _schemaResolver.GetSchemaName(tenantId);

        _logger.LogWarning("开始删除租户Schema - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);

        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            // 删除Schema及其所有对象（CASCADE）
            await using var command = new NpgsqlCommand($@"
                DROP SCHEMA IF EXISTS ""{schemaName}"" CASCADE;
            ", connection);

            await command.ExecuteNonQueryAsync();

            _logger.LogInformation("租户Schema删除完成 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "删除租户Schema失败 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
            throw;
        }
    }

    /// <summary>
    /// 为租户Schema应用数据库迁移
    /// 将所有表结构复制到租户Schema
    /// </summary>
    /// <param name="tenantId">租户ID</param>
    /// <param name="dbContext">数据库上下文</param>
    public async Task ApplyMigrationsAsync(Guid tenantId, DbContext dbContext)
    {
        var schemaName = _schemaResolver.GetSchemaName(tenantId);

        _logger.LogInformation("开始为租户Schema应用迁移 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);

        try
        {
            // 使用EF Core Migrations
            // 注意：需要在执行前临时设置当前租户上下文
            await dbContext.Database.MigrateAsync();

            _logger.LogInformation("租户Schema迁移完成 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "租户Schema迁移失败 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
            throw;
        }
    }

    /// <summary>
    /// 检查Schema是否存在
    /// </summary>
    public async Task<bool> SchemaExistsAsync(Guid tenantId, string connectionString)
    {
        var schemaName = _schemaResolver.GetSchemaName(tenantId);

        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            await using var command = new NpgsqlCommand($@"
                SELECT EXISTS(
                    SELECT 1 
                    FROM information_schema.schemata 
                    WHERE schema_name = '{schemaName}'
                );
            ", connection);

            var result = await command.ExecuteScalarAsync();
            return result != null && (bool)result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "检查Schema是否存在失败 - TenantId: {TenantId}, Schema: {SchemaName}", tenantId, schemaName);
            throw;
        }
    }
}

/// <summary>
/// 租户Schema管理服务接口
/// </summary>
public interface ITenantSchemaManager
{
    /// <summary>
    /// 创建租户Schema
    /// </summary>
    Task CreateSchemaAsync(Guid tenantId, string connectionString);

    /// <summary>
    /// 删除租户Schema
    /// </summary>
    Task DeleteSchemaAsync(Guid tenantId, string connectionString);

    /// <summary>
    /// 应用数据库迁移到租户Schema
    /// </summary>
    Task ApplyMigrationsAsync(Guid tenantId, DbContext dbContext);

    /// <summary>
    /// 检查Schema是否存在
    /// </summary>
    Task<bool> SchemaExistsAsync(Guid tenantId, string connectionString);
}

