using Microsoft.Extensions.DependencyInjection;
using SmartAbp.Database.Abstraction.Adapters.Implementations;
using SmartAbp.Database.Abstraction.Dialects.Implementations;
using SmartAbp.Database.Abstraction.Mappers.Implementations;
using Volo.Abp.Modularity;

namespace SmartAbp.Database.Abstraction
{
    /// <summary>
    /// SmartAbp数据库抽象模块
    /// ABP平台底层增强：提供跨平台数据库适配能力
    /// </summary>
    public class SmartAbpDatabaseAbstractionModule : AbpModule
    {
        public override void ConfigureServices(ServiceConfigurationContext context)
        {
            var services = context.Services;

            // 注册数据库适配器
            services.AddTransient<SqlServerDatabaseAdapter>();
            
            // 注册方言引擎
            services.AddTransient<SqlServerDialectEngine>();
            
            // 注册字段类型映射器
            services.AddTransient<SqlServerFieldTypeMapper>();

            // 注册工厂和默认实现
            services.AddTransient<DatabaseAdapterFactory>();
        }
    }
}