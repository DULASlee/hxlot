using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace SmartAbp.OpsManagement.Domain;

/// <summary>
/// 运维管理领域层模块
/// </summary>
[DependsOn(
    typeof(AbpDddDomainModule)
)]
public class OpsManagementDomainModule : AbpModule
{
}
