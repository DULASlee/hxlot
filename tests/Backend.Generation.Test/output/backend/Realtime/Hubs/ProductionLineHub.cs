// ProductionLineHub - SignalR Hub
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace .Realtime.Hubs
{
    public class ProductionLineHub : Hub
    {
        public async Task BroadcastData(object data)
        {
            await Clients.All.SendAsync("ReceiveData", data);
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}