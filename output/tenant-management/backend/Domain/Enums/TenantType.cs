using System.ComponentModel;

namespace SmartAbp.PermissionManagement.Tenants;

/// <summary>
/// 租户类型
/// </summary>
public enum TenantType
{
    /// <summary>
    /// 企业租户
    /// </summary>
    [Description("企业租户")]
    Enterprise = 1,

    /// <summary>
    /// 个人租户
    /// </summary>
    [Description("个人租户")]
    Personal = 2,

    /// <summary>
    /// 试用租户
    /// </summary>
    [Description("试用租户")]
    Trial = 3,

    /// <summary>
    /// 合作伙伴
    /// </summary>
    [Description("合作伙伴")]
    Partner = 4
}

