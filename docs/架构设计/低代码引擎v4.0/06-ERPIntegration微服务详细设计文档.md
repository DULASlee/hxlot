# ERPIntegration微服务详细设计文档 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 微服务名称 | ERPIntegration.Service |
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 技术栈 | .NET 8 + 金蝶SDK + 用友SDK + Kafka + Polly |

---

## 🎯 1. 系统概述

### 1.1 业务定位

ERP对接微服务专门负责MES系统与主流ERP/财务系统的集成对接，支持：
- 💰 **金蝶云星空**：订单、财务、库存数据同步
- 📊 **用友U8/U9**：采购、销售、生产数据交换
- 📋 **财务审批流程**：费用报销、付款申请审批对接
- 📦 **订单管理流程**：销售订单、生产订单同步
- 🔄 **双向数据同步**：实时或定时数据同步

### 1.2 核心价值

```yaml
业务价值:
  财务一体化: MES生产数据自动转财务数据
  订单协同: 销售订单自动转生产订单
  库存同步: 生产领料自动扣减库存
  审批集成: 费用审批统一管理

技术价值:
  标准接口: 基于官方SDK封装
  数据一致性: 事务性数据同步
  异步解耦: Kafka消息队列
  容错保护: 失败重试和补偿
```

---

## 🏗️ 2. 系统架构设计

### 2.1 分层架构

```
┌────────────────────────────────────────────────────────┐
│              ERP系统层（金蝶/用友/OA）                    │
├────────────────────────────────────────────────────────┤
│  金蝶云星空  │  用友U8/U9  │  OA系统  │  财务系统        │
└────────┬────────────┬────────┬────────┬────────────────┘
         │ (金蝶API)  │(用友API)│(OA API) │
         │            │        │        │
┌────────▼────────────▼────────▼────────▼────────────────┐
│           SDK适配层（ERP SDK Adapters）                  │
├────────────────────────────────────────────────────────┤
│  金蝶SDK   │  用友SDK    │  OA SDK   │  财务SDK          │
│  封装      │  封装       │  封装     │  封装             │
└────────┬────────────┬────────┬────────┬────────────────┘
         │            │        │        │
┌────────▼────────────▼────────▼────────▼────────────────┐
│      应用服务层（ERPIntegration.Application）            │
├────────────────────────────────────────────────────────┤
│  订单同步  │  财务审批  │  库存同步  │  数据映射        │
└────────┬────────────┬────────┬────────┬────────────────┘
         │            │        │        │
┌────────▼────────────▼────────▼────────▼────────────────┐
│       消息队列层（Kafka + Dapr Pub/Sub）                 │
├────────────────────────────────────────────────────────┤
│  同步请求  │  同步响应  │  失败重试  │  死信队列        │
└────────┬────────────┬────────┬────────┬────────────────┘
         │            │        │        │
┌────────▼────────────▼────────▼────────▼────────────────┐
│         领域层（ERPIntegration.Domain）                  │
├────────────────────────────────────────────────────────┤
│  SyncRecord│  OrderMapping│  FinanceApproval│  Inventory│
└────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

**金蝶云星空SDK封装**:
```csharp
public class KingdeeAdapter : IERPAdapter
{
    private readonly IKingdeeClient _kingdeeClient;
    
    public async Task<OrderSyncResult> SyncOrderAsync(MESOrder mesOrder)
    {
        // 1. 数据映射（MES订单 → 金蝶订单）
        var kingdeeOrder = MapToKingdeeOrder(mesOrder);
        
        // 2. 调用金蝶API
        var response = await _kingdeeClient.SaveAsync("SAL_SaleOrder", new
        {
            Model = kingdeeOrder
        });
        
        // 3. 返回结果
        return new OrderSyncResult
        {
            Success = response.Result.ResponseStatus.IsSuccess,
            ERPOrderNo = response.Result.Id,
            Message = response.Result.ResponseStatus.Errors?.FirstOrDefault()?.Message
        };
    }
}
```

**用友U8/U9 SDK封装**:
```csharp
public class YonyouAdapter : IERPAdapter
{
    private readonly IYonyouClient _yonyouClient;
    
