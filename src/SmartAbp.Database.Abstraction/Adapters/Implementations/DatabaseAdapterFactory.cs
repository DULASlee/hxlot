using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartAbp.Database.Abstraction.Dialects.Implementations;
using SmartAbp.Database.Abstraction.Mappers.Implementations;

namespace SmartAbp.Database.Abstraction.Adapters.Implementations
{
    /// <summary>
    /// 数据库适配器工厂实现
    /// ABP平台底层增强：提供数据库适配器创建服务
    /// </summary>
    public class DatabaseAdapterFactory : IDatabaseAdapterFactory
    {
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DatabaseAdapterFactory> _logger;

        public DatabaseAdapterFactory(
            IConfiguration configuration,
            IServiceProvider serviceProvider,
            ILogger<DatabaseAdapterFactory> logger)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public IDatabaseAdapter GetCurrentAdapter()
        {
            var databaseType = GetCurrentDatabaseType();
            return GetAdapter(databaseType);
        }

        public IDatabaseAdapter GetAdapter(DatabaseType databaseType)
        {
            _logger.LogInformation("创建数据库适配器: {DatabaseType}", databaseType);

            return databaseType switch
            {
                DatabaseType.SqlServer => CreateSqlServerAdapter(),
                DatabaseType.PostgreSQL => CreatePostgreSqlAdapter(),
                DatabaseType.SQLite => CreateSqliteAdapter(),
                DatabaseType.MySQL => CreateMySqlAdapter(),
                _ => throw new NotSupportedException($"不支持的数据库类型: {databaseType}")
            };
        }

        public DatabaseType GetCurrentDatabaseType()
        {
            var dbType = _configuration["Database:Type"] ?? "SqlServer";
            
            return dbType.ToLowerInvariant() switch
            {
                "sqlite" => DatabaseType.SQLite,
                "postgresql" or "postgres" => DatabaseType.PostgreSQL,
                "mysql" => DatabaseType.MySQL,
                _ => DatabaseType.SqlServer
            };
        }

        private IDatabaseAdapter CreateSqlServerAdapter()
        {
            var logger = _serviceProvider.GetRequiredService<ILogger<SqlServerDatabaseAdapter>>();
            return new SqlServerDatabaseAdapter(_configuration, logger);
        }

        private IDatabaseAdapter CreatePostgreSqlAdapter()
        {
            // ✅ PostgreSQL适配器已完全实现（2025-10-23）
            var logger = _serviceProvider.GetRequiredService<ILogger<PostgreSQLDatabaseAdapter>>();
            return new PostgreSQLDatabaseAdapter(_configuration, logger);
        }

        private IDatabaseAdapter CreateSqliteAdapter()
        {
            // TODO: 完善SQLite适配器实现
            throw new NotSupportedException("SQLite适配器尚未完全实现，请使用SQL Server");
        }

        private IDatabaseAdapter CreateMySqlAdapter()
        {
            // TODO: 完善MySQL适配器实现
            throw new NotSupportedException("MySQL适配器尚未完全实现，请使用SQL Server");
        }
    }
}