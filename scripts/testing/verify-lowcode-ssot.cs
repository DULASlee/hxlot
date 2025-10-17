using System;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartAbp.EntityFrameworkCore;
using SmartAbp.Domain.Entities.LowCode;

// 验证低代码 SSOT 后端落地情况

var connectionString = "Server=(localdb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true";

var optionsBuilder = new DbContextOptionsBuilder<SmartAbpDbContext>();
optionsBuilder.UseSqlServer(connectionString);

using var dbContext = new SmartAbpDbContext(optionsBuilder.Options);

Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("🔍 验证低代码 SSOT 后端落地情况");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 1. 验证表是否存在
Console.WriteLine("【1/4】验证 LC_表结构");
var tableNames = new[] { "LC_Modules", "LC_Entities", "LC_Properties", "LC_PageConfigs" };
foreach (var tableName in tableNames)
{
    try
    {
        var sql = $"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{tableName}'";
        var count = dbContext.Database.SqlQueryRaw<int>(sql).FirstOrDefault();
        Console.WriteLine($"  ✅ {tableName}: {(count > 0 ? "已创建" : "未创建")}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ❌ {tableName}: 检查失败 - {ex.Message}");
    }
}

// 2. 验证 EF 配置（JSON 值转换器）
Console.WriteLine("\n【2/4】验证 EF Core JSON 值转换器");
try
{
    var entityType = dbContext.Model.FindEntityType(typeof(LowCodeProperty));
    var uiConfigProp = entityType?.FindProperty(nameof(LowCodeProperty.UIConfig));
    var validationProp = entityType?.FindProperty(nameof(LowCodeProperty.ValidationRules));

    Console.WriteLine($"  ✅ UIConfig 值转换器: {(uiConfigProp?.GetValueConverter() != null ? "已配置" : "未配置")}");
    Console.WriteLine($"  ✅ ValidationRules 值转换器: {(validationProp?.GetValueConverter() != null ? "已配置" : "未配置")}");
    Console.WriteLine($"  ✅ ValidationRules ValueComparer: {(validationProp?.GetValueComparer() != null ? "已配置" : "未配置")}");
}
catch (Exception ex)
{
    Console.WriteLine($"  ❌ EF 配置检查失败: {ex.Message}");
}

// 3. 测试 ValidationRules 序列化/反序列化
Console.WriteLine("\n【3/4】测试 ValidationRules 序列化/反序列化");
try
{
    var testRules = new List<ValidationRule>
    {
        new ValidationRule { Type = "required", Message = "必填", Value = "true" },
        new ValidationRule { Type = "min", Message = "最小值", Value = "10" }
    };

    var json = JsonSerializer.Serialize(testRules, new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    });
    var deserialized = JsonSerializer.Deserialize<List<ValidationRule>>(json, new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    });

    Console.WriteLine($"  ✅ 序列化: {json}");
    Console.WriteLine($"  ✅ 反序列化: {deserialized?.Count ?? 0} 条规则");
    Console.WriteLine($"  ✅ 数据一致性: {(deserialized?.Count == testRules.Count ? "通过" : "失败")}");
}
catch (Exception ex)
{
    Console.WriteLine($"  ❌ 序列化测试失败: {ex.Message}");
}

// 4. 查询现有低代码数据
Console.WriteLine("\n【4/4】查询现有低代码配置数据");
try
{
    var moduleCount = dbContext.Set<LowCodeModule>().Count();
    var entityCount = dbContext.Set<LowCodeEntity>().Count();
    var propertyCount = dbContext.Set<LowCodeProperty>().Count();
    var pageConfigCount = dbContext.Set<LowCodePageConfig>().Count();

    Console.WriteLine($"  📊 LC_Modules: {moduleCount} 条");
    Console.WriteLine($"  📊 LC_Entities: {entityCount} 条");
    Console.WriteLine($"  📊 LC_Properties: {propertyCount} 条");
    Console.WriteLine($"  📊 LC_PageConfigs: {pageConfigCount} 条");
}
catch (Exception ex)
{
    Console.WriteLine($"  ❌ 数据查询失败: {ex.Message}");
}

Console.WriteLine("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("✅ SSOT 后端验证完成");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

