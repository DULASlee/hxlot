using System;
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Engine;
using SmartAbp.Permissions.Performance;
using SmartAbp.Permissions.Models;

namespace SmartAbp;

public class SmartAbpApplicationModule
{
    public void ConfigureServices(IServiceCollection services)
    {
        // 注册权限缓存服务
        services.AddSingleton<IPermissionCacheService, RedisPermissionCacheService>();
        services.AddSingleton<IPermissionCachePrewarmService, PermissionCachePrewarmService>();
        services.AddSingleton<IPermissionInheritanceEngine, OptimizedPermissionInheritanceEngine>();
        services.AddSingleton<IPermissionPerformanceMonitor, PermissionPerformanceMonitor>();
        
        // 注册内存缓存
        services.AddMemoryCache();
        
        // 注册缓存选项
        services.Configure<PermissionCacheOptions>(options =>
        {
            options.DefaultExpiration = TimeSpan.FromMinutes(30);
            options.SlidingExpiration = TimeSpan.FromMinutes(15);
            options.MaxRetryAttempts = 3;
            options.RetryDelay = TimeSpan.FromSeconds(1);
            options.EnableCompression = true;
            options.EnableEncryption = true;
        });
    }
}
