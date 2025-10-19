# SystemIntegration微服务详细设计文档 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 微服务名称 | SystemIntegration.Service |
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 技术栈 | .NET 8 + YARP + Dapr + Kafka + Polly |

---

## 🎯 1. 系统概述

### 1.1 业务定位

系统集成微服务是SmartABP平台对接第三方异构系统的统一网关，提供：
- 🔌 **协议适配**：HTTP/SOAP/WebService/gRPC统一转换
- 🔄 **数据转换**：JSON/XML/CSV等格式互转
- 🔐 **认证代理**：统一认证和Token管理
- 📨 **异步解耦**：Kafka消息队列异步处理
- 🛡️ **容错保护**：熔断、重试、降级机制

### 1.2 核心价值

```yaml
业务价值:
  系统互通: 连接ERP/CRM/WMS/TMS等异构系统
  数据同步: 实时双向数据同步
  业务协同: 跨系统业务流程协同
  降低成本: 减少定制开发成本

技术价值:
  统一接入: 标准化API网关
  高可用: 熔断降级保护
  高性能: 异步消息处理
  易扩展: 适配器模式插件化
```

---

## 🏗️ 2. 系统架构设计

### 2.1 分层架构

```
┌────────────────────────────────────────────────────────┐
│         第三方系统层（ERP/CRM/WMS/TMS等）                 │
├────────────────────────────────────────────────────────┤
│  用友ERP  │  金蝶云  │  SAP   │  Salesforce  │  自建系统 │
└────────┬───────────┬────────┬──────────┬───────────────┘
         │ (各种协议) │        │          │
         │           │        │          │
┌────────▼───────────▼────────▼──────────▼───────────────┐
│           适配器层（Protocol Adapters）                  │
├────────────────────────────────────────────────────────┤
│  HTTP     │  SOAP      │  WebService │  gRPC  │  REST  │
│  Adapter  │  Adapter   │  Adapter    │ Adapter│ Adapter│
└────────┬───────────┬────────┬──────────┬───────────────┘
         │           │        │          │
┌────────▼───────────▼────────▼──────────▼───────────────┐
│            API网关层（YARP Gateway）                     │
├────────────────────────────────────────────────────────┤
│  路由转发  │  认证授权  │  限流熔断  │  日志追踪         │
└────────┬───────────┬────────┬──────────┬───────────────┘
         │           │        │          │
┌────────▼───────────▼────────▼──────────▼───────────────┐
│      应用服务层（SystemIntegration.Application）         │
├────────────────────────────────────────────────────────┤
│  消息路由  │  数据转换  │  Token管理  │  错误重试        │
└────────┬───────────┬────────┬──────────┬───────────────┘
         │           │        │          │
┌────────▼───────────▼────────▼──────────▼───────────────┐
│       消息队列层（Kafka + Dapr Pub/Sub）                 │
├────────────────────────────────────────────────────────┤
│  异步解耦  │  消息持久化  │  重试队列  │  死信队列       │
└────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

**YARP API网关**:
```json
{
  "ReverseProxy": {
    "Routes": {
      "erp-route": {
        "ClusterId": "erp-cluster",
        "Match": {
          "Path": "/api/erp/{**catch-all}"
        },
        "Transforms": [
          { "PathPattern": "/erp/{**catch-all}" }
        ]
      },
      "crm-route": {
        "ClusterId": "crm-cluster",
        "Match": {
          "Path": "/api/crm/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "erp-cluster": {
        "Destinations": {
          "destination1": { "Address": "http://erp.example.com" }
        }
      },
      "crm-cluster": {
        "Destinations": {
          "destination1": { "Address": "http://crm.example.com" }
        }
      }
    }
  }
}
```

**协议适配器接口**:
```csharp
public interface IProtocolAdapter
{
    string Name { get; }
    Task<AdapterResponse> ExecuteAsync(AdapterRequest request);
    bool CanHandle(string protocol);
}

public class HttpAdapter : IProtocolAdapter
{
    public string Name => "HTTP";
    
    public async Task<AdapterResponse> ExecuteAsync(AdapterRequest request)
    {
        using var client = _httpClientFactory.CreateClient();
        var response = await client.SendAsync(BuildHttpRequest(request));
        return await ParseHttpResponse(response);
    }
    
    public bool CanHandle(string protocol) => protocol.Equals("HTTP", StringComparison.OrdinalIgnoreCase);
}
```

**Dapr Bindings配置**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: third-party-http
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: "http://third-party-system.com/api"
```

---

## 💻 3. 核心功能实现

### 3.1 统一适配器管理

```csharp
public class AdapterManager : IAdapterManager, ISingletonDependency
{
    private readonly IEnumerable<IProtocolAdapter> _adapters;
    
    public AdapterManager(IEnumerable<IProtocolAdapter> adapters)
    {
        _adapters = adapters;
    }
    
    public async Task<AdapterResponse> ExecuteAsync(string protocol, AdapterRequest request)
    {
        var adapter = _adapters.FirstOrDefault(a => a.CanHandle(protocol));
        if (adapter == null)
        {
            throw new BusinessException($"不支持的协议: {protocol}");
        }
        
        return await adapter.ExecuteAsync(request);
    }
}
```

### 3.2 数据格式转换

```csharp
public class DataTransformService : IDataTransformService, ITransientDependency
{
    public async Task<string> TransformAsync(string data, string fromFormat, string toFormat)
    {
        return (fromFormat, toFormat) switch
        {
            ("JSON", "XML") => JsonToXml(data),
            ("XML", "JSON") => XmlToJson(data),
            ("CSV", "JSON") => CsvToJson(data),
            ("JSON", "CSV") => JsonToCsv(data),
            _ => data
        };
    }
    
    private string JsonToXml(string json)
    {
        var doc = JsonConvert.DeserializeXNode(json, "root");
        return doc?.ToString() ?? string.Empty;
    }
    
    private string XmlToJson(string xml)
    {
        var doc = XDocument.Parse(xml);
        return JsonConvert.SerializeXNode(doc);
    }
}
```

### 3.3 异步消息处理

```csharp
public class IntegrationMessageHandler : IIntegrationMessageHandler, ITransientDependency
{
    private readonly IDaprClient _daprClient;
    private readonly ILogger<IntegrationMessageHandler> _logger;
    
    [Topic("integration-pubsub", "third-party-request")]
    public async Task HandleRequestAsync(ThirdPartyRequest request)
    {
        try
        {
            // 1. 协议适配
            var adapter = _adapterManager.GetAdapter(request.Protocol);
            var response = await adapter.ExecuteAsync(new AdapterRequest
            {
                Url = request.Url,
                Method = request.Method,
                Headers = request.Headers,
                Body = request.Body
            });
            
            // 2. 数据转换
            var transformedData = await _transformService.TransformAsync(
                response.Body,
                response.Format,
                request.ExpectedFormat
            );
            
            // 3. 发布响应消息
            await _daprClient.PublishEventAsync("integration-pubsub", "third-party-response", new
            {
                RequestId = request.Id,
                Data = transformedData,
                Status = response.StatusCode
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "处理第三方请求失败: {RequestId}", request.Id);
            
            // 发送到死信队列
            await _daprClient.PublishEventAsync("integration-pubsub", "third-party-dlq", request);
        }
    }
}
```

### 3.4 容错保护（Polly）

```csharp
public class ResilientHttpClient : IResilientHttpClient, ISingletonDependency
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IAsyncPolicy<HttpResponseMessage> _retryPolicy;
    private readonly IAsyncPolicy<HttpResponseMessage> _circuitBreakerPolicy;
    
    public ResilientHttpClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
        
        // 重试策略：指数退避，最多3次
        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .WaitAndRetryAsync(3, retryAttempt => 
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
        
        // 熔断策略：10秒内失败5次则熔断30秒
        _circuitBreakerPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
    }
    
    public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request)
    {
        var client = _httpClientFactory.CreateClient();
        
        return await _retryPolicy.WrapAsync(_circuitBreakerPolicy)
            .ExecuteAsync(() => client.SendAsync(request));
    }
}
```

---

## 📊 4. 数据模型设计

### 4.1 领域实体

**集成配置实体**:
```csharp
public class IntegrationConfig : AuditedAggregateRoot<Guid>
{
    public string SystemName { get; set; }
    public string Protocol { get; set; } // HTTP/SOAP/WebService/gRPC
    public string BaseUrl { get; set; }
    public string AuthType { get; set; } // Basic/OAuth2/ApiKey
    public Dictionary<string, string> AuthConfig { get; set; }
    public Dictionary<string, string> Headers { get; set; }
    public int TimeoutSeconds { get; set; }
    public bool IsEnabled { get; set; }
}
```

**集成日志实体**:
```csharp
public class IntegrationLog : AuditedAggregateRoot<Guid>
{
    public string SystemName { get; set; }
    public string RequestUrl { get; set; }
    public string RequestMethod { get; set; }
    public string RequestHeaders { get; set; }
    public string RequestBody { get; set; }
    public string ResponseStatus { get; set; }
    public string ResponseHeaders { get; set; }
    public string ResponseBody { get; set; }
    public int DurationMs { get; set; }
    public DateTime RequestTime { get; set; }
    public DateTime ResponseTime { get; set; }
    public bool IsSuccess { get; set; }
    public string ErrorMessage { get; set; }
}
```

---

## 🚀 5. 性能优化

### 5.1 连接池管理

```csharp
services.AddHttpClient("ThirdPartyClient")
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(5),
        PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
        MaxConnectionsPerServer = 100
    });
```

### 5.2 缓存策略

```csharp
public class CachedIntegrationService : IIntegrationService, ITransientDependency
{
    private readonly IDistributedCache _cache;
    
    public async Task<T> GetWithCacheAsync<T>(string systemName, string endpoint)
    {
        var cacheKey = $"integration:{systemName}:{endpoint}";
        
        // 尝试从缓存获取
        var cached = await _cache.GetAsync<T>(cacheKey);
        if (cached != null)
        {
            return cached;
        }
        
        // 调用第三方系统
        var data = await CallThirdPartyAsync<T>(systemName, endpoint);
        
        // 缓存5分钟
        await _cache.SetAsync(cacheKey, data, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        });
        
        return data;
    }
}
```

---

## 🔒 6. 安全设计

### 6.1 Token管理

```csharp
public class TokenManager : ITokenManager, ISingletonDependency
{
    private readonly IDistributedCache _cache;
    
    public async Task<string> GetTokenAsync(string systemName)
    {
        var cacheKey = $"token:{systemName}";
        
        // 从缓存获取Token
        var token = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(token))
        {
            return token;
        }
        
        // 重新获取Token
        var config = await GetIntegrationConfigAsync(systemName);
        token = await RefreshTokenAsync(config);
        
        // 缓存Token（提前5分钟过期）
        await _cache.SetStringAsync(cacheKey, token, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(config.TokenExpirationMinutes - 5)
        });
        
        return token;
    }
}
```

### 6.2 数据加密

```csharp
public class DataEncryptionService : IDataEncryptionService, ITransientDependency
{
    public string Encrypt(string plainText)
    {
        // AES-256加密
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;
        
        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
        
        return Convert.ToBase64String(cipherBytes);
    }
}
```

---

## 📈 7. 监控告警

### 7.1 关键指标

```yaml
请求指标:
  - 请求成功率
  - 请求响应时间（P50/P95/P99）
  - 请求吞吐量（QPS）
  - 超时率
  
错误指标:
  - 错误率（按错误类型分类）
  - 熔断次数
  - 重试次数
  - 死信队列消息数
  
性能指标:
  - 连接池使用率
  - 缓存命中率
  - 队列堆积数
```

### 7.2 告警规则

```yaml
告警级别1（Critical）:
  - 请求成功率 < 95%
  - 熔断器打开
  - 死信队列堆积 > 1000
  
告警级别2（Warning）:
  - 请求响应时间P95 > 2s
  - 缓存命中率 < 80%
  - 队列堆积 > 5000
```

---

## ✅ 8. 验收标准

```yaml
功能验收:
  ✅ HTTP/SOAP/WebService/gRPC协议适配正常
  ✅ JSON/XML/CSV数据格式转换正常
  ✅ 异步消息处理正常
  ✅ 熔断降级机制正常
  
性能验收:
  ✅ API调用响应时间 <200ms
  ✅ 吞吐量 ≥5,000 QPS
  ✅ 系统可用性 ≥99.95%
  ✅ 缓存命中率 ≥85%
  
质量验收:
  ✅ 代码质量 ≥95分
  ✅ 单元测试覆盖率 ≥80%
  ✅ 文档完整性 100%
```

---

**文档状态**：✅ 已完成
**关联文档**：00-企业级微服务总体架构设计说明书.md

