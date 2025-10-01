namespace SmartAbp.OpsManagement;

/// <summary>
/// 运维管理错误码
/// </summary>
public static class OpsManagementErrorCodes
{
    public const string LogSearchFailed = "OpsManagement:LogSearchFailed";
    public const string LogStatisticsFailed = "OpsManagement:LogStatisticsFailed";
    public const string K8sMonitorFailed = "OpsManagement:K8sMonitorFailed";
    public const string MetricsQueryFailed = "OpsManagement:MetricsQueryFailed";
    public const string AlertRuleNotFound = "OpsManagement:AlertRuleNotFound";
    public const string AlertRuleCreateFailed = "OpsManagement:AlertRuleCreateFailed";
}

