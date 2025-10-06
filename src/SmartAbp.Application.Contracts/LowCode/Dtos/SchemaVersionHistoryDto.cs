using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 Schema版本历史DTO
    /// </summary>
    public class SchemaVersionHistoryDto : AuditedEntityDto<Guid>
    {
        /// <summary>
        /// Schema版本号
        /// </summary>
        [Required]
        [StringLength(32)]
        public string Version { get; set; }

        /// <summary>
        /// Schema名称
        /// </summary>
        [Required]
        [StringLength(128)]
        public string SchemaName { get; set; }

        /// <summary>
        /// 版本描述
        /// </summary>
        [StringLength(512)]
        public string Description { get; set; }

        /// <summary>
        /// 变更类型
        /// </summary>
        [StringLength(32)]
        public string ChangeType { get; set; }

        /// <summary>
        /// 变更内容
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
        [StringLength(32)]
        public string MinCompatibleVersion { get; set; }

        /// <summary>
        /// 最高兼容版本
        /// </summary>
        [StringLength(32)]
        public string MaxCompatibleVersion { get; set; }

        /// <summary>
        /// 发布人
        /// </summary>
        [StringLength(128)]
        public string ReleasedBy { get; set; }

        /// <summary>
        /// 发布备注
        /// </summary>
        public string ReleaseNotes { get; set; }
    }

    /// <summary>
    /// 创建版本历史DTO
    /// </summary>
    public class CreateSchemaVersionHistoryDto
    {
        [Required]
        [StringLength(32)]
        public string Version { get; set; }

        [Required]
        [StringLength(128)]
        public string SchemaName { get; set; }

        [StringLength(512)]
        public string Description { get; set; }

        [Required]
        [StringLength(32)]
        public string ChangeType { get; set; }

        public string ChangeContent { get; set; }

        public bool IsBreakingChange { get; set; }

        [StringLength(32)]
        public string MinCompatibleVersion { get; set; }

        [StringLength(32)]
        public string MaxCompatibleVersion { get; set; }
    }

    /// <summary>
    /// 版本发布DTO
    /// </summary>
    public class ReleaseVersionDto
    {
        [Required]
        public Guid VersionId { get; set; }

        [Required]
        [StringLength(128)]
        public string ReleasedBy { get; set; }

        public string ReleaseNotes { get; set; }
    }
}

