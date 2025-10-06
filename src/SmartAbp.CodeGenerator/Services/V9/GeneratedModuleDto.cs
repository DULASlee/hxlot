using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.Services.V9
{
    /// <summary>
    /// 代表模块生成结果
    /// </summary>
    public class GeneratedModuleDto
    {
        /// <summary>
        /// 模块名称
        /// </summary>
        public string ModuleName { get; set; } = default!;
        
        /// <summary>
        /// 生成的文件列表
        /// </summary>
        public List<string> GeneratedFiles { get; set; } = new();
        
        /// <summary>
        /// 生成报告详情
        /// </summary>
        public string GenerationReport { get; set; } = default!;
        
        /// <summary>
        /// 会话ID - 用于状态查询
        /// </summary>
        public string SessionId { get; set; } = default!;
        
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; } = true;
        
        /// <summary>
        /// 消息
        /// </summary>
        public string Message { get; set; } = string.Empty;
    }
}
