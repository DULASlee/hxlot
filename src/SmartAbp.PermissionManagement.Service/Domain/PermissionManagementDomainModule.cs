using Volo.Abp.Domain;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using Volo.Abp.MultiTenancy;
using Volo.Abp.PermissionManagement;
using Volo.Abp.TenantManagement;

namespace SmartAbp.PermissionManagement.Domain;

/// <summary>
/// 权限管理领域层模块
/// DDD核心层 - 存放实体、聚合根、领域服务、仓储接口等
/// 集成ABP Identity + PermissionManagement + TenantManagement（多租户支持）
/// 支持集团公司组织架构（基于OrganizationUnit）
/// </summary>
[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(AbpMultiTenancyModule),
    typeof(AbpIdentityDomainModule),
    typeof(AbpPermissionManagementDomainModule),
    typeof(AbpTenantManagementDomainModule),
    typeof(PermissionManagementDomainSharedModule)
)]
public class PermissionManagementDomainModule : AbpModule
{
}

