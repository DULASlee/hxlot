using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 Schema版本历史记录
    /// 
    /// 功能: 记录Schema版本变更历史,支持版本回溯和审计
    /// 版本: v1.0.0
    /// </summary>
    public class SchemaVersionHistory : AuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// Schema版本号 (格式: major.minor.patch)
        /// </summary>
        public string Version { get; set; }

        /// <summary>
        /// Schema名称
        /// </summary>
        public string SchemaName { get; set; }

        /// <summary>
        /// 版本描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 变更类型 (Major, Minor, Patch, Hotfix)
        /// </summary>
        public string ChangeType { get; set; }

        /// <summary>
        /// 变更内容 (JSON格式,记录具体变更)
        /// </summary>
        public string ChangeContent { get; set; }

        /// <summary>
        /// 是否为破坏性变更
        /// </summary>
        public bool IsBreakingChange { get; set; }

        /// <summary>
        /// 是否已发布
        /// </summary>
        public bool IsReleased { get; set; }

        /// <summary>
        /// 发布日期
        /// </summary>
        public DateTime? ReleaseDate { get; set; }

        /// <summary>
        /// 是否已弃用
        /// </summary>
        public bool IsDeprecated { get; set; }

        /// <summary>
        /// 弃用日期
        /// </summary>
        public DateTime? DeprecatedDate { get; set; }

        /// <summary>
        /// 最低兼容版本
        /// </summary>
        public string MinCompatibleVersion { get; set; }

        /// <summary>
        /// 最高兼容版本
        /// </summary>
        public string MaxCompatibleVersion { get; set; }

        /// <summary>
        /// 迁移脚本路径 (如有数据迁移)
        /// </summary>
        public string MigrationScriptPath { get; set; }

        /// <summary>
        /// 回滚脚本路径 (如需回滚)
        /// </summary>
        public string RollbackScriptPath { get; set; }

        /// <summary>
        /// 发布人
        /// </summary>
        public string ReleasedBy { get; set; }

        /// <summary>
        /// 发布备注
        /// </summary>
        public string ReleaseNotes { get; set; }

        protected SchemaVersionHistory()
        {
            // EF Core需要无参构造函数
            Version = string.Empty;
            SchemaName = string.Empty;
            Description = string.Empty;
            ChangeType = string.Empty;
            ChangeContent = string.Empty;
            MinCompatibleVersion = string.Empty;
            MaxCompatibleVersion = string.Empty;
            MigrationScriptPath = string.Empty;
            RollbackScriptPath = string.Empty;
            ReleasedBy = string.Empty;
            ReleaseNotes = string.Empty;
        }

        public SchemaVersionHistory(
            Guid id,
            string version,
            string schemaName,
            string description,
            string changeType)
            : base(id)
        {
            Version = version;
            SchemaName = schemaName;
            Description = description;
            ChangeType = changeType;
            IsReleased = false;
            IsDeprecated = false;
            IsBreakingChange = false;
        }

        /// <summary>
        /// 发布版本
        /// </summary>
        /// <param name="releasedBy">发布人</param>
        /// <param name="releaseNotes">发布备注</param>
        public void Release(string releasedBy, string releaseNotes = null)
        {
            IsReleased = true;
            ReleaseDate = DateTime.UtcNow;
            ReleasedBy = releasedBy;
            ReleaseNotes = releaseNotes;
        }

        /// <summary>
        /// 标记为弃用
        /// </summary>
        public void Deprecate()
        {
            IsDeprecated = true;
            DeprecatedDate = DateTime.UtcNow;
        }
    }
}

