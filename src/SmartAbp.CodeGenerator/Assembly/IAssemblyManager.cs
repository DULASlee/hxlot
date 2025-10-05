using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SmartAbp.CodeGenerator.Assembly
{
    /// <summary>
    /// 装配件管理器接口 - 统一管理所有装配件
    /// </summary>
    public interface IAssemblyManager
    {
        /// <summary>
        /// 初始化装配件
        /// </summary>
        Task InitializeAssembly(string assemblyName);
        
        /// <summary>
        /// 获取装配件实例
        /// </summary>
        T GetAssembly<T>(string assemblyName) where T : class;
        
        /// <summary>
        /// 检查装配件是否已加载
        /// </summary>
        bool IsAssemblyLoaded(string assemblyName);
        
        /// <summary>
        /// 获取装配件依赖关系
        /// </summary>
        IReadOnlyList<string> GetDependencies(string assemblyName);
        
        /// <summary>
        /// 验证装配件配置
        /// </summary>
        Task<AssemblyValidationResult> ValidateAssemblyAsync(string assemblyName);
        
        /// <summary>
        /// 重新加载装配件
        /// </summary>
        Task ReloadAssemblyAsync(string assemblyName);
        
        /// <summary>
        /// 启用/禁用装配件
        /// </summary>
        Task ToggleAssemblyAsync(string assemblyName, bool enabled);
        
        /// <summary>
        /// 获取所有已加载的装配件
        /// </summary>
        IReadOnlyList<string> GetLoadedAssemblies();
        
        /// <summary>
        /// 获取装配件健康状态
        /// </summary>
        Task<AssemblyHealthStatus> GetAssemblyHealthAsync(string assemblyName);
        
        /// <summary>
        /// 装配件事件通知
        /// </summary>
        event EventHandler<AssemblyEventArgs> AssemblyEvent;
    }




}