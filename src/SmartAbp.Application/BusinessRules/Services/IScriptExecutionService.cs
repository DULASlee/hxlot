using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartAbp.Application.BusinessRules.Services
{
    /// <summary>
    /// 脚本执行服务接口
    /// </summary>
    public interface IScriptExecutionService
    {
        /// <summary>
        /// 执行JavaScript脚本
        /// </summary>
        /// <param name="script">脚本内容</param>
        /// <param name="context">执行上下文</param>
        /// <param name="timeout">超时时间（毫秒）</param>
        /// <returns>执行结果</returns>
        Task<ScriptExecutionResult> ExecuteJavaScriptAsync(string script, Dictionary<string, object> context, int timeout = 5000);

        /// <summary>
        /// 执行C#脚本
        /// </summary>
        /// <param name="script">脚本内容</param>
        /// <param name="context">执行上下文</param>
        /// <param name="timeout">超时时间（毫秒）</param>
        /// <returns>执行结果</returns>
        Task<ScriptExecutionResult> ExecuteCSharpAsync(string script, Dictionary<string, object> context, int timeout = 5000);

        /// <summary>
        /// 验证脚本语法
        /// </summary>
        /// <param name="script">脚本内容</param>
        /// <param name="scriptType">脚本类型</param>
        /// <returns>验证结果</returns>
        Task<ScriptValidationResult> ValidateScriptAsync(string script, ScriptType scriptType);

        /// <summary>
        /// 获取支持的脚本类型
        /// </summary>
        /// <returns>支持的脚本类型列表</returns>
        IEnumerable<ScriptType> GetSupportedScriptTypes();
    }

    /// <summary>
    /// 脚本执行结果
    /// </summary>
    public class ScriptExecutionResult
    {
        /// <summary>
        /// 执行是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 执行结果值
        /// </summary>
        public object? Result { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string? Error { get; set; }

        /// <summary>
        /// 执行时间（毫秒）
        /// </summary>
        public int ExecutionTime { get; set; }

        /// <summary>
        /// 输出日志
        /// </summary>
        public List<string> Logs { get; set; } = new();

        /// <summary>
        /// 异常详情
        /// </summary>
        public Exception? Exception { get; set; }

        /// <summary>
        /// 是否超时
        /// </summary>
        public bool IsTimeout { get; set; }

        /// <summary>
        /// 内存使用情况（字节）
        /// </summary>
        public long MemoryUsage { get; set; }
    }

    /// <summary>
    /// 脚本验证结果
    /// </summary>
    public class ScriptValidationResult
    {
        /// <summary>
        /// 验证是否通过
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// 错误信息列表
        /// </summary>
        public List<string> Errors { get; set; } = new();

        /// <summary>
        /// 警告信息列表
        /// </summary>
        public List<string> Warnings { get; set; } = new();

        /// <summary>
        /// 语法分析结果
        /// </summary>
        public Dictionary<string, object> SyntaxInfo { get; set; } = new();
    }

    /// <summary>
    /// 脚本类型枚举
    /// </summary>
    public enum ScriptType
    {
        /// <summary>
        /// JavaScript
        /// </summary>
        JavaScript,

        /// <summary>
        /// C# 脚本
        /// </summary>
        CSharp,

        /// <summary>
        /// 表达式（简单条件表达式）
        /// </summary>
        Expression
    }
}
