// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 产线实时数据推送Hub（SignalR）
// 用于数字大屏实时数据推送
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.RealtimeData;

namespace SmartAbp.Web.Hubs
{
    /// <summary>
    /// 产线实时数据推送Hub
    /// 
    /// ✅ 支持多产线订阅
    /// ✅ 自动管理连接生命周期
    /// ✅ 线程安全的订阅管理
    /// ✅ 实时数据推送
    /// </summary>
    public class ProductionLineHub : Hub<IProductionLineClient>
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 依赖注入
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private readonly ILogger<ProductionLineHub> _logger;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 静态连接管理（线程安全）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 用户连接映射（用户ID → 连接ID列表）
        /// </summary>
        private static readonly ConcurrentDictionary<string, HashSet<string>>
            UserConnections = new();

        /// <summary>
        /// 产线订阅映射（产线ID → 连接ID列表）
        /// </summary>
        private static readonly ConcurrentDictionary<string, HashSet<string>>
            ProductionLineSubscriptions = new();

        /// <summary>
        /// 订阅锁（保证HashSet线程安全）
        /// </summary>
        private static readonly object SubscriptionLock = new();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 构造函数
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public ProductionLineHub(ILogger<ProductionLineHub> logger)
        {
            _logger = logger;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 连接生命周期管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 连接建立时调用
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.Identity?.Name ?? "Anonymous";
            var connectionId = Context.ConnectionId;

            // 记录连接
            lock (SubscriptionLock)
            {
                UserConnections.AddOrUpdate(
                    userId,
                    new HashSet<string> { connectionId },
                    (key, set) =>
                    {
                        set.Add(connectionId);
                        return set;
                    }
                );
            }

            _logger.LogInformation(
                "[ProductionLineHub] 用户 {UserId} 连接成功，连接ID: {ConnectionId}",
                userId,
                connectionId
            );

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// 连接断开时调用
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.Identity?.Name ?? "Anonymous";
            var connectionId = Context.ConnectionId;

            // 移除用户连接记录
            lock (SubscriptionLock)
            {
                if (UserConnections.TryGetValue(userId, out var connections))
                {
                    connections.Remove(connectionId);
                    if (connections.Count == 0)
                    {
                        UserConnections.TryRemove(userId, out _);
                    }
                }

                // 移除所有订阅
                foreach (var (productionLineId, subscribers) in ProductionLineSubscriptions)
                {
                    subscribers.Remove(connectionId);
                    if (subscribers.Count == 0)
                    {
                        ProductionLineSubscriptions.TryRemove(productionLineId, out _);
                    }
                }
            }

            _logger.LogInformation(
                "[ProductionLineHub] 用户 {UserId} 断开连接，连接ID: {ConnectionId}，异常: {Exception}",
                userId,
                connectionId,
                exception?.Message ?? "无"
            );

            await base.OnDisconnectedAsync(exception);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 订阅管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 订阅产线实时数据
        /// </summary>
        /// <param name="productionLineId">产线ID</param>
        public async Task SubscribeProductionLine(string productionLineId)
        {
            var connectionId = Context.ConnectionId;

            lock (SubscriptionLock)
            {
                ProductionLineSubscriptions.AddOrUpdate(
                    productionLineId,
                    new HashSet<string> { connectionId },
                    (key, set) =>
                    {
                        set.Add(connectionId);
                        return set;
                    }
                );
            }

            _logger.LogInformation(
                "[ProductionLineHub] 连接 {ConnectionId} 订阅产线 {ProductionLineId}",
                connectionId,
                productionLineId
            );

            // TODO: 立即推送当前数据
            // var currentData = await _aggregatorService.GetCurrentDataAsync(productionLineId);
            // await Clients.Caller.ReceiveProductionLineData(currentData);
            
            await Task.CompletedTask;
        }

        /// <summary>
        /// 取消订阅产线实时数据
        /// </summary>
        /// <param name="productionLineId">产线ID</param>
        public Task UnsubscribeProductionLine(string productionLineId)
        {
            var connectionId = Context.ConnectionId;

            lock (SubscriptionLock)
            {
                if (ProductionLineSubscriptions.TryGetValue(productionLineId, out var subscribers))
                {
                    subscribers.Remove(connectionId);
                    if (subscribers.Count == 0)
                    {
                        ProductionLineSubscriptions.TryRemove(productionLineId, out _);
                    }
                }
            }

            _logger.LogInformation(
                "[ProductionLineHub] 连接 {ConnectionId} 取消订阅产线 {ProductionLineId}",
                connectionId,
                productionLineId
            );

            return Task.CompletedTask;
        }

        /// <summary>
        /// 获取当前订阅的产线列表
        /// </summary>
        public Task<List<string>> GetSubscribedProductionLines()
        {
            var connectionId = Context.ConnectionId;
            var subscribedLines = new List<string>();

            lock (SubscriptionLock)
            {
                foreach (var (productionLineId, subscribers) in ProductionLineSubscriptions)
                {
                    if (subscribers.Contains(connectionId))
                    {
                        subscribedLines.Add(productionLineId);
                    }
                }
            }

            return Task.FromResult(subscribedLines);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 静态方法：后台服务推送数据
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 推送数据到订阅者（由后台服务调用）
        /// </summary>
        /// <param name="hubContext">Hub上下文</param>
        /// <param name="productionLineId">产线ID</param>
        /// <param name="data">实时数据</param>
        public static async Task PushDataToSubscribers<T>(
            IHubContext<ProductionLineHub, IProductionLineClient> hubContext,
            string productionLineId,
            T data)
        {
            HashSet<string> subscribers;

            lock (SubscriptionLock)
            {
                if (!ProductionLineSubscriptions.TryGetValue(productionLineId, out subscribers))
                {
                    return; // 没有订阅者
                }

                // 复制订阅者列表（避免推送过程中列表被修改）
                subscribers = new HashSet<string>(subscribers);
            }

            // 推送到所有订阅者
            foreach (var connectionId in subscribers)
            {
                await hubContext.Clients.Client(connectionId)
                    .ReceiveProductionLineData(data);
            }
        }

        /// <summary>
        /// 推送告警到订阅者
        /// </summary>
        /// <param name="hubContext">Hub上下文</param>
        /// <param name="productionLineId">产线ID</param>
        /// <param name="alert">告警信息</param>
        public static async Task PushAlertToSubscribers<T>(
            IHubContext<ProductionLineHub, IProductionLineClient> hubContext,
            string productionLineId,
            T alert)
        {
            HashSet<string> subscribers;

            lock (SubscriptionLock)
            {
                if (!ProductionLineSubscriptions.TryGetValue(productionLineId, out subscribers))
                {
                    return; // 没有订阅者
                }

                // 复制订阅者列表
                subscribers = new HashSet<string>(subscribers);
            }

            // 推送到所有订阅者
            foreach (var connectionId in subscribers)
            {
                await hubContext.Clients.Client(connectionId)
                    .ReceiveAlert(alert);
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 诊断方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取在线用户数
        /// </summary>
        public static int GetOnlineUserCount()
        {
            return UserConnections.Count;
        }

        /// <summary>
        /// 获取活跃连接数
        /// </summary>
        public static int GetActiveConnectionCount()
        {
            return UserConnections.Values.Sum(set => set.Count);
        }

        /// <summary>
        /// 获取订阅统计
        /// </summary>
        public static Dictionary<string, int> GetSubscriptionStats()
        {
            var stats = new Dictionary<string, int>();

            lock (SubscriptionLock)
            {
                foreach (var (productionLineId, subscribers) in ProductionLineSubscriptions)
                {
                    stats[productionLineId] = subscribers.Count;
                }
            }

            return stats;
        }
    }
}

