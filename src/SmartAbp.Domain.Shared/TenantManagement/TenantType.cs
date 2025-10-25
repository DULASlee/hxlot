using System.ComponentModel;

namespace SmartAbp.Domain.Shared.TenantManagement
{
    /// <summary>
    /// 租户类型枚举
    /// </summary>
    public enum TenantType
    {
        /// <summary>
        /// 企业租户 - 大型企业客户
        /// </summary>
        [Description("企业租户")]
        Enterprise = 1,

        /// <summary>
        /// 个人租户 - 个人用户
        /// </summary>
        [Description("个人租户")]
        Personal = 2,

        /// <summary>
        /// 试用租户 - 试用期客户
        /// </summary>
        [Description("试用租户")]
        Trial = 3,

        /// <summary>
        /// 合作伙伴 - 战略合作伙伴
        /// </summary>
        [Description("合作伙伴")]
        Partner = 4,

        /// <summary>
        /// 系统租户 - 内部系统使用
        /// </summary>
        [Description("系统租户")]
        System = 99
    }
}

