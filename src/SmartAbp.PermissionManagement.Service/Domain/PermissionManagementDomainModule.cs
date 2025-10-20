using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace SmartAbp.PermissionManagement.Domain;

/// <summary>
/// 权限管理领域层模块
/// DDD核心层 - 存放实体、聚合根、领域服务、仓储接口等
/// </summary>
[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(PermissionManagementDomainSharedModule)
)]
public class PermissionManagementDomainModule : AbpModule
{
}

