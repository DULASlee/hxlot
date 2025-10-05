using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EventBus.Local;

namespace SmartAbp.CodeGenerator.Assembly
{
    /// <summary>
    /// 装配件管理器实现
    /// </summary>
    public class AssemblyManager : IAssemblyManager, ISingletonDependency
    {
        private readonly ILogger<AssemblyManager> _logger;
        private readonly ILocalEventBus _eventBus;
        private readonly IServiceProvider _serviceProvider;
        
        private readonly Dictionary<string, IAssembly> _assemblies;
        private readonly Dictionary<string, AssemblyConfig> _assemblyConfigs;
        private readonly Dictionary<string, AssemblyHealth> _assemblyHealth;

        public AssemblyManager(
            ILogger<AssemblyManager> logger,
            ILocalEventBus eventBus,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _eventBus = eventBus;
            _serviceProvider = serviceProvider;
            
            _assemblies = new Dictionary<string, IAssembly>();
            _assemblyConfigs = new Dictionary<string, AssemblyConfig>();
            _assemblyHealth = new Dictionary<string, AssemblyHealth>();
            AssemblyEvent = (sender, args) => { };
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> RegisterAssemblyAsync(AssemblyConfig config)
        {
            if (config == null)
                throw new ArgumentNullException(nameof(config));

            if (string.IsNullOrWhiteSpace(config.Name))
                return AssemblyValidationResult.Failed("装配件名称不能为空");

            if (_assemblyConfigs.ContainsKey(config.Name))
                return AssemblyValidationResult.Failed($"装配件 {config.Name} 已存在");

            // 验证配置
            var validationResult = ValidateAssemblyConfig(config);
            if (!validationResult.IsValid)
                return validationResult;

            try
            {
                _assemblyConfigs[config.Name] = config;
                _assemblyHealth[config.Name] = new AssemblyHealth
                {
                    Status = AssemblyHealthStatus.Unknown,
                    LastCheckTime = DateTime.Now,
                    Message = "装配件已注册"
                };

                await _eventBus.PublishAsync(new AssemblyEventArgs(config.Name, AssemblyEventType.Registered));

                _logger.LogInformation("装配件 {AssemblyName} 注册成功", config.Name);
                
                return AssemblyValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "注册装配件 {AssemblyName} 失败", config.Name);
                return AssemblyValidationResult.Failed($"注册失败: {ex.Message}");
            }
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> UnregisterAssemblyAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 不存在");

            try
            {
                // 如果装配件已加载，先卸载
                if (_assemblies.ContainsKey(assemblyName))
                {
                    await UnloadAssemblyAsync(assemblyName);
                }

                _assemblyConfigs.Remove(assemblyName);
                _assemblyHealth.Remove(assemblyName);

                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Unregistered));

                _logger.LogInformation("装配件 {AssemblyName} 注销成功", assemblyName);
                
