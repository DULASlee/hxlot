using System.ComponentModel;

namespace SmartAbp.Domain.Shared.TenantManagement
{
    /// <summary>
    /// 租户状态枚举
    /// </summary>
    public enum TenantStatus
    {
        /// <summary>
        /// 正常 - 租户正常运行
        /// </summary>
        [Description("正常")]
        Active = 1,

        /// <summary>
        /// 暂停 - 租户已暂停（可恢复）
        /// </summary>
        [Description("暂停")]
        Suspended = 2,

        /// <summary>
        /// 已过期 - 订阅已过期
        /// </summary>
        [Description("已过期")]
        Expired = 3,

        /// <summary>
        /// 已禁用 - 租户已禁用（违规等）
        /// </summary>
        [Description("已禁用")]
        Disabled = 4,

        /// <summary>
        /// 待审核 - 新注册待审核
        /// </summary>
        [Description("待审核")]
        Pending = 5
    }
}

