using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Modularity;
using SmartAbp.PermissionManagement.Application.Contracts;

namespace SmartAbp.PermissionManagement.HttpApi;

/// <summary>
/// 权限管理HTTP API层模块
/// 定义RESTful API控制器
/// </summary>
[DependsOn(
    typeof(AbpAspNetCoreMvcModule),
    typeof(PermissionManagementApplicationContractsModule)
)]
public class PermissionManagementHttpApiModule : AbpModule
{
}

