using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Dto;
using SmartAbp.CodeGenerator.Core.Types;

namespace SmartAbp.CodeGenerator.Core.Validation;

/// <summary>
/// 增强的模型处理器
/// 修复自检发现的致命缺陷：集成完整类型映射和循环引用检测
/// 确保模型处理的完整性和安全性
/// </summary>
public class EnhancedModelProcessor
{
    private readonly ILogger<EnhancedModelProcessor> _logger;
    private readonly CompleteTypeMapper _typeMapper;
    private readonly SimpleCircularReferenceDetector _circularReferenceDetector;

    public EnhancedModelProcessor(
        ILogger<EnhancedModelProcessor> logger,
        CompleteTypeMapper typeMapper,
        SimpleCircularReferenceDetector circularReferenceDetector)
    {
        _logger = logger;
        _typeMapper = typeMapper;
        _circularReferenceDetector = circularReferenceDetector;
    }

    /// <summary>
    /// 处理模块元数据，进行完整性验证和安全检查
    /// </summary>
    /// <param name="metadata">模块元数据</param>
    /// <returns>处理结果</returns>
    public async Task<ModelProcessingResult> ProcessModuleMetadataAsync(ModuleMetadataDto metadata)
    {
        var result = new ModelProcessingResult
        {
            OriginalMetadata = metadata,
            ProcessedMetadata = CloneMetadata(metadata)
        };

        try
        {
            _logger.LogInformation("开始处理模块元数据: {ModuleName}, 实体数量: {EntityCount}", 
                metadata.Name, metadata.Entities?.Count ?? 0);

            // 1. 基础模块验证
            ValidateModuleBasics(result);

            // 2. 实体基础验证
            if (metadata.Entities != null && metadata.Entities.Any())
            {
                ValidateEntitiesBasics(result);

                // 3. 类型映射验证和修复
                await ProcessTypeMapping(result);

                // 4. 循环引用检测
                await ProcessCircularReferenceDetection(result);

                // 5. 业务规则验证
                await ProcessBusinessRuleValidation(result);

                // 6. 数据完整性验证
                await ProcessDataIntegrityValidation(result);
            }

            // 7. 生成处理摘要
            GenerateProcessingSummary(result);

            result.IsSuccess = result.ErrorCount == 0;

            _logger.LogInformation("模块元数据处理完成: {Status}, 错误 {Errors}, 警告 {Warnings}",
                result.IsSuccess ? "✅成功" : "❌失败", result.ErrorCount, result.WarningCount);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "处理模块元数据时发生异常: {ModuleName}", metadata.Name);
            result.IsSuccess = false;
            result.AddError($"处理过程异常: {ex.Message}");
            return result;
        }
    }

    /// <summary>
    /// 快速验证模块元数据（仅基础检查）
    /// </summary>
    /// <param name="metadata">模块元数据</param>
    /// <returns>快速验证结果</returns>
    public ModelQuickValidationResult QuickValidateModule(ModuleMetadataDto metadata)
    {
        var result = new ModelQuickValidationResult();

        try
        {
            // 快速基础检查
            if (string.IsNullOrWhiteSpace(metadata.Name))
            {
                result.Issues.Add("模块名称不能为空");
            }

            if (string.IsNullOrWhiteSpace(metadata.Namespace))
            {
                result.Issues.Add("模块命名空间不能为空");
            }

            if (metadata.Entities == null || !metadata.Entities.Any())
            {
                result.Issues.Add("模块必须包含至少一个实体");
            }
            else
            {
                // 快速实体检查
                foreach (var entity in metadata.Entities)
                {
                    if (string.IsNullOrWhiteSpace(entity.Name))
                    {
                        result.Issues.Add($"实体名称不能为空");
                    }

                    if (entity.Properties == null || !entity.Properties.Any())
                    {
                        result.Issues.Add($"实体 {entity.Name} 必须包含至少一个属性");
                    }
                }
            }

            result.IsValid = result.Issues.Count == 0;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "快速验证模块时发生异常: {ModuleName}", metadata.Name);
            result.IsValid = false;
            result.Issues.Add($"验证过程异常: {ex.Message}");
            return result;
        }
    }

    #region 私有处理方法

    /// <summary>
    /// 验证模块基础信息
    /// </summary>
    private void ValidateModuleBasics(ModelProcessingResult result)
    {
        var metadata = result.ProcessedMetadata;

        if (string.IsNullOrWhiteSpace(metadata.Name))
        {
            result.AddError("模块名称不能为空");
        }
        else if (!IsValidIdentifier(metadata.Name))
        {
            result.AddError($"模块名称 '{metadata.Name}' 不是有效的标识符");
        }

        if (string.IsNullOrWhiteSpace(metadata.Namespace))
        {
            result.AddWarning("模块命名空间为空，将使用默认命名空间 'SmartAbp'");
            metadata.Namespace = "SmartAbp";
        }
        else if (!IsValidNamespace(metadata.Namespace))
        {
            result.AddError($"模块命名空间 '{metadata.Namespace}' 格式无效");
        }

        if (metadata.Entities == null)
        {
            metadata.Entities = new List<EntityModelDto>();
            result.AddWarning("模块实体列表为null，已初始化为空列表");
        }

        if (!metadata.Entities.Any())
        {
            result.AddWarning("模块不包含任何实体，请确认这是预期的");
        }
    }

    /// <summary>
    /// 验证实体基础信息
    /// </summary>
    private void ValidateEntitiesBasics(ModelProcessingResult result)
    {
        var entities = result.ProcessedMetadata.Entities!;

        for (int i = 0; i < entities.Count; i++)
        {
            var entity = entities[i];

            if (string.IsNullOrWhiteSpace(entity.Name))
            {
                result.AddError($"实体[{i}]名称不能为空");
                continue;
            }

            if (!IsValidIdentifier(entity.Name))
            {
                result.AddError($"实体名称 '{entity.Name}' 不是有效的标识符");
            }

            // 检查实体名称重复
            var duplicateCount = entities.Count(e => e.Name == entity.Name);
            if (duplicateCount > 1)
            {
                result.AddError($"实体名称 '{entity.Name}' 重复出现");
            }

            // 验证属性
            if (entity.Properties == null)
            {
                entity.Properties = new List<PropertyModelDto>();
                result.AddWarning($"实体 '{entity.Name}' 的属性列表为null，已初始化为空列表");
            }

            if (!entity.Properties.Any())
            {
                result.AddWarning($"实体 '{entity.Name}' 不包含任何属性");
            }
        }
    }

    /// <summary>
    /// 处理类型映射
    /// </summary>
    private async Task ProcessTypeMapping(ModelProcessingResult result)
    {
        _logger.LogDebug("开始处理类型映射验证");

        foreach (var entity in result.ProcessedMetadata.Entities!)
        {
            if (entity.Properties == null) continue;

            var batchResult = _typeMapper.GetBatchTypeMapping(entity.Properties);

            foreach (var mapping in batchResult.PropertyMappings)
            {
                var property = entity.Properties.First(p => p.Name == mapping.Key);

                if (!mapping.Value.IsSuccess)
                {
                    result.AddError($"实体 '{entity.Name}' 属性 '{mapping.Key}' 类型映射失败: {mapping.Value.ErrorMessage}");
                }
                else if (mapping.Value.HasWarning)
                {
                    result.AddWarning($"实体 '{entity.Name}' 属性 '{mapping.Key}' 类型映射警告: {mapping.Value.WarningMessage}");
                }

                // 更新属性类型为标准C#类型
                property.Type = mapping.Value.TypeInfo.CSharpType;
            }

            result.TypeMappingResults[entity.Name] = batchResult;
        }

        _logger.LogDebug("类型映射处理完成");
    }

    /// <summary>
    /// 处理循环引用检测
    /// </summary>
    private async Task ProcessCircularReferenceDetection(ModelProcessingResult result)
    {
        _logger.LogDebug("开始循环引用检测");

        var detectionResult = _circularReferenceDetector.DetectCircularReferences(result.ProcessedMetadata.Entities!);
        result.CircularReferenceResult = detectionResult;

        if (detectionResult.HasError)
        {
            result.AddError($"循环引用检测失败: {detectionResult.ErrorMessage}");
        }
        else if (detectionResult.HasCircularReference)
        {
            result.AddError("检测到循环引用，必须解决后才能继续生成代码");
            
            foreach (var path in detectionResult.CircularReferencePaths)
            {
                result.AddError($"循环引用路径: {path.Description}");
            }

            // 添加解决建议
            foreach (var action in detectionResult.RecommendedActions)
            {
                result.AddInfo(action);
            }
        }
        else
        {
            result.AddInfo("✅ 未发现循环引用");
        }

        _logger.LogDebug("循环引用检测完成");
    }

    /// <summary>
    /// 处理业务规则验证
    /// </summary>
    private async Task ProcessBusinessRuleValidation(ModelProcessingResult result)
    {
        _logger.LogDebug("开始业务规则验证");

        foreach (var entity in result.ProcessedMetadata.Entities!)
        {
            if (entity.Properties == null) continue;

            // 检查主键定义
            var keyProperties = entity.Properties.Where(p => p.IsKey).ToList();
            if (keyProperties.Count == 0)
            {
                result.AddWarning($"实体 '{entity.Name}' 缺少主键定义，建议添加Id属性作为主键");
            }
            else if (keyProperties.Count > 1)
            {
                result.AddError($"实体 '{entity.Name}' 有多个主键属性，ABP框架不支持复合主键");
            }

            // 检查属性名称重复
            var duplicateProperties = entity.Properties
                .GroupBy(p => p.Name)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            foreach (var duplicateProp in duplicateProperties)
            {
                result.AddError($"实体 '{entity.Name}' 有重复的属性名称: '{duplicateProp}'");
            }

            // 检查必填属性的合理性
            foreach (var property in entity.Properties)
            {
                if (property.IsRequired && property.Type?.EndsWith("?") == true)
                {
                    result.AddWarning($"实体 '{entity.Name}' 属性 '{property.Name}' 标记为必填但类型为可空，请检查设计意图");
                }
            }
        }

        _logger.LogDebug("业务规则验证完成");
    }

    /// <summary>
    /// 处理数据完整性验证
    /// </summary>
    private async Task ProcessDataIntegrityValidation(ModelProcessingResult result)
    {
        _logger.LogDebug("开始数据完整性验证");

        foreach (var entity in result.ProcessedMetadata.Entities!)
        {
            if (entity.Properties == null) continue;

            foreach (var property in entity.Properties)
            {
                // 验证字符串长度设置
                if (property.Type == "string" && property.IsRequired)
                {
                    if (string.IsNullOrEmpty(property.MaxLength))
                    {
                        result.AddWarning($"实体 '{entity.Name}' 必填字符串属性 '{property.Name}' 未设置最大长度");
                    }
                    else if (int.TryParse(property.MaxLength, out var maxLen) && maxLen > 4000)
                    {
                        result.AddWarning($"实体 '{entity.Name}' 属性 '{property.Name}' 最大长度过大({maxLen})，可能影响数据库性能");
                    }
                }

                // 验证数值范围设置
                if (property.Type?.Contains("decimal") == true || property.Type?.Contains("double") == true)
                {
                    if (string.IsNullOrEmpty(property.MinValue) && string.IsNullOrEmpty(property.MaxValue))
                    {
                        result.AddInfo($"实体 '{entity.Name}' 数值属性 '{property.Name}' 未设置取值范围");
                    }
                }
            }
        }

        _logger.LogDebug("数据完整性验证完成");
    }

    /// <summary>
    /// 生成处理摘要
    /// </summary>
    private void GenerateProcessingSummary(ModelProcessingResult result)
    {
        var summary = new List<string>
        {
            $"📋 模块处理摘要: {result.ProcessedMetadata.Name}",
            $"   实体数量: {result.ProcessedMetadata.Entities?.Count ?? 0}",
            $"   总属性数: {result.ProcessedMetadata.Entities?.Sum(e => e.Properties?.Count ?? 0) ?? 0}",
            $"   处理结果: {(result.IsSuccess ? "✅成功" : "❌失败")}",
            $"   错误数量: {result.ErrorCount}",
            $"   警告数量: {result.WarningCount}",
            $"   信息数量: {result.InfoCount}"
        };

        if (result.CircularReferenceResult != null)
        {
            summary.Add($"   循环引用: {(result.CircularReferenceResult.HasCircularReference ? "❌发现" : "✅无")}");
        }

        result.ProcessingSummary = string.Join("\n", summary);
    }

    /// <summary>
    /// 克隆元数据以避免修改原始数据
    /// </summary>
    private ModuleMetadataDto CloneMetadata(ModuleMetadataDto original)
    {
        // 简单的克隆实现，实际项目中可以使用更高效的方式
        return new ModuleMetadataDto
        {
            Name = original.Name,
            Namespace = original.Namespace,
            Description = original.Description,
            DisplayName = original.DisplayName,
            Author = original.Author,
            Entities = original.Entities?.Select(e => new EntityModelDto
            {
                Name = e.Name,
                Description = e.Description,
                DisplayName = e.DisplayName,
                TableName = e.TableName,
                Properties = e.Properties?.Select(p => new PropertyModelDto
                {
                    Name = p.Name,
                    Type = p.Type,
                    Description = p.Description,
                    DisplayName = p.DisplayName,
                    IsRequired = p.IsRequired,
                    IsKey = p.IsKey,
                    MaxLength = p.MaxLength,
                    MinValue = p.MinValue,
                    MaxValue = p.MaxValue,
                    DefaultValue = p.DefaultValue
                }).ToList()
            }).ToList()
        };
    }

    /// <summary>
    /// 验证是否为有效的C#标识符
    /// </summary>
    private bool IsValidIdentifier(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        
        // C#标识符规则：以字母或下划线开头，后跟字母、数字或下划线
        return System.Text.RegularExpressions.Regex.IsMatch(name, @"^[a-zA-Z_][a-zA-Z0-9_]*$");
    }

    /// <summary>
    /// 验证是否为有效的命名空间
    /// </summary>
    private bool IsValidNamespace(string namespaceName)
    {
        if (string.IsNullOrWhiteSpace(namespaceName)) return false;
        
        // 命名空间规则：由点分隔的有效标识符
        var parts = namespaceName.Split('.');
        return parts.All(part => IsValidIdentifier(part));
    }

    #endregion
}

