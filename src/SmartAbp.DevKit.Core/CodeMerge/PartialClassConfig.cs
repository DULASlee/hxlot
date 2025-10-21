using System.Collections.Generic;

namespace SmartAbp.DevKit.Core.CodeMerge;

/// <summary>
/// Partial类配置
/// 定义哪些类型需要使用Partial机制
/// </summary>
public class PartialClassConfig
{
    /// <summary>
    /// 需要使用Partial机制的文件类型
    /// </summary>
    public static readonly HashSet<string> PartialClassTypes = new()
    {
        // Domain层
        "Entity",
        "AggregateRoot",
        "ValueObject",

        // Application层
        "AppService",
        "Dto",
        "CreateDto",
        "UpdateDto",

        // Frontend层
        "Store",
        "Component",
        "Service"
    };

    /// <summary>
    /// 判断文件是否需要使用Partial机制
    /// </summary>
    /// <param name="fileName">文件名（如：BlogPost.cs）</param>
    /// <returns>是否需要Partial机制</returns>
    public static bool NeedsPartialClass(string fileName)
    {
        // 检查文件名是否包含需要Partial机制的类型
        foreach (var type in PartialClassTypes)
        {
            if (fileName.Contains(type, System.StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// 获取默认命名空间（根据文件类型）
    /// </summary>
    public static string GetDefaultNamespace(string fileType, string moduleName)
    {
        return fileType switch
        {
            "Entity" or "AggregateRoot" or "ValueObject" => $"{moduleName}.Domain.Entities",
            "AppService" => $"{moduleName}.Application.Services",
            "Dto" or "CreateDto" or "UpdateDto" => $"{moduleName}.Application.Contracts.Dtos",
            "Store" => $"{moduleName}.Vue.Stores",
            "Component" => $"{moduleName}.Vue.Components",
            "Service" => $"{moduleName}.Vue.Services",
            _ => $"{moduleName}.Domain"
        };
    }
}

