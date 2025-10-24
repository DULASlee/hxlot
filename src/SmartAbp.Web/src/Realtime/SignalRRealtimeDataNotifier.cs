using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using SmartAbp.Application.Contracts.Realtime;
using SmartAbp.Web.Hubs;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Web.Realtime
{
    /// <summary>
    /// 使用SignalR实现实时数据通知
    /// </summary>
    [Dependency(ServiceLifetime.Transient)]
    public class SignalRRealtimeDataNotifier : IRealtimeDataNotifier
    {
        private readonly IHubContext<ProductionLineHub, IProductionLineClient> _hubContext;

        public SignalRRealtimeDataNotifier(IHubContext<ProductionLineHub, IProductionLineClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task PushDataAsync(string productionLineCode, object data)
        {
            await ProductionLineHub.PushDataToSubscribers(_hubContext, productionLineCode, data);
        }
    }
}
