using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Assembly
{
    /// <summary>
    /// 装配件接口 - 所有装配件必须实现此接口
    /// </summary>
    public interface IAssembly : IDisposable
    {
        /// <summary>
        /// 装配件名称
        /// </summary>
        string Name { get; }

        /// <summary>
        /// 装配件版本
        /// </summary>
        string Version { get; }

        /// <summary>
        /// 装配件描述
        /// </summary>
        string Description { get; }

        /// <summary>
        /// 是否已初始化
        /// </summary>
        bool IsInitialized { get; }

        /// <summary>
        /// 是否已启动
        /// </summary>
        bool IsStarted { get; }

        /// <summary>
        /// 初始化装配件
        /// </summary>
        Task InitializeAsync(AssemblyConfig config);

        /// <summary>
        /// 启动装配件
        /// </summary>
        Task StartAsync();

        /// <summary>
        /// 停止装配件
        /// </summary>
        Task StopAsync();

        /// <summary>
        /// 检查健康状态
        /// </summary>
        Task<AssemblyHealth> CheckHealthAsync();

        /// <summary>
        /// 获取装配件配置
        /// </summary>
        AssemblyConfig GetConfig();

        /// <summary>
        /// 验证装配件
        /// </summary>
        Task<AssemblyValidationResult> ValidateAsync();
    }
}