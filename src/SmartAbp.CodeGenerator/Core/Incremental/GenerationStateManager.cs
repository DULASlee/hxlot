using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace SmartAbp.CodeGenerator.Core.Incremental;

/// <summary>
/// 生成状态管理器
/// 负责管理代码生成的状态缓存，支持增量生成
/// </summary>
public class GenerationStateManager
{
    private readonly ILogger<GenerationStateManager> _logger;
    private const string StateFileName = "generation-manifest.json";

    public GenerationStateManager(ILogger<GenerationStateManager> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 加载生成状态
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <returns>生成状态，如果不存在则返回null</returns>
    public async Task<GenerationState?> LoadStateAsync(string outputPath)
    {
        var stateFilePath = GetStateFilePath(outputPath);
        
        if (!File.Exists(stateFilePath))
        {
            _logger.LogDebug("状态文件不存在: {StateFilePath}", stateFilePath);
            return null;
        }

        try
        {
            var json = await File.ReadAllTextAsync(stateFilePath);
            var state = JsonSerializer.Deserialize<GenerationState>(json, GetJsonOptions());
            
            if (state == null)
            {
                _logger.LogWarning("状态文件内容为空或无效: {StateFilePath}", stateFilePath);
                return null;
            }

            _logger.LogDebug("成功加载生成状态: {GenerationId}, 输入哈希数量: {HashCount}", 
                state.GenerationId, state.InputHashes.Count);
            
            return state;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "加载生成状态失败: {StateFilePath}", stateFilePath);
            // 状态文件损坏时，删除并重新开始
            try
            {
                File.Delete(stateFilePath);
                _logger.LogInformation("已删除损坏的状态文件: {StateFilePath}", stateFilePath);
            }
            catch (Exception deleteEx)
            {
                _logger.LogWarning(deleteEx, "删除损坏状态文件失败: {StateFilePath}", stateFilePath);
            }
            return null;
        }
    }

    /// <summary>
    /// 保存生成状态
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <param name="state">生成状态</param>
    public async Task SaveStateAsync(string outputPath, GenerationState state)
    {
        var stateFilePath = GetStateFilePath(outputPath);
        
        try
        {
            // 确保目录存在
            var directory = Path.GetDirectoryName(stateFilePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
                _logger.LogDebug("创建状态目录: {Directory}", directory);
            }

            var json = JsonSerializer.Serialize(state, GetJsonOptions());
            await File.WriteAllTextAsync(stateFilePath, json);
            
            _logger.LogDebug("成功保存生成状态: {GenerationId}, 文件: {StateFilePath}", 
                state.GenerationId, stateFilePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "保存生成状态失败: {StateFilePath}", stateFilePath);
            throw new InvalidOperationException($"保存生成状态失败 {stateFilePath}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 清除生成状态
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    public async Task ClearStateAsync(string outputPath)
    {
        var stateFilePath = GetStateFilePath(outputPath);
        
        if (!File.Exists(stateFilePath))
        {
            _logger.LogDebug("状态文件不存在，无需清除: {StateFilePath}", stateFilePath);
            return;
        }

        try
        {
            // 使用异步方式删除文件
            await Task.Run(() => File.Delete(stateFilePath));
            _logger.LogInformation("成功清除生成状态: {StateFilePath}", stateFilePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "清除生成状态失败: {StateFilePath}", stateFilePath);
            throw new InvalidOperationException($"清除生成状态失败 {stateFilePath}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 检查状态文件是否存在
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <returns>状态文件是否存在</returns>
    public bool StateExists(string outputPath)
    {
        var stateFilePath = GetStateFilePath(outputPath);
        return File.Exists(stateFilePath);
    }

    /// <summary>
    /// 获取状态文件路径
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <returns>状态文件路径</returns>
    private string GetStateFilePath(string outputPath)
    {
        return Path.Combine(outputPath, StateFileName);
    }

    /// <summary>
    /// 获取JSON序列化选项
    /// </summary>
    /// <returns>JSON序列化选项</returns>
    private JsonSerializerOptions GetJsonOptions()
    {
        return new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
    }

    /// <summary>
    /// 备份当前状态
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <returns>备份文件路径</returns>
    public async Task<string?> BackupStateAsync(string outputPath)
    {
        var stateFilePath = GetStateFilePath(outputPath);
        
        if (!File.Exists(stateFilePath))
        {
            _logger.LogDebug("状态文件不存在，无需备份: {StateFilePath}", stateFilePath);
            return null;
        }

        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"generation-manifest.backup.{timestamp}.json";
            var backupFilePath = Path.Combine(Path.GetDirectoryName(stateFilePath)!, backupFileName);
            
            // 使用异步方式复制文件
            await Task.Run(() => File.Copy(stateFilePath, backupFilePath));
            _logger.LogInformation("成功备份生成状态: {BackupFilePath}", backupFilePath);
            
            return backupFilePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "备份生成状态失败: {StateFilePath}", stateFilePath);
            throw new InvalidOperationException($"备份生成状态失败 {stateFilePath}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 恢复状态备份
    /// </summary>
    /// <param name="backupFilePath">备份文件路径</param>
    /// <param name="outputPath">输出路径</param>
    public async Task RestoreStateAsync(string backupFilePath, string outputPath)
    {
        if (!File.Exists(backupFilePath))
        {
            throw new FileNotFoundException($"备份文件不存在: {backupFilePath}");
        }

        try
        {
            var stateFilePath = GetStateFilePath(outputPath);
            // 使用异步方式复制文件
            await Task.Run(() => File.Copy(backupFilePath, stateFilePath, overwrite: true));
            _logger.LogInformation("成功恢复生成状态: {BackupFilePath} -> {StateFilePath}", 
                backupFilePath, stateFilePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "恢复生成状态失败: {BackupFilePath}", backupFilePath);
            throw new InvalidOperationException($"恢复生成状态失败 {backupFilePath}: {ex.Message}", ex);
        }
    }
}

/// <summary>
/// 生成状态
/// </summary>
public class GenerationState
{
    /// <summary>
    /// 生成ID
    /// </summary>
    public required string GenerationId { get; set; }

    /// <summary>
    /// 生成时间戳
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// 输入哈希字典
    /// Key: 输入项键, Value: 哈希值
    /// </summary>
    public Dictionary<string, string> InputHashes { get; set; } = new();

    /// <summary>
    /// 生成的文件列表
    /// </summary>
    public List<string> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 版本信息
    /// </summary>
    public string Version { get; set; } = "1.0";

    /// <summary>
    /// 元数据
    /// </summary>
    public Dictionary<string, object> Metadata { get; set; } = new();
}
