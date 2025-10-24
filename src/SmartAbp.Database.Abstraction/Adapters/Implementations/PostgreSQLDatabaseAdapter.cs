using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using SmartAbp.Database.Abstraction.Dialects;
using SmartAbp.Database.Abstraction.Dialects.Implementations;
using SmartAbp.Database.Abstraction.Mappers;
using SmartAbp.Database.Abstraction.Mappers.Implementations;

namespace SmartAbp.Database.Abstraction.Adapters.Implementations
{
    /// <summary>
    /// PostgreSQL数据库适配器实现
    /// 🔥 关键：处理PostgreSQL特定的类型映射（bytea, uuid, timestamp等）
    /// </summary>
    public class PostgreSQLDatabaseAdapter : IDatabaseAdapter
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PostgreSQLDatabaseAdapter> _logger;
        private readonly PostgreSQLDialectEngine _dialectEngine;
        private readonly PostgreSQLFieldTypeMapper _fieldTypeMapper;

        public DatabaseType DatabaseType => DatabaseType.PostgreSQL;
        public string DatabaseName => "PostgreSQL";

        public PostgreSQLDatabaseAdapter(
            IConfiguration configuration,
            ILogger<PostgreSQLDatabaseAdapter> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _dialectEngine = new PostgreSQLDialectEngine();
            _fieldTypeMapper = new PostgreSQLFieldTypeMapper();
        }

        public bool IsSupported()
        {
            // PostgreSQL跨平台支持
            return true;
        }

        public string GetConnectionStringTemplate()
        {
            return "Host=localhost;Port=5432;Database=YourDatabase;Username=YourUser;Password=YourPassword;";
        }

        public async Task<bool> ValidateConnectionStringAsync(string connectionString)
        {
            try
            {
                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "验证PostgreSQL连接字符串失败");
                return false;
            }
        }

        public async Task<string> GetDatabaseVersionAsync(string connectionString)
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            await using var command = new NpgsqlCommand("SELECT version()", connection);
            return (string)await command.ExecuteScalarAsync();
        }

        public async Task<bool> TestConnectionAsync(string connectionString)
        {
            return await ValidateConnectionStringAsync(connectionString);
        }

        public async Task<bool> CreateDatabaseIfNotExistsAsync(string connectionString)
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            var databaseName = builder.Database;
            builder.Database = "postgres"; // 连接到postgres数据库来创建新数据库

            try
            {
                await using var connection = new NpgsqlConnection(builder.ToString());
                await connection.OpenAsync();

                await using var command = new NpgsqlCommand(
                    $"SELECT 1 FROM pg_database WHERE datname = '{databaseName}'", connection);
                var result = await command.ExecuteScalarAsync();

                if (result == null)
                {
                    _logger.LogInformation("数据库 '{DatabaseName}' 不存在，正在创建...", databaseName);
                    await using var createCommand = new NpgsqlCommand(
                        $"CREATE DATABASE \"{databaseName}\"", connection);
                    await createCommand.ExecuteNonQueryAsync();
                    _logger.LogInformation("数据库 '{DatabaseName}' 创建成功。", databaseName);
                    return true;
                }
                _logger.LogInformation("数据库 '{DatabaseName}' 已存在。", databaseName);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "创建或检查PostgreSQL数据库 '{DatabaseName}' 失败。", databaseName);
                throw;
            }
        }

        public async Task<long> GetDatabaseSizeAsync(string connectionString)
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            await using var command = new NpgsqlCommand(
                "SELECT pg_database_size(current_database())", connection);
            var result = await command.ExecuteScalarAsync();
            return result != DBNull.Value ? Convert.ToInt64(result) / 1024 : 0; // 转换为KB
        }

        public string GetConnectionString()
        {
            // 优先从具名连接字符串获取
            var connectionString = _configuration.GetConnectionString("PostgreSQL") 
                                 ?? _configuration.GetConnectionString("Default");
            
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("未找到PostgreSQL数据库连接字符串");
            }
            
            return connectionString;
        }

        public string GetDatabaseFieldType(string csharpType, int? maxLength = null)
        {
            // 使用PostgreSQL字段类型映射器
            return _fieldTypeMapper.MapCSharpTypeToDatabase(csharpType, maxLength);
        }

        public IDialectEngine GetDialectEngine()
        {
            return _dialectEngine;
        }

        public async Task<DataTable> ExecuteQueryAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            await using var connection = new NpgsqlConnection(GetConnectionString());
            await connection.OpenAsync();
            
            await using var command = new NpgsqlCommand(sql, connection);
            
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                }
            }

            await using var reader = await command.ExecuteReaderAsync();
            var dataTable = new DataTable();
            dataTable.Load(reader);
            return dataTable;
        }

        public async Task<int> ExecuteNonQueryAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            await using var connection = new NpgsqlConnection(GetConnectionString());
            await connection.OpenAsync();
            
            await using var command = new NpgsqlCommand(sql, connection);
            
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                }
            }

            return await command.ExecuteNonQueryAsync();
        }

        public async Task<object?> ExecuteScalarAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            await using var connection = new NpgsqlConnection(GetConnectionString());
            await connection.OpenAsync();
            
            await using var command = new NpgsqlCommand(sql, connection);
            
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                }
            }

            return await command.ExecuteScalarAsync();
        }

        public string GetPagedSql(string baseQuery, string orderBy, int skip, int take)
        {
            return _dialectEngine.GetPaginationSql(baseQuery, orderBy, skip, take);
        }

        public string GetInsertSql(string tableName, IEnumerable<string> columns, IEnumerable<string> values)
        {
            var columnList = string.Join(", ", columns);
            var valueList = string.Join(", ", values);
            return $"INSERT INTO \"{tableName}\" ({columnList}) VALUES ({valueList}) RETURNING *";
        }

        public string GetUpdateSql(string tableName, IEnumerable<string> setClauses, string whereClause)
        {
            var setClause = string.Join(", ", setClauses);
            return $"UPDATE \"{tableName}\" SET {setClause} WHERE {whereClause} RETURNING *";
        }

        public string GetDeleteSql(string tableName, string whereClause)
        {
            return $"DELETE FROM \"{tableName}\" WHERE {whereClause}";
        }

        public string GetTableExistsSql(string tableName)
        {
            return $"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{tableName}')";
        }

        public string GetColumnExistsSql(string tableName, string columnName)
        {
            return $"SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '{tableName}' AND column_name = '{columnName}')";
        }
    }
}

