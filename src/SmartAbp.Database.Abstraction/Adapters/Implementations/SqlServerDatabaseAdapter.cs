using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartAbp.Database.Abstraction.Dialects;
using SmartAbp.Database.Abstraction.Dialects.Implementations;

namespace SmartAbp.Database.Abstraction.Adapters.Implementations
{
    /// <summary>
    /// SQL Server数据库适配器实现
    /// </summary>
    public class SqlServerDatabaseAdapter : IDatabaseAdapter
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SqlServerDatabaseAdapter> _logger;

        public DatabaseType DatabaseType => DatabaseType.SqlServer;
        public string DatabaseName => "SQL Server";

        public SqlServerDatabaseAdapter(
            IConfiguration configuration,
            ILogger<SqlServerDatabaseAdapter> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public bool IsSupported()
        {
            // SQL Server通常在Windows上完全支持，但在Linux/macOS上需要Docker或远程连接
            // 这里简化为总是支持，因为连接字符串会决定实际可用性
            return true;
        }

        public string GetConnectionStringTemplate()
        {
            return "Server=localhost;Database=YourDatabase;User Id=YourUser;Password=YourPassword;";
        }

        public async Task<bool> ValidateConnectionStringAsync(string connectionString)
        {
            try
            {
                await using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "验证SQL Server连接字符串失败");
                return false;
            }
        }

        public async Task<string> GetDatabaseVersionAsync(string connectionString)
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            await using var command = new SqlCommand("SELECT @@VERSION", connection);
            return (string)await command.ExecuteScalarAsync();
        }

        public async Task<bool> TestConnectionAsync(string connectionString)
        {
            return await ValidateConnectionStringAsync(connectionString);
        }

        public async Task<bool> CreateDatabaseIfNotExistsAsync(string connectionString)
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            var databaseName = builder.InitialCatalog;
            builder.InitialCatalog = "master"; // 连接到master数据库来创建新数据库

            try
            {
                await using var connection = new SqlConnection(builder.ToString());
                await connection.OpenAsync();

                await using var command = new SqlCommand($"SELECT database_id FROM sys.databases WHERE name = '{databaseName}'", connection);
                var result = await command.ExecuteScalarAsync();

                if (result == null)
                {
                    _logger.LogInformation("数据库 '{DatabaseName}' 不存在，正在创建...", databaseName);
                    await using var createCommand = new SqlCommand($"CREATE DATABASE [{databaseName}]", connection);
                    await createCommand.ExecuteNonQueryAsync();
                    _logger.LogInformation("数据库 '{DatabaseName}' 创建成功。", databaseName);
                    return true;
                }
                _logger.LogInformation("数据库 '{DatabaseName}' 已存在。", databaseName);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "创建或检查SQL Server数据库 '{DatabaseName}' 失败。", databaseName);
                throw;
            }
        }

        public async Task<long> GetDatabaseSizeAsync(string connectionString)
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            await using var command = new SqlCommand(
                "SELECT SUM(size) * 8 / 1024 FROM sys.master_files WHERE database_id = DB_ID() GROUP BY database_id",
                connection);
            var result = await command.ExecuteScalarAsync();
            return result != DBNull.Value ? Convert.ToInt64(result) : 0;
        }

        public string GetConnectionString()
        {
            // 优先从具名连接字符串获取
            var connectionString = _configuration.GetConnectionString("LocalDb") 
                                 ?? _configuration.GetConnectionString("Default");
            
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("未找到SQL Server数据库连接字符串");
            }
            
            return connectionString;
        }

        public string GetDatabaseFieldType(string csharpType, int? maxLength = null)
        {
            return csharpType.ToLowerInvariant() switch
            {
                "string" => maxLength.HasValue ? $"NVARCHAR({maxLength})" : "NVARCHAR(MAX)",
                "int" => "INT",
                "long" => "BIGINT",
                "short" => "SMALLINT",
                "byte" => "TINYINT",
                "bool" or "boolean" => "BIT",
                "datetime" => "DATETIME2",
                "datetimeoffset" => "DATETIMEOFFSET",
                "decimal" => "DECIMAL(18,2)",
                "double" => "FLOAT",
                "float" => "REAL",
                "guid" => "UNIQUEIDENTIFIER",
                "byte[]" => "VARBINARY(MAX)",
                "char" => "NCHAR(1)",
                _ => throw new NotSupportedException($"不支持的C#类型: {csharpType}")
            };
        }

        public IDialectEngine GetDialectEngine()
        {
            return new SqlServerDialectEngine();
        }

        public async Task<DataTable> ExecuteQueryAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            using var connection = new SqlConnection(GetConnectionString());
            using var command = new SqlCommand(sql, connection);

            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    command.Parameters.AddWithValue($"@{param.Key}", param.Value ?? DBNull.Value);
                }
            }

            await connection.OpenAsync();
            using var adapter = new SqlDataAdapter(command);
            var dataTable = new DataTable();
            adapter.Fill(dataTable);

            _logger.LogDebug("执行SQL查询成功，返回 {RowCount} 行数据", dataTable.Rows.Count);
            return dataTable;
        }

        public async Task<int> ExecuteNonQueryAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            using var connection = new SqlConnection(GetConnectionString());
            using var command = new SqlCommand(sql, connection);

            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    command.Parameters.AddWithValue($"@{param.Key}", param.Value ?? DBNull.Value);
                }
            }

            await connection.OpenAsync();
            var result = await command.ExecuteNonQueryAsync();

            _logger.LogDebug("执行SQL命令成功，影响 {AffectedRows} 行", result);
            return result;
        }

        public async Task<object?> ExecuteScalarAsync(string sql, Dictionary<string, object>? parameters = null)
        {
            using var connection = new SqlConnection(GetConnectionString());
            using var command = new SqlCommand(sql, connection);

            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    command.Parameters.AddWithValue($"@{param.Key}", param.Value ?? DBNull.Value);
                }
            }

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();

            _logger.LogDebug("执行SQL标量查询成功");
            return result;
        }

        public string GetPagedSql(string baseQuery, string orderBy, int skip, int take)
        {
            return $@"
                {baseQuery}
                {orderBy}
                OFFSET {skip} ROWS
                FETCH NEXT {take} ROWS ONLY";
        }

        public string GetInsertSql(string tableName, IEnumerable<string> columns, IEnumerable<string> values)
        {
            var columnList = string.Join(", ", columns);
            var valueList = string.Join(", ", values);
            return $"INSERT INTO [{tableName}] ({columnList}) VALUES ({valueList})";
        }

        public string GetUpdateSql(string tableName, IEnumerable<string> setClauses, string whereClause)
        {
            var setClause = string.Join(", ", setClauses);
            return $"UPDATE [{tableName}] SET {setClause} WHERE {whereClause}";
        }

        public string GetDeleteSql(string tableName, string whereClause)
        {
            return $"DELETE FROM [{tableName}] WHERE {whereClause}";
        }

        public string GetTableExistsSql(string tableName)
        {
            return $@"
                SELECT CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
                        WHERE TABLE_NAME = '{tableName}' AND TABLE_SCHEMA = 'dbo'
                    ) 
                    THEN 1 
                    ELSE 0 
                END";
        }

        public string GetColumnExistsSql(string tableName, string columnName)
        {
            return $@"
                SELECT CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = '{tableName}' 
                        AND COLUMN_NAME = '{columnName}' 
                        AND TABLE_SCHEMA = 'dbo'
                    ) 
                    THEN 1 
                    ELSE 0 
                END";
        }
    }
}
