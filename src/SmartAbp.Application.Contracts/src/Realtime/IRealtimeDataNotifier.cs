using System.Threading.Tasks;

namespace SmartAbp.Application.Contracts.Realtime
{
    /// <summary>
    /// 实时数据通知服务的抽象接口，用于解耦Application层和Web层
    /// </summary>
    public interface IRealtimeDataNotifier
    {
        /// <summary>
        /// 推送实时数据到客户端
        /// </summary>
        /// <param name="productionLineCode">生产线代码</param>
        /// <param name="data">要推送的数据对象</param>
        Task PushDataAsync(string productionLineCode, object data);
    }
}
