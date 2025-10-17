using System;
using SmartAbp.CodeGenerator.PoC.Handlebars;

namespace SmartAbp.CodeGenerator.PoC;

/// <summary>
/// Phase 1.5 PoC测试运行器
/// 用于快速验证Handlebars.Net和ts-morph的核心功能
/// </summary>
public class PoCTestRunner
{
    public static void Main(string[] args)
    {
        Console.Clear();
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("🚀 SmartAbp Phase 1.5 PoC测试运行器");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine();

        if (args.Length == 0)
        {
            ShowMenu();
        }
        else
        {
            switch (args[0].ToLower())
            {
                case "handlebars":
                case "hbs":
                case "1":
                    RunHandlebarsTests();
                    break;
                default:
                    Console.WriteLine($"❌ 未知命令: {args[0]}");
                    ShowMenu();
                    break;
            }
        }
    }

    private static void ShowMenu()
    {
        Console.WriteLine("请选择要运行的测试:");
        Console.WriteLine("  1. handlebars - Handlebars.Net基础功能测试");
        Console.WriteLine("  2. ts-morph   - ts-morph基础功能测试（即将推出）");
        Console.WriteLine();
        Console.WriteLine("使用方法:");
        Console.WriteLine("  dotnet run --project src/SmartAbp.CodeGenerator handlebars");
    }

    private static void RunHandlebarsTests()
    {
        try
        {
            HandlebarsBasicTest.RunAllTests();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ 测试失败: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }
}

