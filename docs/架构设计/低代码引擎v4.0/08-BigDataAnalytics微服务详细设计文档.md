# BigDataAnalytics微服务详细设计文档 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 微服务名称 | BigDataAnalytics.Service |
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 技术栈 | Hadoop + Spark + Hive + ECharts + .NET 8 |

---


---

## 📖 无缝集成方案说明（⭐ v1.1新增）

本文档为大数据分析微服务的详细技术设计文档。关于客户端SDK的无缝集成方案（6大核心组件 + 3种集成方式），请参阅：

**👉 [08-BigDataAnalytics微服务无缝集成方案.md](./08-BigDataAnalytics微服务无缝集成方案.md)**

**核心亮点**：
- ✅ **零侵入式集成**：一行代码完成大数据分析系统集成
- ✅ **自动数据采集**：业务数据、用户行为、性能指标自动采集
- ✅ **批量处理**：>10,000 事件/秒批量上报
- ✅ **数据清洗**：多阶段数据清洗和脱敏
- ✅ **Hadoop + Spark**：大数据存储和计算
- ✅ **Hive SQL查询**：支持SQL方式查询大数据

**客户端SDK组件（SmartAbp.BigDataAnalytics.Client）**：
1. **AnalyticsDataCollector**：分析数据采集器（业务数据/用户行为/性能指标）
2. **AnalyticsBatchProcessor**：分析批量处理器（批量上报）
3. **UserBehaviorInterceptor**：用户行为拦截器（自动追踪）
4. **DataCleaningPipeline**：数据清洗管道（多阶段清洗）
5. **BigDataAnalyticsMiddleware**：大数据分析中间件（HTTP拦截）
6. **BigDataAnalyticsClient**：HTTP客户端（RESTful API封装）

**3种集成方式**：
- **方式1（推荐）**：`builder.Services.AddBigDataAnalyticsClient(serviceUrl, serviceName)` - 零侵入式
- **方式2（企业级）**：`options` 精细化配置
- **方式3（手动）**：直接使用 `BigDataAnalyticsClient` API

详细的集成代码示例、API文档、架构图，请参阅无缝集成方案文档。

---
## 🎯 1. 系统概述

### 1.1 业务定位

大数据分析微服务提供企业级数据仓库和分析能力：
- 📊 **数据仓库**：基于Hadoop+Hive的企业级数据仓库
- 🔍 **OLAP分析**：多维数据分析和聚合查询
- 🤖 **机器学习**：基于Spark MLlib的预测模型
- 📈 **数据可视化**：ECharts + Grafana实时可视化
- 📋 **BI报表**：自定义报表和数据看板

### 1.2 核心价值

```yaml
业务价值:
  数据驱动: 支持数据驱动决策
  趋势预测: 生产/销售趋势预测
  成本优化: 成本分析和优化建议
  质量分析: 产品质量分析

技术价值:
  PB级存储: Hadoop分布式存储
  高性能: Spark内存计算
  易扩展: 水平扩展支持
  实时分析: 批流一体架构
```

---

## 🏗️ 2. 系统架构设计

### 2.1 数据仓库分层架构

```
┌────────────────────────────────────────────────────────┐
│              数据源层（Data Sources）                    │
├────────────────────────────────────────────────────────┤
│  MES系统  │  ERP系统  │  IoT数据  │  日志数据  │  第三方 │
└────────┬────────┬──────┬─────────┬──────────┬──────────┘
         │        │      │         │          │
         │        │      │         │          │
┌────────▼────────▼──────▼─────────▼──────────▼──────────┐
│           ODS层（操作数据存储 - Operational Data Store）  │
├────────────────────────────────────────────────────────┤
│  原始数据采集 │  数据清洗  │  数据标准化                 │
│  HDFS存储    │  Hive分区表                             │
└────────┬────────┬──────┬─────────┬──────────┬──────────┘
         │        │      │         │          │
┌────────▼────────▼──────▼─────────▼──────────▼──────────┐
│           DWD层（明细数据层 - Data Warehouse Detail）     │
├────────────────────────────────────────────────────────┤
│  事实表  │  维度表  │  一致性维度  │  数据质量检查      │
└────────┬────────┬──────┬─────────┬──────────┬──────────┘
         │        │      │         │          │
┌────────▼────────▼──────▼─────────▼──────────▼──────────┐
│           DWS层（汇总数据层 - Data Warehouse Summary）    │
├────────────────────────────────────────────────────────┤
│  轻度聚合  │  主题汇总  │  多维度分析                    │
└────────┬────────┬──────┬─────────┬──────────┬──────────┘
         │        │      │         │          │
┌────────▼────────▼──────▼─────────▼──────────▼──────────┐
│           ADS层（应用数据层 - Application Data Store）    │
├────────────────────────────────────────────────────────┤
│  BI报表  │  数据看板  │  机器学习模型  │  API接口       │
└────────────────────────────────────────────────────────┘
```

