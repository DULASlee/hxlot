# ErpOaIntegration微服务无缝集成方案 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 负责人 | SmartABP架构团队 |
| 优先级 | P1（高优先级）|
| 客户端SDK | SmartAbp.ErpOaIntegration.Client |

---

## 🎯 1. 系统概述

**核心价值**：
- **多ERP系统支持**：金蝶云星空、用友、SAP、Oracle EBS
- **审批流程集成**：财务审批、采购审批、订单审批
- **订单数据同步**：销售订单、采购订单、生产订单
- **组织架构同步**：部门、员工、角色权限
- **财务数据对接**：应收应付、成本核算

**支持的ERP/OA系统**：
- **金蝶云星空**：K/3 Cloud、金蝶EAS
- **用友**：U8、NC、YonSuite
- **钉钉OA**：审批、考勤、通讯录
- **企业微信**：通讯录、审批、消息通知

---

## 🏗️ 2. 6大核心组件

### 组件1：ErpDataCollector（ERP数据采集器）

```csharp
/// <summary>
/// ERP数据采集器
/// 支持多种ERP系统数据采集
/// </summary>
public class ErpDataCollector
{
    private readonly Dictionary<ErpType, IErpConnector> _connectors;
    
    public ErpDataCollector()
    {
        _connectors = new Dictionary<ErpType, IErpConnector>
        {
            { ErpType.Kingdee, new KingdeeConnector() },
            { ErpType.Yonyou, new YonyouConnector() },
            { ErpType.SAP, new SapConnector() },
            { ErpType.OracleEBS, new OracleEbsConnector() }
        };
    }
    
    /// <summary>
    /// 采集订单数据
    /// </summary>
    public async Task<List<OrderData>> CollectOrdersAsync(
        ErpType erpType,
        DateTime startDate,
        DateTime endDate)
    {
        if (!_connectors.TryGetValue(erpType, out var connector))
        {
            throw new NotSupportedException($"不支持的ERP类型: {erpType}");
        }
        
        return await connector.GetOrdersAsync(startDate, endDate);
    }
    
    /// <summary>
    /// 采集客户数据
    /// </summary>
    public async Task<List<CustomerData>> CollectCustomersAsync(ErpType erpType)
    {
        if (!_connectors.TryGetValue(erpType, out var connector))
        {
            throw new NotSupportedException($"不支持的ERP类型: {erpType}");
        }
        
        return await connector.GetCustomersAsync();
    }
}

/// <summary>
/// ERP连接器接口
/// </summary>
public interface IErpConnector
{
    Task<List<OrderData>> GetOrdersAsync(DateTime startDate, DateTime endDate);
    Task<List<CustomerData>> GetCustomersAsync();
    Task<List<ProductData>> GetProductsAsync();
    Task<bool> CreateOrderAsync(OrderData order);
    Task<bool> UpdateOrderStatusAsync(string orderNo, OrderStatus status);
}

/// <summary>
/// 金蝶云星空连接器
/// </summary>
public class KingdeeConnector : IErpConnector
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _appId;
    private readonly string _appSecret;
    
    public async Task<List<OrderData>> GetOrdersAsync(DateTime startDate, DateTime endDate)
    {
        // 1. 登录获取token
        var token = await LoginAsync();
        
        // 2. 查询订单数据
        var request = new
        {
            FormId = "SAL_SaleOrder",
            FieldKeys = "FBillNo,FDate,FCustId,FAmount",
            FilterString = $"FDate>='{startDate:yyyy-MM-dd}' and FDate<='{endDate:yyyy-MM-dd}'"
        };
        
        var response = await _httpClient.PostAsJsonAsync(
            $"{_apiUrl}/api/k3cloud/execute",
            new { data = request },
            headers: new Dictionary<string, string> { { "Authorization", $"Bearer {token}" } }
        );
        
        // 3. 解析响应
        var result = await response.Content.ReadFromJsonAsync<KingdeeResponse>();
        
        // 4. 转换为标准格式
        return ConvertToOrderData(result);
    }
    
    private async Task<string> LoginAsync()
    {
        // 金蝶云星空登录逻辑
        var loginRequest = new
        {
            acct_id = _appId,
            username = "admin",
            password = _appSecret,
            lcid = 2052
        };
        
        var response = await _httpClient.PostAsJsonAsync($"{_apiUrl}/api/k3cloud/login", loginRequest);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        
        return result.Token;
    }
}
```

