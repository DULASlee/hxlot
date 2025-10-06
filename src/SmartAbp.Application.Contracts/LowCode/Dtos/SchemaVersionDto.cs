using System;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 Schema版本DTO
    /// 
    /// 功能: 统一前后端Schema版本管理
    /// 版本: v1.0.0
    /// </summary>
    public class SchemaVersionDto
    {
        /// <summary>
        /// Schema版本号 (格式: major.minor.patch, 如: 1.0.0)
        /// </summary>
        public string Version { get; set; } = "1.0.0";

        /// <summary>
        /// Schema发布日期
        /// </summary>
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 是否向后兼容
        /// </summary>
        public bool IsBackwardCompatible { get; set; } = true;

        /// <summary>
        /// 最低兼容版本 (格式: major.minor.patch)
        /// </summary>
        public string MinCompatibleVersion { get; set; } = "1.0.0";

        /// <summary>
        /// 版本更新说明
        /// </summary>
        public string ChangeLog { get; set; } = string.Empty;

        /// <summary>
        /// 是否为当前活跃版本
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}

