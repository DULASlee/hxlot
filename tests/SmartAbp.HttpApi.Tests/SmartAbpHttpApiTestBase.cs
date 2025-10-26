using System.Net.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp;
using SmartAbp;
using Volo.Abp.Modularity;

namespace SmartAbp.HttpApi.Tests
{
    /// <summary>
    /// HTTP API测试基类
    /// </summary>
    public abstract class SmartAbpHttpApiTestBase : SmartAbpTestBase<SmartAbpHttpApiTestModule>
    {
        private readonly WebApplicationFactory<SmartAbpHttpApiTestModule> _factory;

        protected SmartAbpHttpApiTestBase()
        {
            _factory = new WebApplicationFactory<SmartAbpHttpApiTestModule>()
                .WithWebHostBuilder(builder =>
                {
                    builder.ConfigureServices(services =>
                    {
                        // 添加测试服务配置
                    });
                });
        }

        protected HttpClient GetHttpClient()
        {
            return _factory.CreateClient();
        }

        protected T GetRequiredService<T>()
        {
            return ServiceProvider.GetRequiredService<T>();
        }
    }
}