### 组件2：OrderSyncProcessor（订单同步处理器）

```csharp
/// <summary>
/// 订单同步处理器
/// 双向同步SmartAbp订单与ERP订单
/// </summary>
public class OrderSyncProcessor : BackgroundService
{
    private readonly ErpDataCollector _erpCollector;
    private readonly IRepository<Order, Guid> _orderRepository;
    private readonly ILogger<OrderSyncProcessor> _logger;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // 1. SmartAbp订单 → ERP订单（每5分钟同步一次）
                await SyncSmartAbpToErpAsync();
                
                // 2. ERP订单 → SmartAbp订单（每10分钟同步一次）
                await SyncErpToSmartAbpAsync();
                
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "订单同步失败");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
    
    /// <summary>
    /// SmartAbp订单同步到ERP
    /// </summary>
    private async Task SyncSmartAbpToErpAsync()
    {
        // 查询需要同步的订单（状态=已提交，未同步）
        var orders = await _orderRepository.GetListAsync(
            o => o.Status == OrderStatus.Submitted && !o.IsSyncedToErp
        );
        
        foreach (var order in orders)
        {
            try
            {
                // 映射为ERP订单格式
                var erpOrder = MapToErpOrder(order);
                
                // 调用ERP API创建订单
                var success = await _erpCollector.CreateOrderAsync(ErpType.Kingdee, erpOrder);
                
                if (success)
                {
                    // 更新同步状态
                    order.IsSyncedToErp = true;
                    order.ErpOrderNo = erpOrder.OrderNo;
                    await _orderRepository.UpdateAsync(order);
                    
                    _logger.LogInformation($"订单已同步到ERP: {order.OrderNumber}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"订单同步失败: {order.OrderNumber}");
            }
        }
    }
    
    /// <summary>
    /// ERP订单同步到SmartAbp
    /// </summary>
    private async Task SyncErpToSmartAbpAsync()
    {
        // 查询最近24小时的ERP订单
        var startDate = DateTime.Now.AddDays(-1);
        var endDate = DateTime.Now;
        
        var erpOrders = await _erpCollector.CollectOrdersAsync(
            ErpType.Kingdee,
            startDate,
            endDate
        );
        
        foreach (var erpOrder in erpOrders)
        {
            try
            {
                // 检查订单是否已存在
                var existingOrder = await _orderRepository.FirstOrDefaultAsync(
                    o => o.ErpOrderNo == erpOrder.OrderNo
                );
                
                if (existingOrder == null)
                {
                    // 创建新订单
                    var newOrder = MapToSmartAbpOrder(erpOrder);
                    await _orderRepository.InsertAsync(newOrder);
                    
                    _logger.LogInformation($"ERP订单已同步: {erpOrder.OrderNo}");
                }
                else
                {
                    // 更新订单状态
                    existingOrder.Status = erpOrder.Status;
                    await _orderRepository.UpdateAsync(existingOrder);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"ERP订单同步失败: {erpOrder.OrderNo}");
            }
        }
    }
}
```

### 组件3：ApprovalFlowInterceptor（审批流程拦截器）

