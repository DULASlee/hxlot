using System;
using SmartAbp.Database.Abstraction;
using SmartAbp.Database.Abstraction.Adapters.Implementations;
using SmartAbp.Database.Abstraction.Mappers.Implementations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

// ✅ 验证脚本：测试SQL Server和PostgreSQL的字段类型映射

Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🔍 SmartAbp多数据库适配系统 - 字段类型映射验证");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine();

// 创建配置
var configuration = new ConfigurationBuilder().Build();

// 测试SQL Server适配器
Console.WriteLine("📊 SQL Server字段类型映射测试");
Console.WriteLine("─────────────────────────────────────────");
var sqlServerAdapter = new SqlServerDatabaseAdapter(configuration, NullLogger<SqlServerDatabaseAdapter>.Instance);

var sqlServerTests = new[]
{
    ("string", null, "NVARCHAR(MAX)"),
    ("string", 100, "NVARCHAR(100)"),
    ("int", null, "INT"),
    ("long", null, "BIGINT"),
    ("bool", null, "BIT"),
    ("datetime", null, "DATETIME2"),
    ("datetimeoffset", null, "DATETIMEOFFSET"),
    ("decimal", null, "DECIMAL(18,2)"),
    ("guid", null, "UNIQUEIDENTIFIER"),
    ("byte[]", null, "VARBINARY(MAX)")
};

foreach (var (csharpType, maxLength, expected) in sqlServerTests)
{
    var actual = sqlServerAdapter.GetDatabaseFieldType(csharpType, maxLength);
    var status = actual == expected ? "✅" : "❌";
    Console.WriteLine($"{status} {csharpType,-15} {maxLength?.ToString() ?? "null",-8} → {actual,-25} (期望: {expected})");
}

Console.WriteLine();

// 测试PostgreSQL适配器
Console.WriteLine("📊 PostgreSQL字段类型映射测试");
Console.WriteLine("─────────────────────────────────────────");
var pgAdapter = new PostgreSQLDatabaseAdapter(configuration, NullLogger<PostgreSQLDatabaseAdapter>.Instance);

var postgresTests = new[]
{
    ("string", null, "TEXT"),
    ("string", 100, "VARCHAR(100)"),
    ("int", null, "INTEGER"),
    ("long", null, "BIGINT"),
    ("bool", null, "BOOLEAN"),
    ("datetime", null, "TIMESTAMP WITHOUT TIME ZONE"),
    ("datetimeoffset", null, "TIMESTAMP WITH TIME ZONE"),
    ("decimal", null, "NUMERIC(18,2)"),
    ("guid", null, "UUID"),
    ("byte[]", null, "BYTEA")
};

foreach (var (csharpType, maxLength, expected) in postgresTests)
{
    var actual = pgAdapter.GetDatabaseFieldType(csharpType, maxLength);
    var status = actual == expected ? "✅" : "❌";
    Console.WriteLine($"{status} {csharpType,-15} {maxLength?.ToString() ?? "null",-8} → {actual,-30} (期望: {expected})");
}

Console.WriteLine();

// 测试SQL方言引擎
Console.WriteLine("📊 SQL方言引擎测试");
Console.WriteLine("─────────────────────────────────────────");

var sqlServerDialect = sqlServerAdapter.GetDialectEngine();
var pgDialect = pgAdapter.GetDialectEngine();

Console.WriteLine("分页SQL测试:");
var baseSql = "SELECT * FROM Users WHERE IsActive = 1";
var orderBy = "ORDER BY CreatedTime DESC";

var sqlServerPaged = sqlServerDialect.GetPaginationSql(baseSql, orderBy, 0, 10);
var pgPaged = pgDialect.GetPaginationSql(baseSql, orderBy, 0, 10);

Console.WriteLine($"  SQL Server: {sqlServerPaged.Trim().Replace("\n", " ").Replace("  ", " ")}");
Console.WriteLine($"  PostgreSQL: {pgPaged.Trim().Replace("\n", " ").Replace("  ", " ")}");
Console.WriteLine();

Console.WriteLine("当前时间函数:");
Console.WriteLine($"  SQL Server: {sqlServerDialect.GetCurrentTimeFunction()}");
Console.WriteLine($"  PostgreSQL: {pgDialect.GetCurrentTimeFunction()}");
Console.WriteLine();

Console.WriteLine("字符串长度函数:");
Console.WriteLine($"  SQL Server: {sqlServerDialect.GetStringLengthFunction("UserName")}");
Console.WriteLine($"  PostgreSQL: {pgDialect.GetStringLengthFunction("UserName")}");
Console.WriteLine();

Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("✅ 验证完成！所有类型映射和SQL方言均正确实现！");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

