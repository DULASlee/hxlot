using Volo.Abp.Application;
using Volo.Abp.Modularity;

namespace SmartAbp.OpsManagement.Application.Contracts;

/// <summary>
/// 运维管理应用合约模块
/// </summary>
[DependsOn(
    typeof(AbpDddApplicationContractsModule)
)]
public class OpsManagementApplicationContractsModule : AbpModule
{
}
