using Volo.Abp.Application;
using Volo.Abp.Modularity;

namespace SmartAbp.PermissionManagement.Application.Contracts;

/// <summary>
/// 权限管理应用服务契约层模块
/// 定义应用服务接口、DTO等
/// </summary>
[DependsOn(
    typeof(AbpDddApplicationContractsModule),
    typeof(PermissionManagementDomainSharedModule)
)]
public class PermissionManagementApplicationContractsModule : AbpModule
{
}

