using System;
using System.Threading.Tasks;

namespace SmartAbp.DevKit.Abstractions.Progress;

/// <summary>
/// 进度追踪器接口 - 保持原有进度报告功能
/// </summary>
public interface IProgressTracker
{
    /// <summary>
    /// 任务ID
    /// </summary>
    string TaskId { get; }

    /// <summary>
    /// 任务类型
    /// </summary>
    string TaskType { get; }

    /// <summary>
    /// 报告进度
    /// </summary>
    /// <param name="status">状态</param>
    /// <param name="progress">进度百分比(0-100)</param>
    /// <param name="message">进度消息</param>
    Task ReportProgressAsync(string status, int progress, string message);

    /// <summary>
    /// 报告错误
    /// </summary>
    /// <param name="errorMessage">错误消息</param>
    Task ReportErrorAsync(string errorMessage);

    /// <summary>
    /// 报告完成
    /// </summary>
    /// <param name="success">是否成功</param>
    /// <param name="result">结果数据</param>
    Task ReportCompletionAsync(bool success, object? result = null);
}

/// <summary>
/// 进度追踪服务接口
/// </summary>
public interface IProgressTrackingService
{
    /// <summary>
    /// 创建进度追踪器
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <param name="taskType">任务类型</param>
    /// <returns>进度追踪器</returns>
    IProgressTracker CreateTracker(string taskId, string taskType);

    /// <summary>
    /// 获取任务状态
    /// </summary>
    /// <param name="taskId">任务ID</param>
    /// <returns>任务状态</returns>
    Task<TaskProgressInfo?> GetTaskProgressAsync(string taskId);
}

/// <summary>
/// 任务进度信息
/// </summary>
public class TaskProgressInfo
{
    public string TaskId { get; set; } = string.Empty;
    public string TaskType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Progress { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public object? Result { get; set; }
}
