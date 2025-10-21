// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLC协议适配器接口
// 用途: 定义统一的PLC通信接口，支持多种协议（OPC UA、Modbus等）
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartAbp.Application.MES.PLC
{
    /// <summary>
    /// PLC协议适配器接口
    /// 
    /// ✅ 统一的PLC通信接口
    /// ✅ 支持多协议（OPC UA、Modbus TCP、S7等）
    /// ✅ 异步数据读取
    /// ✅ 连接状态管理
    /// </summary>
    public interface IPLCAdapter : IDisposable
    {
        /// <summary>
        /// 适配器名称
        /// </summary>
        string Name { get; }

        /// <summary>
        /// 协议类型
        /// </summary>
        PLCProtocolType ProtocolType { get; }

        /// <summary>
        /// 连接状态
        /// </summary>
        bool IsConnected { get; }

        /// <summary>
        /// 连接到PLC
        /// </summary>
        /// <param name="connectionString">连接字符串</param>
        Task ConnectAsync(string connectionString);

        /// <summary>
        /// 断开PLC连接
        /// </summary>
        Task DisconnectAsync();

        /// <summary>
        /// 读取单个数据点
        /// </summary>
        /// <param name="address">数据点地址</param>
        /// <returns>读取的值</returns>
        Task<object> ReadAsync(string address);

        /// <summary>
        /// 读取多个数据点
        /// </summary>
        /// <param name="addresses">数据点地址列表</param>
        /// <returns>地址与值的映射</returns>
        Task<Dictionary<string, object>> ReadMultipleAsync(List<string> addresses);

        /// <summary>
        /// 写入单个数据点
        /// </summary>
        /// <param name="address">数据点地址</param>
        /// <param name="value">要写入的值</param>
        Task WriteAsync(string address, object value);

        /// <summary>
        /// 批量写入数据点
        /// </summary>
        /// <param name="data">地址与值的映射</param>
        Task WriteMultipleAsync(Dictionary<string, object> data);

        /// <summary>
        /// 订阅数据变化（推送模式）
        /// </summary>
        /// <param name="address">数据点地址</param>
        /// <param name="callback">变化回调</param>
        Task SubscribeAsync(string address, Action<object> callback);

        /// <summary>
        /// 取消订阅
        /// </summary>
        /// <param name="address">数据点地址</param>
        Task UnsubscribeAsync(string address);

        /// <summary>
        /// 健康检查
        /// </summary>
        /// <returns>PLC健康状态</returns>
        Task<PLCHealthStatus> HealthCheckAsync();
    }

    /// <summary>
    /// PLC协议类型
    /// </summary>
    public enum PLCProtocolType
    {
        /// <summary>
        /// OPC UA协议
        /// </summary>
        OPCUA,

        /// <summary>
        /// Modbus TCP协议
        /// </summary>
        ModbusTCP,

        /// <summary>
        /// Siemens S7协议
        /// </summary>
        SiemensS7,

        /// <summary>
        /// Ethernet/IP协议
        /// </summary>
        EthernetIP,

        /// <summary>
        /// Profinet协议
        /// </summary>
        Profinet
    }

    /// <summary>
    /// PLC健康状态
    /// </summary>
    public class PLCHealthStatus
    {
        /// <summary>
        /// 是否健康
        /// </summary>
        public bool IsHealthy { get; set; }

        /// <summary>
        /// 响应时间（毫秒）
        /// </summary>
        public long ResponseTimeMs { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// 最后心跳时间
        /// </summary>
        public DateTime LastHeartbeat { get; set; }

        /// <summary>
        /// 连接质量（0-100）
        /// </summary>
        public int ConnectionQuality { get; set; }
    }

    /// <summary>
    /// PLC数据点配置
    /// </summary>
    public class PLCDataPoint
    {
        /// <summary>
        /// 数据点名称
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// PLC地址
        /// </summary>
        public string Address { get; set; } = string.Empty;

        /// <summary>
        /// 数据类型
        /// </summary>
        public PLCDataType DataType { get; set; }

        /// <summary>
        /// 采集间隔（毫秒）
        /// </summary>
        public int SamplingIntervalMs { get; set; } = 1000;

        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// 缩放因子
        /// </summary>
        public double? ScaleFactor { get; set; }

        /// <summary>
        /// 偏移量
        /// </summary>
        public double? Offset { get; set; }
    }

    /// <summary>
    /// PLC数据类型
    /// </summary>
    public enum PLCDataType
    {
        Boolean,
        Int16,
        Int32,
        Int64,
        UInt16,
        UInt32,
        UInt64,
        Float,
        Double,
        String,
        DateTime
    }
}

