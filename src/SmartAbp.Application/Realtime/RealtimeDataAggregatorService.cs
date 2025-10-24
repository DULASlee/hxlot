using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using SmartAbp.Application.Contracts.Realtime;
using MesProductionLine = SmartAbp.Domain.Entities.MES.ProductionLine;
using MesEquipment = SmartAbp.Domain.Entities.MES.Equipment;
using MesSensorData = SmartAbp.Domain.Entities.MES.SensorData;

namespace SmartAbp.Application.Realtime
{
    /// <summary>
    /// 实时数据聚合服务
    /// 用途：聚合ProductionLine、Equipment、SensorData，生成Dashboard所需的实时数据
    /// 符合铁律4：后端持久化（真实数据库查询）
    /// </summary>
    public class RealtimeDataAggregatorService : ApplicationService
    {
        private readonly IRepository<MesProductionLine, Guid> _productionLineRepository;
        private readonly IRepository<MesEquipment, Guid> _equipmentRepository;
        private readonly IRepository<MesSensorData, Guid> _sensorDataRepository;
        private readonly ILogger<RealtimeDataAggregatorService> _logger;

        public RealtimeDataAggregatorService(
            IRepository<MesProductionLine, Guid> productionLineRepository,
            IRepository<MesEquipment, Guid> equipmentRepository,
            IRepository<MesSensorData, Guid> sensorDataRepository,
            ILogger<RealtimeDataAggregatorService> logger)
        {
            _productionLineRepository = productionLineRepository;
            _equipmentRepository = equipmentRepository;
            _sensorDataRepository = sensorDataRepository;
            _logger = logger;
        }

        /// <summary>
        /// 获取生产线当前实时数据
        /// </summary>
        public async Task<ProductionLineRealtimeData> GetCurrentDataAsync(string productionLineCode)
        {
            _logger.LogInformation(
                "[RealtimeDataAggregatorService] 开始聚合生产线 {ProductionLineCode} 的实时数据",
                productionLineCode
            );

            // 1. 查询生产线基本信息
            var productionLine = await _productionLineRepository
                .FirstOrDefaultAsync(x => x.Code == productionLineCode);

            if (productionLine == null)
            {
                _logger.LogWarning(
                    "[RealtimeDataAggregatorService] 生产线 {ProductionLineCode} 不存在",
                    productionLineCode
                );
                return null;
            }

            // 2. 查询该生产线的所有设备
            var equipments = await _equipmentRepository
                .GetListAsync(x => x.ProductionLineId == productionLine.Id);

            _logger.LogInformation(
                "[RealtimeDataAggregatorService] 生产线 {ProductionLineCode} 有 {Count} 个设备",
                productionLineCode,
                equipments.Count
            );

            // 3. 查询最近10分钟的传感器数据
            var tenMinutesAgo = DateTime.UtcNow.AddMinutes(-10);
            var sensorData = await _sensorDataRepository
                .GetListAsync(x =>
                    x.ProductionLineId == productionLine.Id &&
                    x.Timestamp >= tenMinutesAgo);

            _logger.LogInformation(
                "[RealtimeDataAggregatorService] 生产线 {ProductionLineCode} 最近10分钟有 {Count} 条传感器数据",
                productionLineCode,
                sensorData.Count
            );

            // 4. 聚合数据
            var realtimeData = new ProductionLineRealtimeData
            {
                ProductionLineId = productionLine.Code,
                ProductionLineName = productionLine.Name,
                TotalProduction = productionLine.TotalProduction,
                DailyProduction = productionLine.DailyProduction,
                CurrentEfficiency = productionLine.CurrentEfficiency,
                EquipmentUtilization = productionLine.EquipmentUtilization,
                QualifiedRate = productionLine.QualifiedRate,

                // 5. 设备列表
                Equipments = equipments.Select(e => new EquipmentRealtimeData
                {
                    Id = e.Id,
                    Name = e.Name,
                    Code = e.Code,
                    Status = e.Status,
                    HealthStatus = e.HealthStatus,
                    Temperature = e.Temperature,
                    Pressure = e.Pressure,
                    Vibration = e.Vibration,
                    Power = e.Power,
                    OEE = e.OEE
                }).ToList(),

                // 6. 趋势数据（基于传感器数据）
                TemperatureTrendData = BuildTemperatureTrend(sensorData),
                PressureTrendData = BuildPressureTrend(sensorData),
                VibrationTrendData = BuildVibrationTrend(sensorData),
                PowerTrendData = BuildPowerTrend(sensorData),
                EnergyTrendData = BuildEnergyTrend(sensorData),

                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation(
                "[RealtimeDataAggregatorService] 生产线 {ProductionLineCode} 实时数据聚合完成",
                productionLineCode
            );

            return realtimeData;
        }

        // ══════════════════════════════════════════════════════
        // 趋势数据构建方法
        // ══════════════════════════════════════════════════════

        private TrendData BuildTemperatureTrend(System.Collections.Generic.List<MesSensorData> sensorData)
        {
            var temperatureData = sensorData
                .Where(x => x.SensorType == "temperature")
                .OrderBy(x => x.Timestamp)
                .ToList();

            return new TrendData
            {
                TimeLabels = temperatureData.Select(x => x.Timestamp.ToString("HH:mm")).ToList(),
                Values = temperatureData.Select(x => x.Value).ToList()
            };
        }

        private TrendData BuildPressureTrend(System.Collections.Generic.List<MesSensorData> sensorData)
        {
            var pressureData = sensorData
                .Where(x => x.SensorType == "pressure")
                .OrderBy(x => x.Timestamp)
                .ToList();

            return new TrendData
            {
                TimeLabels = pressureData.Select(x => x.Timestamp.ToString("HH:mm")).ToList(),
                Values = pressureData.Select(x => x.Value).ToList()
            };
        }

        private TrendData BuildVibrationTrend(System.Collections.Generic.List<MesSensorData> sensorData)
        {
            var vibrationData = sensorData
                .Where(x => x.SensorType == "vibration")
                .OrderBy(x => x.Timestamp)
                .ToList();

            return new TrendData
            {
                TimeLabels = vibrationData.Select(x => x.Timestamp.ToString("HH:mm")).ToList(),
                Values = vibrationData.Select(x => x.Value).ToList()
            };
        }

        private TrendData BuildPowerTrend(System.Collections.Generic.List<MesSensorData> sensorData)
        {
            var powerData = sensorData
                .Where(x => x.SensorType == "power")
                .OrderBy(x => x.Timestamp)
                .ToList();

            return new TrendData
            {
                TimeLabels = powerData.Select(x => x.Timestamp.ToString("HH:mm")).ToList(),
                Values = powerData.Select(x => x.Value).ToList()
            };
        }

        private TrendData BuildEnergyTrend(System.Collections.Generic.List<MesSensorData> sensorData)
        {
            var energyData = sensorData
                .Where(x => x.SensorType == "energy")
                .OrderBy(x => x.Timestamp)
                .ToList();

            return new TrendData
            {
                TimeLabels = energyData.Select(x => x.Timestamp.ToString("HH:mm")).ToList(),
                Values = energyData.Select(x => x.Value).ToList()
            };
        }
    }
}