```csharp
/// <summary>
/// 审批流程拦截器
/// 自动拦截需要审批的操作，提交到ERP/OA审批流程
/// </summary>
public class ApprovalFlowInterceptor : AbpInterceptor
{
    private readonly ApprovalFlowManager _approvalManager;
    
    public override async Task InterceptAsync(IAbpMethodInvocation invocation)
    {
        // 获取方法上的[RequireApproval]特性
        var requireApprovalAttribute = invocation.Method
            .GetCustomAttribute<RequireApprovalAttribute>();
        
        if (requireApprovalAttribute != null)
        {
            // 获取当前操作的数据
            var data = invocation.Arguments.FirstOrDefault();
            
            // 提交审批流程
            var approvalId = await _approvalManager.SubmitApprovalAsync(
                requireApprovalAttribute.ApprovalType,
                data
            );
            
            // 等待审批结果（异步，不阻塞）
            _ = WaitForApprovalResultAsync(approvalId, invocation);
            
            // 返回"待审批"状态
            throw new BusinessException($"操作已提交审批，审批ID: {approvalId}");
        }
        
        await invocation.ProceedAsync();
    }
    
    private async Task WaitForApprovalResultAsync(
        Guid approvalId,
        IAbpMethodInvocation invocation)
    {
        // 等待审批结果
        var result = await _approvalManager.WaitForApprovalResultAsync(approvalId);
        
        if (result.IsApproved)
        {
            // 审批通过，继续执行原方法
            await invocation.ProceedAsync();
        }
        else
        {
            // 审批拒绝，记录日志
            _logger.LogWarning($"审批被拒绝: {approvalId}, 原因: {result.RejectReason}");
        }
    }
}

/// <summary>
/// 需要审批特性
/// </summary>
[AttributeUsage(AttributeTargets.Method)]
public class RequireApprovalAttribute : Attribute
{
    public ApprovalType ApprovalType { get; set; }
    
    public RequireApprovalAttribute(ApprovalType approvalType)
    {
        ApprovalType = approvalType;
    }
}

/// <summary>
/// 示例：创建采购订单需要财务审批
/// </summary>
public class PurchaseOrderAppService : ApplicationService
{
    [RequireApproval(ApprovalType.Financial)]
    public async Task<PurchaseOrder> CreatePurchaseOrderAsync(CreatePurchaseOrderInput input)
    {
        // 创建采购订单逻辑
        var purchaseOrder = new PurchaseOrder { ... };
        return purchaseOrder;
    }
}
```

### 组件4：OrganizationSyncService（组织架构同步服务）

```csharp
/// <summary>
/// 组织架构同步服务
/// 同步ERP/OA的组织架构到SmartAbp
/// </summary>
public class OrganizationSyncService
{
    private readonly IRepository<Department, Guid> _departmentRepository;
    private readonly IRepository<Employee, Guid> _employeeRepository;
    
    /// <summary>
    /// 同步组织架构
    /// </summary>
    public async Task SyncOrganizationAsync(ErpType erpType)
    {
        // 1. 获取ERP组织架构
        var erpDepartments = await GetErpDepartmentsAsync(erpType);
        var erpEmployees = await GetErpEmployeesAsync(erpType);
        
        // 2. 同步部门
        foreach (var erpDept in erpDepartments)
        {
            var existingDept = await _departmentRepository.FirstOrDefaultAsync(
                d => d.ErpDeptCode == erpDept.Code
            );
            
            if (existingDept == null)
            {
                // 创建新部门
                var newDept = new Department
                {
                    Name = erpDept.Name,
                    ErpDeptCode = erpDept.Code,
                    ParentId = FindParentDeptId(erpDept.ParentCode)
                };
                await _departmentRepository.InsertAsync(newDept);
            }
            else
            {
                // 更新部门信息
                existingDept.Name = erpDept.Name;
                await _departmentRepository.UpdateAsync(existingDept);
            }
        }
        
        // 3. 同步员工
        foreach (var erpEmp in erpEmployees)
        {
            var existingEmp = await _employeeRepository.FirstOrDefaultAsync(
                e => e.ErpEmployeeCode == erpEmp.Code
            );
            
            if (existingEmp == null)
            {
                // 创建新员工
                var newEmp = new Employee
                {
                    Name = erpEmp.Name,
                    ErpEmployeeCode = erpEmp.Code,
                    DepartmentId = FindDeptId(erpEmp.DeptCode),
                    Position = erpEmp.Position
                };
                await _employeeRepository.InsertAsync(newEmp);
            }
            else
            {
                // 更新员工信息
                existingEmp.Name = erpEmp.Name;
                existingEmp.Position = erpEmp.Position;
                await _employeeRepository.UpdateAsync(existingEmp);
            }
        }
    }
}
```

### 组件5：ErpOaIntegrationMiddleware（中间件）

