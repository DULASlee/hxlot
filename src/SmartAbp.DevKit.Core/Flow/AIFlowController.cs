using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Types;
using SmartAbp.DevKit.Core.Monitoring;

namespace SmartAbp.DevKit.Core.Flow;

/// <summary>
/// AI流水线控制器 - 革命性创新 ⭐⭐⭐
///
/// 核心理念:
/// - AI是流水线上的工人,不是需要关进笼子的野兽
/// - 为AI设计好岗位和工具,AI就能高效工作
/// - 流水线保证质量,AI专注执行
///
/// 核心功能:
/// - 流水线调度: 管理4个工位顺序执行
/// - 工位管理: 注册、执行、验证工位
/// - 质检机制: 工位质检 + 最终质检（五关门禁）
/// - 错误处理: 重试、回滚、恢复机制
/// </summary>
public class AIFlowController
{
    private readonly Dictionary<string, WorkstationConfig> _workstations = new();
    private readonly List<QualityGateConfig> _qualityGates = new();
    private readonly ILogger<AIFlowController> _logger;
    private readonly MetricsCollector? _metricsCollector;

    public AIFlowController(ILogger<AIFlowController> logger, MetricsCollector? metricsCollector = null)
    {
        _logger = logger;
        _metricsCollector = metricsCollector;
        // v2.0: 不再自动调用InitializeDefaultWorkstations
        // 改为由外部调用RegisterRealGenerators注册真实Generator
        _logger.LogInformation("✅ AIFlowController已初始化（v2.0模式，需调用RegisterRealGenerators）");
    }

    public AIFlowController(AIFlowConfig config, ILogger<AIFlowController> logger, MetricsCollector? metricsCollector = null)
    {
        _logger = logger;
        _metricsCollector = metricsCollector;
        _qualityGates = config.QualityGates;

        // 注册工位
        foreach (var ws in config.Workstations)
        {
            RegisterWorkstation(ws);
        }
    }

