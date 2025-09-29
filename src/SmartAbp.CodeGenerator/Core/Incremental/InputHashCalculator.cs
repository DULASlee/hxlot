using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;

namespace SmartAbp.CodeGenerator.Core.Incremental;

/// <summary>
/// 输入哈希计算器
/// 为代码生成输入计算稳定的哈希值，用于增量生成判断
/// </summary>
public class InputHashCalculator
{
    private readonly ILogger<InputHashCalculator> _logger;

    public InputHashCalculator(ILogger<InputHashCalculator> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 计算字符串内容的哈希值
    /// </summary>
    /// <param name="content">字符串内容</param>
    /// <returns>SHA-256哈希值</returns>
    public string ComputeStringHash(string content)
    {
        if (string.IsNullOrEmpty(content))
        {
            return string.Empty;
        }

        try
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(content);
            var hashBytes = sha256.ComputeHash(bytes);
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "计算字符串哈希失败, 内容长度: {ContentLength}", content.Length);
            throw new InvalidOperationException($"计算字符串哈希失败: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 计算文件内容的哈希值
    /// </summary>
    /// <param name="content">文件内容</param>
    /// <returns>SHA-256哈希值</returns>
    public string ComputeFileHash(string content)
    {
        return ComputeStringHash(content);
    }

    /// <summary>
    /// 计算文件的哈希值（从文件路径）
    /// </summary>
    /// <param name="filePath">文件路径</param>
    /// <returns>SHA-256哈希值</returns>
    public async Task<string> ComputeFileHashAsync(string filePath)
    {
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("尝试计算不存在文件的哈希: {FilePath}", filePath);
            return string.Empty;
        }

        try
        {
            var content = await File.ReadAllTextAsync(filePath, Encoding.UTF8);
            return ComputeStringHash(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "计算文件哈希失败: {FilePath}", filePath);
            throw new InvalidOperationException($"计算文件哈希失败 {filePath}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 计算组合哈希值
    /// 将多个输入组合后计算哈希，用于依赖多个输入的文件
    /// </summary>
    /// <param name="inputs">输入项列表</param>
    /// <returns>组合哈希值</returns>
    public string ComputeCombinedHash(IEnumerable<string> inputs)
    {
        if (inputs == null || !inputs.Any())
        {
            return string.Empty;
        }

        try
        {
            // 对输入进行排序，确保相同输入集合产生相同哈希
            var sortedInputs = inputs.OrderBy(x => x).ToList();
            var combined = string.Join("|", sortedInputs);
            return ComputeStringHash(combined);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "计算组合哈希失败, 输入数量: {InputCount}", inputs.Count());
            throw new InvalidOperationException($"计算组合哈希失败: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 计算对象的哈希值
    /// 将对象序列化为JSON后计算哈希
    /// </summary>
    /// <param name="obj">要计算哈希的对象</param>
    /// <returns>对象哈希值</returns>
    public string ComputeObjectHash(object obj)
    {
        if (obj == null)
        {
            return string.Empty;
        }

        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(obj, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = false,
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
                // 确保序列化结果稳定
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
            return ComputeStringHash(json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "计算对象哈希失败, 对象类型: {ObjectType}", obj.GetType().Name);
            throw new InvalidOperationException($"计算对象哈希失败: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 验证哈希值格式
    /// </summary>
    /// <param name="hash">哈希值</param>
    /// <returns>是否为有效的SHA-256哈希</returns>
    public bool IsValidHash(string hash)
    {
        if (string.IsNullOrEmpty(hash))
        {
            return false;
        }

        // SHA-256哈希为64位十六进制字符串
        return hash.Length == 64 && hash.All(c => char.IsDigit(c) || (c >= 'a' && c <= 'f'));
    }

    /// <summary>
    /// 比较两个哈希值是否相等
    /// </summary>
    /// <param name="hash1">哈希值1</param>
    /// <param name="hash2">哈希值2</param>
    /// <returns>是否相等</returns>
    public bool CompareHashes(string hash1, string hash2)
    {
        return string.Equals(hash1, hash2, StringComparison.OrdinalIgnoreCase);
    }
}
