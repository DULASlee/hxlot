// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLC数据采集后台工作者
// 用途: 模拟PLC数据采集，定时更新生产线和设备的实时数据
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.Realtime;
using SmartAbp.Application.RealtimeData;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;
using MesProductionLine = SmartAbp.Domain.Entities.MES.ProductionLine;
using MesEquipment = SmartAbp.Domain.Entities.MES.Equipment;
using MesSensorData = SmartAbp.Domain.Entities.MES.SensorData;
using SmartAbp.Application.MES.Alarm;


namespace SmartAbp.Application.MES
{
    /// <summary>
    /// PLC数据采集后台工作者
    ///
    /// ✅ 定时从PLC采集数据（模拟）
    /// ✅ 更新生产线KPI指标
    /// ✅ 更新设备实时状态
    /// ✅ 记录传感器历史数据
    /// ✅ 实时评估告警规则并推送告警
    /// </summary>
    public class PLCDataCollectorBackgroundWorker : BackgroundService
    {
        private readonly ILogger<PLCDataCollectorBackgroundWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly Random _random = new Random();
        private const int CollectionIntervalMs = 5000; // 采集间隔5秒

        public PLCDataCollectorBackgroundWorker(
            ILogger<PLCDataCollectorBackgroundWorker> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "[PLCDataCollectorBackgroundWorker] PLC数据采集已启动，采集间隔: {Interval}ms",
                CollectionIntervalMs
            );

