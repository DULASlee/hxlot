// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MES生产线监控系统测试数据种子
// 用途: 创建初始测试数据（生产线、设备、传感器数据）
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Seeders
{
    /// <summary>
    /// MES测试数据种子
    /// </summary>
    public class MESDataSeeder : IDataSeedContributor, ITransientDependency
    {
        private readonly IRepository<ProductionLine, Guid> _productionLineRepository;
        private readonly IRepository<Equipment, Guid> _equipmentRepository;
        private readonly IRepository<SensorData, Guid> _sensorDataRepository;
        private readonly ILogger<MESDataSeeder> _logger;

        public MESDataSeeder(
            IRepository<ProductionLine, Guid> productionLineRepository,
            IRepository<Equipment, Guid> equipmentRepository,
            IRepository<SensorData, Guid> sensorDataRepository,
            ILogger<MESDataSeeder> logger)
        {
            _productionLineRepository = productionLineRepository;
            _equipmentRepository = equipmentRepository;
            _sensorDataRepository = sensorDataRepository;
            _logger = logger;
        }

        [UnitOfWork]
        public virtual async Task SeedAsync(DataSeedContext context)
        {
            try
            {
                // 检查是否已有数据
                var existingLines = await _productionLineRepository.GetCountAsync();
                if (existingLines > 0)
                {
                    _logger.LogInformation("[MESDataSeeder] ✅ MES测试数据已存在，跳过种子数据创建。");
                    return;
                }

                _logger.LogInformation("[MESDataSeeder] 开始创建MES测试数据...");

                // ══════════════════════════════════════════════════════
                // 创建生产线
                // ══════════════════════════════════════════════════════

                var productionLine1 = new ProductionLine(
                    Guid.Parse("00000000-0000-0000-0000-000000000001"),
                    "智能生产线A",
                    "PL-001",
                    "智能装配生产线，负责主要产品的组装", // description
                    "车间A-1区", // location
                    "Assembly", // type
                    350 // dailyTarget
                )
                {
                    Shift = "白班",
                    Supervisor = "张主管",
                    WorkMode = "Auto",
                    IsEnabled = true,
                    Status = "running",
                    
                    // 初始KPI数据
                    TotalProduction = 1250,
                    CurrentEfficiency = 87.5,
                    EquipmentUtilization = 92.3,
                    QualifiedRate = 98.7,
                    DailyProduction = 320
                };

                var productionLine2 = new ProductionLine(
                    Guid.Parse("00000000-0000-0000-0000-000000000002"),
                    "智能生产线B",
                    "PL-002",
                    "智能包装生产线，负责产品包装", // description
                    "车间A-2区", // location
                    "Packaging", // type
                    300 // dailyTarget
                )
                {
                    Shift = "白班",
                    Supervisor = "李主管",
                    WorkMode = "Auto",
                    IsEnabled = true,
                    Status = "running",
                    
                    TotalProduction = 980,
                    CurrentEfficiency = 91.2,
                    EquipmentUtilization = 88.5,
                    QualifiedRate = 99.1,
                    DailyProduction = 280
                };

                await _productionLineRepository.InsertAsync(productionLine1, autoSave: false);
                await _productionLineRepository.InsertAsync(productionLine2, autoSave: false);

                _logger.LogInformation("[MESDataSeeder] ✅ 创建2条生产线记录。");

                // ══════════════════════════════════════════════════════
                // 创建设备
                // ══════════════════════════════════════════════════════

                var equipment1 = new Equipment(
                    Guid.Parse("00000000-0000-0000-0000-000000000101"),
                    "机械手臂-01",
                    "EQ-001",
                    "Robot",
                    productionLine1.Id
                )
                {
                    Description = "六轴机械手臂，负责装配",
                    Manufacturer = "ABB",
                    Model = "IRB-6700",
                    SerialNumber = "SN-20241001",
                    Location = "工位1",
                    PLCAddress = "192.168.1.101",
                    MaintenanceResponsible = "王工",
                    IsEnabled = true,
                    Status = "running",
                    HealthStatus = "healthy"
                };

                var equipment2 = new Equipment(
                    Guid.Parse("00000000-0000-0000-0000-000000000102"),
                    "传送带-01",
                    "EQ-002",
                    "Conveyor",
                    productionLine1.Id
                )
                {
                    Description = "智能传送带系统",
                    Manufacturer = "SIEMENS",
                    Model = "CB-2000",
                    SerialNumber = "SN-20241002",
                    Location = "工位2",
                    PLCAddress = "192.168.1.102",
                    MaintenanceResponsible = "王工",
                    IsEnabled = true,
                    Status = "running",
                    HealthStatus = "healthy"
                };

                var equipment3 = new Equipment(
                    Guid.Parse("00000000-0000-0000-0000-000000000103"),
                    "检测设备-01",
                    "EQ-003",
                    "Vision",
                    productionLine1.Id
                )
                {
                    Description = "视觉检测系统",
                    Manufacturer = "KEYENCE",
                    Model = "CV-X450",
                    SerialNumber = "SN-20241003",
                    Location = "工位3",
                    PLCAddress = "192.168.1.103",
                    MaintenanceResponsible = "李工",
                    IsEnabled = true,
                    Status = "running",
                    HealthStatus = "healthy"
                };

                var equipment4 = new Equipment(
                    Guid.Parse("00000000-0000-0000-0000-000000000201"),
                    "包装机-01",
                    "EQ-201",
                    "Packing",
                    productionLine2.Id
                )
                {
                    Description = "自动包装机",
                    Manufacturer = "BOSCH",
                    Model = "SVB-3200",
                    SerialNumber = "SN-20241201",
                    Location = "包装区-1",
                    PLCAddress = "192.168.1.201",
                    MaintenanceResponsible = "赵工",
                    IsEnabled = true,
                    Status = "running",
                    HealthStatus = "healthy"
                };

                await _equipmentRepository.InsertAsync(equipment1, autoSave: false);
                await _equipmentRepository.InsertAsync(equipment2, autoSave: false);
                await _equipmentRepository.InsertAsync(equipment3, autoSave: false);
                await _equipmentRepository.InsertAsync(equipment4, autoSave: false);

                _logger.LogInformation("[MESDataSeeder] ✅ 创建4台设备记录。");

                // ══════════════════════════════════════════════════════
                // 创建传感器历史数据（模拟最近1小时的数据）
                // ══════════════════════════════════════════════════════

                var random = new Random();
                var now = DateTime.UtcNow;
                var sensorDataList = new System.Collections.Generic.List<SensorData>();

                // 为生产线1创建传感器数据（每5分钟一条，共12条）
                for (int i = 0; i < 12; i++)
                {
                    var timestamp = now.AddMinutes(-5 * i);

                    // 温度传感器数据
                    sensorDataList.Add(new SensorData(
                        Guid.NewGuid(),
                        "temperature",
                        "生产线A-温度",
                        60 + random.NextDouble() * 20, // 60-80°C
                        "°C",
                        productionLine1.Id,
                        equipment1.Id
                    )
                    {
                        Quality = "good",
                        Timestamp = timestamp
                    });

                    // 压力传感器数据
                    sensorDataList.Add(new SensorData(
                        Guid.NewGuid(),
                        "pressure",
                        "生产线A-压力",
                        5 + random.NextDouble() * 3, // 5-8 MPa
                        "MPa",
                        productionLine1.Id,
                        equipment1.Id
                    )
                    {
                        Quality = "good",
                        Timestamp = timestamp
                    });

                    // 振动传感器数据
                    sensorDataList.Add(new SensorData(
                        Guid.NewGuid(),
                        "vibration",
                        "生产线A-振动",
                        3 + random.NextDouble() * 4, // 3-7 mm/s
                        "mm/s",
                        productionLine1.Id,
                        equipment1.Id
                    )
                    {
                        Quality = "good",
                        Timestamp = timestamp
                    });

                    // 功率传感器数据
                    sensorDataList.Add(new SensorData(
                        Guid.NewGuid(),
                        "power",
                        "生产线A-功率",
                        100 + random.Next(-10, 10), // 90-110 kW
                        "kW",
                        productionLine1.Id,
                        null
                    )
                    {
                        Quality = "good",
                        Timestamp = timestamp
                    });

                    // 能耗传感器数据
                    sensorDataList.Add(new SensorData(
                        Guid.NewGuid(),
                        "energy",
                        "生产线A-累计能耗",
                        500 + random.Next(-50, 50), // 450-550 kWh
                        "kWh",
                        productionLine1.Id,
                        null
                    )
                    {
                        Quality = "good",
                        Timestamp = timestamp
                    });
                }

                await _sensorDataRepository.InsertManyAsync(sensorDataList, autoSave: false);

                _logger.LogInformation("[MESDataSeeder] ✅ 创建{Count}条传感器数据记录。", sensorDataList.Count);

                // 保存所有更改
                await _productionLineRepository.GetDbContext().SaveChangesAsync();

                _logger.LogInformation("[MESDataSeeder] ✅ MES测试数据创建完成！");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MESDataSeeder] ❌ MES测试数据创建失败！");
                throw;
            }
        }
    }
}