    public async Task<FinanceApprovalResult> SubmitApprovalAsync(ExpenseReport report)
    {
        // 1. 构建用友审批单据
        var voucherData = new
        {
            VoucherType = "expense_report",
            FBillNo = report.ReportNo,
            FDate = report.ReportDate,
            FAmount = report.TotalAmount,
            FRemark = report.Remark,
            Details = report.Items.Select(item => new
            {
                FItemName = item.ItemName,
                FAmount = item.Amount,
                FRemark = item.Remark
            })
        };
        
        // 2. 调用用友API
        var response = await _yonyouClient.PostAsync("/api/voucher/save", voucherData);
        
        return new FinanceApprovalResult
        {
            Success = response.IsSuccess,
            ApprovalNo = response.Data?.VoucherNo,
            Message = response.Message
        };
    }
}
```

---

## 💻 3. 核心功能实现

### 3.1 订单同步服务

```csharp
public class OrderSyncService : IOrderSyncService, ITransientDependency
{
    private readonly IERPAdapterFactory _adapterFactory;
    private readonly IOrderMappingRepository _mappingRepository;
    private readonly IDaprClient _daprClient;
    
    [Topic("erp-pubsub", "mes-order-created")]
    public async Task HandleOrderCreatedAsync(MESOrderCreatedEvent @event)
    {
        try
        {
            // 1. 获取ERP适配器
            var erpType = await GetERPTypeAsync(@event.TenantId);
            var adapter = _adapterFactory.GetAdapter(erpType);
            
            // 2. 同步订单到ERP
            var result = await adapter.SyncOrderAsync(@event.Order);
            
            // 3. 保存映射关系
            await _mappingRepository.InsertAsync(new OrderMapping
            {
                MESOrderNo = @event.Order.OrderNo,
                ERPOrderNo = result.ERPOrderNo,
                ERPType = erpType,
                SyncStatus = result.Success ? SyncStatus.Success : SyncStatus.Failed,
                SyncTime = DateTime.UtcNow,
                ErrorMessage = result.Message
            });
            
            // 4. 发布同步结果事件
            await _daprClient.PublishEventAsync("erp-pubsub", "order-sync-completed", new
            {
                OrderNo = @event.Order.OrderNo,
                Success = result.Success,
                ERPOrderNo = result.ERPOrderNo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "订单同步失败: {OrderNo}", @event.Order.OrderNo);
            
            // 发送到重试队列
            await _daprClient.PublishEventAsync("erp-pubsub", "order-sync-retry", @event);
        }
    }
}
```

### 3.2 财务审批服务

```csharp
public class FinanceApprovalService : IFinanceApprovalService, ITransientDependency
{
    public async Task<ApprovalResult> SubmitExpenseReportAsync(ExpenseReportDto dto)
    {
        // 1. 验证报销单
        await ValidateExpenseReportAsync(dto);
        
        // 2. 获取ERP适配器
        var erpType = await GetERPTypeAsync(dto.TenantId);
        var adapter = _adapterFactory.GetAdapter(erpType);
        
        // 3. 提交审批
        var result = await adapter.SubmitApprovalAsync(dto);
        
        // 4. 保存审批记录
        await SaveApprovalRecordAsync(dto, result);
        
        return new ApprovalResult
        {
            Success = result.Success,
            ApprovalNo = result.ApprovalNo,
            ApprovalUrl = BuildApprovalUrlAsync(erpType, result.ApprovalNo),
            Message = result.Message
        };
    }
    
