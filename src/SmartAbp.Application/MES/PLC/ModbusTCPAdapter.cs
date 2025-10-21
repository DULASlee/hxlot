// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ 真实Modbus TCP协议适配器实现
// 用途: 实现Modbus TCP协议的PLC数据采集
// 依赖: NModbus (NuGet)
// 创建日期: 2025-10-21
// 更新日期: 2025-10-21 (集成真实NModbus库)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using NModbus;

namespace SmartAbp.Application.MES.PLC
{
    /// <summary>
    /// ✅ 真实Modbus TCP协议适配器
    /// 基于NModbus官方库实现
    /// 
    /// 核心功能:
    /// • 异步连接管理
    /// • 读取保持寄存器(HR)、输入寄存器(IR)、线圈(CO)
    /// • 写入保持寄存器(HR)、线圈(CO)
    /// • 批量读取和批量写入
    /// • 健康检查
    /// • 自动释放资源
    /// 
    /// 地址格式:
    /// • HR:1000 - 保持寄存器地址1000
    /// • IR:2000 - 输入寄存器地址2000
    /// • CO:3000 - 线圈地址3000
    /// </summary>
    public class ModbusTCPAdapter : IPLCAdapter, ITransientDependency
    {
        private readonly ILogger<ModbusTCPAdapter> _logger;
        private TcpClient? _tcpClient;
        private IModbusMaster? _modbusFactory;
        private string? _ipAddress;
        private int _port = 502; // Modbus TCP默认端口
        private byte _slaveId = 1; // Modbus从站ID（默认为1）

        public string Name => "Modbus TCP Adapter";
        public PLCProtocolType ProtocolType => PLCProtocolType.ModbusTCP;
        public bool IsConnected => _tcpClient != null && _tcpClient.Connected;