### 2.2 核心技术栈

```yaml
存储层:
  HDFS: 分布式文件系统（10节点集群）
  HBase: NoSQL数据库（实时查询）
  
计算层:
  Spark: 内存计算引擎（批处理+流处理）
  Hive: 数据仓库（SQL查询）
  
ML层:
  Spark MLlib: 机器学习库
  TensorFlow: 深度学习（可选）
  
可视化层:
  ECharts: 前端图表
  Grafana: 实时监控看板
  Superset: BI报表工具
```

---

## 💻 3. 核心功能实现

### 3.1 数据采集ETL

```scala
// Spark ETL作业
object MESDataETL {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("MES Data ETL")
      .enableHiveSupport()
      .getOrCreate()
    
    import spark.implicits._
    
    // 1. 从PostgreSQL读取MES数据
    val mesData = spark.read
      .format("jdbc")
      .option("url", "jdbc:postgresql://mes-db:5432/mes")
      .option("dbtable", "production_orders")
      .option("user", "mes_user")
      .option("password", "mes_pass")
      .load()
    
    // 2. 数据清洗和转换
    val cleanedData = mesData
      .filter($"status".isNotNull)
      .withColumn("partition_date", date_format($"created_time", "yyyyMMdd"))
      .select(
        $"order_no",
        $"product_code",
        $"quantity",
        $"actual_quantity",
        $"status",
        $"start_time",
        $"end_time",
        $"partition_date"
      )
    
    // 3. 写入Hive ODS层
    cleanedData.write
      .mode("append")
      .partitionBy("partition_date")
      .format("orc") // 使用ORC列式存储
      .saveAsTable("ods.production_orders")
    
    spark.stop()
  }
}
```

### 3.2 OLAP多维分析

```csharp
public class OLAPAnalysisService : IOLAPAnalysisService, ITransientDependency
{
    private readonly ISparkJobClient _sparkClient;
    
    public async Task<List<ProductionAnalysisResult>> AnalyzeProductionAsync(AnalysisRequest request)
    {
        // 构建Spark SQL查询
        var sql = $@"
            SELECT 
                product_code,
                DATE_TRUNC('month', start_time) AS month,
                SUM(actual_quantity) AS total_quantity,
                AVG(actual_quantity / quantity) AS yield_rate,
                COUNT(*) AS order_count
            FROM dws.production_summary
            WHERE partition_date BETWEEN '{request.StartDate}' AND '{request.EndDate}'
            GROUP BY product_code, DATE_TRUNC('month', start_time)
            ORDER BY month DESC, total_quantity DESC
        ";
        
        // 提交Spark作业
        var result = await _sparkClient.ExecuteQueryAsync(sql);
        
        return result.Select(r => new ProductionAnalysisResult
        {
            ProductCode = r["product_code"].ToString(),
            Month = DateTime.Parse(r["month"].ToString()),
            TotalQuantity = int.Parse(r["total_quantity"].ToString()),
            YieldRate = decimal.Parse(r["yield_rate"].ToString()),
            OrderCount = int.Parse(r["order_count"].ToString())
        }).ToList();
    }
}
```

### 3.3 机器学习预测

```scala
// Spark MLlib预测模型
object DemandForecastingModel {
  def train(spark: SparkSession): PipelineModel = {
    // 1. 加载历史销售数据
    val data = spark.sql("""
      SELECT 
        product_code,
        month,
        sales_quantity,
        LAG(sales_quantity, 1) OVER (PARTITION BY product_code ORDER BY month) AS prev_month,
        LAG(sales_quantity, 2) OVER (PARTITION BY product_code ORDER BY month) AS prev_2_month,
        LAG(sales_quantity, 3) OVER (PARTITION BY product_code ORDER BY month) AS prev_3_month
      FROM dws.sales_monthly
    """).na.drop()
    
    // 2. 特征工程
    val assembler = new VectorAssembler()
      .setInputCols(Array("prev_month", "prev_2_month", "prev_3_month"))
      .setOutputCol("features")
    
    // 3. 训练随机森林回归模型
    val rf = new RandomForestRegressor()
      .setLabelCol("sales_quantity")
      .setFeaturesCol("features")
      .setNumTrees(100)
    
    // 4. 构建Pipeline
    val pipeline = new Pipeline()
      .setStages(Array(assembler, rf))
    
    // 5. 训练模型
    val model = pipeline.fit(data)
    
    // 6. 保存模型
    model.write.overwrite().save("/models/demand_forecast")
    
    model
  }
  
  def predict(spark: SparkSession, productCode: String): Double = {
    // 加载模型
    val model = PipelineModel.load("/models/demand_forecast")
    
    // 获取最近3个月数据
    val recentData = spark.sql(s"""
      SELECT prev_month, prev_2_month, prev_3_month
      FROM (
        SELECT 
          LAG(sales_quantity, 1) OVER (ORDER BY month) AS prev_month,
          LAG(sales_quantity, 2) OVER (ORDER BY month) AS prev_2_month,
          LAG(sales_quantity, 3) OVER (ORDER BY month) AS prev_3_month,
          ROW_NUMBER() OVER (ORDER BY month DESC) AS rn
        FROM dws.sales_monthly
        WHERE product_code = '$productCode'
      ) t WHERE rn = 1
    """)
    
    // 预测
    val prediction = model.transform(recentData)
    prediction.select("prediction").first().getDouble(0)
  }
}
```