                return AssemblyValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "注销装配件 {AssemblyName} 失败", assemblyName);
                return AssemblyValidationResult.Failed($"注销失败: {ex.Message}");
            }
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> LoadAssemblyAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 未注册");

            if (_assemblies.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 已加载");

            var config = _assemblyConfigs[assemblyName];

            try
            {
                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Loading));

                // 创建装配件实例
                var assemblyType = Type.GetType(config.TypeName);
                if (assemblyType == null)
                    return AssemblyValidationResult.Failed($"无法找到装配件类型: {config.TypeName}");

                if (!typeof(IAssembly).IsAssignableFrom(assemblyType))
                    return AssemblyValidationResult.Failed($"类型 {config.TypeName} 必须实现 IAssembly 接口");

                var assembly = (IAssembly)ActivatorUtilities.CreateInstance(_serviceProvider, assemblyType);
                
                // 初始化装配件
                await assembly.InitializeAsync(config);
                
                _assemblies[assemblyName] = assembly;
                _assemblyHealth[assemblyName] = new AssemblyHealth
                {
                    Status = AssemblyHealthStatus.Healthy,
                    LastCheckTime = DateTime.Now,
                    Message = "装配件加载成功"
                };

                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Loaded));

                _logger.LogInformation("装配件 {AssemblyName} 加载成功", assemblyName);
                
                return AssemblyValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "加载装配件 {AssemblyName} 失败", assemblyName);
                
                _assemblyHealth[assemblyName] = new AssemblyHealth
                {
                    Status = AssemblyHealthStatus.Unhealthy,
                    LastCheckTime = DateTime.Now,
                    Message = $"加载失败: {ex.Message}"
                };

                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Error) { Error = ex });

                return AssemblyValidationResult.Failed($"加载失败: {ex.Message}");
            }
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> UnloadAssemblyAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblies.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 未加载");

            try
            {
                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Unloading));

                var assembly = _assemblies[assemblyName];
                await assembly.StopAsync();
                
                _assemblies.Remove(assemblyName);
                _assemblyHealth[assemblyName] = new AssemblyHealth
                {
                    Status = AssemblyHealthStatus.Stopped,
                    LastCheckTime = DateTime.Now,
                    Message = "装配件已卸载"
                };

                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Unloaded));

                _logger.LogInformation("装配件 {AssemblyName} 卸载成功", assemblyName);
                
                return AssemblyValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "卸载装配件 {AssemblyName} 失败", assemblyName);
                
                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Error) { Error = ex });

                return AssemblyValidationResult.Failed($"卸载失败: {ex.Message}");
            }
        }

        /// <inheritdoc />
        public async Task ReloadAssemblyAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                throw new InvalidOperationException($"装配件 {assemblyName} 未注册");

            try
            {
                // 如果已加载，先卸载
                if (_assemblies.ContainsKey(assemblyName))
                {
                    await UnloadAssemblyAsync(assemblyName);
                }

                // 重新加载
                await LoadAssemblyAsync(assemblyName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "重新加载装配件 {AssemblyName} 失败", assemblyName);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> EnableAssemblyAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 未注册");

            var config = _assemblyConfigs[assemblyName];
            if (config.Enabled)
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 已启用");

            try
            {
                config.Enabled = true;
                _assemblyConfigs[assemblyName] = config;

                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Enabled));
                _logger.LogInformation("装配件 {AssemblyName} 已启用", assemblyName);
                
                return AssemblyValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "启用装配件 {AssemblyName} 失败", assemblyName);
                return AssemblyValidationResult.Failed($"启用失败: {ex.Message}");
            }
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> DisableAssemblyAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 未注册");

            var config = _assemblyConfigs[assemblyName];
            if (!config.Enabled)
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 已禁用");

            try
            {
                config.Enabled = false;
                _assemblyConfigs[assemblyName] = config;

                // 如果已加载，先卸载
                if (_assemblies.ContainsKey(assemblyName))
                {
                    await UnloadAssemblyAsync(assemblyName);
                }

                await _eventBus.PublishAsync(new AssemblyEventArgs(assemblyName, AssemblyEventType.Disabled));

                _logger.LogInformation("装配件 {AssemblyName} 已禁用", assemblyName);
                
                return AssemblyValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "禁用装配件 {AssemblyName} 失败", assemblyName);
                return AssemblyValidationResult.Failed($"禁用失败: {ex.Message}");
            }
        }

        /// <inheritdoc />
        public async Task<AssemblyHealth> CheckAssemblyHealthAsync(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
            {
                return new AssemblyHealth
                {
                    Status = AssemblyHealthStatus.Unknown,
                    LastCheckTime = DateTime.Now,
                    Message = $"装配件 {assemblyName} 未注册"
                };
            }

            try
            {
                var health = _assemblyHealth[assemblyName];
                
                // 如果装配件已加载，执行健康检查
                if (_assemblies.ContainsKey(assemblyName))
                {
                    var assembly = _assemblies[assemblyName];
                    var assemblyHealth = await assembly.CheckHealthAsync();
                    
                    health = new AssemblyHealth
                    {
                        Status = assemblyHealth.Status,
                        LastCheckTime = DateTime.Now,
                        Message = assemblyHealth.Message,
                        Details = assemblyHealth.Details
                    };
                    
                    _assemblyHealth[assemblyName] = health;
                }

                return health;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "检查装配件 {AssemblyName} 健康状态失败", assemblyName);
                
                return new AssemblyHealth
                {
                    Status = AssemblyHealthStatus.Unhealthy,
                    LastCheckTime = DateTime.Now,
                    Message = $"健康检查失败: {ex.Message}",
                    Error = ex
                };
            }
        }

        /// <inheritdoc />
        public async Task<SystemHealth> CheckSystemHealthAsync()
        {
            var assemblies = GetAllAssemblyConfigs();
            var healthResults = new Dictionary<string, AssemblyHealth>();
            var totalCount = assemblies.Count;
            var healthyCount = 0;

            foreach (var assembly in assemblies)
            {
                var health = await CheckAssemblyHealthAsync(assembly.Name);
                healthResults[assembly.Name] = health;

                if (health.Status == AssemblyHealthStatus.Healthy)
                {
                    healthyCount++;
                }
            }

            var systemStatus = healthyCount == totalCount ? AssemblyHealthStatus.Healthy :
                              healthyCount > 0 ? AssemblyHealthStatus.Degraded :
                              AssemblyHealthStatus.Unhealthy;

            return new SystemHealth
            {
                Status = systemStatus,
                Message = $"{healthyCount}/{totalCount} 个装配件健康",
                Timestamp = DateTime.Now,
                AssemblyHealth = healthResults,
                Details = new
                {
                    TotalAssemblies = totalCount,
                    HealthyAssemblies = healthyCount,
                    UnhealthyAssemblies = totalCount - healthyCount,
                    HealthPercentage = totalCount > 0 ? (double)healthyCount / totalCount * 100 : 0
                }
            };
        }

        /// <inheritdoc />
        public IReadOnlyList<AssemblyConfig> GetAllAssemblyConfigs()
        {
            return _assemblyConfigs.Values.ToList();
        }

        /// <inheritdoc />
        public IReadOnlyList<IAssembly> GetAllLoadedAssemblies()
        {
            return _assemblies.Values.ToList();
        }

        /// <inheritdoc />
        public AssemblyConfig GetAssemblyConfig(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                throw new InvalidOperationException($"装配件 {assemblyName} 未注册");

            return _assemblyConfigs[assemblyName];
        }

        /// <inheritdoc />
        public IAssembly GetAssembly(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblies.ContainsKey(assemblyName))
                throw new InvalidOperationException($"装配件 {assemblyName} 未加载");

            return _assemblies[assemblyName];
        }

        /// <inheritdoc />
        public bool IsAssemblyLoaded(string assemblyName)
        {
            return _assemblies.ContainsKey(assemblyName);
        }

        /// <inheritdoc />
        public bool IsAssemblyRegistered(string assemblyName)
        {
            return _assemblyConfigs.ContainsKey(assemblyName);
        }

        /// <inheritdoc />
        public DependencyGraph BuildDependencyGraph()
        {
            var graph = new DependencyGraph();
            var assemblies = GetAllAssemblyConfigs();

            foreach (var assembly in assemblies)
            {
                graph.AddNode(assembly.Name, assembly.Dependencies);
            }

            return graph;
        }

        /// <inheritdoc />
        public AssemblyValidationResult ValidateDependencies(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                return AssemblyValidationResult.Failed($"装配件 {assemblyName} 未注册");

            var config = _assemblyConfigs[assemblyName];
            var graph = BuildDependencyGraph();

            // 检查循环依赖
            if (graph.HasCycles(assemblyName))
            {
                return AssemblyValidationResult.Failed($"检测到循环依赖: {assemblyName}");
            }

            // 检查缺失的依赖
            var missingDependencies = config.Dependencies
                .Where(dep => !_assemblyConfigs.ContainsKey(dep))
                .ToList();

            if (missingDependencies.Any())
            {
                return AssemblyValidationResult.Failed($"缺失依赖项: {string.Join(", ", missingDependencies)}");
            }

            return AssemblyValidationResult.Success();
        }

        /// <summary>
        /// 验证装配件配置
        /// </summary>
        private AssemblyValidationResult ValidateAssemblyConfig(AssemblyConfig config)
        {
            if (config == null)
                return AssemblyValidationResult.Failed("配置不能为空");

            if (string.IsNullOrWhiteSpace(config.Name))
                return AssemblyValidationResult.Failed("装配件名称不能为空");

            if (string.IsNullOrWhiteSpace(config.TypeName))
                return AssemblyValidationResult.Failed("装配件类型名称不能为空");

            if (string.IsNullOrWhiteSpace(config.Version))
                return AssemblyValidationResult.Failed("装配件版本不能为空");

            // 验证类型是否存在
            var assemblyType = Type.GetType(config.TypeName);
            if (assemblyType == null)
                return AssemblyValidationResult.Failed($"无法找到类型: {config.TypeName}");

            if (!typeof(IAssembly).IsAssignableFrom(assemblyType))
                return AssemblyValidationResult.Failed($"类型 {config.TypeName} 必须实现 IAssembly 接口");

            return AssemblyValidationResult.Success();
        }

        /// <inheritdoc />
        public void Dispose()
        {
            // 清理资源
            foreach (var assembly in _assemblies.Values)
            {
                try
                {
                    assembly.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "清理装配件资源时发生错误");
                }
            }

            _assemblies.Clear();
            _assemblyConfigs.Clear();
            _assemblyHealth.Clear();
        }

        /// <inheritdoc />
        public async Task InitializeAssembly(string assemblyName)
        {
            await LoadAssemblyAsync(assemblyName);
        }

        /// <inheritdoc />
        public T GetAssembly<T>(string assemblyName) where T : class
        {
            var assembly = GetAssembly(assemblyName);
            return assembly as T ?? throw new InvalidOperationException($"装配件 {assemblyName} 无法转换为类型 {typeof(T).Name}");
        }

        /// <inheritdoc />
        public IReadOnlyList<string> GetDependencies(string assemblyName)
        {
            if (string.IsNullOrWhiteSpace(assemblyName))
                throw new ArgumentException("装配件名称不能为空", nameof(assemblyName));

            if (!_assemblyConfigs.ContainsKey(assemblyName))
                return new List<string>();

            return _assemblyConfigs[assemblyName].Dependencies;
        }

        /// <inheritdoc />
        public async Task<AssemblyValidationResult> ValidateAssemblyAsync(string assemblyName)
        {
            return await Task.FromResult(ValidateDependencies(assemblyName));
        }

        /// <inheritdoc />
        public async Task ToggleAssemblyAsync(string assemblyName, bool enabled)
        {
            if (enabled)
            {
                await EnableAssemblyAsync(assemblyName);
            }
            else
            {
                await DisableAssemblyAsync(assemblyName);
            }
        }

        /// <inheritdoc />
        public IReadOnlyList<string> GetLoadedAssemblies()
        {
            return _assemblies.Keys.ToList();
        }

        /// <inheritdoc />
        public async Task<AssemblyHealthStatus> GetAssemblyHealthAsync(string assemblyName)
        {
            var health = await CheckAssemblyHealthAsync(assemblyName);
            return health.Status;
        }

        /// <inheritdoc />
        public event EventHandler<AssemblyEventArgs> AssemblyEvent;
    }
}