#region 数据传输对象

/// <summary>
/// 模型处理结果
/// </summary>
public class ModelProcessingResult
{
    public bool IsSuccess { get; set; }
    public ModuleMetadataDto OriginalMetadata { get; set; } = null!;
    public ModuleMetadataDto ProcessedMetadata { get; set; } = null!;
    public CircularReferenceDetectionResult? CircularReferenceResult { get; set; }
    public Dictionary<string, BatchTypeMappingResult> TypeMappingResults { get; set; } = new();
    public List<ProcessingMessage> Messages { get; set; } = new();
    public string ProcessingSummary { get; set; } = string.Empty;

    public int ErrorCount => Messages.Count(m => m.Level == MessageLevel.Error);
    public int WarningCount => Messages.Count(m => m.Level == MessageLevel.Warning);
    public int InfoCount => Messages.Count(m => m.Level == MessageLevel.Info);

    public void AddError(string message) => Messages.Add(new ProcessingMessage(MessageLevel.Error, message));
    public void AddWarning(string message) => Messages.Add(new ProcessingMessage(MessageLevel.Warning, message));
    public void AddInfo(string message) => Messages.Add(new ProcessingMessage(MessageLevel.Info, message));

    public string GetMessagesForLevel(MessageLevel level)
    {
        var levelMessages = Messages.Where(m => m.Level == level).Select(m => m.Message);
        return string.Join("\n", levelMessages);
    }

