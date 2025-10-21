using Volo.Abp.Modularity;
using Volo.Abp.Domain;

namespace SmartAbp.PermissionManagement;

/// <summary>
/// 权限管理领域共享层模块
/// 零依赖层 - 存放枚举、常量、共享DTO等
/// </summary>
[DependsOn(
    typeof(AbpDddDomainSharedModule)
)]
public class PermissionManagementDomainSharedModule : AbpModule
{
}