            // 等待应用完全启动
            await Task.Delay(3000, stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var startTime = DateTime.UtcNow;

                    // 执行数据采集
                    await CollectPLCDataAsync();

                    var elapsed = (DateTime.UtcNow - startTime).TotalMilliseconds;

                    // 等待下一次采集
                    var delay = Math.Max(0, CollectionIntervalMs - (int)elapsed);
                    await Task.Delay(delay, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("[PLCDataCollectorBackgroundWorker] PLC数据采集已停止");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "[PLCDataCollectorBackgroundWorker] 数据采集循环发生异常"
                    );

                    // 异常后等待1秒再重试
                    await Task.Delay(1000, stoppingToken);
                }
            }
        }

        /// <summary>
        /// 执行PLC数据采集
        /// </summary>
        private async Task CollectPLCDataAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var unitOfWorkManager = scope.ServiceProvider.GetRequiredService<IUnitOfWorkManager>();

                try
                {
                    // 使用工作单元确保事务一致性
                    using (var uow = unitOfWorkManager.Begin(requiresNew: true, isTransactional: true))
                    {
                        var productionLineRepository = scope.ServiceProvider.GetRequiredService<IRepository<MesProductionLine, Guid>>();
                        var equipmentRepository = scope.ServiceProvider.GetRequiredService<IRepository<MesEquipment, Guid>>();
                        var sensorDataRepository = scope.ServiceProvider.GetRequiredService<IRepository<MesSensorData, Guid>>();
                        var alarmNotificationService = scope.ServiceProvider.GetRequiredService<AlarmNotificationService>();
                        var aggregatorService = scope.ServiceProvider.GetRequiredService<RealtimeDataAggregatorService>();
                        var notifier = scope.ServiceProvider.GetRequiredService<IRealtimeDataNotifier>();

                        // 查询所有运行中的生产线
                        var productionLines = await productionLineRepository.GetListAsync(x => x.Status == "running");

                        foreach (var productionLine in productionLines)
                        {
                            // 更新生产线KPI数据
                            await UpdateProductionLineKPI(productionLine, productionLineRepository);

                            // 查询该生产线的设备
                            var equipments = await equipmentRepository.GetListAsync(x => x.ProductionLineId == productionLine.Id);

                            foreach (var equipment in equipments.Where(e => e.Status == "running"))
                            {
                                // 更新设备实时数据
                                await UpdateEquipmentRealtimeData(equipment, equipmentRepository);

                                // 记录传感器数据并评估告警
                                await RecordSensorDataAndEvaluateAlarms(equipment, productionLine.Id, sensorDataRepository, alarmNotificationService);
                            }

                            // ✅ 推送实时数据（通过接口解耦）
                            try
                            {
                                var realtimeData = await aggregatorService.GetCurrentDataAsync(productionLine.Code);
                                if (realtimeData != null)
                                {
                                    await notifier.PushDataAsync(productionLine.Code, realtimeData);

                                    _logger.LogDebug(
                                        "[PLCDataCollectorBackgroundWorker] 已通过通知器推送产线 {ProductionLine} 的实时数据",
                                        productionLine.Code
                                    );
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(
                                    ex,
                                    "[PLCDataCollectorBackgroundWorker] 推送产线 {ProductionLine} 的实时数据失败",
                                    productionLine.Code
                                );
                            }
                        }

                        await uow.CompleteAsync();
                        _logger.LogDebug("[PLCDataCollectorBackgroundWorker] 数据采集完成");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[PLCDataCollectorBackgroundWorker] 数据采集失败");
                }
            }
        }

        /// <summary>
        /// 更新生产线KPI指标
        /// </summary>
        private async Task UpdateProductionLineKPI(
            MesProductionLine productionLine,
            IRepository<MesProductionLine, Guid> repository)
        {
            // 模拟PLC数据采集
            var productionIncrement = _random.Next(1, 10);
            productionLine.TotalProduction += productionIncrement;
            productionLine.DailyProduction += productionIncrement;

            // 计算效率（随机波动）
            productionLine.CurrentEfficiency = Math.Min(100, Math.Max(70, productionLine.CurrentEfficiency + _random.Next(-2, 3)));

            // 计算设备利用率（随机波动）
            productionLine.EquipmentUtilization = Math.Min(100, Math.Max(60, productionLine.EquipmentUtilization + _random.Next(-2, 3)));

            // 计算合格率（随机波动，保持在高位）
            productionLine.QualifiedRate = Math.Min(100, Math.Max(95, productionLine.QualifiedRate + _random.Next(-1, 2)));

            await repository.UpdateAsync(productionLine);

            _logger.LogDebug(
                "[PLCDataCollectorBackgroundWorker] 更新产线 {ProductionLine} KPI: 总产量={TotalProduction}, 效率={Efficiency}%",
                productionLine.Name,
                productionLine.TotalProduction,
                productionLine.CurrentEfficiency
            );
        }

        /// <summary>
        /// 更新设备实时数据
        /// </summary>
        private async Task UpdateEquipmentRealtimeData(
            MesEquipment equipment,
            IRepository<MesEquipment, Guid> repository)
        {
            // 模拟PLC传感器数据采集（更新设备的传感器字段）
            // 注意：Equipment实体可能没有这些字段，这里只是示例
            // 实际应使用SensorData实体存储传感器数据

            await repository.UpdateAsync(equipment);

            _logger.LogDebug(
                "[PLCDataCollectorBackgroundWorker] 更新设备 {Equipment} 状态",
                equipment.Name
            );
        }

        /// <summary>
        /// 记录传感器数据并评估告警
        /// </summary>
        private async Task RecordSensorDataAndEvaluateAlarms(
            MesEquipment equipment,
            Guid productionLineId,
            IRepository<MesSensorData, Guid> repository,
            AlarmNotificationService alarmNotificationService)
        {
            var timestamp = DateTime.UtcNow;

            // 记录多种传感器数据（模拟PLC数据采集）
            var sensorDataList = new List<MesSensorData>
            {
                // 温度传感器
                new MesSensorData(
                    Guid.NewGuid(),
                    "temperature",
                    $"{equipment.Name}-温度",
                    60 + _random.NextDouble() * 20, // 60-80°C
                    "°C",
                    productionLineId,
                    equipment.Id
                )
                {
                    Timestamp = timestamp
                },
                // 压力传感器
                new MesSensorData(
                    Guid.NewGuid(),
                    "pressure",
                    $"{equipment.Name}-压力",
                    5 + _random.NextDouble() * 3, // 5-8 MPa
                    "MPa",
                    productionLineId,
                    equipment.Id
                )
                {
                    Timestamp = timestamp
                },
                // 振动传感器
                new MesSensorData(
                    Guid.NewGuid(),
                    "vibration",
                    $"{equipment.Name}-振动",
                    3 + _random.NextDouble() * 4, // 3-7 mm/s
                    "mm/s",
                    productionLineId,
                    equipment.Id
                )
                {
                    Timestamp = timestamp
                },
                // 功率传感器
                new MesSensorData(
                    Guid.NewGuid(),
                    "power",
                    $"{equipment.Name}-功率",
                    100 + _random.Next(-10, 10), // 90-110 kW
                    "kW",
                    productionLineId,
                    equipment.Id
                )
                {
                    Timestamp = timestamp
                },
                // 能耗传感器
                new MesSensorData(
                    Guid.NewGuid(),
                    "energy",
                    $"{equipment.Name}-能耗",
                    _random.Next(10, 20), // 10-20 kWh
                    "kWh",
                    productionLineId,
                    equipment.Id
                )
                {
                    Timestamp = timestamp
                }
            };

            // 批量插入传感器数据
            await repository.InsertManyAsync(sensorDataList);

            _logger.LogDebug(
                "[PLCDataCollectorBackgroundWorker] 记录设备 {Equipment} 传感器数据: {Count} 条",
                equipment.Name,
                sensorDataList.Count
            );

            // ✅ 评估每条传感器数据的告警规则
            foreach (var sensorData in sensorDataList)
            {
                await alarmNotificationService.EvaluateAndNotifyAsync(sensorData);
            }
        }
    }
}
