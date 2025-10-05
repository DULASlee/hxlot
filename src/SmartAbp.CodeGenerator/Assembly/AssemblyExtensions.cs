using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Modularity;

namespace SmartAbp.CodeGenerator.Assembly
{
    /// <summary>
    /// 装配件扩展方法
    /// </summary>
    public static class AssemblyExtensions
    {
        /// <summary>
        /// 添加装配件服务
        /// </summary>
        public static IServiceCollection AddAssembly<TAssembly>(this IServiceCollection services)
            where TAssembly : class
        {
            services.AddSingleton<TAssembly>();
            return services;
        }

        /// <summary>
        /// 配置装配件选项
        /// </summary>
        public static IServiceCollection ConfigureAssembly<TAssembly>(this IServiceCollection services, Action<AssemblyOptions> configure)
            where TAssembly : class
        {
            services.Configure(configure);
            return services;
        }

        /// <summary>
        /// 获取装配件实例
        /// </summary>
        public static TAssembly GetAssembly<TAssembly>(this IServiceProvider serviceProvider)
            where TAssembly : class
        {
            return serviceProvider.GetService<TAssembly>() ?? 
                   throw new InvalidOperationException($"Assembly {typeof(TAssembly).Name} not registered");
        }

        /// <summary>
        /// 检查装配件是否已注册
        /// </summary>
        public static bool IsAssemblyRegistered<TAssembly>(this IServiceProvider serviceProvider)
            where TAssembly : class
        {
            return serviceProvider.GetService<TAssembly>() != null;
        }
    }

    /// <summary>
    /// 装配件选项
    /// </summary>
    public class AssemblyOptions
    {
        public Dictionary<string, AssemblyConfig> Assemblies { get; set; } = new();

        public AssemblyConfig GetAssemblyConfig(string assemblyName)
        {
            return Assemblies.TryGetValue(assemblyName, out var config) ? config : new AssemblyConfig();
        }
    }

    /// <summary>
    /// 装配件配置
    /// </summary>
    public class AssemblyConfig
    {
        public string Name { get; set; } = string.Empty;
        public bool Enabled { get; set; } = true;
        public string Version { get; set; } = "1.0.0";
        public string TypeName { get; set; } = string.Empty;
        public List<string> Dependencies { get; set; } = new();
        public Dictionary<string, object> Settings { get; set; } = new();
    }



    /// <summary>
    /// 装配件事件类型
    /// </summary>
    public enum AssemblyEventType
    {
        Loaded,
        Unloaded,
        Error,
        ConfigurationChanged,
        HealthStatusChanged,
        Unloading,
        Enabled,
        Disabled,
        Registered,
        Unregistered,
        Loading
    }

    /// <summary>
    /// 装配件事件参数
    /// </summary>
    public class AssemblyEventArgs : EventArgs
    {
        public string AssemblyName { get; }
        public AssemblyEventType EventType { get; }
        public object? Data { get; }
        public DateTime Timestamp { get; }
        public Exception? Error { get; set; }

        public AssemblyEventArgs(string assemblyName, AssemblyEventType eventType, object? data = null)
        {
            AssemblyName = assemblyName ?? throw new ArgumentNullException(nameof(assemblyName));
            EventType = eventType;
            Data = data;
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// 装配件健康状态
    /// </summary>
    public enum AssemblyHealthStatus
    {
        Healthy,
        Unhealthy,
        Degraded,
        Unknown,
        Stopped
    }

    /// <summary>
    /// 装配件健康检查结果
    /// </summary>
    public class AssemblyHealthResult
    {
        public string AssemblyName { get; set; } = string.Empty;
        public AssemblyHealthStatus Status { get; set; }
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Data { get; set; } = new();
        public DateTime CheckTime { get; set; } = DateTime.UtcNow;
    }
}