using System.Diagnostics;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 分层代码生成器基类（模板方法模式）
///
/// 架构原则：
/// ✅ 模板方法模式：定义生成流程骨架，具体步骤由子类实现
/// ✅ 单一职责原则：基类负责流程控制，子类负责具体生成逻辑
/// ✅ 依赖倒置原则：依赖抽象接口（IMetadataProvider），而非具体实现
/// </summary>
public abstract class LayerGeneratorBase : ILayerGenerator
{
    protected readonly UnifiedMetadataSDK MetadataSDK;
    protected readonly ILogger Logger;

    protected LayerGeneratorBase(
        UnifiedMetadataSDK metadataSDK,
        ILogger logger)
    {
        MetadataSDK = metadataSDK ?? throw new ArgumentNullException(nameof(metadataSDK));
        Logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 生成器名称（子类必须实现）
    /// </summary>
    public abstract string Name { get; }

    /// <summary>
    /// 目标层级（子类必须实现）
    /// </summary>
    public abstract TargetLayer Layer { get; }

    /// <summary>
    /// 生成器优先级（可选重写，默认为100）
    /// </summary>
    public virtual int Priority => 100;

    /// <summary>
    /// 生成代码（模板方法 - 定义执行流程）
    /// </summary>
    public async Task<LayerGenerationResult> GenerateAsync(GenerationInput input)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new LayerGenerationResult();

        try
        {
            Logger.LogInformation("🔨 [{Name}] 开始生成...", Name);

            // 1. 获取元数据
            var entityMetadata = await MetadataSDK.GetEntityAsync(input.EntityId);
            if (entityMetadata == null)
            {
                result.Success = false;
                result.Errors.Add($"实体元数据未找到: EntityId={input.EntityId}");
                return result;
            }

            // 2. 执行具体生成逻辑（由子类实现）
            await GenerateCoreAsync(input, entityMetadata, result);

            // 3. 设置成功标志
            result.Success = result.Errors.Count == 0;

            stopwatch.Stop();
            result.ElapsedMilliseconds = stopwatch.ElapsedMilliseconds;

            if (result.Success)
            {
                Logger.LogInformation("✅ [{Name}] 生成完成: {FileCount} 个文件, 耗时 {Elapsed}ms",
                    Name, result.GeneratedFiles.Count, result.ElapsedMilliseconds);
            }
            else
            {
                Logger.LogWarning("⚠️ [{Name}] 生成失败: {Errors}",
                    Name, string.Join(", ", result.Errors));
            }

            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            result.ElapsedMilliseconds = stopwatch.ElapsedMilliseconds;
            result.Success = false;
            result.Errors.Add($"生成异常: {ex.Message}");

            Logger.LogError(ex, "❌ [{Name}] 生成异常: {Error}", Name, ex.Message);

            return result;
        }
    }

    /// <summary>
    /// 验证输入参数（默认实现，子类可重写）
    /// </summary>
    public virtual Task<SmartAbp.DevKit.Abstractions.Generation.ValidationResult> ValidateAsync(GenerationInput input)
    {
        if (input == null)
            return Task.FromResult(SmartAbp.DevKit.Abstractions.Generation.ValidationResult.Failure("输入参数不能为空"));

        if (input.EntityId == Guid.Empty)
            return Task.FromResult(SmartAbp.DevKit.Abstractions.Generation.ValidationResult.Failure("EntityId不能为空"));

        return Task.FromResult(SmartAbp.DevKit.Abstractions.Generation.ValidationResult.Success());
    }

    /// <summary>
    /// 核心生成逻辑（子类必须实现）
    /// </summary>
    /// <param name="input">生成输入参数</param>
    /// <param name="entityMetadata">实体元数据</param>
    /// <param name="result">生成结果（由子类填充）</param>
    protected abstract Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result);
}