    public string GetAllMessages()
    {
        var grouped = Messages.GroupBy(m => m.Level);
        var result = new List<string>();

        foreach (var group in grouped.OrderBy(g => g.Key))
        {
            var levelIcon = group.Key switch
            {
                MessageLevel.Error => "❌",
                MessageLevel.Warning => "⚠️",
                MessageLevel.Info => "ℹ️",
                _ => "•"
            };

            result.Add($"{levelIcon} {group.Key} ({group.Count()}):");
            foreach (var message in group)
            {
                result.Add($"   {message.Message}");
            }
            result.Add("");
        }

        return string.Join("\n", result);
    }
}

/// <summary>
/// 处理消息
/// </summary>
public class ProcessingMessage
{
    public MessageLevel Level { get; set; }
    public string Message { get; set; }
    public DateTime Timestamp { get; set; }

    public ProcessingMessage(MessageLevel level, string message)
    {
        Level = level;
        Message = message;
        Timestamp = DateTime.UtcNow;
    }
}

/// <summary>
/// 消息级别
/// </summary>
public enum MessageLevel
{
    Info = 0,
    Warning = 1,
    Error = 2
}

/// <summary>
/// 快速验证结果
/// </summary>
public class ModelQuickValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Issues { get; set; } = new();

    public string GetSummary()
    {
        if (IsValid)
        {
            return "✅ 快速验证通过";
        }

        return $"❌ 快速验证失败 ({Issues.Count} 个问题):\n" + 
               string.Join("\n", Issues.Select(i => $"   - {i}"));
    }
}

#endregion
