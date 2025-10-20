using Volo.Abp.Domain;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;

namespace SmartAbp.PermissionManagement.Domain;

/// <summary>
/// 权限管理领域层模块
/// DDD核心层 - 存放实体、聚合根、领域服务、仓储接口等
/// 集成ABP Identity和PermissionManagement模块
/// </summary>
[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(AbpIdentityDomainModule),
    typeof(AbpPermissionManagementDomainModule),
    typeof(PermissionManagementDomainSharedModule)
)]
public class PermissionManagementDomainModule : AbpModule
{
}