```csharp
/// <summary>
/// ERP/OA集成中间件
/// 自动拦截ERP/OA回调请求
/// </summary>
public class ErpOaIntegrationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApprovalCallbackHandler _callbackHandler;
    
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/api/erp-callbacks"))
        {
            // 提取ERP类型
            var pathSegments = context.Request.Path.Value!.Split('/');
            if (pathSegments.Length >= 4)
            {
                var erpType = pathSegments[3]; // /api/erp-callbacks/{erpType}
                
                // 处理回调
                var response = await _callbackHandler.HandleCallbackAsync(erpType, context.Request);
                
                context.Response.StatusCode = response.Success ? 200 : 400;
                await context.Response.WriteAsJsonAsync(response);
                return;
            }
        }
        
        await _next(context);
    }
}
```

### 组件6：ErpOaIntegrationClient（HTTP客户端）

```csharp
/// <summary>
/// ErpOaIntegration HTTP客户端
/// </summary>
public class ErpOaIntegrationClient
{
    private readonly HttpClient _httpClient;
    
    /// <summary>
    /// 提交审批流程
    /// </summary>
    public async Task<Guid> SubmitApprovalAsync(
        ApprovalType approvalType,
        object data)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "/api/erp-oa-integration/approvals/submit",
            new { ApprovalType = approvalType, Data = data }
        );
        return await response.Content.ReadFromJsonAsync<Guid>();
    }
    
    /// <summary>
    /// 查询审批状态
    /// </summary>
    public async Task<ApprovalStatus> GetApprovalStatusAsync(Guid approvalId)
    {
        var response = await _httpClient.GetAsync(
            $"/api/erp-oa-integration/approvals/{approvalId}/status"
        );
        return await response.Content.ReadFromJsonAsync<ApprovalStatus>();
    }
}
```

---

## 🔌 3. 3种无缝集成方式

### 方式1：零侵入式集成（推荐）

```csharp
// Program.cs
builder.Host.UseErpOaIntegration(
    serviceUrl: "http://erp-api:5000",
    serviceName: "SmartAbp.MES",
    erpType: ErpType.Kingdee // 金蝶云星空
);

// ✅ 自动启用：
// - 订单自动同步
// - 审批流程集成
// - 财务数据对接
// - 组织架构同步
```

### 方式2：ABP Module集成（企业级）

```csharp
builder.Services.AddErpOaIntegrationClient(options =>
{
    options.ServiceUrl = "http://erp-api:5000";
    options.ErpType = ErpType.Kingdee;
    options.ErpApiUrl = "https://api.kingdee.com";
    options.AppId = "your-app-id";
    options.AppSecret = "your-app-secret";
    
    // 同步配置
    options.EnableOrderSync = true;
    options.EnableOrgSync = true;
    options.OrderSyncInterval = TimeSpan.FromMinutes(5);
    options.OrgSyncInterval = TimeSpan.FromHours(1);
});

app.UseErpOaIntegration();
```

### 方式3：手动同步

```csharp
// 手动提交审批
public class PurchaseAppService : ApplicationService
{
    private readonly ErpOaIntegrationClient _client;
    
    public async Task<Guid> CreatePurchaseOrderWithApprovalAsync(CreatePurchaseOrderInput input)
    {
        // 创建采购订单
        var order = await CreateOrderAsync(input);
        
        // 提交审批
        var approvalId = await _client.SubmitApprovalAsync(
            ApprovalType.Financial,
            order
        );
        
        return approvalId;
    }
}
```

---

## 📊 4. 核心特性

```yaml
ERP支持:
  ✅ 金蝶云星空: K/3 Cloud、金蝶EAS
  ✅ 用友: U8、NC、YonSuite
  ✅ SAP: SAP ERP、SAP S/4HANA
  ✅ Oracle EBS: Oracle E-Business Suite

OA支持:
  ✅ 钉钉: 审批、考勤、通讯录
  ✅ 企业微信: 通讯录、审批、消息
  ✅ 飞书: 审批、通讯录、日历

数据同步:
  ✅ 订单同步: 双向实时同步
  ✅ 客户同步: 自动增量同步
  ✅ 产品同步: 主数据同步
  ✅ 库存同步: 实时库存同步

审批流程:
  ✅ 财务审批: 采购、报销
  ✅ 订单审批: 销售订单、采购订单
  ✅ 自定义审批: 支持自定义流程
  ✅ 审批状态: 实时同步审批状态
```

---

**文档状态**：✅ 无缝集成方案完成