    // 轮询审批状态
    [BackgroundJob(CronExpression = "*/5 * * * *")] // 每5分钟执行
    public async Task PollApprovalStatusAsync()
    {
        var pendingApprovals = await GetPendingApprovalsAsync();
        
        foreach (var approval in pendingApprovals)
        {
            var adapter = _adapterFactory.GetAdapter(approval.ERPType);
            var status = await adapter.QueryApprovalStatusAsync(approval.ApprovalNo);
            
            if (status.IsCompleted)
            {
                await UpdateApprovalStatusAsync(approval.Id, status);
                
                // 发送通知
                await NotifyApprovalResultAsync(approval, status);
            }
        }
    }
}
```

### 3.3 库存同步服务

```csharp
public class InventorySyncService : IInventorySyncService, ITransientDependency
{
    [Topic("erp-pubsub", "material-consumed")]
    public async Task HandleMaterialConsumedAsync(MaterialConsumedEvent @event)
    {
        try
        {
            // 1. 获取ERP适配器
            var erpType = await GetERPTypeAsync(@event.TenantId);
            var adapter = _adapterFactory.GetAdapter(erpType);
            
            // 2. 同步库存扣减到ERP
            var result = await adapter.ReduceInventoryAsync(new
            {
                MaterialNo = @event.MaterialNo,
                Quantity = @event.Quantity,
                WarehouseNo = @event.WarehouseNo,
                WorkOrderNo = @event.WorkOrderNo
            });
            
            // 3. 记录同步结果
            await SaveInventorySyncRecordAsync(@event, result);
            
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "库存同步失败: {MaterialNo}", @event.MaterialNo);
            throw; // 触发重试
        }
    }
}
```

### 3.4 数据映射服务

```csharp
public class DataMappingService : IDataMappingService, ITransientDependency
{
    private readonly IDataMappingConfigRepository _configRepository;
    
    public async Task<TTarget> MapAsync<TSource, TTarget>(TSource source, string mappingName)
    {
        // 1. 获取映射配置
        var config = await _configRepository.GetByNameAsync(mappingName);
        
        // 2. 执行映射
        var target = Activator.CreateInstance<TTarget>();
        
        foreach (var rule in config.Rules)
        {
            var sourceValue = GetPropertyValue(source, rule.SourceField);
            var targetValue = TransformValue(sourceValue, rule.TransformExpression);
            SetPropertyValue(target, rule.TargetField, targetValue);
        }
        
        return target;
    }
    
    private object TransformValue(object value, string expression)
    {
        if (string.IsNullOrEmpty(expression))
            return value;
        
        // 支持简单的表达式，如：value * 100, value.ToString()
        var engine = new ExpressionEngine();
        return engine.Evaluate(expression, new { value });
    }
}
```

---

## 📊 4. 数据模型设计

### 4.1 领域实体

**同步记录实体**:
```csharp
public class SyncRecord : AuditedAggregateRoot<Guid>
{
    public string SourceSystem { get; set; } // MES
    public string TargetSystem { get; set; } // Kingdee/Yonyou
    public string EntityType { get; set; } // Order/Inventory/Finance
    public string SourceEntityNo { get; set; }
    public string TargetEntityNo { get; set; }
    public SyncStatus Status { get; set; }
    public SyncDirection Direction { get; set; } // Push/Pull
    public string RequestData { get; set; }
    public string ResponseData { get; set; }
    public DateTime SyncTime { get; set; }
    public int RetryCount { get; set; }
    public string ErrorMessage { get; set; }
}

public enum SyncStatus
{
    Pending,
    Success,
    Failed,
    Retrying
}
```

**订单映射实体**:
```csharp
public class OrderMapping : AuditedAggregateRoot<Guid>
{
    public string MESOrderNo { get; set; }
    public string ERPOrderNo { get; set; }
    public string ERPType { get; set; } // Kingdee/Yonyou
    public SyncStatus SyncStatus { get; set; }
    public DateTime? SyncTime { get; set; }
    public string ErrorMessage { get; set; }
}
```

**数据映射配置实体**:
```csharp
public class DataMappingConfig : AuditedAggregateRoot<Guid>
{
    public string MappingName { get; set; }
    public string SourceSystem { get; set; }
    public string TargetSystem { get; set; }
    public string EntityType { get; set; }
    public List<MappingRule> Rules { get; set; }
}

