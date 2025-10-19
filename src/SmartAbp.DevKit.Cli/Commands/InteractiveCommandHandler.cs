using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core;
using SmartAbp.DevKit.Core.Types;
using Spectre.Console;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// 交互式命令处理器
/// 提供友好的命令行交互体验
/// </summary>
public class InteractiveCommandHandler : ICommandHandler
{
    private readonly ILogger<InteractiveCommandHandler> _logger;
    private readonly DevKitCommandService _commandService;

    public InteractiveCommandHandler(
        ILogger<InteractiveCommandHandler> _logger,
        DevKitCommandService commandService)
    {
        this._logger = _logger;
        _commandService = commandService;
    }

    /// <summary>
    /// 执行交互式生成
    /// </summary>
    public async Task<int> ExecuteAsync()
    {
        try
        {
            // 显示欢迎信息
            ShowWelcome();

            // 选择生成模式
            var mode = SelectGenerationMode();

            if (mode == "single")
            {
                await GenerateSingleEntityAsync();
            }
            else if (mode == "batch")
            {
                await GenerateBatchEntitiesAsync();
            }
            else
            {
                AnsiConsole.MarkupLine("[red]无效的选择[/]");
                return 1;
            }

            AnsiConsole.MarkupLine("\n[green]✨ 生成完成！[/]");
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "交互式生成失败");
            AnsiConsole.MarkupLine($"\n[red]❌ 错误: {ex.Message}[/]");
            return 1;
        }
    }

    /// <summary>
    /// 显示欢迎信息
    /// </summary>
    private void ShowWelcome()
    {
        var panel = new Panel(
            new FigletText("DevKit CLI")
                .Centered()
                .Color(Color.Blue))
        {
            Border = BoxBorder.Rounded,
            BorderStyle = new Style(Color.Blue)
        };

        AnsiConsole.Write(panel);
        AnsiConsole.MarkupLine("\n[bold]SmartAbp DevKit - 企业级代码生成工具[/]");
        AnsiConsole.MarkupLine("[dim]交互式模式启动...[/]\n");
    }

    /// <summary>
    /// 选择生成模式
    /// </summary>
    private string SelectGenerationMode()
    {
        return AnsiConsole.Prompt(
            new SelectionPrompt<string>()
                .Title("[yellow]请选择生成模式:[/]")
                .PageSize(10)
                .AddChoices("single", "batch", "exit")
                .UseConverter(choice => choice switch
                {
                    "single" => "📄 单实体生成",
                    "batch" => "📦 批量生成",
                    "exit" => "🚪 退出",
                    _ => choice
                }));
    }

    /// <summary>
    /// 生成单个实体
    /// </summary>
    private async Task GenerateSingleEntityAsync()
    {
        AnsiConsole.MarkupLine("\n[bold cyan]━━━ 单实体生成向导 ━━━[/]\n");

        // 提示输入实体信息
        var entityName = AnsiConsole.Ask<string>("[green]实体名称[/] (例如: Product):");
        var displayName = AnsiConsole.Ask<string>("[green]显示名称[/] (例如: 产品):");

        // 提示输入属性
        var properties = new List<PropertySchema>();
        var continueAdding = true;

        AnsiConsole.MarkupLine("\n[yellow]添加属性[/] (至少1个)\n");

        while (continueAdding)
        {
            var propName = AnsiConsole.Ask<string>($"[cyan]属性名称[/] (第{properties.Count + 1}个):");
            var propDisplayName = AnsiConsole.Ask<string>("[cyan]显示名称[/]:");

            var propType = AnsiConsole.Prompt(
                new SelectionPrompt<string>()
                    .Title("[cyan]数据类型:[/]")
                    .AddChoices("string", "int", "long", "decimal", "bool", "DateTime", "Guid"));

            var isRequired = AnsiConsole.Confirm("[cyan]是否必填?[/]", true);

            properties.Add(new PropertySchema
            {
                Id = Guid.NewGuid(),
                Name = propName,
                DisplayName = propDisplayName,
                Type = propType,
                IsRequired = isRequired
            });

            AnsiConsole.MarkupLine($"[dim]✓ 添加属性: {propName} ({propType})[/]");

            continueAdding = AnsiConsole.Confirm("\n[yellow]继续添加属性?[/]", false);
        }

        // 确认并生成
        var table = new Table();
        table.Border(TableBorder.Rounded);
        table.AddColumn("[bold]属性[/]");
        table.AddColumn("[bold]值[/]");
        table.AddRow("实体名称", entityName);
        table.AddRow("显示名称", displayName);
        table.AddRow("属性数量", properties.Count.ToString());

        AnsiConsole.Write(new Panel(table)
        {
            Header = new PanelHeader("[bold yellow]确认生成[/]"),
            Border = BoxBorder.Rounded
        });

        if (!AnsiConsole.Confirm("\n[green]确认生成代码?[/]", true))
        {
            AnsiConsole.MarkupLine("[yellow]已取消[/]");
            return;
        }

        // 执行生成
        await AnsiConsole.Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green bold"))
            .StartAsync("[green]正在生成代码...[/]", async ctx =>
            {
                var result = await _commandService.GenerateEntityAsync(
                    entityName,
                    displayName,
                    properties);

                if (result.Success)
                {
                    ctx.Status("[green]✓ 生成成功![/]");
                }
                else
                {
                    ctx.Status("[red]✗ 生成失败![/]");
                    foreach (var error in result.Errors)
                    {
                        AnsiConsole.MarkupLine($"[red]  - {error}[/]");
                    }
                }
            });

        // 显示结果
        var outputPath = "./output";
        var outputFile = Path.Combine(outputPath, $"{entityName}_Generated.cs");

        if (File.Exists(outputFile))
        {
            var fileInfo = new FileInfo(outputFile);
            AnsiConsole.MarkupLine($"\n[green]✓[/] 文件生成: [link]{outputFile}[/]");
            AnsiConsole.MarkupLine($"[dim]  文件大小: {fileInfo.Length} bytes[/]");
        }
    }

    /// <summary>
    /// 批量生成实体
    /// </summary>
    private async Task GenerateBatchEntitiesAsync()
    {
        AnsiConsole.MarkupLine("\n[bold cyan]━━━ 批量生成向导 ━━━[/]\n");

        var inputFile = AnsiConsole.Ask<string>(
            "[green]输入文件路径[/] (JSON格式):",
            "test-batch-entities.json");

        if (!File.Exists(inputFile))
        {
            AnsiConsole.MarkupLine($"[red]文件不存在: {inputFile}[/]");
            return;
        }

        var outputDir = AnsiConsole.Ask<string>(
            "[green]输出目录[/]:",
            "./output-batch");

        // 读取并解析JSON（不区分大小写）
        var jsonContent = await File.ReadAllTextAsync(inputFile);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var entities = JsonSerializer.Deserialize<List<EntityWrapper>>(jsonContent, options);

        if (entities == null || entities.Count == 0)
        {
            AnsiConsole.MarkupLine("[red]文件内容无效或为空[/]");
            return;
        }

        // 显示实体列表
        var table = new Table();
        table.Border(TableBorder.Rounded);
        table.AddColumn("[bold]#[/]");
        table.AddColumn("[bold]实体名称[/]");
        table.AddColumn("[bold]显示名称[/]");
        table.AddColumn("[bold]属性数量[/]");

        for (int i = 0; i < entities.Count; i++)
        {
            table.AddRow(
                (i + 1).ToString(),
                entities[i].EntitySchema.Name,
                entities[i].EntitySchema.DisplayName ?? "-",
                entities[i].EntitySchema.Properties.Count.ToString());
        }

        AnsiConsole.Write(new Panel(table)
        {
            Header = new PanelHeader($"[bold yellow]发现 {entities.Count} 个实体[/]"),
            Border = BoxBorder.Rounded
        });

        if (!AnsiConsole.Confirm("\n[green]确认批量生成?[/]", true))
        {
            AnsiConsole.MarkupLine("[yellow]已取消[/]");
            return;
        }

        // 批量生成
        await AnsiConsole.Progress()
            .Columns(
                new TaskDescriptionColumn(),
                new ProgressBarColumn(),
                new PercentageColumn(),
                new RemainingTimeColumn(),
                new SpinnerColumn())
            .StartAsync(async ctx =>
            {
                var task = ctx.AddTask("[green]批量生成中...[/]", maxValue: entities.Count);

                foreach (var wrapper in entities)
                {
                    var entity = wrapper.EntitySchema;
                    task.Description = $"[green]正在生成: {entity.Name}[/]";

                    var result = await _commandService.GenerateEntityAsync(
                        entity.Name,
                        entity.DisplayName ?? entity.Name,
                        entity.Properties);

                    if (result.Success)
                    {
                        AnsiConsole.MarkupLine($"[green]✓[/] {entity.Name} 生成成功");
                    }
                    else
                    {
                        AnsiConsole.MarkupLine($"[red]✗[/] {entity.Name} 生成失败");
                    }

                    task.Increment(1);
                }
            });

        AnsiConsole.MarkupLine($"\n[green]✓[/] 批量生成完成，输出目录: [link]{outputDir}[/]");
    }

    // 辅助类
    private class EntityWrapper
    {
        public EntitySchema EntitySchema { get; set; } = null!;
    }
}

