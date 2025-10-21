// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SignalR客户端接口（产线实时数据推送）
// 定义服务端可以调用的客户端方法
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System.Threading.Tasks;

namespace SmartAbp.Web.Hubs
{
    /// <summary>
    /// 产线实时数据客户端接口
    /// 
    /// ✅ 强类型Hub接口
    /// ✅ 定义服务端可以调用的客户端方法
    /// ✅ 支持实时数据推送和告警推送
    /// </summary>
    public interface IProductionLineClient
    {
        /// <summary>
        /// 接收产线实时数据
        /// </summary>
        /// <param name="data">实时数据（泛型，支持任意数据类型）</param>
        Task ReceiveProductionLineData<T>(T data);

        /// <summary>
        /// 接收告警信息
        /// </summary>
        /// <param name="alert">告警数据（泛型，支持任意告警类型）</param>
        Task ReceiveAlert<T>(T alert);

        /// <summary>
        /// 接收连接状态变更
        /// </summary>
        /// <param name="status">连接状态</param>
        Task ReceiveConnectionStatus(string status);

        /// <summary>
        /// 接收错误信息
        /// </summary>
        /// <param name="error">错误信息</param>
        Task ReceiveError(string error);
    }
}

