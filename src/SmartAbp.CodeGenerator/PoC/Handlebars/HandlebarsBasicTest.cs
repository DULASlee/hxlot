using System;
using System.Diagnostics;
using HandlebarsDotNet;

namespace SmartAbp.CodeGenerator.PoC.Handlebars;

/// <summary>
/// Handlebars.Net基础功能验证测试
/// Phase 1.5 - Day 1: 验证Handlebars.Net核心功能
/// </summary>
public class HandlebarsBasicTest
{
    /// <summary>
    /// 测试1: 基础模板编译和变量替换
    /// </summary>
    public static void Test1_BasicTemplateCompilation()
    {
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("测试1: 基础模板编译和变量替换");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // 定义模板
        var templateSource = @"
Hello {{Name}}!
Your email is: {{Email}}
Your age is: {{Age}}
";

        // 编译模板
        var template = HandlebarsDotNet.Handlebars.Compile(templateSource);

        // 准备数据
        var data = new
        {
            Name = "张三",
            Email = "zhangsan@example.com",
            Age = 25
        };

        // 执行生成
        var result = template(data);

        Console.WriteLine("✅ 生成结果:");
        Console.WriteLine(result);
        Console.WriteLine();
    }

    /// <summary>
    /// 测试2: 循环遍历（each helper）
    /// </summary>
    public static void Test2_EachHelper()
    {
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("测试2: 循环遍历（each helper）");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        var templateSource = @"
Users:
{{#each Users}}
  - Name: {{Name}}, Age: {{Age}}
{{/each}}
";

        var template = HandlebarsDotNet.Handlebars.Compile(templateSource);

        var data = new
        {
            Users = new[]
            {
                new { Name = "张三", Age = 25 },
                new { Name = "李四", Age = 30 },
                new { Name = "王五", Age = 28 }
            }
        };

        var result = template(data);
        Console.WriteLine("✅ 生成结果:");
        Console.WriteLine(result);
        Console.WriteLine();
    }

    /// <summary>
    /// 测试3: 条件判断（if/else helper）
    /// </summary>
    public static void Test3_IfElseHelper()
    {
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("测试3: 条件判断（if/else helper）");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        var templateSource = @"
User: {{Name}}
{{#if IsAdmin}}
  Role: Administrator
{{else}}
  Role: Normal User
{{/if}}
";

        var template = HandlebarsDotNet.Handlebars.Compile(templateSource);

        var adminData = new { Name = "Admin User", IsAdmin = true };
        var normalData = new { Name = "Normal User", IsAdmin = false };

        Console.WriteLine("✅ 管理员用户:");
        Console.WriteLine(template(adminData));

        Console.WriteLine("✅ 普通用户:");
        Console.WriteLine(template(normalData));
        Console.WriteLine();
    }

    /// <summary>
    /// 测试4: 自定义Helper函数
    /// </summary>
    public static void Test4_CustomHelper()
    {
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("测试4: 自定义Helper函数");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // 注册自定义Helper：转换为大写
        HandlebarsDotNet.Handlebars.RegisterHelper("uppercase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] != null)
            {
                writer.WriteSafeString(parameters[0].ToString()!.ToUpper());
            }
        });

        // 注册自定义Helper：Pascal命名转换
        HandlebarsDotNet.Handlebars.RegisterHelper("pascalCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] != null)
            {
                var value = parameters[0].ToString()!;
                if (!string.IsNullOrEmpty(value))
                {
                    var result = char.ToUpper(value[0]) + value.Substring(1);
                    writer.WriteSafeString(result);
                }
            }
        });

        var templateSource = @"
Original: {{Name}}
Uppercase: {{uppercase Name}}
PascalCase: {{pascalCase propertyName}}
";

        var template = HandlebarsDotNet.Handlebars.Compile(templateSource);

        var data = new
        {
            Name = "EntityDto",
            propertyName = "userName"
        };

        var result = template(data);
        Console.WriteLine("✅ 生成结果:");
        Console.WriteLine(result);
        Console.WriteLine();
    }

    /// <summary>
    /// 测试5: 性能基准测试（vs 字符串拼接）
    /// </summary>
    public static void Test5_PerformanceBenchmark()
    {
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("测试5: 性能基准测试");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        var templateSource = @"
public class {{ClassName}}Dto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
";

        var template = HandlebarsDotNet.Handlebars.Compile(templateSource);

        var data = new { ClassName = "User" };

        // Handlebars性能测试
        var sw1 = Stopwatch.StartNew();
        for (int i = 0; i < 10000; i++)
        {
            var _ = template(data);
        }
        sw1.Stop();

        // 字符串拼接性能测试
        var sw2 = Stopwatch.StartNew();
        for (int i = 0; i < 10000; i++)
        {
            var _ = $@"
public class {data.ClassName}Dto
{{
    public Guid Id {{ get; set; }}
    public string Name {{ get; set; }}
    public DateTime CreatedAt {{ get; set; }}
}}
";
        }
        sw2.Stop();

        Console.WriteLine($"✅ Handlebars: {sw1.ElapsedMilliseconds}ms");
        Console.WriteLine($"✅ 字符串拼接: {sw2.ElapsedMilliseconds}ms");
        Console.WriteLine($"✅ 性能比: {(double)sw2.ElapsedMilliseconds / sw1.ElapsedMilliseconds:F2}x");
        Console.WriteLine();
    }

    /// <summary>
    /// 执行所有测试
    /// </summary>
    public static void RunAllTests()
    {
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("🚀 Handlebars.Net基础功能验证测试");
        Console.WriteLine("Phase 1.5 - Day 1");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine();

        Test1_BasicTemplateCompilation();
        Test2_EachHelper();
        Test3_IfElseHelper();
        Test4_CustomHelper();
        Test5_PerformanceBenchmark();

        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("✅ 所有测试完成！");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
}

