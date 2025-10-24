using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using SmartAbp.Database.Abstraction.Dialects;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Database.Abstraction.Adapters
{
    /// <summary>
    /// 数据库适配器接口
    /// 定义了与特定数据库交互的通用契约，实现业务实体与数据库类型的解耦。
    /// </summary>
    public interface IDatabaseAdapter : ITransientDependency
    {
        /// <summary>
        /// 获取当前适配器支持的数据库类型
        /// </summary>
        DatabaseType DatabaseType { get; }

        /// <summary>
        /// 数据库名称
        /// </summary>
        string DatabaseName { get; }

        /// <summary>
        /// 是否支持当前环境
        /// </summary>
        bool IsSupported();

        /// <summary>
        /// 获取连接字符串模板
        /// </summary>
        string GetConnectionStringTemplate();

        /// <summary>
        /// 验证连接字符串有效性
        /// </summary>
        Task<bool> ValidateConnectionStringAsync(string connectionString);

        /// <summary>
        /// 获取数据库版本信息
        /// </summary>
        Task<string> GetDatabaseVersionAsync(string connectionString);

        /// <summary>
        /// 测试数据库连接
        /// </summary>
        Task<bool> TestConnectionAsync(string connectionString);

        /// <summary>
        /// 创建数据库（如果不存在）
        /// </summary>
        Task<bool> CreateDatabaseIfNotExistsAsync(string connectionString);

        /// <summary>
        /// 获取数据库大小信息
        /// </summary>
        Task<long> GetDatabaseSizeAsync(string connectionString);

        /// <summary>
        /// 获取数据库连接字符串
        /// </summary>
        /// <returns>连接字符串</returns>
        string GetConnectionString();

        /// <summary>
        /// 获取数据库特定的字段类型映射
        /// 例如：C# Guid -> SQL Server uniqueidentifier, PostgreSQL uuid
        /// </summary>
        /// <param name="csharpType">C# 类型名称 (如 "Guid", "string", "int")</param>
        /// <param name="maxLength">字段最大长度 (可选)</param>
        /// <returns>数据库字段类型字符串 (如 "UNIQUEIDENTIFIER", "VARCHAR(255)")</returns>
        string GetDatabaseFieldType(string csharpType, int? maxLength = null);

        /// <summary>
        /// 获取数据库特定的SQL方言引擎
        /// </summary>
        IDialectEngine GetDialectEngine();

        /// <summary>
        /// 执行一个SQL查询并返回结果集
        /// </summary>
        /// <param name="sql">SQL查询语句</param>
        /// <param name="parameters">SQL参数</param>
        /// <returns>DataTable</returns>
        Task<DataTable> ExecuteQueryAsync(string sql, Dictionary<string, object>? parameters = null);

        /// <summary>
        /// 执行一个非查询SQL命令（插入、更新、删除）
        /// </summary>
        /// <param name="sql">SQL命令语句</param>
        /// <param name="parameters">SQL参数</param>
        /// <returns>受影响的行数</returns>
        Task<int> ExecuteNonQueryAsync(string sql, Dictionary<string, object>? parameters = null);

        /// <summary>
        /// 执行一个SQL命令并返回单个标量值
        /// </summary>
        /// <param name="sql">SQL命令语句</param>
        /// <param name="parameters">SQL参数</param>
        /// <returns>标量值</returns>
        Task<object?> ExecuteScalarAsync(string sql, Dictionary<string, object>? parameters = null);

        /// <summary>
        /// 获取数据库特定的分页SQL语句
        /// </summary>
        /// <param name="baseQuery">原始查询语句</param>
        /// <param name="orderBy">排序语句</param>
        /// <param name="skip">跳过记录数</param>
        /// <param name="take">获取记录数</param>
        /// <returns>分页SQL语句</returns>
        string GetPagedSql(string baseQuery, string orderBy, int skip, int take);

        /// <summary>
        /// 获取数据库特定的插入SQL语句
        /// </summary>
        /// <param name="tableName">表名</param>
        /// <param name="columns">列名列表</param>
        /// <param name="values">值参数列表</param>
        /// <returns>插入SQL语句</returns>
        string GetInsertSql(string tableName, IEnumerable<string> columns, IEnumerable<string> values);

        /// <summary>
        /// 获取数据库特定的更新SQL语句
        /// </summary>
        /// <param name="tableName">表名</param>
        /// <param name="setClauses">SET子句列表 (e.g., "Column1 = @Param1")</param>
        /// <param name="whereClause">WHERE子句</param>
        /// <returns>更新SQL语句</returns>
        string GetUpdateSql(string tableName, IEnumerable<string> setClauses, string whereClause);

        /// <summary>
        /// 获取数据库特定的删除SQL语句
        /// </summary>
        /// <param name="tableName">表名</param>
        /// <param name="whereClause">WHERE子句</param>
        /// <returns>删除SQL语句</returns>
        string GetDeleteSql(string tableName, string whereClause);

        /// <summary>
        /// 获取数据库特定的表是否存在检查SQL
        /// </summary>
        /// <param name="tableName">表名</param>
        /// <returns>检查SQL语句</returns>
        string GetTableExistsSql(string tableName);

        /// <summary>
        /// 获取数据库特定的列是否存在检查SQL
        /// </summary>
        /// <param name="tableName">表名</param>
        /// <param name="columnName">列名</param>
        /// <returns>检查SQL语句</returns>
        string GetColumnExistsSql(string tableName, string columnName);
    }
}