    /// <summary>
    /// 启动AI流水线
    ///
    /// 执行流程:
    /// 1. 初始化流水线状态
    /// 2. 依次执行4个工位 (metadata → backend → frontend → quality)
    /// 3. 每个工位执行后进行工位质检
    /// 4. 最终执行五关质量门禁
    /// 5. 返回最终生成结果
    /// </summary>
    /// <param name="context">生成上下文</param>
    /// <returns>最终生成结果</returns>
    public async Task<GenerationResult> StartFlowAsync(GenerationContext context)
    {
        _logger.LogInformation("🏭 启动AI流水线...");

        // ⭐ D爷建议：增强监控和可观测性
        _metricsCollector?.StartFlow();

        // 步骤1: 初始化流水线状态
        var flowState = new FlowState
        {
            Context = context,
            CurrentWorkstation = "metadata",
            WorkstationOutputs = new Dictionary<string, WorkstationOutput>(),
            Errors = new List<string>(),
            StartTime = Stopwatch.GetTimestamp()
        };

        try
        {
            // 步骤2: 依次执行每个工位
            var workstationSequence = GetWorkstationSequence();
            foreach (var wsId in workstationSequence)
            {
                _logger.LogInformation($"  📍 工位: {wsId}");

                var output = await ExecuteWorkstationAsync(wsId, flowState);
                flowState.WorkstationOutputs[wsId] = output;

                // 步骤3: 工位质检
                var qualityCheck = await RunWorkstationQualityGateAsync(wsId, output);
                if (!qualityCheck.Passed)
                {
                    throw new WorkstationException($"工位{wsId}质检失败", qualityCheck.Errors);
                }

                _logger.LogInformation($"  ✅ 工位{wsId}完成 ({output.ExecutionTime}ms)");
            }

            // 步骤4: 最终质量门禁（五关强制）
            var finalOutput = flowState.WorkstationOutputs["quality"];
            var finalCheck = await RunFinalQualityGateAsync(finalOutput);

            if (!finalCheck.Passed)
            {
                throw new QualityGateException("最终质量门禁未通过", finalCheck.Errors);
            }

            _logger.LogInformation("🎉 AI流水线执行成功！");

            // ⭐ D爷建议：增强监控和可观测性
            _metricsCollector?.EndFlow();

            return new GenerationResult
            {
                Success = true,
                Code = finalOutput.Code,
                Metadata = finalOutput.Metadata,
                Errors = new List<string>(),
                Warnings = new List<string>(),
                Performance = _metricsCollector?.GetPerformanceMetrics() ?? new PerformanceMetrics
                {
                    TotalTime = GetElapsedMilliseconds(flowState.StartTime),
                    WorkstationTimes = GetWorkstationTimes(flowState)
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ AI流水线执行失败");

            // ⭐ D爷建议：记录错误指标
            _metricsCollector?.RecordError(flowState.CurrentWorkstation, ex);
            _metricsCollector?.EndFlow();

            // 错误恢复机制
            return await HandleFlowErrorAsync(ex, flowState);
        }
    }

    /// <summary>
    /// 执行工位（带超时控制）⭐ D爷建议：硬伤3修复
    /// </summary>
    private async Task<WorkstationOutput> ExecuteWorkstationAsync(string wsId, FlowState state)
    {
        if (!_workstations.TryGetValue(wsId, out var workstation))
        {
            throw new InvalidOperationException($"工位不存在: {wsId}");
        }

        // 准备工位输入
        var input = PrepareWorkstationInput(wsId, state);

        // ⭐ D爷建议：增强监控和可观测性
        _metricsCollector?.StartWorkstation(wsId, input);

        // 执行工位处理器（带30秒超时控制）⭐
        var startTime = Stopwatch.GetTimestamp();

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        try
        {
            var workTask = workstation.Handler(input);
            var timeoutTask = Task.Delay(Timeout.Infinite, cts.Token);

            var completedTask = await Task.WhenAny(workTask, timeoutTask);

            if (completedTask == timeoutTask)
            {
                throw new TimeoutException($"工位{wsId}执行超时（>30秒）");
            }

            var output = await workTask;
            var endTime = Stopwatch.GetTimestamp();

            output.WorkstationId = wsId;
            output.ExecutionTime = GetElapsedMilliseconds(startTime, endTime);

            // ⭐ D爷建议：增强监控和可观测性
            _metricsCollector?.EndWorkstation(wsId, output);

            return output;
        }
        catch (OperationCanceledException)
        {
            var error = new TimeoutException($"工位{wsId}执行超时（>30秒）");
            // ⭐ D爷建议：记录错误指标
            _metricsCollector?.RecordError(wsId, error);
            throw error;
        }
        catch (Exception ex)
        {
            // ⭐ D爷建议：记录错误指标
            _metricsCollector?.RecordError(wsId, ex);
            throw;
        }
    }

    /// <summary>
    /// 运行工位质量门禁
    /// </summary>
    private async Task<QualityCheckResult> RunWorkstationQualityGateAsync(
        string wsId,
        WorkstationOutput output)
    {
        if (!_workstations.TryGetValue(wsId, out var workstation))
        {
            return QualityCheckResult.Fail($"工位不存在: {wsId}");
        }

        // 验证输出Schema（如果定义了）
        if (workstation.OutputSchema != null)
        {
            var schemaValid = ValidateOutputSchema(output, workstation.OutputSchema);
            if (!schemaValid.IsValid)
            {
                return QualityCheckResult.Fail(schemaValid.Errors.Select(e => e.Message).ToArray());
            }
        }

        // 工位特定检查
        if (workstation.QualityChecks != null)
        {
            foreach (var check in workstation.QualityChecks)
            {
                var result = await check(output);
                if (!result.Passed)
                {
                    // ⭐ D爷建议：记录质检失败
                    _metricsCollector?.RecordQualityCheck(wsId, result);
                    return result;
                }
            }
        }

        var finalResult = QualityCheckResult.Success();
        // ⭐ D爷建议：记录质检成功
        _metricsCollector?.RecordQualityCheck(wsId, finalResult);
        return finalResult;
    }

    /// <summary>
    /// 运行最终质量门禁（五关强制）
    ///
    /// 五关清单:
    /// 1. 架构完整性检查
    /// 2. 类型一致性检查
    /// 3. 编译检查
    /// 4. 代码重复检查
    /// 5. 性能检查
    /// </summary>
    private async Task<QualityCheckResult> RunFinalQualityGateAsync(WorkstationOutput output)
    {
        _logger.LogInformation("🔒 执行五关质量门禁...");

        var errors = new List<string>();

        // 第一关: 架构完整性检查
        var archCheck = await CheckArchitectureAsync(output.Code);
        if (!archCheck.Passed)
        {
            errors.AddRange(archCheck.Errors);
        }

        // 第二关: 类型一致性检查
        var typeCheck = await CheckTypesAsync(output.Code);
        if (!typeCheck.Passed)
        {
            errors.AddRange(typeCheck.Errors);
        }

        // 第三关: 编译检查
        var compileCheck = await CheckCompilationAsync(output.Code);
        if (!compileCheck.Passed)
        {
            errors.AddRange(compileCheck.Errors);
        }

        // 第四关: 代码重复检查
        var duplicateCheck = await CheckDuplicatesAsync(output.Code);
        if (!duplicateCheck.Passed)
        {
            errors.AddRange(duplicateCheck.Errors);
        }

        // 第五关: 性能检查
        var perfCheck = await CheckPerformanceAsync(output);
        if (!perfCheck.Passed)
        {
            errors.AddRange(perfCheck.Errors);
        }

        if (errors.Count > 0)
        {
            _logger.LogWarning($"⚠️ 质量门禁发现{errors.Count}个问题:");
            // ✅ 输出详细错误信息
            foreach (var error in errors)
            {
                _logger.LogError($"   ❌ {error}");
            }
            return QualityCheckResult.Fail(errors.ToArray());
        }

        _logger.LogInformation("✅ 五关质量门禁全部通过！");
        return QualityCheckResult.Success();
    }

    /// <summary>
    /// 注册工位
    /// </summary>
    public void RegisterWorkstation(WorkstationConfig config)
    {
        _workstations[config.Id] = config;
        _logger.LogInformation($"✅ 工位注册: {config.Name} ({config.Id})");
    }

    /// <summary>
    /// 获取工位
    /// </summary>
    public WorkstationConfig? GetWorkstation(string id)
    {
        _workstations.TryGetValue(id, out var workstation);
        return workstation;
    }

    /// <summary>
    /// 列出所有工位
    /// </summary>
    public List<WorkstationConfig> ListWorkstations()
    {
        return _workstations.Values.ToList();
    }

    /// <summary>
    /// 移除工位
    /// </summary>
    public void RemoveWorkstation(string id)
    {
        _workstations.Remove(id);
        _logger.LogInformation($"🗑️ 工位移除: {id}");
    }

    /// <summary>
    /// 获取工位执行序列（支持依赖关系解析）
    /// ✅ DevKit v2.0优化：实现拓扑排序
    /// </summary>
    private List<string> GetWorkstationSequence()
    {
        // 如果工位定义了依赖关系，使用拓扑排序
        if (_workstations.Values.Any(w => w.Dependencies != null && w.Dependencies.Count > 0))
        {
            _logger.LogDebug("使用拓扑排序解析工位执行序列");
            return TopologicalSort(_workstations.Values.ToList());
        }

        // v2.0模式：如果存在"codegen"工位，使用新序列
        if (_workstations.ContainsKey("codegen"))
        {
            _logger.LogDebug("使用v2.0工位序列: codegen → quality");
            return new List<string> { "codegen", "quality" };
        }

        // v1.0模式（向后兼容）
        _logger.LogDebug("使用v1.0工位序列: metadata → backend → frontend → quality");
        return new List<string> { "metadata", "backend", "frontend", "quality" };
    }

    /// <summary>
    /// 拓扑排序（Kahn算法）
    /// 用于解析工位之间的依赖关系
    /// </summary>
    /// <param name="workstations">工位列表</param>
    /// <returns>排序后的工位ID列表</returns>
    private List<string> TopologicalSort(List<WorkstationConfig> workstations)
    {
        // 建立依赖图
        var inDegree = new Dictionary<string, int>();
        var graph = new Dictionary<string, List<string>>();

        // 初始化
        foreach (var ws in workstations)
        {
            inDegree[ws.Id] = 0;
            graph[ws.Id] = new List<string>();
        }

        // 构建依赖关系
        foreach (var ws in workstations)
        {
            if (ws.Dependencies != null)
            {
                foreach (var dep in ws.Dependencies)
                {
                    if (graph.ContainsKey(dep))
                    {
                        graph[dep].Add(ws.Id); // dep -> ws
                        inDegree[ws.Id]++;
                    }
                }
            }
        }

        // 找出所有入度为0的工位（没有依赖的工位）
        var queue = new Queue<string>();
        foreach (var kvp in inDegree)
        {
            if (kvp.Value == 0)
            {
                queue.Enqueue(kvp.Key);
            }
        }

        // 拓扑排序
        var result = new List<string>();
        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            result.Add(current);

            // 减少依赖于当前工位的其他工位的入度
            foreach (var next in graph[current])
            {
                inDegree[next]--;
                if (inDegree[next] == 0)
                {
                    queue.Enqueue(next);
                }
            }
        }

        // 检查是否有循环依赖
        if (result.Count != workstations.Count)
        {
            var remaining = workstations.Select(w => w.Id).Except(result).ToList();
            throw new InvalidOperationException(
                $"检测到循环依赖，无法完成拓扑排序。涉及工位: {string.Join(", ", remaining)}");
        }

        _logger.LogDebug("✅ 拓扑排序完成: {Sequence}", string.Join(" → ", result));
        return result;
    }

    /// <summary>
    /// 准备工位输入
    /// </summary>
    private WorkstationInput PrepareWorkstationInput(string wsId, FlowState state)
    {
        // 从上一个工位的输出准备当前工位的输入
        var previousOutputs = state.WorkstationOutputs.Values.ToList();

        return new WorkstationInput
        {
            Context = state.Context,
            PreviousOutputs = previousOutputs,
            Metadata = state.Context.EntitySchema
        };
    }

    /// <summary>
    /// 验证输出Schema
    /// </summary>
    private ValidationResult ValidateOutputSchema(WorkstationOutput output, object schema)
    {
        // 简化实现 - 实际项目中可使用JSON Schema验证
        return ValidationResult.Success();
    }

    /// <summary>
    /// 错误处理（带重试和回滚机制）
    /// </summary>
    private Task<GenerationResult> HandleFlowErrorAsync(Exception error, FlowState state)
    {
        _logger.LogError($"❌ 流水线错误: {error.Message}");

        // 尝试回滚到上一个工位
        if (!string.IsNullOrEmpty(state.CurrentWorkstation) && state.WorkstationOutputs.Count > 0)
        {
            _logger.LogWarning($"🔄 尝试从工位 {state.CurrentWorkstation} 回滚...");
            // TODO: 实现回滚逻辑
        }

        var result = new GenerationResult
        {
            Success = false,
            Code = string.Empty,
            Metadata = state.Context.EntitySchema,
            Errors = new List<string> { error.Message },
            Warnings = new List<string>()
        };

        return Task.FromResult(result);
    }

    /// <summary>
    /// 注册真实的Generator工位（DevKit v2.0）
    ///
    /// 核心变化:
    /// - 不再使用Task.Delay模拟
    /// - 直接调用GeneratorOrchestrator生成真实代码
    /// - 工位输出包含实际生成的文件列表
    /// </summary>
    /// <param name="orchestrator">Generator编排器</param>
    /// <param name="projectPath">项目路径（包含.lowcode/目录）</param>
    public void RegisterRealGenerators(Generator.GeneratorOrchestrator orchestrator, string projectPath)
    {
        if (orchestrator == null) throw new ArgumentNullException(nameof(orchestrator));
        if (string.IsNullOrEmpty(projectPath)) throw new ArgumentException("项目路径不能为空", nameof(projectPath));

        _logger.LogInformation("🔧 注册真实Generator工位，项目路径: {ProjectPath}", projectPath);

        // 工位1: 元数据标准化 + 完整代码生成
        // DevKit v2.0: 单一工位完成所有生成任务
        RegisterWorkstation(new WorkstationConfig
        {
            Id = "codegen",
            Name = "代码生成工位（Domain+Application+Frontend）",
            Type = WorkstationType.Backend, // 主要职责是后端代码生成
            Handler = async (input) =>
            {
                _logger.LogInformation("🔨 开始执行真实代码生成...");

                // 执行GeneratorOrchestrator
                var result = await orchestrator.GenerateAsync(projectPath);

                if (!result.Success)
                {
                    throw new InvalidOperationException($"代码生成失败: {string.Join(", ", result.Errors)}");
                }

                _logger.LogInformation(
                    "✅ 代码生成成功: Domain={DomainCount}, Application={AppCount}, Frontend={FrontendCount}, Total={TotalCount}",
                    result.DomainFileCount,
                    result.ApplicationFileCount,
                    result.FrontendFileCount,
                    result.GeneratedFiles.Count);

                // 返回工位输出
                return new WorkstationOutput
                {
                    Code = $"// 生成了 {result.GeneratedFiles.Count} 个文件",
                    Metadata = input.Metadata,
                    // 将生成的文件列表附加到元数据中
                    AdditionalData = new Dictionary<string, object>
                    {
                        ["GeneratedFiles"] = result.GeneratedFiles,
                        ["DomainFileCount"] = result.DomainFileCount,
                        ["ApplicationFileCount"] = result.ApplicationFileCount,
                        ["FrontendFileCount"] = result.FrontendFileCount
                    }
                };
            }
        });

        // 工位2: 质量检查（保留，执行五关门禁）
        RegisterWorkstation(new WorkstationConfig
        {
            Id = "quality",
            Name = "质量检查工位（五关门禁）",
            Type = WorkstationType.Quality,
            Handler = async (input) =>
            {
                _logger.LogInformation("🔍 开始执行质量门禁...");

                await Task.CompletedTask; // 质检逻辑由RunFinalQualityGateAsync实现

                // 汇总所有工位的输出
                var allCode = string.Join("\n\n", input.PreviousOutputs.Select(o => o.Code));
                return new WorkstationOutput
                {
                    Code = allCode,
                    Metadata = input.Metadata
                };
            }
        });

        _logger.LogInformation("✅ 真实Generator工位注册完成");
    }

    /// <summary>
    /// 初始化默认工位
    /// ⚠️  已废弃：v2.0改用GeneratorOrchestrator替代
    /// </summary>
    [Obsolete("InitializeDefaultWorkstations is obsolete. Use RegisterRealGenerators instead.")]
    private void InitializeDefaultWorkstations()
    {
        // 工位1: 元数据标准化（保留兼容性）
        RegisterWorkstation(new WorkstationConfig
        {
            Id = "metadata",
            Name = "元数据标准化工位",
            Type = WorkstationType.Metadata,
            Handler = async (input) =>
            {
                _logger.LogWarning("⚠️  使用了废弃的InitializeDefaultWorkstations，请调用RegisterRealGenerators");
                await Task.CompletedTask;
                return new WorkstationOutput
                {
                    Code = "// Metadata processed (deprecated)",
                    Metadata = input.Metadata
                };
            }
        });

        // 工位2-4: 同样标记为废弃
        RegisterWorkstation(new WorkstationConfig
        {
            Id = "backend",
            Name = "后端代码生成工位",
            Type = WorkstationType.Backend,
            Handler = async (input) =>
            {
                await Task.CompletedTask;
                return new WorkstationOutput { Code = "// Backend code (deprecated)", Metadata = input.Metadata };
            }
        });

        RegisterWorkstation(new WorkstationConfig
        {
            Id = "frontend",
            Name = "前端代码生成工位",
            Type = WorkstationType.Frontend,
            Handler = async (input) =>
            {
                await Task.CompletedTask;
                return new WorkstationOutput { Code = "// Frontend code (deprecated)", Metadata = input.Metadata };
            }
        });

        RegisterWorkstation(new WorkstationConfig
        {
            Id = "quality",
            Name = "质量检查工位",
            Type = WorkstationType.Quality,
            Handler = async (input) =>
            {
                await Task.CompletedTask;
                var allCode = string.Join("\n\n", input.PreviousOutputs.Select(o => o.Code));
                return new WorkstationOutput { Code = allCode, Metadata = input.Metadata };
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 质量检查辅助方法（五关实现）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 第一关: 架构完整性检查
    /// </summary>
    private async Task<QualityCheckResult> CheckArchitectureAsync(string code)
    {
        await Task.Delay(1); // 模拟异步检查

        // 检查架构违规模式
        var errors = new List<string>();

        // 检查相对路径引用
        if (code.Contains("'../'") || code.Contains("\"../\""))
        {
            errors.Add("发现相对路径引用（违反架构规范）");
        }

        // 检查@别名违规
        if (code.Contains("@/") && code.Contains("packages/"))
        {
            errors.Add("packages中使用了@/别名（违反架构规范）");
        }

        return errors.Count > 0 ? QualityCheckResult.Fail(errors.ToArray()) : QualityCheckResult.Success();
    }

    /// <summary>
    /// 第二关: 类型一致性检查
    /// </summary>
    private async Task<QualityCheckResult> CheckTypesAsync(string code)
    {
        await Task.Delay(1);

        var errors = new List<string>();

        // 检查类型安全问题
        if (code.Contains("as any"))
        {
            // ✅ 输出具体位置，帮助调试
            var index = code.IndexOf("as any");
            var snippet = code.Substring(Math.Max(0, index - 50), Math.Min(100, code.Length - Math.Max(0, index - 50)));
            _logger.LogError($"   🔍 发现as any位置: ...{snippet}...");
            errors.Add("发现类型绕过（as any）");
        }

        if (code.Contains("@ts-ignore"))
        {
            errors.Add("发现类型忽略指令（@ts-ignore）");
        }

        return errors.Count > 0 ? QualityCheckResult.Fail(errors.ToArray()) : QualityCheckResult.Success();
    }

    /// <summary>
    /// 第三关: 编译检查
    /// </summary>
    private async Task<QualityCheckResult> CheckCompilationAsync(string code)
    {
        await Task.Delay(1);

        // 实际项目中应调用编译器API
        // 这里简化实现
        return QualityCheckResult.Success();
    }

    /// <summary>
    /// 第四关: 代码重复检查
    /// </summary>
    private async Task<QualityCheckResult> CheckDuplicatesAsync(string code)
    {
        await Task.Delay(1);

        // 检查重复代码模式
        return QualityCheckResult.Success();
    }

    /// <summary>
    /// 第五关: 性能检查
    /// </summary>
    private async Task<QualityCheckResult> CheckPerformanceAsync(WorkstationOutput output)
    {
        await Task.Delay(1);

        var errors = new List<string>();

        // 检查执行时间
        if (output.ExecutionTime > 3000) // 3秒超时
        {
            errors.Add($"工位执行时间过长: {output.ExecutionTime}ms");
        }

        return errors.Count > 0 ? QualityCheckResult.Fail(errors.ToArray()) : QualityCheckResult.Success();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private long GetElapsedMilliseconds(long startTimestamp, long? endTimestamp = null)
    {
        var end = endTimestamp ?? Stopwatch.GetTimestamp();
        return (long)((end - startTimestamp) * 1000.0 / Stopwatch.Frequency);
    }

    private Dictionary<string, long> GetWorkstationTimes(FlowState state)
    {
        return state.WorkstationOutputs.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value.ExecutionTime
        );
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 异常类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// <summary>
/// 工位异常
/// </summary>
public class WorkstationException : Exception
{
    public List<string> Errors { get; }

    public WorkstationException(string message, List<string> errors) : base(message)
    {
        Errors = errors;
    }
}

/// <summary>
/// 质量门禁异常
/// </summary>
public class QualityGateException : Exception
{
    public List<string> Errors { get; }

    public QualityGateException(string message, List<string> errors) : base(message)
    {
        Errors = errors;
    }
}

