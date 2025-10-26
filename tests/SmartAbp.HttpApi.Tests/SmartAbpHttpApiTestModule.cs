using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartAbp;
using Volo.Abp;
using Volo.Abp.Modularity;

namespace SmartAbp.HttpApi.Tests
{
    [DependsOn(
        typeof(SmartAbpHttpApiModule),
        typeof(SmartAbpApplicationModule),
        typeof(SmartAbpDomainModule)
    )]
    public class SmartAbpHttpApiTestModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            // 添加测试特定的配置
        }
    }
}