public class MappingRule
{
    public string SourceField { get; set; }
    public string TargetField { get; set; }
    public string TransformExpression { get; set; }
    public bool IsRequired { get; set; }
    public string DefaultValue { get; set; }
}
```

---

## 🚀 5. 性能优化

### 5.1 批量同步

```csharp
public async Task BatchSyncOrdersAsync(List<MESOrder> orders)
{
    // 按ERP类型分组
    var groupedOrders = orders.GroupBy(o => GetERPType(o.TenantId));
    
    var tasks = groupedOrders.Select(async group =>
    {
        var adapter = _adapterFactory.GetAdapter(group.Key);
        
        // 批量同步（如果ERP支持）
        if (adapter.SupportsBatchSync)
        {
            await adapter.BatchSyncOrdersAsync(group.ToList());
        }
        else
        {
            // 并发同步（控制并发数）
            await Parallel.ForEachAsync(group, new ParallelOptions { MaxDegreeOfParallelism = 5 },
                async (order, ct) => await adapter.SyncOrderAsync(order));
        }
    });
    
    await Task.WhenAll(tasks);
}
```

### 5.2 重试策略

```csharp
public class ResilientERPClient
{
    private readonly IAsyncPolicy _retryPolicy;
    
    public ResilientERPClient()
    {
        _retryPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TimeoutException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning("第{RetryCount}次重试，等待{Seconds}秒", retryCount, timeSpan.TotalSeconds);
                }
            );
    }
    
    public async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
    {
        return await _retryPolicy.ExecuteAsync(action);
    }
}
```

---

## 🔒 6. 安全设计

### 6.1 ERP认证管理

```csharp
public class ERPCredentialManager : IERPCredentialManager, ISingletonDependency
{
    private readonly IDataEncryptionService _encryptionService;
    private readonly IDistributedCache _cache;
    
    public async Task<ERPCredential> GetCredentialAsync(string erpType, Guid tenantId)
    {
        var cacheKey = $"erp:credential:{erpType}:{tenantId}";
        
        // 从缓存获取
        var cached = await _cache.GetAsync<ERPCredential>(cacheKey);
        if (cached != null)
        {
            return cached;
        }
        
        // 从数据库获取并解密
        var config = await _configRepository.GetAsync(erpType, tenantId);
        var credential = new ERPCredential
        {
            AppKey = _encryptionService.Decrypt(config.EncryptedAppKey),
            AppSecret = _encryptionService.Decrypt(config.EncryptedAppSecret),
            ServerUrl = config.ServerUrl
        };
        
        // 缓存1小时
        await _cache.SetAsync(cacheKey, credential, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        });
        
        return credential;
    }
}
```

---

## 📈 7. 监控告警

### 7.1 关键指标

```yaml
同步指标:
  - 同步成功率（按ERP类型）
  - 同步延迟（P50/P95/P99）
  - 同步失败率
  - 重试次数
  
业务指标:
  - 订单同步量
  - 财务审批量
  - 库存同步量
  - 数据一致性比率
```

### 7.2 告警规则

```yaml
告警级别1（Critical）:
  - 同步成功率 < 90%
  - 连续失败次数 > 10
  - 审批超时（>24小时）
  
告警级别2（Warning）:
  - 同步延迟 > 10分钟
  - 重试队列堆积 > 1000
```

---

## ✅ 8. 验收标准

```yaml
功能验收:
  ✅ 金蝶云星空对接正常
  ✅ 用友U8/U9对接正常
  ✅ 订单双向同步正常
  ✅ 财务审批流程正常
  ✅ 库存实时同步正常
  
性能验收:
  ✅ 同步延迟 <5秒
  ✅ 同步成功率 ≥95%
  ✅ 数据准确性 100%
  
质量验收:
  ✅ 代码质量 ≥95分
  ✅ 单元测试覆盖率 ≥80%
  ✅ 文档完整性 100%
```

---

**文档状态**：✅ 已完成
**关联文档**：00-企业级微服务总体架构设计说明书.md

