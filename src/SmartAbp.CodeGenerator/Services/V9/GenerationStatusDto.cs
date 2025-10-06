using System;
using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.Services.V9
{
    /// <summary>
    /// 代表代码生成会话的状态
    /// </summary>
    public class GenerationStatusDto
    {
        /// <summary>
        /// 生成会话ID
        /// </summary>
        public string SessionId { get; set; }
        
        /// <summary>
        /// 生成状态：等待中、处理中、已完成、失败
        /// </summary>
        public string Status { get; set; }
        
        /// <summary>
        /// 当前生成进度百分比 (0-100)
        /// </summary>
        public int Percentage { get; set; }
        
        /// <summary>
        /// 当前执行的步骤描述
        /// </summary>
        public string CurrentStep { get; set; }
        
        /// <summary>
        /// 如果发生错误，包含错误信息
        /// </summary>
        public string Error { get; set; }
        
        /// <summary>
        /// 生成开始时间
        /// </summary>
        public DateTime StartedAt { get; set; }
        
        /// <summary>
        /// 生成结束时间（如果已完成）
        /// </summary>
        public DateTime? CompletedAt { get; set; }
        
        /// <summary>
        /// 已完成的文件列表
        /// </summary>
        public List<string> CompletedFiles { get; set; }
        
        /// <summary>
        /// 模块名称
        /// </summary>
        public string ModuleName { get; set; }

        public GenerationStatusDto()
        {
            SessionId = string.Empty;
            Status = "pending"; // pending, processing, completed, error
            CurrentStep = string.Empty;
            Error = string.Empty;
            ModuleName = string.Empty;
            CompletedFiles = new List<string>();
            StartedAt = DateTime.Now;
        }
    }
}