### 3.4 实时数据看板

```csharp
public class DashboardAppService : IDashboardAppService, ITransientDependency
{
    public async Task<DashboardData> GetRealTimeDashboardAsync()
    {
        // 并行查询多个指标
        var tasks = new[]
        {
            GetProductionStatisticsAsync(),
            GetQualityStatisticsAsync(),
            GetInventoryStatisticsAsync(),
            GetSalesStatisticsAsync()
        };
        
        await Task.WhenAll(tasks);
        
        return new DashboardData
        {
            Production = tasks[0].Result,
            Quality = tasks[1].Result,
            Inventory = tasks[2].Result,
            Sales = tasks[3].Result,
            UpdateTime = DateTime.UtcNow
        };
    }
    
    private async Task<ProductionStatistics> GetProductionStatisticsAsync()
    {
        var sql = @"
            SELECT 
                SUM(actual_quantity) AS total_quantity,
                AVG(actual_quantity / quantity * 100) AS avg_yield_rate,
                COUNT(*) AS total_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders
            FROM dws.production_today
        ";
        
        var result = await _sparkClient.ExecuteQueryAsync(sql);
        
        return MapToProductionStatistics(result.FirstOrDefault());
    }
}
```

---

## 📊 4. 数据模型设计

### 4.1 星型模型设计

**事实表 - 生产订单事实表**:
```sql
CREATE TABLE dwd.fact_production_order (
    order_id BIGINT,
    product_key INT,  -- 维度外键
    time_key INT,     -- 时间维度
    workshop_key INT, -- 车间维度
    quantity INT,
    actual_quantity INT,
    yield_rate DECIMAL(5,2),
    duration_hours DECIMAL(8,2),
    status VARCHAR(20),
    partition_date STRING
)
PARTITIONED BY (partition_date)
STORED AS ORC;
```

**维度表 - 产品维度**:
```sql
CREATE TABLE dwd.dim_product (
    product_key INT PRIMARY KEY,
    product_code VARCHAR(50),
    product_name VARCHAR(200),
    category VARCHAR(100),
    specification VARCHAR(500),
    unit_price DECIMAL(10,2)
)
STORED AS ORC;
```

---

## 🚀 5. 性能优化

### 5.1 分区策略

```sql
-- 按日期分区
ALTER TABLE ods.production_orders ADD IF NOT EXISTS 
PARTITION (partition_date='20251019');

-- 分桶优化（Join性能）
CREATE TABLE dws.production_summary (
    order_no STRING,
    product_code STRING,
    total_quantity INT
)
CLUSTERED BY (product_code) INTO 32 BUCKETS
STORED AS ORC;
```

### 5.2 查询优化

```sql
-- 使用物化视图加速查询
CREATE MATERIALIZED VIEW mv_monthly_production AS
SELECT 
    product_code,
    DATE_TRUNC('month', start_time) AS month,
    SUM(actual_quantity) AS total_quantity
FROM dwd.fact_production_order
GROUP BY product_code, DATE_TRUNC('month', start_time);

-- 刷新物化视图
REFRESH MATERIALIZED VIEW mv_monthly_production;
```

---

## ✅ 6. 验收标准

```yaml
功能验收:
  ✅ 数据仓库ETL正常
  ✅ OLAP多维分析正常
  ✅ 机器学习预测正常
  ✅ 实时数据看板正常
  
性能验收:
  ✅ 批处理 ≥1TB/小时
  ✅ 查询响应 <3秒
  ✅ 数据规模 PB级
  ✅ 预测准确率 ≥85%
  
质量验收:
  ✅ 数据质量 ≥99%
  ✅ 文档完整性 100%
```

---

**文档状态**：✅ 已完成
**关联文档**：00-企业级微服务总体架构设计说明书.md