        public ModbusTCPAdapter(ILogger<ModbusTCPAdapter> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 连接到Modbus TCP设备
        /// </summary>
        /// <param name="connectionString">连接字符串，格式: "ip=192.168.1.100;port=502;slaveId=1"</param>
        public async Task ConnectAsync(string connectionString)
        {
            try
            {
                // 解析连接字符串
                var parts = connectionString.Split(';');
                foreach (var part in parts)
                {
                    var kv = part.Split('=');
                    if (kv.Length == 2)
                    {
                        var key = kv[0].Trim().ToLower();
                        var value = kv[1].Trim();

                        switch (key)
                        {
                            case "ip":
                                _ipAddress = value;
                                break;
                            case "port":
                                _port = int.Parse(value);
                                break;
                            case "slaveid":
                                _slaveId = byte.Parse(value);
                                break;
                        }
                    }
                }

                if (string.IsNullOrEmpty(_ipAddress))
                {
                    throw new ArgumentException("连接字符串中未指定IP地址");
                }

                _logger.LogInformation("🔌 [ModbusTCPAdapter] 正在连接到Modbus TCP设备: {IP}:{Port}, SlaveId={SlaveId}", _ipAddress, _port, _slaveId);

                // 创建TCP客户端连接
                _tcpClient = new TcpClient();
                await _tcpClient.ConnectAsync(_ipAddress, _port);

                // 创建Modbus主站
                var factory = new ModbusFactory();
                _modbusFactory = factory.CreateMaster(_tcpClient);

                _logger.LogInformation("✅ [ModbusTCPAdapter] 成功连接到Modbus TCP设备: {IP}:{Port}", _ipAddress, _port);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 连接Modbus TCP设备失败: {Error}", ex.Message);
                _tcpClient?.Dispose();
                _tcpClient = null;
                throw;
            }
        }

        public async Task DisconnectAsync()
        {
            try
            {
                if (_tcpClient != null)
                {
                    _logger.LogInformation("🔌 [ModbusTCPAdapter] 正在断开Modbus TCP连接...");
                    _modbusFactory?.Dispose();
                    _tcpClient.Close();
                    _tcpClient.Dispose();
                    _tcpClient = null;
                    _modbusFactory = null;
                    _logger.LogInformation("✅ [ModbusTCPAdapter] Modbus TCP连接已断开");
                }
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 断开Modbus TCP连接时发生错误: {Error}", ex.Message);
            }
        }

        public async Task<object> ReadAsync(string address)
        {
            if (!IsConnected)
                throw new InvalidOperationException("[ModbusTCPAdapter] 未连接到Modbus TCP设备");

            try
            {
                var (registerType, registerAddress) = ParseAddress(address);
                _logger.LogDebug("📖 [ModbusTCPAdapter] 读取Modbus寄存器 {Address}", address);

                switch (registerType)
                {
                    case "HR": // 保持寄存器 (Holding Registers)
                        var hrValues = await _modbusFactory!.ReadHoldingRegistersAsync(_slaveId, registerAddress, 1);
                        return hrValues[0];

                    case "IR": // 输入寄存器 (Input Registers)
                        var irValues = await _modbusFactory!.ReadInputRegistersAsync(_slaveId, registerAddress, 1);
                        return irValues[0];

                    case "CO": // 线圈 (Coils)
                        var coValues = await _modbusFactory!.ReadCoilsAsync(_slaveId, registerAddress, 1);
                        return coValues[0];

                    default:
                        throw new ArgumentException($"不支持的寄存器类型: {registerType}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 读取Modbus寄存器 {Address} 失败: {Error}", address, ex.Message);
                throw;
            }
        }

        public async Task<Dictionary<string, object>> ReadMultipleAsync(List<string> addresses)
        {
            if (!IsConnected)
                throw new InvalidOperationException("[ModbusTCPAdapter] 未连接到Modbus TCP设备");

            try
            {
                _logger.LogDebug("📖 [ModbusTCPAdapter] 批量读取 {Count} 个Modbus寄存器", addresses.Count);

                var data = new Dictionary<string, object>();

                // 按寄存器类型分组
                var hrAddresses = new List<(string fullAddress, ushort address)>();
                var irAddresses = new List<(string fullAddress, ushort address)>();
                var coAddresses = new List<(string fullAddress, ushort address)>();

                foreach (var addr in addresses)
                {
                    var (type, regAddr) = ParseAddress(addr);
                    switch (type)
                    {
                        case "HR":
                            hrAddresses.Add((addr, regAddr));
                            break;
                        case "IR":
                            irAddresses.Add((addr, regAddr));
                            break;
                        case "CO":
                            coAddresses.Add((addr, regAddr));
                            break;
                    }
                }

                // 批量读取保持寄存器
                if (hrAddresses.Count > 0)
                {
                    // 简化实现：逐个读取（生产环境建议优化为按连续地址批量读取）
                    foreach (var (fullAddress, address) in hrAddresses)
                    {
                        var values = await _modbusFactory!.ReadHoldingRegistersAsync(_slaveId, address, 1);
                        data[fullAddress] = values[0];
                    }
                }

                // 批量读取输入寄存器
                if (irAddresses.Count > 0)
                {
                    foreach (var (fullAddress, address) in irAddresses)
                    {
                        var values = await _modbusFactory!.ReadInputRegistersAsync(_slaveId, address, 1);
                        data[fullAddress] = values[0];
                    }
                }

                // 批量读取线圈
                if (coAddresses.Count > 0)
                {
                    foreach (var (fullAddress, address) in coAddresses)
                    {
                        var values = await _modbusFactory!.ReadCoilsAsync(_slaveId, address, 1);
                        data[fullAddress] = values[0];
                    }
                }

                _logger.LogDebug("✅ [ModbusTCPAdapter] 批量读取完成，成功读取 {Count} 个寄存器", data.Count);
                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 批量读取Modbus寄存器失败: {Error}", ex.Message);
                throw;
            }
        }

        public async Task WriteAsync(string address, object value)
        {
            if (!IsConnected)
                throw new InvalidOperationException("[ModbusTCPAdapter] 未连接到Modbus TCP设备");

            try
            {
                var (registerType, registerAddress) = ParseAddress(address);
                _logger.LogDebug("✍️ [ModbusTCPAdapter] 写入Modbus寄存器 {Address}: {Value}", address, value);

                switch (registerType)
                {
                    case "HR": // 保持寄存器
                        await _modbusFactory!.WriteSingleRegisterAsync(_slaveId, registerAddress, Convert.ToUInt16(value));
                        break;

                    case "CO": // 线圈
                        await _modbusFactory!.WriteSingleCoilAsync(_slaveId, registerAddress, Convert.ToBoolean(value));
                        break;

                    default:
                        throw new ArgumentException($"不支持写入的寄存器类型: {registerType}。只支持HR和CO。");
                }

                _logger.LogInformation("✅ [ModbusTCPAdapter] 写入Modbus寄存器 {Address}: {Value}", address, value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 写入Modbus寄存器 {Address} 失败: {Error}", address, ex.Message);
                throw;
            }
        }

        public async Task WriteMultipleAsync(Dictionary<string, object> data)
        {
            if (!IsConnected)
                throw new InvalidOperationException("[ModbusTCPAdapter] 未连接到Modbus TCP设备");

            try
            {
                _logger.LogDebug("✍️ [ModbusTCPAdapter] 批量写入 {Count} 个Modbus寄存器", data.Count);

                int successCount = 0;
                foreach (var kvp in data)
                {
                    try
                    {
                        await WriteAsync(kvp.Key, kvp.Value);
                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("⚠️ [ModbusTCPAdapter] 写入寄存器 {Address} 失败: {Error}", kvp.Key, ex.Message);
                    }
                }

                _logger.LogInformation("✅ [ModbusTCPAdapter] 批量写入完成，成功 {Success}/{Total} 个", successCount, data.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 批量写入Modbus寄存器失败: {Error}", ex.Message);
                throw;
            }
        }

        public async Task SubscribeAsync(string address, Action<object> callback)
        {
            _logger.LogWarning("📡 [ModbusTCPAdapter] Modbus TCP不支持原生订阅机制，请使用轮询方式。");
            await Task.CompletedTask;
        }

        public async Task UnsubscribeAsync(string address)
        {
            _logger.LogWarning("📡 [ModbusTCPAdapter] Modbus TCP不支持原生订阅机制。");
            await Task.CompletedTask;
        }

        public async Task<PLCHealthStatus> HealthCheckAsync()
        {
            try
            {
                if (!IsConnected)
                {
                    return new PLCHealthStatus
                    {
                        IsHealthy = false,
                        ErrorMessage = "Modbus TCP未连接",
                        ConnectionQuality = 0,
                        ResponseTimeMs = 0,
                        LastHeartbeat = DateTime.UtcNow
                    };
                }

                // 尝试读取一个寄存器来验证连接（读取第一个保持寄存器）
                var startTime = DateTime.UtcNow;
                try
                {
                    await _modbusFactory!.ReadHoldingRegistersAsync(_slaveId, 0, 1);
                    var responseTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

                    return await Task.FromResult(new PLCHealthStatus
                    {
                        IsHealthy = true,
                        ResponseTimeMs = (long)responseTime,
                        LastHeartbeat = DateTime.UtcNow,
                        ConnectionQuality = responseTime < 100 ? 100 : (responseTime < 500 ? 80 : 50)
                    });
                }
                catch
                {
                    return new PLCHealthStatus
                    {
                        IsHealthy = false,
                        ErrorMessage = "健康检查读取测试失败",
                        ConnectionQuality = 0,
                        ResponseTimeMs = 0,
                        LastHeartbeat = DateTime.UtcNow
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [ModbusTCPAdapter] 健康检查失败: {Error}", ex.Message);
                return new PLCHealthStatus
                {
                    IsHealthy = false,
                    ErrorMessage = ex.Message,
                    ConnectionQuality = 0,
                    ResponseTimeMs = 0,
                    LastHeartbeat = DateTime.UtcNow
                };
            }
        }

        public void Dispose()
        {
            DisconnectAsync().GetAwaiter().GetResult();
        }

        /// <summary>
        /// 解析Modbus地址
        /// </summary>
        /// <param name="address">地址字符串，格式: "HR:1000"</param>
        /// <returns>寄存器类型和地址</returns>
        private (string registerType, ushort registerAddress) ParseAddress(string address)
        {
            var parts = address.Split(':');
            if (parts.Length != 2)
            {
                throw new ArgumentException($"无效的Modbus地址格式: {address}。正确格式: HR:1000, IR:2000, CO:3000");
            }

            var registerType = parts[0].ToUpper();
            if (!ushort.TryParse(parts[1], out ushort registerAddress))
            {
                throw new ArgumentException($"无效的寄存器地址: {parts[1]}");
            }

            return (registerType, registerAddress);
        }
    }
}
