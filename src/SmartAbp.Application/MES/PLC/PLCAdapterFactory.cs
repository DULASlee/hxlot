// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLC适配器工厂
// 用途: 根据协议类型创建相应的PLC适配器实例
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.MES.PLC
{
    /// <summary>
    /// PLC适配器工厂
    /// 
    /// ✅ 策略模式：根据协议类型动态创建适配器
    /// ✅ 扩展性：新增协议只需添加新适配器实现
    /// ✅ 依赖注入：完全支持ABP DI
    /// </summary>
    public class PLCAdapterFactory : ITransientDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PLCAdapterFactory> _logger;

        public PLCAdapterFactory(
            IServiceProvider serviceProvider,
            ILogger<PLCAdapterFactory> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        /// <summary>
        /// 创建PLC适配器
        /// </summary>
        /// <param name="protocolType">协议类型</param>
        /// <returns>PLC适配器实例</returns>
        public IPLCAdapter CreateAdapter(PLCProtocolType protocolType)
        {
            _logger.LogInformation("[PLCAdapterFactory] 创建{ProtocolType}协议适配器...", protocolType);

            return protocolType switch
            {
                PLCProtocolType.OPCUA => CreateOPCUAAdapter(),
                PLCProtocolType.ModbusTCP => CreateModbusTCPAdapter(),
                PLCProtocolType.SiemensS7 => CreateSiemensS7Adapter(),
                PLCProtocolType.EthernetIP => CreateEthernetIPAdapter(),
                PLCProtocolType.Profinet => CreateProfinetAdapter(),
                _ => throw new NotSupportedException($"不支持的PLC协议类型: {protocolType}")
            };
        }

        /// <summary>
        /// 创建OPC UA适配器
        /// </summary>
        private IPLCAdapter CreateOPCUAAdapter()
        {
            // 从DI容器获取OPC UA适配器
            var adapter = _serviceProvider.GetService(typeof(OPCUAAdapter)) as IPLCAdapter;
            
            if (adapter != null)
            {
                return adapter;
            }

            _logger.LogWarning("[PLCAdapterFactory] OPC UA适配器未注册，使用模拟适配器。");
            return new SimulatedPLCAdapter("OPCUA-Simulator", PLCProtocolType.OPCUA);
        }

        /// <summary>
        /// 创建Modbus TCP适配器
        /// </summary>
        private IPLCAdapter CreateModbusTCPAdapter()
        {
            var adapter = _serviceProvider.GetService(typeof(ModbusTCPAdapter)) as IPLCAdapter;
            
            if (adapter != null)
            {
                return adapter;
            }

            _logger.LogWarning("[PLCAdapterFactory] Modbus TCP适配器未注册，使用模拟适配器。");
            return new SimulatedPLCAdapter("ModbusTCP-Simulator", PLCProtocolType.ModbusTCP);
        }

        /// <summary>
        /// 创建Siemens S7适配器
        /// </summary>
        private IPLCAdapter CreateSiemensS7Adapter()
        {
            _logger.LogWarning("[PLCAdapterFactory] Siemens S7适配器未实现，使用模拟适配器。");
            return new SimulatedPLCAdapter("S7-Simulator", PLCProtocolType.SiemensS7);
        }

        /// <summary>
        /// 创建Ethernet/IP适配器
        /// </summary>
        private IPLCAdapter CreateEthernetIPAdapter()
        {
            _logger.LogWarning("[PLCAdapterFactory] Ethernet/IP适配器未实现，使用模拟适配器。");
            return new SimulatedPLCAdapter("EthernetIP-Simulator", PLCProtocolType.EthernetIP);
        }

        /// <summary>
        /// 创建Profinet适配器
        /// </summary>
        private IPLCAdapter CreateProfinetAdapter()
        {
            _logger.LogWarning("[PLCAdapterFactory] Profinet适配器未实现，使用模拟适配器。");
            return new SimulatedPLCAdapter("Profinet-Simulator", PLCProtocolType.Profinet);
        }
    }

    /// <summary>
    /// 模拟PLC适配器（用于测试和开发）
    /// </summary>
    public class SimulatedPLCAdapter : IPLCAdapter
    {
        private readonly Random _random = new Random();
        private bool _isConnected;

        public string Name { get; }
        public PLCProtocolType ProtocolType { get; }
        public bool IsConnected => _isConnected;

        public SimulatedPLCAdapter(string name, PLCProtocolType protocolType)
        {
            Name = name;
            ProtocolType = protocolType;
        }

        public Task ConnectAsync(string connectionString)
        {
            _isConnected = true;
            return Task.CompletedTask;
        }

        public Task DisconnectAsync()
        {
            _isConnected = false;
            return Task.CompletedTask;
        }

        public Task<object> ReadAsync(string address)
        {
            // 模拟读取数据
            return Task.FromResult<object>(_random.NextDouble() * 100);
        }

        public Task<System.Collections.Generic.Dictionary<string, object>> ReadMultipleAsync(System.Collections.Generic.List<string> addresses)
        {
            var result = new System.Collections.Generic.Dictionary<string, object>();
            foreach (var address in addresses)
            {
                result[address] = _random.NextDouble() * 100;
            }
            return Task.FromResult(result);
        }

        public Task WriteAsync(string address, object value)
        {
            return Task.CompletedTask;
        }

        public Task WriteMultipleAsync(System.Collections.Generic.Dictionary<string, object> data)
        {
            return Task.CompletedTask;
        }

        public Task SubscribeAsync(string address, Action<object> callback)
        {
            return Task.CompletedTask;
        }

        public Task UnsubscribeAsync(string address)
        {
            return Task.CompletedTask;
        }

        public Task<PLCHealthStatus> HealthCheckAsync()
        {
            return Task.FromResult(new PLCHealthStatus
            {
                IsHealthy = _isConnected,
                ResponseTimeMs = 50,
                LastHeartbeat = DateTime.UtcNow,
                ConnectionQuality = _isConnected ? 100 : 0
            });
        }

        public void Dispose()
        {
            _isConnected = false;
        }
    }
}

