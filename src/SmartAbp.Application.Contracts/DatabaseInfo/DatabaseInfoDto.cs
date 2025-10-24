using System;

namespace SmartAbp.Application.Contracts.DatabaseInfo
{
    /// <summary>
    /// 数据库信息DTO
    /// ABP平台底层增强：提供数据库适配信息，供代码生成器等上层服务使用
    /// </summary>
    public class DatabaseInfoDto
    {
        /// <summary>
        /// 数据库类型
        /// </summary>
        public string DatabaseType { get; set; } = string.Empty;

        /// <summary>
        /// 数据库显示名称
        /// </summary>
        public string DatabaseName { get; set; } = string.Empty;

        /// <summary>
        /// 是否支持当前环境
        /// </summary>
        public bool IsSupported { get; set; }

        /// <summary>
        /// 连接字符串模板
        /// </summary>
        public string ConnectionStringTemplate { get; set; } = string.Empty;

        /// <summary>
        /// 当前配置的连接字符串（脱敏处理）
        /// </summary>
        public string MaskedConnectionString { get; set; } = string.Empty;

        /// <summary>
        /// 数据库版本信息
        /// </summary>
        public string DatabaseVersion { get; set; } = string.Empty;

        /// <summary>
        /// 数据库大小（MB）
        /// </summary>
        public long DatabaseSizeInMB { get; set; }

        /// <summary>
        /// 连接测试状态
        /// </summary>
        public bool IsConnectionValid { get; set; }

        /// <summary>
        /// 连接测试消息
        /// </summary>
        public string ConnectionTestMessage { get; set; } = string.Empty;
    }
}
