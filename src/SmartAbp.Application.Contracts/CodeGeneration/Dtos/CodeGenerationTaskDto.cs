using System;
using SmartAbp.Domain.CodeGeneration;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.CodeGeneration.Dtos
{
    /// <summary>
    /// 代码生成任务DTO
    /// </summary>
    public class CodeGenerationTaskDto : FullAuditedEntityDto<Guid>
    {
        /// <summary>
        /// 任务名称
        /// </summary>
        public string TaskName { get; set; }

        /// <summary>
        /// 生成器类型
        /// </summary>
        public CodeGeneratorType GeneratorType { get; set; }

        /// <summary>
        /// 配置JSON
        /// </summary>
        public string ConfigurationJson { get; set; }

        /// <summary>
        /// 任务状态
        /// </summary>
        public TaskStatus Status { get; set; }

        /// <summary>
        /// 生成结果JSON
        /// </summary>
        public string ResultJson { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// 开始时间
        /// </summary>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// 完成时间
        /// </summary>
        public DateTime? CompletedTime { get; set; }

        /// <summary>
        /// 输出目录
        /// </summary>
        public string OutputDirectory { get; set; }
    }

    /// <summary>
    /// 创建代码生成任务输入
    /// </summary>
    public class CreateCodeGenerationTaskDto
    {
        /// <summary>
        /// 任务名称
        /// </summary>
        public string TaskName { get; set; }

        /// <summary>
        /// 生成器类型
        /// </summary>
        public CodeGeneratorType GeneratorType { get; set; }

        /// <summary>
        /// 配置JSON
        /// </summary>
        public string ConfigurationJson { get; set; }

        /// <summary>
        /// 输出目录（可选）
        /// </summary>
        public string OutputDirectory { get; set; }
    }

    /// <summary>
    /// 更新代码生成任务输入
    /// </summary>
    public class UpdateCodeGenerationTaskDto
    {
        /// <summary>
        /// 任务名称
        /// </summary>
        public string TaskName { get; set; }

        /// <summary>
        /// 配置JSON
        /// </summary>
        public string ConfigurationJson { get; set; }

        /// <summary>
        /// 输出目录
        /// </summary>
        public string OutputDirectory { get; set; }

        /// <summary>
        /// 任务状态
        /// </summary>
        public TaskStatus? Status { get; set; }

        /// <summary>
        /// 结果JSON
        /// </summary>
        public string ResultJson { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string ErrorMessage { get; set; }
    }

    /// <summary>
    /// MES大屏生成器配置
    /// </summary>
    public class MESGeneratorConfigDto
    {
        /// <summary>
        /// 系统名称
        /// </summary>
        public string SystemName { get; set; }

        /// <summary>
        /// 系统描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 公司名称
        /// </summary>
        public string CompanyName { get; set; }

        /// <summary>
        /// 数据更新频率（毫秒）
        /// </summary>
        public int UpdateInterval { get; set; }

        /// <summary>
        /// 选中的大屏类型列表
        /// </summary>
        public string[] SelectedDashboards { get; set; }

        /// <summary>
        /// 数据源类型：realtime/polling/mock
        /// </summary>
        public string SourceType { get; set; }

        /// <summary>
        /// WebSocket地址
        /// </summary>
        public string WsUrl { get; set; }

        /// <summary>
        /// API地址
        /// </summary>
        public string ApiUrl { get; set; }

        /// <summary>
        /// 启用告警
        /// </summary>
        public bool EnableAlerts { get; set; }

        /// <summary>
        /// 启用数据导出
        /// </summary>
        public bool EnableExport { get; set; }
    }

    /// <summary>
    /// UniApp移动应用生成器配置
    /// </summary>
    public class UniAppGeneratorConfigDto
    {
        /// <summary>
        /// 应用名称
        /// </summary>
        public string AppName { get; set; }

        /// <summary>
        /// 应用ID
        /// </summary>
        public string AppId { get; set; }

        /// <summary>
        /// 应用版本
        /// </summary>
        public string Version { get; set; }

        /// <summary>
        /// 应用描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// API服务器地址
        /// </summary>
        public string ApiBaseUrl { get; set; }

        /// <summary>
        /// 选中的功能模块列表
        /// </summary>
        public string[] SelectedModules { get; set; }

        /// <summary>
        /// 目标平台：h5/mp-weixin/app-plus
        /// </summary>
        public string[] Targets { get; set; }

        /// <summary>
        /// UI主题色
        /// </summary>
        public string PrimaryColor { get; set; }

        /// <summary>
        /// 启用暗黑模式
        /// </summary>
        public bool DarkMode { get; set; }

        /// <summary>
        /// 启用离线功能
        /// </summary>
        public bool OfflineMode { get; set; }

        /// <summary>
        /// 启用推送通知
        /// </summary>
        public bool PushNotification { get; set; }
    }

    /// <summary>
    /// 代码生成结果DTO
    /// </summary>
    public class CodeGenerationResultDto
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 生成的文件列表
        /// </summary>
        public string[] GeneratedFiles { get; set; }

        /// <summary>
        /// 输出目录
        /// </summary>
        public string OutputDirectory { get; set; }

        /// <summary>
        /// 下载链接（如果支持）
        /// </summary>
        public string DownloadUrl { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// 生成耗时（秒）
        /// </summary>
        public double Duration { get; set; }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🟡 枚举定义已移至Domain层（避免重复定义）
    // 使用: SmartAbp.Domain.CodeGeneration.CodeGeneratorType
    // 使用: SmartAbp.Domain.CodeGeneration.TaskStatus
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /*
    /// <summary>
    /// 代码生成器类型（已移至Domain层）
    /// </summary>
    public enum CodeGeneratorType
    {
        MESDashboard = 1,
        UniAppMobile = 2,
        WebAdmin = 3,
        MicroserviceAPI = 4
    }

    /// <summary>
    /// 任务状态（已移至Domain层）
    /// </summary>
    public enum TaskStatus
    {
        Pending = 0,
        Running = 1,
        Succeeded = 2,
        Failed = 3,
        Cancelled = 4
    }
    */
}

